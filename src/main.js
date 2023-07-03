import * as d3 from 'd3';

import { maybeConvertDataframe } from './input_util';
import { buildColumnInfo, Column } from './columns';
import { assignPalettes } from './palettes';


const DEFAULT_OPTIONS = {
    rowHeight: 24,
    padding: 5,
    geomPadding: 1.5,
    columnRotate: 30,
    midpoint: 0.8,
    legendFontSize: 12,
    legendTicks: [0, 0.2, 0.4, 0.6, 0.8, 1],
    labelGroupsAbc: false,
    colorByRank: false,
    minGeomSize: 0.25,
    theme: {
        oddRowBackground: 'white',
        evenRowBackground: '#eee',
        textColor: 'black',
        strokeColor: '#555',
        headerColor: 'white',
        hoverColor: '#1385cb'
    }
};

const GEOMS = {
    text: (value, _, __, O) => {
        const el = d3.create('svg:text')
            .attr('dominant-baseline', 'middle')
            .attr('y', O.rowHeight / 2)
            .style('fill', O.theme.textColor)
            .text(value);
        if (O.fontSize) {
            el.attr('font-size', O.fontSize);
        }
        return el;
    },

    bar: (value, colorValue, column, O) => {
        const fill = column.palette(colorValue);
        value = column.scale(value);
        let width = value * column.width * O.geomSize;
        if (width === 0) {
            width = O.minGeomSize;
        }
        return d3.create('svg:rect')
            .classed('fh-geom', true)
            .attr('x', O.geomPadding)
            .attr('y', O.geomPadding)
            .attr('width', width.toFixed(2))
            .attr('height', O.geomSize)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill);
    },

    circle: (value, colorValue, column, O) => {
        const fill = column.palette(colorValue);
        value = column.scale(value);
        let radius = value * O.geomSize / 2;
        if (radius === 0) {
            radius = O.minGeomSize;
        }
        return d3.create('svg:circle')
            .classed('fh-geom', true)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('cx', O.rowHeight / 2)
            .attr('cy', O.rowHeight / 2)
            .attr('r', radius.toFixed(2));
    },

    rect: (value, colorValue, column, O) => {
        const fill = column.palette(colorValue);
        value = column.scale(value);
        return d3.create('svg:rect')
            .classed('fh-geom', true)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('x', O.geomPadding)
            .attr('y', O.geomPadding)
            .attr('width', O.geomSize)
            .attr('height', O.geomSize);
    },

    funkyrect: (value, colorValue, column, O) => {
        let scaled = column.scale(value);
        const fill = column.palette(colorValue);
        if (scaled < O.midpoint) {
            // transform value to a 0.0 .. 0.5 range
            value = column.scale.copy()
                .range([0, 0.5])
                .domain([column.min, column.min + column.range * O.midpoint])(value);
            let radius = (value * 0.9 + 0.1) * O.geomSize - O.geomPadding; // 0.5 for stroke
            if (radius <= 0) {
                radius = O.minGeomSize;
            }
            return d3.create('svg:circle')
                .classed('fh-geom', true)
                .style('stroke', O.theme.strokeColor)
                .style('stroke-width', 1)
                .style('fill', fill)
                .attr('cx', O.rowHeight / 2)
                .attr('cy', O.rowHeight / 2)
                .attr('r', radius.toFixed(2));
        }
        // transform value to a 0.5 .. 1.0 range
        value = column.scale
            .copy()
            .range([0.5, 1])
            .domain([column.min + column.range * O.midpoint, column.max])(value);
        const cornerSize = (0.9 - 0.8 * value) * O.geomSize;
        return d3.create('svg:rect')
            .classed('fh-geom', true)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('x', O.geomPadding)
            .attr('y', O.geomPadding)
            .attr('width', O.geomSize)
            .attr('height', O.geomSize)
            .attr('rx', cornerSize.toFixed(2))
            .attr('ry', cornerSize.toFixed(2));
    },

    pie: (value, colorValue, column, O) => {
        let nonZero = 0;
        let nonZeroIdx = 0;
        value.forEach((x, i) => {
            if (x > 0) {
                nonZero += 1;
                nonZeroIdx = i;
            }
        });
        if (nonZero === 1) {
            const fill = column.palette(nonZeroIdx);
            return d3.create('svg:circle')
                .classed('fh-geom', true)
                .style('stroke', O.theme.strokeColor)
                .style('stroke-width', 1)
                .style('fill', fill)
                .attr('cx', O.rowHeight / 2)
                .attr('cy', O.rowHeight / 2)
                .attr('r', O.geomSize / 2);
        }

        const arcs = d3.pie().sortValues(null)(value);
        const g = d3.create('svg:g');
        g.selectAll('arcs')
            .data(arcs)
            .enter()
            .append('path')
                .attr('d', d3.arc().innerRadius(0).outerRadius(O.geomSize / 2))
                .attr('fill', (_, i) => {
                    return column.palette(i);
                })
                .style('stroke', O.theme.strokeColor)
                .style('stroke-width', 1)
                .attr('transform', `translate(${O.rowHeight / 2}, ${O.rowHeight / 2})`);
        return g;
    }
};

class FHeatmap {
    constructor(data, columnInfo, columnGroups, rowInfo, rowGroups, palettes, options, svg) {
        this.data = data;
        this.columnInfo = columnInfo;
        this.columnGroups = d3.index(columnGroups, group => group.group);
        this.rowInfo = rowInfo;
        this.rowGroups = d3.index(rowGroups, group => group.group);
        this.palettes = palettes;
        this.options = _.merge(DEFAULT_OPTIONS, options);
        this.renderGroups = false;
        this.calculateOptions();
        this.svg = svg;
    }

    calculateOptions() {
        this.options.geomSize = this.options.rowHeight - 2 * this.options.geomPadding;
        const group = this.rowInfo[0].group
        const groupInfo = this.rowGroups.get(group);
        if (group !== undefined && groupInfo !== undefined && groupInfo.Group !== undefined) {
            this.renderGroups = true;
        }
    }

    stripedRows() {
        const O = this.options;
        let rowGroup, nGroups = 0;
        this.data.forEach((_, i) => {
            if (this.renderGroups && this.rowInfo[i].group !== rowGroup) {
                nGroups += 1;
            }
            rowGroup = this.rowInfo[i].group;
            this.body.append('rect')
                .classed('row', true)
                .attr('height', O.rowHeight)
                .attr('x', 0)
                .attr('y', (i + nGroups) * O.rowHeight)
                .attr('fill', i % 2 === 0 ? O.theme.evenRowBackground : O.theme.oddRowBackground);
        });
    }

    renderColumns() {
        const O = this.options;
        let offset = 0;
        O.bodyHeight = this.data.length * O.rowHeight;
        if (this.renderGroups) {
            O.bodyHeight += this.rowGroups.size * O.rowHeight;
        }
        let group;

        this.columnInfo.forEach((column, i) => {
            let maxWidth = 0;
            let padding = 0;
            let firstColumn = i === 0;
            if (column.geom === 'text' || column.geom === 'bar') {
                padding = O.padding;
            }
            offset += padding;
            if (group && column.group && group !== column.group) {
                offset += 2 * O.padding;
            }
            let rankedData;
            if (O.colorByRank && column.numeric) {
                rankedData = d3.rank(this.data, item => +item[column.id]);
            }
            let rowGroup, nGroups = 0;
            this.data.forEach((item, j) => {
                let width = 0;
                if (this.renderGroups && this.rowInfo[j].group !== rowGroup) {
                    nGroups += 1;
                }
                if (this.renderGroups && firstColumn && this.rowInfo[j].group !== rowGroup) {
                    let groupName = GEOMS.text(
                        this.rowGroups.get(this.rowInfo[j].group).Group,
                        null,
                        column,
                        O
                    );
                    groupName
                        .attr('transform', `translate(${offset - padding}, ${(j + nGroups - 1) * O.rowHeight})`)
                        .attr('font-weight', 'bold')
                        .attr('dominant-baseline', 'hanging');
                    this.body.append(() => groupName.node());
                    width = groupName.node().getBBox().width;
                }
                rowGroup = this.rowInfo[j].group;
                let value = item[column.id];
                let colorValue = value;
                if (column.numeric) {
                    value = +value;
                }
                if (O.colorByRank && column.numeric) {
                    colorValue = rankedData[j];
                }
                if (GEOMS[column.geom] === undefined) {
                    throw `Geom ${column.geom} not implements. Use one of ${Object.keys(GEOMS).join(', ')}.`;
                }
                let el = GEOMS[column.geom](value, colorValue, column, O);
                el.attr('transform', `translate(${offset}, ${(j + nGroups) * O.rowHeight})`);
                if (column.numeric) {
                    let tooltip = (+value).toFixed(4);
                    tooltip = tooltip.replace(/\.?0+$/, '');
                    el.datum({tooltip: tooltip});
                }
                this.body.append(() => el.node());
                const elWidth = el.node().getBBox().width
                if (elWidth > width) {
                    width = elWidth;
                }
                if (width > maxWidth) {
                    maxWidth = width;
                }
            });
            if (column.geom === 'bar') {
                maxWidth = O.geomSize * column.width + O.geomPadding;
                this.body.append('line')
                    .attr('x1', offset + maxWidth)
                    .attr('x2', offset + maxWidth)
                    .attr('y1', this.renderGroups ? O.rowHeight : 0)
                    .attr('y2', O.bodyHeight)
                    .attr('stroke', O.theme.strokeColor)
                    .attr('stroke-dasharray', '5 5')
                    .attr('opacity', 0.5);
            }
            column.widthPx = Math.max(maxWidth, O.rowHeight);
            column.widthPx = Math.round(column.widthPx);
            column.offset = offset;
            offset += column.widthPx + padding;
            group = column.group;
        });
        O.bodyWidth = offset + O.padding;
    }

    renderHeader() {
        const O = this.options;
        let headerHeight = 0;
        let bodyWidth = 0;
        let nonZeroRotate = false;
        const groups = this.header.append('g');
        const labels = this.header.append('g')
            .attr('transform', `translate(0, ${O.rowHeight + O.padding})`);

        const columnGroups = d3.group(this.columnInfo, column => column.group);
        let abcCounter = 0;
        columnGroups.forEach((group, groupName) => {
            if (!groupName) {
                return;
            }
            const groupInfo = this.columnGroups.get(groupName);
            if (!groupInfo.level1 || !groupInfo.palette) {
                return;
            }

            const column = new Column({
                id: '_group',
                palette: groupInfo.palette
            }, 1);
            column.maybeCalculateStats(null, false);
            assignPalettes([column], this.palettes);
            const lastCol = group[group.length - 1];
            const groupStart = group[0].offset;
            const groupEnd = lastCol.offset + lastCol.widthPx + O.geomPadding;
            const fill = column.palette(0.5);
            groups.append('rect')
                .attr('x', groupStart)
                .attr('y', 0)
                .attr('width', groupEnd - groupStart)
                .attr('height', O.rowHeight)
                .attr('fill', fill)
                .attr('opacity', 0.25);
            const text = groups.append('text')
                .attr('x', groupStart + (groupEnd - groupStart) / 2)
                .attr('y', O.rowHeight / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', O.theme.headerColor)
                .text(groupInfo.level1);
            if (O.fontSize) {
                text.attr('font-size', O.fontSize);
            }
            if (O.labelGroupsAbc) {
                const letter = String.fromCharCode("a".charCodeAt(0) + abcCounter);
                const text = groups.append('text')
                    .attr('x', groupStart + O.padding)
                    .attr('y', O.rowHeight / 2)
                    .attr('dominant-baseline', 'central')
                    .attr('fill', O.theme.headerColor)
                    .text(`${letter})`);
                if (O.fontSize) {
                    text.attr('font-size', O.fontSize);
                }
            }
            abcCounter += 1;
        });

        this.columnInfo.forEach((column, i) => {
            const el = labels.append('g')
                .attr('transform', `rotate(${-O.columnRotate})`)
                .classed(`column-${i}`, true);
            el.append('text')
                .attr('x', 0)
                .attr('y', 0)
                .attr('font-size', O.fontSize)
                .style('fill', O.theme.textColor)
                .style('cursor', 'pointer')
                .datum(column)
                .on('click', this.onColumnClick.bind(this))
                .on('mouseenter', () => {
                    el.style('text-decoration', 'underline dashed')
                        .style('fill', O.theme.hoverColor)
                })
                .on('mouseleave', () => {
                    el.style('text-decoration', '').style('fill', O.theme.textColor)
                })
                .text(column.name);
            const nativeWidth = el.node().getBBox().width;
            if (!nonZeroRotate && nativeWidth < column.widthPx - 2 * O.padding) {
                column.rotate = false;
            } else {
                column.rotate = true;
                nonZeroRotate = true;
            }
            const { width, height } = el.node().getBoundingClientRect();
            if (height > headerHeight) {
                headerHeight = height;
            }
            if (column.offset + width > bodyWidth) {
                bodyWidth = column.offset + width + O.padding;
            }
        });
        this.columnInfo.forEach((column, i) => {
            let center = column.offset + column.widthPx / 2;
            let rotate = column.rotate ? -O.columnRotate : 0;
            this.header.select(`.column-${i}`)
                .attr(
                    'transform',
                    `translate(${center}, ${headerHeight - 2 * O.padding}) rotate(${rotate})`
                );
            if (!column.rotate) {
                labels.select(`.column-${i} text`)
                    .attr('text-anchor', 'middle');
            } else {
                labels.append('line')
                    .attr('x1', center)
                    .attr('x2', center)
                    .attr('y1', headerHeight - 2)
                    .attr('y2', headerHeight - 2 - O.padding)
                    .attr('stroke', O.theme.strokeColor);
            }
        });
        this.options.width = bodyWidth;
        this.options.headerHeight = headerHeight + O.rowHeight + O.padding;
    }

    renderLegend() {
        const O = this.options;
        let footerHeight = 0;
        const legend = this.footer.append('g');
        let offset = 0;
        if (d3.some(this.columnInfo, column => column.geom === "funkyrect")) {
            // Locate first funkyrect column for legend position
            for (let column of this.columnInfo) {
                if (column.geom === "funkyrect") {
                    offset = column.offset;
                    break;
                }
            }
            legend.append('text')
                .attr('x', offset + O.geomSize / 2)
                .attr('y', O.rowHeight + O.padding)
                .attr('font-size', O.legendFontSize)
                .style('fill', O.theme.textColor)
                .text('Score:');

            const column = new Column({
                id: '_legend',
                palette: 'Greys'
            }, 1);
            column.maybeCalculateStats(null, false);
            assignPalettes([column]);
            const range = [...d3.range(0, 1, 0.1), 1];
            for (let i of range) {
                let el = GEOMS.funkyrect(i, i, column, O);
                legend.append(() => el.node());
                const { width, height } = el.node().getBBox();
                el.attr(
                    'transform',
                    `translate(${offset}, ${1.5 * O.rowHeight - height / 2})`
                );
                if (O.colorByRank) {
                    el.style('fill', O.theme.oddRowBackground);
                }
                let tick = parseFloat(i.toFixed(3));
                if (O.legendTicks.indexOf(tick) > -1) {
                    tick = tick.toFixed(1);
                    if (tick === '0.0') {
                        tick = '0';
                    }
                    if (tick === '1.0') {
                        tick = '1';
                    }
                    legend.append('text')
                        .attr('x', offset + O.geomSize / 2 + O.geomPadding)
                        .attr('y', 2.5 * O.rowHeight + O.padding)
                        .attr('font-size', O.legendFontSize)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'text-top')
                        .style('fill', O.theme.textColor)
                        .text(tick);
                }
                offset += width + 4 * O.geomPadding;
            }
        }
        if (d3.some(this.columnInfo, column => column.geom === 'pie')) {
            const rendered = [];
            this.columnInfo.forEach(column => {
                if (column.geom != 'pie' || column.palette.colorNames === undefined) {
                    return;
                }
                const key = JSON.stringify({
                    colors: column.palette.colors,
                    colorNames: column.palette.colorNames
                });
                if (rendered.indexOf(key) > -1) {
                    return;
                }
                rendered.push(key);

                if (offset < column.offset) {
                    offset = column.offset;
                }

                const arcs = d3.pie().endAngle(Math.PI)(Array(column.palette.colorNames.length).fill(1));
                const g = legend.append('g');
                g.attr('transform', `translate(${offset}, ${1.5 * O.rowHeight + O.geomPadding})`);
                g.selectAll('arcs')
                    .data(arcs)
                    .enter()
                    .append('path')
                        .attr('d', d3.arc().innerRadius(0).outerRadius(O.geomSize / 2))
                        .attr('fill', (_, i) => {
                            return column.palette(i);
                        })
                        .style('stroke', O.theme.strokeColor)
                        .style('stroke-width', 1)
                        .attr('transform', `translate(${O.geomSize / 2 + O.geomPadding - 0.5}, 0)`);

                g.selectAll('text')
                    .data(arcs)
                    .enter()
                    .append('text')
                    .text((_, i) => column.palette.colorNames[i])
                    .attr('font-size', O.legendFontSize)
                    .attr('dominant-baseline', 'central')
                    .attr('transform', d => {
                        const p = d3.arc().innerRadius(O.geomSize / 2).outerRadius(O.geomSize).centroid(d);
                        p[0] += O.geomSize / 2 + 4 * O.geomPadding;
                        return `translate(${p})`;
                    });

                g.selectAll('lines')
                    .data(arcs)
                    .enter()
                    .append('path')
                        .attr('d', d => {
                            const p1 = d3.arc().innerRadius(O.geomSize / 2).outerRadius(O.geomSize / 2 + 5).centroid(d);
                            const p2 = d3.arc().innerRadius(O.geomSize / 2).outerRadius(O.geomSize - 5).centroid(d);
                            p1[0] += O.geomSize / 2 + O.geomPadding;
                            p2[0] += O.geomSize / 2 + 3 * O.geomPadding;
                            return d3.line()([p1, p2]);
                        })
                        .style('stroke', O.theme.strokeColor)
                        .style('stroke-width', 0.5);

                offset += O.geomSize / 2 + g.node().getBoundingClientRect().width + 4 * O.geomPadding;
            });
        }
        const { height } = legend.node().getBBox();
        if (height > footerHeight) {
            footerHeight = height;
        }
        if (offset > O.width) {
            O.width = offset;
        }
        this.options.footerHeight = footerHeight + O.rowHeight;
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style("display", "none");
        }
    }

    showTooltip(mouse, text) {
        if (this.tooltip === undefined) {
            this.tooltip = d3.select("body")
                .append("div")
                    .style("z-index", 2000)
                    .style("position", "absolute")
                    .style("background-color", "#333")
                    .style("color", "white")
                    .style("border", "solid")
                    .style("border-width", "1px")
                    .style("border-radius", "5px")
                    .style("padding", "8px 5px")
                    .style("display", "none");
        }

        const offset = 10;
        this.tooltip
            .html(text)
            .style("top", mouse[1] + 2 * offset + "px")
            .style("left", mouse[0] + offset + "px")
            .style("display", "block");
    }

    onMouseMove(e) {
        if (e.target) {
            const el = e.target;
            const d = d3.select(el).datum();
            if (d && d.tooltip) {
                const mouse = d3.pointer(e, document.body);
                this.showTooltip(mouse, d.tooltip);
                return;
            }
        }
        this.hideTooltip();
    }

    onColumnClick(e) {
        // Order of rows is now by sort, no row groups
        this.renderGroups = false;

        const el = d3.select(e.target);
        const column = el.datum();
        const comparator = column.sort();
        this.data = d3.sort(this.data, (a, b) => {
            [a, b] = [a[column.id], b[column.id]];
            if (column.numeric) {
                [a, b] = [+a, +b];
            }
            return comparator(a, b);
        });
        this.svg.selectChildren().remove();
        this.render();

        this.indicateSort(column, el);
    }

    indicateSort(column, label) {
        const O = this.options;
        this.sortIndicator = this.header.append("text")
            .attr('font-size', 12)
            .attr('fill', O.theme.hoverColor);
        if (column.sortState === "asc") {
            this.sortIndicator.text('↑');
        } else {
            this.sortIndicator.text('↓');
        }
        this.sortIndicator
            .attr('text-anchor', 'right')
            .attr('dominant-baseline', 'text-bottom');
        let x = column.offset + column.widthPx / 2 - 2 * O.padding;
        let y = O.headerHeight - O.padding;
        if (!column.rotate) {
            const box = label.node().getBBox();
            x -= box.width / 2;
            y -= box.height / 2;
            this.sortIndicator.attr('dominant-baseline', 'central');
        }
        this.sortIndicator
            .attr('x', x)
            .attr('y', y);
    }

    render() {
        this.header = this.svg.append("g");
        this.body = this.svg.append("g");
        this.footer = this.svg.append("g");

        this.stripedRows();
        this.renderColumns();
        this.renderHeader();
        this.renderLegend();

        const O = this.options;
        this.svg.attr('width', O.width);
        this.svg.attr('height', O.bodyHeight + O.headerHeight + O.footerHeight);
        if (this.renderGroups) {
            this.header.attr('transform', `translate(0, ${O.rowHeight})`);
        }
        this.body.selectAll('.row').attr('width', O.bodyWidth);
        this.body.attr("transform", `translate(0, ${O.headerHeight})`);
        this.footer.attr('transform', `translate(0, ${O.headerHeight + O.bodyHeight})`);
        this.svg.attr('style', '');
        if (this.options.rootStyle) {
            this.svg.attr('style', this.options.rootStyle);
        }
    }

    listen() {
        this.svg.on("mousemove", this.onMouseMove.bind(this));
    }
};


/**
 *
 * @param {Object|Object[]} data - data to plot, usually d3-fetch output.
 *      It should be an Array of Objects, each object has the same properties.
 * @param {Object|Object[]} columnInfo - information about how the columns should be displayed
 * @param {Object|Object[]} columnGroups - information about how to group columns
 * @param {Object} palettes - mapping of names to palette colors
 * @param {int} expand -
 * @param {int} colAnnotOffset -
 * @param {boolean} addAbc - deprecated, moved to options.labelGroupsAbc
 * @param {boolean} scaleColumn - whether to apply min-max scaling to numerical
 *      columns. Defaults to true
 * @param {Object} options - options for the heatmap
 * @param {int} options.fontSize - font size for all text
 */
function funkyheatmap(
    data,
    columnInfo,
    columnGroups,
    rowInfo,
    rowGroups,
    palettes,
    expand,
    colAnnotOffset,
    addAbc,
    scaleColumn = true,
    options = {}
) {
    [data, columnInfo, columnGroups, rowInfo, rowGroups] = maybeConvertDataframe(
        data, columnInfo, columnGroups, rowInfo, rowGroups
    );
    const columns = columnInfo.map(column => column.id);
    columnInfo = buildColumnInfo(data, columns, columnInfo, scaleColumn, options.colorByRank);
    assignPalettes(columnInfo, palettes);

    // TODO: figure out what to do https://github.com/funkyheatmap/funkyheatmap-js/issues/6
    columnInfo = d3.filter(columnInfo, info => !info.overlay);

    const svg = d3.select('body')
        .append('svg')
            .classed('funkyheatmap', true)
            .style('visibility', 'hidden')
            .style('position', 'absolute')
            .style('left', '-2000px');
    const heatmap = new FHeatmap(
        data,
        columnInfo,
        columnGroups,
        rowInfo,
        rowGroups,
        palettes,
        options,
        svg
    );
    heatmap.render();
    heatmap.listen();
    heatmap.svg.remove();

    return heatmap.svg.node();
}

export default funkyheatmap;

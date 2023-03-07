import * as d3 from 'd3';

import { maybeConvertDataframe } from './input_util';
import { buildColumnInfo, Column } from './columns';
import { assignPalettes } from './palettes';


const DEFAULT_OPTIONS = {
    rowHeight: 24,
    rowAlternatingBackground: '#eee',
    padding: 5,
    geomPadding: 1.5,
    geomStroke: '#555',
    columnRotate: 30,
    midpoint: 0.8,
    legendFontSize: 12,
    legendTicks: [0, 0.2, 0.4, 0.6, 0.8, 1],
    scaleColumn: true
};

const GEOMS = {
    text: (value, _, O) => {
        const el = d3.create('svg:text')
            .attr('dominant-baseline', 'middle')
            .attr('y', O.rowHeight / 2)
            .text(value);
        if (O.fontSize) {
            el.attr('font-size', O.fontSize);
        }
        return el;
    },

    bar: (value, column, O) => {
        const fill = column.palette(value);
        value = column.scale(value);
        const width = value * column.width * O.geomSize;
        return d3.create('svg:rect')
            .attr('x', O.geomPadding)
            .attr('y', O.geomPadding)
            .attr('width', width)
            .attr('height', O.geomSize)
            .style('stroke', O.geomStroke)
            .style('stroke-width', 1)
            .style('fill', fill);
    },

    circle: (value, column, O) => {
        const fill = column.palette(value);
        value = column.scale(value);
        return d3.create('svg:circle')
            .style('stroke', O.geomStroke)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('cx', O.rowHeight / 2)
            .attr('cy', O.rowHeight / 2)
            .attr('r', value * O.geomSize / 2);
    },

    funkyrect: (value, column, O) => {
        let scaled = column.scale(value);
        const fill = column.palette(value);
        if (scaled < O.midpoint) {
            // transform value to a 0.0 .. 0.5 range
            value = column.scale.copy()
                .range([0, 0.5])
                .domain([column.min, column.min + column.range * O.midpoint])(value);
            const radius = (value * 0.9 + 0.12) * O.geomSize - O.geomPadding; // 0.5 for stroke
            return d3.create('svg:circle')
                .style('stroke', O.geomStroke)
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
            .style('stroke', O.geomStroke)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('x', O.geomPadding)
            .attr('y', O.geomPadding)
            .attr('width', O.geomSize)
            .attr('height', O.geomSize)
            .attr('rx', cornerSize.toFixed(2))
            .attr('ry', cornerSize.toFixed(2));
    },
};

class FHeatmap {
    constructor(data, columnInfo, columnGroups, palettes, options, svg) {
        this.data = data;
        this.columnInfo = columnInfo;
        this.columnGroups = d3.index(columnGroups, group => group.group);
        this.palettes = palettes;
        this.options = {...DEFAULT_OPTIONS, ...options};
        this.calculateOptions();
        this.svg = svg;
    }

    calculateOptions() {
        this.options.geomSize = this.options.rowHeight - 2 * this.options.geomPadding;
    }

    stripedRows() {
        const O = this.options;
        this.data.forEach((_, i) => {
            this.body.append('rect')
                .classed('row', true)
                .attr('height', O.rowHeight)
                .attr('x', 0)
                .attr('y', i * O.rowHeight)
                .attr('fill', i % 2 === 0 ? O.rowAlternatingBackground : 'white');
        });
    }

    renderColumns() {
        const O = this.options;
        let offset = 0;
        O.bodyHeight = this.data.length * O.rowHeight;
        let group;

        this.columnInfo.forEach(column => {
            let maxWidth = 0;
            let padding = 0;
            if (column.geom === "text" || column.geom === 'bar') {
                padding = O.padding;
            }
            offset += padding;
            if (group && column.group && group !== column.group) {
                offset += 2 * O.padding;
            }
            this.data.forEach((item, j) => {
                let value = item[column.id];
                if (column.numeric) {
                    value = +value;
                }
                let el = GEOMS[column.geom](value, column, O);
                el.attr('transform', `translate(${offset}, ${j * O.rowHeight})`);
                if (column.numeric) {
                    let tooltip = column.scale(+value).toFixed(4);
                    tooltip = tooltip.replace(/\.?0+$/, '');
                    if (O.scaleColumn) {
                        tooltip += " (scaled)";
                    }
                    el.datum({tooltip: tooltip});
                }
                this.body.append(() => el.node());
                const width = el.node().getBBox().width;
                if (width > maxWidth) {
                    maxWidth = width;
                }
            });
            if (column.geom === 'bar') {
                maxWidth = O.geomSize * column.width + O.geomPadding;
                this.body.append('line')
                    .attr('x1', offset + maxWidth)
                    .attr('x2', offset + maxWidth)
                    .attr('y1', 0)
                    .attr('y2', O.bodyHeight)
                    .attr('stroke', O.geomStroke)
                    .attr('stroke-dasharray', '5 5')
                    .attr('opacity', 0.5);
            }
            column.width = Math.max(maxWidth, O.rowHeight);
            column.offset = offset;
            offset += column.width + padding;
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
            if (!groupInfo.name || !groupInfo.palette) {
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
            const groupEnd = lastCol.offset + lastCol.width;
            const fill = column.palette(0.5);
            groups.append('rect')
                .attr('x', groupStart)
                .attr('y', 0)
                .attr('width', groupEnd - groupStart)
                .attr('height', O.rowHeight)
                .attr('fill', fill);
            const text = groups.append('text')
                .attr('x', groupStart + (groupEnd - groupStart) / 2)
                .attr('y', O.rowHeight / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', 'white')
                .text(groupInfo.name);
            if (O.fontSize) {
                text.attr('font-size', O.fontSize);
            }
            if (O.labelGroupsAbc) {
                const letter = String.fromCharCode("a".charCodeAt(0) + abcCounter);
                const text = groups.append('text')
                    .attr('x', groupStart + O.padding)
                    .attr('y', O.rowHeight / 2)
                    .attr('dominant-baseline', 'central')
                    .attr('fill', 'white')
                    .text(`${letter})`);
                if (O.fontSize) {
                    text.attr('font-size', O.fontSize);
                }
            }
            abcCounter += 1;
        });

        this.columnInfo.forEach(column => {
            const el = labels.append("g")
                .attr("transform", `rotate(${-O.columnRotate})`)
                .classed(`column-${column.id}`, true);
            el.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr('font-size', O.fontSize)
                .text(column.name);
            const nativeWidth = el.node().getBBox().width;
            if (!nonZeroRotate && nativeWidth < column.width + 2 * O.padding) {
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
                bodyWidth = column.offset + width;
            }
        });
        this.columnInfo.forEach(column => {
            let center = column.offset + column.width / 2;
            let rotate = column.rotate ? -O.columnRotate : 0;
            this.header.select(`.column-${column.id}`)
                .attr(
                    'transform',
                    `translate(${center}, ${headerHeight - 2 * O.padding}) rotate(${rotate})`
                );
            if (rotate === 0) {
                labels.select(`.column-${column.id} text`)
                    .attr('text-anchor', 'middle');
            } else {
                labels.append('line')
                    .attr('x1', center)
                    .attr('x2', center)
                    .attr('y1', headerHeight - 2)
                    .attr('y2', headerHeight - 2 - O.padding)
                    .attr('stroke', O.geomStroke);
            }
        });
        this.options.width = bodyWidth;
        this.options.headerHeight = headerHeight + O.rowHeight + O.padding;
    }

    renderLegend() {
        const O = this.options;
        let footerHeight = 0;
        if (d3.some(this.columnInfo, column => column.geom === "funkyrect")) {
            const legend = this.footer.append('g');
            // Locate first funkyrect column for legend position
            let offset = 0;
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
                .text('Score:');

            const column = new Column({
                id: '_legend',
                palette: 'Greys'
            }, 1);
            column.maybeCalculateStats(null, false);
            assignPalettes([column]);
            const range = [...d3.range(0, 1, 0.1), 1];
            for (let i of range) {
                let el = GEOMS.funkyrect(i, column, O);
                legend.append(() => el.node());
                const { width, height } = el.node().getBBox();
                el.attr(
                    'transform',
                    `translate(${offset}, ${1.5 * O.rowHeight - height / 2})`
                );
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
                        .text(tick);
                }
                offset += width + 4 * O.geomPadding;
            }
            const { height } = legend.node().getBBox();
            if (height > footerHeight) {
                footerHeight = height;
            }
            if (offset > O.width) {
                O.width = offset;
            }
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
                    .style("padding", "10px")
                    .style("display", "none");
        }

        const offset = 10;
        this.tooltip
            .html(text)
            .style("top", mouse[1] + 2 * offset + "px")
            .style("left", mouse[0] + offset + "px")
            .style("display", "block");
    }

    mouseMove(e) {
        if (e.target) {
            const el = e.target;
            const d = d3.select(el).datum();
            if (d) {
                const mouse = d3.pointer(e, document.body);
                this.showTooltip(mouse, d.tooltip);
                return;
            }
        }
        this.hideTooltip();
    }

    render() {
        this.header = this.svg.append("g");
        this.body = this.svg.append("g");
        this.footer = this.svg.append("g");

        this.stripedRows();
        this.renderColumns();
        this.renderHeader();
        this.renderLegend();

        this.svg.on("mousemove", this.mouseMove.bind(this));

        const O = this.options;
        this.svg.attr('width', O.width);
        this.svg.attr('height', O.bodyHeight + O.headerHeight + O.footerHeight);
        this.body.selectAll('.row').attr('width', O.bodyWidth);
        this.body.attr("transform", `translate(0, ${O.headerHeight})`);
        this.footer.attr('transform', `translate(0, ${O.headerHeight + O.bodyHeight})`);
        if (this.options.rootStyle) {
            this.svg.attr('style', this.options.rootStyle);
        }
    }
};


/**
 *
 * @param {Object|Object[]} data - data to plot, usually d3-fetch output.
 *      It should be an Array of Objects, each object has the same properties.
 * @param {string[]} columns - columns of the data, in order.
 *      First column is the id column.
 * @param {Object|Object[]} columnInfo - information about how the columns should be displayed
 * @param {Object|Object[]} columnGroups - information about how to group columns
 * @param {Object} palettes - mapping of names to palette colors
 * @param {int} expand -
 * @param {int} colAnnotOffset -
 * @param {boolean} addAbc -
 * @param {boolean} scaleColumn - whether to apply min-max scaling to numerical
 *      columns. Defaults to true
 * @param {Object} options - options for the heatmap
 * @param {int} options.fontSize - font size for all text
 */
function funkyheatmap(
    data,
    columns,
    columnInfo,
    columnGroups,
    palettes,
    expand,
    colAnnotOffset,
    addAbc,
    scaleColumn = true,
    options
) {
    console.log(arguments);
    options.scaleColumn = scaleColumn;
    [data, columnInfo, columnGroups] = maybeConvertDataframe(data, columnInfo, columnGroups);
    columnInfo = buildColumnInfo(data, columns, columnInfo, scaleColumn);
    assignPalettes(columnInfo, palettes);
    // TODO: redo palettes or group palettes
    const heatmap = new FHeatmap(data, columnInfo, columnGroups, palettes, options, d3.create('svg'));

    // dimensions of text & shapes are not available before svg is in DOM
    // so we first return svg and then do the rest
    // ugly…
    setTimeout(() => heatmap.render(), 10);

    return heatmap.svg.node();
}

export default funkyheatmap;

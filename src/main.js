import * as d3 from 'd3';
import * as _ from 'lodash';

import { ensureRowData, rowToColData } from './input_util';
import { buildColumnInfo, buildColumnGroups, Column } from './columns';
import { assignPalettes } from './palettes';
import { prepareLegends } from './legends';
import { GEOMS } from './geoms';


/**
 * @typedef {Object} ColumnData
 * @description A dataframe in column-based format. Each property is a column, represented as an
 *   array. All columns are of the same length.
 * @example
 * {
 *   'model': ['Toyota Corolla', 'Fiat 128', 'Honda Civic'],
 *   'mpg': [33.9, 32.4, 30.4],
 *   'weight': [1.835, 2.2, 1.615]
 * }
 */

/**
 * @typedef {Object[]} RowData
 * @description A dataframe in row-based format. Each element is an object with properties. All
 *   objects have the same properties.
 * @example
 * [
 *   {model: 'Toyota Corolla', mpg: 33.9, weight: 1.835},
 *   {model: 'Fiat 128', mpg: 32.4, weight: 2.2},
 *   {model: 'Honda Civic', mpg: 30.4, weight: 1.615}
 * ]
 */

/**
 * @typedef {Object} HeatmapOptions
 * @property {boolean} [colorByRank=false] - whether to color elements by rank, default for all
 *   numeric columns
 * @property {number} [legendFontSize=12] - font size for legend labels
 * @property {boolean} [labelGroupsAbc=false] - whether to add alphabetical index to column groups
 *   labels
 * @property {number} [tooltipPrecision=4] - number of decimal places for floats in the tooltip
 * @property {Object} [theme] - theme options
 * @property {string} [theme.oddRowBackground='white'] - background color for odd rows
 * @property {string} [theme.evenRowBackground='#eee'] - background color for even rows
 * @property {string} [theme.textColor='black'] - color for text
 * @property {string} [theme.strokeColor='#555'] - edge color for geoms and guides
 * @property {string} [theme.headerColor='black'] - color for header text
 * @property {string} [theme.hoverColor='#1385cb'] - color for hovered text
 */
const DEFAULT_OPTIONS = {
    legendFontSize: 12,
    legendTicks: [0, 0.2, 0.4, 0.6, 0.8, 1],
    labelGroupsAbc: false,
    colorByRank: false,
    tooltipPrecision: 4,
    theme: {
        oddRowBackground: 'white',
        evenRowBackground: '#eee',
        textColor: 'black',
        strokeColor: '#555',
        headerColor: 'black',
        hoverColor: '#1385cb'
    }
};

/**
 * @typedef {Object} PositionOptions
 * @property {number} [rowHeight=24] - height of a heatmap row, in pixels
 * @property {number} [rowSpace=0.1] - space between rows, as a fraction of rowHeight. Twice the
 *   padding
 * @property {number} [rowBigspace=1] - space between groups of rows, as a fraction of rowHeight
 * @property {number} [colWidth=24] - width of a heatmap column, in pixels. Deprecated, has no
 *   effect
 * @property {number} [colSpace=0.1] - space between columns, as a fraction of rowHeight. Twice the
 *   padding
 * @property {number} [colBigspace=1] - space between groups of columns, as a fraction of rowHeight
 * @property {number} [colAnnotOffset=10] - offset of column groups from column labels, in pixels
 * @property {number} [colAnnotAngle=30] - angle of column labels, in degrees
 * @property {number} [padding=5] - padding for various uses
 * @property {number} [minGeomSize=0.25] - minimum size of a heatmap element, in pixels
 * @property {number} [funkyMidpoint=0.8] - midpoint for funkyrect geom, see
 *   {@link module:geoms.funkyrect|funkyrect}
 */
const DEFAULT_POSITION_ARGS = {
    rowHeight: 24,
    rowSpace: 0.1,
    rowBigspace: 1,
    colWidth: 24,
    colSpace: 0.1,
    colBigspace: 1,
    colAnnotOffset: 10,
    colAnnotAngle: 30,
    padding: 5,
    minGeomSize: 0.25,
    funkyMidpoint: 0.8
}

/**
 * Positional options for the heatmap.
 * @extends PositionOptions
 * @property {number} rowSpacePx - space between rows, in pixels. _Calculated_
 * @property {number} rowBigspacePx - space between groups of rows, in pixels. _Calculated_
 * @property {number} colSpacePx - space between columns, in pixels. _Calculated_
 * @property {number} geomSize - size of a heatmap element, in pixels. _Calculated_
 * @property {number} geomPadding - padding around heatmap elements, in pixels. _Calculated_
 * @property {number} geomPaddingX - padding around heatmap elements in the x direction, in pixels.
 *   _Calculated_
 * @property {number} bodyHeight - height of the heatmap body, in pixels. _Calculated_
 * @property {number} bodyWidth - width of the heatmap body, in pixels. _Calculated_
 * @property {number} width - width of the heatmap, in pixels, including header and footer.
 *   _Calculated_
 * @property {number} headerHeight - height of the header, in pixels. _Calculated_
 * @property {number} footerHeight - height of the footer, in pixels. _Calculated_
 * @property {number} footerOffset - offset of the footer from the left edge of the heatmap,
 *   in pixels. _Calculated_
 */
class PositionArgs {
    /**
     * Initialize the PositionArgs object from the provided options. Handles deprecation warnings
     * and calls {@link PositionArgs#calculate|calculate} to pre-calculate values.
     *
     * @param {PositionOptions} args - object with positional options
     */
    constructor(args) {
        _.extend(this, DEFAULT_POSITION_ARGS);
        _.extend(this, args);
        let underscoreDeprecatedArgs = [];
        let deprecatedArgs = [];
        for (let key of Object.getOwnPropertyNames(args)) {
            let underscore = key.indexOf('_');
            if (underscore > -1) {
                let newKey;
                while (underscore > -1) {
                    newKey = key.slice(0, underscore) + key[underscore + 1].toUpperCase() + key.slice(underscore + 2);
                    underscore = key.indexOf('_', underscore + 1);
                }
                this[newKey] = args[key];
                underscoreDeprecatedArgs.push(key);
                key = newKey;
            }
            if (key.startsWith('expand') || key == 'colWidth') {
                deprecatedArgs.push(key);
            }
        }
        if (underscoreDeprecatedArgs.length > 0) {
            let msg = 'Position arguments with underscores were accepted, but are deprecated. Use camelCase instead.';
            msg += ` Found: ${underscoreDeprecatedArgs.join(', ')}`;
            console.warn(msg);
        }
        if (deprecatedArgs.length > 0) {
            let msg = 'The following position arguments are deprecated and have no effect: ';
            msg += deprecatedArgs.join(', ');
            console.warn(msg);
        }
        this.calculate();
    }

    /**
     * Pre-calculate needed values based on the options.
     */
    calculate() {
        this.rowSpacePx = this.rowHeight * this.rowSpace;
        this.rowBigspacePx = this.rowHeight * this.rowBigspace;
        this.colSpacePx = this.rowHeight * this.colSpace;
        // assuming square
        this.geomSize = this.rowHeight - this.rowSpacePx;
        this.geomPadding = this.rowSpacePx / 2;
        this.geomPaddingX = this.colSpacePx / 2;
    }
}

/**
 * Heatmap class
 * @property {PositionArgs} positionArgs
 */
class FunkyHeatmap {
    constructor(
        data,
        columnInfo,
        columnGroups,
        rowInfo,
        rowGroups,
        palettes,
        legends,
        positionArgs,
        options,
        svg
    ) {
        this.rowGroupKey = '__group';

        this.data = data;
        this.columnInfo = columnInfo;
        this.columnGroups = d3.index(columnGroups, group => group.group);
        this.rowInfo = rowInfo;
        this.rowGroups = d3.index(rowGroups, group => group.group);
        this.palettes = palettes;
        this.legends = legends;
        this.positionArgs = new PositionArgs(positionArgs);
        this.options = _.merge(DEFAULT_OPTIONS, options);
        this.calculateOptions();
        this.svg = svg;
    }

    calculateOptions() {
        this.renderGroups = false;

        this.rowGroupOrder = [];
        // if we don't have row groups, put all rows in unnamed group
        if (this.rowInfo.length === 0 || this.rowInfo[0].group === undefined) {
            this.rowInfo = this.data.map(_ => { return {group: ''} });
        }

        this.data.forEach((d, i) => {
            const group = this.rowInfo[i].group;
            d[this.rowGroupKey] = group;
            if (this.rowGroupOrder.indexOf(group) === -1) {
                this.rowGroupOrder.push(group);
            }
        });
        const group = this.rowInfo[0].group
        const groupInfo = this.rowGroups.get(group);
        if (groupInfo !== undefined && groupInfo.Group !== undefined) {
            this.renderGroups = true;
        }
    }

    renderStripedRows() {
        const O = this.options;
        const P = this.positionArgs;

        let rowGroup, nGroups = 0, colorCounter = 0;
        this.data.forEach((d, i) => {
            if (this.renderGroups && d[this.rowGroupKey] !== rowGroup) {
                nGroups += 1;
                colorCounter = 0;
            }
            rowGroup = d[this.rowGroupKey];
            this.body.append('rect')
                .classed('row', true)
                .attr('height', P.rowHeight)
                .attr('x', 0)
                .attr('y', (i + nGroups) * P.rowHeight)
                .attr('fill', colorCounter % 2 === 0
                                ? O.theme.evenRowBackground
                                : O.theme.oddRowBackground);
            colorCounter += 1;
        });
    }

    renderData() {
        const O = this.options;
        const P = this.positionArgs;

        let offset = 0;
        P.bodyHeight = this.data.length * P.rowHeight;
        if (this.renderGroups) {
            P.bodyHeight += this.rowGroups.size * P.rowHeight;
        }
        let prevColGroup;

        this.columnInfo.forEach((column, i) => {
            let maxWidth = 0;
            let padding = P.geomPaddingX;
            let firstColumn = i === 0;
            if (column.geom === 'text' || column.geom === 'bar') {
                padding = P.padding;
            }
            offset += padding;
            if (prevColGroup && column.group && prevColGroup !== column.group) {
                offset += 2 * P.padding;
            }
            let rowGroup, nGroups = 0;
            this.data.forEach((item, j) => {
                let width = 0;
                if (this.renderGroups && item[this.rowGroupKey] !== rowGroup) {
                    nGroups += 1;
                }
                if (this.renderGroups && firstColumn && item[this.rowGroupKey] !== rowGroup) {
                    let groupName = GEOMS.text(
                        this.rowGroups.get(item[this.rowGroupKey]).Group,
                        null,
                        column,
                        O,
                        P
                    );
                    groupName
                        .classed('fh-row-group-name', true)
                        .attr('transform', `translate(${offset - padding}, ${(j + nGroups - 1) * P.rowHeight - 2 * P.geomPadding})`)
                        .attr('font-weight', 'bold')
                        .attr('dominant-baseline', 'hanging');
                    this.body.append(() => groupName.node());
                    width = groupName.node().getBBox().width;
                    if (nGroups > 1) {
                        const rowGroupWhiteBack = d3.create('svg:rect')
                            .classed('fh-row-group-back', true)
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('height', P.rowHeight)
                            .attr('fill', O.theme.oddRowBackground)
                            .attr('transform', `translate(${offset - padding}, ${(j + nGroups - 1) * P.rowHeight})`);
                        this.body.append(() => rowGroupWhiteBack.node());
                    }
                }
                rowGroup = item[this.rowGroupKey];
                let value = column.getValue(item);
                if (value === undefined || value === null || (isNaN(value) && column.numeric)) {
                    return;
                }
                let colorValue = column.getColorValue(item, j);
                let label;
                if (column.label) {
                    label = item[column.label];
                }
                if (GEOMS[column.geom] === undefined) {
                    throw `Geom ${column.geom} not implemented. Use one of ${Object.keys(GEOMS).join(', ')}.`;
                }
                let el = GEOMS[column.geom](value, colorValue, column, O, P);
                if (label) {
                    const labelColor = d3.hsl(column.palette(colorValue)).l > 0.5
                        ? 'black'
                        : 'white';
                    const g = d3.create('svg:g')
                        .classed('fh-geom', true);
                    g.append(() => el.classed('fh-geom', false).classed('fh-orig-geom', true).node());
                    // By default place label in the center of the geom
                    let labelX = P.rowHeight / 2;
                    if (column.geom === 'bar') {
                        // Bars are of different widths, place label on the left
                        labelX = P.padding + P.geomPaddingX * 3;
                    }
                    g.append('text')
                        .attr('x', labelX)
                        .attr('y', P.rowHeight / 2)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .attr('fill', labelColor)
                        .text(label);
                    el = g;
                }
                el.attr('transform', `translate(${offset}, ${(j + nGroups) * P.rowHeight})`);
                const tooltipValue = column.getHoverText(item, O.tooltipPrecision);
                if (tooltipValue !== undefined) {
                    el.datum({tooltip: tooltipValue});
                }
                if (column.geom === 'pie') {
                    const s = 'margin: 5px; border-collapse: collapse; border-top: 1px solid #aaa; border-left: 1px solid #aaa; font-size: 80%';
                    const s2 = 'padding: 2px 4px; border-bottom: 1px solid #aaa; border-right: 1px solid #aaa';
                    let tooltip = `<table style="${s}">${column.palette.colorNames.map((colorName, i) => {
                        return `<tr><td style="${s2}">${colorName}:</td><td style="${s2}">${value[i].toFixed(O.tooltipPrecision)}</td></tr>`;
                    }).join('')}</table>`;
                    el.datum({tooltip: tooltip});
                }
                this.body.append(() => el.node());
                let elWidth;
                if (label) {
                    elWidth = el.select('.fh-orig-geom').node().getBBox().width;
                } else {
                    elWidth = el.node().getBBox().width;
                }
                if (column.geom === 'image') {
                    elWidth = column.width;
                }
                if (elWidth > width) {
                    width = elWidth;
                }
                if (width > maxWidth) {
                    maxWidth = width;
                }
                if (label) {
                    label = el.select('text');
                    let fontSize = 100;
                    for (let q = 0; q < 12; q++) {
                        const { width } = label.node().getBBox();
                        if (width > P.geomSize - P.geomPaddingX * 2) {
                            fontSize -= 5;
                            label.attr('font-size', `${fontSize}%`);
                        } else {
                            break;
                        }
                    }
                }
            });
            if (column.geom === 'bar' && column.options.drawGuide !== false) {
                maxWidth = P.geomSize * column.width + P.geomPadding;
                this.body.append('line')
                    .attr('x1', offset + maxWidth)
                    .attr('x2', offset + maxWidth)
                    .attr('y1', this.renderGroups ? P.rowHeight : 0)
                    .attr('y2', P.bodyHeight)
                    .attr('stroke', O.theme.strokeColor)
                    .attr('stroke-dasharray', '5 5')
                    .attr('opacity', 0.5);
            }
            column.widthPx = Math.max(maxWidth, P.rowHeight);
            column.widthPx = Math.round(column.widthPx);
            column.offset = offset;
            offset += column.widthPx + padding;
            prevColGroup = column.group;
        });
        P.bodyWidth = offset + P.colSpacePx;
        this.body.selectAll('.fh-row-group-back').attr('width', P.bodyWidth).raise();
        this.body.selectAll('.fh-row-group-name').raise();
    }

    renderHeader() {
        const O = this.options;
        const P = this.positionArgs;

        let headerHeight = 0;
        let bodyWidth = 0;
        let nonZeroRotate = false;
        const groups = this.header.append('g');
        const labels = this.header.append('g')
            .attr('transform', `translate(0, ${P.rowHeight + P.colAnnotOffset})`);

        const columnGroups = d3.group(this.columnInfo, column => column.group);
        let abcCounter = 0;
        columnGroups.forEach((group, groupName) => {
            if (!groupName) {
                return;
            }
            const groupInfo = this.columnGroups.get(groupName);
            const column = new Column({
                id: '_group',
                palette: groupInfo.palette
            }, [1]);
            assignPalettes([column], this.palettes);
            const lastCol = group[group.length - 1];
            const groupStart = group[0].offset;
            const groupEnd = lastCol.offset + lastCol.widthPx + P.geomPadding;
            const fill = column.palette == 'none' && 'transparent' || column.palette(0.5);
            const rect = groups.append('rect')
                .attr('x', groupStart)
                .attr('y', 0)
                .attr('width', groupEnd - groupStart)
                .attr('height', P.rowHeight)
                .attr('fill', fill)
                .attr('opacity', 0.25);
            const text = groups.append('text')
                .attr('x', groupStart + (groupEnd - groupStart) / 2)
                .attr('y', P.rowHeight / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', O.theme.headerColor)
                .text(groupInfo.level1);
            if (O.fontSize) {
                text.attr('font-size', O.fontSize);
            }
            const { width } = text.node().getBBox();
            if (width + 2 * P.padding > groupEnd - groupStart) {
                const diff = width + 2 * P.padding - (groupEnd - groupStart);
                rect.attr('width', width + 2 * P.padding);
                rect.attr('x', groupStart - diff / 2);
            }
            if (O.labelGroupsAbc) {
                const letter = String.fromCharCode("a".charCodeAt(0) + abcCounter);
                const text = groups.append('text')
                    .attr('x', groupStart + P.padding)
                    .attr('y', P.rowHeight / 2)
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
                .attr('transform', `rotate(${-P.colAnnotAngle})`)
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
            if (!nonZeroRotate && nativeWidth < column.widthPx - 2 * P.padding) {
                column.rotate = false;
            } else {
                column.rotate = true;
                nonZeroRotate = true;
            }
            const { width, height } = el.node().getBoundingClientRect();
            if (height > headerHeight) {
                headerHeight = height;
            }
            if (column.offset + column.widthPx / 2 + width > bodyWidth) {
                bodyWidth = column.offset + column.widthPx / 2 + width + P.padding;
            }
        });
        this.columnInfo.forEach((column, i) => {
            let center = column.offset + column.widthPx / 2;
            let rotate = column.rotate ? -P.colAnnotAngle : 0;
            this.header.select(`.column-${i}`)
                .attr(
                    'transform',
                    `translate(${center}, ${headerHeight - 2 * P.padding}) rotate(${rotate})`
                );
            if (!column.rotate) {
                labels.select(`.column-${i} text`)
                    .attr('text-anchor', 'middle');
            } else {
                labels.append('line')
                    .attr('x1', center)
                    .attr('x2', center)
                    .attr('y1', headerHeight - 2)
                    .attr('y2', headerHeight - 2 - P.padding)
                    .attr('stroke', O.theme.strokeColor);
            }
        });
        P.width = bodyWidth;
        P.headerHeight = headerHeight + P.rowHeight + P.colAnnotOffset;
    }

    renderLegends() {
        const O = this.options;
        const P = this.positionArgs;

        // go through this.legends and render them sequentially

        let footerHeight = 0;
        const legendEl = this.footer.append('g');
        let legendXOffset = 0;
        let offset = 0;
        let funkyrectPresent = false;

        this.legends.forEach(legend => {
            if (!legend.enabled) {
                return;
            }
            const rowHeight = O.legendFontSize;
            let offsetY = rowHeight * 2 + P.padding;
            const el = legendEl.append('g');
            el.attr('transform', `translate(${offset}, 0)`);
            el.append('text')
                .attr('x', 0)
                .attr('y', offsetY)
                .attr('font-size', O.legendFontSize)
                .style('fill', O.theme.textColor)
                .text(legend.title);

            if (legend.geom === 'text') {
                let labelsWidth = 0;
                legend.labels.forEach((label, i) => {
                    const txt = el.append('text')
                        .attr('x', P.padding)
                        .attr('y', offsetY + (i + 1) * (rowHeight + P.padding))
                        .attr('font-size', O.legendFontSize)
                        .style('fill', O.theme.textColor)
                        .text(label);
                    const { width } = txt.node().getBBox();
                    if (width > labelsWidth) {
                        labelsWidth = width;
                    }
                });
                legend.values.forEach((value, i) => {
                    el.append('text')
                        .attr('x', P.padding * 2 + labelsWidth)
                        .attr('y', offsetY + (i + 1) * (rowHeight + P.padding))
                        .attr('font-size', O.legendFontSize)
                        .style('fill', O.theme.textColor)
                        .text(value);
                });
            }
            if (legend.geom === 'rect') {
                let myOffset = 0;
                legend.values.forEach((colorValue, i) => {
                    const label = legend.labels[i];
                    const size = legend.size[i];
                    const geom = GEOMS.rect(size, colorValue, legend, O, P);
                    geom.attr('transform', `translate(${myOffset}, ${offsetY + P.padding})`);
                    el.append(() => geom.node());
                    let x = myOffset;
                    let textAnchor = 'start';
                    if (legend.label_align === 'center') {
                        x += P.rowHeight / 2;
                        textAnchor = 'middle';
                    } else if (legend.label_align === 'right') {
                        x += P.rowHeight;
                        textAnchor = 'end';
                    }
                    el.append('text')
                        .attr('x', x)
                        .attr('y', offsetY + P.rowHeight + rowHeight + P.padding)
                        .attr('font-size', O.legendFontSize)
                        .attr('text-anchor', textAnchor)
                        .style('fill', O.theme.textColor)
                        .text(label);
                    myOffset += P.geomSize + P.padding;
                });
            }
            if (legend.geom === 'funkyrect') {
                let myOffset = 0;
                legend.labels.forEach((label, i) => {
                    const colorValue = legend.values[i];
                    const size = legend.size[i];
                    const geom = GEOMS.funkyrect(size, colorValue, legend, O, P);
                    el.append(() => geom.node());
                    const { width: geomWidth, height: geomHeight } = geom.node().getBBox();
                    geom.attr(
                        'transform',
                        `translate(${myOffset}, ${offsetY + P.rowHeight / 2 - geomHeight / 2})`
                    );
                    let x = myOffset + P.rowHeight / 2 - geomWidth / 2;
                    let textAnchor = 'start';
                    if (legend.label_align === 'center') {
                        x += geomWidth / 2;
                        textAnchor = 'middle';
                    } else if (legend.label_align === 'right') {
                        x += geomWidth;
                        textAnchor = 'end';
                    }
                    el.append('text')
                        .attr('x', x)
                        .attr('y', offsetY + P.rowHeight + rowHeight + P.padding)
                        .attr('font-size', O.legendFontSize)
                        .attr('text-anchor', textAnchor)
                        .style('fill', O.theme.textColor)
                        .text(label);
                    myOffset += geomWidth + P.padding;
                });
            }
            if (legend.geom === 'circle') {
                let myOffset = 0;
                legend.labels.forEach((label, i) => {
                    const colorValue = legend.values[i];
                    const size = legend.size[i];
                    const geom = GEOMS.circle(size, colorValue, legend, O, P);
                    el.append(() => geom.node());
                    const { width: geomWidth, height: geomHeight } = geom.node().getBBox();
                    geom.attr(
                        'transform',
                        `translate(${myOffset}, ${offsetY + P.rowHeight / 2 - geomHeight / 2})`
                    );
                    let x = myOffset + P.rowHeight / 2 - geomWidth / 2;
                    let textAnchor = 'start';
                    if (legend.label_align === 'center') {
                        x += geomWidth / 2;
                        textAnchor = 'middle';
                    } else if (legend.label_align === 'right') {
                        x += geomWidth;
                        textAnchor = 'end';
                    }
                    el.append('text')
                        .attr('x', x)
                        .attr('y', offsetY + P.rowHeight + rowHeight + P.padding)
                        .attr('font-size', O.legendFontSize)
                        .attr('text-anchor', textAnchor)
                        .style('fill', O.theme.textColor)
                        .text(label);
                    myOffset += geomWidth + P.padding;
                });
            }
            if (legend.geom === 'bar') {
                const colors = legend.palette.range();

                const grad = this.svg.append('defs')
                    .append('linearGradient')
                    .attr('id', `grad_${legend.paletteName}`)
                    .attr('x1', '0%')
                    .attr('x2', '100%')
                    .attr('y1', '0%')
                    .attr('y2', '0%');

                grad.selectAll('stop')
                    .data(colors)
                    .enter()
                    .append('stop')
                    .style('stop-color', function(d) { return d; })
                    .attr('offset', function(d, i) {
                        return 100 * (i / (colors.length - 1)) + '%';
                    });

                // A bit ugly to get the width of the column mapped to this legend
                const col = this.columnInfo.filter((column) =>
                    column.geom === 'bar' && column.paletteName === legend.paletteName
                )[0];

                el.append('rect')
                    .attr('x', P.padding)
                    .attr('y', offsetY + P.padding)
                    .attr('width', col.widthPx)
                    .attr('height', P.rowHeight)
                    .style('fill', `url(#grad_${legend.paletteName})`)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 0.5);

                legend.labels.forEach((label, i) => {
                    if (label === '') {
                        return;
                    }
                    const value = legend.values[i];
                    const xPos = P.padding + col.widthPx * value;
                    if (value > 0 && value < 1) {
                        el.append('line')
                            .attr('x1', xPos)
                            .attr('x2', xPos)
                            .attr('y1', offsetY + P.rowHeight + P.padding)
                            .attr('y2', offsetY + P.rowHeight)
                            .attr('stroke', 'black')
                            .attr('stroke-width', 0.5);
                    }
                    el.append('text')
                        .attr('x', xPos)
                        .attr('y', offsetY + P.rowHeight + rowHeight + P.padding)
                        .attr('font-size', O.legendFontSize)
                        .attr('text-anchor', 'middle')
                        .style('fill', O.theme.textColor)
                        .text(label);
                });
            }
            if (legend.geom === 'image') {
                legend.values.forEach((value, i) => {
                    const label = legend.labels[i];
                    const img = GEOMS.image(value, null, {width: legend.size[i]}, O, P);
                    img.attr('transform', `translate(0, ${offsetY + P.padding})`);
                    el.append(() => img.node());
                    const { width: imgWidth, height: imgHeight } = img.node().getBBox();
                    el.append('text')
                        .attr('x', imgWidth + P.padding)
                        .attr('y', offsetY + P.padding + imgHeight / 2)
                        .attr('font-size', O.legendFontSize)
                        .attr('text-anchor', 'left')
                        .attr('dominant-baseline', 'central')
                        .style('fill', O.theme.textColor)
                        .text(label);
                    offsetY += imgHeight + P.padding;
                });
            }
            if (legend.geom === 'pie') {
                const arcs = d3.pie().endAngle(Math.PI)(Array(legend.palette.colorNames.length).fill(1));
                const g = el.append('g');
                g.attr('transform', `translate(0, ${offsetY + P.padding + P.rowHeight})`);
                g.selectAll('arcs')
                    .data(arcs)
                    .enter()
                    .append('path')
                        .attr('d', d3.arc().innerRadius(0).outerRadius(P.geomSize / 2))
                        .attr('fill', (_, i) => {
                            return legend.palette(i);
                        })
                        .style('stroke', O.theme.strokeColor)
                        .style('stroke-width', 1)
                        .attr('transform', `translate(${P.geomSize / 2 + P.geomPadding - 0.5}, 0)`);

                g.selectAll('text')
                    .data(arcs)
                    .enter()
                    .append('text')
                    .text((_, i) => legend.palette.colorNames[i])
                    .attr('font-size', O.legendFontSize)
                    .attr('dominant-baseline', 'central')
                    .style('fill', O.theme.textColor)
                    .attr('transform', d => {
                        const p = d3.arc().innerRadius(P.geomSize / 2).outerRadius(P.geomSize).centroid(d);
                        p[0] += P.geomSize / 2 + 4 * P.geomPadding;
                        return `translate(${p})`;
                    });

                g.selectAll('lines')
                    .data(arcs)
                    .enter()
                    .append('path')
                        .attr('d', d => {
                            const p1 = d3.arc().innerRadius(P.geomSize / 2).outerRadius(P.geomSize / 2 + 5).centroid(d);
                            const p2 = d3.arc().innerRadius(P.geomSize / 2).outerRadius(P.geomSize - 5).centroid(d);
                            p1[0] += P.geomSize / 2 + P.geomPadding;
                            p2[0] += P.geomSize / 2 + 3 * P.geomPadding;
                            return d3.line()([p1, p2]);
                        })
                        .style('stroke', O.theme.strokeColor)
                        .style('stroke-width', 0.5);
            }

            const { width } = el.node().getBBox();
            offset += width + P.padding * 2;
        });

        const { height } = legendEl.node().getBBox();
        if (height > footerHeight) {
            footerHeight = height;
        }
        let legendWidth = offset - P.padding;
        if (funkyrectPresent) {
            legendWidth += P.geomSize;
        }
        if (legendXOffset + legendWidth > P.width) {
            if (legendWidth <= P.width) { // try to right-justify the legend
                legendXOffset = P.width - legendWidth;
            } else {
                legendXOffset = 0;
                P.width = offset;
            }
        }
        P.footerOffset = legendXOffset;
        P.footerHeight = footerHeight + P.rowHeight;
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
                    .style("padding", "3px 5px")
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
            let el = d3.select(e.target);
            while (el.classed('fh-geom') === false && el.node() != this.svg.node()) {
                el = d3.select(el.node().parentNode);
            }
            const d = el.datum();
            if (d && d.tooltip) {
                const mouse = d3.pointer(e, document.body);
                this.showTooltip(mouse, d.tooltip);
                return;
            }
        }
        this.hideTooltip();
    }

    onColumnClick(e) {
        const el = d3.select(e.target);
        const elBox = el.node().getBBox();
        const column = el.datum();
        const comparator = column.sort();
        let data = d3.group(this.data, d => d[this.rowGroupKey]);
        data = [].concat(...this.rowGroupOrder.map(group => d3.sort(data.get(group), (a, b) => {
            [a, b] = [a[column.id], b[column.id]];
            if (column.numeric) {
                [a, b] = [+a, +b];
            }
            return comparator(a, b);
        })));
        this.data = data;
        const colData = rowToColData(data);
        this.columnInfo.forEach(column => {
            column.data = colData[column.id];
            if (column.numeric) {
                column.maybeCalculateStats();
            }
        });
        this.svg.selectChildren().remove();
        this.render();

        this.indicateSort(column, elBox);
    }

    indicateSort(column, labelBox) {
        const O = this.options;
        const P = this.positionArgs;

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
        let x = column.offset + column.widthPx / 2 - 2 * P.padding;
        let y = P.headerHeight - P.padding;
        if (!column.rotate) {
            x -= labelBox.width / 2;
            y -= labelBox.height / 2;
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

        this.renderStripedRows();
        this.renderData();
        this.renderHeader();
        this.renderLegends();

        const O = this.options;
        const P = this.positionArgs;

        this.svg.attr('width', P.width);
        this.svg.attr('height', P.bodyHeight + P.headerHeight + P.footerHeight);
        if (this.renderGroups) {
            this.header.attr('transform', `translate(0, ${P.rowHeight})`);
        }
        this.body.selectAll('.row').attr('width', P.bodyWidth);
        this.body.attr("transform", `translate(0, ${P.headerHeight})`);
        this.footer.attr('transform', `translate(${P.footerOffset}, ${P.headerHeight + P.bodyHeight})`);
        this.svg.attr('style', '');
        if (O.rootStyle) {
            this.svg.attr('style', O.rootStyle);
        }
    }

    listen() {
        this.svg.on("mousemove", this.onMouseMove.bind(this));
    }
};


/**
 * The main entry point for the library. Takes data and various configuration options and returns
 * an SVG element with the heatmap. Internally uses {@link FunkyHeatmap}. Creates a new SVG element
 * and adds it to the DOM immediately, and renders the heatmap offscreen, to be able to calculate
 * the dimensions of text and other elements.
 *
 * @param {ColumnData|RowData} data - data to plot, usually d3-fetch output
 * @param {ColumnData|module:columns~ColumnInfo[]} columnInfo - information about how the columns
 *   should be displayed. If not specified, all columns from `data` will be displayed.
 *   See {@link module:columns~ColumnInfo|ColumnInfo}, {@link module:columns.Column|Column}
 * @param {ColumnData|RowData} rowInfo - information about how the rows should be displayed
 * @param {ColumnData|RowData} columnGroups - information about how to group columns
 * @param {ColumnData|RowData} rowGroups - information about how to group rows
 * @param {module:palettes~PaletteMapping} palettes - mapping of names to palette colors
 * @param {ColumnData|RowData} legends - a list of legends to add to the plot
 * @param {PositionOptions} positionArgs - positioning options, see {@link PositionArgs}
 * @param {HeatmapOptions} options - options for the heatmap
 * @param {boolean} scaleColumn - whether to apply min-max scaling to numerical
 *   columns. Defaults to true
 *
 * @returns {SVGElement} - the SVG element containing the heatmap
 *
 */
function funkyheatmap(
    data,
    columnInfo,
    rowInfo = [],
    columnGroups = [],
    rowGroups = [],
    palettes = {},
    legends = [],
    positionArgs = {},
    options = {},
    scaleColumn = true
) {
    [data, columnInfo, columnGroups, rowInfo, rowGroups, legends] = ensureRowData(
        data, columnInfo, columnGroups, rowInfo, rowGroups, legends
    );
    columnInfo = buildColumnInfo(data, columnInfo, scaleColumn, options.colorByRank);
    columnGroups = buildColumnGroups(columnGroups, columnInfo);
    legends = prepareLegends(legends, palettes, columnInfo);
    assignPalettes(columnInfo, palettes);
    assignPalettes(legends, palettes);

    const svg = d3.select('body')
        .append('svg')
            .classed('funkyheatmap', true)
            .style('visibility', 'hidden')
            .style('position', 'absolute')
            .style('left', '-2000px');
    const heatmap = new FunkyHeatmap(
        data,
        columnInfo,
        columnGroups,
        rowInfo,
        rowGroups,
        palettes,
        legends,
        positionArgs,
        options,
        svg
    );
    heatmap.render();
    heatmap.listen();
    heatmap.svg.remove();

    return heatmap.svg.node();
}

export default funkyheatmap;

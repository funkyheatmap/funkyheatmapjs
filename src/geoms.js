/**
 * @module
 * @description Module with available visualization functions (called `geoms`) to display the data.
 * The following table summarizes available geoms for different data types:
 * | Data type | Name | Link | Size mapping | Color mapping |
 * | --- | --- | --- | --- | --- |
 * | `number` | `funkyrect` | {@link module:geoms.funkyrect} | ✅ | ✅ |
 * | `number` | `circle` | {@link module:geoms.circle} | ✅ | ✅ |
 * | `number` | `bar` | {@link module:geoms.bar} | ✅ | ✅ |
 * | `number` | `rect` | {@link module:geoms.rect} | 🚫 | ✅ |
 * | `string` | `text` | {@link module:geoms.text} | 🚫 | ✅ |
 * | `number[]` | `pie` | {@link module:geoms.pie} | 🚫 | ✅ |
 * | `image` | `image` | {@link module:geoms.image} | 🚫 | 🚫 |
 *
 * Each geom is a function with the signature of {@link module:geoms~geom|geom}.
 */

import * as d3 from 'd3';

/**
 * @name geom
 * @constant
 * @function
 * @abstract
 * @description Abstract virtual function representing a geom.
 *
 * @param {number|number[]|string} value - data value to be visualized, of the above types
 * @param {number|string} colorValue - value to be used for color mapping, if applicable
 * @param {module:columns.Column} column - column object
 * @param {HeatmapOptions} O - heatmap options
 * @param {PositionArgs} P - position arguments
 * @returns {SVGElement} - SVG element representing the geom
 */

export const GEOMS = {
    /**
     * @memberof module:geoms
     * @see {@link module:geoms~geom|geom} for function signature
     * @description Text geom. Renders text string. Configured with `fontSize` and `align` options.
     *   Default fontSize is inherited from {@link HeatmapOptions}. Default align is `left`.
     *   Color is mapped from palette by text value, if palette is defined (see
     *   {@link module:palettes~CustomPalette|CustomPalette}).
     */
    text: (value, _, column, O, P) => {
        let fill = O.theme.textColor;
        if (column.palette && column.palette !== 'none') {
            fill = column.palette(value);
        }
        let align = 'start', x = 0;
        if (column.options.align === 'center' || column.options.align === 'middle') {
            align = 'middle';
            x = P.rowHeight / 2;
        }
        if (column.options.align === 'right' || column.options.align === 'end') {
            align = 'end';
            x = P.rowHeight - P.padding;
        }
        const el = d3.create('svg:text')
            .classed('fh-geom', true)
            .attr('dominant-baseline', 'middle')
            .attr('y', P.rowHeight / 2)
            .attr('x', x)
            .attr('text-anchor', align)
            .style('fill', fill)
            .text(value);
        if (O.fontSize) {
            el.attr('font-size', O.fontSize);
        }
        if (column.options.fontSize) {
            el.attr('font-size', column.options.fontSize);
        }
        return el;
    },

    /**
     * @memberof module:geoms
     * @see {@link module:geoms~geom|geom} for function signature
     * @description Bar geom. Renders a bar with width proportional to value. Maximum bar width is
     *   configured with `width` property ({@link module:columns~ColumnInfo|ColumnInfo}). If value
     *   is 0, minimal bar width is set from {@link PositionArgs} `minGeomSize`.
     */
    bar: (value, colorValue, column, O, P) => {
        const fill = column.palette(colorValue);
        value = column.scale(value);
        let width = value * column.width * P.geomSize;
        if (width === 0) {
            width = P.minGeomSize;
        }
        return d3.create('svg:rect')
            .classed('fh-geom', true)
            .attr('x', P.geomPaddingX)
            .attr('y', P.geomPadding)
            .attr('width', width.toFixed(2))
            .attr('height', P.geomSize)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill);
    },

    /**
     * @memberof module:geoms
     * @see {@link module:geoms~geom|geom} for function signature
     * @description Circle geom. Renders a circle with radius proportional to value. If value is 0,
     *   minimal circle radius is set from {@link PositionArgs} `minGeomSize`.
     */
    circle: (value, colorValue, column, O, P) => {
        const fill = column.palette(colorValue);
        value = column.scale(value);
        let radius = value * P.geomSize / 2;
        if (radius === 0) {
            radius = P.minGeomSize;
        }
        return d3.create('svg:circle')
            .classed('fh-geom', true)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('cx', P.rowHeight / 2)
            .attr('cy', P.rowHeight / 2)
            .attr('r', radius.toFixed(2));
    },

    /**
     * @memberof module:geoms
     * @see {@link module:geoms~geom|geom} for function signature
     * @description Square geom. Renders a square of standard size, but color is mapped from
     *   palette.
     */
    rect: (value, colorValue, column, O, P) => {
        const fill = column.palette(colorValue);
        value = column.scale(value);
        return d3.create('svg:rect')
            .classed('fh-geom', true)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('x', P.geomPaddingX)
            .attr('y', P.geomPadding)
            .attr('width', P.geomSize)
            .attr('height', P.geomSize);
    },

    /**
     * @memberof module:geoms
     * @see {@link module:geoms~geom|geom} for function signature
     * @description Funkyrect geom. Renders a circle that grows into a square with rounded corners.
     *   Value below {@link PositionArgs} `funkyMidpoint` is rendered as a circle, above as
     *   a square, with corner radius decreasing as value grows.
     */
    funkyrect: (value, colorValue, column, O, P) => {
        let scaled = column.scale(value);
        const fill = column.palette(colorValue);
        if (scaled < P.funkyMidpoint) {
            // transform value to a 0.0 .. 0.5 range
            value = column.scale.copy()
                .range([0, 0.5])
                .domain([column.min, column.min + column.range * P.funkyMidpoint])(value);
            let radius = (value * 0.9 + 0.1) * P.geomSize - P.geomPadding; // 0.5 for stroke
            if (radius <= 0) {
                radius = P.minGeomSize;
            }
            return d3.create('svg:circle')
                .classed('fh-geom', true)
                .style('stroke', O.theme.strokeColor)
                .style('stroke-width', 1)
                .style('fill', fill)
                .attr('cx', P.rowHeight / 2)
                .attr('cy', P.rowHeight / 2)
                .attr('r', radius.toFixed(2));
        }
        // transform value to a 0.5 .. 1.0 range
        value = column.scale
            .copy()
            .range([0.5, 1])
            .domain([column.min + column.range * P.funkyMidpoint, column.max])(value);
        const cornerSize = (0.9 - 0.8 * value) * P.geomSize;
        return d3.create('svg:rect')
            .classed('fh-geom', true)
            .style('stroke', O.theme.strokeColor)
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('x', P.geomPaddingX)
            .attr('y', P.geomPadding)
            .attr('width', P.geomSize)
            .attr('height', P.geomSize)
            .attr('rx', cornerSize.toFixed(2))
            .attr('ry', cornerSize.toFixed(2));
    },

    /**
     * @memberof module:geoms
     * @see {@link module:geoms~geom|geom} for function signature
     * @description Pie chart geom. Renders a pie chart with slices proportional to values.
     */
    pie: (value, _, column, O, P) => {
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
                .attr('cx', P.rowHeight / 2)
                .attr('cy', P.rowHeight / 2)
                .attr('r', P.geomSize / 2);
        }

        const arcs = d3.pie().sortValues(null)(value);
        const g = d3.create('svg:g');
        g.classed('fh-geom', true);
        g.selectAll('arcs')
            .data(arcs)
            .enter()
            .append('path')
                .attr('d', d3.arc().innerRadius(0).outerRadius(P.geomSize / 2))
                .attr('fill', (_, i) => {
                    return column.palette(i);
                })
                .style('stroke', O.theme.strokeColor)
                .style('stroke-width', 1)
                .attr('transform', `translate(${P.rowHeight / 2}, ${P.rowHeight / 2})`);
        return g;
    },

    /**
     * @memberof module:geoms
     * @see {@link module:geoms~geom|geom} for function signature
     * @description Image geom. Renders an image with standard height and width specified in column
     *   options (see {@link module:columns~ColumnInfo|ColumnInfo} `width`).
     */
    image: function(value, _, column, O, P) {
        return d3.create('svg:image')
            .classed('fh-geom', true)
            .attr('y', P.geomPadding)
            .attr('href', value)
            .attr('height', P.geomSize)
            .attr('width', column.width)
            .attr('preserveAspectRatio', 'xMidYMid');
    }
};

import * as d3 from 'd3';


export const GEOMS = {
    text: (value, _, __, O, P) => {
        const el = d3.create('svg:text')
            .attr('dominant-baseline', 'middle')
            .attr('y', P.rowHeight / 2)
            .style('fill', O.theme.textColor)
            .text(value);
        if (O.fontSize) {
            el.attr('font-size', O.fontSize);
        }
        return el;
    },

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

    image: function(value, _, column, O, P) {
        return d3.create('svg:image')
            .attr('y', P.geomPadding)
            .attr('href', value)
            .attr('height', P.geomSize)
            .attr('width', column.width)
            .attr('preserveAspectRatio', 'xMidYMid');
    }
};

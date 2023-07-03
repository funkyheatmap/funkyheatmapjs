import * as d3 from 'd3';


export const GEOMS = {
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

    pie: (value, _, column, O) => {
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
        g.classed('fh-geom', true);
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

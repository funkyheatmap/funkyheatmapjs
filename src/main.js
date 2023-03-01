import * as d3 from 'd3';

const ROW_HEIGHT = 24;
const GEOM_GAP = 1.5;
const GEOM_SIZE = ROW_HEIGHT - 2 * GEOM_GAP;
const LEFT_MARGIN = 5;

const Blues = [
    "#011636", "#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF",
    "#DEEBF7", "#F7FBFF"
];

const GEOMS = {
    text: (container, x, y, item, column) => container.append('text')
        .attr('x', x)
        .attr('y', ROW_HEIGHT / 2 + y * ROW_HEIGHT)
        .attr('dominant-baseline', 'middle')
        .text(item[column.name]),

    circle: (container, x, y, item, column) => {
        const value = column.scale(+item[column.name]);
        return container.append('circle')
            .style('stroke', '#555')
            .style('stroke-width', 1)
            .style('fill', '#ccc')
            .attr('cx', x + ROW_HEIGHT / 2)
            .attr('cy', ROW_HEIGHT / 2 + y * ROW_HEIGHT)
            .attr('r', value * GEOM_SIZE / 2);
    },

    funkyrect: (container, x, y, item, column) => {
        let value = column.scale(+item[column.name]);
        const fill = column.palette(+item[column.name]);
        if (value < column.midpoint) {
            // transform value to a 0.0 .. 0.5 range
            value = column.scale.copy()
                .range([0, 0.5])
                .domain([column.min, column.min + column.range * column.midpoint])(+item[column.name]);
            const radius = (value * 0.9 + 0.12) * GEOM_SIZE - GEOM_GAP; // 0.5 for stroke
            return container.append('circle')
                .style('stroke', '#555')
                .style('stroke-width', 1)
                .style('fill', fill)
                .attr('cx', x + ROW_HEIGHT / 2)
                .attr('cy', ROW_HEIGHT / 2 + y * ROW_HEIGHT)
                .attr('r', radius.toFixed(2));
        }
        // transform value to a 0.5 .. 1.0 range
        value = column.scale
            .copy()
            .range([0.5, 1])
            .domain([column.min + column.range * column.midpoint, column.max])(+item[column.name]);
        const cornerSize = (0.9 - 0.8 * value) * GEOM_SIZE;
        return container.append('rect')
            .style('stroke', '#555')
            .style('stroke-width', 1)
            .style('fill', fill)
            .attr('x', x + GEOM_GAP)
            .attr('y', GEOM_GAP + y * ROW_HEIGHT)
            .attr('width', GEOM_SIZE)
            .attr('height', GEOM_SIZE)
            .attr('rx', cornerSize.toFixed(2))
            .attr('ry', cornerSize.toFixed(2));
    },
};

function isNumeric(str) {
    if (typeof (str) !== 'string') return false; // we only process strings!
    // use type coercion to parse the _entirety_ of the string
    // (`parseFloat` alone does not do this)...
    return !Number.isNaN(str)
        && !Number.isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}

function calculateColumnStats(data, columnInfo) {
    const item = data[0];
    columnInfo.forEach((column) => {
        if (isNumeric(item[column.name])) {
            const extent = d3.extent(data, (i) => +i[column.name]);
            [column.min, column.max] = extent;
            column.range = column.max - column.min;
            column.scale = d3.scaleLinear().domain(extent);
            const step = column.range / Blues.length;
            const domain = d3.range(column.min, column.max, step);
            console.log(domain);
            column.palette = d3.scaleLinear().domain(domain).range(Blues);
        }
    });
}

function verifyColumnInfo(data, columns, columnInfo) {
    const item = data[0];
    columnInfo = columns.map((column, i) => {
        const info = columnInfo ? columnInfo[i] : {};
        let type = typeof (item[column]);
        if (isNumeric(item[column])) {
            type = 'number';
            info.numeric = true;
        }
        info.name = column;
        if (info.geom === undefined) {
            if (type === 'string') {
                info.geom = 'text';
            } else if (type === 'number') {
                info.geom = 'funkyrect';
                info.midpoint = 0.8;
            } else {
                info.geom = null;
            }
        }
        if (info.width === undefined) {
            if (info.geom === 'text') {
                info.width = 6;
            } else if (info.geom === 'bar') {
                info.width = 4;
            } else {
                info.width = 1;
            }
        }
        return info;
    });

    return columnInfo;
}

/**
 *
 * @param {string} id - html id of container element
 * @param {Object[]} data - data to plot, usually d3-fetch output.
 *      It should be an Array of Objects, each object has the same properties.
 * @param {string[]} columns - columns of the data, in order.
 *      First column is the id column.
 * @param {Object[]} columnInfo - information about how the columns should be displayed
 * @param {boolean} [scaleColumn] - whether to apply min-max scaling to numerical
 *      columns. Defaults to true
 */
function funkyheatmap(id, data, columns, columnInfo, scaleColumn) {
    const height = data.length * ROW_HEIGHT; // + legend + header
    let width = 500;

    columnInfo = verifyColumnInfo(data, columns, columnInfo);
    calculateColumnStats(data, columnInfo);
    console.log(columnInfo);

    const container = d3.select(`#${id}`)
        .append('svg')
            .attr('width', width)
            .attr('height', height);

    const header = container.append("g");
    const body = container.append("g");

    data.forEach((_, i) => {
        body.append('rect')
            .classed('row', true)
            .attr('width', width)
            .attr('height', ROW_HEIGHT)
            .attr('x', 0)
            .attr('y', i * ROW_HEIGHT)
            .attr('fill', i % 2 === 0 ? '#eee' : 'white');
    });

    let offset = LEFT_MARGIN;
    let headerHeight = 0;
    let bodyWidth = 0;
    columnInfo.forEach((column) => {
        let maxWidth = 0;
        data.forEach((item, j) => {
            const el = GEOMS[column.geom](
                body,
                offset,
                j,
                item,
                column,
            );
            const width = el.node().getBBox().width;
            if (width > maxWidth) {
                maxWidth = width;
            }
        });
        column.width = maxWidth;
        const el = header.append("g")
            .attr("transform", `translate(${offset + maxWidth / 2}, 40) rotate(-30)`);
        el.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text(column.name);
        const { width, height } = el.node().getBoundingClientRect();
        if (height > headerHeight) {
            headerHeight = height;
        }
        if (offset + width > bodyWidth) {
            bodyWidth = offset + width;
        }
        offset += maxWidth + 2 * LEFT_MARGIN;
    });
    width = offset - LEFT_MARGIN;
    container.attr('width', bodyWidth);
    container.attr('height', height + headerHeight);
    body.selectAll('.row').attr('width', width);
    body.attr("transform", `translate(0, ${headerHeight})`);
}

export default funkyheatmap;

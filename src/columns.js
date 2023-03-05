import * as d3 from 'd3';

/**
 * Assemble all column information needed for drawing
 *
 * @param {Object[]} data - dataset
 * @param {string[]} columns - names of the columns
 * @param {Object[]} columnInfo - properties of the columns for drawing, which we will modify
 * @param {boolean} scaleColumn - whether to min-max scale data per column
 */
export function buildColumnInfo(data, columns, columnInfo, scaleColumn) {
    const item = data[0];
    return columns.map((column, i) => {
        const info = columnInfo ? columnInfo[i] : {};
        info.id = column;
        let type = typeof item[column];
        if (isNumeric(item[column])) {
            type = 'number';
            info.numeric = true;
            calculateColumnStats(data, info, scaleColumn);
        }
        if (info.name === undefined) {
            info.name = info.id;
        }
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
        if (info.palette === undefined) {
            if (info.geom === 'pie') {
                info.palette = 'categorical';
            }
            if (info.numeric) {
                info.palette = 'numerical';
            }
        }

        return info;
    });
};

function isNumeric(str) {
    if (typeof str === 'number') return true;
    if (typeof str !== 'string') return false;
    // use type coercion to parse the _entirety_ of the string
    // (`parseFloat` alone does not do this)...
    return !Number.isNaN(str)
        && !Number.isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}

function calculateColumnStats(data, column, scaleColumn) {
    let extent = [0, 1];
    if (scaleColumn) {
        extent = d3.extent(data, (i) => +i[column.id]);
    }
    [column.min, column.max] = extent;
    column.range = column.max - column.min;
    column.scale = d3.scaleLinear().domain(extent);
}

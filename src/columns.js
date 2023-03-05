import * as d3 from 'd3';


export class Column {
    constructor(info, value) {
        ({
            id: this.id,
            name: this.name,
            geom: this.geom,
            width: this.width,
            palette: this.palette,
            group: this.group
        } = info);

        let type = typeof value;
        if (isNumeric(value)) {
            type = 'number';
            this.numeric = true;
        }

        if (this.name === undefined) {
            this.name = this.id;
        }

        if (this.geom === undefined) {
            if (type === 'number') {
                this.geom = 'funkyrect';
            } else {
                this.geom = 'text';
            }
        }
        if (this.width === undefined) {
            if (this.geom === 'bar') {
                this.width = 4;
            }
        }
        if (this.palette === undefined) {
            if (this.geom === 'pie') {
                this.palette = 'categorical';
            }
            if (this.numeric) {
                this.palette = 'numerical';
            }
        }
    }

    maybeCalculateStats(data, scaleColumn) {
        let extent = [0, 1];
        if (scaleColumn) {
            extent = d3.extent(data, i => +i[this.id]);
        }
        [this.min, this.max] = extent;
        this.range = this.max - this.min;
        this.scale = d3.scaleLinear().domain(extent);
    }
}

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
        column = new Column(info, item[column]);
        column.maybeCalculateStats(data, scaleColumn);
        return column;
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

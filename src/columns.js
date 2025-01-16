/** @module  */

import * as d3 from 'd3';

import { rowToColData } from './input_util';

/**
 * @typedef {Object} ColumnInfo
 * @description Information about a dataframe column and how to display it.
 * @property {string} id - column id in the dataset. Required
 * @property {string} id_color - id of the column that will determine the color for display
 * @property {boolean} colorByRank - whether to color by rank per column instead of by value
 */

/**
 * @class
 * @property {string} id - column id in the dataset
 * @property {boolean} numeric - whether the column is numeric, computed from the data.
 *   See {@link module:columns~isNumeric} for details.
 * @property {boolean} categorical - whether the column is categorical, computed from the data
 * @property {string} id_color - id of the column that will determine the color for display
 * @property {boolean} colorByRank - whether to color by rank per column instead of by value
 */
export class Column {
    /**
     * Initialize a column with checks, defaults, and stats calculation.
     *
     * @param {module:columns~ColumnInfo} info - column configuration
     * @param {Array} data - array of data for the column
     */
    constructor(info, data) {
        ({
            id: this.id,
            id_color: this.id_color,
            colorByRank: this.colorByRank,
            name: this.name,
            geom: this.geom,
            group: this.group,
            palette: this.palette,
            width: this.width,
            label: this.label,
            overlay: this.overlay,
            options: this.options
        } = info);
        this.data = data;

        this.colorByRank = this.colorByRank || false;

        const value = data[0];
        let type = typeof value;
        // geom text is always categorical
        if (isNumeric(value) && this.geom !== 'text') {
            type = 'number';
            this.numeric = true;
            this.categorical = false;
            this.data = this.data.map(d => +d);
        } else {
            this.numeric = false;
            this.categorical = true;
        }

        if (this.name === undefined) {
            this.name = this.id;
        }

        if (this.options === undefined) {
            this.options = {};
        }

        if (this.options.width !== undefined && this.width === undefined) {
            this.width = this.options.width;
        }
        if (this.options.palette !== undefined && this.palette === undefined) {
            this.palette = this.options.palette;
        }

        if (this.geom === undefined) {
            if (type === 'number') {
                this.geom = 'funkyrect';
            } else {
                this.geom = 'text';
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

        if (this.width === undefined) {
            if (this.geom === 'bar') {
                this.width = 4;
            }
        }

        if (this.geom === 'image' && this.width === undefined) {
            throw `Please, specify width for column with geom=image`;
        }

        this.sortState = null;
    }

    maybeCalculateStats(scaleColumn) {
        let extent = [0, 1];
        if (scaleColumn) {
            extent = d3.extent(this.data);
        }
        [this.min, this.max] = extent;
        this.range = this.max - this.min;
        this.scale = d3.scaleLinear().domain(extent);
        if (this.colorByRank) {
            this.rankedData = d3.rank(this.data);
            this.colorScale = d3.scaleLinear().domain([0, this.data.length - 1]);
        }
    }

    /**
     * Get value for coloring the item.
     *
     * @param {Object} item - data item with our column
     * @param {number} itemPos - data item position in the dataframe. Needed for getting the rank
     *   with ties.
     * @returns
     */
    getColorValue(item, itemPos) {
        if (this.id_color !== undefined) {
            return item[this.id_color];
        }
        if (this.colorByRank) {
            return this.rankedData[itemPos];
        }
        return item[this.id];
    }

    sort() {
        if (this.sortState === "desc") {
            this.sortState = "asc";
            return d3.ascending;
        }
        this.sortState = "desc";
        return d3.descending;
    }
}

/**
 * Assemble all column information needed for drawing
 *
 * @param {RowData} data - dataset
 * @param {module:columns~ColumnInfo[]} columnInfo - properties of the columns for drawing, which
 *   will by modified in place
 * @param {boolean} scaleColumn - whether to min-max scale data for column, default for all columns
 * @param {boolean} colorByRank - whether to color by rank instead of by value, default for all
 *   columns
 */
export function buildColumnInfo(data, columnInfo, scaleColumn, colorByRank) {
    const colData = rowToColData(data);
    if (columnInfo === undefined || columnInfo.length === 0) {
        console.info("No column info specified, assuming all columns are to be displayed.");
        columnInfo = Object.getOwnPropertyNames(colData).map(id => {
            return {id: id}
        });
    }
    if (colorByRank) {
        columnInfo.forEach(info => {
            info.colorByRank === undefined && (info.colorByRank = true);
        });
    }
    return columnInfo.map(info => {
        let column = info.id;
        if (column === undefined) {
            throw "Column info must have id field corresponding to the column in the data";
        }
        column = new Column(info, colData[column]);
        column.maybeCalculateStats(scaleColumn);
        return column;
    });
};

/**
 * Check and prepare column group information
 *
 * @param {Object[]} columnGroups - information about column groups, empty array if not specified
 * @param {Object[]} columnInfo - information about columns, to crosscheck
 * @returns {Object[]} - column groups with defaults filled in, if necessary
 */
export function buildColumnGroups(columnGroups, columnInfo) {
    if (columnGroups.length === 0 && columnInfo.some(i => i.group)) {
        console.info("No column groups specified, but some columns have group, building automatically");
        columnGroups = columnInfo
            .filter(i => i.group)
            .map(i => i.group);
        columnGroups = [...new Set(columnGroups)];
        columnGroups = columnGroups.map(group => {
            return {group: group}
        });
    }
    if (columnGroups.length === 0) {
        return [];
    }
    columnInfo.forEach(i => {
        if (i.group && !columnGroups.some(g => g.group === i.group)) {
            throw `Column group ${i.group} is not specified in columnGroups`;
        }
    });
    let allGroups = columnInfo.filter(i => i.group).map(i => i.group);
    let unused = columnGroups.filter(i => !allGroups.includes(i.group));
    if (unused.length > 0) {
        console.warn(`Unused column groups: ${unused.map(i => i.group).join(', ')}`);
    }

    if (columnGroups[0].palette === undefined) {
        console.info("Column groups did not specify `palette`. Assuming no colours")
        columnGroups.forEach(i => {
            i.palette = 'none';
        });
    }
    columnGroups.forEach(i => {
        if (i.palette === undefined) {
            throw `Column group ${i.group} did not specify palette`;
        }
    });

    if (columnGroups[0].level1 === undefined) {
        console.info("Column groups did not specify `level1`. Using group id as level1")
        columnGroups.forEach(i => {
            i.level1 = i.group.charAt(0).toUpperCase() + i.group.slice(1);
        });
    }

    return columnGroups;
};

/**
 * Test if a value is a number, including strings that can be coerced to a number.
 *
 * @param {*} str - value to test
 * @returns {boolean} - if the values is a number
 */
function isNumeric(str) {
    if (typeof str === 'number') return true;
    if (typeof str !== 'string') return false;
    // use type coercion to parse the _entirety_ of the string
    // (`parseFloat` alone does not do this)...
    return !Number.isNaN(str)
        && !Number.isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}

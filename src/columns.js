/** @module  */

import * as d3 from 'd3';
import _ from 'lodash';

import { rowToColData } from './input_util';

/**
 * @typedef {Object} ColumnInfo
 * @description Information about a dataframe column and how to display it.
 * @property {string} id - column id in the dataset. _Required_
 * @property {string} name - name of the column to display above the column
 * @property {string} group - name of the group the column belongs to
 * @property {string} geom - type of visualization to display the column data. Default is
 *   `funkyrect` for numerical data, and `text` for categorical data. See {@link module:geoms|geoms}
 *   for available options
 * @property {string} palette - name of the palette to use for coloring the column. Must be defined
 *   in {@link module:palettes~PaletteMapping|PaletteMapping} or be a default palette
 *   (see {@link module:palettes~defaultPalettes|defaultPalettes})
 * @property {string} id_size - id of the column that will determine the size for display
 * @property {string} id_color - id of the column that will determine the color for display
 * @property {boolean} colorByRank - whether to color by rank per column instead of by value
 * @property {boolean} scaleColumn - whether to scale the column data to `[0, 1]`
 * @property {string} label - id of the column that has the values to display as labels over
 *   the geoms
 * @property {string} id_label - synonym for `label`
 * @property {string} id_hover_text - id of the column that has the values to display as hover text
 * @property {number} width - width of the column, only used for `bar` and `image` geoms
 * @property {Object} options - additional options for the column
 * @property {string} options.palette - synonym for `palette`
 * @property {number} options.width - synonym for `width`
 * @property {boolean} options.drawGuide - whether to draw a guide at maximum for the bar geom
 *   column
 * @property {boolean} options.draw_outline - synonym for `options.drawGuide`
 * @property {('left'|'center'|'right')} options.align - alignment of the text for `text` geom
 * @property {number} options.fontSize - font size for the `text` geom
 */

/**
 * @typedef {Object} ColumnGroup
 * @description Information about a group of columns for display. Creating multiple levels of groups
 *   is possible by specifying `level1`, `level2`, etc. with increasing numbers. The columns are not
 *   sorted by <em class="pname">funkyheatmapjs</em>, so the columns should have the groups on the
 *   adjacent positions.
 * @property {string} group - name of the group, must correspond to the `group` field in
 *   {@link module:columns~ColumnInfo|ColumnInfo}
 * @property {string} level1 - name of the first level of the grouping. If not specified, derived
 *   from the `group` field
 * @property {string} level2 - name of the second level of the grouping, if necessary
 * @property {string} level… - further levels of the grouping are possible
 * @property {string} palette - name of the palette to use for coloring the background of the group,
 *   the middle of the palette is used
 */

/**
 * @class
 * @property {string} id - column id in the dataset
 * @property {boolean} numeric - whether the column is numeric, computed from the data.
 *   See {@link module:columns~isNumeric|isNumeric} for details.
 * @property {boolean} categorical - whether the column is categorical, computed from the data
 * @property {string} name - name of the column to display above the column
 * @property {string} group - name of the group the column belongs to
 * @property {string} id_size - id of the column that will determine the size for display
 * @property {string} id_color - id of the column that will determine the color for display
 * @property {boolean} colorByRank - whether to color by rank per column instead of by value
 * @property {boolean} scaleColumn - whether to scale the column data to `[0, 1]`
 * @property {string} label - id of the column that has the values to display as labels over the
 *   geoms
 * @property {string} id_hover_text - id of the column that has the values to display as hover text
 * @property {string} geom - type of the geom to display
 */
export class Column {
    /**
     * Initialize a column with checks, defaults, and stats calculation.
     *
     * @param {module:columns~ColumnInfo} info - column configuration
     * @param {Array} data - array of data for the column
     * @param {string[]} columnNames - names of the columns in the dataset, to do cross-checks
     */
    constructor(info, data, columnNames) {
        ({
            id: this.id,
            name: this.name,
            group: this.group,
            id_size: this.id_size,
            id_color: this.id_color,
            colorByRank: this.colorByRank,
            scaleColumn: this.scaleColumn,
            label: this.label,
            id_hover_text: this.id_hover_text,
            geom: this.geom,
            palette: this.palette,
            width: this.width,
            options: this.options
        } = info);
        this.data = data;

        // defaults
        this.colorByRank = this.colorByRank || false;
        this.label = this.label || info.id_label;

        const value = data[0];
        // geoms text and pie are always categorical
        if (isNumeric(value) && this.geom !== 'text' && this.geom !== 'pie') {
            this.numeric = true;
            this.categorical = false;
        } else {
            this.numeric = false;
            this.categorical = true;
            // disable numerical options for categorical data
            this.colorByRank = false;
            this.scaleColumn = false;
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
            if (this.numeric) {
                this.geom = 'funkyrect';
            } else {
                this.geom = 'text';
            }
        }

        if (this.palette === undefined) {
            if (this.geom === 'pie') {
                this.palette = 'categorical';
            }
            if (this.geom === 'text') {
                this.palette = 'none';
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
        if (this.geom === 'bar' && this.options.draw_outline !== undefined) {
            this.options.drawGuide = this.options.draw_outline;
        }

        if (this.label !== undefined && !columnNames.includes(this.label)) {
            throw `Column ${this.id} has label=${this.label}, which is not in the data`;
        }
        if (this.id_color !== undefined && !columnNames.includes(this.id_color)) {
            throw `Column ${this.id} has id_color=${this.id_color}, which is not in the data`;
        }
        if (this.id_size !== undefined && !columnNames.includes(this.id_size)) {
            throw `Column ${this.id} has id_size=${this.id_size}, which is not in the data`;
        }
        if (this.id_hover_text !== undefined && !columnNames.includes(this.id_hover_text)) {
            throw (
                `Column ${this.id} has id_hover_text=${this.id_hover_text},`
                + ` which is not in the data`
            );
        }

        this.sortState = null;
        if (this.numeric) {
            this.maybeCalculateStats();
        }
    }

    maybeCalculateStats() {
        this.data = this.data.map(d => +d);

        let extent = [0, 1];
        if (this.scaleColumn) {
            extent = d3.extent(this.data);
        }
        [this.min, this.max] = extent;
        this.range = this.max - this.min;
        this.scale = d3.scaleLinear().domain(extent);
        if (this.colorByRank) {
            this.rankedData = d3.rank(this.data);
            // In case there are ties, d3 will return ranks like [0, 0, 2] skipping rank 1.
            // So we renormalize the ranks from [0, 2] to [0, 1], and map the colors to the number
            // of unique ranks only. Otherwise we allocate 3 colors for [0, 0, 2] data, and the
            // display colors won't fully map the palette.
            const uniqueRanks = _.uniq(this.rankedData);
            const rankedRanks = d3.rank(uniqueRanks);
            this.normalizedRanks = _.zipObject(uniqueRanks, rankedRanks);
            this.colorScale = d3.scaleLinear().domain([0, uniqueRanks.length - 1]);
        }
    }

    /**
     * Get value for the item, which is size for numeric or display for text/pie.
     *
     * @param {Object} item - data item with our column
     * @returns {number|string|number[]} - value for sizing or displaying the item
     */
    getValue(item) {
        if (this.id_size !== undefined) {
            return item[this.id_size];
        }
        if (this.numeric) {
            return +item[this.id];
        }
        return item[this.id];
    }

    /**
     * Get value for coloring the item.
     *
     * @param {Object} item - data item with our column
     * @param {number} itemPos - data item position in the dataframe. Needed for getting the rank
     *   with ties.
     * @returns {number|string} - value for coloring the item
     */
    getColorValue(item, itemPos) {
        if (this.id_color !== undefined) {
            return item[this.id_color];
        }
        if (this.colorByRank) {
            const rank = this.rankedData[itemPos];
            const normalizedRank = this.normalizedRanks[rank];
            return normalizedRank;
        }
        return item[this.id];
    }

    /**
     * Get text to display in a tooltip over the geom when mouse hovers it.
     *
     * @param {Object} item - data item with our column
     * @param {number} floatPrecision - number of decimal places to display for float values
     * @returns {string} - text to display in tooltip when mouse hovers the geom
     */
    getHoverText(item, floatPrecision) {
        if (['text', 'image'].includes(this.geom) && this.id_hover_text === undefined) {
            return;
        }
        let value = item[this.id];
        if (this.id_hover_text !== undefined) {
            value = item[this.id_hover_text];
        }
        if (this.numeric) {
            value = +value;
        }
        if (_.isNumber(value) && !_.isInteger(value)) {
            return value.toFixed(floatPrecision);
        }
        return `${value}`;
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
export function createColumns(data, columnInfo, scaleColumn, colorByRank) {
    const colData = rowToColData(data);
    const columnNames = Object.getOwnPropertyNames(colData);
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
    if (scaleColumn) {
        columnInfo.forEach(info => {
            info.scaleColumn === undefined && (info.scaleColumn = true);
        });
    }
    return columnInfo.map(info => {
        let column = info.id;
        if (column === undefined) {
            throw "Column info must have id field corresponding to the column in the data";
        }
        return new Column(info, colData[column], columnNames);
    });
};

/**
 * Check and prepare column group information
 *
 * @param {ColumnGroup[]} columnGroups - information about column groups, empty array if not
 *   specified
 * @param {Column[]} columnInfo - information about columns, to crosscheck
 * @returns {ColumnGroup[]} - column groups with defaults filled in, if necessary
 */
export function buildColumnGroups(columnGroups, columnInfo) {
    if (columnGroups.length === 0 && columnInfo.some(i => i.group)) {
        console.info(
            "No column groups specified, but some columns have group, building automatically"
        );
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

    columnGroups.forEach(i => {
        if (i.palette === undefined) {
            i.palette = 'none';
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
 * @returns {boolean} - if the value is a number
 */
function isNumeric(str) {
    if (typeof str === 'number') return true;
    if (typeof str !== 'string') return false;
    // use type coercion to parse the _entirety_ of the string
    // (`parseFloat` alone does not do this)...
    return !Number.isNaN(str)
        && !Number.isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}

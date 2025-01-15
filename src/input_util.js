/** @module */

/**
 * Converts object-based dataframe to array-based dataframe.
 *
 * @param {Object} data - an object with each property representing dataframe column as an array.
 *   Columns are of the same length
 * @returns {Object[]} - array of objects with properties corresponding to columns
 */
export function convertDataframe(data) {
    const columns = Object.getOwnPropertyNames(data);
    const size = data[columns[0]].length;
    const result = [];
    for (let i = 0; i < size; i++) {
        let item = {};
        for (let column of columns) {
            item[column] = data[column][i];
        }
        result.push(item);
    }
    return result;
};

/**
 * Convenience function to convert potential column-based dataframes to row-based dataframes.
 *
 * @param  {Object[]} objects - potential objects to convert to row-based dataframes. Only converts
 *   objects, skips arrays
 * @returns {Object[]} - array of converted objects
 */
export function maybeConvertDataframe(...objects) {
    return objects.map(obj => {
        if (obj && !Array.isArray(obj)) {
            obj = convertDataframe(obj);
        }
        return obj;
    });
};

/**
 * Converts array-based dataframe to object-based dataframe.
 *
 * @param {Object[]} data - an array of objects with properties
 * @returns {Object} - object with each property representing dataframe column as an array,
 *   values are preserved in the same order as in the input array
 */
export function convertToDataframe(data) {
    const result = {};
    const columns = Object.getOwnPropertyNames(data[0]);
    for (let column of columns) {
        result[column] = data.map(item => item[column]);
    }
    return result;
}

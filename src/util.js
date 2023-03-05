
/**
 * Converts object-based dataframe to array-based dataframe
 *
 * @param {Object} data - an object with each property representing
 *      dataframe column as array of equal length
 * @returns {Object[]} - array of objects with same properties
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

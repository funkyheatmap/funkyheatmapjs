import assert from 'node:assert/strict';
import { colToRowData, rowToColData } from '../src/input_util';


describe('Convert column-based (object) dataframe to row-based (array)', function() {
    it('should convert object to array', function() {
        const data = {a: [1, 2, 3], b: [4, 5, 6]};
        const result = colToRowData(data);
        assert(Array.isArray(result));
        assert.equal(result.length, data.a.length);
    });
});

describe('Convert row-based (array) dataframe to column-based (object)', function() {
    it('should convert array to object', function() {
        const data = [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}];
        const result = rowToColData(data);
        assert(!Array.isArray(result));
        assert.equal(result.a.length, data.length);
    });
});

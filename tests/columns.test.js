import assert from 'node:assert/strict';
import { buildColumnInfo } from '../src/columns';

describe('funkyheatmap', function() {
    it('should work with just data parameter', function() {
        const data = [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}];
        const result = buildColumnInfo(data);
        assert.equal(result.length, 2);
        assert.equal(result[0].id, 'a');
    });
});

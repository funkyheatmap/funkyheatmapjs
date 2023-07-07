import assert from 'node:assert/strict';
import { convertDataframe } from '../src/input_util';


describe('Convert dataframe util', function() {
    it('should convert object to array', function() {
        const data = {a: [1, 2, 3], b: [4, 5, 6]};
        const result = convertDataframe(data);
        assert(Array.isArray(result));
        assert.equal(result.length, data.a.length);
    });
});

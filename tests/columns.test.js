import assert from 'node:assert/strict';
import { buildColumnInfo, Column } from '../src/columns';

describe('buildColumnInfo', function() {
    it('should work with just data parameter', function() {
        const data = [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}];
        const result = buildColumnInfo(data);
        assert.equal(result.length, 2);
        assert.equal(result[0].id, 'a');
    });

    it('should raise when column id is not specified', function() {
        const data = [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}];
        assert.throws(() => buildColumnInfo(data, [{name: 'a'}]));
    });

    it('should create columns with data', function() {
        const data = [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}];
        const result = buildColumnInfo(data);
        assert.equal(result.length, 2);
        assert.equal(result[0].numeric, true);
        assert.equal(result[0].data.length, 3);
        assert.equal(result[1].numeric, true);
        assert.equal(result[1].data.length, 3);
        assert.equal(result[0].data[0], 1);
        assert.equal(result[1].data[0], 4);
    });

    it('should pass colorByRank to all columns, but with overrides', function() {
        const data = [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}];
        const result = buildColumnInfo(data, [{id: 'a'}, {id: 'b', colorByRank: false}], true, true);
        assert.equal(result[0].colorByRank, true);
        assert.equal(result[1].colorByRank, false);
    });

    it('should pass scaleColumn to all columns, but with overrides', function() {
        const data = [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}];
        const result = buildColumnInfo(data, [{id: 'a'}, {id: 'b', scaleColumn: false}], true, true);
        assert.equal(result[0].scaleColumn, true);
        assert.equal(result[1].scaleColumn, false);
    });
});

describe('column class', function() {
    it('should be constructed with column info and data array', function() {
        const info = {id: 'a'};
        const data = [1, 2, 3];
        const column = new Column(info, data);
        assert.equal(column.id, 'a');
        assert.equal(column.numeric, true);
        assert.equal(column.data.length, 3);
        assert.equal(column.colorByRank, false);
    });
    it('should return colorValue simple', function() {
        const info = {id: 'a'};
        const data = [1, 2, 3];
        const column = new Column(info, data);
        assert.equal(column.getColorValue({'a': 2}), 2);
    });
    it('should return colorValue with colorByRank', function() {
        const info = {id: 'a', colorByRank: true};
        const data = [5, 2, 1];
        const column = new Column(info, data);
        assert.equal(column.getColorValue({'a': 5}, 0), 2);
        assert.equal(column.getColorValue({'a': 2}, 1), 1);
        assert.equal(column.getColorValue({'a': 1}, 2), 0);
    });
    it('should return colorValue with colorByRank with ties', function() {
        const info = {id: 'a', colorByRank: true};
        const data = [1, 1, 2];
        const column = new Column(info, data);
        assert.equal(column.getColorValue({'a': 1}, 0), 0);
        assert.equal(column.getColorValue({'a': 2}, 2), 1);
    });
    it('should return colorValue with id_color option', function() {
        const info = {id: 'a', id_color: 'b'};
        const data = [5, 2, 1];
        const column = new Column(info, data, ['a', 'b']);
        assert.equal(column.getColorValue({'a': 5, 'b': 10}, 0), 10);
    });
    it('should not have numerical transformation options for categorical data', function() {
        let info = {id: 'a', geom: 'text'};
        const data = [[5, 1], [2, 3], [1, 2]];
        let column = new Column(info, data);
        assert.equal(column.colorByRank, false);
        assert.equal(column.scaleColumn, false);

        info = {id: 'a', geom: 'pie'};
        column = new Column(info, data);
        assert.equal(column.colorByRank, false);
        assert.equal(column.scaleColumn, false);
    });
    it('should treat boolean columns as text', function() {
        const info = {id: 'a'};
        const data = [true, false, true];
        const column = new Column(info, data);
        assert.equal(column.numeric, false);
        assert.equal(column.geom, 'text');
    });
    it('should raise when id_color refers to non-existing column', function() {
        const info = {id: 'a', id_color: 'b'};
        const data = [5, 2, 1];
        assert.throws(() => new Column(info, data, ['a']));
    });
    it('should raise when id_size refers to non-existing column', function() {
        const info = {id: 'a', id_size: 'b'};
        const data = [5, 2, 1];
        assert.throws(() => new Column(info, data, ['a']));
    });
    it('should raise when label refers to non-existing column', function() {
        const info = {id: 'a', label: 'b'};
        const data = [5, 2, 1];
        assert.throws(() => new Column(info, data, ['a']));
    });
    it('should raise when id_label refers to non-existing column', function() {
        const info = {id: 'a', id_label: 'b'};
        const data = [5, 2, 1];
        assert.throws(() => new Column(info, data, ['a']));
    });
});

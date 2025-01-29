/** @module */

import * as _ from 'lodash';

/**
 * @typedef {Object} LegendInfo
 * @description Legend configuration
 * @property {string} title - title of the legend, defaults to palette name
 * @property {string} palette - name of the palette to use
 * @property {string} geom - type of geom to use for legend. If absent, will be copied from the
 *   first column info with the same palette
 * @property {string[]} labels - labels for the legend. _Required_ for `text` and `image` geoms.
 *   For `image` geom is a list of captions for the images. For `text` geom is a list of texts
 *   displayed on the left of the legend. For `pie` geom can be inferred from palette, if palette
 *   is specified as a {@link module:palettes~CustomPalette|CustomPalette}. For numeric geoms
 *   defaults to `['0', '', '0.2', '', '0.4', '', '0.6', '', '0.8', '', '1']`
 * @property {('left'|'center'|'right')} label_align - alignment of the labels. Defaults to `center`
 *   for `circle`, `rect` and `funkyrect` geoms
 * @property {number} label_hjust - numerical alias for `label_align`, converts `0, 0.5, 1` to
 *   `left, center, right`, complains about any other values
 * @property {number|number[]} size - size of the legend elements. _Required_ for `image` geom,
 *   will set the width of the image. For `circle` and `funkyrect` geoms defaults to increasing
 *   values from 0 to 1. For `rect` and `bar` geoms defaults to 1. Must be the same length as
 *   `labels`
 * @property {number|number[]} values - values for the legend elements. For numeric geoms represents
 *   color values for the legend elements. Must be the same length as `labels`. _Required_ for
 *   `image` and `text` geoms. For `image` geom is a list of image URLs. For `text` geom is a list
 *   of texts displayed on the right of the legend
 */

/**
 * Validate user-provided legend options and prepare legends for rendering. A legend is necessary
 * for each palette used in the visualization. If user have not provided legend configuration for
 * a palette that is used in {@link module:columns~ColumnInfo|ColumnInfo}, it will be added
 * automatically.
 *
 * @param {module:legends~LegendInfo[]} legends - user provided legend configuration
 * @param {module:palettes~PaletteMapping} palettes - mapping of names to palette colors
 * @param {module:columns.Column[]} columnInfo - user provided information on columns
 */
export function prepareLegends(legends, palettes, columnInfo) {
    if (legends.length === 0) {
        console.info('No legends provided, will infer automatically');
        legends = [];
    }

    const colInfoPalettes = [];
    columnInfo.forEach(i => {
        if (i.palette && colInfoPalettes.indexOf(i.palette) === -1) {
            colInfoPalettes.push(i.palette);
        }
    });
    const legendPalettes = [];
    legends.forEach(l => {
        if (l.palette && legendPalettes.indexOf(l.palette) === -1) {
            legendPalettes.push(l.palette);
        }
    });

    const missingPalettes = _.difference(colInfoPalettes, legendPalettes);
    if (missingPalettes.length > 0) {
        let msg = 'These palettes are missing in legends, adding legends for them: ';
        msg += missingPalettes.join(', ');
        console.info(msg);
        missingPalettes.forEach(p => {
            legends.push({
                title: p,
                palette: p,
                enabled: true,
            });
        });
    }

    legends.forEach(legend => {
        if (legend.enabled === undefined) {
            legend.enabled = true;
        }
        if (legend.title === undefined) {
            legend.title = legend.palette;
        }
        if (legend.geom === undefined) {
            console.info(`Legend \`${legend.title}\` did not specify geom, copying from column info`);
            const col = columnInfo.find(i => i.palette === legend.palette);
            legend.geom = col.geom;
        }
        if (legend.labels === undefined) {
            console.info(`Legend \`${legend.title}\` did not specify labels, inferring from column info`);
            if (legend.geom === 'pie') {
                const pal = palettes[legend.palette];
                if (pal.names === undefined) {
                    console.warn(`Cannot infer labels for legend \`${legend.title}\`, please provide color names in palette. Disabling this legend`);
                    legend.enabled = false;
                }
                legend.labels = palettes[legend.palette].names;
            } else if (['circle', 'rect', 'funkyrect', 'bar'].includes(legend.geom)) {
                // TODO: get from default options
                legend.labels = ['0', '', '0.2', '', '0.4', '', '0.6', '', '0.8', '', '1'];
            } else if (legend.geom === 'text' || legend.geom === 'image') {
                console.warn(`Cannot infer labels for legend \`${legend.title}\` of type ${legend.geom}, please provide labels. Disabling this legend`);
                legend.enabled = false;
            }
        }
        if (legend.label_hjust !== undefined) {
            if (legend.label_hjust === 0) {
                legend.label_align = 'left';
                console.info(`Converting label_hjust=0 to label_align=left for legend \`${legend.title}\``);
            } else if (legend.label_hjust === 1) {
                legend.label_align = 'right';
                console.info(`Converting label_hjust=1 to label_align=right for legend \`${legend.title}\``);
            } else if (legend.label_hjust === 0.5) {
                legend.label_align = 'center';
                console.info(`Converting label_hjust=0.5 to label_align=center for legend \`${legend.title}\``);
            } else {
                console.warn(`Unsupported value for label_hjust: ${legend.label_hjust} for legend \`${legend.title}\`, ignoring. Only 0, 0.5, 1 are supported`);
            }
        }
        if (legend.label_align === undefined) {
            if (['circle', 'rect', 'funkyrect'].includes(legend.geom)) {
                legend.label_align = 'center';
            }
        }
        if (!['left', 'right', 'center'].includes(legend.label_align)) {
            legend.label_align = 'center';
            console.warn(`Unsupported value for label_align: ${legend.label_align} for legend \`${legend.title}\`, ignoring. Only left, center, right are supported`);
        }
        if (legend.size === undefined) {
            console.info(`Legend \`${legend.title}\` did not specify size, inferring from column info`);
            if (legend.geom === 'circle' || legend.geom === 'funkyrect') {
                legend.size = [...d3.range(0, legend.labels.length - 1).map(
                    (i) => i / (legend.labels.length - 1)
                ), 1];
            } else if (legend.geom === 'rect' || legend.geom === 'bar') {
                legend.size = 1;
            } else if (legend.geom === 'image') {
                throw `Please specify size (width) for image legend \`${legend.title}\``;
            }
        }
        if (legend.values === undefined) {
            if (['circle', 'rect', 'funkyrect', 'bar'].includes(legend.geom)) {
                legend.values = [...d3.range(0, legend.labels.length - 1).map(
                    (i) => i / (legend.labels.length - 1)
                ), 1];
            }
            if (legend.enabled && (legend.geom === 'image' || legend.geom === 'text')) {
                console.warn(`Cannot infer values for legend \`${legend.title}\` of type ${legend.geom}, please provide values. Disabling this legend`);
                legend.enabled = false;
            }
        }
        if (_.isNumber(legend.size)) {
            legend.size = Array(legend.labels.length).fill(legend.size);
        }
        // TODO: make legend class descend from Column
        if (['circle', 'rect', 'funkyrect', 'bar'].includes(legend.geom)) {
            legend.numeric = true;
            let extent = [0, 1];
            [legend.min, legend.max] = extent;
            legend.range = legend.max - legend.min;
            legend.scale = d3.scaleLinear().domain(extent);
        }
    });
    return legends;
}

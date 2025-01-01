import * as _ from 'lodash';

/**
 *
 * @param {Object[]|undefined} legends - user provided legend configuration
 * @param {Object} palettes - mapping of names to palette colors
 * @param {Object[]} columnInfo - user provided information on columns
 */
export function prepareLegends(legends, palettes, columnInfo) {
    if (legends === undefined) {
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
            console.info(`Legend ${legend.title} did not specify geom, copying from column info`);
            const col = columnInfo.find(i => i.palette === legend.palette);
            legend.geom = col.geom;
        }
        if (legend.labels === undefined) {
            console.info(`Legend ${legend.title} did not specify labels, inferring from column info`);
            if (legend.geom === 'pie') {
                const pal = palettes[legend.palette];
                if (pal.names === undefined) {
                    console.warn(`Cannot infer legend labels for ${legend.title}, please provide color names in palette. Disabling this legend`);
                    legend.enabled = false;
                }
                legend.labels = palettes[legend.palette].names;
            } else if (['circle', 'rect', 'funkyrect', 'bar'].includes(legend.geom)) {
                // TODO: get from default options
                legend.labels = ['0', '', '0.2', '', '0.4', '', '0.6', '', '0.8', '', '1'];
            } else if (legend.geom === 'text' || legend.geom === 'image') {
                console.warn(`Cannot infer legend labels for ${legend.title} of type ${legend.geom}, please provide labels. Disabling this legend`);
                legend.enabled = false;
            }
        }
        if (legend.size === undefined) {
            console.info(`Legend ${legend.title} did not specify size, inferring from column info`);
            if (legend.geom === 'circle' || legend.geom === 'funkyrect') {
                legend.size = [...d3.range(0, legend.labels.length - 1).map(
                    (i) => i / (legend.labels.length - 1)
                ), 1];
            } else if (legend.geom === 'rect' || legend.geom === 'bar') {
                legend.size = 1;
            } else if (legend.geom === 'image') {
                throw `Please specify size (width) for image legend ${legend.title}`;
            }
        }
        if (legend.values === undefined) {
            if (['circle', 'rect', 'funkyrect', 'bar'].includes(legend.geom)) {
                legend.values = [...d3.range(0, legend.labels.length - 1).map(
                    (i) => i / (legend.labels.length - 1)
                ), 1];
            }
        }
        if (_.isNumber(legend.size)) {
            legend.size = Array(legend.labels.length).fill(legend.size);
        }
    });
    return legends;
}

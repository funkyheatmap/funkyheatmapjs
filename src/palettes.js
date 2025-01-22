/** @module */

import * as d3 from 'd3';

/**
 * @typedef {Object} CustomPalette
 * @property {string[]} colors - list of colors
 * @property {string[]} names - list of names for the colors, in the same order
 * @description A custom palette specification. This is important for categorical data: the names
 *   are used as labels in the legend for `pie` geom, for `text` geom the values are mapped to
 *   colors based on the names.
 */

/**
 * @typedef {string|string[]|module:palettes~CustomPalette} Palette
 * @description A palette specification.
 */

/**
 * @typedef {Object.<string, module:palettes~Palette>} PaletteMapping
 * @description Mapping of names to palette colors. For palette colors the possible options are:
 *   - name of a built-in palette (e.g. `Blues`, `Set1`, etc.). See
 *   {@link module:palettes~defaultPalettes|defaultPalettes}
 *   - `Array.<string>` of custom colors as strings
 *   - {@link module:palettes~CustomPalette|CustomPalette} array of named colors, important for
 *   categorical data
 */

/**
 * Default palettes for numerical and categorical data. See source for the colors.
 * @constant {Object}
 * @property {Object} numerical - palettes for numerical data. Default is `Blues`. See
 *   {@link module:palettes~numerical|numerical}
 * @property {Object} categorical - palettes for categorical data. Default is `Set1`. See
 *   {@link module:palettes~categorical|categorical}
 */
const defaultPalettes = {
    numerical:
    /**
     * @member numerical
     * @abstract
     * @description Palettes for numerical data. A property of
     *   `{@link module:palettes~defaultPalettes|defaultPalettes`}.
     * @property {string[]} Blues - <div class="inline-pal-preview" style="background: #011636"></div>
     *   <div class="inline-pal-preview" style="background: #08306B"></div>
     *   <div class="inline-pal-preview" style="background: #08519C"></div>
     *   <div class="inline-pal-preview" style="background: #2171B5"></div>
     *   <div class="inline-pal-preview" style="background: #4292C6"></div>
     *   <div class="inline-pal-preview" style="background: #6BAED6"></div>
     *   <div class="inline-pal-preview" style="background: #9ECAE1"></div>
     *   <div class="inline-pal-preview" style="background: #C6DBEF"></div>
     *   <div class="inline-pal-preview" style="background: #DEEBF7"></div>
     *   <div class="inline-pal-preview" style="background: #F7FBFF"></div>&nbsp;. Default for
     *   numerical data
     * @property {string[]} Greens - <div class="inline-pal-preview" style="background: #00250f"></div>
     *   <div class="inline-pal-preview" style="background: #00441B"></div>
     *   <div class="inline-pal-preview" style="background: #006D2C"></div>
     *   <div class="inline-pal-preview" style="background: #238B45"></div>
     *   <div class="inline-pal-preview" style="background: #41AB5D"></div>
     *   <div class="inline-pal-preview" style="background: #74C476"></div>
     *   <div class="inline-pal-preview" style="background: #A1D99B"></div>
     *   <div class="inline-pal-preview" style="background: #C7E9C0"></div>
     *   <div class="inline-pal-preview" style="background: #E5F5E0"></div>
     * @property {string[]} Greys - <div class="inline-pal-preview" style="background: #000000"></div>
     *   <div class="inline-pal-preview" style="background: #252525"></div>
     *   <div class="inline-pal-preview" style="background: #525252"></div>
     *   <div class="inline-pal-preview" style="background: #737373"></div>
     *   <div class="inline-pal-preview" style="background: #969696"></div>
     *   <div class="inline-pal-preview" style="background: #BDBDBD"></div>
     *   <div class="inline-pal-preview" style="background: #D9D9D9"></div>
     *   <div class="inline-pal-preview" style="background: #F0F0F0"></div>
     * @property {string[]} Reds - <div class="inline-pal-preview" style="background: #CB181D"></div>
     *   <div class="inline-pal-preview" style="background: #EF3B2C"></div>
     *   <div class="inline-pal-preview" style="background: #FB6A4A"></div>
     *   <div class="inline-pal-preview" style="background: #FC9272"></div>
     *   <div class="inline-pal-preview" style="background: #FCBBA1"></div>
     *   <div class="inline-pal-preview" style="background: #FEE0D2"></div>
     *   <div class="inline-pal-preview" style="background: #FFF5F0"></div>
     * @property {string[]} YlOrBr - <div class="inline-pal-preview" style="background: #EC7014"></div>
     *   <div class="inline-pal-preview" style="background: #FE9929"></div>
     *   <div class="inline-pal-preview" style="background: #FEC44F"></div>
     *   <div class="inline-pal-preview" style="background: #FEE391"></div>
     *   <div class="inline-pal-preview" style="background: #FFF7BC"></div>
     *   <div class="inline-pal-preview" style="background: #FFFFE5"></div>
     */
    {
        Blues: [
            "#011636", "#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF",
            "#DEEBF7", "#F7FBFF"
        ],
        Greens: [
            "#00250f", "#00441B", "#006D2C", "#238B45", "#41AB5D", "#74C476", "#A1D99B", "#C7E9C0",
            "#E5F5E0"
        ],
        Greys: [
            "#000000", "#252525", "#525252", "#737373", "#969696", "#BDBDBD", "#D9D9D9", "#F0F0F0"
        ],
        Reds: [
            "#CB181D", "#EF3B2C", "#FB6A4A", "#FC9272", "#FCBBA1", "#FEE0D2", "#FFF5F0"
        ],
        YlOrBr: [
            "#EC7014", "#FE9929", "#FEC44F", "#FEE391", "#FFF7BC", "#FFFFE5"
        ]
    },
    categorical:
    /**
     * @member categorical
     * @abstract
     * @description Palettes for categorical data. A property of
     *   `{@link module:palettes~defaultPalettes|defaultPalettes`}.
     * @property {string[]} Set1 - <div class="inline-pal-preview" style="background: #E41A1C"></div>
     *   <div class="inline-pal-preview" style="background: #377EB8"></div>
     *   <div class="inline-pal-preview" style="background: #4DAF4A"></div>
     *   <div class="inline-pal-preview" style="background: #984EA3"></div>
     *   <div class="inline-pal-preview" style="background: #FF7F00"></div>
     *   <div class="inline-pal-preview" style="background: #FFFF33"></div>
     *   <div class="inline-pal-preview" style="background: #A65628"></div>
     *   <div class="inline-pal-preview" style="background: #F781BF"></div>
     *   <div class="inline-pal-preview" style="background: #999999"></div>&nbsp;. Default for
     *   categorical data
     * @property {string[]} Set2 - <div class="inline-pal-preview" style="background: #66C2A5"></div>
     *   <div class="inline-pal-preview" style="background: #FC8D62"></div>
     *   <div class="inline-pal-preview" style="background: #8DA0CB"></div>
     *   <div class="inline-pal-preview" style="background: #E78AC3"></div>
     *   <div class="inline-pal-preview" style="background: #A6D854"></div>
     *   <div class="inline-pal-preview" style="background: #FFD92F"></div>
     *   <div class="inline-pal-preview" style="background: #E5C494"></div>
     *   <div class="inline-pal-preview" style="background: #B3B3B3"></div>
     * @property {string[]} Set3 - <div class="inline-pal-preview" style="background: #8DD3C7"></div>
     *   <div class="inline-pal-preview" style="background: #FFFFB3"></div>
     *   <div class="inline-pal-preview" style="background: #BEBADA"></div>
     *   <div class="inline-pal-preview" style="background: #FB8072"></div>
     *   <div class="inline-pal-preview" style="background: #80B1D3"></div>
     *   <div class="inline-pal-preview" style="background: #FDB462"></div>
     *   <div class="inline-pal-preview" style="background: #B3DE69"></div>
     *   <div class="inline-pal-preview" style="background: #FCCDE5"></div>
     *   <div class="inline-pal-preview" style="background: #D9D9D9"></div>
     *   <div class="inline-pal-preview" style="background: #BC80BD"></div>
     *   <div class="inline-pal-preview" style="background: #CCEBC5"></div>
     *   <div class="inline-pal-preview" style="background: #FFED6F"></div>
     * @property {string[]} Dark2 - <div class="inline-pal-preview" style="background: #1B9E77"></div>
     *   <div class="inline-pal-preview" style="background: #D95F02"></div>
     *   <div class="inline-pal-preview" style="background: #7570B3"></div>
     *   <div class="inline-pal-preview" style="background: #E7298A"></div>
     *   <div class="inline-pal-preview" style="background: #66A61E"></div>
     *   <div class="inline-pal-preview" style="background: #E6AB02"></div>
     *   <div class="inline-pal-preview" style="background: #A6761D"></div>
     *   <div class="inline-pal-preview" style="background: #666666"></div>
     */
    {
        Set1: [
            "#E41A1C","#377EB8","#4DAF4A","#984EA3","#FF7F00","#FFFF33","#A65628","#F781BF",
            "#999999"
        ],
        Set2: [
            "#66C2A5","#FC8D62","#8DA0CB","#E78AC3","#A6D854","#FFD92F","#E5C494","#B3B3B3"
        ],
        Set3: [
            "#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072", "#80B1D3", "#FDB462", "#B3DE69", "#FCCDE5",
            "#D9D9D9", "#BC80BD", "#CCEBC5", "#FFED6F"
        ],
        Dark2: [
            "#1B9E77","#D95F02","#7570B3","#E7298A","#66A61E","#E6AB02","#A6761D","#666666"
        ]
    }
};

/**
 *
 * @param {module:columns.Column[]} columnInfo - array of `Column` objects with information
 * @param {module:palettes~PaletteMapping} palettes - mapping of names to color palettes
 */
export function assignPalettes(columnInfo, palettes) {
    palettes = { numerical: "Blues", categorical: "Set1", ...palettes };
    columnInfo.forEach(column => {
        if (column.palette && column.palette != 'none') {
            column.paletteName = column.palette;
            let name = palettes[column.palette];
            if (name === undefined) { // fallback
                name = column.palette;
            }
            let colors;
            let colorNames;
            if (defaultPalettes.numerical[name]) {
                colors = defaultPalettes.numerical[name];
            } else if (defaultPalettes.categorical[name]) {
                colors = defaultPalettes.categorical[name];
            } else if (Array.isArray(name)) {
                const item = name[0];
                if (typeof item === 'string' || item instanceof String) {
                    colors = name;
                } else {
                    throw `Palette definition ${name} is not recognized. Expected are: array of colors, array of color-name pairs.`;
                }
            } else if (Array.isArray(name.colors) && Array.isArray(name.names)) {
                colors = name.colors;
                colorNames = name.names;
            } else {
                const names = [
                    ...Object.getOwnPropertyNames(defaultPalettes.numerical),
                    ...Object.getOwnPropertyNames(defaultPalettes.categorical)
                ];
                throw `Palette ${name} not defined. Use one of ${names.join(', ')}.`;
            }

            if (column.numeric) {
                let scale = column.scale;
                if (column.colorScale) {
                    scale = column.colorScale;
                }
                const [min, max] = scale.domain();
                const step = (max - min) / (colors.length - 1);
                const domain = [...d3.range(min, max, step), max];
                column.palette = d3.scaleLinear().domain(domain).range(colors);
            }
            // TODO: replace with categorical
            if (column.geom === 'pie' || column.geom === 'text') {
                let domain = colorNames;
                if (domain === undefined) {
                    domain = d3.range(colors.length);
                }
                column.palette = d3.scaleOrdinal().domain(domain).range(colors);
                column.palette.colors = colors;
                column.palette.colorNames = colorNames;
            }
        }
    });
};

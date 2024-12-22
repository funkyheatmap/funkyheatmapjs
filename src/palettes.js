import * as d3 from 'd3';


const defaultPalettes = {
    numerical: {
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
    categorical: {
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
 * @param {Object|Object[]} columnInfo - information about how the columns should be displayed
 * @param {Object} palettes - mapping of names to palette colors
 *      possible options for the palette colors are:
 *       * name of a built-in palette (e.g. Blues, Set1…)
 *       * `Array` of colors as strings
 *       * `Object` with keys `colors` and `names` - important for categorical data
 */
export function assignPalettes(columnInfo, palettes) {
    palettes = { numerical: "Blues", categorical: "Set1", ...palettes };
    columnInfo.forEach(column => {
        if (column.palette && column.palette != 'none') {
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
            if (column.geom === 'pie') {
                const domain = d3.range(colors.length);
                column.palette = d3.scaleOrdinal().domain(domain).range(colors);
                column.palette.colors = colors;
                column.palette.colorNames = colorNames;
            }
        }
    });
};

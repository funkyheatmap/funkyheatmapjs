import * as d3 from 'd3';

/*
 default_palettes <- list(
  numerical = list(
    "Blues" = RColorBrewer::brewer.pal(9, "Blues") %>% c("#011636") %>% rev %>% smear,
    "Reds" = RColorBrewer::brewer.pal(9, "Reds")[-8:-9] %>% rev %>% smear,
    "YlOrBr" = RColorBrewer::brewer.pal(9, "YlOrBr")[-7:-9] %>% rev %>% smear,
    "Greens" = RColorBrewer::brewer.pal(9, "Greens")[-1] %>% c("#00250f") %>% rev %>% smear,
    "Greys" = RColorBrewer::brewer.pal(9, "Greys")[-1] %>% rev %>% smear
  ),
  categorical = list(
    "Set3" = RColorBrewer::brewer.pal(12, "Set3"),
    "Set1" = RColorBrewer::brewer.pal(9, "Set1"),
    "Set2" = RColorBrewer::brewer.pal(8, "Set2"),
    "Dark2" = RColorBrewer::brewer.pal(8, "Dark2")
  )
)
 */

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

export function assignPalettes(columnInfo, palettes) {
    palettes = { numerical: "Blues", categorical: "Set1", ...palettes };
    columnInfo.forEach(column => {
        if (column.palette) {
            const name = palettes[column.palette];
            let colors;
            if (defaultPalettes.numerical[name]) {
                colors = defaultPalettes.numerical[name];
            } else if (defaultPalettes.categorical[name]) {
                colors = defaultPalettes.categorical[name];
            } else {
                const names = [
                    ...Object.getOwnPropertyNames(defaultPalettes.numerical),
                    ...Object.getOwnPropertyNames(defaultPalettes.categorical)
                ];
                throw `Palette ${name} not defined. Use one of ${names.join(', ')}.`;
            }

            if (column.numeric) {
                const step = column.range / colors.length;
                const domain = [...d3.range(column.min, column.max, step), column.max];
                column.palette = d3.scaleLinear().domain(domain).range(colors);
            }
        }
    });
};

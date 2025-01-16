import * as d3 from 'd3';

import funkyheatmap from '../src/main';
import { rowToColData } from '../src/input_util';

if (module.hot) {
    module.hot.accept(() => {
        window.location.reload();
    });
}

function prepareData(data) {
    const SCALING_LABELS = {
        'Unscaled': '–',
        'Scaled': '+'
    };
    const FEATURES_LABELS = {
        'Full': 'FULL',
        'HVG': 'HVG'
    };
    const OUTPUT_IMG = {
        'Features': 'matrix.png',
        'Embedding': 'embedding.png',
        'Graph': 'graph.png'
    };

    data.forEach((item, idx) => {
        item.id = (idx + 1).toString();
        item.scaling = SCALING_LABELS[item.scaling];
        item.features = FEATURES_LABELS[item.features];
        item.output_img = OUTPUT_IMG[item.output];
    });

    data = rowToColData(data);

    const RANKS = {
        'rank_pancreas': 'label_pancreas',
        'rank_lung_atlas': 'label_lung_atlas',
        'rank_immune_cell_hum': 'label_immune_cell_hum',
        'rank_immune_cell_hum_mou': 'label_immune_cell_hum_mou',
        'rank_mouse_brain': 'label_mouse_brain',
        'rank_simulations_1_1': 'label_simulations_1_1',
        'rank_simulations_2': 'label_simulations_2',
        'package_rank': 'package_label',
        'paper_rank': 'paper_label',
        'time_rank': 'time_label',
        'memory_rank': 'memory_label'
    };

    function labelTop3(vector) {
        // d3.rank behaves like R `rank` with `ties.method = "min"`
        let ranks = d3.rank(vector);
        return ranks.map(rank => {
            if (rank < 3) {
                return (rank + 1).toString();
            }
            return '';
        })
    }

    for (let [rank, label] of Object.entries(RANKS)) {
        data[label] = labelTop3(data[rank]);
        const [min, max] = d3.extent(data[rank]);
        data[rank] = data[rank].map(x => (-x + min) / (min - max));
    }

    return data;
}

const column_info = [
    {id: "id", name: "Rank", geom: "text", group: "Method", options: {align: "right"}},
    {id: "method", name: "Method", geom: "text", group: "Method", options: {hjust: 0}},
    {id: "output_img", name: "Output", geom: "image", group: "Method", options: {width: 20}},
    {id: "features", id_color: "features", name: "Features", geom: "text", group: "Method", options: {palette: "features"}},
    {id: "scaling", name: "Scaling", geom: "text", group: "Method", options: {fontSize: 18, align: "center"}},
    {id: "overall_pancreas", id_color: "rank_pancreas", name: "Pancreas", geom: "bar", group: "RNA", id_label: "label_pancreas", options: {palette: "blues", width: 1.5, draw_outline: false}},
    {id: "overall_lung_atlas", id_color: "rank_lung_atlas", name: "Lung", geom: "bar", group: "RNA", id_label: "label_lung_atlas", options: {palette: "blues", width: 1.5, draw_outline: false}},
    {id: "overall_immune_cell_hum", id_color: "rank_immune_cell_hum", name: "Immune (human)", geom: "bar", group: "RNA", id_label: "label_immune_cell_hum", options: {palette: "blues", width: 1.5, draw_outline: false}},
    {id: "overall_immune_cell_hum_mou", id_color: "rank_immune_cell_hum_mou", name: "Immune (human/mouse)", geom: "bar", group: "RNA", id_label: "label_immune_cell_hum_mou", options: {palette: "blues", width: 1.5, draw_outline: false}},
    {id: "overall_mouse_brain", id_color: "rank_mouse_brain", name: "Mouse brain", geom: "bar", group: "RNA", id_label: "label_mouse_brain", options: {palette: "blues", width: 1.5, draw_outline: false}},
    {id: "overall_simulations_1_1", id_color: "rank_simulations_1_1", name: "Sim 1", geom: "bar", group: "Simulations", id_label: "label_simulations_1_1", options: {palette: "greens", width: 1.5, draw_outline: false}},
    {id: "overall_simulations_2", id_color: "rank_simulations_2", name: "Sim 2", geom: "bar", group: "Simulations", id_label: "label_simulations_2", options: {palette: "greens", width: 1.5, draw_outline: false}},
    {id: "package_score", id_color: "package_rank", name: "Package", geom: "bar", group: "Usability", id_label: "package_label", options: {palette: "oranges", width: 1.5, draw_outline: false}},
    {id: "paper_score", id_color: "paper_rank", name: "Paper", geom: "bar", group: "Usability", id_label: "paper_label", options: {palette: "oranges", width: 1.5, draw_outline: false}},
    {id: "time_score", id_color: "time_rank", name: "Time", geom: "bar", group: "Scalability", id_label: "time_label", options: {palette: "greys", width: 1.5, draw_outline: false}},
    {id: "memory_score", id_color: "memory_rank", name: "Memory", geom: "bar", group: "Scalability", id_label: "memory_label", options: {palette: "greys", width: 1.5, draw_outline: false}}
];

const column_groups = [
    {level1: "Method", group: "Method", palette: "black"},
    {level1: "RNA", group: "RNA", palette: "blues"},
    {level1: "Simulations", group: "Simulations", palette: "greens"},
    {level1: "Usability", group: "Usability", palette: "oranges"},
    {level1: "Scalability", group: "Scalability", palette: "greys"}
];

const palettes = {
    features: {colors: ["#4c4c4c", "#006300"], names: ['FULL', 'HVG']},
    blues: "Blues",
    greens: "Greens",
    oranges: ["#7F2704", "#A63603", "#D94801", "#F16913", "#FD8D3C", "#FDAE6B", "#FDD0A2", "#FEE6CE", "#FFF5EB"],
    greys: "Greys",
    black: ["black", "black"]
};

const legends = [
    {
        title: "Scaling",
        geom: "text",
        values: ["Scaled", "Unscaled"],
        labels: ["+", "–"],
    },
    {
        title: "RNA rank",
        palette: "blues",
        geom: "rect",
        labels: ["20", "", "10", "", "1"],
        size: [1, 1, 1, 1, 1]
    },
    {
        title: "Simulations rank",
        palette: "greens",
        geom: "rect",
        labels: ["20", "", "10", "", "1"],
        size: [1, 1, 1, 1, 1]
    },
    {
        title: "Usability rank",
        palette: "oranges",
        geom: "rect",
        labels: ["20", "", "10", "", "1"],
        size: [1, 1, 1, 1, 1]
    },
    {
        title: "Scalability rank",
        palette: "greys",
        geom: "rect",
        labels: ["20", "", "10", "", "1"],
        size: [1, 1, 1, 1, 1]
    }
];

d3.csv('scib_summary.csv').then((data) => {
    data = prepareData(data);

    d3.select("#app").node().appendChild(funkyheatmap(
        data,
        column_info,
        undefined, // row info
        column_groups, // column_groups,
        undefined, // row groups
        palettes,
        legends, // legends
        {rowHeight: 28, expand_ymax: 20},
        {
            labelGroupsAbc: false,
            colorByRank: false
        },
        false // scaleColumn
    ));
});

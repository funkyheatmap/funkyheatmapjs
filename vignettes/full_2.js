import * as d3 from 'd3';

import funkyheatmap from '../src/main';

if (module.hot) {
    module.hot.accept(() => {
        window.location.reload();
    });
}

const column_info = [
    {id: "model", group: null, name: "Name", geom: "text", palette: null},
    {id: "mpg", group: "overall", name: "Miles / gallon", geom: "bar", palette: "palette1", options: {width: 4, legend: false}},
    {id: "cyl", group: "overall", name: "Number of cylinders", geom: "bar", palette: "palette2", options: {width: 4, legend: false}},
    {id: "disp", group: "group1", name: "Displacement (cu.in.)", geom: "funkyrect", palette: "palette1"},
    {id: "hp", group: "group1", name: "Gross horsepower", geom: "funkyrect", palette: "palette1"},
    {id: "drat", group: "group1", name: "Rear axle ratio", geom: "funkyrect", palette: "palette1"},
    {id: "wt", group: "group1", name: "Weight (1000 lbs)", geom: "funkyrect", palette: "palette1"},
    {id: "qsec", group: "group2", name: "1/4 mile time", geom: "circle", palette: "palette2"},
    {id: "vs", group: "group2", name: "Engine", geom: "circle", palette: "palette2"},
    {id: "am", group: "group2", name: "Transmission", geom: "circle", palette: "palette2"},
    {id: "gear", group: "group2", name: "# Forward gears", geom: "circle", palette: "palette2"},
    {id: "carb", group: "group2", name: "# Carburetors", geom: "circle", palette: "palette2"},
    {id: "schema", group: "group2", name: "Schema", geom: "image", width: 25},
    {id: "load", group: "group2", name: "Load", geom: "pie", palette: "load"}
];

const column_groups = [
    {level1: "Overall", group: "overall", palette: "overall"},
    {level1: "Group 1", group: "group1", palette: "palette1"},
    {level1: "Group 2", group: "group2", palette: "palette2"}
];

const palettes = {
    overall: "Greys",
    palette1: "Blues",
    palette2: "Reds",
    load: {
        colors: ["#82daf2", "#ba4e79", "#ffffff"],
        names: ['A', 'B', 'C']
    }
};

const legends = [
    {
        title: "Type",
        geom: "image",
        size: 25,
        labels: ['Electric', 'Gas'],
        values: ['electric.png', 'ice.png']
    },
    {
        title: "Oranges",
        palette: "palette2",
        geom: "circle"
    }
];

d3.csv('mtcars.csv').then((data) => {
    data = d3.sort(data, (a, b) => d3.ascending(+b.mpg, +a.mpg));
    data = data.slice(0, 20);
    data.forEach((d, i) => {
        d.schema = i % 2 ? "electric.png" : "ice.png";
        d.load = [(i % 3) / 6, ((i + 1) % 3) / 6, 0];
        d.load[2] = 1 - d.load[0] - d.load[1];
    });
    d3.select("#app").node().appendChild(funkyheatmap(
        data,
        column_info,
        undefined, // row info
        undefined, // column_groups,
        undefined, // row groups
        palettes,
        legends, // legends
        {rowHeight: 28, expand_ymax: 20},
        {
            labelGroupsAbc: true,
            colorByRank: true
        },
        true
    ));
});

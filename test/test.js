import * as d3 from 'd3';

import funkyheatmap from '../src/main';

if (module.hot) {
    module.hot.accept(() => {
        window.location.reload();
    });
}

d3.csv('mtcars.csv').then((data) => {
    const { columns } = data;
    data = d3.sort(data, (a, b) => d3.ascending(+b.mpg, +a.mpg));
    data = data.slice(0, 20);
    d3.select("#app").node().appendChild(funkyheatmap(data, columns));
});

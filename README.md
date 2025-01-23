# FunkyHeatmap.js
{funkyheatmap} allows generating heatmap-like visualisations for data frames.
Funky heatmaps can be fine-tuned by providing annotations of the columns and rows,
which allow assigning multiple palettes or geometries or grouping rows and columns together in
categories.

This is an interactive JavaScript adaptation of
[funkyheatmap](https://github.com/dynverse/funkyheatmap) R package to the browser with
[d3.js](https://d3js.org/).

## Installation
If you want to add <em class="pname">funkyheatmapjs</em> to your website, you can include `d3.js`,
`lodash` and `funkyheatmapjs` from [unpkg](https://unpkg.com) or other service serving npm packages.

```html
<script type="text/javascript" src="https://unpkg.com/d3@7"></script>
<script type="text/javascript" src="https://unpkg.com/lodash@4/lodash.min.js"></script>
<script type="module" src="https://unpkg.com/funkyheatmapjs"></script>
```

If you have an npm project, you can install npm package `funkyheatmapjs` with npm or yarn.

## Usage
<em class="pname">funkyheatmapjs</em> is meant to be used in browser, please see
[tutorials]{@tutorial simple} and [documentation]{@link funkyheatmap}.

If you want to use it with npm and have trouble, please
[open an issue](https://github.com/funkyheatmap/funkyheatmapjs/issues). An example build with
[parcel](https://parceljs.org/) can be found
[here](https://github.com/funkyheatmap/funkyheatmapjs/blob/main/package.json#L20).

## Contributing
Please, feel free to [open issues](https://github.com/funkyheatmap/funkyheatmapjs/issues) for
bugs, feature requests and questions, and
[submit pull requests](https://github.com/funkyheatmap/funkyheatmapjs/pulls).

`main` is the stable release branch. We use `dev` for development and planning future releases.
Please, open feature pull requests against `dev`. We use
[release-please](https://github.com/googleapis/release-please-action/) action to create a release
and update the Changelog after features are merged from `dev` to `main`. We use
[pr-preview-action](https://github.com/rossjrw/pr-preview-action) to preview features and docs
on github pages.

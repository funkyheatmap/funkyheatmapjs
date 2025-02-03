# Changelog

## 0.3.0 (2025-02-03)


### Features

* add label_align and hjust options to legend [#32](https://github.com/funkyheatmap/funkyheatmapjs/issues/32) ([345be84](https://github.com/funkyheatmap/funkyheatmapjs/commit/345be84b6f8b917fb166ffd41c390c89f03bd4de))
* add option for font size for text geom ([41ab3dd](https://github.com/funkyheatmap/funkyheatmapjs/commit/41ab3dd894c905d3ee71dd05d72a7807373eabc7))
* bar legend ([694c15c](https://github.com/funkyheatmap/funkyheatmapjs/commit/694c15cb3213b1b2a0d4a58ac5328ab6ecd552f3))
* circle legend ([39a716c](https://github.com/funkyheatmap/funkyheatmapjs/commit/39a716cf5e2bd3347179197504d1b8cc91823628))
* color by another column ([#28](https://github.com/funkyheatmap/funkyheatmapjs/issues/28)) ([275b248](https://github.com/funkyheatmap/funkyheatmapjs/commit/275b24802057d5da076f7c6a524d235faa0a1812))
* drop display of removed entries ([33786a9](https://github.com/funkyheatmap/funkyheatmapjs/commit/33786a9a8feead3e82ce833dfec833ce93920ba5))
* funkyrect legend ([2e216ba](https://github.com/funkyheatmap/funkyheatmapjs/commit/2e216ba4512871df5340146c2f0a9a549b68165a))
* honor align option for geom text ([3de75a7](https://github.com/funkyheatmap/funkyheatmapjs/commit/3de75a713fccacfa3a8ff925d264fd806dc823ff))
* image geom legend ([6a09b4c](https://github.com/funkyheatmap/funkyheatmapjs/commit/6a09b4cf02ee0d2dffdd5dcb38af2df4f3178471))
* multilevel column groups ([660849b](https://github.com/funkyheatmap/funkyheatmapjs/commit/660849b0dae2725536c9da1148cc1ed6aa92f9af))
* pie legend ([eca269c](https://github.com/funkyheatmap/funkyheatmapjs/commit/eca269cb4ccba4d6a560fc66be575ec0212727d8))
* positional options ([41b38ef](https://github.com/funkyheatmap/funkyheatmapjs/commit/41b38ef789e22c6d9d4a54561d3201fc7bffee96))
* positional options ([f8a2c06](https://github.com/funkyheatmap/funkyheatmapjs/commit/f8a2c063c09047529426f8c9a73d3f3c9a8c42e0))
* size by another column [#27](https://github.com/funkyheatmap/funkyheatmapjs/issues/27) ([575c79e](https://github.com/funkyheatmap/funkyheatmapjs/commit/575c79e95295a40243fce6216129933057355b23))
* text and rect legends ([fd91008](https://github.com/funkyheatmap/funkyheatmapjs/commit/fd91008e8db1ac185a767d6ec4fac7979b009acd))
* tooltip text from another column [#30](https://github.com/funkyheatmap/funkyheatmapjs/issues/30) ([#31](https://github.com/funkyheatmap/funkyheatmapjs/issues/31)) ([ced3dc9](https://github.com/funkyheatmap/funkyheatmapjs/commit/ced3dc9560ab4e913fbace0668fa9fcef6a7bf7e))


### Bug Fixes

* allow id_hover_text for text columns ([2c84fce](https://github.com/funkyheatmap/funkyheatmapjs/commit/2c84fce4f342527402045b3890f546bc72af50d5))
* allow more label text shrinkage ([97dd756](https://github.com/funkyheatmap/funkyheatmapjs/commit/97dd7561be0a4d27b148f6f8abe2180c1927755c))
* allow text geom colors ([b745cb0](https://github.com/funkyheatmap/funkyheatmapjs/commit/b745cb0592b41209b26dc2fd4ceaf1b2c69e85dd))
* categorical palette ([da2bb0e](https://github.com/funkyheatmap/funkyheatmapjs/commit/da2bb0e1240afc519e1a8bde06860b2e3903dee7))
* color by rank when rank has ties [#29](https://github.com/funkyheatmap/funkyheatmapjs/issues/29) ([2365612](https://github.com/funkyheatmap/funkyheatmapjs/commit/2365612048944abaef9633e28924deaf125dfd46))
* colorByRank after sorting ([bf4af98](https://github.com/funkyheatmap/funkyheatmapjs/commit/bf4af98a478573a9335ec92c5c2e4778be5507b6))
* do not draw geoms for NA values ([ef93fc4](https://github.com/funkyheatmap/funkyheatmapjs/commit/ef93fc4db2eb621ea3f45a0b1575065b86725a68))
* do not require column names as input ([5abe7cf](https://github.com/funkyheatmap/funkyheatmapjs/commit/5abe7cfb1fdc314d58eef1275c9ff1a884464c99))
* empty column groups bug ([71ce06f](https://github.com/funkyheatmap/funkyheatmapjs/commit/71ce06f9a9e72a0933e98f1519790f6e8ec47fb9))
* ensureRowData not working ([0c94213](https://github.com/funkyheatmap/funkyheatmapjs/commit/0c94213d96a8eaf96c78bf8f062ab30a97e15f78))
* header height when no column groups provided ([84cdad0](https://github.com/funkyheatmap/funkyheatmapjs/commit/84cdad076b4c1e894a7e23d5d2487044d43f16e2))
* hide tooltip when scrolling from the heatmap ([5242d20](https://github.com/funkyheatmap/funkyheatmapjs/commit/5242d20461bc78d9b82c927619d7fef3eb676762))
* rect legend size ([696cdd7](https://github.com/funkyheatmap/funkyheatmapjs/commit/696cdd7a0bfe679e09bdec6a25098fe4e5a6ef96))
* require id in column info ([3cecfe7](https://github.com/funkyheatmap/funkyheatmapjs/commit/3cecfe70cadcad2f9860ccd3d024af8dd1135e3a))
* show tooltip above the pointer ([d0f2814](https://github.com/funkyheatmap/funkyheatmapjs/commit/d0f28149b17425976c830da71f6ec8f9b7631e9f))
* verify image and text legends have values ([298bc5f](https://github.com/funkyheatmap/funkyheatmapjs/commit/298bc5fd9883feedc93a2834af86570e0d4c51cb))


### Misc

* add docs workflow ([0347e9a](https://github.com/funkyheatmap/funkyheatmapjs/commit/0347e9a69e92e12090a79290f2da429fbcd8dd9e))
* add image legend to scIB ([f9f75fd](https://github.com/funkyheatmap/funkyheatmapjs/commit/f9f75fd2f1139beeb94b238320380f72ce1e1c02))
* add package to release-please ([8b7542a](https://github.com/funkyheatmap/funkyheatmapjs/commit/8b7542a5897b864e6d42f3886de78a66496a4ed7))
* add permissions for docs pr preview worklfow ([f9a7e7c](https://github.com/funkyheatmap/funkyheatmapjs/commit/f9a7e7c2a0c4887d073af68c4b047def29ede524))
* add text geom nuance to palette docs ([4ce04d0](https://github.com/funkyheatmap/funkyheatmapjs/commit/4ce04d072d8446faa7ce5c0a15ba8c2a0531b56a))
* bump node version 16-&gt;18 ([9c9e5c7](https://github.com/funkyheatmap/funkyheatmapjs/commit/9c9e5c7b128b2b6228cb30f15efa15086c7c8879))
* data typedefs ([80815a5](https://github.com/funkyheatmap/funkyheatmapjs/commit/80815a569af2f75e38cc4170e4afffe1f46ec344))
* docs preview pr workflow ([105e883](https://github.com/funkyheatmap/funkyheatmapjs/commit/105e8839584e33eeefff5b8faf256f775edf6cbc))
* document column groups ([938630f](https://github.com/funkyheatmap/funkyheatmapjs/commit/938630f6471ab32d8acfe1a2361933d9301cda38))
* document full tutorial ([88dc098](https://github.com/funkyheatmap/funkyheatmapjs/commit/88dc098de0bbe3ac0253b0fd12e96a994289e55a))
* document geoms ([2c57ef5](https://github.com/funkyheatmap/funkyheatmapjs/commit/2c57ef5781c9ac2655636c5edd6e5a90855acec3))
* document heatmap class ([bd0c94e](https://github.com/funkyheatmap/funkyheatmapjs/commit/bd0c94e58d700d43de0e1c564ce849caa4231e40))
* document more column class properties ([a47e4f7](https://github.com/funkyheatmap/funkyheatmapjs/commit/a47e4f710dcc6c28652548d266338b1365a2eacf))
* document palettes ([f7c7b75](https://github.com/funkyheatmap/funkyheatmapjs/commit/f7c7b75de84af010c9cf381c46e2b157d8702f61))
* document row groups, row info, legends ([708bd7c](https://github.com/funkyheatmap/funkyheatmapjs/commit/708bd7c1a9e2da915192ac1f377820198bb75070))
* fix docs pr preview ([18d6361](https://github.com/funkyheatmap/funkyheatmapjs/commit/18d6361d58b4f898ae3b2f552e9bb2c3f0fb574e))
* fix docs pr preview permissions ([810d725](https://github.com/funkyheatmap/funkyheatmapjs/commit/810d725dfadaec31b6c1dfbd9f6fd3969c4a2225))
* fix docs workflow ([8466a48](https://github.com/funkyheatmap/funkyheatmapjs/commit/8466a4890bfa2aa89fe456f1cc8999be151ecc4f))
* fix static path ([a82e7ba](https://github.com/funkyheatmap/funkyheatmapjs/commit/a82e7ba675a3127ee88c6c81916f83d14b0584ce))
* fix tutorials sidebar ([194877c](https://github.com/funkyheatmap/funkyheatmapjs/commit/194877ce247db1ab45850289eb73ae9451b5e989))
* fix typos ([0e0bb78](https://github.com/funkyheatmap/funkyheatmapjs/commit/0e0bb783c483c4de1b0ad5f9a5287a66a9c715aa))
* fix vignettes build ([334e55e](https://github.com/funkyheatmap/funkyheatmapjs/commit/334e55e3f7090285843be71d63880fc457535ad6))
* Merge pull request [#20](https://github.com/funkyheatmap/funkyheatmapjs/issues/20) from funkyheatmap/position-args ([41b38ef](https://github.com/funkyheatmap/funkyheatmapjs/commit/41b38ef789e22c6d9d4a54561d3201fc7bffee96))
* more jsdoc ([713e00a](https://github.com/funkyheatmap/funkyheatmapjs/commit/713e00a94b4f6951c5b1f68bdc49f7c454b1dffa))
* outline release process ([9a2e9be](https://github.com/funkyheatmap/funkyheatmapjs/commit/9a2e9be474d5713da8710f0b84768f5f669f0e41))
* position options and redo palettes ([5435b3e](https://github.com/funkyheatmap/funkyheatmapjs/commit/5435b3ea10d6cb52bf8fa4027ee066d8c3ad75e0))
* prettify links to source ([5fbe47e](https://github.com/funkyheatmap/funkyheatmapjs/commit/5fbe47e1147ab243237d806794fd53e39c0d2eec))
* release 0.3.0 ([f416084](https://github.com/funkyheatmap/funkyheatmapjs/commit/f416084608c27460e2333fc33cb626bebe8ee910))
* release-please config ([af45f00](https://github.com/funkyheatmap/funkyheatmapjs/commit/af45f00b2944426f5a4c921e02e32ca87c7db0db))
* release-please manifest ([ebaf9d6](https://github.com/funkyheatmap/funkyheatmapjs/commit/ebaf9d6547da53240e7d91d34a3311c7c8e40911))
* release-please new version config ([f41e5c5](https://github.com/funkyheatmap/funkyheatmapjs/commit/f41e5c5a1bdcdfcc4ed74ccf58497a75288644d5))
* scIB tutorial ([a62ad61](https://github.com/funkyheatmap/funkyheatmapjs/commit/a62ad61c9d4c6295851659e7118b85ac1505ff34))
* setup jsdoc ([74a47f1](https://github.com/funkyheatmap/funkyheatmapjs/commit/74a47f1c7325408e14762a86d9f9ae881061b66e))
* showcase row_info and row_groups ([a9d1aac](https://github.com/funkyheatmap/funkyheatmapjs/commit/a9d1aac411038d044211036d3471c982b97b1cbe))
* simplify build ([392f181](https://github.com/funkyheatmap/funkyheatmapjs/commit/392f1819a09bc158f102729d942bf60cb8b56752))
* simplify links ([18d4519](https://github.com/funkyheatmap/funkyheatmapjs/commit/18d4519dd1b106eac035b4f1174ed0340a99240e))
* specify lastest release ([3e51eec](https://github.com/funkyheatmap/funkyheatmapjs/commit/3e51eec2ea72dd80fee7c1e3df5eff6322cd2803))
* trigger release please actions with token ([8df5444](https://github.com/funkyheatmap/funkyheatmapjs/commit/8df54446d19cbfc6b61a39c787c9dd3626d34727))
* update changelog ([b7a493a](https://github.com/funkyheatmap/funkyheatmapjs/commit/b7a493a4b186e1a9d22a97e80f7924158e3fef25))
* update readme ([8c036b4](https://github.com/funkyheatmap/funkyheatmapjs/commit/8c036b4eef1b770e27fb47b1464374f7286168dc))
* write simple tutorial ([769fce5](https://github.com/funkyheatmap/funkyheatmapjs/commit/769fce5a34e1e1d38af309e9f776b9eb9c53ea61))


### Tests

* add legends to scIB vignette ([308e6ff](https://github.com/funkyheatmap/funkyheatmapjs/commit/308e6ff35616555f2c551cd6a6c7c13b02d0539b))
* add scIB vignette ([3e6bd92](https://github.com/funkyheatmap/funkyheatmapjs/commit/3e6bd92ca660bcf219ab124e6dc4eae352acda9c))
* check id_color is in the columns ([23cb639](https://github.com/funkyheatmap/funkyheatmapjs/commit/23cb639abc81562bd18bf66b609663a603714c17))
* input utils ([b330838](https://github.com/funkyheatmap/funkyheatmapjs/commit/b330838902033a0f52e6d50e76c996b5273e322c))
* rename input utils ([ba25934](https://github.com/funkyheatmap/funkyheatmapjs/commit/ba2593422e86f9db39d015164ff1c6124af9ae09))
* set defaut palette for text to none ([4418654](https://github.com/funkyheatmap/funkyheatmapjs/commit/44186540ee64a23f302a9652af252bc960b673f4))
* util function to convert dataframes ([3d13434](https://github.com/funkyheatmap/funkyheatmapjs/commit/3d13434a9019fbb68af9621fe57cf2944b234b60))
* verify boolean data is inferred as text ([b19ac06](https://github.com/funkyheatmap/funkyheatmapjs/commit/b19ac06a5ad4d80742aba57f55640a1e7111c5a2))

## [0.2.5](https://github.com/funkyheatmap/funkyheatmapjs/compare/v0.2.4...v0.2.5) (2024-02-15)

### Bug Fixes

* Add text fill option to legend @rcannood ([c5f0bc0](https://github.com/funkyheatmap/funkyheatmapjs/commit/c5f0bc0a65b01ddf04f87f35dea5705a01e36eb1))

### Misc

* release 0.2.5 ([675082f](https://github.com/funkyheatmap/funkyheatmapjs/commit/675082fa02495b3076469ae360a00c4717f5c480))

## [0.2.4](https://github.com/funkyheatmap/funkyheatmapjs/compare/v0.2.3...v0.2.4) (2023-07-14)


### Features

* display removed entries in legend ([acb86f9](https://github.com/funkyheatmap/funkyheatmapjs/commit/acb86f9fd06969dc46ef002ec16de294cfb77110))
* image geom ([1930a31](https://github.com/funkyheatmap/funkyheatmapjs/commit/1930a319b69267d07a00682d9c002a5f9fb87e6f))


### Bug Fixes

* column size for geom with label ([8d5612c](https://github.com/funkyheatmap/funkyheatmapjs/commit/8d5612c9ea2d21e7ae4bcae3c68880327b5567d4))
* legend positioning for funkyrect + pie ([92c45e1](https://github.com/funkyheatmap/funkyheatmapjs/commit/92c45e12af1d0cd843c60cabb82d8730321e9d63))

## [0.2.3](https://github.com/funkyheatmap/funkyheatmapjs/compare/v0.2.2...v0.2.3) (2023-07-07)


### Misc

* optimize browser build ([7ae2151](https://github.com/funkyheatmap/funkyheatmapjs/commit/7ae2151e0493f471c2d322cac25e213f87814a52))

## [0.2.2](https://github.com/funkyheatmap/funkyheatmapjs/compare/v0.2.1...v0.2.2) (2023-07-07)


### Bug Fixes

* place sort indicator for non-rotated column ([74890d8](https://github.com/funkyheatmap/funkyheatmapjs/commit/74890d8025bce7659a6304b8cd9e43839b1d08db))


### Tests

* add name column to full test ([af9b3e8](https://github.com/funkyheatmap/funkyheatmapjs/commit/af9b3e8416c990047906ef1937bc3289a6b42de4))

## [0.2.1](https://github.com/funkyheatmap/funkyheatmapjs/compare/v0.2.0...v0.2.1) (2023-07-07)


### Misc

* add tests & update changelog ([543a108](https://github.com/funkyheatmap/funkyheatmapjs/commit/543a10831aed4b095057735873904e39831bf1fb))

## [0.2.0](https://github.com/funkyheatmap/funkyheatmapjs/compare/v0.1.9...v0.2.0) (2023-07-07)

### Breaking changes
`funkyheatmap` arguments have changed and are not compatible with the previous version

### Features

* allow custom palettes ([00de811](https://github.com/funkyheatmap/funkyheatmapjs/commit/00de811e8a4e51050abfc057d0a7e154a5bce6ed))
* display label over geom ([635da9e](https://github.com/funkyheatmap/funkyheatmapjs/commit/635da9e41d211247ae4715bfd90a397f085ac5d1))
* pie geom ([d195a75](https://github.com/funkyheatmap/funkyheatmapjs/commit/d195a75cae4606a8ae64725d6a83bc3d119f1c8f))
* pie legend ([5dee2c6](https://github.com/funkyheatmap/funkyheatmapjs/commit/5dee2c68d9742595bbf884394c0bdba331389622))
* pie tooltips ([8d9fce1](https://github.com/funkyheatmap/funkyheatmapjs/commit/8d9fce1b12f085d5de74a8fbce32b845f19c9703))
* rect geom ([a8a11c9](https://github.com/funkyheatmap/funkyheatmapjs/commit/a8a11c9b82508c97f64b76faa66951b39a2445f0))
* row groups ([4d9766a](https://github.com/funkyheatmap/funkyheatmapjs/commit/4d9766a99323e5d096b4722c3d400a6ddbb1856b))
* sort within row groups ([4b2b835](https://github.com/funkyheatmap/funkyheatmapjs/commit/4b2b8356ad90cf1f8243a1ca155b7ac6416a15d6))


### Bug Fixes

* accept column info width ([e7f4173](https://github.com/funkyheatmap/funkyheatmapjs/commit/e7f41737eaf5d8f367a8a4f37ab610b2954e4d19))
* change categorical palette format ([f8a6ded](https://github.com/funkyheatmap/funkyheatmapjs/commit/f8a6dedcee3761552ff41984f6fc5d397fbcf920))
* default parameters for simple test ([3985036](https://github.com/funkyheatmap/funkyheatmapjs/commit/398503682e40de4ed03bb512c1728669e0173a1c))
* import lodash ([162b861](https://github.com/funkyheatmap/funkyheatmapjs/commit/162b861c5d554de89bbe8b55716780572b30d5cf))
* min geom size for bars and circles ([f4e869c](https://github.com/funkyheatmap/funkyheatmapjs/commit/f4e869c42344980f624ca0352e5a470ab55aed49))
* sorting without row groups ([6f7fae1](https://github.com/funkyheatmap/funkyheatmapjs/commit/6f7fae1c66aa1da677df5f29c09dfd5529eee0d4))
* throw error on unknown geom ([49b9600](https://github.com/funkyheatmap/funkyheatmapjs/commit/49b96005a0801a07e5d90bcb8624734c3cea0374))
* use column index for positioning ([ca0bd38](https://github.com/funkyheatmap/funkyheatmapjs/commit/ca0bd38ce642869780c51e66259b008ea7d83d81))
* use level1 for column group names + opacity ([b7c0a77](https://github.com/funkyheatmap/funkyheatmapjs/commit/b7c0a77a3a4f462115dac0084cb042fbfa27cbfa))
* use widthPx for column size ([dbbac77](https://github.com/funkyheatmap/funkyheatmapjs/commit/dbbac7731c0ffec1423396e3d9d48bd7a922b06a))


### Tests

* fix full test ([8067d3f](https://github.com/funkyheatmap/funkyheatmapjs/commit/8067d3f7f7ef9afab942ea73e0e54420c88eb7e7))
* restore simple test ([394dd02](https://github.com/funkyheatmap/funkyheatmapjs/commit/394dd020eead6b63b28757c7ed293421984d62bf))
* set up unit tests ([c5c4d06](https://github.com/funkyheatmap/funkyheatmapjs/commit/c5c4d0666f99b25f9ed54c44c859472d8b7d5627))


### Misc

* bump version ([f8dc00c](https://github.com/funkyheatmap/funkyheatmapjs/commit/f8dc00c7c7e0e9eeb57215abfa732949122818c9))
* extract geoms to separate file ([6c2aa5d](https://github.com/funkyheatmap/funkyheatmapjs/commit/6c2aa5daf80972d9e6b12b7cfa3530078655067c))
* match call signature to R ([bf1d0e7](https://github.com/funkyheatmap/funkyheatmapjs/commit/bf1d0e7da41bf688f02f87757ab892b630447cfd))
* rename package ([815b15a](https://github.com/funkyheatmap/funkyheatmapjs/commit/815b15a658b4c84dcc83ab9b59ed88de3e850c96))
* version = 0.2.0 ([33de88e](https://github.com/funkyheatmap/funkyheatmapjs/commit/33de88e62678f1fd79f1a085cd7029532978e18d))

## [0.1.9](https://github.com/mxposed/funkyheatmap-js/compare/v0.1.8...v0.1.9) (2023-04-19)


### Misc

* add css class to svg & geom ([7f96e32](https://github.com/mxposed/funkyheatmap-js/commit/7f96e324ff585d4b01b986fa347c1385f5394f09))

## [0.1.8](https://github.com/mxposed/funkyheatmap-js/compare/v0.1.7...v0.1.8) (2023-04-10)


### Features

* allow text/background customization ([946d5cd](https://github.com/mxposed/funkyheatmap-js/commit/946d5cd197cd0df43d98a54a71316eb68e71897f))

## [0.1.7](https://github.com/mxposed/funkyheatmap-js/compare/v0.1.6...v0.1.7) (2023-03-09)


### Features

* color by rank option ([3cae87a](https://github.com/mxposed/funkyheatmap-js/commit/3cae87a39b49181579ed17216ead7c822e722e72))


### Bug Fixes

* set first sort to descending ([3d18eeb](https://github.com/mxposed/funkyheatmap-js/commit/3d18eeb111e4e73cb6a7c878b68a191ca7cd00dc))
* swap sort indicating arrows ([839f405](https://github.com/mxposed/funkyheatmap-js/commit/839f405c755b699baf5074e0196a13a9ecd0ed0c))


### Misc

* simplify release branches ([f942765](https://github.com/mxposed/funkyheatmap-js/commit/f942765c405fe62fb2af9e1e7fec919941ffb0af))

## [0.1.6](https://github.com/mxposed/funkyheatmap-js/compare/v0.1.5...v0.1.6) (2023-03-08)


### Features

* sort heatmap by columns ([eb2a671](https://github.com/mxposed/funkyheatmap-js/commit/eb2a6711f62de304e4a2debe8e881ee1ff8ad842))


### Bug Fixes

* passing empty columnGroups ([97bddb2](https://github.com/mxposed/funkyheatmap-js/commit/97bddb2c005d46d1695a900e72ed81e07ab9701f))


### Misc

* bump patch until 1.0 for feats ([0167d07](https://github.com/mxposed/funkyheatmap-js/commit/0167d073cf0eedbcc22861bdf2bb948189a136a0))
* move npm publish to release-please ([c4fb0ca](https://github.com/mxposed/funkyheatmap-js/commit/c4fb0ca95848fe03fa6949a75473ee0a3fe22023))
* release 0.1.6 ([dbb0b58](https://github.com/mxposed/funkyheatmap-js/commit/dbb0b58a30e84bc344aa7c2341dea1906b9ff7c7))

## [0.1.5](https://github.com/mxposed/funkyheatmap-js/compare/v0.1.4...v0.1.5) (2023-03-08)


### Bug Fixes

* render svg synchronously ([0ded5b1](https://github.com/mxposed/funkyheatmap-js/commit/0ded5b1f16a6d2e092f4c3a38e4babd92411b1e9))


### Misc

* add conventional commit hook ([34b1d9b](https://github.com/mxposed/funkyheatmap-js/commit/34b1d9bb5563163e5a3dddacc78955f3ac9dda3d))
* add release-please action ([8258a0b](https://github.com/mxposed/funkyheatmap-js/commit/8258a0b4dca6561a9c984692e7296b1163224839))
* fix release pr title ([701cf66](https://github.com/mxposed/funkyheatmap-js/commit/701cf66d163cf85739010f6fbe6bbac894a5afac))

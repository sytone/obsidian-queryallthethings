# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.1](https://github.com/sytone/obsidian-queryallthethings/compare/1.2.0...1.2.1) (2024-10-18)


### Features

* update examples approach to allow collaboration and also fix await issue for MD table import ([fea8d6e](https://github.com/sytone/obsidian-queryallthethings/commits/fea8d6ee9f99f441e65cde9d516a1938d4ec7a20))


### Internal

* make the release notes automatically ([41cec67](https://github.com/sytone/obsidian-queryallthethings/commits/41cec674ec11c2fdf971d7c8ea3a5f67a81718b7))
* try alternative creation approach ([8c95085](https://github.com/sytone/obsidian-queryallthethings/commits/8c95085bd7ea73bbee9b800cebfc21f4239f8e7d))


### Documentation

* add csv example ([398f9b8](https://github.com/sytone/obsidian-queryallthethings/commits/398f9b87fb5e2482c44163f1110aaed7330515e4))

## [1.2.0](https://github.com/sytone/obsidian-queryallthethings/compare/1.1.3...1.2.0) (2024-10-02)


### Features

* **render:** add relational operators to handlebars requested in [#25](https://github.com/sytone/obsidian-queryallthethings/issues/25) ([7a4da44](https://github.com/sytone/obsidian-queryallthethings/commits/7a4da44286fd36e81389d96d6675016d110cda0d))

### [1.1.3](https://github.com/sytone/obsidian-queryallthethings/compare/1.1.2...1.1.3) (2024-10-02)


### Documentation

* add content field to the obsidian_notes reference ([30086c6](https://github.com/sytone/obsidian-queryallthethings/commits/30086c67e4b4d58873364db925cee6a9c768f6ae))


### Bug Fixes and Changes

* make first load just run and then the debounce use the debounce window. ([e575bc3](https://github.com/sytone/obsidian-queryallthethings/commits/e575bc3821b4d69f88e4042c16069e6a3f5c9eef))
* use p-debounce to handle delayed cache updates ([2d39823](https://github.com/sytone/obsidian-queryallthethings/commits/2d398236a3cb3d953a59ad3adbfe2bb56cf0e362))

### [1.1.2](https://github.com/sytone/obsidian-queryallthethings/compare/1.1.1...1.1.2) (2024-10-02)


### Bug Fixes and Changes

* allow the debounce to be disabled as it is not working on page renames correctly ([700b6e3](https://github.com/sytone/obsidian-queryallthethings/commits/700b6e3036c3c63614d684ccbcd9e626dbf6d8ea))

### [1.1.1](https://github.com/sytone/obsidian-queryallthethings/compare/1.1.0...1.1.1) (2024-09-01)


### Bug Fixes and Changes

* ensure single tags are treated as an array and not a string. ([7114ba2](https://github.com/sytone/obsidian-queryallthethings/commits/7114ba27d75cd1c978462db7d53ff44fc6056b8c))

## [1.1.0](https://github.com/sytone/obsidian-queryallthethings/compare/1.0.2...1.1.0) (2024-09-01)


### Features

* allow index updating notice to be disabled ([#21](https://github.com/sytone/obsidian-queryallthethings/issues/21)) ([4750ea3](https://github.com/sytone/obsidian-queryallthethings/commits/4750ea3cbef82f1da91d6aa9984e642057b35d7d)), closes [#20](https://github.com/sytone/obsidian-queryallthethings/issues/20)


### Bug Fixes and Changes

* add pnpm version to vitepress publish ([40b31fd](https://github.com/sytone/obsidian-queryallthethings/commits/40b31fdaaa5427a94d50d186d1535cc9ec091156))


### Documentation

* cleanup obsidian_markdown_notes references ([f1eadc2](https://github.com/sytone/obsidian-queryallthethings/commits/f1eadc2ac82126113821c3e9454cb7dc2328b9bf))
* cleanup ordering and retire notices ([2e5144a](https://github.com/sytone/obsidian-queryallthethings/commits/2e5144abc5982771446c68dc06ed9794b2e0995a))
* correct links and add version ([963c7ce](https://github.com/sytone/obsidian-queryallthethings/commits/963c7ceeac01353789da904042ed2b9c8d4e47f3))
* move logo to public folder ([55677c4](https://github.com/sytone/obsidian-queryallthethings/commits/55677c429dfd6e1d3c3b4d6ce551bba666d49a30))
* move to vitepress ([e065eab](https://github.com/sytone/obsidian-queryallthethings/commits/e065eabdd51acdbd7b47fe9b5af0eb7717cb4f5f))
* update logo and homepage links and information ([190949d](https://github.com/sytone/obsidian-queryallthethings/commits/190949df9e3de992ebe2b3262606e45a7ab5b4d1))


### Internal

* package updates ([4d7522b](https://github.com/sytone/obsidian-queryallthethings/commits/4d7522b7f4f1048f01c8c0c237d9817cb0adb313))
* remove old jekyll files ([d9cbd41](https://github.com/sytone/obsidian-queryallthethings/commits/d9cbd41a72f651540083bbc1677af421a8263bf0))
* rename action for beta release ([5ca0dfa](https://github.com/sytone/obsidian-queryallthethings/commits/5ca0dfa9822dbdf56b882a355352d078ed5cc00c))

### [1.0.2](https://github.com/sytone/obsidian-queryallthethings/compare/1.0.1...1.0.2) (2024-06-29)


### Bug Fixes and Changes

* upsert to task and list on note change and add content back to note ([9be7463](https://github.com/sytone/obsidian-queryallthethings/commits/9be7463ed8e9043074ecbfcf032355f49245b6e6))

### [1.0.1](https://github.com/sytone/obsidian-queryallthethings/compare/0.9.0...1.0.1) (2024-06-21)


### Features

* Add 'qatt:all-notes-loaded' event to obsidian-ex.d.ts ([4542b0c](https://github.com/sytone/obsidian-queryallthethings/commits/4542b0c207861d3b99238bb91d1345f7ec365e2e))
* add ability to get measurement and code and comment cleanup ([1cdee59](https://github.com/sytone/obsidian-queryallthethings/commits/1cdee59399a3509f7991a0ae879a77bbca5fdb6a))
* add button to push metrics to console ([dcd62f9](https://github.com/sytone/obsidian-queryallthethings/commits/dcd62f9924489b715fda78f036a84ee0a224736d))
* add editor menu ([ad8e475](https://github.com/sytone/obsidian-queryallthethings/commits/ad8e475772fcf68bd2667c38ef3fe99bbecd4d90))
* add message while cache populates ([723fcd5](https://github.com/sytone/obsidian-queryallthethings/commits/723fcd5e131278021d207fa06f56e7b9acfd1069))
* add metrics service to collect plugin metrics to a single location ([b1745eb](https://github.com/sytone/obsidian-queryallthethings/commits/b1745eb92f46b41c98ef694c593089a8f83a7f73))
* add obsidian help and joinarray sql function ([98a3774](https://github.com/sytone/obsidian-queryallthethings/commits/98a3774157970fb5363499fb82cb978cf96e8959))
* add path as a property of list items and task items ([1c34ce8](https://github.com/sytone/obsidian-queryallthethings/commits/1c34ce8f1a34ae914214915905d5f4f1c46a9ea9))
* add prototype of UI to edit codeblcoks and queries ([cefb036](https://github.com/sytone/obsidian-queryallthethings/commits/cefb036a8684bb93d4466954775e44d8ca122ae6))
* add settings to disable missing dv and cjs plugins ([ba74125](https://github.com/sytone/obsidian-queryallthethings/commits/ba741259488d6285381610ea2aa9d9e63f6f47c7))
* add simple metrics ([b4c5694](https://github.com/sytone/obsidian-queryallthethings/commits/b4c56946f039d301a3387ce1a00fc800ba19b75d))
* add two sql functions for line based search ([56543b3](https://github.com/sytone/obsidian-queryallthethings/commits/56543b36767e61c81814ff0ae9f4d1eb6ba71cf8))
* add types for menus ([5f60a7c](https://github.com/sytone/obsidian-queryallthethings/commits/5f60a7cb50d25aed6eaa0fc65d0959a27a733ae7))
* added command to show metrics to console ([329c391](https://github.com/sytone/obsidian-queryallthethings/commits/329c391b18e51017536181e41e728943558ac9f1))
* additional query loading message and fixed frontmatter loading ([b2dc0f4](https://github.com/sytone/obsidian-queryallthethings/commits/b2dc0f4131a197a0f44d80b3570a85aa600b3630))
* cleanup new tables in default database ([58605d0](https://github.com/sytone/obsidian-queryallthethings/commits/58605d01588d3ffa035517c02ed6734c61ef7f81))
* enable daily codeblock replacement ([8d1e01f](https://github.com/sytone/obsidian-queryallthethings/commits/8d1e01f5d57472452e4a744ddda454a0e3f46091))
* enable default folders for query and template files and enable UI for editing codeblock ([37e467d](https://github.com/sytone/obsidian-queryallthethings/commits/37e467deea852f247142925814e751a02b331e32))
* enable partial append ([8261886](https://github.com/sytone/obsidian-queryallthethings/commits/826188605254d01a1afc5a5188b066754ae90fef))
* enable processing of DataView Inline tasks ([2db62a8](https://github.com/sytone/obsidian-queryallthethings/commits/2db62a8772b263def0934d9f9c62cc3f85eeb493)), closes [#11](https://github.com/sytone/obsidian-queryallthethings/issues/11)
* enable tables to be natively available in the alasql database ([b11d752](https://github.com/sytone/obsidian-queryallthethings/commits/b11d7527f50256e6b644ffa5a3939861a1e549e8))
* move data table functions to use metrics and add measurement to metrics service ([e94898d](https://github.com/sytone/obsidian-queryallthethings/commits/e94898da570abe19819b610373ee90773d04991f))
* notice on indexing ([f23d965](https://github.com/sytone/obsidian-queryallthethings/commits/f23d96506c167f5388f17763b092f7828377bcd5))
* register for all notes loaded event to force update on data population ([106296b](https://github.com/sytone/obsidian-queryallthethings/commits/106296b724355fbc01706748e7657d80634bb1e3))
* simplify notes cache ([ecca054](https://github.com/sytone/obsidian-queryallthethings/commits/ecca05474f97f88d73ddbf59b1d6d7673994d7a7))
* test additional internal render child approach ([17feaf7](https://github.com/sytone/obsidian-queryallthethings/commits/17feaf7931d1b1c3f6e269d52006c8ede8ec0147))
* update handlebars helpers ([7c14bc2](https://github.com/sytone/obsidian-queryallthethings/commits/7c14bc29f9b1195baac38b1dab4543a1735beb6c))
* update settings text and enable metrics collection ([9e6cdc6](https://github.com/sytone/obsidian-queryallthethings/commits/9e6cdc6f622b54924ee2a520b1a41d0d0a79aaea))
* update to use indexed tables properly ([5d1c7a8](https://github.com/sytone/obsidian-queryallthethings/commits/5d1c7a82ed977533bf942a33ae8eafc381282789))


### Documentation

* ad cleanTask to docs on tasks object ([3b76cb9](https://github.com/sytone/obsidian-queryallthethings/commits/3b76cb962e383729bbf5e930deab0428094594a9))
* added example for replaceTargetPath ([88fde46](https://github.com/sytone/obsidian-queryallthethings/commits/88fde46e211ff3961aee1e5d708880d61ed7ee33))
* change injection newline option ([194a79c](https://github.com/sytone/obsidian-queryallthethings/commits/194a79c2c64dbe1a06f63cf65f20e84a8c5f3821))
* clarified the live example part ([b90e7bd](https://github.com/sytone/obsidian-queryallthethings/commits/b90e7bd328027cd805c5504f9e9a082500fb2b9f))
* Create CODE_OF_CONDUCT.md ([4877e8a](https://github.com/sytone/obsidian-queryallthethings/commits/4877e8ad01953d81730c6a6b18342fdd8e6db003))
* Create CONTRIBUTING.md ([a42e842](https://github.com/sytone/obsidian-queryallthethings/commits/a42e842b617d67f659a6dd4e63ad1cb2024b588d))
* Create pull_request_template.md ([a493730](https://github.com/sytone/obsidian-queryallthethings/commits/a4937306558b9dcc39b71a2cf1ef18ebea0cc884))
* Create SECURITY.md ([9b1d697](https://github.com/sytone/obsidian-queryallthethings/commits/9b1d697a8d03b84cbe775251f5c3b9be521c76a3))
* regenerated docs with new snippet injector version ([e5836b2](https://github.com/sytone/obsidian-queryallthethings/commits/e5836b24d6a0c9e386c67adfc88349b9eb5675dc))
* set obsidian selected page to index ([8bf235c](https://github.com/sytone/obsidian-queryallthethings/commits/8bf235cb461335e1d1b3f47ed91ed33b12940312))
* switch from source and make it reading ([fb92b2c](https://github.com/sytone/obsidian-queryallthethings/commits/fb92b2c5cbb26c62ff82b0128fb6be258f43162b))
* update all documentation ([f52c67d](https://github.com/sytone/obsidian-queryallthethings/commits/f52c67daff09f9b74177bd6ec59e091fcf503ffc))
* update build instructions ([6012eeb](https://github.com/sytone/obsidian-queryallthethings/commits/6012eebff46e33ab49884f2de834612f720c53c1))
* update generated to be just date ([21c18c9](https://github.com/sytone/obsidian-queryallthethings/commits/21c18c9757c1e4574643bd34c57318263bc1be36))
* update joinarray documentation ([641ebe6](https://github.com/sytone/obsidian-queryallthethings/commits/641ebe636e95ded407b76b25fa63db569cacd7c1))
* update plugins and codeblock structure ([6268e11](https://github.com/sytone/obsidian-queryallthethings/commits/6268e1113d53d000414ef6dc6dbe2997cfe6ad18))


### Bug Fixes and Changes

* load order and event notifications ([7027050](https://github.com/sytone/obsidian-queryallthethings/commits/7027050b1753be3c499cebc71a8b7b224142affd))
* merge of stash ([07888ed](https://github.com/sytone/obsidian-queryallthethings/commits/07888edd126a5021b7252730ab9fa81f500436c4))
* parsing of inline values to handle braces as well ([66d604a](https://github.com/sytone/obsidian-queryallthethings/commits/66d604af04f012320a03099b5e6edc1a681c7be3))
* reduce logging output ([cb770c4](https://github.com/sytone/obsidian-queryallthethings/commits/cb770c4149ceba11bd1201a8baef6c121a0fccde))
* remove direct async call ([bd40252](https://github.com/sytone/obsidian-queryallthethings/commits/bd4025204a5d5b4163ba4730dafbb9f6cb4cdadf))
* remove duplicate cache declaration ([2fca160](https://github.com/sytone/obsidian-queryallthethings/commits/2fca1608168126292455b70c4294e9a390bd361f))
* remove tags from clean task string and update docs ([83f3609](https://github.com/sytone/obsidian-queryallthethings/commits/83f3609cd9f095cd3b3ef90553f0c473997f3cfa))
* task item update from db ([86f984f](https://github.com/sytone/obsidian-queryallthethings/commits/86f984f90120137c1e28eae68eec54a1579ed10b))
* update LINEINDEX sql function to handle emoji characters ([b9f5ce2](https://github.com/sytone/obsidian-queryallthethings/commits/b9f5ce20b3be126fe3d9809f49bc80da1b744316))
* update logging display and entries ([6117841](https://github.com/sytone/obsidian-queryallthethings/commits/6117841e95d386a29d019661835a53be3abbe029))
* updated test for new list constructor ([1d0674a](https://github.com/sytone/obsidian-queryallthethings/commits/1d0674a5f2e8065f277620f3565bc25d5a929016))


### Internal

* added comments on new tables ([ca98c01](https://github.com/sytone/obsidian-queryallthethings/commits/ca98c01cf38e7dbaec3e8d9f37995dd58041eb71))
* beta release pipeline ([528d8f6](https://github.com/sytone/obsidian-queryallthethings/commits/528d8f6ab9d235eb8ac573988ccf1f2445d66e8e))
* **deps-dev:** bump @babel/traverse from 7.23.0 to 7.23.9 ([#12](https://github.com/sytone/obsidian-queryallthethings/issues/12)) ([647d88f](https://github.com/sytone/obsidian-queryallthethings/commits/647d88f82a6419afd1c7ba6865d8de56a825dd65))
* fix tag filter for release build ([6bc404e](https://github.com/sytone/obsidian-queryallthethings/commits/6bc404e18a7bf2c92e10477f381ed58baa19cc5b))
* move to node test runner and node v20 ([7c21ecc](https://github.com/sytone/obsidian-queryallthethings/commits/7c21ecc9aa49b6143953467bf5ff55477caccd12))
* moving to LF only in windows due to Obsidan defaults ([f114437](https://github.com/sytone/obsidian-queryallthethings/commits/f11443778342c9d8137ba1d74c76d186b28887ac))
* **release:** 0.10.0 ([6e0ac71](https://github.com/sytone/obsidian-queryallthethings/commits/6e0ac71fc59e5bc74df6da77c6a6dc288abde6b2))
* **release:** 1.0.0 ([6625f0e](https://github.com/sytone/obsidian-queryallthethings/commits/6625f0e4cadc7f900a48938934e93a24353ea3f5))
* remove non used references ([83b22cf](https://github.com/sytone/obsidian-queryallthethings/commits/83b22cf0a06bdd110972d4bdae49d3dc08184f0e))
* Update dependencies in tsconfig.json and package.json ([568fa04](https://github.com/sytone/obsidian-queryallthethings/commits/568fa04c35d54fb9ce03309afd367e7b4b6de013))
* update dev container ([cfae98c](https://github.com/sytone/obsidian-queryallthethings/commits/cfae98c02f142a53dca68211dd7f9f9a124982f4))
* Update issue templates ([1cb2c89](https://github.com/sytone/obsidian-queryallthethings/commits/1cb2c8964c8405cb33d76d2a7826c87c87b03377))
* update markdown snippet injector ([71e8d28](https://github.com/sytone/obsidian-queryallthethings/commits/71e8d284a115b1dd2506f0904d70d9b515df1226))
* update snippet injector version ([121a621](https://github.com/sytone/obsidian-queryallthethings/commits/121a6213ba955410f2ee66057b1ca6cd1a2da986))
* update snippet injector with LF base generation notice ([4451317](https://github.com/sytone/obsidian-queryallthethings/commits/4451317c8e0cdca89010c05725c681302800c64a))

## [1.0.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.9.0...1.0.0) (2024-06-21)

This is a larger release, it may cause your queries to break as there are column and table changes. It is recommended to use the obsidian_notes, obsidian_lists and obsidian_tasks tables. These have been improved and are the primary way to query Obsidian using SQL based queries. This will also allow the tables to be accessed via JS script in other plugins. It also opens up better integration in the future.

On load you will also see status on the caching progress, I have worked to make this as fast as possible and will be looking at caching in the future, at the moment around 2000 files takes a few seconds on a desktop, on iOS it is pretty much instantaneous.

### Features

* Add 'qatt:all-notes-loaded' event to obsidian-ex.d.ts ([4542b0c](https://github.com/sytone/obsidian-queryallthethings/commits/4542b0c207861d3b99238bb91d1345f7ec365e2e))
* add ability to get measurement and code and comment cleanup ([1cdee59](https://github.com/sytone/obsidian-queryallthethings/commits/1cdee59399a3509f7991a0ae879a77bbca5fdb6a))
* add button to push metrics to console ([dcd62f9](https://github.com/sytone/obsidian-queryallthethings/commits/dcd62f9924489b715fda78f036a84ee0a224736d))
* add editor menu ([ad8e475](https://github.com/sytone/obsidian-queryallthethings/commits/ad8e475772fcf68bd2667c38ef3fe99bbecd4d90))
* add message while cache populates ([723fcd5](https://github.com/sytone/obsidian-queryallthethings/commits/723fcd5e131278021d207fa06f56e7b9acfd1069))
* add metrics service to collect plugin metrics to a single location ([b1745eb](https://github.com/sytone/obsidian-queryallthethings/commits/b1745eb92f46b41c98ef694c593089a8f83a7f73))
* add obsidian help and joinarray sql function ([98a3774](https://github.com/sytone/obsidian-queryallthethings/commits/98a3774157970fb5363499fb82cb978cf96e8959))
* add path as a property of list items and task items ([1c34ce8](https://github.com/sytone/obsidian-queryallthethings/commits/1c34ce8f1a34ae914214915905d5f4f1c46a9ea9))
* add prototype of UI to edit codeblcoks and queries ([cefb036](https://github.com/sytone/obsidian-queryallthethings/commits/cefb036a8684bb93d4466954775e44d8ca122ae6))
* add settings to disable missing dv and cjs plugins ([ba74125](https://github.com/sytone/obsidian-queryallthethings/commits/ba741259488d6285381610ea2aa9d9e63f6f47c7))
* add simple metrics ([b4c5694](https://github.com/sytone/obsidian-queryallthethings/commits/b4c56946f039d301a3387ce1a00fc800ba19b75d))
* add two sql functions for line based search ([56543b3](https://github.com/sytone/obsidian-queryallthethings/commits/56543b36767e61c81814ff0ae9f4d1eb6ba71cf8))
* add types for menus ([5f60a7c](https://github.com/sytone/obsidian-queryallthethings/commits/5f60a7cb50d25aed6eaa0fc65d0959a27a733ae7))
* added command to show metrics to console ([329c391](https://github.com/sytone/obsidian-queryallthethings/commits/329c391b18e51017536181e41e728943558ac9f1))
* additional query loading message and fixed frontmatter loading ([b2dc0f4](https://github.com/sytone/obsidian-queryallthethings/commits/b2dc0f4131a197a0f44d80b3570a85aa600b3630))
* cleanup new tables in default database ([58605d0](https://github.com/sytone/obsidian-queryallthethings/commits/58605d01588d3ffa035517c02ed6734c61ef7f81))
* enable daily codeblock replacement ([8d1e01f](https://github.com/sytone/obsidian-queryallthethings/commits/8d1e01f5d57472452e4a744ddda454a0e3f46091))
* enable default folders for query and template files and enable UI for editing codeblock ([37e467d](https://github.com/sytone/obsidian-queryallthethings/commits/37e467deea852f247142925814e751a02b331e32))
* enable partial append ([8261886](https://github.com/sytone/obsidian-queryallthethings/commits/826188605254d01a1afc5a5188b066754ae90fef))
* enable processing of DataView Inline tasks ([2db62a8](https://github.com/sytone/obsidian-queryallthethings/commits/2db62a8772b263def0934d9f9c62cc3f85eeb493)), closes [#11](https://github.com/sytone/obsidian-queryallthethings/issues/11)
* enable tables to be natively available in the alasql database ([b11d752](https://github.com/sytone/obsidian-queryallthethings/commits/b11d7527f50256e6b644ffa5a3939861a1e549e8))
* move data table functions to use metrics and add measurement to metrics service ([e94898d](https://github.com/sytone/obsidian-queryallthethings/commits/e94898da570abe19819b610373ee90773d04991f))
* notice on indexing ([f23d965](https://github.com/sytone/obsidian-queryallthethings/commits/f23d96506c167f5388f17763b092f7828377bcd5))
* register for all notes loaded event to force update on data population ([106296b](https://github.com/sytone/obsidian-queryallthethings/commits/106296b724355fbc01706748e7657d80634bb1e3))
* simplify notes cache ([ecca054](https://github.com/sytone/obsidian-queryallthethings/commits/ecca05474f97f88d73ddbf59b1d6d7673994d7a7))
* test additional internal render child approach ([17feaf7](https://github.com/sytone/obsidian-queryallthethings/commits/17feaf7931d1b1c3f6e269d52006c8ede8ec0147))
* update handlebars helpers ([7c14bc2](https://github.com/sytone/obsidian-queryallthethings/commits/7c14bc29f9b1195baac38b1dab4543a1735beb6c))
* update settings text and enable metrics collection ([9e6cdc6](https://github.com/sytone/obsidian-queryallthethings/commits/9e6cdc6f622b54924ee2a520b1a41d0d0a79aaea))
* update to use indexed tables properly ([5d1c7a8](https://github.com/sytone/obsidian-queryallthethings/commits/5d1c7a82ed977533bf942a33ae8eafc381282789))


### Documentation

* ad cleanTask to docs on tasks object ([3b76cb9](https://github.com/sytone/obsidian-queryallthethings/commits/3b76cb962e383729bbf5e930deab0428094594a9))
* added example for replaceTargetPath ([88fde46](https://github.com/sytone/obsidian-queryallthethings/commits/88fde46e211ff3961aee1e5d708880d61ed7ee33))
* change injection newline option ([194a79c](https://github.com/sytone/obsidian-queryallthethings/commits/194a79c2c64dbe1a06f63cf65f20e84a8c5f3821))
* clarified the live example part ([b90e7bd](https://github.com/sytone/obsidian-queryallthethings/commits/b90e7bd328027cd805c5504f9e9a082500fb2b9f))
* Create CODE_OF_CONDUCT.md ([4877e8a](https://github.com/sytone/obsidian-queryallthethings/commits/4877e8ad01953d81730c6a6b18342fdd8e6db003))
* Create CONTRIBUTING.md ([a42e842](https://github.com/sytone/obsidian-queryallthethings/commits/a42e842b617d67f659a6dd4e63ad1cb2024b588d))
* Create pull_request_template.md ([a493730](https://github.com/sytone/obsidian-queryallthethings/commits/a4937306558b9dcc39b71a2cf1ef18ebea0cc884))
* Create SECURITY.md ([9b1d697](https://github.com/sytone/obsidian-queryallthethings/commits/9b1d697a8d03b84cbe775251f5c3b9be521c76a3))
* regenerated docs with new snippet injector version ([e5836b2](https://github.com/sytone/obsidian-queryallthethings/commits/e5836b24d6a0c9e386c67adfc88349b9eb5675dc))
* set obsidian selected page to index ([8bf235c](https://github.com/sytone/obsidian-queryallthethings/commits/8bf235cb461335e1d1b3f47ed91ed33b12940312))
* switch from source and make it reading ([fb92b2c](https://github.com/sytone/obsidian-queryallthethings/commits/fb92b2c5cbb26c62ff82b0128fb6be258f43162b))
* update all documentation ([f52c67d](https://github.com/sytone/obsidian-queryallthethings/commits/f52c67daff09f9b74177bd6ec59e091fcf503ffc))
* update build instructions ([6012eeb](https://github.com/sytone/obsidian-queryallthethings/commits/6012eebff46e33ab49884f2de834612f720c53c1))
* update generated to be just date ([21c18c9](https://github.com/sytone/obsidian-queryallthethings/commits/21c18c9757c1e4574643bd34c57318263bc1be36))
* update joinarray documentation ([641ebe6](https://github.com/sytone/obsidian-queryallthethings/commits/641ebe636e95ded407b76b25fa63db569cacd7c1))
* update plugins and codeblock structure ([6268e11](https://github.com/sytone/obsidian-queryallthethings/commits/6268e1113d53d000414ef6dc6dbe2997cfe6ad18))


### Internal

* added comments on new tables ([ca98c01](https://github.com/sytone/obsidian-queryallthethings/commits/ca98c01cf38e7dbaec3e8d9f37995dd58041eb71))
* beta release pipeline ([528d8f6](https://github.com/sytone/obsidian-queryallthethings/commits/528d8f6ab9d235eb8ac573988ccf1f2445d66e8e))
* **deps-dev:** bump @babel/traverse from 7.23.0 to 7.23.9 ([#12](https://github.com/sytone/obsidian-queryallthethings/issues/12)) ([647d88f](https://github.com/sytone/obsidian-queryallthethings/commits/647d88f82a6419afd1c7ba6865d8de56a825dd65))
* fix tag filter for release build ([6bc404e](https://github.com/sytone/obsidian-queryallthethings/commits/6bc404e18a7bf2c92e10477f381ed58baa19cc5b))
* move to node test runner and node v20 ([7c21ecc](https://github.com/sytone/obsidian-queryallthethings/commits/7c21ecc9aa49b6143953467bf5ff55477caccd12))
* moving to LF only in windows due to Obsidan defaults ([f114437](https://github.com/sytone/obsidian-queryallthethings/commits/f11443778342c9d8137ba1d74c76d186b28887ac))
* **release:** 0.10.0 ([6e0ac71](https://github.com/sytone/obsidian-queryallthethings/commits/6e0ac71fc59e5bc74df6da77c6a6dc288abde6b2))
* remove non used references ([83b22cf](https://github.com/sytone/obsidian-queryallthethings/commits/83b22cf0a06bdd110972d4bdae49d3dc08184f0e))
* Update dependencies in tsconfig.json and package.json ([568fa04](https://github.com/sytone/obsidian-queryallthethings/commits/568fa04c35d54fb9ce03309afd367e7b4b6de013))
* update dev container ([cfae98c](https://github.com/sytone/obsidian-queryallthethings/commits/cfae98c02f142a53dca68211dd7f9f9a124982f4))
* Update issue templates ([1cb2c89](https://github.com/sytone/obsidian-queryallthethings/commits/1cb2c8964c8405cb33d76d2a7826c87c87b03377))
* update markdown snippet injector ([71e8d28](https://github.com/sytone/obsidian-queryallthethings/commits/71e8d284a115b1dd2506f0904d70d9b515df1226))
* update snippet injector version ([121a621](https://github.com/sytone/obsidian-queryallthethings/commits/121a6213ba955410f2ee66057b1ca6cd1a2da986))
* update snippet injector with LF base generation notice ([4451317](https://github.com/sytone/obsidian-queryallthethings/commits/4451317c8e0cdca89010c05725c681302800c64a))


### Bug Fixes and Changes

* load order and event notifications ([7027050](https://github.com/sytone/obsidian-queryallthethings/commits/7027050b1753be3c499cebc71a8b7b224142affd))
* merge of stash ([07888ed](https://github.com/sytone/obsidian-queryallthethings/commits/07888edd126a5021b7252730ab9fa81f500436c4))
* parsing of inline values to handle braces as well ([66d604a](https://github.com/sytone/obsidian-queryallthethings/commits/66d604af04f012320a03099b5e6edc1a681c7be3))
* reduce logging output ([cb770c4](https://github.com/sytone/obsidian-queryallthethings/commits/cb770c4149ceba11bd1201a8baef6c121a0fccde))
* remove direct async call ([bd40252](https://github.com/sytone/obsidian-queryallthethings/commits/bd4025204a5d5b4163ba4730dafbb9f6cb4cdadf))
* remove duplicate cache declaration ([2fca160](https://github.com/sytone/obsidian-queryallthethings/commits/2fca1608168126292455b70c4294e9a390bd361f))
* remove tags from clean task string and update docs ([83f3609](https://github.com/sytone/obsidian-queryallthethings/commits/83f3609cd9f095cd3b3ef90553f0c473997f3cfa))
* task item update from db ([86f984f](https://github.com/sytone/obsidian-queryallthethings/commits/86f984f90120137c1e28eae68eec54a1579ed10b))
* update LINEINDEX sql function to handle emoji characters ([b9f5ce2](https://github.com/sytone/obsidian-queryallthethings/commits/b9f5ce20b3be126fe3d9809f49bc80da1b744316))
* update logging display and entries ([6117841](https://github.com/sytone/obsidian-queryallthethings/commits/6117841e95d386a29d019661835a53be3abbe029))
* updated test for new list constructor ([1d0674a](https://github.com/sytone/obsidian-queryallthethings/commits/1d0674a5f2e8065f277620f3565bc25d5a929016))

## [0.10.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.9.0...0.10.0) (2024-02-02)


### Features

* add obsidian help and joinarray sql function ([98a3774](https://github.com/sytone/obsidian-queryallthethings/commits/98a3774157970fb5363499fb82cb978cf96e8959))
* add settings to disable missing dv and cjs plugins ([ba74125](https://github.com/sytone/obsidian-queryallthethings/commits/ba741259488d6285381610ea2aa9d9e63f6f47c7))
* add two sql functions for line based search ([56543b3](https://github.com/sytone/obsidian-queryallthethings/commits/56543b36767e61c81814ff0ae9f4d1eb6ba71cf8))
* enable processing of DataView Inline tasks ([2db62a8](https://github.com/sytone/obsidian-queryallthethings/commits/2db62a8772b263def0934d9f9c62cc3f85eeb493)), closes [#11](https://github.com/sytone/obsidian-queryallthethings/issues/11)


### Internal

* moving to LF only in windows due to Obsidan defaults ([f114437](https://github.com/sytone/obsidian-queryallthethings/commits/f11443778342c9d8137ba1d74c76d186b28887ac))
* update snippet injector version ([121a621](https://github.com/sytone/obsidian-queryallthethings/commits/121a6213ba955410f2ee66057b1ca6cd1a2da986))
* update snippet injector with LF base generation notice ([4451317](https://github.com/sytone/obsidian-queryallthethings/commits/4451317c8e0cdca89010c05725c681302800c64a))


### Documentation

* added example for replaceTargetPath ([88fde46](https://github.com/sytone/obsidian-queryallthethings/commits/88fde46e211ff3961aee1e5d708880d61ed7ee33))
* change injection newline option ([194a79c](https://github.com/sytone/obsidian-queryallthethings/commits/194a79c2c64dbe1a06f63cf65f20e84a8c5f3821))
* clarified the live example part ([b90e7bd](https://github.com/sytone/obsidian-queryallthethings/commits/b90e7bd328027cd805c5504f9e9a082500fb2b9f))
* regenerated docs with new snippet injector version ([e5836b2](https://github.com/sytone/obsidian-queryallthethings/commits/e5836b24d6a0c9e386c67adfc88349b9eb5675dc))
* set obsidian selected page to index ([8bf235c](https://github.com/sytone/obsidian-queryallthethings/commits/8bf235cb461335e1d1b3f47ed91ed33b12940312))
* switch from source and make it reading ([fb92b2c](https://github.com/sytone/obsidian-queryallthethings/commits/fb92b2c5cbb26c62ff82b0128fb6be258f43162b))
* update generated to be just date ([21c18c9](https://github.com/sytone/obsidian-queryallthethings/commits/21c18c9757c1e4574643bd34c57318263bc1be36))
* update plugins and codeblock structure ([6268e11](https://github.com/sytone/obsidian-queryallthethings/commits/6268e1113d53d000414ef6dc6dbe2997cfe6ad18))

## [0.9.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.10...0.9.0) (2023-12-28)


### Features

* cleanup announcement service ([b085a91](https://github.com/sytone/obsidian-queryallthethings/commits/b085a914b3337ffea2bbd9c1ffcac9ca9b79019a))
* cleanup command handlers and release notes ([3e16730](https://github.com/sytone/obsidian-queryallthethings/commits/3e16730cfce3ccc9d0f2209482b79c17fc352c7e))
* dynamic done state management for tasks ([0e43833](https://github.com/sytone/obsidian-queryallthethings/commits/0e438339915ccd1691e96b52913ed340e1e86429))
* **query:** enable correct extraction of page properties for use in queries ([4f650f7](https://github.com/sytone/obsidian-queryallthethings/commits/4f650f7576b4327fc3107386deac3950c768734e))
* refactored the post render code to be separate ([b6d7f05](https://github.com/sytone/obsidian-queryallthethings/commits/b6d7f050086e85326b33723c841bf631134a445f))
* **render:** updated rendered insertion into dom ([ef37ed6](https://github.com/sytone/obsidian-queryallthethings/commits/ef37ed6a7b1d0875509385f44efca3f65716763a))
* simplify function management ([76c12f2](https://github.com/sytone/obsidian-queryallthethings/commits/76c12f2e84e6ec0eaf718c983bb8156b33e7a6d0))
* update task management capabilities ([549f744](https://github.com/sytone/obsidian-queryallthethings/commits/549f744bd75378458abf4dbb73db95dd41ba47d7))


### Bug Fixes and Changes

* file render cleanup ([b17c130](https://github.com/sytone/obsidian-queryallthethings/commits/b17c1303e0e06c1c094c37bab9fd6b87f493ac86))
* make markdown table parsing more robust ([825f6f8](https://github.com/sytone/obsidian-queryallthethings/commits/825f6f848149bfbbe55b706785be33a579f4decb))
* **query:** set tables being used to qatt by default for refresh events ([293ef62](https://github.com/sytone/obsidian-queryallthethings/commits/293ef6246bac23a6ca9a544c9b7045c8a99faf9d))
* remove external helpers breaking render engine ([41ab05c](https://github.com/sytone/obsidian-queryallthethings/commits/41ab05cb8a9c1160e4fb1b53d14179c402b9d1d1))
* update lock file ([8e730a3](https://github.com/sytone/obsidian-queryallthethings/commits/8e730a36c108aaca7abe97fa211dbe279369edb1))


### Documentation

* add renamed calendar reference table back ([829ae82](https://github.com/sytone/obsidian-queryallthethings/commits/829ae82f11eceed051b2700f30b0f6be2f68c0a3))
* add ttrpg example and update for new rendering model ([3997a8c](https://github.com/sytone/obsidian-queryallthethings/commits/3997a8c35a0016ba4e6b15b6a028fcf48de77000))
* added a simple note listing example ([f154c67](https://github.com/sytone/obsidian-queryallthethings/commits/f154c67f669de14f0b2fb48193e5beceb7a668e8))
* added more examples ([788cce2](https://github.com/sytone/obsidian-queryallthethings/commits/788cce2f6a44f7bb4ed49cf6e0c42a888d05ca0d))
* change to dark theme ([3c5e37a](https://github.com/sytone/obsidian-queryallthethings/commits/3c5e37a68083ada7291f9e49e6a0c09a2991483f))
* fixed link top example ([6e04182](https://github.com/sytone/obsidian-queryallthethings/commits/6e04182e11701d7034fe846491f61791ac728843))
* move examples content ([aa01e4a](https://github.com/sytone/obsidian-queryallthethings/commits/aa01e4aaa94560cfab2732900b5ac66a1415611c))
* test path changes ([fc0b874](https://github.com/sytone/obsidian-queryallthethings/commits/fc0b874379deef1174a93030ba5699c727d20f79))


### Internal

* add noteLink handler back ([ddf2175](https://github.com/sytone/obsidian-queryallthethings/commits/ddf2175211da3ea9f40424af904bda963893370c))
* **docs:** update vault plugins and settings ([6c6df7c](https://github.com/sytone/obsidian-queryallthethings/commits/6c6df7cdc649252dce5d02d6fd95b3e8ea8ebfeb))
* fix casing issue ([935c57e](https://github.com/sytone/obsidian-queryallthethings/commits/935c57ec9034559fc13c164a6baa3879171440d7))
* helper functions and documentation moves ([7da3ff6](https://github.com/sytone/obsidian-queryallthethings/commits/7da3ff6389c87900a2ea8b63dfc2a8b7275f1c54))
* more handler cleanup and service abstraction ([83c20ae](https://github.com/sytone/obsidian-queryallthethings/commits/83c20ae9fe1b87867633ef13033461812995ead2))
* move remaining helpers to separate files ([90cccbc](https://github.com/sytone/obsidian-queryallthethings/commits/90cccbc3814a52e8a18c970a08804b8f622a74cb))
* prepare for next release ([b429a56](https://github.com/sytone/obsidian-queryallthethings/commits/b429a56549de03d2c3aecb42b0d7886430e05248))
* remove download link as it is the announcement template ([5ff5280](https://github.com/sytone/obsidian-queryallthethings/commits/5ff5280cb084e9aaa98f9ee4b46951a5023a8b6d))
* **render:** cleanup of render logic to increase maintinability ([aebcfeb](https://github.com/sytone/obsidian-queryallthethings/commits/aebcfeb83cd202dd2375a58251bbca9a1eb66827))
* update commit settings ([2e577f6](https://github.com/sytone/obsidian-queryallthethings/commits/2e577f62201538e5e2a3dd9891e53b17c0cf2e00))
* update docs path ([31bff78](https://github.com/sytone/obsidian-queryallthethings/commits/31bff785fa075ee06d5c6224816201ec9e15f40f))

### [0.8.10](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.9...0.8.10) (2023-12-05)


### Bug Fixes and Changes

* customjs plugin check ([959f7b7](https://github.com/sytone/obsidian-queryallthethings/commits/959f7b77c87a964f9d78236116bcaf9674e79e5a))

### [0.8.9](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.8...0.8.9) (2023-12-05)


### Bug Fixes and Changes

* disable extra handlebars helpers and move dataview check to handle async race ([a188054](https://github.com/sytone/obsidian-queryallthethings/commits/a18805499ced7cdccad7e547ea13268799675f32))

### [0.8.8](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.7...0.8.8) (2023-12-02)


### Features

* enable frontmatter data to be queried for page ([cb13701](https://github.com/sytone/obsidian-queryallthethings/commits/cb1370127179bfdf55d5f414c43f615f5fe2b5fe))
* **render:** add 100+ handlebars helpers to rendering templates ([5f015f4](https://github.com/sytone/obsidian-queryallthethings/commits/5f015f42434d7036765df67aa7a9acf57a6d133e))
* return all query results as collection to be rendered and not just last query ([83e48aa](https://github.com/sytone/obsidian-queryallthethings/commits/83e48aa6ef34e9e8fda87902059e2237fe9b46d5))


### Bug Fixes and Changes

* add exclude to properties of example pages ([b9d6150](https://github.com/sytone/obsidian-queryallthethings/commits/b9d6150f1b6d887fb78e769603e8dd16a571e601))
* remove log entry from get tasks function ([b150d19](https://github.com/sytone/obsidian-queryallthethings/commits/b150d194c0733cd216d079438a15e2220c17b1e0))


### Internal

* cleanup actions files ([7f65413](https://github.com/sytone/obsidian-queryallthethings/commits/7f654135568cfb0cc0207111c7707b8d14608380))


### Documentation

* added help Url so HelpMate support is avaliable. ([861ab56](https://github.com/sytone/obsidian-queryallthethings/commits/861ab56b3911cc6e0da2a9bac1cd94f24b2de6af))
* update examples and simple queries ([87ad280](https://github.com/sytone/obsidian-queryallthethings/commits/87ad280e8fcb34d98ad3c22298ff071785fc709b))

### [0.8.7](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.6...0.8.7) (2023-11-08)


### Features

* add suggestore and setting display state ([150063b](https://github.com/sytone/obsidian-queryallthethings/commits/150063bbd367a30c355d50d5a66945504690c479))
* add updatePropertyFromList sql function ([e20b590](https://github.com/sytone/obsidian-queryallthethings/commits/e20b5902b1b69915e4ed6ed93cc0360cdfe6547d))


### Documentation

* add sql union documentation and example ([3a973b2](https://github.com/sytone/obsidian-queryallthethings/commits/3a973b2c8327c368e61209cde0ccd9eade131c1b))


### Internal

* add warning for CustomJS plugin if missing ([c7864a8](https://github.com/sytone/obsidian-queryallthethings/commits/c7864a852c54891aaea1021b9538c7efe2c6f920))

### [0.8.6](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.5...0.8.6) (2023-10-28)


### Features

* add internal tasks table for queries ([da650aa](https://github.com/sytone/obsidian-queryallthethings/commits/da650aa300c7d07287ec0042b5b3db346cdf4a40))

### [0.8.5](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.4...0.8.5) (2023-10-28)

### [0.8.4](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.3...0.8.4) (2023-10-27)


### Documentation

* Add documentation for obsidian_markdown_lists ([e994e8f](https://github.com/sytone/obsidian-queryallthethings/commits/e994e8f9296649b465d59fcaa0f2b816d2b84e05))
* update readme and changelog ([5538dd9](https://github.com/sytone/obsidian-queryallthethings/commits/5538dd9ef7b5fef031adb0f36ecb193bd696fb9f))

### [0.8.3](https://github.com/sytone/obsidian-queryallthethings/compare/0.8.0...0.8.3) (2023-10-25)

### Features

* add loading of SQL based queries from files on start ([c609966](https://github.com/sytone/obsidian-queryallthethings/commits/c60996656b75ff326270084aa77eb719334f48c6))
* add list items table from notes cache ([515dec8](https://github.com/sytone/obsidian-queryallthethings/commits/515dec8ad235e280c47bdeb1082b97b1080025d7))
* move to new ophidian version ([25e7fa5](https://github.com/sytone/obsidian-queryallthethings/commits/25e7fa5fa2d9e2863533fdb39e78cb44b76b1b13))
* numbers in markdown tables are imported as integers ([aad8be4](https://github.com/sytone/obsidian-queryallthethings/commits/aad8be4128f77db81f8f9dc08c91e45cd6e43c06))

### Bug Fixes and Changes

* move code block registration to last ([9e7b454](https://github.com/sytone/obsidian-queryallthethings/commits/9e7b454ca3c979bdf4e2632602e9e648f1ac756d))
* correct dataview import case ([000e56b](https://github.com/sytone/obsidian-queryallthethings/commits/000e56b2eabd53e0e64359a3eb9f4a8735e40e3b))

### Documentation

* migrate to new snippet format ([0d1cb91](https://github.com/sytone/obsidian-queryallthethings/commits/0d1cb91e2ad6c328d21a99f3902be8fe542461f9))

### Internal

* **deps-dev:** bump activesupport from 7.0.5 to 7.0.7.2 in /docs ([#8](https://github.com/sytone/obsidian-queryallthethings/issues/8)) ([c762562](https://github.com/sytone/obsidian-queryallthethings/commits/c762562422d6d60a0c21f652b954876ce86c5d8f))
* remove old tests ([8516ead](https://github.com/sytone/obsidian-queryallthethings/commits/8516eadf30bf8393669f429230a08e48d09cd6c8))

## [0.8.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.7.1...0.8.0) (2023-08-18)

### Features

* importers reload data on change and added json support and web support ([1309970](https://github.com/sytone/obsidian-queryallthethings/commits/13099706ce0f63e87bd98924f245ddcee233691a))

### Internal

* abstract dataview and enable better async support ([817bda1](https://github.com/sytone/obsidian-queryallthethings/commits/817bda18bb02b806648e2cc2327539de2ec1f61f))
* **deps-dev:** bump commonmarker from 0.23.9 to 0.23.10 in /docs ([#5](https://github.com/sytone/obsidian-queryallthethings/issues/5)) ([ca93cad](https://github.com/sytone/obsidian-queryallthethings/commits/ca93cadd87c22b4a2c74f56874c2fc50f1182011))
* update comments ([1ee8e4c](https://github.com/sytone/obsidian-queryallthethings/commits/1ee8e4c4ffe2e9c0d5c12bda87ca38e5c9e4ced5))

### [0.7.1](https://github.com/sytone/obsidian-queryallthethings/compare/0.7.0...0.7.1) (2023-08-07)

### Bug Fixes and Changes

* update lock file ([fe7cc30](https://github.com/sytone/obsidian-queryallthethings/commits/fe7cc30ca6ac7e3bc86dc1c6b8edca2e702f5b15))

## [0.7.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.6.0...0.7.0) (2023-08-07)

### Features

* allow CSV and markdown table import on start ([3bf8c23](https://github.com/sytone/obsidian-queryallthethings/commits/3bf8c23fcb714962eca78da04e17f631f0740882))

### Documentation

* split up the tables reference pages ([04cfec9](https://github.com/sytone/obsidian-queryallthethings/commits/04cfec9930687d5fb9966c8577df95785dc3cca9))

### Bug Fixes and Changes

* template logging and default template work ([b733449](https://github.com/sytone/obsidian-queryallthethings/commits/b733449d1adc9c3b22eda75b42841efe0a3b9598))

## [0.6.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.5.4...0.6.0) (2023-08-06)

### Features

* enable file for query and template and other additions ([efb29e6](https://github.com/sytone/obsidian-queryallthethings/commits/efb29e676b2cad17291ca46f27ebdc17445520f2))
* move notes cache to map for more robust management ([8e01510](https://github.com/sytone/obsidian-queryallthethings/commits/8e015103dbfa8a6a5212b63dce146a03357899ab))

### Documentation

* update structure and enable obsidan vault for docs ([85c3d7e](https://github.com/sytone/obsidian-queryallthethings/commits/85c3d7e7cf1ce25cb5d6354a602686b3ae3450fb))

### Internal

* enable automatic discussion creation on release ([154c3d6](https://github.com/sytone/obsidian-queryallthethings/commits/154c3d672492c701482fc7659c8c55da8a284b30))
* enable logging to determine release message issue ([150be44](https://github.com/sytone/obsidian-queryallthethings/commits/150be44bdba9c1000c600dcb6f4da62afca32dc5))
* make release draft to enable release notes updates ([328da6c](https://github.com/sytone/obsidian-queryallthethings/commits/328da6cd23b158cc287de3a9006d26f89e18915e))

### Bug Fixes and Changes

* internal caching cleanup part 1 ([79a52d9](https://github.com/sytone/obsidian-queryallthethings/commits/79a52d95e262f374a12e36945aa0337db783a7d8))

### [0.5.4](https://github.com/sytone/obsidian-queryallthethings/compare/0.5.3...0.5.4) (2023-08-02)

### Features

* update dataview_pages to better represent expectations ([f09ed22](https://github.com/sytone/obsidian-queryallthethings/commits/f09ed22e194778ace4b2d7463c4656f94366edba))

### Documentation

* improved documentation and examples ([f0eaf44](https://github.com/sytone/obsidian-queryallthethings/commits/f0eaf44a5e0cf68ccfb1bb0593457c4a99ccf65f))

### [0.5.3](https://github.com/sytone/obsidian-queryallthethings/compare/0.5.2...0.5.3) (2023-07-31)

### Internal

* add pnpm install ([2ba888d](https://github.com/sytone/obsidian-queryallthethings/commits/2ba888daee93709671eb16d96f649588fa9c3492))

### [0.5.2](https://github.com/sytone/obsidian-queryallthethings/compare/0.5.1...0.5.2) (2023-07-31)

### Bug Fixes and Changes

* update Jekyll preprocessing callout regex ([6e1c282](https://github.com/sytone/obsidian-queryallthethings/commits/6e1c282ebe567c203b65d80980a516838836b7ed))

### Internal

* cleanup obsidian references ([d6329b1](https://github.com/sytone/obsidian-queryallthethings/commits/d6329b1b4aa1b7a82ada77b97b7df4753d0b2e63))
* move to mocha ([6ced0ad](https://github.com/sytone/obsidian-queryallthethings/commits/6ced0ad1f7de86f203748f1d85fa5f6c1e168f50))
* moved to jest with it actually working ([5885f30](https://github.com/sytone/obsidian-queryallthethings/commits/5885f30c51800af4a49e9b34ce635ac102fd0b95))

### Documentation

* added codeblock configuration ([042f5f8](https://github.com/sytone/obsidian-queryallthethings/commits/042f5f89fb5e3346c5ebcc4a11e2940c0d96adb0))
* fix codeblock yaml header ([1621a72](https://github.com/sytone/obsidian-queryallthethings/commits/1621a7200b7876b005a0fcb6d54ec90de3d27a68))
* fix rendering of handlebars example ([54add08](https://github.com/sytone/obsidian-queryallthethings/commits/54add08567b91d11ed9afe488d27342364c88dd4))
* try to update template excaping ([bbdb707](https://github.com/sytone/obsidian-queryallthethings/commits/bbdb70761036515432515cb324fd0dc0e0ba8790))
* update snippet insertion ([2bc6052](https://github.com/sytone/obsidian-queryallthethings/commits/2bc60529e0b508e2faf1ae36a4e2d0d275bff38c))

### [0.5.1](https://github.com/sytone/obsidian-queryallthethings/compare/0.5.0...0.5.1) (2023-06-13)

### Internal

* resolve points raised on submission to community plugin list ([6ffff69](https://github.com/sytone/obsidian-queryallthethings/commits/6ffff69bdef63e5a9d97dc45257ae592c146dbd1))

## [0.5.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.4.4...0.5.0) (2023-06-12)

### Features

* updated template helpers for priority and markdown rendering ([539f6b9](https://github.com/sytone/obsidian-queryallthethings/commits/539f6b99242de5a685dce4bce325c5933d99c28d))

### [0.4.4](https://github.com/sytone/obsidian-queryallthethings/compare/0.4.3...0.4.4) (2023-06-08)

### Internal

* general code cleanup ([29c3f68](https://github.com/sytone/obsidian-queryallthethings/commits/29c3f68cfc37c60e5f7e1d23185968b00738577a))
* updating the commit formatting ([bfda239](https://github.com/sytone/obsidian-queryallthethings/commits/bfda23969b4301636e4d6450ccc291254c684cf7))

### Bug Fixes and Changes

* add notice to startup sql option in settings ([5d151a7](https://github.com/sytone/obsidian-queryallthethings/commits/5d151a743d5d51c1fae2dc9660296c91c2cf1b35))

### Documentation

* add starter examples and cleanup ([e4d7e7b](https://github.com/sytone/obsidian-queryallthethings/commits/e4d7e7b9b4590d74e19ef6d42f589b4a6cadcb54))
* fix about title ([9bf2877](https://github.com/sytone/obsidian-queryallthethings/commits/9bf28775fce22c36d90e00213bf97b8b15ad347f))
* fix raw processing for jekyll ([5c041a7](https://github.com/sytone/obsidian-queryallthethings/commits/5c041a73621fc6cfc35d40c9d78f6302deca7690))

### [0.4.3](https://github.com/sytone/obsidian-queryallthethings/compare/0.4.2...0.4.3) (2023-06-03)

### [0.4.2](https://github.com/sytone/obsidian-queryallthethings/compare/0.4.1...0.4.2) (2023-06-03)

### [0.4.1](https://github.com/sytone/obsidian-queryallthethings/compare/0.4.0...0.4.1) (2023-06-03)

### Bug Fixes and Changes

* casing ([06e2c54](https://github.com/sytone/obsidian-queryallthethings/commits/06e2c5443d34dd1db86bd8c3e9788bd480451c0a))

## [0.4.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.3.0...0.4.0) (2023-06-03)

### Features

* add calendar reference table ([3430319](https://github.com/sytone/obsidian-queryallthethings/commits/34303190519d8f2df2c5f20ac774798bb994444d))
* add reference table for calendar ([30bdc40](https://github.com/sytone/obsidian-queryallthethings/commits/30bdc40e80c6f5aab052f7f379ed2a74af338a52))
* custom markdown parser and injection for documentation ([5431340](https://github.com/sytone/obsidian-queryallthethings/commits/5431340a82f4097a2f307c98c395dd3241d89ea6))
* enable default post render to be set ([e3be26d](https://github.com/sytone/obsidian-queryallthethings/commits/e3be26d185ab4681581f7e2045db85c809da51f3))

### Internal

* move query engine to factory model to allow extension ([ce461da](https://github.com/sytone/obsidian-queryallthethings/commits/ce461da27bfb5820d4fbc2dbcbc1a0173a4a8877))

### Bug Fixes and Changes

* replace hashing approach for markdown handler ([dff37c0](https://github.com/sytone/obsidian-queryallthethings/commits/dff37c0860d9a889cb728bed811dd3ea6c119bfa))

### Documentation

* add basic documents ([43168b1](https://github.com/sytone/obsidian-queryallthethings/commits/43168b12522f4fc4b10d00e6c13c1a0aa405f613))
* remove example file ([8a70eb5](https://github.com/sytone/obsidian-queryallthethings/commits/8a70eb547b17599fae159dc4b435dd8e5c9327d7))

## [0.3.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.2.6...0.3.0) (2023-05-27)

### [0.2.6](https://github.com/sytone/obsidian-queryallthethings/compare/0.2.5...0.2.6) (2023-05-27)

### [0.2.5](https://github.com/sytone/obsidian-queryallthethings/compare/0.2.4...0.2.5) (2023-05-27)

### [0.2.4](https://github.com/sytone/obsidian-queryallthethings/compare/0.2.3...0.2.4) (2023-05-26)

### [0.2.3](https://github.com/sytone/obsidian-queryallthethings/compare/0.2.2...0.2.3) (2023-05-26)

### [0.2.2](https://github.com/sytone/obsidian-queryallthethings/compare/0.2.1...0.2.2) (2023-05-26)

### [0.2.1](https://github.com/sytone/obsidian-queryallthethings/compare/0.2.0...0.2.1) (2023-05-26)

## [0.2.0](https://github.com/sytone/obsidian-queryallthethings/compare/0.1.2...0.2.0) (2023-05-26)

### Features

* add array and map handlers ([19aa266](https://github.com/sytone/obsidian-queryallthethings/commits/19aa266c7e5f1857248e4393135c03eb474acced))
* add multi render structure and cleanup ([98f2102](https://github.com/sytone/obsidian-queryallthethings/commits/98f210296a9e8c0b03f2491d46d04bcfd5c5ff0e))

### [0.1.2](https://github.com/sytone/obsidian-queryallthethings/compare/0.1.1...0.1.2) (2023-05-24)

### 0.1.1 (2023-05-24)

### Features

* enable dataview integration and cached tables ([dc2f67e](https://github.com/sytone/obsidian-queryallthethings/commits/dc2f67ec5c435ebf3cf2473c632733a31f3af13a))
* refresh and checking work ([aa08a14](https://github.com/sytone/obsidian-queryallthethings/commits/aa08a14ea2a341d06e98ba0af2c7ff8b26f9409c))

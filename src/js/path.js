(function (window, $) {
    'use strict';

    window.HieknPathService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            self.isInit = false;
            self.baseSettings = {
                baseUrl: options.baseUrl,
                data: options.data,
                kgName: options.kgName
            };
            self.filterSettings = {
                selectedAtts: options.selectedAtts,
                selectedTypes: options.selectedTypes
            };
            self.infoboxSettings = {
                dataFilter: options.dataFilter,
                selector: options.selector,
                imagePrefix: options.imagePrefix
            };
            $.extend(true, self.infoboxSettings, self.baseSettings);
            self.loaderSettings = {
                dataFilter: options.dataFilter,
                selector: options.selector,
                tgc2: null,
                tgc2Filter: null,
                tgc2Page: null,
                tgc2Stats: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            var nodeColors = options.nodeColors;
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle : true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: nodeColors,
                minRadius: options.minRadius || 10,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = {
                dataFilter: options.dataFilter,
                that: $(options.selector)[0]
            };
            $.extend(true, self.schemaSettings, self.baseSettings);
            self.initSettings = {
                dataFilter: options.dataFilter,
                that: $(options.selector)[0],
                isTiming: false,
                success: function (data) {
                    if (data.relationList && data.relationList.length) {
                        var arr = self.sdkUtils.orderRelation(data.relationList);
                        var start = arr[2] ? arr[2].k : arr[0].k;
                        var end = arr[1].k;
                        self.load({id: new Date().getTime(), start: {'id': start}, end: {'id': end}});
                    }
                },
                failed: $.noop
            };
            $.extend(true, self.initSettings, self.baseSettings);
            self.tgc2Settings = {};

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
                if (options.autoColor) {
                    var colors = {};
                    for (var i in schema.types) {
                        colors[schema.types[i].k] = self.sdkUtils.color[i % self.sdkUtils.color.length];
                    }
                    nodeColors = $.extend(true, colors, nodeColors || {});
                    self.nodeSettings.nodeColors = nodeColors;
                }
                var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
                filters = [{
                    key: 'distance',
                    label: '设定分析步长',
                    selected: options.selectedDistance || 3,
                    options: [3, 4, 5, 6]
                }].concat(filters);
                var defaultOptions = {
                    selector: options.selector,
                    netChart: {
                        settings: {
                            nodeMenu: {
                                contentsFunction: self.sdkUtils.infobox()
                            },
                            style: {
                                nodeStyleFunction: self.sdkUtils.nodeStyleFunction(self.nodeSettings)
                            },
                            info: {
                                linkContentsFunction: self.sdkUtils.linkContentsFunction
                            }
                        }
                    },
                    filter: {
                        enable: true,
                        filters: filters
                    },
                    stats: {
                        enable: true,
                        editable: true,
                        atts: schema.atts,
                        types: schema.types,
                        statsConfig: options.statsConfig
                    },
                    connects: {
                        enable: true,
                        mode: 'click'
                    },
                    crumb: {
                        enable: true
                    },
                    find: {
                        enable: true
                    },
                    legend: {
                        enable: false,
                        data: nodeColors || [],
                        legendDraw: self.sdkUtils.legendDraw(schema, self, options.legendType),
                        onClick: function (e) {
                            self.sdkUtils.legendClick(e, self);
                        },
                        onDblclick: function (e) {
                            self.sdkUtils.legendDblClick(e, self);
                        },
                        onMouseEnter: function (e) {
                            self.sdkUtils.legendMouseEnter(e, self);
                        },
                        onMouseLeave: function (e) {
                            self.sdkUtils.legendMouseLeave(e, self);
                        }
                    },
                    loader: self.sdkUtils.path(self.loaderSettings, schema),
                    schema: schema,
                    path: {
                        prompt: {
                            settings: {
                                drawPromptItem: self.sdkUtils.drawPromptItem(schema),
                                onPrompt: self.sdkUtils.onPrompt(self.promptSettings)
                            }
                        }
                    }
                };
                self.tgc2Settings = $.extend(true, {}, defaultOptions, options.tgc2Settings);
                self.sdkUtils.gentInfobox(self.infoboxSettings);
                self.init();
                if (options.startInfo) {
                    self.load(options.startInfo);
                }
            });
        };

        Service.prototype.init = function () {
            var self = this;
            self.tgc2 = new Tgc2Path(self.tgc2Settings);
            self.tgc2Filter = new Tgc2Filter(self.tgc2, self.tgc2Settings.filter);
            self.tgc2Stats = new Tgc2Stats(self.tgc2, self.tgc2Settings.stats);
            self.tgc2Connects = new Tgc2Connects(self.tgc2, self.tgc2Settings.connects);
            self.tgc2Crumb = new Tgc2Crumb(self.tgc2, self.tgc2Settings.crumb);
            self.tgc2Find = new Tgc2Find(self.tgc2, self.tgc2Settings.find);
            self.tgc2Legend = new Tgc2Legend(self.tgc2, self.tgc2Settings.legend);
            self.loaderSettings.tgc2 = self.tgc2;
            self.loaderSettings.tgc2Filter = self.tgc2Filter;
            self.loaderSettings.tgc2Page = self.tgc2Page;
            self.loaderSettings.tgc2Stats = self.tgc2Stats;
            self.nodeSettings.tgc2 = self.tgc2;
            self.tgc2.init();
            self.isInit = true;
        };

        Service.prototype.load = function (startInfo) {
            var self = this;
            setTimeout(function () {
                if (self.isInit) {
                    // self.tgc2.load(startInfo);
                    if (!startInfo) {
                        self.sdkUtils.graphInit(self.initSettings);
                    } else {
                        self.tgc2.load(startInfo);
                    }
                } else {
                    self.load(startInfo);
                }
            }, 30);
        };

        return Service;
    }
})(window, jQuery);
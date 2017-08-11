(function (window, $) {
    'use strict';

    window.HieknGraphService = gentService();

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
                tgc2Page: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            var nodeColors = options.nodeColors;
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle : true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: nodeColors,
                textColors: options.textColors,
                minRadius: options.minRadius || 10,
                legendClass: null,
                legendColor: null,
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
                    if (data.entityList && data.entityList.length) {
                        self.load(data.entityList[0]);
                    }
                },
                failed: $.noop
            };
            $.extend(true, self.initSettings, self.baseSettings);
            self.tgc2Settings = {};
            self.legendFilter = {};
            self.layoutStatus = options.layoutStatus;

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
                if(options.autoColor){
                    var colors = {};
                    for(var i in schema.types){
                        colors[schema.types[i].k] = self.sdkUtils.color[i % self.sdkUtils.color.length];
                    }
                    nodeColors = $.extend(true,colors,nodeColors || {});
                    self.nodeSettings.nodeColors = nodeColors;
                }
                var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
                filters = [{
                    key: 'distance',
                    label: '设定显示层数',
                    selected: options.selectedDistance || 1,
                    options: [1, 2, 3]
                }].concat(filters);
                var defaultOptions = {
                    selector: options.selector,
                    prompt: {
                        enable: true,
                        settings: {
                            drawPromptItem: self.sdkUtils.drawPromptItem(schema),
                            onPrompt: self.sdkUtils.onPrompt(self.promptSettings)
                        }
                    },
                    page: {
                        enable: true,
                        pageSize: 20
                    },
                    filter: {
                        enable: true,
                        filters: filters
                    },
                    crumb: {
                        enable: true
                    },
                    find: {
                        enable: true
                    },
                    legend: {
                        enable: true,
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
                    netChart: {
                        settings: {
                            filters: {
                                nodeFilter: function (nodeData) {
                                    return self.sdkUtils.nodeFilter(nodeData, self);
                                }
                            },
                            nodeMenu: {
                                contentsFunction: self.sdkUtils.infobox()
                            },
                            style: {
                                node: {
                                    display: options.display || 'circle'
                                },
                                nodeStyleFunction: self.sdkUtils.nodeStyleFunction(self.nodeSettings)
                            },
                            info: {
                                linkContentsFunction: self.sdkUtils.linkContentsFunction
                            }
                        }
                    },
                    loader: self.sdkUtils.graph(self.loaderSettings, schema)
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
            self.tgc2 = new Tgc2Graph(self.tgc2Settings);
            self.tgc2Filter = new Tgc2Filter(self.tgc2, self.tgc2Settings.filter);
            self.tgc2Prompt = new Tgc2Prompt(self.tgc2, self.tgc2Settings.prompt);
            self.tgc2Page = new Tgc2Page(self.tgc2, self.tgc2Settings.page);
            self.tgc2Crumb = new Tgc2Crumb(self.tgc2, self.tgc2Settings.crumb);
            self.tgc2Find = new Tgc2Find(self.tgc2, self.tgc2Settings.find);
            self.tgc2Legend = new Tgc2Legend(self.tgc2, self.tgc2Settings.legend);
            self.loaderSettings.tgc2 = self.tgc2;
            self.loaderSettings.tgc2Filter = self.tgc2Filter;
            self.loaderSettings.tgc2Page = self.tgc2Page;
            self.nodeSettings.tgc2 = self.tgc2;
            self.tgc2.init();
            self.isInit = true;
        };

        Service.prototype.load = function (startInfo) {
            var self = this;
            setTimeout(function () {
                if (self.isInit) {
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
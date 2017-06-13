(function (window, $) {
    'use strict';

    window.HieknTimingGraphService = gentService();

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
                selector: options.selector,
                imagePrefix: options.imagePrefix
            };
            $.extend(true, self.infoboxSettings, self.baseSettings);
            self.loaderSettings = {
                selector: options.selector,
                tgc2: null,
                tgc2Filter: null,
                tgc2TimeChart: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle : true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: options.nodeColors,
                minRadius: options.minRadius || 10,
                legendClass: null,
                legendColor: null,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = {
                that: $(options.selector)[0]
            };
            $.extend(true, self.schemaSettings, self.baseSettings);
            self.initSettings = {
                that: $(options.selector)[0],
                isTiming: true,
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
                var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
                var defaultOptions = {
                    selector: options.selector,
                    autoResize: true,
                    prompt: {
                        enable: true,
                        style: {
                            left: '330px',
                            top: '10px'
                        },
                        settings: {
                            drawPromptItem: self.sdkUtils.drawPromptItem(schema),
                            onPrompt: self.sdkUtils.onPrompt(self.promptSettings)
                        }
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
                        data: options.nodeColors || [],
                        legendDraw: self.sdkUtils.legendDraw(schema, self, options.legendType),
                        onClick: function (e) {
                            self.sdkUtils.legendClick(e, self);
                        },
                        onDblClick: function (e) {
                            self.sdkUtils.legendDblClick(e, self);
                        },
                        onMouseEnter: function (e) {
                            self.sdkUtils.legendMouseEnter(e, self);
                        },
                        onMouseLeave: function (e) {
                            self.sdkUtils.legendMouseLeave(e, self);
                        }
                    },
                    timeChart: {
                        enable: true,
                        style: {
                            right: '20px'
                        }
                    },
                    event: {
                        enable: true
                    },
                    netChart: {
                        style: {
                            left: '320px'
                        },
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
                                nodeStyleFunction: self.sdkUtils.nodeStyleFunction(self.nodeSettings)
                            },
                            info: {
                                linkContentsFunction: self.sdkUtils.linkContentsFunction
                            }
                        }
                    },
                    loader: self.sdkUtils.timing(self.loaderSettings, schema)
                };
                self.tgc2Settings = $.extend(true, {}, defaultOptions, options.tgc2Settings);
                self.sdkUtils.gentInfobox(self.infoboxSettings);
                self.init();
                if(options.startInfo){
                    self.load(options.startInfo);
                }
            });
        };

        Service.prototype.init = function () {
            var self = this;
            self.tgc2 = new Tgc2Graph(self.tgc2Settings);
            self.tgc2Filter = new Tgc2Filter(self.tgc2, self.tgc2Settings.filter);
            self.tgc2TimeChart = new Tgc2TimeChart(self.tgc2, self.tgc2Settings.timeChart);
            self.tgc2Event = new Tgc2Event(self.tgc2, self.tgc2Settings.event);
            self.tgc2Prompt = new Tgc2Prompt(self.tgc2, self.tgc2Settings.prompt);
            self.tgc2Crumb = new Tgc2Crumb(self.tgc2, self.tgc2Settings.crumb);
            self.tgc2Find = new Tgc2Find(self.tgc2, self.tgc2Settings.find);
            self.tgc2Legend = new Tgc2Legend(self.tgc2, self.tgc2Settings.legend);
            self.loaderSettings.tgc2 = self.tgc2;
            self.loaderSettings.tgc2Filter = self.tgc2Filter;
            self.loaderSettings.tgc2TimeChart = self.tgc2TimeChart;
            self.nodeSettings.tgc2 = self.tgc2;
            self.tgc2.init();
            self.isInit = true;
            try {
                self.tgc2TimeChart.$settingModal.find('.input-daterange').datepicker({
                    format: 'yyyy-mm-dd'
                });
                self.tgc2TimeChart.$settingModal.find('.input-daterange').find('input').prop('type', 'text');
            } catch (e) {
            }
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
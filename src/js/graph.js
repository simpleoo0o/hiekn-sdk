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
                selector: options.selector,
                imagePrefix: options.imagePrefix
            };
            $.extend(true, self.infoboxSettings, self.baseSettings);
            self.loaderSettings = {
                selector: options.selector,
                tgc2: null,
                tgc2Filter: null,
                tgc2Page: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle: true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: options.nodeColors,
                minRadius: options.minRadius || 10,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = {
                that: $(options.selector)[0]
            };
            $.extend(true, self.schemaSettings, self.baseSettings);
            self.initSettings = {
                that: $(options.selector)[0],
                isTiming: false,
                success: function (data) {
                    if(data.entityList && data.entityList.length){
                        self.load(data.entityList[0]);
                    }
                },
                failed: $.noop
            };
            $.extend(true, self.initSettings, self.baseSettings);
            self.tgc2Settings = {};

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
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
                        style: {
                            left: '20px',
                            top: '40px'
                        },
                        settings: {
                            drawPromptItem: self.sdkUtils.drawPromptItem(schema),
                            onPrompt: self.sdkUtils.onPrompt(self.promptSettings)
                        }
                    },
                    page: {
                        style: {
                            right: '10px',
                            bottom: '20px'
                        },
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
                    legend:{
                        enable: true,
                        data: options.nodeColors || [],
                        onDraw: self.sdkUtils.legend(schema)
                    },
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
                    loader: self.sdkUtils.graph(self.loaderSettings, schema)
                };
                self.tgc2Settings = $.extend(true, {}, defaultOptions, options.tgc2Settings);
                self.sdkUtils.gentInfobox(self.infoboxSettings);
                self.init();
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
                    if(!startInfo){
                        self.sdkUtils.graphInit(self.initSettings);
                    }else{
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
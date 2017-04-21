(function (window, $) {
    'use strict';

    window.HieknGraphService = gentService();

    function gentService() {
        /**
         * data?:{}
         * baseUrl:string
         * kgName:string
         * selectedAtts?: []
         * selectedTypes?: []
         * selector:string
         * graphSetting:{ selector:string }
         * */

        var Service = function (options) {
            var self = this;
            self.isInit = false;
            self.sdkUtils = new window.HieknSDKService(options);
            self.sdkUtils.schema(options, function (schema) {
                var filters = self.sdkUtils.buildFilter(schema, options);
                filters = [{
                    key: 'distance',
                    label: '设定显示层数',
                    selected: 1,
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
                            onPrompt: self.sdkUtils.onPrompt(options)
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
                    netChart: {
                        filter: {
                            enable: true,
                            filters: filters
                        },
                        settings: {
                            nodeMenu: {
                                contentsFunction: self.sdkUtils.infobox()
                            },
                            style: {
                                nodeStyleFunction: self.sdkUtils.nodeStyleFunction(options)
                            }
                        }
                    },
                    loader: self.sdkUtils.graph(options),
                    schema: schema
                };
                self.options = $.extend(true, {}, defaultOptions, options.graphSetting);
                self.sdkUtils.gentInfobox(options.selector || options.graphSetting.selector);
                self.init();
            });
        };

        Service.prototype.init = function () {
            var self = this;
            self.tgc2 = new Tgc2Graph(self.options);
            self.tgc2Filter = new Tgc2Filter(self.tgc2);
            self.tgc2Prompt = new Tgc2Prompt(self.tgc2);
            self.tgc2Page = new Tgc2Page(self.tgc2);
            self.sdkUtils.updateSettings({tgc2: self.tgc2, tgc2Filter: self.tgc2Filter, tgc2Page: self.tgc2Page});
            self.tgc2.init();
            self.isInit = true;
        };

        Service.prototype.load = function (startInfo) {
            var self = this;
            setTimeout(function () {
                if (self.isInit) {
                    self.tgc2.load(startInfo);
                } else {
                    self.load(startInfo);
                }
            }, 30);
        };

        return Service;
    }
})(window, jQuery);
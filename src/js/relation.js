(function (window, $) {
    'use strict';

    window.HieknRelationService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            self.isInit = false;
            self.sdkUtils = new window.HieknSDKService(options);
            self.sdkUtils.schema(options, function (schema) {
                var filters = self.sdkUtils.buildFilter(schema, options);
                filters = [{
                    key: 'distance',
                    label: '设定分析步长',
                    selected: 3,
                    options: [3, 4, 5, 6]
                }].concat(filters);
                var defaultOptions = {
                    selector: options.selector,
                    netChart: {
                        style: {
                            left: '320px'
                        },
                        settings: {
                            nodeMenu: {
                                contentsFunction: self.sdkUtils.infobox()
                            },
                            style: {
                                nodeStyleFunction: self.sdkUtils.nodeStyleFunction(options)
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
                        enable: true
                    },
                    connects: {
                        enable: true
                    },
                    crumb: {
                        enable: true
                    },
                    find: {
                        enable: true
                    },
                    loader: self.sdkUtils.relation(options, schema),
                    schema: schema,
                    relation: {
                        prompt: {
                            settings: {
                                drawPromptItem: self.sdkUtils.drawPromptItem(schema),
                                onPrompt: self.sdkUtils.onPrompt(options)
                            }
                        }
                    }
                };
                self.options = $.extend(true, {}, defaultOptions, options.relationSetting);
                self.sdkUtils.gentInfobox(options.selector || options.relationSetting.selector);
                self.init();
            });
        };

        Service.prototype.init = function () {
            var self = this;
            self.tgc2 = new Tgc2Relation(self.options);
            self.tgc2Filter = new Tgc2Filter(self.tgc2, self.options.filter);
            self.tgc2Stats = new Tgc2Stats(self.tgc2, self.options.stats);
            self.tgc2Connects = new Tgc2Connects(self.tgc2, self.options.connects);
            self.tgc2Crumb = new Tgc2Crumb(self.tgc2, self.options.crumb);
            self.tgc2Find = new Tgc2Find(self.tgc2, self.options.find);
            self.sdkUtils.updateSettings({tgc2: self.tgc2, tgc2Filter: self.tgc2Filter});
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
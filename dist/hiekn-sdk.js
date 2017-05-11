/**
     * @author: 
     *    jiangrun002
     * @version: 
     *    v0.3.4
     * @license:
     *    Copyright 2017, jiangrun. All rights reserved.
     */

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
                selector: options.selector
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
                images: options.images,
                nodeColors: options.nodeColors,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = self.baseSettings;
            self.tgc2Settings = {};

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
                var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
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
                    self.tgc2.load(startInfo);
                } else {
                    self.load(startInfo);
                }
            }, 30);
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    'use strict';

    window.HieknInfoboxService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                selector: null,
                data: null,
                baseUrl: null,
                kgName: null,
                enableLink: false,
                href: null
            };
            self.settings = $.extend(true, {}, defaultSettings, options);
        };

        Service.prototype.href = function (id) {
            var self = this;
            self.load(id, self.callback);
        };

        Service.prototype.initEvent = function ($container) {
            var self = this;
            $container.on('click', '.hiekn-infobox-link', function () {
                var id = $(this).attr('data-id');
                self.settings.href ? self.settings.href(id, self) : self.href(id);
            });
            $container.on('click', '.hiekn-infobox-info-detail a', function () {
                $(this).closest('.hiekn-infobox-info-detail').toggleClass('on');
            });
        };

        Service.prototype.buildEntity = function (entity, buildLink) {
            var self = this;
            var meaningTag = entity.meaningTag ? '(' + entity.meaningTag + ')' : '';
            var html = '<span class="hiekn-infobox-name">' + entity.name + '<span class="hiekn-infobox-meaningTag">' + meaningTag + '</span></span>';
            if (buildLink && self.settings.enableLink) {
                return '<a href="javascript:void(0)" class="hiekn-infobox-link" data-id="' + entity.id + '">' + html + '</a>';
            }
            return html;
        };

        Service.prototype.buildExtra = function (extra) {
            var detail = extra.v || '-';
            if (extra.v.length > 80) {
                detail = '<span class="hiekn-infobox-info-detail-short">' + extra.v.substring(0, 56) + '<a href="javascript:void(0)">查看全部&gt;&gt;</a></span><span class="hiekn-infobox-info-detail-long">' + extra.v + '<a href="javascript:void(0)">收起&lt;&lt;</a></span>';
            }
            return '<tr><td class="hiekn-infobox-info-label">' + extra.k + '</td><td class="hiekn-infobox-info-detail">' + detail + '</td></tr>';
        };

        Service.prototype.load = function (id, callback, onFailed) {
            var self = this;
            var param = self.settings.data || {};
            param.id = id;
            param.kgName = self.settings.kgName;
            hieknjs.kgLoader({
                url: self.settings.baseUrl + 'infobox',
                type: 1,
                params: param,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        if (callback) {
                            self.callback = callback;
                            callback(data);
                        } else if (self.settings.selector) {
                            var $container = self.buildInfobox(data);
                            $(self.settings.selector).html($container);
                            self.initEvent($container);
                        } else {
                            console.error('selector or callback must be config');
                        }
                    }else{
                        onFailed && onFailed();
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                    onFailed && onFailed();
                }
            });
        };

        Service.prototype.buildInfobox = function (data) {
            var self = this;
            var $infoxbox = $('<div class="hiekn-infobox"></div>');
            if (data.self) {
                $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"></div>');
                var entity = self.buildEntity(data.self, false);
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + entity + '</div>');
                if (data.self.extra) {
                    var html = '';
                    for (var i in data.self.extra) {
                        var extra = data.self.extra[i];
                        html += self.buildExtra(extra);
                    }
                    if (data.atts) {
                        for (var m in data.atts) {
                            if (data.atts.hasOwnProperty(m)) {
                                var att = data.atts[m];
                                var lis = '';
                                for (var j in att.v) {
                                    var obj = att.v[j];
                                    var entity = self.buildEntity(obj, true);
                                    lis += '<li>' + entity + '</li>';
                                }
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            }
                        }
                    }
                    $infoxbox.find('.hiekn-infobox-body').append('<table><tbody>' + html + '</tbody></table>');
                }
                if (data.pars) {
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                    for (var k in data.pars) {
                        var obj = data.pars[k];
                        var entity = self.buildEntity(obj, true);
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + entity + '</li>');
                    }
                }
                if (data.sons) {
                    var html = '';
                    for (var l in data.sons) {
                        var obj = data.sons[l];
                        var entity = self.buildEntity(obj, true);
                        html += '<li>' + entity + '</li>';
                    }
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">相关：</label><ul>' + html + '</ul></div>');
                }
            } else {
                $infoxbox.append('InfoBox读取错误');
            }
            return $infoxbox;
        };

        Service.prototype.buildTabInfobox = function (data) {
            var self = this;
            var $infoxbox = $('<div class="hiekn-infobox hiekn-infobox-tab"></div>');
            if (data.self) {
                $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"><ul class="nav nav-tabs" role="tablist"></ul><div class="tab-content"></div></div>');
                var entity = self.buildEntity(data.self, false);
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + entity + '</div>');
                if (data.self.extra) {
                    var html = '';
                    for (var i in data.self.extra) {
                        var extra = data.self.extra[i];
                        html += self.buildExtra(extra);
                    }
                    var id = 'hiekn-infobox-' + new Date().getTime() + '-' + data.self.id;
                    $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation" class="active"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">基本信息</a></li>');
                    $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-detail tab-pane active" id="' + id + '"><table><tbody>' + html + '</tbody></table></div>');
                }
                if (data.pars) {
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                    for (var k in data.pars) {
                        var obj = data.pars[k];
                        var entity = self.buildEntity(obj, true);
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + entity + '</li>');
                    }
                }
                if (data.sons) {
                    var html = '';
                    for (var l in data.sons) {
                        var obj = data.sons[l];
                        var entity = self.buildEntity(obj, true);
                        html += '<li>' + entity + '</li>';
                    }
                    var id = 'hiekn-infobox-' + new Date().getTime() + '-sons-' + data.self.id;
                    $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">子节点</a></li>');
                    $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
                }
                if (data.atts) {
                    for (var m in data.atts) {
                        if (data.atts.hasOwnProperty(m)) {
                            var att = data.atts[m];
                            var html = '';
                            for (var j in att.v) {
                                var obj = att.v[j];
                                var entity = self.buildEntity(obj, true);
                                html += '<li>' + entity + '</li>';
                            }
                            var id = 'hiekn-infobox-' + new Date().getTime() + '-att-' + m + '-' + data.self.id;
                            $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">' + att.k + '</a></li>');
                            $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
                        }
                    }
                }
            } else {
                $infoxbox.append('InfoBox读取错误');
            }
            return $infoxbox;
        };

        return Service;
    }
})(window, jQuery);
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
                selector: options.selector
            };
            $.extend(true, self.infoboxSettings, self.baseSettings);
            self.loaderSettings = {
                selector: options.selector,
                statsConfig: options.statsConfig,
                tgc2: null,
                tgc2Filter: null,
                tgc2Page: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            self.nodeSettings = {
                images: options.images,
                nodeColors: options.nodeColors,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = self.baseSettings;
            self.tgc2Settings = {};

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
                var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
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
                    self.tgc2.load(startInfo);
                } else {
                    self.load(startInfo);
                }
            }, 30);
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    'use strict';

    window.HieknPromptService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                container: null,
                data: null,
                baseUrl: null,
                kgName: null,
                ready: $.noop,
                onSearch: $.noop
            };
            self.settings = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            var sdk = new HieknSDKService(self.settings);
            sdk.schema(self.settings, function (schema) {
                var promptSettings = {
                    drawPromptItem: sdk.drawPromptItem(schema),
                    onPrompt: sdk.onPrompt(self.settings)
                };
                $.extend(true, promptSettings, self.settings);
                self.instance = new hieknPrompt(promptSettings);
                self.settings.ready(self.instance);
            });
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    'use strict';

    window.HieknRelationService = gentService();

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
                selector: options.selector
            };
            $.extend(true, self.infoboxSettings, self.baseSettings);
            self.loaderSettings = {
                selector: options.selector,
                statsConfig: options.statsConfig,
                tgc2: null,
                tgc2Filter: null,
                tgc2Page: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            self.nodeSettings = {
                images: options.images,
                nodeColors: options.nodeColors,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = self.baseSettings;
            self.tgc2Settings = {};

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
                var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
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
                    loader: self.sdkUtils.relation(self.loaderSettings, schema),
                    schema: schema,
                    relation: {
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
            });
        };

        Service.prototype.init = function () {
            var self = this;
            self.tgc2 = new Tgc2Relation(self.tgc2Settings);
            self.tgc2Filter = new Tgc2Filter(self.tgc2, self.tgc2Settings.filter);
            self.tgc2Stats = new Tgc2Stats(self.tgc2, self.tgc2Settings.stats);
            self.tgc2Connects = new Tgc2Connects(self.tgc2, self.tgc2Settings.connects);
            self.tgc2Crumb = new Tgc2Crumb(self.tgc2, self.tgc2Settings.crumb);
            self.tgc2Find = new Tgc2Find(self.tgc2, self.tgc2Settings.find);
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
                    self.tgc2.load(startInfo);
                } else {
                    self.load(startInfo);
                }
            }, 30);
        };

        return Service;
    }
})(window, jQuery);
(function () {

    window.HieknSDKService = gentService();

    function gentService() {
        var Service = function () {
            this.colorList = {
                'aliceblue': '#f0f8ff',
                'antiquewhite': '#faebd7',
                'aqua': '#00ffff',
                'aquamarine': '#7fffd4',
                'azure': '#f0ffff',
                'beige': '#f5f5dc',
                'bisque': '#ffe4c4',
                'black': '#000000',
                'blanchedalmond': '#ffebcd',
                'blue': '#0000ff',
                'blueviolet': '#8a2be2',
                'brown': '#a52a2a',
                'burlywood': '#deb887',
                'cadetblue': '#5f9ea0',
                'chartreuse': '#7fff00',
                'chocolate': '#d2691e',
                'coral': '#ff7f50',
                'cornflowerblue': '#6495ed',
                'cornsilk': '#fff8dc',
                'crimson': '#dc143c',
                'cyan': '#00ffff',
                'darkblue': '#00008b',
                'darkcyan': '#008b8b',
                'darkgoldenrod': '#b8860b',
                'darkgray': '#a9a9a9',
                'darkgrey': '#a9a9a9',
                'darkgreen': '#006400',
                'darkkhaki': '#bdb76b',
                'darkmagenta': '#8b008b',
                'darkolivegreen': '#556b2f',
                'darkorange': '#ff8c00',
                'darkorchid': '#9932cc',
                'darkred': '#8b0000',
                'darksalmon': '#e9967a',
                'darkseagreen': '#8fbc8f',
                'darkslateblue': '#483d8b',
                'darkslategray': '#2f4f4f',
                'darkslategrey': '#2f4f4f',
                'darkturquoise': '#00ced1',
                'darkviolet': '#9400d3',
                'deeppink': '#ff1493',
                'deepskyblue': '#00bfff',
                'dimgray': '#696969',
                'dimgrey': '#696969',
                'dodgerblue': '#1e90ff',
                'firebrick': '#b22222',
                'floralwhite': '#fffaf0',
                'forestgreen': '#228b22',
                'fuchsia': '#ff00ff',
                'gainsboro': '#dcdcdc',
                'ghostwhite': '#f8f8ff',
                'gold': '#ffd700',
                'goldenrod': '#daa520',
                'gray': '#808080',
                'grey': '#808080',
                'green': '#008000',
                'greenyellow': '#adff2f',
                'honeydew': '#f0fff0',
                'hotpink': '#ff69b4',
                'indianred': '#cd5c5c',
                'indigo': '#4b0082',
                'ivory': '#fffff0',
                'khaki': '#f0e68c',
                'lavender': '#e6e6fa',
                'lavenderblush': '#fff0f5',
                'lawngreen': '#7cfc00',
                'lemonchiffon': '#fffacd',
                'lightblue': '#add8e6',
                'lightcoral': '#f08080',
                'lightcyan': '#e0ffff',
                'lightgoldenrodyellow': '#fafad2',
                'lightgray': '#d3d3d3',
                'lightgrey': '#d3d3d3',
                'lightgreen': '#90ee90',
                'lightpink': '#ffb6c1',
                'lightsalmon': '#ffa07a',
                'lightseagreen': '#20b2aa',
                'lightskyblue': '#87cefa',
                'lightslategray': '#778899',
                'lightslategrey': '#778899',
                'lightsteelblue': '#b0c4de',
                'lightyellow': '#ffffe0',
                'lime': '#00ff00',
                'limegreen': '#32cd32',
                'linen': '#faf0e6',
                'magenta': '#ff00ff',
                'maroon': '#800000',
                'mediumaquamarine': '#66cdaa',
                'mediumblue': '#0000cd',
                'mediumorchid': '#ba55d3',
                'mediumpurple': '#9370d8',
                'mediumseagreen': '#3cb371',
                'mediumslateblue': '#7b68ee',
                'mediumspringgreen': '#00fa9a',
                'mediumturquoise': '#48d1cc',
                'mediumvioletred': '#c71585',
                'midnightblue': '#191970',
                'mintcream': '#f5fffa',
                'mistyrose': '#ffe4e1',
                'moccasin': '#ffe4b5',
                'navajowhite': '#ffdead',
                'navy': '#000080',
                'oldlace': '#fdf5e6',
                'olive': '#808000',
                'olivedrab': '#6b8e23',
                'orange': '#ffa500',
                'orangered': '#ff4500',
                'orchid': '#da70d6',
                'palegoldenrod': '#eee8aa',
                'palegreen': '#98fb98',
                'paleturquoise': '#afeeee',
                'palevioletred': '#d87093',
                'papayawhip': '#ffefd5',
                'peachpuff': '#ffdab9',
                'peru': '#cd853f',
                'pink': '#ffc0cb',
                'plum': '#dda0dd',
                'powderblue': '#b0e0e6',
                'purple': '#800080',
                'rebeccapurple': '#663399',
                'red': '#ff0000',
                'rosybrown': '#bc8f8f',
                'royalblue': '#4169e1',
                'saddlebrown': '#8b4513',
                'salmon': '#fa8072',
                'sandybrown': '#f4a460',
                'seagreen': '#2e8b57',
                'seashell': '#fff5ee',
                'sienna': '#a0522d',
                'silver': '#c0c0c0',
                'skyblue': '#87ceeb',
                'slateblue': '#6a5acd',
                'slategray': '#708090',
                'slategrey': '#708090',
                'snow': '#fffafa',
                'springgreen': '#00ff7f',
                'steelblue': '#4682b4',
                'tan': '#d2b48c',
                'teal': '#008080',
                'thistle': '#d8bfd8',
                'tomato': '#ff6347',
                'turquoise': '#40e0d0',
                'violet': '#ee82ee',
                'wheat': '#f5deb3',
                'white': '#ffffff',
                'whitesmoke': '#f5f5f5',
                'yellow': '#ffff00',
                'yellowgreen': '#9acd32'
            };
        };

        Service.prototype.drawPromptItem = function (schema) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (data, pre) {
                var line = '<span class="prompt-tip-title">' + data.name.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
                line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (typeObj[data.classId] || '') + '</span>' + line;
                return line;
            }
        };

        Service.prototype.onPrompt = function (options) {
            var self = this;
            return function (pre, $self) {
                var param = options.data || {};
                param.kgName = options.kgName;
                param.kw = pre;
                hieknjs.kgLoader({
                    url: options.baseUrl + 'prompt',
                    params: param,
                    type: 1,
                    success: function (data) {
                        if ($self.prompt == param.kw) {
                            var d = data.rsData;
                            $self.startDrawPromptItems(d, pre);
                        }
                    }
                });
            }
        };

        Service.prototype.schema = function (options, callback) {
            var self = this;
            var param = options.data || {};
            param.kgName = options.kgName;
            hieknjs.kgLoader({
                url: options.baseUrl + 'schema',
                type: 1,
                params: param,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                }
            });
        };

        Service.prototype.gentInfobox = function (options) {
            var self = this;
            var data = options.data || {};
            data.isRelationAtts = true;
            self.infoboxService = new HieknInfoboxService({
                baseUrl: options.baseUrl,
                kgName: options.kgName,
                data: data
            });
            self.infoboxService.initEvent($(options.selector));
        };

        Service.prototype.infobox = function () {
            var self = this;
            return function (data, node, callback) {
                if (node.detail) {
                    callback(node.detail);
                } else {
                    self.infoboxService.load(data.id, function (data) {
                        data = self.infoboxService.buildInfobox(data)[0].outerHTML;
                        node.detail = data;
                        callback(data);
                    });
                }
                return null;
            }
        };

        Service.prototype.nodeStyleFunction = function (options) {
            var self = this;
            return function (node) {
                options.tgc2.nodeStyleFunction(node);
                node.imageCropping = 'fit';
                if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                } else if (!$.isEmptyObject(options.tgc2.nodeIds)) {
                    node.fillColor = options.tgc2.settings.netChart.reduceColor;
                    node.lineColor = node.fillColor;
                    node.label = '';
                } else {
                    node.fillColor = node.data.color || '#fff';
                    node.lineColor = '#00b38a';
                    if (node.hovered) {
                        node.fillColor = node.lineColor;
                        node.shadowBlur = 0;
                    }
                }
                if (options.images && options.images[node.data.classId]) {
                    if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                        node.image = options.images[node.data.classId].emphases;
                    } else if (!$.isEmptyObject(options.tgc2.nodeIds)) {
                        node.image = '';
                    } else {
                        if (node.hovered) {
                            node.image = options.images[node.data.classId].emphases;
                        } else {
                            node.image = options.images[node.data.classId].normal;
                        }
                    }
                }
                if (options.nodeColors && options.nodeColors[node.data.classId]) {
                    node.lineWidth = 2;
                    if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                        node.fillColor = options.tgc2.settings.netChart.emphasesColor;
                        node.lineColor = node.fillColor;
                    } else if (!$.isEmptyObject(options.tgc2.nodeIds)) {
                    } else {
                        node.lineColor = options.nodeColors[node.data.classId];
                        if (node.hovered) {
                            node.fillColor = node.lineColor;
                        }
                    }
                }
            }
        };

        Service.prototype.colorFade = function (color, amount) {
            try {
                var rgba = [];
                if (this.colorList[color]) {
                    color = this.colorList[color];
                }
                if (color.indexOf('rgb') == 0 || color.indexOf('hsl') == 0) {
                    rgba = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',');
                } else if (color.indexOf('#') == 0) {
                    color = color.substring(1);
                    rgba = color.match(/.{2}/g).map(function (c) {
                        return parseInt(c, 16);
                    });
                }
                rgba[3] = parseInt((rgba[3] || 1) * amount * 100) / 100;
                if (color.indexOf('hsl') == 0) {
                    return 'hsla(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ')';
                } else {
                    return 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ')';
                }
            } catch (e) {
                return color;
            }
        };

        Service.prototype.buildFilter = function (schema, options) {
            var allowAtts = [];
            var allowAttsSelected = [];
            var allowTypes = [];
            var allowTypesSelected = [];
            for (var i in schema.atts) {
                var att = schema.atts[i];
                if (att.type == 1) {
                    allowAtts.push({value: att.k, label: att.v});
                    allowAttsSelected.push(att.k);
                }
            }
            for (var j in schema.types) {
                var type = schema.types[j];
                allowTypes.push({value: type.k, label: type.v});
                allowTypesSelected.push(type.k);
            }
            allowAttsSelected = options.selectedAtts || allowAttsSelected;
            allowTypesSelected = options.selectedTypes || allowTypesSelected;
            return [
                {
                    key: 'allowTypes',
                    label: '设定分析主体',
                    selected: allowTypesSelected,
                    options: allowTypes
                },
                {
                    key: 'allowAtts',
                    label: '设定分析关系',
                    selected: allowAttsSelected,
                    options: allowAtts
                }
            ]
        };

        Service.prototype.dealGraphData = function (data, schema) {
            data.nodes = data.entityList;
            data.links = data.relationList;
            delete data.entityList;
            delete data.relationList;
            var schemas = {};
            var arr = _.concat(schema.types, schema.atts);
            for (var j in arr) {
                var kv = arr[j];
                schemas[kv.k] = kv.v;
            }
            for (var i in data.nodes) {
                var node = data.nodes[i];
                node.typeName = schemas[node.classId];
            }
            for (var k in data.links) {
                var link = data.links[k];
                link.typeName = schemas[link.attId];
            }
            return data;
        };

        Service.prototype.linkContentsFunction = function(linkData) {
            var self = this;
            if (linkData.rInfo) {
                var items = '';
                for (var i in linkData.rInfo) {
                    var d = linkData.rInfo[i];
                    items += '<tr>';
                    var kvs = d.kvs;
                    var thead = '<tr>';
                    var tbody = '<tr>';
                    for (var j in kvs) {
                        if (kvs.hasOwnProperty(j)) {
                            thead += '<th><div class="link-info-key">' + kvs[j].k + '</div></th>';
                            tbody += '<td><div class="link-info-value">' + kvs[j].v + '</div></td>';
                        }
                    }
                    items += '<li><table><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table></li>';
                }
                return '<ul class="link-info">' + items + '</ul>';
            } else {
                return linkData.typeName;
            }
        };

        Service.prototype.graph = function (options, schema) {
            var self = this;
            return function ($self, callback) {
                var param = options.data || {};
                param.kgName = options.kgName;
                param.id = options.tgc2.startInfo.id;
                param.isRelationMerge = true;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                if (options.tgc2Page) {
                    var page = options.tgc2Page.page;
                    param.pageNo = page.pageNo;
                    param.pageSize = page.pageSize;
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'graph',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            if(data){
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        }
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        Service.prototype.relation = function (options, schema) {
            var self = this;
            return function (instance, callback) {
                var ids = _.map(options.tgc2.startInfo.nodes, 'id');
                var param = options.data || {};
                param.ids = ids;
                param.isShortest = true;
                param.connectsCompute = true;
                param.statsCompute = true;
                param.kgName = options.kgName;
                param.statsConfig = options.statsConfig;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'relation',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            if(data){
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        }
                    },
                    error: function () {
                        toastr.error('网络接口错误！');
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        Service.prototype.path = function (options, schema) {
            var self = this;
            return function (instance, callback) {
                var param = options.data || {};
                param.start = options.tgc2.startInfo.start.id;
                param.end = options.tgc2.startInfo.end.id;
                param.isShortest = true;
                param.connectsCompute = true;
                param.statsCompute = true;
                param.kgName = options.kgName;
                param.statsConfig = options.statsConfig;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'path',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            if(data){
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        }
                    },
                    error: function () {
                        toastr.error('网络接口错误！');
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        return Service;
    }
})();

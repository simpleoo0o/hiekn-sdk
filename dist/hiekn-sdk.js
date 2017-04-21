/**
     * @author: 
     *    jiangrun002
     * @version: 
     *    v0.2.0
     * @license:
     *    Copyright 2017, jiangrun. All rights reserved.
     */

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

        Service.prototype.load = function (id, callback) {
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
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
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
                        filter: {
                            enable: true,
                            filters: filters
                        },
                        settings: {
                            nodeMenu: {
                                contentsFunction: self.sdkUtils.infobox()
                            }
                        }
                    },
                    stats: {
                        enable: true
                    },
                    connects: {
                        enable: true
                    },
                    loader: self.sdkUtils.path(options),
                    schema: schema,
                    path: {
                        prompt: {
                            settings: {
                                drawPromptItem: self.sdkUtils.drawPromptItem(schema),
                                onPrompt: self.sdkUtils.onPrompt(options)
                            }
                        }
                    }
                };
                self.options = $.extend(true, {}, defaultOptions, options.pathSetting);
                self.sdkUtils.gentInfobox(options.selector || options.pathSetting.selector);
                self.init();
            });
        };

        Service.prototype.init = function () {
            var self = this;
            self.tgc2 = new Tgc2Path(self.options);
            self.tgc2Filter = new Tgc2Filter(self.tgc2);
            self.tgc2Stats = new Tgc2Stats(self.tgc2);
            self.tgc2Connects = new Tgc2Connects(self.tgc2);
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
(function (window, $) {
    'use strict';

    window.HieknPromptService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                selector: null,
                data: null,
                url: null,
                kgName: null,
                ready: $.noop
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
                var instance = new hieknPrompt(promptSettings);
                self.settings.ready(instance);
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
                        filter: {
                            enable: true,
                            filters: filters
                        },
                        settings: {
                            nodeMenu: {
                                contentsFunction: self.sdkUtils.infobox()
                            }
                        }
                    },
                    stats: {
                        enable: true
                    },
                    connects: {
                        enable: true
                    },
                    loader: self.sdkUtils.relation(options),
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
            self.tgc2Filter = new Tgc2Filter(self.tgc2);
            self.tgc2Stats = new Tgc2Stats(self.tgc2);
            self.tgc2Connects = new Tgc2Connects(self.tgc2);
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
(function () {

    window.HieknSDKService = gentService();

    function gentService() {
        var Service = function (options) {
            var defaultSettings = {
                data: {},
                baseUrl: null,
                tgc2: null,
                tgc2Filter: null,
                tgc2Page: null
            };
            this.settings = $.extend(true, {}, defaultSettings, options);
        };

        Service.prototype.updateSettings = function (options) {
            $.extend(true, this.settings, options);
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
                    url: self.settings.baseUrl + 'prompt',
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
                url: self.settings.baseUrl + 'schema',
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

        Service.prototype.gentInfobox = function (selector) {
            var self = this;
            self.infoboxService = new HieknInfoboxService({
                baseUrl: self.settings.baseUrl,
                kgName: self.settings.kgName,
                data: {isRelationAtts: true}
            });
            self.infoboxService.initEvent($(selector));
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

        Service.prototype.graph = function (options) {
            var self = this;
            return function ($self, callback) {
                var param = options.data || {};
                param.kgName = options.kgName;
                param.id = self.settings.tgc2.startInfo.id;
                param.isRelationMerge = true;
                if (self.settings.tgc2Filter) {
                    var filters = self.settings.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                if (self.settings.tgc2Page) {
                    var page = self.settings.tgc2Page.page;
                    param.pageNo = page.pageNo;
                    param.pageSize = page.pageSize;
                }
                hieknjs.kgLoader({
                    url: self.settings.baseUrl + 'graph',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            callback(data);
                        }
                    }
                });
            }
        };

        Service.prototype.relation = function (options) {
            var self = this;
            return function (instance, callback) {
                var ids = _.map(self.settings.tgc2.startInfo.nodes, 'id');
                var param = options.data || {};
                param.ids = ids;
                param.isShortest = true;
                param.connectsCompute = true;
                param.statsCompute = true;
                param.kgName = options.kgName;
                param.statsConfig = options.statsConfig;
                if (self.settings.tgc2Filter) {
                    var filters = self.settings.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                hieknjs.kgLoader({
                    url: self.settings.baseUrl + 'relation',
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
            }
        };

        Service.prototype.path = function (options) {
            var self = this;
            return function (instance, callback) {
                var param = options.data || {};
                param.start = self.settings.tgc2.startInfo.start.id;
                param.end = self.settings.tgc2.startInfo.end.id;
                param.isShortest = true;
                param.connectsCompute = true;
                param.statsCompute = true;
                param.kgName = options.kgName;
                param.statsConfig = options.statsConfig;
                if (self.settings.tgc2Filter) {
                    var filters = self.settings.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                hieknjs.kgLoader({
                    url: self.settings.baseUrl + 'path',
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
            }
        };
        return Service;
    }
})();

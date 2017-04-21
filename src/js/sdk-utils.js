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

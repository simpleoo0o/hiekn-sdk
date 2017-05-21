(function (window, $) {
    'use strict';

    window.HieknConceptTreeService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            self.clickTimeout = null;
            self.isFirst = true;
            self.lastSelectedNode = null;
            self.startAsync = false;
            self.treeDbClick = false;
            var defaultSettings = {
                container: null,
                data: null,
                baseUrl: null,
                kgName: null,
                getAsyncUrl: function () {
                    var param = self.options.data || {};
                    param.kgName = self.options.kgName;
                    if (self.options.readAll) {
                        param.id = self.getLastSelectedNodeId() || 0;
                    } else {
                        param.id = self.getLastSelectedNodeId() || self.options.initId;
                    }
                    param.onlySubTree = self.isFirst ? 0 : 1;
                    return self.options.baseUrl + 'concept?' + $.param(param);
                },
                idKey: 'id',
                initId: 0,
                nameKey: 'name',
                onNodeClick: $.noop,
                nodeHoverTools: {
                    infobox: {
                        enable: false
                    },
                    graph: {
                        enable: false,
                        instanceEnable: false,
                        infobox: false,
                        conceptGraphSettings:{}
                    }
                },
                instance: {
                    enable: false,
                    url: '',
                    onClick: $.noop
                },
                namespace: 'hiekn-concept-tree',
                pIdKey: 'parentId',
                readAll: false
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.zTreeSettings = null;
            self.zTree = null;
            self.infoboxService = null;
            self.tgc2ConceptGraph = null;
            self.instanceSearch = null;
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container);
            self.treeId = self.options.namespace + '-' + new Date().getTime();
            self.$container.addClass('hiekn-concept-tree').append('<ul class="ztree" id="' + self.treeId + '"></ul>');
            self.zTreeSettings = self.updateZTreeSettings();
            self.zTree = $.fn.zTree.init(self.$container.find('.ztree'), self.zTreeSettings);
            if (self.options.nodeHoverTools.graph.enable) {
                self.initGraph();
            }
            if (self.options.nodeHoverTools.infobox.enable) {
                self.initInfobox();
            }
            if (self.options.instance.enable) {
                var id = self.options.namespace + '-prompt-' + new Date().getTime();
                self.$instanceContainer = $('<div class="hiekn-instance-container"><div class="hiekn-instance-prompt" id="' + id + '"></div><div class="hiekn-instance-list"></div></div>');
                self.$container.append(self.$instanceContainer);
                self.instanceSearchSettings = {
                    container: '#' + id,
                    promptEnable: false,
                    placeholder: '实例搜索',
                    onSearch: function (kw) {
                        var searchSettings = {
                            paramName: 'kw',
                            url: self.options.baseUrl + 'prompt',
                            type: 1
                        };
                        $.extend(true, searchSettings, self.options.instance.searchSettings || {});
                        var param = self.options.data || {};
                        param.kgName = self.options.kgName;
                        param[searchSettings.paramName || 'kw'] = kw;
                        hieknjs.kgLoader({
                            url: searchSettings.url,
                            params: param,
                            type: searchSettings.type,
                            success: function (data) {
                                if (data) {
                                    var $container = self.select('.instance-loader-container');
                                    $container.attr({'data-more': '0', 'data-page': '1'});
                                    self.drawInstanceList(data.rsData, false);
                                }
                            }
                        });
                    }
                };
                self.instanceSearch = new hieknPrompt(self.instanceSearchSettings);
                self.bindInstanceEvent();
            }
        };

        Service.prototype.addHoverDom = function (treeId, treeNode) {
            var self = this;
            var sObj = self.select('#' + treeNode.tId + '_span');
            if (self.select('#button-container_' + treeNode.tId).length > 0) {
                return;
            }
            var $container = $('<span class="button-container" id="button-container_' + treeNode.tId + '" ></span>');
            sObj.after($container);
            self.onNodeHover($container, treeNode);
        };

        Service.prototype.beforeAsync = function (treeId, treeNode) {
            var self = this;
            if (treeNode) {
                self.startAsync = true;
                self.lastSelectedNode = treeNode;
            }
            return true;
        };

        Service.prototype.bindInstanceEvent = function () {
            var self = this;
            self.select('.hiekn-instance-list').on('scroll', function (event) {
                if ($(event.target).height() + $(event.target).scrollTop() > $(event.target)[0].scrollHeight - 50) {
                    self.loadInstanceService();
                }
            });
            self.select('.hiekn-instance-list').on('click', 'li[data-id]', function () {
                var node = $(this).data('data');
                $(this).addClass('active').siblings('.active').removeClass('active');
                self.options.instance.onClick(node);
            });
        };

        Service.prototype.dataFilter = function (treeId, parentNode, childNodes) {
            var self = this;
            if (childNodes.code == 200) {
                if (!childNodes.data || !childNodes.data.rsData) {
                    return null;
                }
                childNodes = childNodes.data.rsData;
                var len = childNodes.length;
                var result = [];
                for (var i = 0; i < len; i++) {
                    !self.options.readAll && (childNodes[i].isParent = true);
                    if (!parentNode || childNodes[i][self.options.idKey] != parentNode[self.options.idKey]) {
                        result.push(childNodes[i]);
                    }
                }
                if (result.length == 0) {
                    parentNode.isParent = false;
                } else {
                    return result;
                }
            } else {
                toastr.error(childNodes.msg);
            }
            return null;
        };

        Service.prototype.expandNodes = function (nodeId) {
            var self = this;
            var node = self.zTree.getNodeByParam(self.options.idKey, nodeId);
            if (node) {
                self.zTree.expandNode(node, true, false, true, false);
                var parentNode = node.getParentNode();
                parentNode && self.expandNodes(parentNode[self.options.idKey]);
            }
        };

        Service.prototype.drawInstanceList = function (instances, append) {
            var self = this;
            var $container = self.$instanceContainer.find('.hiekn-instance-list ul');
            var html = $('<ul></ul>');
            if (instances.length) {
                for (var i in instances) {
                    var $li = $('<li data-id="' + instances[i].id + '" title="' + instances[i].name + '">' + instances[i].name + '</li>').data('data', instances[i]);
                    html.append($li);
                }
            } else if (!append) {
                html.append('<li>没有找到相关实例</li>');
            }
            if (append) {
                $container.append(html.children());
            } else {
                $container.html(html.children());
            }
        };

        Service.prototype.getLastSelectedNodeId = function () {
            var self = this;
            return self.lastSelectedNode ? self.lastSelectedNode[self.options.idKey] : null;
        };

        Service.prototype.getLastSelectedInstance = function () {
            var self = this;
            return self.select('.hiekn-instance-list li[data-id].active').data('data');
        };

        Service.prototype.getAsyncUrl = function () {
            var self = this;
            return typeof self.options.getAsyncUrl == 'string' ? self.options.getAsyncUrl : self.options.getAsyncUrl(self);
        };

        Service.prototype.initInfobox = function () {
            var self = this;
            var config = {};
            config.kgName = self.options.kgName;
            config.baseUrl = self.options.baseUrl;
            self.infoboxService = new HieknInfoboxService(config);
        };

        Service.prototype.initGraph = function () {
            var self = this;
            var selector = self.options.namespace + '-tgc2-' + new Date().getTime();
            self.$graphContainer = $('<div class="modal fade hiekn-concept-tree-graph-modal" id="' + selector + '-modal" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">' +
                '<div class="modal-dialog modal-lg">' +
                '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><i class="fa fa-times-circle"></i></button>' +
                '<h4 class="modal-title"><span name="title"></span></h4></div><div class="modal-body"><div class="' + selector + '"></div></div></div></div></div>');
            $('body').append(self.$graphContainer);
            var settings = {
                selector: '.' + selector,
                baseUrl: self.options.baseUrl,
                data: self.options.data,
                kgName: self.options.kgName,
                instanceEnable: self.options.nodeHoverTools.graph.instanceEnable,
                tgc2Settings: {netChart: {settings: {nodeMenu: {}}}}
            };
            $.extend(true, settings, self.options.nodeHoverTools.graph.conceptGraphSettings);
            if (self.options.nodeHoverTools.graph.infobox) {
                self.sdkUtils = new HieknSDKService();
                self.sdkUtils.gentInfobox({
                    selector: '.' + selector,
                    baseUrl: self.options.baseUrl,
                    data: self.options.data,
                    kgName: self.options.kgName
                });
                settings.tgc2Settings.netChart.settings.nodeMenu.contentsFunction = self.sdkUtils.infobox();
            }
            self.tgc2ConceptGraph = new HieknConceptGraphService(settings);
        };

        Service.prototype.loadGraph = function (id) {
            var self = this;
            self.tgc2ConceptGraph.load({
                id: id,
                kgType: 0
            });
        };

        Service.prototype.reloadInstance = function () {
            var self = this;
            self.select('.hiekn-instance-list').html('<ul></ul><div class="instance-loader-container" data-more="1" data-page="1"></div>');
            self.loadInstanceService();
        };

        Service.prototype.loadInstanceService = function () {
            var self = this;
            var $container = self.select('.instance-loader-container');
            if ($container.attr('data-more') != '0') {
                var param = self.options.data || {};
                param.conceptId = self.getLastSelectedNodeId() || self.options.initId;
                param.readAll = 0;
                param.pageNo = $container.attr('data-page');
                param.pageSize = 15;
                param.kgName = self.options.kgName;
                if ($container.data('inLoading') != 1) {
                    $container.data('inLoading', 1);
                    hieknjs.kgLoader({
                        url: self.options.instance.url + '?' + $.param(param),
                        success: function (data, textStatus, jqXHR, params) {
                            if (data) {
                                var d = data.rsData;
                                if (d.length <= params.pageSize) {
                                    $container.attr({'data-more': 0});
                                }
                                if (d.length > params.pageSize) {
                                    d.pop();
                                }
                                self.drawInstanceList(d, params.pageNo != 1);
                                $container.attr({'data-page': parseInt(params.pageNo, 10) + 1});
                            }
                        },
                        complete: function () {
                            $container.data('inLoading', 0);
                            var $ic = self.select('.hiekn-instance-list');
                            if ($ic.children('ul').height() < $ic.height()) {
                                self.loadInstanceService();
                            }
                        },
                        that: $container[0]
                    });
                }
            } else {
                console.log('no more instance');
            }
        };

        Service.prototype.onAsyncSuccess = function (event, treeId, treeNode) {
            var self = this;
            var node = treeNode;
            if (node) {
                self.onNodeClick(node);
            }
            if (node && node.children.length == 0) {
                node.isParent = false;
                self.zTree.updateNode(node);
                toastr.info('当前概念没有子概念');
            } else if (!node) {
                self.expandNodes(self.getLastSelectedNodeId() || self.options.initId);
                if (!self.getLastSelectedNodeId()) {
                    node = self.zTree.getNodeByParam(self.options.idKey, self.options.initId);
                    self.zTree.selectNode(node);
                    self.onNodeClick(node);
                }
            }
            var root = self.zTree.getNodeByParam(self.options.idKey, 0);
            self.addHoverDom(treeId, root);
            self.isFirst = false;
            self.startAsync = false;
        };

        Service.prototype.onClick = function (event, treeId, treeNode) {
            var self = this;
            self.clickTimeout && clearTimeout(self.clickTimeout);
            self.clickTimeout = setTimeout(function () {
                self.lastSelectedNode = treeNode;
                self.onNodeClick(treeNode);
                self.treeDbClick = false;
            }, 500);
        };

        Service.prototype.onNodeButtonClick = function ($button, treeNode) {
            var self = this;
            self.select('.tree-button-active').removeClass('tree-button-active');
            self.zTree.selectNode(treeNode);
            $button.addClass('tree-button-active');
            self.lastSelectedNode = treeNode;
        };

        Service.prototype.onNodeClick = function (node) {
            var self = this;
            if (self.options.instance.enable) {
                self.reloadInstance();
            }
            self.options.onNodeClick(node);
        };

        Service.prototype.onNodeHover = function ($container, treeNode) {
            var self = this;
            for (var key in self.options.nodeHoverTools) {
                var value = self.options.nodeHoverTools[key];
                if (key == 'graph' && value.enable) {
                    var $graphBtn = $('<span class="button" title="图谱可视化" onfocus="this.blur();">' +
                        '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12">' +
                        '<path d="M892.790083 1009.647551c-58.355904 31.366176-131.161266 9.611215-162.610663-48.591301-24.342972-' +
                        '45.045432-16.764962-98.703426 14.947153-135.21462L698.862198 739.012706c-23.246413 7.764034-48.157246 11' +
                        '.970777-74.066732 11.970777-114.073211 0-208.817925-81.626793-227.545924-188.916672l-96.293279-0.561334c' +
                        '-16.764962 45.964127-60.950442 78.79075-112.82979 78.79075-66.291275 0-120.03249-53.600882-120.03249-119' +
                        '.725715 0-66.119938 53.741215-119.725715 120.03249-119.725715 51.30496 0 95.064544 32.111902 112.242348 7' +
                        '7.279717l97.913641 0.567861C419.241111 374.137368 512.680397 295.287873 624.795466 295.287873c18.375534 0' +
                        ' 36.248477 2.12948 53.382222 6.132249l39.022512-93.152092c-36.248477-32.934321-49.896729-86.177842-30.1749' +
                        '73-134.041367 25.204555-61.154415 95.338684-90.360108 156.651383-65.220824 61.319226 25.132756 90.596716 9' +
                        '5.089021 65.398689 156.243437-19.504729 47.334826-65.92086 75.494544-114.326137 74.176062l-39.959157 95.3' +
                        '82743c60.924334 41.018186 100.921022 110.062283 100.921022 188.324334 0 70.620402-32.565538 133.736223-83.6' +
                        '86106 175.526243l46.409604 87.10796c48.521134-7.086843 98.455394 16.133461 123.065979 61.683114C972.95806 90' +
                        '5.658773 951.145986 978.273217 892.790083 1009.647551L892.790083 1009.647551zM892.790083 1009.647551"></path>' +
                        '</svg>' +
                        '</span>');
                    $container.append($graphBtn);
                    $graphBtn.on('click', function (event) {
                        self.$graphContainer.modal('show');
                        self.loadGraph(treeNode[self.options.idKey]);
                        event.stopPropagation();
                    });
                } else if (key == 'infobox' && value.enable) {
                    var $infoboxBtn = $('<span class="button" title="知识卡片" onfocus="this.blur();">' +
                        '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12">' +
                        '<path d="M638.596211 191.936191q30.628116 0 54.62014 13.272183t41.347956 32.66999 26.544367 41.85842' +
                        '5 9.188435 39.81655l0 576.829511q0 29.607178-11.740778 53.088734t-30.628116 39.81655-42.368893 25.5' +
                        '2343-46.963111 9.188435l-503.322034 0q-19.397807 0-42.368893-11.230309t-42.879362-29.607178-33.1804' +
                        '59-42.368893-13.272183-48.494516l0-568.662014q0-21.439681 10.209372-44.410768t26.544367-42.368893 37' +
                        '.774676-32.159521 44.921236-12.761715l515.57328 0zM578.360917 830.021934q26.544367 0 45.431705-18.3' +
                        '76869t18.887338-44.921236-18.887338-45.431705-45.431705-18.887338l-382.851446 0q-26.544367 0-45.431' +
                        '705 18.887338t-18.887338 45.431705 18.887338 44.921236 45.431705 18.376869l382.851446 0zM578.360917 5' +
                        '74.787637q26.544367 0 45.431705-18.376869t18.887338-44.921236-18.887338-45.431705-45.431705-18.8873' +
                        '38l-382.851446 0q-26.544367 0-45.431705 18.887338t-18.887338 45.431705 18.887338 44.921236 45.4317' +
                        '05 18.376869l382.851446 0zM759.0668 0q43.900299 0 80.654038 26.033898t63.808574 64.319043 42.368893 82.' +
                        '695912 15.314058 81.164506l0 542.117647q0 21.439681-12.761715 39.306082t-31.138584 30.628116-39.816' +
                        '55 20.418744-39.81655 7.657029l-4.083749 0 0-609.499501q-8.167498-70.444666-43.900299-108.219342t-' +
                        '94.947159-49.004985l-498.217348 0q1.020937-2.041874 1.020937-7.14656 0-20.418744 12.251246-41.85842' +
                        '5t32.159521-38.795613 44.410768-28.586241 49.004985-11.230309l423.688933 0z"></path>' +
                        '</svg>' +
                        '</span>');
                    $container.append($infoboxBtn);
                    $infoboxBtn.tooltipster({
                        side: ['bottom'],
                        theme: 'tooltipster-shadow',
                        distance: 16,
                        interactive: true,
                        trigger: 'click',
                        content: 'Loading...',
                        functionBefore: function (instance, helper) {
                            var $origin = $(helper.origin);
                            if ($origin.data('loaded') !== true) {
                                var id = treeNode[self.options.idKey];
                                self.infoboxService.load(id, function (data) {
                                    var $container = self.infoboxService.buildInfobox(data);
                                    instance.content($container);
                                    self.infoboxService.initEvent($container);
                                    $origin.data('loaded', true);
                                }, function () {
                                    instance.content('read data failed');
                                });
                            }
                        }
                    });
                    $infoboxBtn.on('click', function (event) {
                        event.stopPropagation();
                    });
                } else if (value instanceof Function) {
                    value($container, treeNode);
                }
            }
            return true;
        };

        Service.prototype.removeHoverDom = function (treeId, treeNode) {
            var self = this;
            if (treeNode.level > 0) {
                var $container = self.select('#button-container_' + treeNode.tId);
                $container.children().off('click');
                $container.remove();
            }
        };

        Service.prototype.select = function (selector) {
            var self = this;
            return $(self.options.container).find(selector);
        };

        Service.prototype.updateZTreeSettings = function () {
            var self = this;
            return {
                async: {
                    enable: true,
                    url: function () {
                        return self.getAsyncUrl();
                    },
                    dataFilter: function (treeId, parentNode, childNodes) {
                        return self.dataFilter(treeId, parentNode, childNodes);
                    },
                    type: 'get'
                },
                view: {
                    showLine: false,
                    showIcon: false,
                    expandSpeed: 'fast',
                    dblClickExpand: function (treeId, treeNode) {
                        return treeNode.level > 0;
                    },
                    selectedMulti: false,
                    addHoverDom: function (treeId, treeNode) {
                        self.addHoverDom(treeId, treeNode);
                    },
                    removeHoverDom: function (treeId, treeNode) {
                        self.removeHoverDom(treeId, treeNode);
                    }
                },
                callback: {
                    beforeAsync: function (treeId, treeNode) {
                        return self.beforeAsync(treeId, treeNode);
                    },
                    onAsyncSuccess: function (event, treeId, treeNode) {
                        return self.onAsyncSuccess(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        return self.onClick(event, treeId, treeNode);
                    },
                    onDblClick: function () {
                        self.treeDbClick = true;
                    }
                },
                data: {
                    simpleData: {
                        enable: true,
                        pIdKey: self.options.pIdKey,
                        idKey: self.options.idKey
                    },
                    key: {
                        name: self.options.nameKey
                    }
                }
            };
        };

        return Service;
    }
})(window, jQuery);
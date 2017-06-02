/**
     * @author: 
     *    jiangrun002
     * @version: 
     *    v0.6.6
     * @license:
     *    Copyright 2017, jiangrun. All rights reserved.
     */

(function (window, $) {
    'use strict';

    window.HieknConceptGraphService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            self.sdkUtils = new window.HieknSDKService();
            var defaultPromptSettings = {
                baseUrl: options.baseUrl,
                data: options.data,
                kgName: options.kgName
            };
            self.promptSettings = $.extend(true, {}, defaultPromptSettings, options.promptSettings || {});
            self.defaultOptions = {
                lightColor: '#fff',
                primaryColor: '#00b38a',
                primaryLightColor: 'rgba(0,179,138,0.3)',
                emphasesColor: '#faa01b',
                emphasesLightColor: 'rgba(250, 160, 27,0.3)',
                kgName: null,
                baseUrl: null,
                data: {},
                instanceEnable: false,
                tgc2Settings: {
                    selector: null,
                    netChart: {
                        settings: {
                            toolbar: {
                                enabled: false
                            },
                            info: {
                                enabled: false
                            },
                            nodeMenu: {},
                            style: {
                                selection: {
                                    enabled: false,
                                    fillColor: ''
                                },
                                nodeStyleFunction: function (node) {
                                    self.nodeStyleFunction(node);
                                },
                                nodeHovered: {
                                    shadowBlur: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0)'
                                },
                                linkStyleFunction: function (link) {
                                    if (link.hovered) {
                                        link.label = link.data.attName;
                                    }
                                    link.toDecoration = 'arrow';
                                    link.fillColor = '#ddd';
                                },
                                linkLabel: {
                                    textStyle: {
                                        fillColor: '#999'
                                    }
                                }
                            }
                        }
                    },
                    prompt: {
                        style: {
                            top: '10px',
                            right: '10px',
                            left: 'auto',
                            bottom: 'auto'
                        },
                        enable: true,
                        settings: {
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
                    loader: function (instance, callback, onFailed) {
                        self.loader(instance, callback, onFailed);
                    }
                }
            };
            self.options = $.extend(true, {}, self.defaultOptions, options);
            self.options.tgc2Settings.selector = self.options.tgc2Settings.selector || self.options.selector;
            self.tgc2 = null;
            self.tgc2Prompt = null;
            self.tgc2Page = null;
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            self.tgc2 = new Tgc2Graph(self.options.tgc2Settings);
            self.tgc2Prompt = new Tgc2Prompt(self.tgc2, self.options.tgc2Settings.prompt);
            self.tgc2Page = new Tgc2Page(self.tgc2, self.options.tgc2Settings.page);
            self.tgc2.init();
            $(self.options.tgc2Settings.selector).addClass('tgc2 tgc2-concept-graph');
            if(self.options.instanceEnable){
                $(self.options.tgc2Settings.selector).append('<div class="tgc2-info-top">' +
                    '<ul class="info-top">' +
                    '<li class="current"><i class="fa fa-circle" style="color:' + self.options.emphasesColor + '"></i><span>当前节点</span></li>' +
                    '<li class="concept"><i class="fa fa-circle" style="color:' + self.options.primaryColor + '"></i><span>概念</span></li>' +
                    '<li class="instance"><i class="fa fa-circle-o" style="color:' + self.options.primaryColor + '"></i><span>实例</span></li>' +
                    '</ul>' +
                    '</div>');
            }
            $(self.options.tgc2Settings.selector).append('<div class="tgc2-info-bottom">' +
                '<div class="info-bottom"><span>中心节点：</span><span name="name" style="color:' + self.options.emphasesColor + '"></span></div>' +
                '</div>');
        };

        Service.prototype.load = function (node) {
            var self = this;
            self.kgName = self.options.kgName;
            self.tgc2.load(node);
            setTimeout(function () {
                self.tgc2.resize();
            }, 300);
        };

        Service.prototype.loader = function (instance, callback, onFailed) {
            var self = this;
            var node = self.tgc2.startInfo;
            var page = self.tgc2Page.page;
            var param = self.options.data || {};
            param.type = node.kgType || 0;
            param.pageNo = page.pageNo;
            param.pageSize = page.pageSize;
            param.kgName = self.options.kgName;
            param.entityId = node.id;
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'graph/knowlegde?' + $.param(param),
                type: 0,
                that: $(self.options.tgc2Settings.selector)[0],
                success: function (data) {
                    if (data && data.rsData && data.rsData.length) {
                        data = data.rsData[0];
                        if (data.entityList && data.entityList.length) {
                            for (var i in data.entityList) {
                                var d = data.entityList[i];
                                if (d.id == node.id) {
                                    $(self.options.tgc2Settings.selector).find('.tgc2-info-bottom').find('[name="name"]').text(d.name);
                                }
                            }
                        }
                        data.nodes = data.entityList;
                        data.links = data.relationList;
                        delete data.entityList;
                        delete data.relationList;
                        callback(data);
                        instance.netChart.resetLayout();
                    } else {
                        onFailed && onFailed();
                        instance.netChart.replaceData({nodes: [], links: []});
                    }
                },
                error: function () {
                    onFailed && onFailed();
                    toastr.error('网络接口错误！');
                }
            });
        };

        Service.prototype.nodeStyleFunction = function (node) {
            var self = this;
            var centerNode = self.tgc2.startInfo;
            node.label = node.data.name;
            node.labelStyle.textStyle.font = '18px Microsoft Yahei';
            node.aura = node.data.auras;
            node.radius = 15;
            node.imageCropping = 'fit';
            var isCenter = (node.id == centerNode.id);
            if (node.data.kgType == 0) {
                node.lineWidth = 10;
                node.lineColor = self.options.primaryLightColor;
                node.fillColor = self.options.primaryColor;
                node.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjhENzQwNUZFMTVFQjExRTc4QTJDOTY3REE4RkM4MjFCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjhENzQwNUZGMTVFQjExRTc4QTJDOTY3REE4RkM4MjFCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OEQ3NDA1RkMxNUVCMTFFNzhBMkM5NjdEQThGQzgyMUIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OEQ3NDA1RkQxNUVCMTFFNzhBMkM5NjdEQThGQzgyMUIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7rBsIlAAAFUklEQVR42uydX05TURDGp5V3ygq8JJJINIGugLICy4PySF0BdQGGsgLqCixviibCCrisgJLoEybUFUjfNfVM7iESUyi1vXNmzvm+ZCJg0p5753fmzPlfGY1GBKWrCgAAAHgLAAACABAAgAAABAAgAAABAAgAxKDM2Zqzdf8zW83/Pk59Z9fOBt749wv/MwAwIHbuC2cNb9mcPpcByL2deEgAgCLtOGt6k9Cxt0MAELa27zpr+59DiCNB19k7q1HBIgDs7D1nrYCOHwdCz9m+NRCsAcA1vqPI8eNA6PiIAADmKM7a39+TvWsT9x5e+38BwIza87XKotrao4FmADjMf/HdOcviruOW1txAKwDWQr7ZJkEjAOz0U8WJ3iwJ4qY2CLQBEKvz1UKgCYDYna8SAi0ApOL82xDUScEkkwYAat7565SW+j4SXKcOAGf7LUpTPd87SBYAHig5oLT1hooJpeQAyJydJ9Tuq8wHQgLAo3xNgli8tmArJQCaHgDor7Y8CEkAcEXzW64Vi7gJWJb+0mqAB23B+XfmRK0UIgBqv6IoIA1Ag4pBH+hu8eBQHmsT0IJ/db0jyQhQ8+G/Bh9PHBdYJqEhYskI0ITzH1xRGjE2ARIPdeTsubMFjm4l2IL//COByhJdE1B29v/Z2UtBoD86e2W9NyAFAE/1npf8HVwzvwkC8MzZ1xI/f5kE5gekmgCJfv+lcFt9KVBposkBJB5mRRiAFQCg62H2hAF4CwCm69qULU4APzhbdfaoxPe16r9nO4J3JpYE5s42FPW1K/f8n5Zl0mcSXWcpALTtPrEAAI8ELgGAdAGYVE4AAAAAAAAw0gs4I0jlO6viPactAKBXUa0HyOHPqdWPCYAB/Jk2AH34U2elkVwQwm3aIrqBD9KQhOYCJJNA5AEPl9gWsWqMDxWBxCqLZBOQUbEuEE3AZC1RhMvCOanBiOBkid5HID0Q1IV/J6onGgoDbA7lSPAYTcBY/SDhjbPV2Ak3JvEIGSICcP+2HzgK8A6f32P+zmsJfwWs/eskfGxciAhwc6lCSD2d8u8S6lCAMwNDHhIVMhf4ROO3dUms9h2nCwp0UGZIACS2i90n3tvHd/x8d/aEin0F24HKUqdA8yWhD4rskPyGDm3aD9kkajgqlslfS9T5Imv/tQOQeQgWE3P+0DeDg9QBuMkH8oQgGPqaH3ydhKYLI1I6PTTIqaDaAWC1qDg+Pmbx8fA9LYXReGkUQ9CNsDngsN8mZUPhmq+NiyknUNPmWwEgJgjUOl87AERxHC1bJ8Wroi3cHcxt5o5R5x+S8uNxLQAQes5gFokc9RY7AEQ6VhFNK/HVPf8jK5tDBwZrv4kyY3dw4gIAAAACAFAZugYA81NuEIA+AEjsZVoss5VxAGtjAcFW+cYMgKURwTqhCSglpPJiiqHiMg59Gc00WZYiwO1IwAtGNpSVi1f4tq3lKxYBuFFGxXRxpiA3ycnoSWiWAYAAAAQAIAAApdENvC0+ZII3lfKpY6PA9tPZARm9F9liBOAXfUr6Rtq4+7dJRiaBLAPAYwC7SsumfhFoDACUfQn1LBK56St1ALQXuAIAym9rtR4oYWIlsPVeQBdlwziAxkTQXAJoGQBWg4pDJUJ3BwdUbF/LMQ4AAQAIAEAAAAIAYcXZ+MYc++Q8wnfsM30AoFw5lbde0OSET0oASIwPmOzvpwKA1MNUYnlhMW0OlRwQaiACpB0BxO71QwSYTicC33GGJFCvyr6QSsUR7wBgMgQd306vzdHxPA7Qjqn2xwoABAAgAAABAAgAQAAAAgAQAIAAAAQAoH/1R4ABAHF3K+2bw1JCAAAAAElFTkSuQmCC';
                if (isCenter) {
                    node.fillColor = self.options.emphasesColor;
                    node.lineColor = self.options.emphasesLightColor;
                }
            } else {
                node.lineWidth = 2;
                node.lineColor = self.options.primaryColor;
                node.fillColor = self.options.lightColor;
                node.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA3RUVGNzVBMTVFQzExRTdBM0FERjI5RjczQUM4N0QyIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA3RUVGNzVCMTVFQzExRTdBM0FERjI5RjczQUM4N0QyIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDdFRUY3NTgxNUVDMTFFN0EzQURGMjlGNzNBQzg3RDIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDdFRUY3NTkxNUVDMTFFN0EzQURGMjlGNzNBQzg3RDIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5z4BZ4AAADHUlEQVR42uzbTU4UQRyG8QYMbLyBK1mKiR8L3RsXfnABWeugO7mIrkwEcc0FJGFhOIExaohLogtvIDGQCP47NAkboGeYwuqu35O8mYR0MdNTz1Qq1XknDg4OKpTLBAEI4FsgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACnMTKysq1eHkaeRi52vx5O7IRWY18L3kCBoNBPwWIiZ+Ol1eRF5HJEy7bj7yLLEX+DPkW9f9/HnkSuR653DM3fke2ImuRtyHKXmcEaCZ/PXK/5ZDNZoVoe5NXIh8iNwtZKL5E5kOCX+P+x5OJPvDrISa/5l6zWrT95Zc0+VVzr+vxw5rJXoD4kHPxsjjC0Ho5n2tx3WJhk3/EjXrL0IUVoN7wTY0wbqoZexYLBe8ZF7ogwIPEY28XLMCtLggwm3jsdMECzHRBgPOwV+FCSSHA9jnG/iTJmWcD2QuwcY6xH1tc87lgAba6IMD7yN8RxtVjVltct1awAGvZCzAYDGpLl0cYutzS8Pq6rwVO/rcRv9f/sglcarmcH7HZjGnDbuRxdXg8Wgq18I/ix7XbCQGaBxf1JL2pDh/4nMR+Y/X8kJu7+kz8buRl5FNkp4eTvtPcW32Pd1I8B6i5iMfB9fHus+rwkGe2megfzQqxmmJj0yV6+zh4CEEqAvTrHAAdggAEAAFAABAABAABQAAQAAQAAUAA9JtLqd9AOzhvtIPzRTv4FLSDM98DaAePF+3gY2gHZ74CaAenQzu40g7OXgDt4HRoByN/AbSD054NZC+AdnA6tIMr7eC8BdAOToZ2cIN2cO4CaAePBe3gEtAO1g7u3TkAOgQBCAACgAAgAAgAAoAAIAAIAAKAAOg32sGFox2cL9rBp6AdnPkeQDt4vGgHH0M7OPMVQDs4HdrBlXZw9gJoB6dDOxj5C6AdnPZsIHsBtIPToR1caQfnLYB2cDK0gxu0g3MXQDt4LGgHl0Dx7WBUBAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABMCT/BBgA8SDQyY7AsYEAAAAASUVORK5CYII=';
                if (isCenter) {
                    node.fillColor = self.options.lightColor;
                    node.lineColor = self.options.emphasesColor;
                }
            }
            if (node.hovered) {
                node.radius = node.radius * 1.25;
            }
        };

        return Service;
    }
})(window, jQuery);
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
                line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (data.className || typeObj[data.classId] || '') + '</span>' + line;
                return line;
            }
        };

        Service.prototype.onPrompt = function (options) {
            var self = this;
            return function (pre, $self) {
                var param = options.data || {};
                param.kgName = options.kgName;
                param[options.paramName || 'kw'] = pre;
                hieknjs.kgLoader({
                    url: options.url ? options.url : (options.baseUrl + 'prompt'),
                    params: param,
                    type: options.type ? (options.type == 'POST' ? 1 : 0) : 1,
                    success: function (data) {
                        if ($self.prompt == param[options.paramName || 'kw']) {
                            var d = data.rsData;
                            options.beforeDrawPrompt && (d = options.beforeDrawPrompt(d, pre));
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
                beforeSend: function () {
                    options.that && $(options.that).find('.ajax-loading').html('<div class="schema-init">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 14 32 18" width="32" height="4" preserveAspectRatio="none">' +
                        '<path opacity="0.8" transform="translate(0 0)" d="M2 14 V18 H6 V14z">' +
                        '<animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0" repeatCount="indefinite"' +
                        ' keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>' +
                        '<path opacity="0.5" transform="translate(0 0)" d="M0 14 V18 H8 V14z">' +
                        '<animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.1s" repeatCount="indefinite"' +
                        ' keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>' +
                        '<path opacity="0.25" transform="translate(0 0)" d="M0 14 V18 H8 V14z">' +
                        '<animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.2s" repeatCount="indefinite"' +
                        ' keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>' +
                        '</svg>' +
                        '</div>');
                },
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                },
                that: options.that
            });
        };

        Service.prototype.gentInfobox = function (options) {
            var self = this;
            var data = options.data || {};
            data.isRelationAtts = true;
            self.infoboxService = new HieknInfoboxService({
                baseUrl: options.baseUrl,
                kgName: options.kgName,
                imagePrefix: options.imagePrefix,
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

        Service.prototype.legend = function (schema) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (key, value) {
                return '<div class="tgc2-legend-item tgc2-legend-item-' + key + '"><i style="background: ' + value + '"></i><span>' + typeObj[key] + '</span></div>';
            }
        };

        Service.prototype.qiniuImg = function (img) {
            return img + '?_=' + parseInt(new Date().getTime() / 3600000);
        };

        Service.prototype.nodeStyleFunction = function (options) {
            var self = this;
            if (options.enableAutoUpdateStyle) {
                setInterval(function () {
                    if (self.centerNode) {
                        var radius = options.tgc2.netChart.getNodeDimensions(self.centerNode).radius;
                        if (self.nodeRadius != radius) {
                            var nodes = options.tgc2.netChart.nodes();
                            var ids = [];
                            for (var i in nodes) {
                                ids.push(nodes[i].id);
                            }
                            options.tgc2.netChart.updateStyle(ids);
                        }
                    }
                }, 30);
            }
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
                if (node.data.img) {
                    if (node.data.img.indexOf('http') != 0 && options.imagePrefix) {
                        node.image = self.qiniuImg(options.imagePrefix + node.data.img);
                    } else {
                        node.image = node.data.img;
                    }
                    if (!options.tgc2.inStart(node.id) && !options.tgc2.nodeIds[node.id] && !$.isEmptyObject(options.tgc2.nodeIds)) {
                        node.image = '';
                    }
                    node.fillColor = '#fff';
                } else if (options.images && options.images[node.data.classId]) {
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
                var radius = options.tgc2.netChart.getNodeDimensions(node).radius;
                if (options.enableAutoUpdateStyle) {
                    if (radius < options.minRadius) {
                        node.image = '';
                        node.fillColor = node.lineColor;
                    }
                    if (options.tgc2.inStart(node.id)) {
                        self.nodeRadius = radius;
                        !self.centerNode && (self.centerNode = node);
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

        Service.prototype.linkContentsFunction = function (linkData) {
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
            return function ($self, callback, failed) {
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
                            if (data) {
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        } else {
                            failed();
                        }
                    },
                    error: function () {
                        failed();
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        Service.prototype.graphInit = function (options) {
            var self = this;
            var param = options.data || {};
            param.kgName = options.kgName;
            param.isTiming = options.isTiming;
            hieknjs.kgLoader({
                url: options.baseUrl + 'graph/init',
                type: 1,
                params: param,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        options.success(data);
                    } else {
                        options.failed();
                    }
                },
                error: function () {
                    options.failed();
                },
                that: options.that
            });
        };

        Service.prototype.timing = function (options, schema) {
            var self = this;
            return function ($self, callback, failed) {
                var param = options.data || {};
                param.kgName = options.kgName;
                param.id = options.tgc2.startInfo.id;
                param.isRelationMerge = true;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                if (options.tgc2TimeChart) {
                    var settings = options.tgc2TimeChart.getSettings();
                    delete settings.type;
                    $.extend(true, param, settings);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'graph/timing',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            if (data) {
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        } else {
                            failed();
                        }
                    },
                    error: function () {
                        failed();
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        Service.prototype.relation = function (options, schema) {
            var self = this;
            return function (instance, callback, failed) {
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
                            if (data) {
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        } else {
                            failed();
                        }
                    },
                    error: function () {
                        toastr.error('网络接口错误！');
                        failed();
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        Service.prototype.path = function (options, schema) {
            var self = this;
            return function (instance, callback, failed) {
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
                            if (data) {
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        } else {
                            failed();
                        }
                    },
                    error: function () {
                        toastr.error('网络接口错误！');
                        failed();
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        return Service;
    }
})();

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
                imagePrefix: null,
                href: null
            };
            self.options = $.extend(true, {}, defaultSettings, options);
        };

        Service.prototype.href = function (id) {
            var self = this;
            self.load(id, self.callback);
        };

        Service.prototype.initEvent = function ($container) {
            var self = this;
            $container.on('click', '.hiekn-infobox-link', function () {
                var id = $(this).attr('data-id');
                self.options.href ? self.options.href(id, self) : self.href(id);
            });
            $container.on('click', '.hiekn-infobox-info-detail a', function () {
                $(this).closest('.hiekn-infobox-info-detail').toggleClass('on');
            });
        };

        Service.prototype.buildEntity = function (entity, buildLink) {
            var self = this;
            var meaningTag = entity.meaningTag ? '(' + entity.meaningTag + ')' : '';
            var html = '<span class="hiekn-infobox-name">' + entity.name + '<span class="hiekn-infobox-meaningTag">' + meaningTag + '</span></span>';
            if (buildLink && self.options.enableLink) {
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
            var param = self.options.data || {};
            param.id = id;
            param.kgName = self.options.kgName;
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'infobox',
                type: 1,
                params: param,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        if (callback) {
                            self.callback = callback;
                            callback(data);
                        } else if (self.options.selector) {
                            var $container = self.buildInfobox(data);
                            $(self.options.selector).html($container);
                            self.initEvent($container);
                        } else {
                            console.error('selector or callback must be config');
                        }
                    } else {
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
                if(data.self.img) {
                    var imgUlrl = data.self.img;
                    if(data.self.img.indexOf('http') != 0){
                        imgUlrl = self.options.imagePrefix + data.self.img + '?_=' + Math.round(new Date() / 3600000);
                    }
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-img"><img src="' + imgUlrl + '" alt=""></div>');
                }
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
                selector: options.selector,
                imagePrefix: options.imagePrefix
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
            self.tgc2Settings = {};

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
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
                    legend:{
                        enable: false,
                        style:{
                           left:'390px'
                        },
                        data: options.nodeColors || [],
                        onDraw: self.sdkUtils.legend(schema)
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
                beforeDrawPrompt: null,
                container: null,
                data: null,
                url: null,
                type: 'POST',
                paramName: 'kw',
                baseUrl: null,
                kgName: null,
                ready: $.noop,
                onSearch: $.noop
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            var sdk = new HieknSDKService(self.options);
            sdk.schema(self.options, function (schema) {
                var promptSettings = {
                    drawPromptItem: sdk.drawPromptItem(schema),
                    onPrompt: sdk.onPrompt(self.options)
                };
                $.extend(true, promptSettings, self.options);
                self.instance = new hieknPrompt(promptSettings);
                self.options.ready(self.instance);
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
                selector: options.selector,
                imagePrefix: options.imagePrefix
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
            self.tgc2Settings = {};

            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
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
                    legend:{
                        enable: false,
                        style:{
                            left:'390px'
                        },
                        data: options.nodeColors || [],
                        onDraw: self.sdkUtils.legend(schema)
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

    window.HieknResourceService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                baseUrl: null,
                beforeLoad: $.noop,
                container: null,
                config: {},
                data: null,
                onLoad: $.noop
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.getQuery = function () {
            var self = this;
            var must = [];
            var filter = self.tableService.getFilterOptions();
            for (var key in filter) {
                var should = [];
                var value = filter[key];
                var filterConfig = _.find(self.options.config.filter, ['key', key]);
                if (filterConfig.type == 'year' || filterConfig.type == 'month') {
                    for (var i in value) {
                        var year = value[i];
                        var from = '';
                        var to = '';
                        if (filterConfig.type == 'year') {
                            from = moment(year + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                            to = moment((parseInt(year, 10) + 1) + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                        } else {
                            from = moment(year + '-01').format(filterConfig.format || 'YYYY-MM');
                            to = moment((parseInt(year, 10) + 1) + '-01').format(filterConfig.format || 'YYYY-MM');
                        }
                        var obj = {};
                        obj[key] = {
                            from: from,
                            to: to,
                            include_lower: true,
                            include_upper: false
                        };
                        var rangeObj = {
                            range: obj
                        };
                        should.push(rangeObj);
                    }
                } else {
                    var obj = {};
                    obj[key] = value;
                    var termObj = {
                        terms: obj
                    };
                    should.push(termObj);
                }
                must.push({
                    bool: {
                        should: should,
                        minimum_should_match: 1
                    }
                });
            }
            var kw = self.tableService.getFilterKw();
            if (kw) {
                var should = [];
                var fields = self.options.config.fieldsTable || self.options.config.fields;
                var obj = {};
                obj.query = kw;
                obj.fields = fields;
                var termObj = {
                    query_string: obj
                };
                should.push(termObj);
                must.push({
                    bool: {
                        should: should,
                        minimum_should_match: 1
                    }
                });
            }
            return {
                bool: {
                    must: must
                }
            };
        };

        Service.prototype.init = function () {
            var self = this;
            var config = {
                config: self.options.config,
                container: self.options.container,
                load: function (pageNo, instance) {
                    self.load(pageNo, instance);
                }
            };
            self.tableService = new HieknTableService(config);
        };

        Service.prototype.loadData = function (pageNo) {
            var self = this;
            self.tableService.loadData(pageNo);
        };

        Service.prototype.load = function (pageNo, instance) {
            var self = this;
            self.query = self.getQuery();
            self.options.beforeLoad(self);
            var res = self.options.config;
            var param = self.options.data || {};
            param.databases = res.databases;
            param.tables = res.tables;
            param.fields = res.fields;
            param.query = JSON.stringify(self.query);
            param.pageNo = pageNo;
            param.pageSize = param.pageSize || 15;
            var $container = instance.getTableContainer();
            $container.empty();
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'search',
                type: 1,
                params: param,
                success: function (data, textStatus, jqXHR, params) {
                    if (data) {
                        instance.drawPage(data.rsCount, params.pageNo, params.pageSize);
                        instance.drawData(data.rsData);
                    } else {
                        instance.drawPage(0, params.pageNo, params.pageSize);
                    }
                    self.options.onLoad(data, self);
                },
                that: $container[0]
            });
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    'use strict';

    window.HieknResourcesService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                baseUrl: null,
                beforeLoad: $.noop,
                container: null,
                configs: [],
                data: null,
                namespace: 'hiekn-resource',
                onLoad: $.noop
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.resourcesService = [];
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container);
            self.$headContainer = $('<div class="hiekn-resource-nav-container">' +
                '<ul class="hiekn-resource-nav nav nav-tabs" role="tablist"></ul>' +
                '<div class="hiekn-resource-nav-more hide">更多</div>' +
                '<div class="hiekn-resource-nav-more-container hide">' +
                '<ul class="hiekn-resource-nav-hide-tabs"></ul>' +
                '</div>' +
                '</div>');
            self.$bodyContainer = $('<div class="hiekn-resource-container tab-content"></div>');
            self.$container.append(self.$headContainer);
            self.$container.append(self.$bodyContainer);
            var $navContainer = self.select('.hiekn-resource-nav-container ul.hiekn-resource-nav');
            var $navHideContainer = self.select('.hiekn-resource-nav-container ul.hiekn-resource-nav-hide-tabs');
            var allW = 0;
            for (var i in self.options.configs) {
                var cls = i == 0 ? 'active' : '';
                var id = self.options.namespace + '-tab-' + i + '-' + new Date().getTime();
                var $resourceContainer = $('<div role="tabpanel" class="tab-pane ' + cls + '" id="' + id + '"></div>');
                self.$bodyContainer.append($resourceContainer);
                var config = $.extend(true, {}, self.options);
                config.config = self.options.configs[i];
                config.container = $resourceContainer;
                config.onLoad = function (data, instance) {
                    var id = instance.tableService.$container.attr('id');
                    self.$headContainer.find('a[href="#' + id + '"] .res-count').text(data.rsCount || 0);
                    self.options.onLoad(data, instance);
                };
                delete config.configs;
                self.resourcesService.push(new HieknResourceService(config));
                var tab = '<li role="presentation" class="' + cls + '">' +
                    '<a href="#' + id + '" aria-controls="" role="tab" data-toggle="tab">' +
                    '<span class="res-name" title="' + config.config.name + '">' + config.config.name + '</span>' +
                    '<span class="res-count"></span>' +
                    '</a></li>';
                $navContainer.append(tab);
                $navHideContainer.append(tab);
                allW += $navContainer.find('li:last-child').width();
            }
            $navContainer.css('width', allW);
            self.updateTabVisibility();
            self.bindEvent();
        };

        Service.prototype.bindEvent = function () {
            var self = this;
            self.$headContainer.find('.hiekn-resource-nav-more').on('click', function () {
                self.$headContainer.find('.hiekn-resource-nav-more-container').toggleClass('hide');
            });

            self.$headContainer.on('shown.bs.tab', 'a[data-toggle="tab"]', function () {
                var href = $(this).attr('href');
                self.$headContainer.find('.hiekn-resource-nav a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
                self.$headContainer.find('.hiekn-resource-nav-hide-tabs a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
            });

            $('body').on('click', function (event) {
                if (!$(event.target).closest('.hiekn-resource-nav-more-container,.hiekn-resource-nav-more').length) {
                    self.$headContainer.find('.hiekn-resource-nav-more-container').addClass('hide');
                }
            });

            $(window).on('resize', function () {
                self.updateTabVisibility();
            });
        };

        Service.prototype.loadData = function (pageNo) {
            var self = this;
            for (var i in self.resourcesService) {
                self.resourcesService[i].loadData(pageNo);
            }
        };

        Service.prototype.select = function (selector) {
            var self = this;
            return self.$container.find(selector);
        };

        Service.prototype.updateTabVisibility = function () {
            var self = this;
            var $container = self.$headContainer;
            var cw = $container.width();
            var $navContainer = $container.find('.nav');
            var tw = $navContainer.width();
            var $nm = $container.find('.hiekn-resource-nav-more');
            if (cw < tw) {
                $nm.removeClass('hide');
            } else {
                $nm.addClass('hide');
                $container.find('.hiekn-resource-nav-more-container').addClass('hide');
            }
            var w = 0;
            var nmw = $nm.outerWidth();
            var $hideTabs = $container.find('.hiekn-resource-nav-hide-tabs>li');
            $navContainer.find('li').each(function (i, v) {
                $(v).removeClass('hide');
                w += $(v).width();
                if (w >= cw - nmw) {
                    $(v).addClass('hide');
                    $($hideTabs.get(i)).removeClass('hide');
                } else {
                    $($hideTabs.get(i)).addClass('hide');
                }
            });
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    'use strict';

    window.HieknStatService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                container: null,
                beforeLoad: null,
                data: null,
                config: {},
                baseUrl: null,
                kgName: null,
                chartColor: ['#66d1b9', '#f0cb69', '#88bbf5', '#e99592']
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container);
            self.bindEvent();
        };

        Service.prototype.bindEvent = function () {
            var self = this;
            $(window).on('resize', function () {
                self.chart && self.chart.resize();
            });
        };

        Service.prototype.drawChart = function () {
            var self = this;
            switch (self.options.config.type) {
                case 'bar':
                    self.drawLineBarChart('bar');
                    break;
                case 'line':
                    self.drawLineBarChart('line');
                    break;
                case 'pie':
                    self.drawPieChart();
                    break;
                case 'wordCloud':
                    self.drawWordCloudChart();
                    break;
            }
        };

        Service.prototype.drawPieChart = function () {
            var self = this;
            var d = self.stat;
            var stat = self.options.config;
            var legend = [];
            for (var is in d.series) {
                var s = d.series[is];
                if (stat.seriesName) {
                    s.name = stat.seriesName[s.name] || s.name;
                    legend.push(s.name);
                }
            }
            var defaultSeries = {
                name: '',
                type: 'pie',
                radius: '75%',
                center: ['50%', '50%'],
                data: d.series,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            };
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
                color: self.options.chartColor,
                tooltip: {
                    trigger: 'item',
                    formatter: '{b} <br/>{c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: legend
                }
            };
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);
        };

        Service.prototype.drawWordCloudChart = function () {
            var self = this;
            var d = self.stat;
            var stat = self.options.config;
            var data = [];
            for (var is in d.series) {
                if (d.series[is].name) {
                    data.push(d.series[is]);
                }
            }
            var defaultSeries = {
                type: 'wordCloud',
                sizeRange: [12, 50],
                rotationRange: [-45, 90],
                textPadding: 0,
                autoSize: {
                    enable: true,
                    minSize: 6
                },
                textStyle: {
                    normal: {
                        color: function () {
                            return self.options.chartColor[Math.floor(Math.random() * self.options.chartColor.length)];
                        }
                    },
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
                data: data
            };
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {};
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);
        };

        Service.prototype.drawLineBarChart = function (type) {
            var self = this;
            var defaultXAxis = {
                type: 'category',
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false,
                    alignWithLabel: true
                },
                splitLine: {
                    show: true
                }
            };
            var defaultSeries = {
                name: '',
                type: type,
                symbol: 'circle',
                symbolSize: 10
            };
            var d = self.stat;
            var stat = self.options.config;
            var idx = 0;
            var xAxisArr = [];
            for (var xAxisi in d.xAxis) {
                var xAxis = d.xAxis[xAxisi];
                if (stat.chartSettings && stat.chartSettings.xAxis) {
                    if (stat.chartSettings.xAxis instanceof Array) {
                        $.extend(true, defaultXAxis, stat.chartSettings.xAxis[idx]);
                    } else {
                        $.extend(true, defaultXAxis, stat.chartSettings.xAxis);
                    }
                }
                xAxisArr.push($.extend(true, {}, defaultXAxis, xAxis));
            }
            idx = 0;
            var seriesArr = [];
            for (var seriesi in d.series) {
                var series = d.series[seriesi];
                if (stat.chartSettings && stat.chartSettings.series) {
                    if (stat.chartSettings.series instanceof Array) {
                        $.extend(true, defaultSeries, stat.chartSettings.series[idx]);
                    } else {
                        $.extend(true, defaultSeries, stat.chartSettings.series);
                    }
                }
                var s = $.extend(true, {}, defaultSeries, series);
                if (stat.seriesName) {
                    s.name = stat.seriesName[s.name] || s.name;
                }
                seriesArr.push(s);
                idx++;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
                color: self.options.chartColor,
                tooltip: {
                    formatter: function (param) {
                        var str = '';
                        for (var itemi in param) {
                            var item = param[itemi];
                            str += item.seriesName + ':' + item.data + '<br>';
                        }
                        return str;
                    },
                    position: 'top',
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line'
                    }
                },
                grid: {
                    left: 9,
                    right: 9,
                    bottom: 24,
                    top: 24,
                    containLabel: true
                },
                yAxis: [
                    {
                        type: 'value',
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    }
                ]
            };
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            if (stat.changeXY) {
                option.xAxis = option.yAxis;
                option.yAxis = xAxisArr;
            } else {
                option.xAxis = xAxisArr;
            }
            option.series = seriesArr;
            self.chart.setOption(option);
        };

        Service.prototype.load = function () {
            var self = this;
            var param = self.options.data || {};
            param = $.extend(true, param, self.options.config.querySettings);
            if (self.options.beforeLoad) {
                param = self.options.beforeLoad(param);
            }
            var $container = self.$container;
            $container.empty();
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'stat/data',
                type: 1,
                params: param,
                success: function (data, textStatus, jqXHR, params) {
                    if (data) {
                        self.stat = data.rsData[0];
                        self.drawChart();
                    }
                },
                that: $container[0]
            });
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    'use strict';

    window.HieknTableService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                container: null,
                config: {},
                load: $.noop
            };
            self.$container = null;
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
            return self;
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container).addClass('hiekn-table');
            self.$container.append('<div class="hiekn-table-filter">' +
                '</div>' +
                '<div class="hiekn-table-content"></div>' +
                '<div class="hiekn-table-page">' +
                '<div class="pagination-outter">' +
                '<ul class="pagination"></ul>' +
                '</div>' +
                '</div>');
            self.buildFilter();
            self.bindEvent();
        };

        Service.prototype.bindEvent = function () {
            var self = this;
            self.bindFilterEvent();
            self.bindTableEvent();
        };

        Service.prototype.bindFilterEvent = function () {
            var self = this;
            this.select('.hiekn-table-filter').on('click', 'span[option-value]', function (event) {
                var $item = $(event.target);
                var key = $item.attr('option-key');
                var value = $item.attr('option-value');
                if ($item.closest('.hiekn-table-filter-item').hasClass('multi')) {
                    $item.toggleClass('active');
                } else {
                    if (!$item.hasClass('active')) {
                        $item.addClass('active').siblings('.active').removeClass('active');
                    } else {
                        $item.removeClass('active');
                    }
                    self.loadData(1);
                }
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-more', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').addClass('expend');
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-less', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').removeClass('expend');
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-multi', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').addClass('multi');
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-confirm', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').removeClass('multi');
                self.loadData(1);
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-cancel', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').removeClass('multi');
            });
            this.select('.hiekn-table-search-kw-container').on('keydown', 'input', function (event) {
                var key = window.event ? event.keyCode : event.which;
                if (key == 13) {
                    self.loadData(1);
                }
            });
        };

        Service.prototype.bindTableEvent = function () {
            var self = this;
            self.select('.hiekn-table-content').on('click', '.hiekn-table-data-angle', function () {
                $(this).toggleClass('on').closest('tr').next('tr.hiekn-table-detail-line').toggleClass('hide');
            });
        };

        Service.prototype.buildFilter = function () {
            var self = this;
            var filterHtml = '';
            var filters = self.options.config.filter;
            for (var i in filters) {
                var filter = filters[i];
                var label = filter.label || filter.key;
                var filterOptions = '';
                for (var j in filter.options) {
                    var item = filter.options[j];
                    if (item instanceof Object) {
                        filterOptions += '<span option-value="' + item.value + '" option-key="' + filter.key + '">' + item.key + '</span>';
                    } else {
                        filterOptions += '<span option-value="' + item + '" option-key="' + filter.key + '">' + item + '</span>';
                    }
                }
                filterHtml += '<div class="hiekn-table-filter-item">' +
                    '<div class="hiekn-table-filter-item-label">' + label + '：</div>' +
                    '<div class="hiekn-table-filter-item-content">' + filterOptions + '' +
                    '<div class="hiekn-table-more-container">' +
                    '<span class="hiekn-table-filter-more">更多 <i class="fa fa-angle-down"></i></span>' +
                    '<span class="hiekn-table-filter-less">收起 <i class="fa fa-angle-up"></i></span>' +
                    '<span class="hiekn-table-filter-multi"><i class="fa fa-plus"></i> 多选</span>' +
                    '<button class="btn btn-primary hiekn-table-btn-confirm">确定</button>' +
                    '<button class="btn btn-primary-outline hiekn-table-btn-cancel">取消</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }
            filterHtml += '<div class="hiekn-table-filter-item hiekn-table-filter-item-kw">' +
                '<div class="hiekn-table-filter-item-label">关键词：</div>' +
                '<div class="hiekn-table-filter-item-content">' +
                '<div class="hiekn-table-search-kw-container"><input type="text"><button class="btn btn-primary hiekn-table-btn-confirm">确定</button></div>' +
                '</div>' +
                '</div>';
            self.select('.hiekn-table-filter').html(filterHtml);
        };

        Service.prototype.dealContent = function (d) {
            if (d) {
                var text = $('<div>' + d + '</div>').text();
                if (text.length > 80) {
                    return text.substring(0, 80) + '...';
                } else {
                    return text;
                }
            } else {
                return '';
            }
        };

        Service.prototype.drawPage = function (count, pageNo, pageSize) {
            var self = this;
            hieknjs.gentPage({
                data: Math.ceil(count / pageSize),
                cur: pageNo,
                p: self.select('.pagination'),
                event: function (data, pageNo) {
                    self.loadData(pageNo);
                }
            });
        };

        Service.prototype.drawData = function (data) {
            var self = this;
            var res = self.options.config;
            data = hieknjs.dealNull(data);
            self.data = data;
            var ths = '<thead><tr>';
            var trs = '<tbody>';
            var fields = res.fieldsTable || res.fields;
            var fieldsName = res.fieldsTableName ? res.fieldsTableName : (res.fieldsName ? res.fieldsName : fields);
            var drawDetail = res.drawDetail || res.fieldsDetail || res.fieldsTable;
            var fieldsDetail = res.fieldsDetail || res.fields;
            var fieldsNameDetail = res.fieldsDetailName ? res.fieldsDetailName : (res.fieldsName ? res.fieldsName : fields);
            var fieldsRenderer = res.fieldsRenderer || {};
            var fieldsLink = {};
            if (drawDetail) {
                ths += '<th></th>';
            }
            for (var fidx in fields) {
                var renderer = fieldsRenderer[fields[fidx]];
                if (renderer && renderer instanceof Object && renderer.type == 'link' && renderer.fields) {
                    for (var i in renderer.fields) {
                        var f = renderer.fields[i];
                        fieldsLink[f] = fields[fidx];
                    }
                    continue;
                }
                ths += '<th>' + fieldsName[fidx] + '</th>';
            }
            for (var l in data) {
                var d = data[l];
                var tr = '<tr>';
                if (drawDetail) {
                    tr += '<td class="hiekn-table-data-angle"><i class="fa fa-caret-right"></i></td>';
                }
                var len = 0;
                for (var j in fields) {
                    len++;
                    var k = fields[j];
                    if (!fieldsRenderer[k] || !fieldsRenderer[k].fields) {
                        tr += '<td>' + self.rendererFields(d, k, fieldsLink, fieldsRenderer, true) + '</td>';
                    }
                }
                tr += '</tr>';
                trs += tr;
                if (drawDetail) {
                    var trDetail = '<tr class="hiekn-table-detail-line hide"><td colspan="' + (len + 1) + '">';
                    for (var i in fieldsDetail) {
                        var k = fieldsDetail[i];
                        if (!fieldsRenderer[k] || !fieldsRenderer[k].fields) {
                            trDetail += '<div class="hiekn-table-detail-' + k + '"><label>' + fieldsNameDetail[i] + ':</label>' + self.rendererFields(d, k, fieldsLink, fieldsRenderer, false) + '</div>';
                        }
                    }
                    trDetail += '</td></tr>';
                    trs += trDetail;
                }
            }
            trs += '</body>';
            ths += '</tr></thead>';
            self.select('.hiekn-table-content').html('<table class="hiekn-table-normal">' + ths + trs + '</table>');
        };

        Service.prototype.getFilterKw = function () {
            var self = this;
            var $item = self.select('.hiekn-table-search-kw-container');
            return $item.find('input').val();
        };

        Service.prototype.getFilterOptions = function () {
            var self = this;
            var filterOptions = {};
            self.select('.hiekn-table-filter-item').each(function (i, v) {
                var key = '';
                var $items = $(v).find('span[option-value].active');
                if ($items.length) {
                    var hasAll = false;
                    var value = [];
                    $items.each(function (j, e) {
                        var ov = $(e).attr('option-value');
                        if (!ov) {
                            hasAll = true;
                        } else {
                            key = $(e).attr('option-key');
                            value.push(ov);
                        }
                    });
                    if (!hasAll) {
                        filterOptions[key] = value;
                    }
                }
            });
            return filterOptions;
        };

        Service.prototype.getTableContainer = function () {
            var self = this;
            return self.select('.hiekn-table-content');
        };

        Service.prototype.getValues = function (value) {
            var values = [];
            if (value instanceof Array) {
                values = value;
            } else if (typeof value == 'string') {
                if (value.indexOf('[') == 0) {
                    try {
                        values = JSON.parse(value);
                    } catch (e) {
                        values = [value];
                    }
                } else {
                    values = value.split(',');
                }
            }
            return values;
        };

        Service.prototype.loadData = function (pageNo) {
            var self = this;
            self.options.load(pageNo, self);
        };

        Service.prototype.rendererDateTime = function (v) {
            return moment(v).format('YYYY-MM-DD HH:mm:ss');
        };

        Service.prototype.rendererDate = function (v) {
            return moment(v).format('YYYYMMDD');
        };

        Service.prototype.rendererFields = function (d, k, fieldsLink, fieldsRenderer, short) {
            var self = this;
            var str = '';
            if (d[k]) {
                var values = self.getValues(d[k]);
                for (var idx in values) {
                    if (!fieldsRenderer[k]) {
                        str += self.rendererValue('string', values[idx], undefined, short);
                    } else {
                        str += self.rendererValue(fieldsRenderer[k].type || fieldsRenderer[k], values[idx], fieldsRenderer[k], short);
                    }
                }
            }
            if (fieldsLink[k]) {
                var name = d[k];
                if (!d[k]) {
                    name = '链接';
                }
                str = self.rendererLink(d[fieldsLink[k]], name);
            }
            return str;
        };

        Service.prototype.rendererYear = function (v) {
            return moment(v).format('YYYY');
        };

        Service.prototype.rendererLink = function (v, name, cls) {
            name = name || '查看';
            cls = cls || '';
            return v ? '<a href="' + v + '" target="_blank" class="' + cls + '">' + name + '</a>' : '';
        };

        Service.prototype.rendererValue = function (type, value, fieldsRenderer, short) {
            var self = this;
            var str = '';
            try {
                if (type == 'year') {
                    str = self.rendererYear(value);
                } else if (type == 'date') {
                    str = self.rendererDate(value);
                } else if (type == 'dateTime') {
                    str = self.rendererDateTime(value);
                } else if (type == 'json') {
                    str = JSON.stringify(value);
                } else if (type == 'link') {
                    str = self.rendererLink(value, fieldsRenderer.name, 'hiekn-table-btn-link');
                } else if (type == 'string' && short) {
                    str = self.dealContent(value);
                } else {
                    str = hieknjs.safeHTML(value);
                }
            } catch (e) {

            }
            return str;
        };

        Service.prototype.select = function (selector) {
            var self = this;
            return self.$container.find(selector);
        };

        return Service;
    }
})(window, jQuery);
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
            self.sdkUtils = new window.HieknSDKService();
            self.sdkUtils.schema(self.schemaSettings, function (schema) {
                var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
                var defaultOptions = {
                    selector: options.selector,
                    prompt: {
                        enable: true,
                        style: {
                            left: '340px',
                            top: '20px'
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
                        onDraw: self.sdkUtils.legend(schema),
                        style: {
                            left: '380px'
                        }
                    },
                    timeChart: {
                        enable: true,
                        style: {
                            left: '520px',
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
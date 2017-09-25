/**
     * @author: 
     *    jiangrun002
     * @version: 
     *    v2.4.2
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
                        enable: true,
                        settings: {
                            onPrompt: self.sdkUtils.onPromptKnowledge(self.promptSettings)
                        }
                    },
                    page: {
                        enable: true,
                        style:{
                          right:'15px'
                        },
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
            if(options.startInfo){
                self.load(options.startInfo);
            }
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
                dataFilter: self.options.dataFilter || function (data) {
                    return data;
                },
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

    window.HieknConceptPromptService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                beforeDrawPrompt: null,
                container: null,
                data: null,
                baseUrl: null,
                kgName: null,
                ready: $.noop,
                replaceSearch: false,
                onSearch: $.noop
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            var sdk = new HieknSDKService(self.options);
            var typeObj = {
                0: '概念',
                1: '实例'
            };
            var promptSettings = {
                drawPromptItem: function (data, pre) {
                    var line = '<span class="prompt-tip-title">' + data.name.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
                    line = '<span class="prompt-tip-type prompt-tip-' + data.kgType + '">' + (typeObj[data.kgType] || '') + '</span>' + line;
                    return line;
                },
                onPrompt: sdk.onPromptKnowledge(self.options)
            };
            if (self.options.replaceSearch) {
                promptSettings.beforeSearch = sdk.beforeSearch();
            }
            $.extend(true, promptSettings, self.options);
            self.instance = new hieknPrompt(promptSettings);
            self.options.ready(self.instance);
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
                        conceptGraphSettings: {}
                    }
                },
                instance: {
                    enable: false,
                    url: '',
                    onClick: $.noop
                },
                namespace: 'hiekn-concept-tree',
                pIdKey: 'parentId',
                readAll: false,
                hiddenIds: {self: [], rec: []}
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
                        var param2 = self.options.data2 || {};
                        param2.kgName = self.options.kgName;
                        param2[searchSettings.paramName || 'kw'] = kw;
                        hieknjs.kgLoader({
                            url: searchSettings.url + '?' + $.param(param),
                            params: param2,
                            type: searchSettings.type,
                            dataFilter: self.options.dataFilter || function (data) {
                                return data;
                            },
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
            if(self.options.dataFilter){
                childNodes = self.options.dataFilter(childNodes);
            }
            if (childNodes.code == 200) {
                if (!childNodes.data || !childNodes.data.rsData) {
                    return null;
                }
                childNodes = childNodes.data.rsData;
                var len = childNodes.length;
                var result = [];
                for (var i = 0; i < len; i++) {
                    !self.options.readAll && (childNodes[i].isParent = true);
                    if (_.indexOf(self.options.hiddenIds.self, childNodes[i][self.options.idKey]) < 0
                        && _.indexOf(self.options.hiddenIds.rec, childNodes[i][self.options.idKey]) < 0
                        && _.indexOf(self.options.hiddenIds.rec, childNodes[i][self.options.pIdKey]) < 0) {
                        if (!parentNode || childNodes[i][self.options.idKey] != parentNode[self.options.idKey]) {
                            result.push(childNodes[i]);
                        }
                    }
                    if (_.indexOf(self.options.hiddenIds.rec, childNodes[i][self.options.pIdKey]) >= 0) {
                        self.options.hiddenIds.rec.push(childNodes[i][self.options.idKey]);
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
                        dataFilter: self.options.dataFilter || function (data) {
                            return data;
                        },
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
            var root = self.zTree.getNodeByParam(self.options.idKey, self.options.initId);
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
            this.colorBase = ['#7bc0e1',
                '#9ec683',
                '#fde14d',
                '#ab89f4',
                '#e26f63',
                '#dca8c6',
                '#596690',
                '#eaad84',
                '#abe8bf',
                '#7979fc'];
            this.colorEx = ['#6db5d6',
                '#d0648a',
                '#c0d684',
                '#f2bac9',
                '#847d99',
                '#baf2d8',
                '#bfb3de',
                '#f4817c',
                '#94cdba',
                '#b2cede'];
            this.color = this.colorBase.concat(this.colorEx);
        };

        Service.prototype.drawPromptItem = function (schema) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (data, pre) {
                var title = data.name;
                if (data.meaningTag) {
                    title = title + ' ( ' + data.meaningTag + ' )';
                }
                var line = '<span class="prompt-tip-title">' + title.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
                line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (data.className || typeObj[data.classId] || '') + '</span>' + line;
                return line;
            }
        };

        Service.prototype.drawPromptItems = function (schema, hieknPrompt) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (data, pre) {
                var $container = $('<div></div>');
                data.forEach(function (v) {
                    var text = hieknPrompt.instance.options.drawPromptItem(v, pre);
                    var title = hieknPrompt.instance.options.drawItemTitle(v);
                    var cls = 'prompt-item-' + v.classId;
                    var $li = $('<li title="' + title + '" class="' + cls + '">' + text + '</li>').data('data', v);
                    var ex = $container.find('.' + cls);
                    if (ex.length) {
                        $(ex[ex.length - 1]).after($li);
                        $li.find('.prompt-tip-type').empty();
                    } else {
                        $container.append($li);
                    }
                });
                return $container.children();
            }
        };

        Service.prototype.onPromptStart = function (options) {
            var self = this;
            return function (pre, $self) {
                var param = options.data || {};
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2[options.paramName] = pre;
                hieknjs.kgLoader({
                    url: options.url + '?' + $.param(param),
                    params: param2,
                    type: options.type,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    success: function (data) {
                        if ($self.prompt == param2[options.paramName]) {
                            var d = data.rsData;
                            options.beforeDrawPrompt && (d = options.beforeDrawPrompt(d, pre));
                            $self.startDrawPromptItems(d, pre);
                        }
                    }
                });
            }
        };

        Service.prototype.onPrompt = function (options) {
            var self = this;
            options.paramName = 'kw';
            options.url = options.baseUrl + 'prompt';
            options.type = 1;
            return self.onPromptStart(options);
        };

        Service.prototype.onPromptKnowledge = function (options) {
            var self = this;
            options.paramName = 'text';
            options.url = options.baseUrl + 'prompt/knowledge';
            options.type = 0;
            return self.onPromptStart(options);
        };

        Service.prototype.beforeSearch = function () {
            var self = this;
            return function (selectedItem, $container) {
                if (selectedItem) {
                    $container.find('input[type=text]').val(selectedItem.name);
                }
            }
        };

        Service.prototype.schema = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param2.kgName = options.kgName;
            hieknjs.kgLoader({
                url: options.baseUrl + 'schema' + '?' + $.param(param),
                type: 1,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
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

        Service.prototype.segment = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param.kgName = options.kgName;
            param.kw = options.kw;
            hieknjs.kgLoader({
                url: options.baseUrl + 'segment' + '?' + $.param(param),
                type: 0,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData;
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                },
                that: options.that
            });
        };

        Service.prototype.disambiguate = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param.kgName = options.kgName;
            param.kw = options.kw;
            hieknjs.kgLoader({
                url: options.baseUrl + 'disambiguate' + '?' + $.param(param),
                type: 0,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData;
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                },
                that: options.that
            });
        };

        Service.prototype.tagging = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param.kgName = options.kgName;
            param.kw = options.kw;
            hieknjs.kgLoader({
                url: options.baseUrl + 'tagging' + '?' + $.param(param),
                type: 0,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData;
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                },
                that: options.that
            });
        };

        Service.prototype.association = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param2.kgName = options.kgName;
            param2.id = options.id;
            param2.allowAtts = options.allowAtts;
            param2.pageSize = options.pageSize || 6;
            hieknjs.kgLoader({
                url: options.baseUrl + 'association' + '?' + $.param(param),
                type: 1,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData;
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
                return '<i style="background: ' + value + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>';
            }
        };

        Service.prototype.legendDraw = function (schema, $self, legendType) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (data, $container) {
                $self.legendFilter = {};
                var nodes = _.filter($self.tgc2.getAvailableData().nodes, function (n) {
                    return !n.hidden;
                });
                var classIds = _.keys(_.groupBy(nodes, 'classId'));
                // var $fabContainer = $('<div class="legend-fab-container"></div>');
                // $container.html($fabContainer);
                if (legendType == 'fab') {
                    var items = [];
                    for (var key in data) {
                        if (_.indexOf(classIds, key) >= 0) {
                            var html = '';
                            var text = typeObj[key];
                            if (text.length > 3) {
                                html = '<div title="' + text + '"><div>' + text.substring(0, 2) + '</div><div class="line-hidden">' + text.substring(2) + '</div></div>';
                            } else {
                                html = '<div class="line-hidden" title="' + text + '">' + text + '</div>';
                            }
                            items.push({
                                html: html,
                                data: {
                                    'key': key,
                                    'value': data[key]
                                },
                                style: {
                                    'background': data[key],
                                    'color': '#fff'
                                },
                                events: {
                                    'click': function (e) {
                                        $self.sdkUtils.legendClick(e, $self);
                                    },
                                    'mouseenter': function (e) {
                                        $self.sdkUtils.legendMouseEnter(e, $self);
                                    },
                                    'mouseleave': function (e) {
                                        $self.sdkUtils.legendMouseLeave(e, $self);
                                    },
                                    'dblclick': function (e) {
                                        $self.sdkUtils.legendDblClick(e, $self);
                                    }
                                }
                            });
                        }
                    }
                    var fab = new hieknjs.fab({
                        container: $container,
                        radius: 80,
                        angle: 90,
                        startAngle: 90,
                        initStatus: $self.layoutStatus,
                        main: {
                            html: '图例',
                            style: {
                                background: $self.primary || '#00b38a',
                                color: '#fff'
                            },
                            events: {
                                'click': function () {
                                    $self.layoutStatus = !$self.layoutStatus;
                                }
                            }
                        },
                        items: items
                    });
                    // fab.run();
                } else {
                    $container.html('');
                    for (var key in data) {
                        if (_.indexOf(classIds, key) >= 0) {
                            var $obj = $('<div class="tgc2-legend-item tgc2-legend-item-' + key + '"></div>').data({
                                'key': key,
                                'value': data[key]
                            });
                            var html = $obj.html('<i style="background: ' + data[key] + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>');
                            $container.append(html);
                        }
                    }
                }
            }
        };

        Service.prototype.legendClick = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            $obj.toggleClass('off');
            var classId = $obj.data('key');
            $self.legendFilter[classId] = $obj.hasClass('off');
            $self.tgc2.netChart.updateFilters();
        };

        Service.prototype.legendDblClick = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            var others = $obj.removeClass('off').siblings();
            others.addClass('off');
            var classId = $obj.data('key');
            $self.legendFilter = {};
            $self.legendFilter[classId] = false;
            for (var i = 0; i < others.length; i++) {
                var id = $(others[i]).data('key');
                $self.legendFilter[id] = true;
            }
            $self.tgc2.netChart.updateFilters();
        };

        Service.prototype.legendMouseEnter = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            $obj.addClass('active').siblings().addClass('inactive');
            $self.nodeSettings.legendClass = $obj.data('key');
            $self.nodeSettings.legendColor = $obj.data('value');
            $self.tgc2.netChart.updateStyle();
            // var nodes = _.filter($self.tgc2.getAvailableData().nodes, function (n) {
            //     return !n.hidden && n.classId == $obj.data('key');
            // });
            // var ids = _.keys(_.groupBy(nodes, 'id'));
            // $self.tgc2.netChart.scrollIntoView(ids);
        };

        Service.prototype.legendMouseLeave = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            $obj.removeClass('active inactive').siblings().removeClass('active inactive');
            $self.nodeSettings.legendClass = null;
            $self.nodeSettings.legendColor = null;
            $self.tgc2.netChart.updateStyle();
        };

        Service.prototype.nodeFilter = function (nodeData, $self) {
            var self = this;
            return $self.tgc2.inStart(nodeData.id) || !$self.legendFilter[nodeData.classId];
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
                if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                    if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                        node.radius = node.radius * 1.5;
                    } else {
                        node.fillColor = options.tgc2.settings.netChart.reduceColor;
                        node.label = '';
                        node.lineColor = node.fillColor;
                        node.radius = node.radius * 0.5;
                    }
                } else {
                    if (options.tgc2.inStart(node.id)) {

                    } else {
                        node.fillColor = node.data.color || '#fff';
                        node.lineColor = '#00b38a';
                        if (node.hovered) {
                            node.fillColor = node.lineColor;
                            node.shadowBlur = 0;
                        }
                    }
                }
                if (options.nodeColors && options.nodeColors[node.data.classId]) {
                    node.lineWidth = 2;
                    if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                        if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                            node.fillColor = options.legendColor || options.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        } else {
                        }
                    } else {
                        if (options.tgc2.inStart(node.id)) {
                            node.fillColor = options.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        } else {
                            node.lineColor = options.nodeColors[node.data.classId];
                            if (!options.imagePrefix && !options.images && !node.data.img) {
                                node.fillColor = node.lineColor;
                            }
                            if (node.hovered) {
                                node.fillColor = node.lineColor;
                            }
                        }
                    }
                }
                if (node.data.img) {
                    if (node.data.img.indexOf('http') != 0 && options.imagePrefix) {
                        node.image = self.qiniuImg(options.imagePrefix + node.data.img);
                    } else {
                        node.image = node.data.img;
                    }
                    if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                        if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                        } else {
                            node.image = '';
                        }
                    } else {
                        if (options.tgc2.inStart(node.id) || node.hovered) {
                        } else {
                            node.image = '';
                        }
                    }
                    // && !$.isEmptyObject(options.tgc2.nodeIds)
                    // if (!options.tgc2.inStart(node.id)
                    //     && !options.tgc2.nodeIds[node.id]
                    //     || (options.legendClass && options.legendClass !== node.data.classId) ) {
                    //     node.image = '';
                    // }
                    node.fillColor = '#fff';
                } else if (options.images && options.images[node.data.classId]) {
                    if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                        if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                            node.image = options.legendColor || options.images[node.data.classId].emphases;
                        } else {
                            node.image = '';
                        }
                    } else {
                        if (options.tgc2.inStart(node.id) || node.hovered) {
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
                if (options.textColors && options.textColors[node.data.classId]) {
                    if (typeof options.textColors[node.data.classId] == 'string') {
                        node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId];
                    } else {
                        if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                            node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId].emphases;
                        } else {
                            if (node.hovered) {
                                node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId].emphases;
                            } else {
                                node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId].normal;
                            }
                        }
                    }
                }
                var len = node.label.length;
                if (node.display == 'roundtext') {
                    var label = node.label;
                    for (var i = 1; i < label.length - 1; i++) {
                        var regChinese = /^[\u4e00-\u9fa5]$/;
                        var regEnglish = /^[a-zA-Z]$/;
                        var char = label.charAt(i);
                        var charNext = label.charAt(i + 1);
                        if ((regChinese.test(char) && regEnglish.test(charNext)) || (regEnglish.test(char) && regChinese.test(charNext))) {
                            label = label.substring(0, i + 1) + ' ' + label.substring(i + 1);
                            i++;
                        }
                    }
                    node.label = label;
                    if (node.label.indexOf(' ') < 0 && len > 5) {
                        if (len > 9) {
                            var perLine = Math.floor(node.label.length / 3);
                            var split2 = len - perLine;
                            node.label = node.label.substring(0, perLine) + ' ' +
                                node.label.substring(perLine, split2) + ' ' +
                                node.label.substring(split2);
                        } else if (len > 5) {
                            node.label = node.label.substring(0, 4) + ' ' + node.label.substring(4);
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

        Service.prototype.linkContentsFunction = function (linkData) {
            var self = this;
            linkData.rInfo = $.extend(true, [], (linkData.nRInfo || []), (linkData.oRInfo || []));
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
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.id = options.tgc2.startInfo.id;
                param2.isRelationMerge = true;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                if (options.tgc2Page) {
                    var page = options.tgc2Page.page;
                    param2.pageNo = page.pageNo;
                    param2.pageSize = page.pageSize;
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'graph' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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
            var param2 = options.data2 || {};
            param2.kgName = options.kgName;
            param2.isTiming = options.isTiming;
            hieknjs.kgLoader({
                url: options.baseUrl + 'graph/init' + '?' + $.param(param),
                type: 1,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
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

        Service.prototype.orderRelation = function (data) {
            var obj = {};
            var from = _.countBy(data, 'from');
            var to = _.countBy(data, 'to');
            for (var f in from) {
                obj[f] = (obj[f] || 0) + (to[f] || 0) + from[f];
            }
            for (var t in to) {
                obj[t] = (obj[t] || 0) + (from[t] || 0) + to[t];
            }
            var arr = [];
            for (var o in obj) {
                arr.push({k: o, v: obj[o]});
            }
            return _.orderBy(arr, 'v', 'desc');
        };

        Service.prototype.timing = function (options, schema) {
            var self = this;
            return function ($self, callback, failed) {
                var param = options.data || {};
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.id = options.tgc2.startInfo.id;
                param2.isRelationMerge = true;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                if (options.tgc2TimeChart) {
                    var settings = options.tgc2TimeChart.getSettings();
                    delete settings.type;
                    $.extend(true, param2, settings);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'graph/timing' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.ids = ids;
                param2.isShortest = true;
                param2.connectsCompute = true;
                param2.statsCompute = true;
                if(options.tgc2Stats){
                    param2.statsConfig = options.tgc2Stats.getStatsConfig();
                }
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'relation' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.start = options.tgc2.startInfo.start.id;
                param2.end = options.tgc2.startInfo.end.id;
                param2.isShortest = true;
                param2.connectsCompute = true;
                param2.statsCompute = true;
                if(options.tgc2Stats){
                    param2.statsConfig = options.tgc2Stats.getStatsConfig();
                }
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'path' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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
                enable: typeof (options.infobox) == 'boolean' ? options.infobox : true,
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
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle : true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: options.nodeColors,
                textColors: options.textColors,
                minRadius: options.minRadius || 10,
                legendClass: null,
                legendColor: null,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = {
                preloadData: options.schema,
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

            if (self.schemaSettings.preloadData) {
                self.init(options, self.schemaSettings.preloadData);
            } else {
                self.sdkUtils.schema(self.schemaSettings, function (schema) {
                    self.init(options, schema);
                });
            }
        };

        Service.prototype.init = function (options, schema) {
            var self = this;
            if (options.autoColor) {
                var colors = {};
                for (var i in schema.types) {
                    colors[schema.types[i].k] = self.sdkUtils.color[i % self.sdkUtils.color.length];
                }
                $.extend(true, colors, self.nodeSettings.nodeColors || {});
                self.nodeSettings.nodeColors = colors;
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
                    data: self.nodeSettings.nodeColors || [],
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
            self.infoboxSettings.enable && self.sdkUtils.gentInfobox(self.infoboxSettings);
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
            if (options.startInfo) {
                self.load(options.startInfo);
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
(function (window, $) {
    'use strict';

    window.HieknInfoboxService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                atts: {visible: [], hidden: []},
                selector: null,
                data: null,
                baseUrl: null,
                kgName: null,
                enableLink: false,
                autoLen: true,
                imagePrefix: null,
                onLoad: $.noop,
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
            var self = this;
            var detail = extra.v || '-';
            if (self.options.autoLen) {
                var max = typeof self.options.autoLen == 'number' ? self.options.autoLen : 80;
                if (extra.v.length > max) {
                    detail = '<span class="hiekn-infobox-info-detail-short">' + extra.v.substring(0, max) + '<a href="javascript:void(0)">查看全部&gt;&gt;</a></span><span class="hiekn-infobox-info-detail-long">' + extra.v + '<a href="javascript:void(0)">收起&lt;&lt;</a></span>';
                }
            }
            return '<tr><td class="hiekn-infobox-info-label">' + extra.k + '</td><td class="hiekn-infobox-info-detail">' + detail + '</td></tr>';
        };

        Service.prototype.load = function (id, callback, onFailed) {
            var self = this;
            var param = self.options.data || {};
            var param2 = self.options.data2 || {};
            param2.kgName = self.options.kgName;
            param2.id = id;
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'infobox' + '?' + $.param(param),
                type: 1,
                params: param2,
                dataFilter: self.options.dataFilter || function (data) {
                    return data;
                },
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
                        self.options.onLoad(data);
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
                if (data.self.img) {
                    var imgUlrl = data.self.img;
                    if (data.self.img.indexOf('http') != 0) {
                        imgUlrl = self.options.imagePrefix + data.self.img + '?_=' + Math.round(new Date() / 3600000);
                    }
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-img"><img src="' + imgUlrl + '" alt=""></div>');
                }
                if (data.self.extra) {
                    var html = '';
                    var visible = self.options.atts.visible || [];
                    var hidden = self.options.atts.hidden || [];
                    for (var i in data.self.extra) {
                        var extra = data.self.extra[i];
                        if (visible.length && _.indexOf(visible, extra.k) >= 0) {
                            html += self.buildExtra(extra);
                        } else if (hidden.length && _.indexOf(hidden, extra.k) < 0) {
                            html += self.buildExtra(extra);
                        } else if (!visible.length && !hidden.length) {
                            html += self.buildExtra(extra);
                        }
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
                                if (visible.length && _.indexOf(visible, att.k) >= 0) {
                                    html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                                } else if (hidden.length && _.indexOf(hidden, att.k) < 0) {
                                    html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                                } else if (!visible.length && !hidden.length) {
                                    html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                                }
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
                enable: typeof (options.infobox) == 'boolean' ? options.infobox : true,
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
                tgc2Page: null,
                tgc2Stats: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle : true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: options.nodeColors,
                textColors: options.textColors,
                minRadius: options.minRadius || 10,
                legendClass: null,
                legendColor: null,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = {
                preloadData: options.schema,
                dataFilter: options.dataFilter,
                that: $(options.selector)[0]
            };
            $.extend(true, self.schemaSettings, self.baseSettings);
            self.initSettings = {
                dataFilter: options.dataFilter,
                that: $(options.selector)[0],
                isTiming: false,
                success: function (data) {
                    if (data.relationList && data.relationList.length) {
                        var arr = self.sdkUtils.orderRelation(data.relationList);
                        var start = arr[2] ? arr[2].k : arr[0].k;
                        var end = arr[1].k;
                        self.load({id: new Date().getTime(), start: {'id': start}, end: {'id': end}});
                    }
                },
                failed: $.noop
            };
            $.extend(true, self.initSettings, self.baseSettings);
            self.tgc2Settings = {};
            self.legendFilter = {};
            self.layoutStatus = options.layoutStatus;

            self.sdkUtils = new window.HieknSDKService();

            if (self.schemaSettings.preloadData) {
                self.init(options, self.schemaSettings.preloadData);
            } else {
                self.sdkUtils.schema(self.schemaSettings, function (schema) {
                    self.init(options, schema);
                });
            }
        };

        Service.prototype.init = function (options, schema) {
            var self = this;
            if (options.autoColor) {
                var colors = {};
                for (var i in schema.types) {
                    colors[schema.types[i].k] = self.sdkUtils.color[i % self.sdkUtils.color.length];
                }
                $.extend(true, colors, self.nodeSettings.nodeColors || {});
                self.nodeSettings.nodeColors = colors;
            }
            var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
            filters = [{
                key: 'distance',
                label: '设定分析步长',
                selected: options.selectedDistance || 3,
                options: [3, 4, 5, 6]
            }].concat(filters);
            var defaultOptions = {
                selector: options.selector,
                filter: {
                    enable: true,
                    filters: filters
                },
                stats: {
                    enable: true,
                    editable: true,
                    atts: schema.atts,
                    types: schema.types,
                    statsConfig: options.statsConfig
                },
                connects: {
                    enable: true,
                    mode: 'click'
                },
                crumb: {
                    enable: true
                },
                find: {
                    enable: true
                },
                legend: {
                    enable: false,
                    data: self.nodeSettings.nodeColors || [],
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
                loader: self.sdkUtils.path(self.loaderSettings, schema),
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
            self.infoboxSettings.enable && self.sdkUtils.gentInfobox(self.infoboxSettings);
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
            self.loaderSettings.tgc2Stats = self.tgc2Stats;
            self.nodeSettings.tgc2 = self.tgc2;
            self.tgc2.init();
            self.isInit = true;
            if (options.startInfo) {
                self.load(options.startInfo);
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
                baseUrl: null,
                kgName: null,
                ready: $.noop,
                group: false,
                replaceSearch: false,
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
                if (self.options.group) {
                    promptSettings.drawPromptItems = sdk.drawPromptItems(schema, self);
                }
                if (self.options.replaceSearch) {
                    promptSettings.beforeSearch = sdk.beforeSearch();
                }
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
                enable: typeof (options.infobox) == 'boolean' ? options.infobox : true,
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
                tgc2Page: null,
                tgc2Stats: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle : true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: options.nodeColors,
                textColors: options.textColors,
                minRadius: options.minRadius || 10,
                legendClass: null,
                legendColor: null,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = {
                preloadData: options.schema,
                dataFilter: options.dataFilter,
                that: $(options.selector)[0]
            };
            $.extend(true, self.schemaSettings, self.baseSettings);
            self.initSettings = {
                dataFilter: options.dataFilter,
                that: $(options.selector)[0],
                isTiming: false,
                success: function (data) {
                    if (data.relationList && data.relationList.length) {
                        var arr = self.sdkUtils.orderRelation(data.relationList);
                        var nodes = [];
                        for (var i in arr) {
                            if (i < 3) {
                                nodes.push({id: arr[i].k});
                            }
                        }
                        self.load({id: new Date().getTime(), nodes: nodes});
                    }
                },
                failed: $.noop
            };
            $.extend(true, self.initSettings, self.baseSettings);
            self.tgc2Settings = {};
            self.legendFilter = {};
            self.layoutStatus = options.layoutStatus;

            self.sdkUtils = new window.HieknSDKService();

            if (self.schemaSettings.preloadData) {
                self.init(options, self.schemaSettings.preloadData);
            } else {
                self.sdkUtils.schema(self.schemaSettings, function (schema) {
                    self.init(options, schema);
                });
            }
        };

        Service.prototype.init = function (options, schema) {
            var self = this;
            if (options.autoColor) {
                var colors = {};
                for (var i in schema.types) {
                    colors[schema.types[i].k] = self.sdkUtils.color[i % self.sdkUtils.color.length];
                }
                $.extend(true, colors, self.nodeSettings.nodeColors || {});
                self.nodeSettings.nodeColors = colors;
            }
            var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
            filters = [{
                key: 'distance',
                label: '设定分析步长',
                selected: options.selectedDistance || 3,
                options: [3, 4, 5, 6]
            }].concat(filters);
            var defaultOptions = {
                selector: options.selector,
                filter: {
                    enable: true,
                    filters: filters
                },
                stats: {
                    enable: true,
                    editable: true,
                    atts: schema.atts,
                    types: schema.types,
                    statsConfig: options.statsConfig
                },
                connects: {
                    enable: true,
                    mode: 'click'
                },
                crumb: {
                    enable: true
                },
                find: {
                    enable: true
                },
                legend: {
                    enable: false,
                    data: self.nodeSettings.nodeColors || [],
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
                loader: self.sdkUtils.relation(self.loaderSettings, schema),
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
            self.infoboxSettings.enable && self.sdkUtils.gentInfobox(self.infoboxSettings);
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
            self.loaderSettings.tgc2Stats = self.tgc2Stats;
            self.nodeSettings.tgc2 = self.tgc2;
            self.tgc2.init();
            self.isInit = true;
            if (options.startInfo) {
                self.load(options.startInfo);
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
                var fields = self.options.config.fieldsKw || self.options.config.fieldsTable || self.options.config.fields;
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
            var param2 = self.options.data2 || {};
            param2.databases = res.databases;
            param2.tables = res.tables;
            param2.fields = res.fields;
            param2.query = JSON.stringify(self.query);
            param2.pageNo = pageNo;
            param2.pageSize = param2.pageSize || 15;
            var $container = instance.getTableContainer();
            $container.empty();
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'search' + '?' + $.param(param),
                type: 1,
                params: param2,
                dataFilter: self.options.dataFilter || function (data) {
                    return data;
                },
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
                case 'radar':
                    self.drawRadarChart();
                    break;
                case 'scatter':
                    self.drawScatterChart();
                    break;
                case 'map':
                    self.drawMapChart();
                    break;
                case 'gauge':
                    self.drawGaugeChart();
                    break;
                case 'heatmap':
                    self.drawHeatmapChart();
                    break;
                case 'solid':
                    self.drawSolidChart();
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

        Service.prototype.drawRadarChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;

            var defaultSeries = {
                name: '',
                type: 'radar',
                data: data,
                symbol: 'none',
                itemStyle: {
                    normal: {
                        color: self.options.chartColor[0]
                    }
                },
                areaStyle: {
                    normal: {
                        opacity: 0.1
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
                backgroundColor: '#fff',
                title: {
                    text: stat.chartSettings.title.text,
                    left: 'center',
                    textStyle: {
                        color: '#eee'
                    }
                },
                legend: {
                    bottom: 5,
                    data: stat.chartSettings.title.text,
                    itemGap: 20,
                    textStyle: {
                        color: '#fff',
                        fontSize: 14
                    },
                    selectedMode: 'single'
                },
                radar: {
                    indicator: [
                        {name: 'AQI', max: 300},
                        {name: 'PM2.5', max: 250},
                        {name: 'PM10', max: 300},
                        {name: 'CO', max: 5},
                        {name: 'NO2', max: 200},
                        {name: 'SO2', max: 100}
                    ],
                    shape: 'circle',
                    splitNumber: 5,
                    name: {
                        textStyle: {
                            color: 'rgb(0, 179, 138)'
                        }
                    },
                    splitArea: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 179, 138, 0.5)'
                        }
                    }
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

        Service.prototype.drawScatterChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;
            var defaultSeries = {
                name: '散点图',
                data: data,
                type: 'scatter',
                symbolSize: function (data) {
                    return Math.sqrt(data[2]) / 5e2;
                },
                label: {
                    emphasis: {
                        show: true,
                        formatter: function (param) {
                            return param.data[3];
                        },
                        position: 'top'
                    }
                },
                itemStyle: {
                    normal: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(120, 36, 50, 0.5)',
                        shadowOffsetY: 5,
                        color: self.options.chartColor[0]
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
                backgroundColor: '#fff',
                title: {
                    text: '散点图'
                },
                legend: {
                    right: 10,
                    data: ['1990']
                },
                xAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                },
                yAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    scale: true
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

        Service.prototype.drawMapChart = function () {

            //地图容器
            var self = this;
            var stat = self.options.config;
            self.chart = echarts.init(self.$container[0]);
            var data = self.stat;
            //34个省、市、自治区的名字拼音映射数组
            var provinces = {
                //23个省
                "台湾": "taiwan",
                "河北": "hebei",
                "山西": "shanxi",
                "辽宁": "liaoning",
                "吉林": "jilin",
                "黑龙江": "heilongjiang",
                "江苏": "jiangsu",
                "浙江": "zhejiang",
                "安徽": "anhui",
                "福建": "fujian",
                "江西": "jiangxi",
                "山东": "shandong",
                "河南": "henan",
                "湖北": "hubei",
                "湖南": "hunan",
                "广东": "guangdong",
                "海南": "hainan",
                "四川": "sichuan",
                "贵州": "guizhou",
                "云南": "yunnan",
                "陕西": "shanxi1",
                "甘肃": "gansu",
                "青海": "qinghai",
                //5个自治区
                "新疆": "xinjiang",
                "广西": "guangxi",
                "内蒙古": "neimenggu",
                "宁夏": "ningxia",
                "西藏": "xizang",
                //4个直辖市
                "北京": "beijing",
                "天津": "tianjin",
                "上海": "shanghai",
                "重庆": "chongqing",
                //2个特别行政区
                "香港": "xianggang",
                "澳门": "aomen"
            };


            //直辖市和特别行政区-只有二级地图，没有三级地图
            var special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
            var mapdata = [];
            //绘制全国地图
            $.getJSON('../json/china.json', function (data) {
                var d = [];
                for (var i = 0; i < data.features.length; i++) {
                    d.push({
                        name: data.features[i].properties.name
                    })
                }
                mapdata = d;
                //注册地图
                echarts.registerMap('china', data);
                //绘制地图
                renderMap('china', d);
            });



            //初始化绘制全国地图配置
            var defaultOption = {
                openClick:false,
                backgroundColor: '#fff',
                title: {
                    text: '地图',
                    left: 'center',
                    textStyle: {
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 'normal',
                        fontFamily: "Microsoft YaHei"
                    },
                    subtextStyle: {
                        color: '#ccc',
                        fontSize: 13,
                        fontWeight: 'normal',
                        fontFamily: "Microsoft YaHei"
                    }
                },
                graphic: {
                    id: 'goback',
                    type: 'circle',
                    shape: { r: 20 },
                    style: {
                        text: '返回',
                        fill: '#eee'
                    },
                    left: 10,
                    top: 10,
                    onclick: function () {
                        renderMap('china', mapdata);
                    }
                },
                tooltip: {
                    trigger: 'item'
                },
                visualMap: {
                    min: 0,
                    max: 2500,
                    left: 'left',
                    top: 'bottom',
                    text: ['高', '低'],           // 文本，默认为数值文本
                    inRange: {
                        color: [self.options.chartColor[2], self.options.chartColor[3]]
                    },
                    calculable: true
                },
                toolbox: {
                    show: true,
                    orient: 'vertical',
                    left: 'right',
                    top: 'center',
                    feature: {
                        dataView: {readOnly: false},
                        restore: {},
                        saveAsImage: {}
                    },
                    iconStyle: {
                        normal: {
                            color: '#fff'
                        }
                    }
                },
                animationDuration: 1000,
                animationEasing: 'cubicOut',
                animationDurationUpdate: 1000

            };
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            console.log(option.openClick);
            if(option.openClick){
                //地图点击事件
                self.chart.on('click', function (params) {
                    console.log(params.name);
                    if (params.name in provinces) {
                        //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
                        $.getJSON('../json/province/' + provinces[params.name] + '.json', function (data) {
                            echarts.registerMap(params.name, data);
                            var d = [];
                            for (var i = 0; i < data.features.length; i++) {
                                d.push({
                                    name: data.features[i].properties.name
                                })
                            }
                            renderMap(params.name, d);
                        });
                    } else if (params.seriesName in provinces) {
                        //如果是【直辖市/特别行政区】只有二级下钻
                        if (special.indexOf(params.seriesName) >= 0) {
                            renderMap('china', mapdata);
                        } else {
                            //显示县级地图
                            $.getJSON('../json/city/' + cityMap[params.name] + '.json', function (data) {
                                echarts.registerMap(params.name, data);
                                var d = [];
                                for (var i = 0; i < data.features.length; i++) {
                                    d.push({
                                        name: data.features[i].properties.name
                                    })
                                }
                                renderMap(params.name, d);
                            });
                        }
                    } else {
                        renderMap('china', mapdata);
                    }
                });
            }

            function renderMap(map, data) {
                option.title.subtext = map;
                option.series = [
                    {
                        name: map,
                        type: 'map',
                        mapType: map,
                        roam: true,
                        nameMap: {
                            'china': '中国'
                        },
                        label: {
                            normal: {
                                show: true,
                                textStyle: {
                                    color: '#999',
                                    fontSize: 13
                                }
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    color: '#fff',
                                    fontSize: 13
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                areaColor: '#eee',
                                borderColor: 'dodgerblue'
                            },
                            emphasis: {
                                areaColor: 'darkorange'
                            }
                        },
                        data: self.stat
                    }
                ];

                //渲染地图
                self.chart.setOption(option);
            }

        }

        Service.prototype.drawGaugeChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;

            var defaultSeries = {
                name: '业务指标',
                type: 'gauge',
                axisLine: {
                    show: true,
                    lineStyle: {
                        width: 30,
                        shadowBlur: 0,
                        color: [[0.25, self.options.chartColor[2]], [0.5, self.options.chartColor[0]], [0.75, self.options.chartColor[1]], [1, self.options.chartColor[3]]]
                    }
                },
                detail: {formatter: '{value}%'},
                data: [{value: 50, name: '完成率'}]
            };

            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
                tooltip: {
                    formatter: "{a} <br/>{b} : {c}%"
                },
                toolbox: {
                    feature: {
                        restore: {},
                        saveAsImage: {}
                    }
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

            setInterval(function () {
                option.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
                self.chart.setOption(option, true);
            }, 2000);
        }

        Service.prototype.drawHeatmapChart = function () {
            var direction = 'horizontal';
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;
            var defaultSeries = {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data

            };
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption ={
                title: {
                    top: 30,
                    left: 'center',
                    text: '热力图'
                },
                graphic: {
                    id: 'left-btn',
                    type: 'circle',
                    shape: { r: 20 },
                    style: {
                        text: '+',
                        fill: '#eee'
                    },
                    left: 10,
                    top: 10,
                    onclick: function () {
                        if(direction=='horizontal'){
                            self.chart.setOption(option={
                                title: {
                                    left: 111,
                                },
                                visualMap: {
                                    orient: 'vertical',
                                    left:65
                                },
                                calendar: {
                                    top: 40,
                                    left: 'center',
                                    bottom: 10,
                                    orient: 'vertical',
                                    cellSize: [13, 'auto'],
                                    yearLabel: {show: false}
                                }
                            })
                            direction='vertical';
                        }else{
                            self.chart.setOption(option={
                                title: {
                                    left: 'center',
                                },
                                visualMap: {
                                    orient: 'horizontal',
                                    left: 'center',
                                    top: 65,
                                },
                                calendar: {
                                    top: 120,
                                    left: 30,
                                    right: 30,
                                    orient: 'horizontal',
                                    cellSize: ['auto', 13],
                                    yearLabel: {show: false}
                                }
                            });
                            direction='horizontal';
                        }
                    }
                },
                tooltip : {},
                visualMap: {
                    min: 0,
                    max: 10000,
                    type: 'piecewise',
                    orient: 'horizontal',
                    left: 'center',
                    top: 65,
                    textStyle: {
                        color: '#000'
                    }
                },
                calendar: {
                    top: 120,
                    left: 30,
                    right: 30,
                    cellSize: ['auto', 13],
                    range: '2016',
                    itemStyle: {
                        normal: {borderWidth: 0.5}
                    },
                    yearLabel: {show: false}
                }
            }
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);

        }

        Service.prototype.drawSolidChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;
            var defaultSeries ={
                name: 'solid',
                type: 'graph',
                layout: 'force',

                force: {
                    repulsion: [100,500],
                    edgeLength:[50,200],
                    gravity:0.1
                },
                tooltip:{
                    formatter:function(params){
                        var sub2="",sub1="";
                        if(!!params.data.subtext1){
                            sub1=params.data.subtext1+'<br />'
                        }
                        if(!!params.data.subtext2){
                            sub2=params.data.subtext2
                        }
                        if(sub1||sub2){
                            return sub1+sub2;
                        }
                    }
                },
                data: data.nodes,
                links: data.links,
                lineStyle: {
                    normal: {
                        color: 'source',
                        curveness: 0,
                        type: "solid"
                    }
                },
                label: {
                    normal: {

                        show: true,
                        position: 'top',
                        formatter:function(params){
                            return params.data.subtext2
                        }

                    }
                }
            }
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption ={
                backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [{
                    offset: 0,
                    color: '#fff'
                }, {
                    offset: 1,
                    color: '#fff'
                }]),
                title: {
                    text: "solid",
                    top: "top",
                    left: "center"
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: [{
                    formatter: function(name) {
                        return echarts.format.truncateText(name, 40, '14px Microsoft Yahei', '…');
                    },
                    tooltip: {
                        show: true
                    },
                    selectedMode: 'false',
                    bottom: 20
                }],
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {
                            show: true,
                            readOnly: true
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    }
                },
                animationDuration: 1000,
                animationEasingUpdate: 'quinticInOut'
            }
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);
        }

        Service.prototype.load = function () {
            var self = this;
            var param = self.options.data || {};
            var param2 = self.options.data2 || {};
            param2 = $.extend(true, param2, self.options.config.querySettings);
            if (self.options.beforeLoad) {
                param2 = self.options.beforeLoad(param2);
            }
            var $container = self.$container;
            $container.empty();
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'stat/data' + '?' + $.param(param),
                type: 1,
                params: param2,
                success: function (data, textStatus, jqXHR, params) {
                    if (data) {
                        // self.stat = data.rsData[0];
                        // self.stat = radarData;
                        // self.stat = scatterData
                        self.stat = mapData;
                        // self.stat = heatmap;
                        // self.stat = solidData;
                        self.drawChart();
                    }
                },
                that: $container[0]
            });
        };

        return Service;
    }

    var radarData = [
        [55, 9, 56, 0.46, 18, 6, 1]
    ];

    var scatterData = [[28604, 77, 17096869, 'Australia', 1990], [31163, 77.4, 27662440, 'Canada', 1990], [1516, 68, 1154605773, 'China', 1990], [13670, 74.7, 10582082, 'Cuba', 1990], [28599, 75, 4986705, 'Finland', 1990], [29476, 77.1, 56943299, 'France', 1990], [31476, 75.4, 78958237, 'Germany', 1990], [28666, 78.1, 254830, 'Iceland', 1990], [1777, 57.7, 870601776, 'India', 1990], [29550, 79.1, 122249285, 'Japan', 1990], [2076, 67.9, 20194354, 'North Korea', 1990], [12087, 72, 42972254, 'South Korea', 1990], [24021, 75.4, 3397534, 'New Zealand', 1990], [43296, 76.8, 4240375, 'Norway', 1990], [10088, 70.8, 38195258, 'Poland', 1990], [19349, 69.6, 147568552, 'Russia', 1990], [10670, 67.3, 53994605, 'Turkey', 1990], [26424, 75.7, 57110117, 'United Kingdom', 1990], [37062, 75.4, 252847810, 'United States', 1990]]


    var mapData = [
        {name: '北京', value: Math.round(Math.random() * 2000)},
        {name: '天津', value: Math.round(Math.random() * 2000)},
        {name: '上海', value: Math.round(Math.random() * 2000)},
        {name: '重庆', value: Math.round(Math.random() * 2000)},
        {name: '河北', value: Math.round(Math.random() * 2000)},
        {name: '河南', value: Math.round(Math.random() * 2000)},
        {name: '云南', value: Math.round(Math.random() * 2000)},
        {name: '辽宁', value: Math.round(Math.random() * 2000)},
        {name: '黑龙江', value: Math.round(Math.random() * 2000)},
        {name: '湖南', value: Math.round(Math.random() * 2000)},
        {name: '安徽', value: Math.round(Math.random() * 2000)},
        {name: '山东', value: Math.round(Math.random() * 2000)},
        {name: '新疆', value: Math.round(Math.random() * 2000)},
        {name: '江苏', value: Math.round(Math.random() * 2000)},
        {name: '浙江', value: Math.round(Math.random() * 2000)},
        {name: '江西', value: Math.round(Math.random() * 2000)},
        {name: '湖北', value: Math.round(Math.random() * 2000)},
        {name: '广西', value: Math.round(Math.random() * 2000)},
        {name: '甘肃', value: Math.round(Math.random() * 2000)},
        {name: '山西', value: Math.round(Math.random() * 2000)},
        {name: '内蒙古', value: Math.round(Math.random() * 2000)},
        {name: '陕西', value: Math.round(Math.random() * 2000)},
        {name: '吉林', value: Math.round(Math.random() * 2000)},
        {name: '福建', value: Math.round(Math.random() * 2000)},
        {name: '贵州', value: Math.round(Math.random() * 2000)},
        {name: '广东', value: Math.round(Math.random() * 2000)},
        {name: '青海', value: Math.round(Math.random() * 2000)},
        {name: '西藏', value: Math.round(Math.random() * 2000)},
        {name: '四川', value: Math.round(Math.random() * 2000)},
        {name: '宁夏', value: Math.round(Math.random() * 2000)},
        {name: '海南', value: Math.round(Math.random() * 2000)},
        {name: '台湾', value: Math.round(Math.random() * 2000)},
        {name: '香港', value: Math.round(Math.random() * 2000)},
        {name: '澳门', value: Math.round(Math.random() * 2000)},
        {name: '重庆市', value: Math.round(Math.random() * 1000)},
        {name: '北京市', value: Math.round(Math.random() * 1000)},
        {name: '天津市', value: Math.round(Math.random() * 1000)},
        {name: '上海市', value: Math.round(Math.random() * 1000)},
        {name: '香港', value: Math.round(Math.random() * 1000)},
        {name: '澳门', value: Math.round(Math.random() * 1000)},
        {name: '巴音郭楞蒙古自治州', value: Math.round(Math.random() * 1000)},
        {name: '和田地区', value: Math.round(Math.random() * 1000)},
        {name: '哈密地区', value: Math.round(Math.random() * 1000)},
        {name: '阿克苏地区', value: Math.round(Math.random() * 1000)},
        {name: '阿勒泰地区', value: Math.round(Math.random() * 1000)},
        {name: '喀什地区', value: Math.round(Math.random() * 1000)},
        {name: '塔城地区', value: Math.round(Math.random() * 1000)},
        {name: '昌吉回族自治州', value: Math.round(Math.random() * 1000)},
        {name: '克孜勒苏柯尔克孜自治州', value: Math.round(Math.random() * 1000)},
        {name: '吐鲁番地区', value: Math.round(Math.random() * 1000)},
        {name: '伊犁哈萨克自治州', value: Math.round(Math.random() * 1000)},
        {name: '博尔塔拉蒙古自治州', value: Math.round(Math.random() * 1000)},
        {name: '乌鲁木齐市', value: Math.round(Math.random() * 1000)},
        {name: '克拉玛依市', value: Math.round(Math.random() * 1000)},
        {name: '阿拉尔市', value: Math.round(Math.random() * 1000)},
        {name: '图木舒克市', value: Math.round(Math.random() * 1000)},
        {name: '五家渠市', value: Math.round(Math.random() * 1000)},
        {name: '石河子市', value: Math.round(Math.random() * 1000)},
        {name: '那曲地区', value: Math.round(Math.random() * 1000)},
        {name: '阿里地区', value: Math.round(Math.random() * 1000)},
        {name: '日喀则地区', value: Math.round(Math.random() * 1000)},
        {name: '林芝地区', value: Math.round(Math.random() * 1000)},
        {name: '昌都地区', value: Math.round(Math.random() * 1000)},
        {name: '山南地区', value: Math.round(Math.random() * 1000)},
        {name: '拉萨市', value: Math.round(Math.random() * 1000)},
        {name: '呼伦贝尔市', value: Math.round(Math.random() * 1000)},
        {name: '阿拉善盟', value: Math.round(Math.random() * 1000)},
        {name: '锡林郭勒盟', value: Math.round(Math.random() * 1000)},
        {name: '鄂尔多斯市', value: Math.round(Math.random() * 1000)},
        {name: '赤峰市', value: Math.round(Math.random() * 1000)},
        {name: '巴彦淖尔市', value: Math.round(Math.random() * 1000)},
        {name: '通辽市', value: Math.round(Math.random() * 1000)},
        {name: '乌兰察布市', value: Math.round(Math.random() * 1000)},
        {name: '兴安盟', value: Math.round(Math.random() * 1000)},
        {name: '包头市', value: Math.round(Math.random() * 1000)},
        {name: '呼和浩特市', value: Math.round(Math.random() * 1000)},
        {name: '乌海市', value: Math.round(Math.random() * 1000)},
        {name: '海西蒙古族藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '玉树藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '果洛藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '海南藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '海北藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '黄南藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '海东地区', value: Math.round(Math.random() * 1000)},
        {name: '西宁市', value: Math.round(Math.random() * 1000)},
        {name: '甘孜藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '阿坝藏族羌族自治州', value: Math.round(Math.random() * 1000)},
        {name: '凉山彝族自治州', value: Math.round(Math.random() * 1000)},
        {name: '绵阳市', value: Math.round(Math.random() * 1000)},
        {name: '达州市', value: Math.round(Math.random() * 1000)},
        {name: '广元市', value: Math.round(Math.random() * 1000)},
        {name: '雅安市', value: Math.round(Math.random() * 1000)},
        {name: '宜宾市', value: Math.round(Math.random() * 1000)},
        {name: '乐山市', value: Math.round(Math.random() * 1000)},
        {name: '南充市', value: Math.round(Math.random() * 1000)},
        {name: '巴中市', value: Math.round(Math.random() * 1000)},
        {name: '泸州市', value: Math.round(Math.random() * 1000)},
        {name: '成都市', value: Math.round(Math.random() * 1000)},
        {name: '资阳市', value: Math.round(Math.random() * 1000)},
        {name: '攀枝花市', value: Math.round(Math.random() * 1000)},
        {name: '眉山市', value: Math.round(Math.random() * 1000)},
        {name: '广安市', value: Math.round(Math.random() * 1000)},
        {name: '德阳市', value: Math.round(Math.random() * 1000)},
        {name: '内江市', value: Math.round(Math.random() * 1000)},
        {name: '遂宁市', value: Math.round(Math.random() * 1000)},
        {name: '自贡市', value: Math.round(Math.random() * 1000)},
        {name: '黑河市', value: Math.round(Math.random() * 1000)},
        {name: '大兴安岭地区', value: Math.round(Math.random() * 1000)},
        {name: '哈尔滨市', value: Math.round(Math.random() * 1000)},
        {name: '齐齐哈尔市', value: Math.round(Math.random() * 1000)},
        {name: '牡丹江市', value: Math.round(Math.random() * 1000)},
        {name: '绥化市', value: Math.round(Math.random() * 1000)},
        {name: '伊春市', value: Math.round(Math.random() * 1000)},
        {name: '佳木斯市', value: Math.round(Math.random() * 1000)},
        {name: '鸡西市', value: Math.round(Math.random() * 1000)},
        {name: '双鸭山市', value: Math.round(Math.random() * 1000)},
        {name: '大庆市', value: Math.round(Math.random() * 1000)},
        {name: '鹤岗市', value: Math.round(Math.random() * 1000)},
        {name: '七台河市', value: Math.round(Math.random() * 1000)},
        {name: '酒泉市', value: Math.round(Math.random() * 1000)},
        {name: '张掖市', value: Math.round(Math.random() * 1000)},
        {name: '甘南藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '武威市', value: Math.round(Math.random() * 1000)},
        {name: '陇南市', value: Math.round(Math.random() * 1000)},
        {name: '庆阳市', value: Math.round(Math.random() * 1000)},
        {name: '白银市', value: Math.round(Math.random() * 1000)},
        {name: '定西市', value: Math.round(Math.random() * 1000)},
        {name: '天水市', value: Math.round(Math.random() * 1000)},
        {name: '兰州市', value: Math.round(Math.random() * 1000)},
        {name: '平凉市', value: Math.round(Math.random() * 1000)},
        {name: '临夏回族自治州', value: Math.round(Math.random() * 1000)},
        {name: '金昌市', value: Math.round(Math.random() * 1000)},
        {name: '嘉峪关市', value: Math.round(Math.random() * 1000)},
        {name: '普洱市', value: Math.round(Math.random() * 1000)},
        {name: '红河哈尼族彝族自治州', value: Math.round(Math.random() * 1000)},
        {name: '文山壮族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '曲靖市', value: Math.round(Math.random() * 1000)},
        {name: '楚雄彝族自治州', value: Math.round(Math.random() * 1000)},
        {name: '大理白族自治州', value: Math.round(Math.random() * 1000)},
        {name: '临沧市', value: Math.round(Math.random() * 1000)},
        {name: '迪庆藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '昭通市', value: Math.round(Math.random() * 1000)},
        {name: '昆明市', value: Math.round(Math.random() * 1000)},
        {name: '丽江市', value: Math.round(Math.random() * 1000)},
        {name: '西双版纳傣族自治州', value: Math.round(Math.random() * 1000)},
        {name: '保山市', value: Math.round(Math.random() * 1000)},
        {name: '玉溪市', value: Math.round(Math.random() * 1000)},
        {name: '怒江傈僳族自治州', value: Math.round(Math.random() * 1000)},
        {name: '德宏傣族景颇族自治州', value: Math.round(Math.random() * 1000)},
        {name: '百色市', value: Math.round(Math.random() * 1000)},
        {name: '河池市', value: Math.round(Math.random() * 1000)},
        {name: '桂林市', value: Math.round(Math.random() * 1000)},
        {name: '南宁市', value: Math.round(Math.random() * 1000)},
        {name: '柳州市', value: Math.round(Math.random() * 1000)},
        {name: '崇左市', value: Math.round(Math.random() * 1000)},
        {name: '来宾市', value: Math.round(Math.random() * 1000)},
        {name: '玉林市', value: Math.round(Math.random() * 1000)},
        {name: '梧州市', value: Math.round(Math.random() * 1000)},
        {name: '贺州市', value: Math.round(Math.random() * 1000)},
        {name: '钦州市', value: Math.round(Math.random() * 1000)},
        {name: '贵港市', value: Math.round(Math.random() * 1000)},
        {name: '防城港市', value: Math.round(Math.random() * 1000)},
        {name: '北海市', value: Math.round(Math.random() * 1000)},
        {name: '怀化市', value: Math.round(Math.random() * 1000)},
        {name: '永州市', value: Math.round(Math.random() * 1000)},
        {name: '邵阳市', value: Math.round(Math.random() * 1000)},
        {name: '郴州市', value: Math.round(Math.random() * 1000)},
        {name: '常德市', value: Math.round(Math.random() * 1000)},
        {name: '湘西土家族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '衡阳市', value: Math.round(Math.random() * 1000)},
        {name: '岳阳市', value: Math.round(Math.random() * 1000)},
        {name: '益阳市', value: Math.round(Math.random() * 1000)},
        {name: '长沙市', value: Math.round(Math.random() * 1000)},
        {name: '株洲市', value: Math.round(Math.random() * 1000)},
        {name: '张家界市', value: Math.round(Math.random() * 1000)},
        {name: '娄底市', value: Math.round(Math.random() * 1000)},
        {name: '湘潭市', value: Math.round(Math.random() * 1000)},
        {name: '榆林市', value: Math.round(Math.random() * 1000)},
        {name: '延安市', value: Math.round(Math.random() * 1000)},
        {name: '汉中市', value: Math.round(Math.random() * 1000)},
        {name: '安康市', value: Math.round(Math.random() * 1000)},
        {name: '商洛市', value: Math.round(Math.random() * 1000)},
        {name: '宝鸡市', value: Math.round(Math.random() * 1000)},
        {name: '渭南市', value: Math.round(Math.random() * 1000)},
        {name: '咸阳市', value: Math.round(Math.random() * 1000)},
        {name: '西安市', value: Math.round(Math.random() * 1000)},
        {name: '铜川市', value: Math.round(Math.random() * 1000)},
        {name: '清远市', value: Math.round(Math.random() * 1000)},
        {name: '韶关市', value: Math.round(Math.random() * 1000)},
        {name: '湛江市', value: Math.round(Math.random() * 1000)},
        {name: '梅州市', value: Math.round(Math.random() * 1000)},
        {name: '河源市', value: Math.round(Math.random() * 1000)},
        {name: '肇庆市', value: Math.round(Math.random() * 1000)},
        {name: '惠州市', value: Math.round(Math.random() * 1000)},
        {name: '茂名市', value: Math.round(Math.random() * 1000)},
        {name: '江门市', value: Math.round(Math.random() * 1000)},
        {name: '阳江市', value: Math.round(Math.random() * 1000)},
        {name: '云浮市', value: Math.round(Math.random() * 1000)},
        {name: '广州市', value: Math.round(Math.random() * 1000)},
        {name: '汕尾市', value: Math.round(Math.random() * 1000)},
        {name: '揭阳市', value: Math.round(Math.random() * 1000)},
        {name: '珠海市', value: Math.round(Math.random() * 1000)},
        {name: '佛山市', value: Math.round(Math.random() * 1000)},
        {name: '潮州市', value: Math.round(Math.random() * 1000)},
        {name: '汕头市', value: Math.round(Math.random() * 1000)},
        {name: '深圳市', value: Math.round(Math.random() * 1000)},
        {name: '东莞市', value: Math.round(Math.random() * 1000)},
        {name: '中山市', value: Math.round(Math.random() * 1000)},
        {name: '延边朝鲜族自治州', value: Math.round(Math.random() * 1000)},
        {name: '吉林市', value: Math.round(Math.random() * 1000)},
        {name: '白城市', value: Math.round(Math.random() * 1000)},
        {name: '松原市', value: Math.round(Math.random() * 1000)},
        {name: '长春市', value: Math.round(Math.random() * 1000)},
        {name: '白山市', value: Math.round(Math.random() * 1000)},
        {name: '通化市', value: Math.round(Math.random() * 1000)},
        {name: '四平市', value: Math.round(Math.random() * 1000)},
        {name: '辽源市', value: Math.round(Math.random() * 1000)},
        {name: '承德市', value: Math.round(Math.random() * 1000)},
        {name: '张家口市', value: Math.round(Math.random() * 1000)},
        {name: '保定市', value: Math.round(Math.random() * 1000)},
        {name: '唐山市', value: Math.round(Math.random() * 1000)},
        {name: '沧州市', value: Math.round(Math.random() * 1000)},
        {name: '石家庄市', value: Math.round(Math.random() * 1000)},
        {name: '邢台市', value: Math.round(Math.random() * 1000)},
        {name: '邯郸市', value: Math.round(Math.random() * 1000)},
        {name: '秦皇岛市', value: Math.round(Math.random() * 1000)},
        {name: '衡水市', value: Math.round(Math.random() * 1000)},
        {name: '廊坊市', value: Math.round(Math.random() * 1000)},
        {name: '恩施土家族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '十堰市', value: Math.round(Math.random() * 1000)},
        {name: '宜昌市', value: Math.round(Math.random() * 1000)},
        {name: '襄樊市', value: Math.round(Math.random() * 1000)},
        {name: '黄冈市', value: Math.round(Math.random() * 1000)},
        {name: '荆州市', value: Math.round(Math.random() * 1000)},
        {name: '荆门市', value: Math.round(Math.random() * 1000)},
        {name: '咸宁市', value: Math.round(Math.random() * 1000)},
        {name: '随州市', value: Math.round(Math.random() * 1000)},
        {name: '孝感市', value: Math.round(Math.random() * 1000)},
        {name: '武汉市', value: Math.round(Math.random() * 1000)},
        {name: '黄石市', value: Math.round(Math.random() * 1000)},
        {name: '神农架林区', value: Math.round(Math.random() * 1000)},
        {name: '天门市', value: Math.round(Math.random() * 1000)},
        {name: '仙桃市', value: Math.round(Math.random() * 1000)},
        {name: '潜江市', value: Math.round(Math.random() * 1000)},
        {name: '鄂州市', value: Math.round(Math.random() * 1000)},
        {name: '遵义市', value: Math.round(Math.random() * 1000)},
        {name: '黔东南苗族侗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '毕节地区', value: Math.round(Math.random() * 1000)},
        {name: '黔南布依族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '铜仁地区', value: Math.round(Math.random() * 1000)},
        {name: '黔西南布依族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '六盘水市', value: Math.round(Math.random() * 1000)},
        {name: '安顺市', value: Math.round(Math.random() * 1000)},
        {name: '贵阳市', value: Math.round(Math.random() * 1000)},
        {name: '烟台市', value: Math.round(Math.random() * 1000)},
        {name: '临沂市', value: Math.round(Math.random() * 1000)},
        {name: '潍坊市', value: Math.round(Math.random() * 1000)},
        {name: '青岛市', value: Math.round(Math.random() * 1000)},
        {name: '菏泽市', value: Math.round(Math.random() * 1000)},
        {name: '济宁市', value: Math.round(Math.random() * 1000)},
        {name: '德州市', value: Math.round(Math.random() * 1000)},
        {name: '滨州市', value: Math.round(Math.random() * 1000)},
        {name: '聊城市', value: Math.round(Math.random() * 1000)},
        {name: '东营市', value: Math.round(Math.random() * 1000)},
        {name: '济南市', value: Math.round(Math.random() * 1000)},
        {name: '泰安市', value: Math.round(Math.random() * 1000)},
        {name: '威海市', value: Math.round(Math.random() * 1000)},
        {name: '日照市', value: Math.round(Math.random() * 1000)},
        {name: '淄博市', value: Math.round(Math.random() * 1000)},
        {name: '枣庄市', value: Math.round(Math.random() * 1000)},
        {name: '莱芜市', value: Math.round(Math.random() * 1000)},
        {name: '赣州市', value: Math.round(Math.random() * 1000)},
        {name: '吉安市', value: Math.round(Math.random() * 1000)},
        {name: '上饶市', value: Math.round(Math.random() * 1000)},
        {name: '九江市', value: Math.round(Math.random() * 1000)},
        {name: '抚州市', value: Math.round(Math.random() * 1000)},
        {name: '宜春市', value: Math.round(Math.random() * 1000)},
        {name: '南昌市', value: Math.round(Math.random() * 1000)},
        {name: '景德镇市', value: Math.round(Math.random() * 1000)},
        {name: '萍乡市', value: Math.round(Math.random() * 1000)},
        {name: '鹰潭市', value: Math.round(Math.random() * 1000)},
        {name: '新余市', value: Math.round(Math.random() * 1000)},
        {name: '南阳市', value: Math.round(Math.random() * 1000)},
        {name: '信阳市', value: Math.round(Math.random() * 1000)},
        {name: '洛阳市', value: Math.round(Math.random() * 1000)},
        {name: '驻马店市', value: Math.round(Math.random() * 1000)},
        {name: '周口市', value: Math.round(Math.random() * 1000)},
        {name: '商丘市', value: Math.round(Math.random() * 1000)},
        {name: '三门峡市', value: Math.round(Math.random() * 1000)},
        {name: '新乡市', value: Math.round(Math.random() * 1000)},
        {name: '平顶山市', value: Math.round(Math.random() * 1000)},
        {name: '郑州市', value: Math.round(Math.random() * 1000)},
        {name: '安阳市', value: Math.round(Math.random() * 1000)},
        {name: '开封市', value: Math.round(Math.random() * 1000)},
        {name: '焦作市', value: Math.round(Math.random() * 1000)},
        {name: '许昌市', value: Math.round(Math.random() * 1000)},
        {name: '濮阳市', value: Math.round(Math.random() * 1000)},
        {name: '漯河市', value: Math.round(Math.random() * 1000)},
        {name: '鹤壁市', value: Math.round(Math.random() * 1000)},
        {name: '大连市', value: Math.round(Math.random() * 1000)},
        {name: '朝阳市', value: Math.round(Math.random() * 1000)},
        {name: '丹东市', value: Math.round(Math.random() * 1000)},
        {name: '铁岭市', value: Math.round(Math.random() * 1000)},
        {name: '沈阳市', value: Math.round(Math.random() * 1000)},
        {name: '抚顺市', value: Math.round(Math.random() * 1000)},
        {name: '葫芦岛市', value: Math.round(Math.random() * 1000)},
        {name: '阜新市', value: Math.round(Math.random() * 1000)},
        {name: '锦州市', value: Math.round(Math.random() * 1000)},
        {name: '鞍山市', value: Math.round(Math.random() * 1000)},
        {name: '本溪市', value: Math.round(Math.random() * 1000)},
        {name: '营口市', value: Math.round(Math.random() * 1000)},
        {name: '辽阳市', value: Math.round(Math.random() * 1000)},
        {name: '盘锦市', value: Math.round(Math.random() * 1000)},
        {name: '忻州市', value: Math.round(Math.random() * 1000)},
        {name: '吕梁市', value: Math.round(Math.random() * 1000)},
        {name: '临汾市', value: Math.round(Math.random() * 1000)},
        {name: '晋中市', value: Math.round(Math.random() * 1000)},
        {name: '运城市', value: Math.round(Math.random() * 1000)},
        {name: '大同市', value: Math.round(Math.random() * 1000)},
        {name: '长治市', value: Math.round(Math.random() * 1000)},
        {name: '朔州市', value: Math.round(Math.random() * 1000)},
        {name: '晋城市', value: Math.round(Math.random() * 1000)},
        {name: '太原市', value: Math.round(Math.random() * 1000)},
        {name: '阳泉市', value: Math.round(Math.random() * 1000)},
        {name: '六安市', value: Math.round(Math.random() * 1000)},
        {name: '安庆市', value: Math.round(Math.random() * 1000)},
        {name: '滁州市', value: Math.round(Math.random() * 1000)},
        {name: '宣城市', value: Math.round(Math.random() * 1000)},
        {name: '阜阳市', value: Math.round(Math.random() * 1000)},
        {name: '宿州市', value: Math.round(Math.random() * 1000)},
        {name: '黄山市', value: Math.round(Math.random() * 1000)},
        {name: '巢湖市', value: Math.round(Math.random() * 1000)},
        {name: '亳州市', value: Math.round(Math.random() * 1000)},
        {name: '池州市', value: Math.round(Math.random() * 1000)},
        {name: '合肥市', value: Math.round(Math.random() * 1000)},
        {name: '蚌埠市', value: Math.round(Math.random() * 1000)},
        {name: '芜湖市', value: Math.round(Math.random() * 1000)},
        {name: '繁昌县', value: Math.round(Math.random() * 2000)},
        {name: '淮北市', value: Math.round(Math.random() * 1000)},
        {name: '淮南市', value: Math.round(Math.random() * 1000)},
        {name: '马鞍山市', value: Math.round(Math.random() * 1000)},
        {name: '铜陵市', value: Math.round(Math.random() * 1000)},
        {name: '南平市', value: Math.round(Math.random() * 1000)},
        {name: '三明市', value: Math.round(Math.random() * 1000)},
        {name: '龙岩市', value: Math.round(Math.random() * 1000)},
        {name: '宁德市', value: Math.round(Math.random() * 1000)},
        {name: '福州市', value: Math.round(Math.random() * 1000)},
        {name: '漳州市', value: Math.round(Math.random() * 1000)},
        {name: '泉州市', value: Math.round(Math.random() * 1000)},
        {name: '莆田市', value: Math.round(Math.random() * 1000)},
        {name: '厦门市', value: Math.round(Math.random() * 1000)},
        {name: '丽水市', value: Math.round(Math.random() * 1000)},
        {name: '杭州市', value: Math.round(Math.random() * 1000)},
        {name: '温州市', value: Math.round(Math.random() * 1000)},
        {name: '宁波市', value: Math.round(Math.random() * 1000)},
        {name: '舟山市', value: Math.round(Math.random() * 1000)},
        {name: '台州市', value: Math.round(Math.random() * 1000)},
        {name: '金华市', value: Math.round(Math.random() * 1000)},
        {name: '衢州市', value: Math.round(Math.random() * 1000)},
        {name: '绍兴市', value: Math.round(Math.random() * 1000)},
        {name: '嘉兴市', value: Math.round(Math.random() * 1000)},
        {name: '湖州市', value: Math.round(Math.random() * 1000)},
        {name: '盐城市', value: Math.round(Math.random() * 1000)},
        {name: '徐州市', value: Math.round(Math.random() * 1000)},
        {name: '南通市', value: Math.round(Math.random() * 1000)},
        {name: '淮安市', value: Math.round(Math.random() * 1000)},
        {name: '苏州市', value: Math.round(Math.random() * 1000)},
        {name: '宿迁市', value: Math.round(Math.random() * 1000)},
        {name: '连云港市', value: Math.round(Math.random() * 1000)},
        {name: '扬州市', value: Math.round(Math.random() * 1000)},
        {name: '南京市', value: Math.round(Math.random() * 1000)},
        {name: '泰州市', value: Math.round(Math.random() * 1000)},
        {name: '无锡市', value: Math.round(Math.random() * 1000)},
        {name: '常州市', value: Math.round(Math.random() * 1000)},
        {name: '镇江市', value: Math.round(Math.random() * 1000)},
        {name: '吴忠市', value: Math.round(Math.random() * 1000)},
        {name: '中卫市', value: Math.round(Math.random() * 1000)},
        {name: '固原市', value: Math.round(Math.random() * 1000)},
        {name: '银川市', value: Math.round(Math.random() * 1000)},
        {name: '石嘴山市', value: Math.round(Math.random() * 1000)},
        {name: '儋州市', value: Math.round(Math.random() * 1000)},
        {name: '文昌市', value: Math.round(Math.random() * 1000)},
        {name: '乐东黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '三亚市', value: Math.round(Math.random() * 1000)},
        {name: '琼中黎族苗族自治县', value: Math.round(Math.random() * 1000)},
        {name: '东方市', value: Math.round(Math.random() * 1000)},
        {name: '海口市', value: Math.round(Math.random() * 1000)},
        {name: '万宁市', value: Math.round(Math.random() * 1000)},
        {name: '澄迈县', value: Math.round(Math.random() * 1000)},
        {name: '白沙黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '琼海市', value: Math.round(Math.random() * 1000)},
        {name: '昌江黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '临高县', value: Math.round(Math.random() * 1000)},
        {name: '陵水黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '屯昌县', value: Math.round(Math.random() * 1000)},
        {name: '定安县', value: Math.round(Math.random() * 1000)},
        {name: '保亭黎族苗族自治县', value: Math.round(Math.random() * 1000)},
        {name: '五指山市', value: Math.round(Math.random() * 1000)}
    ];

    var heatmap = [
        [
            "2016-01-01",
            7165
        ],
        [
            "2016-01-02",
            753
        ],
        [
            "2016-01-03",
            5419
        ],
        [
            "2016-01-04",
            1230
        ],
        [
            "2016-01-05",
            4040
        ],
        [
            "2016-01-06",
            5801
        ],
        [
            "2016-01-07",
            1929
        ],
        [
            "2016-01-08",
            6393
        ],
        [
            "2016-01-09",
            6467
        ],
        [
            "2016-01-10",
            4825
        ],
        [
            "2016-01-11",
            7663
        ],
        [
            "2016-01-12",
            2525
        ],
        [
            "2016-01-13",
            1586
        ],
        [
            "2016-01-14",
            3645
        ],
        [
            "2016-01-15",
            7300
        ],
        [
            "2016-01-16",
            3613
        ],
        [
            "2016-01-17",
            907
        ],
        [
            "2016-01-18",
            8878
        ],
        [
            "2016-01-19",
            315
        ],
        [
            "2016-01-20",
            8323
        ],
        [
            "2016-01-21",
            4312
        ],
        [
            "2016-01-22",
            5181
        ],
        [
            "2016-01-23",
            4037
        ],
        [
            "2016-01-24",
            254
        ],
        [
            "2016-01-25",
            3743
        ],
        [
            "2016-01-26",
            5598
        ],
        [
            "2016-01-27",
            5566
        ],
        [
            "2016-01-28",
            4727
        ],
        [
            "2016-01-29",
            7888
        ],
        [
            "2016-01-30",
            7107
        ],
        [
            "2016-01-31",
            2475
        ],
        [
            "2016-02-01",
            9982
        ],
        [
            "2016-02-02",
            2462
        ],
        [
            "2016-02-03",
            9490
        ],
        [
            "2016-02-04",
            6450
        ],
        [
            "2016-02-05",
            3502
        ],
        [
            "2016-02-06",
            9907
        ],
        [
            "2016-02-07",
            9267
        ],
        [
            "2016-02-08",
            887
        ],
        [
            "2016-02-09",
            3886
        ],
        [
            "2016-02-10",
            2772
        ],
        [
            "2016-02-11",
            9255
        ],
        [
            "2016-02-12",
            4778
        ],
        [
            "2016-02-13",
            9590
        ],
        [
            "2016-02-14",
            1762
        ],
        [
            "2016-02-15",
            4037
        ],
        [
            "2016-02-16",
            8241
        ],
        [
            "2016-02-17",
            4576
        ],
        [
            "2016-02-18",
            3588
        ],
        [
            "2016-02-19",
            4176
        ],
        [
            "2016-02-20",
            940
        ],
        [
            "2016-02-21",
            4596
        ],
        [
            "2016-02-22",
            8277
        ],
        [
            "2016-02-23",
            4349
        ],
        [
            "2016-02-24",
            7374
        ],
        [
            "2016-02-25",
            1327
        ],
        [
            "2016-02-26",
            1474
        ],
        [
            "2016-02-27",
            2604
        ],
        [
            "2016-02-28",
            5009
        ],
        [
            "2016-02-29",
            545
        ],
        [
            "2016-03-01",
            1027
        ],
        [
            "2016-03-02",
            9856
        ],
        [
            "2016-03-03",
            9134
        ],
        [
            "2016-03-04",
            7413
        ],
        [
            "2016-03-05",
            779
        ],
        [
            "2016-03-06",
            9312
        ],
        [
            "2016-03-07",
            2969
        ],
        [
            "2016-03-08",
            8281
        ],
        [
            "2016-03-09",
            9725
        ],
        [
            "2016-03-10",
            6446
        ],
        [
            "2016-03-11",
            1587
        ],
        [
            "2016-03-12",
            8191
        ],
        [
            "2016-03-13",
            7800
        ],
        [
            "2016-03-14",
            6753
        ],
        [
            "2016-03-15",
            5407
        ],
        [
            "2016-03-16",
            6817
        ],
        [
            "2016-03-17",
            3055
        ],
        [
            "2016-03-18",
            2291
        ],
        [
            "2016-03-19",
            607
        ],
        [
            "2016-03-20",
            9865
        ],
        [
            "2016-03-21",
            2460
        ],
        [
            "2016-03-22",
            3101
        ],
        [
            "2016-03-23",
            2774
        ],
        [
            "2016-03-24",
            3018
        ],
        [
            "2016-03-25",
            6228
        ],
        [
            "2016-03-26",
            9455
        ],
        [
            "2016-03-27",
            4166
        ],
        [
            "2016-03-28",
            698
        ],
        [
            "2016-03-29",
            3846
        ],
        [
            "2016-03-30",
            8493
        ],
        [
            "2016-03-31",
            2191
        ],
        [
            "2016-04-01",
            1801
        ],
        [
            "2016-04-02",
            7452
        ],
        [
            "2016-04-03",
            4137
        ],
        [
            "2016-04-04",
            7579
        ],
        [
            "2016-04-05",
            132
        ],
        [
            "2016-04-06",
            5070
        ],
        [
            "2016-04-07",
            7516
        ],
        [
            "2016-04-08",
            1209
        ],
        [
            "2016-04-09",
            8816
        ],
        [
            "2016-04-10",
            994
        ],
        [
            "2016-04-11",
            4164
        ],
        [
            "2016-04-12",
            2210
        ],
        [
            "2016-04-13",
            2599
        ],
        [
            "2016-04-14",
            760
        ],
        [
            "2016-04-15",
            4609
        ],
        [
            "2016-04-16",
            6440
        ],
        [
            "2016-04-17",
            6768
        ],
        [
            "2016-04-18",
            8977
        ],
        [
            "2016-04-19",
            6300
        ],
        [
            "2016-04-20",
            1687
        ],
        [
            "2016-04-21",
            5595
        ],
        [
            "2016-04-22",
            9549
        ],
        [
            "2016-04-23",
            6722
        ],
        [
            "2016-04-24",
            9217
        ],
        [
            "2016-04-25",
            7631
        ],
        [
            "2016-04-26",
            8669
        ],
        [
            "2016-04-27",
            5680
        ],
        [
            "2016-04-28",
            5593
        ],
        [
            "2016-04-29",
            1489
        ],
        [
            "2016-04-30",
            8813
        ],
        [
            "2016-05-01",
            5996
        ],
        [
            "2016-05-02",
            5859
        ],
        [
            "2016-05-03",
            1539
        ],
        [
            "2016-05-04",
            8500
        ],
        [
            "2016-05-05",
            7658
        ],
        [
            "2016-05-06",
            5913
        ],
        [
            "2016-05-07",
            5595
        ],
        [
            "2016-05-08",
            4699
        ],
        [
            "2016-05-09",
            8769
        ],
        [
            "2016-05-10",
            5455
        ],
        [
            "2016-05-11",
            4052
        ],
        [
            "2016-05-12",
            1665
        ],
        [
            "2016-05-13",
            1827
        ],
        [
            "2016-05-14",
            7288
        ],
        [
            "2016-05-15",
            1846
        ],
        [
            "2016-05-16",
            2062
        ],
        [
            "2016-05-17",
            1524
        ],
        [
            "2016-05-18",
            6591
        ],
        [
            "2016-05-19",
            9719
        ],
        [
            "2016-05-20",
            7180
        ],
        [
            "2016-05-21",
            6056
        ],
        [
            "2016-05-22",
            7563
        ],
        [
            "2016-05-23",
            7004
        ],
        [
            "2016-05-24",
            6035
        ],
        [
            "2016-05-25",
            7859
        ],
        [
            "2016-05-26",
            5828
        ],
        [
            "2016-05-27",
            2549
        ],
        [
            "2016-05-28",
            8813
        ],
        [
            "2016-05-29",
            6843
        ],
        [
            "2016-05-30",
            819
        ],
        [
            "2016-05-31",
            8091
        ],
        [
            "2016-06-01",
            5243
        ],
        [
            "2016-06-02",
            9546
        ],
        [
            "2016-06-03",
            1454
        ],
        [
            "2016-06-04",
            4590
        ],
        [
            "2016-06-05",
            2884
        ],
        [
            "2016-06-06",
            2009
        ],
        [
            "2016-06-07",
            7719
        ],
        [
            "2016-06-08",
            6076
        ],
        [
            "2016-06-09",
            6
        ],
        [
            "2016-06-10",
            1368
        ],
        [
            "2016-06-11",
            958
        ],
        [
            "2016-06-12",
            2108
        ],
        [
            "2016-06-13",
            5430
        ],
        [
            "2016-06-14",
            9123
        ],
        [
            "2016-06-15",
            7266
        ],
        [
            "2016-06-16",
            6994
        ],
        [
            "2016-06-17",
            7553
        ],
        [
            "2016-06-18",
            5503
        ],
        [
            "2016-06-19",
            9790
        ],
        [
            "2016-06-20",
            9171
        ],
        [
            "2016-06-21",
            7193
        ],
        [
            "2016-06-22",
            5600
        ],
        [
            "2016-06-23",
            8233
        ],
        [
            "2016-06-24",
            5986
        ],
        [
            "2016-06-25",
            3578
        ],
        [
            "2016-06-26",
            7847
        ],
        [
            "2016-06-27",
            8776
        ],
        [
            "2016-06-28",
            7683
        ],
        [
            "2016-06-29",
            6312
        ],
        [
            "2016-06-30",
            5302
        ],
        [
            "2016-07-01",
            6466
        ],
        [
            "2016-07-02",
            2130
        ],
        [
            "2016-07-03",
            3003
        ],
        [
            "2016-07-04",
            4805
        ],
        [
            "2016-07-05",
            6523
        ],
        [
            "2016-07-06",
            3200
        ],
        [
            "2016-07-07",
            755
        ],
        [
            "2016-07-08",
            4613
        ],
        [
            "2016-07-09",
            9498
        ],
        [
            "2016-07-10",
            6824
        ],
        [
            "2016-07-11",
            8485
        ],
        [
            "2016-07-12",
            7620
        ],
        [
            "2016-07-13",
            5433
        ],
        [
            "2016-07-14",
            8490
        ],
        [
            "2016-07-15",
            6329
        ],
        [
            "2016-07-16",
            5340
        ],
        [
            "2016-07-17",
            7672
        ],
        [
            "2016-07-18",
            2813
        ],
        [
            "2016-07-19",
            9240
        ],
        [
            "2016-07-20",
            660
        ],
        [
            "2016-07-21",
            5228
        ],
        [
            "2016-07-22",
            6639
        ],
        [
            "2016-07-23",
            2356
        ],
        [
            "2016-07-24",
            9512
        ],
        [
            "2016-07-25",
            3674
        ],
        [
            "2016-07-26",
            1164
        ],
        [
            "2016-07-27",
            8488
        ],
        [
            "2016-07-28",
            2509
        ],
        [
            "2016-07-29",
            8849
        ],
        [
            "2016-07-30",
            5865
        ],
        [
            "2016-07-31",
            444
        ],
        [
            "2016-08-01",
            4935
        ],
        [
            "2016-08-02",
            6397
        ],
        [
            "2016-08-03",
            3045
        ],
        [
            "2016-08-04",
            6820
        ],
        [
            "2016-08-05",
            9629
        ],
        [
            "2016-08-06",
            9688
        ],
        [
            "2016-08-07",
            6926
        ],
        [
            "2016-08-08",
            7024
        ],
        [
            "2016-08-09",
            8102
        ],
        [
            "2016-08-10",
            9111
        ],
        [
            "2016-08-11",
            2920
        ],
        [
            "2016-08-12",
            4023
        ],
        [
            "2016-08-13",
            1161
        ],
        [
            "2016-08-14",
            8790
        ],
        [
            "2016-08-15",
            8739
        ],
        [
            "2016-08-16",
            593
        ],
        [
            "2016-08-17",
            9393
        ],
        [
            "2016-08-18",
            5334
        ],
        [
            "2016-08-19",
            902
        ],
        [
            "2016-08-20",
            878
        ],
        [
            "2016-08-21",
            8620
        ],
        [
            "2016-08-22",
            7869
        ],
        [
            "2016-08-23",
            170
        ],
        [
            "2016-08-24",
            3911
        ],
        [
            "2016-08-25",
            1424
        ],
        [
            "2016-08-26",
            1190
        ],
        [
            "2016-08-27",
            1859
        ],
        [
            "2016-08-28",
            8349
        ],
        [
            "2016-08-29",
            724
        ],
        [
            "2016-08-30",
            3586
        ],
        [
            "2016-08-31",
            9913
        ],
        [
            "2016-09-01",
            372
        ],
        [
            "2016-09-02",
            6500
        ],
        [
            "2016-09-03",
            6284
        ],
        [
            "2016-09-04",
            7333
        ],
        [
            "2016-09-05",
            2166
        ],
        [
            "2016-09-06",
            7016
        ],
        [
            "2016-09-07",
            4958
        ],
        [
            "2016-09-08",
            4716
        ],
        [
            "2016-09-09",
            4644
        ],
        [
            "2016-09-10",
            4594
        ],
        [
            "2016-09-11",
            2107
        ],
        [
            "2016-09-12",
            5665
        ],
        [
            "2016-09-13",
            174
        ],
        [
            "2016-09-14",
            854
        ],
        [
            "2016-09-15",
            107
        ],
        [
            "2016-09-16",
            9854
        ],
        [
            "2016-09-17",
            3792
        ],
        [
            "2016-09-18",
            5297
        ],
        [
            "2016-09-19",
            5219
        ],
        [
            "2016-09-20",
            4407
        ],
        [
            "2016-09-21",
            5945
        ],
        [
            "2016-09-22",
            3075
        ],
        [
            "2016-09-23",
            189
        ],
        [
            "2016-09-24",
            4446
        ],
        [
            "2016-09-25",
            1003
        ],
        [
            "2016-09-26",
            1304
        ],
        [
            "2016-09-27",
            8106
        ],
        [
            "2016-09-28",
            4664
        ],
        [
            "2016-09-29",
            5359
        ],
        [
            "2016-09-30",
            9839
        ],
        [
            "2016-10-01",
            9195
        ],
        [
            "2016-10-02",
            3415
        ],
        [
            "2016-10-03",
            7954
        ],
        [
            "2016-10-04",
            7699
        ],
        [
            "2016-10-05",
            5625
        ],
        [
            "2016-10-06",
            6656
        ],
        [
            "2016-10-07",
            3323
        ],
        [
            "2016-10-08",
            9146
        ],
        [
            "2016-10-09",
            7858
        ],
        [
            "2016-10-10",
            4223
        ],
        [
            "2016-10-11",
            294
        ],
        [
            "2016-10-12",
            8542
        ],
        [
            "2016-10-13",
            9094
        ],
        [
            "2016-10-14",
            493
        ],
        [
            "2016-10-15",
            8424
        ],
        [
            "2016-10-16",
            5608
        ],
        [
            "2016-10-17",
            6049
        ],
        [
            "2016-10-18",
            8845
        ],
        [
            "2016-10-19",
            328
        ],
        [
            "2016-10-20",
            8225
        ],
        [
            "2016-10-21",
            5339
        ],
        [
            "2016-10-22",
            935
        ],
        [
            "2016-10-23",
            1644
        ],
        [
            "2016-10-24",
            1267
        ],
        [
            "2016-10-25",
            5356
        ],
        [
            "2016-10-26",
            8331
        ],
        [
            "2016-10-27",
            8756
        ],
        [
            "2016-10-28",
            6504
        ],
        [
            "2016-10-29",
            4880
        ],
        [
            "2016-10-30",
            3974
        ],
        [
            "2016-10-31",
            5896
        ],
        [
            "2016-11-01",
            6658
        ],
        [
            "2016-11-02",
            6919
        ],
        [
            "2016-11-03",
            1312
        ],
        [
            "2016-11-04",
            7943
        ],
        [
            "2016-11-05",
            9403
        ],
        [
            "2016-11-06",
            7677
        ],
        [
            "2016-11-07",
            7706
        ],
        [
            "2016-11-08",
            6078
        ],
        [
            "2016-11-09",
            201
        ],
        [
            "2016-11-10",
            2471
        ],
        [
            "2016-11-11",
            1997
        ],
        [
            "2016-11-12",
            7274
        ],
        [
            "2016-11-13",
            2339
        ],
        [
            "2016-11-14",
            5917
        ],
        [
            "2016-11-15",
            6966
        ],
        [
            "2016-11-16",
            6619
        ],
        [
            "2016-11-17",
            63
        ],
        [
            "2016-11-18",
            9325
        ],
        [
            "2016-11-19",
            8396
        ],
        [
            "2016-11-20",
            3786
        ],
        [
            "2016-11-21",
            4792
        ],
        [
            "2016-11-22",
            8724
        ],
        [
            "2016-11-23",
            6157
        ],
        [
            "2016-11-24",
            3979
        ],
        [
            "2016-11-25",
            1276
        ],
        [
            "2016-11-26",
            4313
        ],
        [
            "2016-11-27",
            8642
        ],
        [
            "2016-11-28",
            6285
        ],
        [
            "2016-11-29",
            71
        ],
        [
            "2016-11-30",
            7244
        ],
        [
            "2016-12-01",
            6747
        ],
        [
            "2016-12-02",
            9588
        ],
        [
            "2016-12-03",
            5975
        ],
        [
            "2016-12-04",
            9949
        ],
        [
            "2016-12-05",
            769
        ],
        [
            "2016-12-06",
            4748
        ],
        [
            "2016-12-07",
            4864
        ],
        [
            "2016-12-08",
            2209
        ],
        [
            "2016-12-09",
            1366
        ],
        [
            "2016-12-10",
            485
        ],
        [
            "2016-12-11",
            7382
        ],
        [
            "2016-12-12",
            3169
        ],
        [
            "2016-12-13",
            3502
        ],
        [
            "2016-12-14",
            5425
        ],
        [
            "2016-12-15",
            3677
        ],
        [
            "2016-12-16",
            7708
        ],
        [
            "2016-12-17",
            9298
        ],
        [
            "2016-12-18",
            3671
        ],
        [
            "2016-12-19",
            2446
        ],
        [
            "2016-12-20",
            8867
        ],
        [
            "2016-12-21",
            1100
        ],
        [
            "2016-12-22",
            8020
        ],
        [
            "2016-12-23",
            9828
        ],
        [
            "2016-12-24",
            793
        ],
        [
            "2016-12-25",
            3032
        ],
        [
            "2016-12-26",
            5902
        ],
        [
            "2016-12-27",
            2608
        ],
        [
            "2016-12-28",
            6739
        ],
        [
            "2016-12-29",
            2971
        ],
        [
            "2016-12-30",
            263
        ],
        [
            "2016-12-31",
            9944
        ]
    ];

    var solidData = {
        nodes: [{
            "name": "刘备2239",
            "value": 20,
            subtext:'mings',
            subtext2:'mingssss',
            "symbolSize": 40,
            "draggable": "true"
        },{
            "name": "关羽",
            // "x": 0,
            // y: 0,
            "symbolSize": 10,
            "draggable": "true",
            "value":20
        },{
            "name": "曹操",
            // "x": 0,
            // y: 0,
            "symbolSize": 30,
            "draggable": "true",
            "value":20,
            // symbolOffset:['50%','50%']
        },{
            "name": "许褚",
            "value": 100,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "典韦",
            "value": 100,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "玄德",
            "value": 20,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "曹冲",
            "value": 50,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "张辽",
            "value": 50,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "关云",
            "value": 20,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "张飞",
            "value": 20,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "云长",
            "value": 10,
            "symbolSize": 10,
            "draggable": "true"
        }],
        links:[{
            "source": "刘备2239",
            "target": "曹操",
            value:30,
            subtext1:'ming'
        },{
            "source": "刘备2239",
            "target": "张飞",
            value:300
        },{
            "source": "关羽",
            "target": "云长",
            value:300
        },{
            "source": "刘备2239",
            "target": "关云",
            value:300
        },{
            "source": "刘备2239",
            "target": "玄德",
            value:300
        },{
            "source": "刘备2239",
            "target": "关羽",
            value:300
        },{
            "source": "曹操",
            "target": "典韦",
            value:300
        },{
            "source": "曹操",
            "target": "许褚",
            value:300
        },{
            "source": "曹操",
            "target": "曹冲",
            value:300
        },{
            "source": "曹操",
            "target": "张辽",
            value:300
        }]
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
                        str += ',' + self.rendererValue('string', values[idx], undefined, short);
                    } else {
                        str += ',' + self.rendererValue(fieldsRenderer[k].type || fieldsRenderer[k], values[idx], fieldsRenderer[k], short);
                    }
                }
                str = str.substring(1);
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
                enable: typeof (options.infobox) == 'boolean' ? options.infobox : true,
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
                tgc2TimeChart: null
            };
            $.extend(true, self.loaderSettings, self.baseSettings);
            self.nodeSettings = {
                enableAutoUpdateStyle: typeof (options.enableAutoUpdateStyle) == 'boolean' ? options.enableAutoUpdateStyle : true,
                imagePrefix: options.imagePrefix,
                images: options.images,
                nodeColors: options.nodeColors,
                textColors: options.textColors,
                minRadius: options.minRadius || 10,
                legendClass: null,
                legendColor: null,
                tgc2: null
            };
            self.promptSettings = self.baseSettings;
            self.schemaSettings = {
                preloadData: options.schema,
                dataFilter: options.dataFilter,
                that: $(options.selector)[0]
            };
            $.extend(true, self.schemaSettings, self.baseSettings);
            self.initSettings = {
                dataFilter: options.dataFilter,
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

            if (self.schemaSettings.preloadData) {
                self.init(options, self.schemaSettings.preloadData);
            } else {
                self.sdkUtils.schema(self.schemaSettings, function (schema) {
                    self.init(options, schema);
                });
            }
        };

        Service.prototype.init = function (options, schema) {
            var self = this;
            if (options.autoColor) {
                var colors = {};
                for (var i in schema.types) {
                    colors[schema.types[i].k] = self.sdkUtils.color[i % self.sdkUtils.color.length];
                }
                $.extend(true, colors, self.nodeSettings.nodeColors || {});
                self.nodeSettings.nodeColors = colors;
            }
            var filters = self.sdkUtils.buildFilter(schema, self.filterSettings);
            var defaultOptions = {
                selector: options.selector,
                autoResize: true,
                prompt: {
                    enable: true,
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
                    style: {
                        bottom: '60px'
                    },
                    data: self.nodeSettings.nodeColors || [],
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
                    enable: true
                },
                event: {
                    enable: true
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
                loader: self.sdkUtils.timing(self.loaderSettings, schema)
            };
            self.tgc2Settings = $.extend(true, {}, defaultOptions, options.tgc2Settings);
            self.infoboxSettings.enable && self.sdkUtils.gentInfobox(self.infoboxSettings);
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
            if (options.startInfo) {
                self.load(options.startInfo);
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
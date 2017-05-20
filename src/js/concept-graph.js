(function (window, $) {
    'use strict';

    window.HieknConceptGraphService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            self.sdkUtils = new window.HieknSDKService();
            self.defaultPromptSettings = {
                baseUrl: options.baseUrl,
                data: options.data,
                kgName: options.kgName
            };
            self.promptSettings = $.extend(true, {}, self.defaultPromptSettings, options.promptSettings || {});
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
            console.log(self.options);
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
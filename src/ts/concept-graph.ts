type HieknConceptGraphStartInfo = { id: HieknIdType, kgType: number };

interface HieknConceptGraphSetting extends HieknBaseSetting {
    kgName?: string;
    emphasesColor?: string;
    emphasesLightColor?: string;
    instanceEnable?: boolean;
    infoboxSetting?: HieknNetChartInfoboxSetting;
    lightColor?: string;
    primaryColor?: string;
    primaryLightColor?: string;
    promptSettings?: HieknPromptSetting;
    selector?: string;
    startInfo?: HieknConceptGraphStartInfo;
    tgc2Settings?: HieknTgc2Setting;
}

interface HieknConceptGraphDataNode extends Tgc2DataNode {
    kgType?: number;
}
interface HieknConceptGraphDataLink extends Tgc2DataLink {
    attName?: string;
}

class HieknSDKConceptGraph {
    promptSettings: HieknPromptSetting;
    graphInfobox: HieknSDKInfobox;
    options: HieknConceptGraphSetting = {};
    tgc2: Tgc2Graph;
    tgc2Prompt: Tgc2Prompt;
    tgc2Page: Tgc2Page;

    constructor(options: HieknConceptGraphSetting) {
        const defaultPromptSettings = {
            baseUrl: options.baseUrl,
            queryData: options.queryData,
            kgName: options.kgName
        };
        this.promptSettings = $.extend(true, defaultPromptSettings, options.promptSettings);
        const defaultOptions = {
            lightColor: '#fff',
            primaryColor: '#00b38a',
            primaryLightColor: 'rgba(0,179,138,0.3)',
            emphasesColor: '#faa01b',
            emphasesLightColor: 'rgba(250, 160, 27,0.3)',
            instanceEnable: false,
            tgc2Settings: {
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
                            nodeStyleFunction: (node: Tgc2ChartNode) => {
                                this.nodeStyleFunction(node);
                            },
                            nodeHovered: {
                                shadowBlur: 0,
                                shadowColor: 'rgba(0, 0, 0, 0)'
                            },
                            linkStyleFunction: (link: Tgc2ChartLink) => {
                                if (link.hovered) {
                                    link.label = (<HieknConceptGraphDataLink>link.data).attName;
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
                        onPrompt: HieknSDKPrompt.onPromptKnowledge(this.promptSettings)
                    }
                },
                page: {
                    enable: true,
                    style: {
                        right: '15px'
                    },
                    pageSize: 20
                },
                loader: (instance: Tgc2Graph, callback: Function, onFailed: Function) => {
                    this.loader(instance, callback, onFailed);
                }
            }
        };
        this.options = $.extend(true, {}, defaultOptions, options);
        let infobox = this.options.infoboxSetting;
        if (infobox && infobox.enable) {
            this.graphInfobox = this.buildInfobox(infobox);
            this.graphInfobox.initEvent($(this.options.selector));
            this.options.tgc2Settings.netChart.settings.nodeMenu.contentsFunction = (data: any, node: any, callback: Function) => {
                return this.contentsFunction(data, node, callback)
            };
        }
        this.options.tgc2Settings.selector = this.options.tgc2Settings.selector || this.options.selector;
        this.init();
        if (options.startInfo) {
            this.load(options.startInfo);
        }
    }

    private buildInfobox(infoboxOptions: HieknInfoboxSetting) {
        let options = {
            baseUrl: this.options.baseUrl,
            dataFilter: this.options.dataFilter,
            queryData: this.options.queryData,
            formData: this.options.formData,
            kgName: this.options.kgName
        };
        $.extend(true, options, infoboxOptions);
        return new HieknSDKInfobox(options);
    }

    private contentsFunction(data: any, node: any, callback: Function): string {
        if (node.detail) {
            callback(node.detail);
        } else {
            this.graphInfobox.load(data.id, (data: any) => {
                if (data) {
                    data = this.graphInfobox.buildInfobox(data)[0].outerHTML;
                } else {
                    data = '没有知识卡片信息';
                }
                node.detail = data;
                callback(data);
            });
        }
        return null;
    }

    private init() {
        this.tgc2 = new Tgc2Graph(this.options.tgc2Settings);
        this.tgc2Prompt = new Tgc2Prompt(this.tgc2, this.options.tgc2Settings.prompt);
        this.tgc2Page = new Tgc2Page(this.tgc2, this.options.tgc2Settings.page);
        this.tgc2.init();
        $(this.options.tgc2Settings.selector).addClass('tgc2 tgc2-concept-graph');
        if (this.options.instanceEnable) {
            $(this.options.tgc2Settings.selector).append('<div class="tgc2-info-top">' +
                '<ul class="info-top">' +
                '<li class="current"><div class="legend-circle" style="background-color:' + this.options.emphasesColor + '"></div><span>当前节点</span></li>' +
                '<li class="concept"><div class="legend-circle" style="background-color:' + this.options.primaryColor + '"></div><span>概念</span></li>' +
                '<li class="instance"><div class="legend-circle-o" style="border-color:' + this.options.primaryColor + '"></div><span>实例</span></li>' +
                '</ul>' +
                '</div>');
        }
        $(this.options.tgc2Settings.selector).append('<div class="tgc2-info-bottom">' +
            '<div class="info-bottom"><span>中心节点：</span><span name="name" style="color:' + this.options.emphasesColor + '"></span></div>' +
            '</div>');
    }

    load(node: HieknConceptGraphStartInfo) {
        this.tgc2.load(node);
        setTimeout(() => {
            this.tgc2.resize();
        }, 300);
    }

    loader(instance: Tgc2Graph, callback: Function, onFailed: Function) {
        const node = <HieknConceptGraphStartInfo>this.tgc2.startInfo;
        const page = this.tgc2Page.page;
        const queryData = this.options.queryData || {};
        queryData.type = node.kgType || 0;
        queryData.pageNo = page.pageNo;
        queryData.pageSize = page.pageSize;
        queryData.kgName = this.options.kgName;
        queryData.entityId = node.id;
        HieknSDKUtils.ajax({
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'graph/knowlegde', queryData),
            type: 'GET',
            dataFilter: this.options.dataFilter,
            that: $(this.options.tgc2Settings.selector)[0],
            success: (data: any) => {
                data = data[0];
                if (data.entityList && data.entityList.length) {
                    for (const d of data.entityList) {
                        if (d.id == node.id) {
                            $(this.options.tgc2Settings.selector).find('.tgc2-info-bottom').find('[name="name"]').text(d.name);
                        }
                    }
                }
                data.nodes = data.entityList;
                data.links = data.relationList;
                delete data.entityList;
                delete data.relationList;
                callback(data);
                instance.netChart.resetLayout();
            },
            error: () => {
                onFailed && onFailed();
                instance.netChart.replaceData({nodes: [], links: []});
            }
        });
    }

    private nodeStyleFunction(node: Tgc2ChartNode) {
        const data = <HieknConceptGraphDataNode>node.data;
        const centerNode = this.tgc2.startInfo;
        node.label = data.name;
        node.labelStyle.textStyle.font = '18px Microsoft Yahei';
        node.radius = 15;
        node.imageCropping = 'fit';
        const isCenter = (node.id == centerNode.id);
        if (data.kgType == 0) {
            node.lineWidth = 10;
            node.lineColor = this.options.primaryLightColor;
            node.fillColor = this.options.primaryColor;
            node.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjhENzQwNUZFMTVFQjExRTc4QTJDOTY3REE4RkM4MjFCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjhENzQwNUZGMTVFQjExRTc4QTJDOTY3REE4RkM4MjFCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OEQ3NDA1RkMxNUVCMTFFNzhBMkM5NjdEQThGQzgyMUIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OEQ3NDA1RkQxNUVCMTFFNzhBMkM5NjdEQThGQzgyMUIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7rBsIlAAAFUklEQVR42uydX05TURDGp5V3ygq8JJJINIGugLICy4PySF0BdQGGsgLqCixviibCCrisgJLoEybUFUjfNfVM7iESUyi1vXNmzvm+ZCJg0p5753fmzPlfGY1GBKWrCgAAAHgLAAACABAAgAAABAAgAAABAAgAxKDM2Zqzdf8zW83/Pk59Z9fOBt749wv/MwAwIHbuC2cNb9mcPpcByL2deEgAgCLtOGt6k9Cxt0MAELa27zpr+59DiCNB19k7q1HBIgDs7D1nrYCOHwdCz9m+NRCsAcA1vqPI8eNA6PiIAADmKM7a39+TvWsT9x5e+38BwIza87XKotrao4FmADjMf/HdOcviruOW1txAKwDWQr7ZJkEjAOz0U8WJ3iwJ4qY2CLQBEKvz1UKgCYDYna8SAi0ApOL82xDUScEkkwYAat7565SW+j4SXKcOAGf7LUpTPd87SBYAHig5oLT1hooJpeQAyJydJ9Tuq8wHQgLAo3xNgli8tmArJQCaHgDor7Y8CEkAcEXzW64Vi7gJWJb+0mqAB23B+XfmRK0UIgBqv6IoIA1Ag4pBH+hu8eBQHmsT0IJ/db0jyQhQ8+G/Bh9PHBdYJqEhYskI0ITzH1xRGjE2ARIPdeTsubMFjm4l2IL//COByhJdE1B29v/Z2UtBoD86e2W9NyAFAE/1npf8HVwzvwkC8MzZ1xI/f5kE5gekmgCJfv+lcFt9KVBposkBJB5mRRiAFQCg62H2hAF4CwCm69qULU4APzhbdfaoxPe16r9nO4J3JpYE5s42FPW1K/f8n5Zl0mcSXWcpALTtPrEAAI8ELgGAdAGYVE4AAAAAAAAw0gs4I0jlO6viPactAKBXUa0HyOHPqdWPCYAB/Jk2AH34U2elkVwQwm3aIrqBD9KQhOYCJJNA5AEPl9gWsWqMDxWBxCqLZBOQUbEuEE3AZC1RhMvCOanBiOBkid5HID0Q1IV/J6onGgoDbA7lSPAYTcBY/SDhjbPV2Ak3JvEIGSICcP+2HzgK8A6f32P+zmsJfwWs/eskfGxciAhwc6lCSD2d8u8S6lCAMwNDHhIVMhf4ROO3dUms9h2nCwp0UGZIACS2i90n3tvHd/x8d/aEin0F24HKUqdA8yWhD4rskPyGDm3aD9kkajgqlslfS9T5Imv/tQOQeQgWE3P+0DeDg9QBuMkH8oQgGPqaH3ydhKYLI1I6PTTIqaDaAWC1qDg+Pmbx8fA9LYXReGkUQ9CNsDngsN8mZUPhmq+NiyknUNPmWwEgJgjUOl87AERxHC1bJ8Wroi3cHcxt5o5R5x+S8uNxLQAQes5gFokc9RY7AEQ6VhFNK/HVPf8jK5tDBwZrv4kyY3dw4gIAAAACAFAZugYA81NuEIA+AEjsZVoss5VxAGtjAcFW+cYMgKURwTqhCSglpPJiiqHiMg59Gc00WZYiwO1IwAtGNpSVi1f4tq3lKxYBuFFGxXRxpiA3ycnoSWiWAYAAAAQAIAAApdENvC0+ZII3lfKpY6PA9tPZARm9F9liBOAXfUr6Rtq4+7dJRiaBLAPAYwC7SsumfhFoDACUfQn1LBK56St1ALQXuAIAym9rtR4oYWIlsPVeQBdlwziAxkTQXAJoGQBWg4pDJUJ3BwdUbF/LMQ4AAQAIAEAAAAIAYcXZ+MYc++Q8wnfsM30AoFw5lbde0OSET0oASIwPmOzvpwKA1MNUYnlhMW0OlRwQaiACpB0BxO71QwSYTicC33GGJFCvyr6QSsUR7wBgMgQd306vzdHxPA7Qjqn2xwoABAAgAAABAAgAQAAAAgAQAIAAAAQAoH/1R4ABAHF3K+2bw1JCAAAAAElFTkSuQmCC';
            if (isCenter) {
                node.fillColor = this.options.emphasesColor;
                node.lineColor = this.options.emphasesLightColor;
            }
        } else {
            node.lineWidth = 2;
            node.lineColor = this.options.primaryColor;
            node.fillColor = this.options.lightColor;
            node.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA3RUVGNzVBMTVFQzExRTdBM0FERjI5RjczQUM4N0QyIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA3RUVGNzVCMTVFQzExRTdBM0FERjI5RjczQUM4N0QyIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDdFRUY3NTgxNUVDMTFFN0EzQURGMjlGNzNBQzg3RDIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDdFRUY3NTkxNUVDMTFFN0EzQURGMjlGNzNBQzg3RDIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5z4BZ4AAADHUlEQVR42uzbTU4UQRyG8QYMbLyBK1mKiR8L3RsXfnABWeugO7mIrkwEcc0FJGFhOIExaohLogtvIDGQCP47NAkboGeYwuqu35O8mYR0MdNTz1Qq1XknDg4OKpTLBAEI4FsgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACnMTKysq1eHkaeRi52vx5O7IRWY18L3kCBoNBPwWIiZ+Ol1eRF5HJEy7bj7yLLEX+DPkW9f9/HnkSuR653DM3fke2ImuRtyHKXmcEaCZ/PXK/5ZDNZoVoe5NXIh8iNwtZKL5E5kOCX+P+x5OJPvDrISa/5l6zWrT95Zc0+VVzr+vxw5rJXoD4kHPxsjjC0Ho5n2tx3WJhk3/EjXrL0IUVoN7wTY0wbqoZexYLBe8ZF7ogwIPEY28XLMCtLggwm3jsdMECzHRBgPOwV+FCSSHA9jnG/iTJmWcD2QuwcY6xH1tc87lgAba6IMD7yN8RxtVjVltct1awAGvZCzAYDGpLl0cYutzS8Pq6rwVO/rcRv9f/sglcarmcH7HZjGnDbuRxdXg8Wgq18I/ix7XbCQGaBxf1JL2pDh/4nMR+Y/X8kJu7+kz8buRl5FNkp4eTvtPcW32Pd1I8B6i5iMfB9fHus+rwkGe2megfzQqxmmJj0yV6+zh4CEEqAvTrHAAdggAEAAFAABAABAABQAAQAAQAAUAA9JtLqd9AOzhvtIPzRTv4FLSDM98DaAePF+3gY2gHZ74CaAenQzu40g7OXgDt4HRoByN/AbSD054NZC+AdnA6tIMr7eC8BdAOToZ2cIN2cO4CaAePBe3gEtAO1g7u3TkAOgQBCAACgAAgAAgAAoAAIAAIAAKAAOg32sGFox2cL9rBp6AdnPkeQDt4vGgHH0M7OPMVQDs4HdrBlXZw9gJoB6dDOxj5C6AdnPZsIHsBtIPToR1caQfnLYB2cDK0gxu0g3MXQDt4LGgHl0Dx7WBUBAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABMCT/BBgA8SDQyY7AsYEAAAAASUVORK5CYII=';
            if (isCenter) {
                node.fillColor = this.options.lightColor;
                node.lineColor = this.options.emphasesColor;
            }
        }
        if (node.hovered) {
            node.radius = node.radius * 1.25;
        }
    }
}
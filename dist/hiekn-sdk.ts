type HieknTypeNE = { normal: string, emphases: string };
type HieknTypeUnionStringNE = string | HieknTypeNE;
type HieknTypeUnionMap = { [key: string]: HieknTypeUnionStringNE };
type HieknTypeStartInfo = Tgc2StartInfo | Tgc2PathStartInfo | Tgc2RelationStartInfo;

interface HieknNetChartFilterSetting {
    selectedAtts?: number[];
    selectedTypes?: number[];
}

interface HieknNetChartLoaderSetting extends HieknBaseSetting {
    enable?: boolean;
    selector?: string;
}

interface HieknNetChartNodeSetting {
    autoUpdateStyle?: boolean;
    imagePrefix?: string;
    images?: HieknTypeUnionMap;
    legendClass?: number;
    legendColor?: string;
    minRadius?: number;
    nodeColors?: HieknTypeUnionMap;
    textColors?: HieknTypeUnionMap;
}

interface HieknNetChartDataNode extends Tgc2DataNode {
    classId?: number;
    img?: string;
}

interface HieknNetChartInitSetting extends HieknBaseSetting {
    failed?: Function;
    success?: Function;
    that?: HTMLElement;
}

interface HieknNetChartInfoboxSetting extends HieknInfoboxSetting {
    enable?: boolean;
}

interface HieknTgc2Setting extends Tgc2Setting, Tgc2PathSetting, Tgc2RelationSetting {
    filter: Tgc2FilterSettings;
    prompt: Tgc2PromptSetting;
    page: Tgc2PageSetting;
    crumb: Tgc2CrumbSettings;
    find: Tgc2FindSettings;
    legend: Tgc2LegendSettings;
    timeChart: Tgc2TimeChartSettings;
    event: Tgc2EventSettings;
    stats: Tgc2StatsSettings;
    connects: Tgc2ConncetsSetting;
}

interface HieknNetChartSetting {
    kgName?: string;
    autoColor?: boolean;
    autoUpdateStyle?: boolean;
    baseUrl?: string;
    dataFilter?: JQueryAjaxDataFilter;
    display?: string;
    formData?: any;
    imagePrefix?: string;
    images?: HieknTypeUnionMap;
    infoboxSetting?: HieknNetChartInfoboxSetting;
    layoutStatus?: boolean;
    legendType?: string;
    minRadius?: number;
    nodeColors?: HieknTypeUnionMap;
    queryData?: any;
    schema?: HieknSchema;
    schemaSetting?: HieknSchemaSetting;
    selectedAtts?: number[];
    selectedDistance?: number;
    selectedTypes?: number[];
    selector?: string;
    startInfo?: HieknTypeStartInfo;
    textColors?: HieknTypeUnionMap;
    tgc2Settings?: HieknTgc2Setting;
    statsConfig?: any[];
}

abstract class HieknSDKNetChart {
    isInit = false;
    isTiming = false;
    options: HieknNetChartSetting = {};

    baseSettings: HieknBaseSetting = {};
    promptSettings: HieknPromptSetting = {};
    filterSettings: HieknNetChartFilterSetting = {};
    infoboxSettings: HieknNetChartInfoboxSetting = {};
    loaderSettings: HieknNetChartLoaderSetting = {};
    nodeSettings: HieknNetChartNodeSetting = {};
    schemaSettings: HieknSchemaSetting = {};
    initSettings: HieknNetChartInitSetting = {};
    defaultTgc2Options: any = {};
    tgc2Settings: HieknTgc2Setting;

    tgc2: Tgc2;
    tgc2Filter: Tgc2Filter;
    tgc2Crumb: Tgc2Crumb;
    tgc2Find: Tgc2Find;
    tgc2Legend: Tgc2Legend;

    infoboxService: HieknSDKInfobox;
    legendFilter: { [key: number]: boolean };
    layoutStatus: boolean;
    centerNode: ItemsChartNode;
    centerNodeRadius: number;
    defaultColor: string = '#00b38a';

    constructor(options: HieknNetChartSetting) {
        this.options = options;
        this.beforeInit(options);
    }

    load(startInfo: HieknTypeStartInfo) {
        setTimeout(() => {
            if (this.isInit) {
                if (!startInfo) {
                    this.graphInit(this.initSettings);
                } else {
                    this.tgc2.load(startInfo);
                }
            } else {
                this.load(startInfo);
            }
        }, 30);
    }

    protected beforeInit(options: HieknNetChartSetting) {
        this.isInit = false;
        this.baseSettings = {
            baseUrl: options.baseUrl,
            dataFilter: options.dataFilter,
            formData: options.formData || {},
            queryData: options.queryData || {}
        };
        this.filterSettings = {
            selectedAtts: options.selectedAtts,
            selectedTypes: options.selectedTypes
        };
        this.infoboxSettings = {
            enable: true,
            selector: options.selector,
            imagePrefix: options.imagePrefix,
            kgName: options.kgName
        };
        $.extend(true, this.infoboxSettings, this.baseSettings, options.infoboxSetting);
        this.loaderSettings = {
            selector: options.selector,
            formData: {kgName: options.kgName}
        };
        $.extend(true, this.loaderSettings, this.baseSettings);
        this.nodeSettings = {
            autoUpdateStyle: typeof (options.autoUpdateStyle) == 'boolean' ? options.autoUpdateStyle : true,
            imagePrefix: options.imagePrefix,
            images: options.images,
            nodeColors: options.nodeColors,
            textColors: options.textColors,
            minRadius: options.minRadius || 10,
            legendClass: null,
            legendColor: null
        };
        this.promptSettings = {
            kgName: options.kgName
        };
        $.extend(true, this.promptSettings, this.baseSettings);
        this.initSettings = {
            formData: {kgName: options.kgName},
            that: $(options.selector)[0]
        };
        $.extend(true, this.initSettings, this.baseSettings);

        this.legendFilter = {};
        this.layoutStatus = options.layoutStatus;

        if (options.schema) {
            this.init(options, options.schema);
        } else {
            this.schemaSettings = {
                kgName: options.kgName,
                that: $(options.selector)[0]
            };
            $.extend(true, this.schemaSettings, this.baseSettings, options.schemaSetting);
            this.schemaSettings.success = (schema: HieknSchema) => {
                this.init(options, schema);
            };
            HieknSDKSchema.load(this.schemaSettings);
        }
    }

    protected graphInit(options: HieknNetChartInitSetting) {
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        formData.isTiming = this.isTiming;
        HieknSDKUtils.ajax({
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'graph/init', queryData),
            type: 'POST',
            data: formData,
            dataFilter: options.dataFilter,
            success: (data: any) => {
                options.success(data[0]);
            }
        });
    }

    protected gentInfobox(options: HieknNetChartInfoboxSetting) {
        options.formData.isRelationAtts = typeof (options.formData.isRelationAtts) == 'boolean' ? options.formData.isRelationAtts : true;
        this.infoboxService = new HieknSDKInfobox(options);
        this.infoboxService.initEvent($(options.selector));
    }

    protected infobox(data: any, node: any, callback: Function): string {
        if (node.detail) {
            callback(node.detail);
        } else {
            this.infoboxService.load(data.id, (data: any) => {
                data = this.infoboxService.buildInfobox(data)[0].outerHTML;
                node.detail = data;
                callback(data);
            });
        }
        return null;
    }

    protected init(options: HieknNetChartSetting, schema: HieknSchema) {
        if (options.autoColor) {
            let colors: HieknTypeUnionMap = {};
            for (const i in schema.types) {
                colors[schema.types[i].k] = HieknSDKUtils.color[parseInt(i) % HieknSDKUtils.color.length];
            }
            $.extend(true, colors, this.nodeSettings.nodeColors || {});
            this.nodeSettings.nodeColors = colors;
        }
        this.defaultTgc2Options = {
            selector: options.selector,
            filter: {
                enable: true,
                filters: HieknSDKNetChart.buildFilter(schema, this.filterSettings)
            },
            crumb: {
                enable: true
            },
            find: {
                enable: true
            },
            legend: {
                enable: true,
                data: this.nodeSettings.nodeColors || {},
                legendDraw: this.legendDraw(schema, options.legendType),
                onClick: (e: MouseEvent) => {
                    this.legendClick(e);
                },
                onDblClick: (e: MouseEvent) => {
                    this.legendDblClick(e);
                },
                onMouseEnter: (e: MouseEvent) => {
                    this.legendMouseEnter(e);
                },
                onMouseLeave: (e: MouseEvent) => {
                    this.legendMouseLeave(e);
                }
            },
            netChart: {
                settings: {
                    filters: {
                        nodeFilter: (nodeData: HieknNetChartDataNode) => {
                            return this.nodeFilter(nodeData);
                        }
                    },
                    nodeMenu: {
                        contentsFunction: (data: any, node: any, callback: Function) => {
                            return this.infobox(data, node, callback);
                        }
                    },
                    style: {
                        node: {
                            display: options.display || 'circle'
                        },
                        nodeStyleFunction: this.nodeStyleFunction(this.nodeSettings)
                    },
                    info: {
                        linkContentsFunction: HieknSDKNetChart.linkContentsFunction
                    }
                }
            },
            loader: this.loader(this.loaderSettings, schema)
        };
        this.buildPrivateSetting(schema);
        this.tgc2Filter = new Tgc2Filter(this.tgc2, this.tgc2Settings.filter);
        this.tgc2Crumb = new Tgc2Crumb(this.tgc2, this.tgc2Settings.crumb);
        this.tgc2Find = new Tgc2Find(this.tgc2, this.tgc2Settings.find);
        this.tgc2Legend = new Tgc2Legend(this.tgc2, this.tgc2Settings.legend);
        this.infoboxSettings.enable && this.gentInfobox(this.infoboxSettings);
        this.tgc2.init();
        this.isInit = true;
        if (options.startInfo) {
            this.load(options.startInfo);
        }
    }

    protected legend(schema: HieknSchema) {
        let typeObj = {};
        for (const type of schema.types) {
            typeObj[type.k] = type.v;
        }
        return (key: string, value: string) => {
            return '<i style="background: ' + value + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>';
        }
    }

    protected legendClick(e: MouseEvent) {
        const $obj = $(e.currentTarget);
        $obj.toggleClass('off');
        this.legendFilter[$obj.data('key')] = $obj.hasClass('off');
        this.tgc2.netChart.updateFilters();
    }

    protected legendDblClick(e: MouseEvent) {
        const $obj = $(e.currentTarget);
        const others = $obj.removeClass('off').siblings();
        others.addClass('off');
        const classId = $obj.data('key');
        this.legendFilter = {};
        this.legendFilter[classId] = false;
        others.each((i: number, v: HTMLElement) => {
            this.legendFilter[$(v).data('key')] = true;
        });
        this.tgc2.netChart.updateFilters();
    }

    protected legendDraw(schema: HieknSchema, legendType: string) {
        let typeObj = {};
        for (const type of schema.types) {
            typeObj[type.k] = type.v;
        }
        return (data: any, $container: JQuery) => {
            this.legendFilter = {};
            const nodes = _.filter(this.tgc2.getAvailableData().nodes, (n: Tgc2DataNode) => {
                return !n.hidden;
            });
            const classIds = _.keys(_.groupBy(nodes, 'classId'));
            // const $fabContainer = $('<div class="legend-fab-container"></div>');
            // $container.html($fabContainer);
            if (legendType == 'fab') {
                let items = [];
                for (const key in data) {
                    if (data.hasOwnProperty(key) && _.indexOf(classIds, key) >= 0) {
                        let html = '';
                        const text = typeObj[key];
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
                                'click': (e: MouseEvent) => {
                                    this.legendClick(e);
                                },
                                'mouseenter': (e: MouseEvent) => {
                                    this.legendMouseEnter(e);
                                },
                                'mouseleave': (e: MouseEvent) => {
                                    this.legendMouseLeave(e);
                                },
                                'dblclick': (e: MouseEvent) => {
                                    this.legendDblClick(e);
                                }
                            }
                        });
                    }
                }
                const fab = new hieknjs.fab({
                    container: $container,
                    radius: 80,
                    angle: 90,
                    startAngle: 90,
                    initStatus: this.layoutStatus,
                    main: {
                        html: '图例',
                        style: {
                            background: this.defaultColor,
                            color: '#fff'
                        },
                        events: {
                            'click': () => {
                                this.layoutStatus = !this.layoutStatus;
                            }
                        }
                    },
                    items: items
                });
                // fab.run();
            } else {
                $container.html('');
                for (const key in data) {
                    if (data.hasOwnProperty(key) && _.indexOf(classIds, key) >= 0) {
                        const $obj = $('<div class="tgc2-legend-item tgc2-legend-item-' + key + '"></div>').data({
                            'key': key,
                            'value': data[key]
                        });
                        $container.append($obj.html('<i style="background: ' + data[key] + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>'));
                    }
                }
            }
        }
    }

    protected legendMouseEnter(e: MouseEvent) {
        const $obj = $(e.currentTarget);
        $obj.addClass('active').siblings().addClass('inactive');
        this.nodeSettings.legendClass = $obj.data('key');
        this.nodeSettings.legendColor = $obj.data('value');
        this.tgc2.netChart.updateStyle();
        // const nodes = _.filter(this.tgc2.getAvailableData().nodes, (n)=> {
        //     return !n.hidden && (<HieknNetChartDataNode>n).classId == $obj.data('key');
        // });
        // const ids = _.keys(_.groupBy(nodes, 'id'));
        // this.tgc2.netChart.scrollIntoView(ids);
    }

    protected legendMouseLeave(e: MouseEvent) {
        const $obj = $(e.currentTarget);
        $obj.removeClass('active inactive').siblings().removeClass('active inactive');
        this.nodeSettings.legendClass = null;
        this.nodeSettings.legendColor = null;
        this.tgc2.netChart.updateStyle();
    }

    protected loader(options: HieknNetChartLoaderSetting, schema: HieknSchema) {
        return ($self: any, callback: Function, failed: Function) => {
            const params: any = this.buildLoaderParams(options);
            HieknSDKUtils.ajax({
                url: HieknSDKUtils.buildUrl(options.baseUrl + params.url, params.queryData),
                type: 'POST',
                data: params.formData,
                dataFilter: options.dataFilter,
                success: (data: any) => {
                    data = data[0];
                    if (data) {
                        data = HieknSDKNetChart.dealGraphData(data, schema);
                    }
                    callback(data);
                },
                error: () => {
                    failed();
                },
                that: $(options.selector).find('.tgc2-netchart-container')[0]
            });
        }
    }

    protected nodeFilter(nodeData: HieknNetChartDataNode) {
        return this.tgc2.inStart(nodeData.id) || !this.legendFilter[nodeData.classId];
    }

    protected nodeStyleFunction(options: HieknNetChartNodeSetting) {
        if (options.autoUpdateStyle) {
            setInterval(() => {
                this.updateStyle();
            }, 30);
        }
        return (node: Tgc2ChartNode) => {
            const data = <HieknNetChartDataNode>node.data;
            const classId = data.classId;
            const nodeIds = this.tgc2.getEmphasesNode();
            const tgc2NetChartSetting = this.tgc2.settings.netChart;
            node.label = node.data.name;
            node.lineWidth = 2;
            node.fillColor = node.data.color || tgc2NetChartSetting.nodeDefaultColor || node.fillColor;
            node.labelStyle.textStyle.font = '18px Microsoft Yahei';
            node.aura = node.data.auras;
            if (this.tgc2.inStart(node.id)) {
                node.radius = 50;
                node.fillColor = tgc2NetChartSetting.emphasesColor;
            }
            if (nodeIds[node.id]) {
                node.fillColor = tgc2NetChartSetting.emphasesColor;
                node.label = node.data.name;
                node.radius = node.radius * 1.5;
            } else if (!$.isEmptyObject(nodeIds)) {
                node.fillColor = tgc2NetChartSetting.reduceColor;
                node.radius = node.radius * 0.5;
            }
            node.imageCropping = 'fit';
            if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                if (nodeIds[node.id] || options.legendClass == data.classId) {
                    node.radius = node.radius * 1.5;
                } else {
                    node.fillColor = this.tgc2.settings.netChart.reduceColor;
                    node.label = '';
                    node.lineColor = node.fillColor;
                    node.radius = node.radius * 0.5;
                }
            } else {
                if (this.tgc2.inStart(node.id)) {

                } else {
                    node.fillColor = data.color || '#fff';
                    node.lineColor = this.defaultColor;
                    if (node.hovered) {
                        node.fillColor = node.lineColor;
                        node.shadowBlur = 0;
                    }
                }
            }
            if (options.nodeColors) {
                const value = <string>HieknSDKNetChart.getHieknTypeUnionMapValue(options.nodeColors[classId]);
                if (value) {
                    if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                        if (nodeIds[node.id] || options.legendClass == classId) {
                            node.fillColor = options.legendColor || this.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        } else {
                        }
                    } else {
                        if (this.tgc2.inStart(node.id)) {
                            node.fillColor = this.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        } else {
                            node.lineColor = value;
                            if (!options.imagePrefix && !options.images && !data.img) {
                                node.fillColor = node.lineColor;
                            }
                            if (node.hovered) {
                                node.fillColor = node.lineColor;
                            }
                        }
                    }
                }
            }
            if (data.img) {
                if (data.img.indexOf('http') != 0 && options.imagePrefix) {
                    node.image = HieknSDKUtils.qiniuImg(options.imagePrefix + data.img);
                } else {
                    node.image = data.img;
                }
                // if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                //     if (nodeIds[node.id] || options.legendClass == classId) {
                //     } else {
                //         node.image = '';
                //     }
                // } else {
                //     if (this.tgc2.inStart(node.id) || node.hovered) {
                //     } else {
                //         node.image = '';
                //     }
                // }
                // && !$.isEmptyObject(nodeIds)
                // if (!this.tgc2.inStart(node.id)
                //     && !nodeIds[node.id]
                //     || (options.legendClass && options.legendClass !== classId) ) {
                //     node.image = '';
                // }
                node.fillColor = '#fff';
            } else if (options.images && options.images[classId]) {
                const value = <HieknTypeNE>HieknSDKNetChart.getHieknTypeUnionMapValue(options.images[classId]);
                if (value) {
                    if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                        if (nodeIds[node.id] || options.legendClass == classId) {
                            node.image = options.legendColor || value.emphases;
                        } else {
                            node.image = '';
                        }
                    } else {
                        if (this.tgc2.inStart(node.id) || node.hovered) {
                            node.image = value.emphases;
                        } else {
                            node.image = value.normal;
                        }
                    }
                }
            }
            const radius = this.tgc2.netChart.getNodeDimensions(node).radius;
            if (options.autoUpdateStyle) {
                if (radius < options.minRadius) {
                    node.image = '';
                    node.fillColor = node.lineColor;
                }
                if (this.tgc2.inStart(node.id)) {
                    this.centerNodeRadius = radius;
                    !this.centerNode && (this.centerNode = node);
                }
            }
            if (options.textColors) {
                const value = HieknSDKNetChart.getHieknTypeUnionMapValue(options.textColors[classId]);
                if (value) {
                    if (typeof value == 'string') {
                        node.labelStyle.textStyle.fillColor = value;
                    } else {
                        if (this.tgc2.inStart(node.id) || nodeIds[node.id]) {
                            node.labelStyle.textStyle.fillColor = value.emphases;
                        } else {
                            if (node.hovered) {
                                node.labelStyle.textStyle.fillColor = value.emphases;
                            } else {
                                node.labelStyle.textStyle.fillColor = value.normal;
                            }
                        }
                    }
                }
            }
            const len = node.label.length;
            if (node.display == 'roundtext') {
                let label = node.label;
                const regChinese = HieknSDKUtils.regChinese;
                const regEnglish = HieknSDKUtils.regEnglish;
                for (let i = 1; i < label.length - 1; i++) {
                    const char = label.charAt(i);
                    const charNext = label.charAt(i + 1);
                    if ((regChinese.test(char) && regEnglish.test(charNext)) || (regEnglish.test(char) && regChinese.test(charNext))) {
                        label = label.substring(0, i + 1) + ' ' + label.substring(i + 1);
                        i++;
                    }
                }
                node.label = label;
                if (node.label.indexOf(' ') < 0 && len > 5) {
                    if (len > 9) {
                        const perLine = Math.floor(node.label.length / 3);
                        const split2 = len - perLine;
                        node.label = node.label.substring(0, perLine) + ' ' +
                            node.label.substring(perLine, split2) + ' ' +
                            node.label.substring(split2);
                    } else if (len > 5) {
                        node.label = node.label.substring(0, 4) + ' ' + node.label.substring(4);
                    }
                }
            }
        }
    }

    protected updateStyle() {
        if (this.centerNode) {
            const radius = this.tgc2.netChart.getNodeDimensions(this.centerNode).radius;
            if (this.centerNodeRadius != radius) {
                const nodes = this.tgc2.netChart.nodes();
                let ids = [];
                for (let node of nodes) {
                    ids.push(node.id);
                }
                this.tgc2.netChart.updateStyle(ids);
            }
        }
    }

    protected static buildFilter(schema: HieknSchema, options: HieknNetChartFilterSetting) {
        let allowAtts = [];
        let allowAttsSelected = [];
        let allowTypes = [];
        let allowTypesSelected = [];
        for (const i in schema.atts) {
            const att = schema.atts[i];
            if (att.type == 1) {
                allowAtts.push({value: att.k, label: att.v});
                allowAttsSelected.push(att.k);
            }
        }
        for (const j in schema.types) {
            const type = schema.types[j];
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
    }

    protected static dealGraphData(data: any, schema: HieknSchema) {
        data.nodes = data.entityList;
        data.links = data.relationList;
        delete data.entityList;
        delete data.relationList;
        let schemas: any = {};
        const arr = _.concat(schema.types, schema.atts);
        for (const kv of arr) {
            schemas[kv.k] = kv.v;
        }
        for (let node of data.nodes) {
            node.typeName = schemas[node.classId];
        }
        for (let link of data.links) {
            link.typeName = schemas[link.attId];
        }
        return data;
    }

    protected static getHieknTypeUnionMapValue(value: HieknTypeUnionStringNE, type?: string): HieknTypeUnionStringNE {
        if (value instanceof String) {
            return value;
        } else if (type) {
            return value[type];
        } else {
            return value;
        }
    }

    protected static linkContentsFunction(linkData: Tgc2DataLink) {
        const rInfo = $.extend(true, [], (linkData.nRInfo || []), (linkData.oRInfo || []));
        if (rInfo) {
            let items = '';
            for (const d of rInfo) {
                items += '<tr>';
                const kvs = d.kvs;
                let thead = '<tr>';
                let tbody = '<tr>';
                for (const j in kvs) {
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
    }

    protected static orderRelation(data: any) {
        let obj = {};
        const from = _.countBy(data, 'from');
        const to = _.countBy(data, 'to');
        for (const f in from) {
            obj[f] = (obj[f] || 0) + (to[f] || 0) + from[f];
        }
        for (const t in to) {
            obj[t] = (obj[t] || 0) + (from[t] || 0) + to[t];
        }
        let arr = [];
        for (const o in obj) {
            arr.push({k: o, v: obj[o]});
        }
        return _.orderBy(arr, 'v', 'desc');
    }

    protected abstract buildLoaderParams(options: HieknNetChartLoaderSetting): { queryData: any, formData: any, url: string };

    protected abstract buildPrivateSetting(schema: HieknSchema): void;

}
class HieknSDKGraph extends HieknSDKNetChart {

    tgc2Prompt: Tgc2Prompt;
    tgc2Page: Tgc2Page;

    protected buildPrivateSetting(schema: HieknSchema) {
        const initSettings = {
            success: (data: any) => {
                if (data.entityList && data.entityList.length) {
                    this.load(data.entityList[0]);
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        const filters = [{
            key: 'distance',
            label: '设定显示层数',
            selected: this.options.selectedDistance || 1,
            options: [1, 2, 3]
        }].concat(this.defaultTgc2Options.filter.filters);
        const defaultTgc2Options = {
            prompt: {
                enable: true,
                settings: {
                    drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                    onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                }
            },
            page: {
                enable: true,
                pageSize: 20
            }
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2Settings.filter.filters = filters;
        this.tgc2 = new Tgc2Graph(this.tgc2Settings);
        this.tgc2Prompt = new Tgc2Prompt(this.tgc2, this.tgc2Settings.prompt);
        this.tgc2Page = new Tgc2Page(this.tgc2, this.tgc2Settings.page);
    }

    protected buildLoaderParams(options: HieknNetChartLoaderSetting) {
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        formData.id = this.tgc2.startInfo.id;
        formData.isRelationMerge = true;
        if (this.tgc2Filter) {
            const filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2Page) {
            const page = this.tgc2Page.page;
            formData.pageNo = page.pageNo;
            formData.pageSize = page.pageSize;
        }
        return {queryData: queryData, formData: formData, url: 'graph'};
    }
}
class HieknSDKPath extends HieknSDKNetChart {

    tgc2Stats: Tgc2Stats;
    tgc2Connects: Tgc2Connects;

    protected buildPrivateSetting(schema: HieknSchema) {
        const initSettings = {
            success: (data: any) => {
                if (data.relationList && data.relationList.length) {
                    const arr = HieknSDKNetChart.orderRelation(data.relationList);
                    const start = arr[2] ? arr[2].k : arr[0].k;
                    const end = arr[1].k;
                    this.load({id: new Date().getTime(), start: {'id': start}, end: {'id': end}});
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        const filters = [{
            key: 'distance',
            label: '设定分析步长',
            selected: this.options.selectedDistance || 3,
            options: [3, 4, 5, 6]
        }].concat(this.defaultTgc2Options.filter.filters);
        const defaultTgc2Options = {
            stats: {
                enable: true,
                editable: true,
                atts: schema.atts,
                types: schema.types,
                statsConfig: this.options.statsConfig
            },
            connects: {
                enable: true,
                mode: 'click'
            },
            legend: {
                enable: false
            },
            path: {
                prompt: {
                    settings: {
                        drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                        onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                    }
                }
            }
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2Settings.filter.filters = filters;
        this.tgc2 = new Tgc2Path(this.tgc2Settings);
        this.tgc2Stats = new Tgc2Stats(this.tgc2, this.tgc2Settings.stats);
        this.tgc2Connects = new Tgc2Connects(this.tgc2, this.tgc2Settings.connects);
    }

    protected buildLoaderParams(options: HieknNetChartLoaderSetting) {
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        formData.start = (<Tgc2PathStartInfo>this.tgc2.startInfo).start.id;
        formData.end = (<Tgc2PathStartInfo>this.tgc2.startInfo).end.id;
        formData.isShortest = true;
        formData.connectsCompute = true;
        formData.statsCompute = true;
        if (this.tgc2Filter) {
            const filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2Stats) {
            formData.statsConfig = this.tgc2Stats.getStatsConfig();
        }
        return {queryData: queryData, formData: formData, url: 'path'};
    }
}

class HieknSDKRelation extends HieknSDKNetChart {

    tgc2Stats: Tgc2Stats;
    tgc2Connects: Tgc2Connects;

    protected buildPrivateSetting(schema: HieknSchema) {
        const initSettings = {
            success: (data: any) => {
                if (data.relationList && data.relationList.length) {
                    const arr = HieknSDKNetChart.orderRelation(data.relationList);
                    let nodes = [];
                    for (const i in arr) {
                        if (parseInt(i) < 3) {
                            nodes.push({id: arr[i].k});
                        }
                    }
                    this.load({id: new Date().getTime(), nodes: nodes});
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        const filters = [{
            key: 'distance',
            label: '设定分析步长',
            selected: this.options.selectedDistance || 3,
            options: [3, 4, 5, 6]
        }].concat(this.defaultTgc2Options.filter.filters);
        const defaultTgc2Options = {
            stats: {
                enable: true,
                editable: true,
                atts: schema.atts,
                types: schema.types,
                statsConfig: this.options.statsConfig
            },
            connects: {
                enable: true,
                mode: 'click'
            },
            legend: {
                enable: false
            },
            relation: {
                prompt: {
                    settings: {
                        drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                        onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                    }
                }
            }
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2Settings.filter.filters = filters;
        this.tgc2 = new Tgc2Relation(this.tgc2Settings);
        this.tgc2Stats = new Tgc2Stats(this.tgc2, this.tgc2Settings.stats);
        this.tgc2Connects = new Tgc2Connects(this.tgc2, this.tgc2Settings.connects);
    }

    protected buildLoaderParams(options: HieknNetChartLoaderSetting) {
        const ids = _.map((<Tgc2RelationStartInfo>this.tgc2.startInfo).nodes, 'id');
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        formData.ids = ids;
        formData.isShortest = true;
        formData.connectsCompute = true;
        formData.statsCompute = true;
        if (this.tgc2Filter) {
            const filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2Stats) {
            formData.statsConfig = this.tgc2Stats.getStatsConfig();
        }
        return {queryData: queryData, formData: formData, url: 'relation'};
    }
}

class HieknSDKTiming extends HieknSDKNetChart {
    isTiming: true;
    tgc2Prompt: Tgc2Prompt;
    tgc2TimeChart: Tgc2TimeChart;
    tgc2Event: Tgc2Event;

    protected buildPrivateSetting(schema: HieknSchema) {
        const initSettings = {
            success: (data: any) => {
                if (data.entityList && data.entityList.length) {
                    this.load(data.entityList[0]);
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        const defaultTgc2Options = {
            autoResize: true,
            prompt: {
                enable: true,
                settings: {
                    drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                    onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                }
            },
            legend: {
                style: {
                    bottom: '60px'
                }
            },
            timeChart: {
                enable: true
            },
            event: {
                enable: true
            },
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2 = new Tgc2Graph(this.tgc2Settings);
        this.tgc2Prompt = new Tgc2Prompt(this.tgc2, this.tgc2Settings.prompt);
        this.tgc2TimeChart = new Tgc2TimeChart(this.tgc2, this.tgc2Settings.timeChart);
        this.tgc2Event = new Tgc2Event(this.tgc2, this.tgc2Settings.event);
        try {
            this.tgc2TimeChart.$settingModal.find('.input-daterange').datepicker({
                format: 'yyyy-mm-dd'
            });
            this.tgc2TimeChart.$settingModal.find('.input-daterange').find('input').prop('type', 'text');
        } catch (e) {
        }
    }

    protected buildLoaderParams(options: HieknNetChartLoaderSetting) {
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        formData.id = this.tgc2.startInfo.id;
        formData.isRelationMerge = true;
        if (this.tgc2Filter) {
            const filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2TimeChart) {
            const settings = this.tgc2TimeChart.getSettings();
            delete settings.type;
            $.extend(true, formData, settings);
        }
        return {queryData: queryData, formData: formData, url: 'graph/timing'};
    }
}

interface HieknStatConfigSetting {
    type: string;
    seriesName?: { [key: string]: string };
    chartSettings?: any;
    changeXY?: boolean;
}

interface HieknStatSetting extends HieknBaseSetting {
    container?: string;
    formDataUpdater?: (formData: any) => any;
    config?: HieknStatConfigSetting;
    kgName?: string;
    chartColor?: string[];
}

abstract class HieknSDKStat {
    $container: JQuery;
    chart: any;
    options: HieknStatSetting;
    stat: any;
    defaults: HieknStatSetting = {
        chartColor: HieknSDKUtils.color
    };

    constructor(options: HieknStatSetting) {
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }

    protected init() {
        this.$container = $(this.options.container);
        this.bindEvent();
    }

    protected bindEvent() {
        $(window).on('resize', () => {
            this.chart && this.chart.resize();
        });
    }

    protected abstract drawChart(): void;

    load() {
        let queryData = this.options.queryData || {};
        let formData = this.options.formData || {};
        if (this.options.formDataUpdater) {
            formData = this.options.formDataUpdater(formData);
        }
        let $container = this.$container.empty();
        let newOptions = {
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'stat/data', queryData),
            type: 'POST',
            data: formData,
            success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
                this.stat = data[0];
                this.drawChart();
            },
            that: $container[0]
        };
        newOptions = $.extend(true, {}, this.options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    }
}
class HieknSDKStatLineBar extends HieknSDKStat {
    protected drawChart() {
        const type = this.options.config.type;
        const defaultXAxis = {
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
        const defaultSeries = {
            name: '',
            type: type,
            symbol: 'circle',
            symbolSize: 10
        };
        const d = this.stat;
        const stat = this.options.config;
        const legend = [];
        for (const s of d.series) {
            if (stat.seriesName) {
                s.name = stat.seriesName[s.name] || s.name;
                legend.push(s.name);
            }
        }
        let idx = 0;
        const xAxisArr = [];
        for (const xAxis of d.xAxis) {
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
        const seriesArr = [];
        for (const series of d.series) {
            if (stat.chartSettings && stat.chartSettings.series) {
                if (stat.chartSettings.series instanceof Array) {
                    $.extend(true, defaultSeries, stat.chartSettings.series[idx]);
                } else {
                    $.extend(true, defaultSeries, stat.chartSettings.series);
                }
            }
            if (series.name == '') {
                delete series.name;
            }
            const s = $.extend(true, {}, defaultSeries, series);
            if (stat.seriesName && stat.seriesName[s.name]) {
                s.name = stat.seriesName[s.name] || s.name;
            }
            seriesArr.push(s);
            idx++;
        }
        this.chart = echarts.init(this.$container[0]);
        let defaultOption: any = {
            color: this.options.chartColor,
            tooltip: {
                position: 'top',
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                }
            },
            legend: {
                show: false,
                orient: 'vertical',
                x: 'left',
                data: legend
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
        if (stat.seriesName && !$.isEmptyObject(stat.seriesName)) {
            defaultOption.tooltip.formatter = (param: any) => {
                let str = '';
                for (const item of param) {
                    str += item.seriesName + ':' + item.data + '<br>';
                }
                return str;
            }
        }
        let option: any = {};
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
        this.chart.setOption(option);
    }
}
class HieknSDKStatMap extends HieknSDKStat {
    protected drawChart() {
        const stat = this.options.config;
        this.chart = echarts.init(this.$container[0]);
        const data = this.stat;
        //34个省、市、自治区的名字拼音映射数组
        const provinces = {
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
        const special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
        let mapdata: any[] = [];
        //绘制全国地图
        $.getJSON('../json/china.json', data => {
            const d = [];
            for (let i = 0; i < data.features.length; i++) {
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
        let defaultOption = {
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
                shape: {r: 20},
                style: {
                    text: '返回',
                    fill: '#eee'
                },
                left: 10,
                top: 10,
                onclick: () => {
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
                    color: [this.options.chartColor[2], this.options.chartColor[3]]
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
        let option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }

        console.log(option.openClick);

        if(option.openClick){
            //地图点击事件
            this.chart.on('click', (params:any) => {
                // console.log(params);
                if (params.name in provinces) {
                    //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
                    $.getJSON('../json/province/' + provinces[params.name] + '.json', data => {
                        echarts.registerMap(params.name, data);
                        const d = [];
                        for (let i = 0; i < data.features.length; i++) {
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
                        $.getJSON('../json/city/' + cityMap[params.name] + '.json', data => {
                            echarts.registerMap(params.name, data);
                            const d = [];
                            for (let i = 0; i < data.features.length; i++) {
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
        let renderMap = (map: any, data: any) => {
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
                    data: this.stat
                }
            ];

            //渲染地图
            console.log(JSON.stringify(option));
            this.chart.setOption(option);
        }
    }
}
class HieknSDKStatPie extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const stat = this.options.config;
        const legend = [];
        for (const s of d.series) {
            if (stat.seriesName) {
                s.name = stat.seriesName[s.name] || s.name;
                legend.push(s.name);
            }
        }
        const defaultSeries = {
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
        let series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {
            color: this.options.chartColor,
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
        let option: any = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        option.series = [series];
        this.chart.setOption(option);
    }
}
class HieknSDKStatRadar extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const stat = this.options.config;
        const data = d.series;
        let arr = [];
        for (const val of data) {
            arr.push(val.value);
        }
        console.log(arr)


        const defaultSeries = {
            name: '',
            type: 'radar',
            data: [arr],
            symbol: 'none',
            itemStyle: {
                normal: {
                    color: this.options.chartColor[0]
                }
            },
            areaStyle: {
                normal: {
                    opacity: 0.1
                }
            }
        };
        let series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {
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
        let option: any = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        option.series = [series];
        this.chart.setOption(option);
    }
}
class HieknSDKStatScatter extends HieknSDKStat {
    protected drawChart() {
        const data = this.stat;
        console.log(data);
        const stat = this.options.config;
        let defaultSeries: any[] = [];
        for (let i = 0; i < data.series.length; i++) {
            defaultSeries.push({
                name: stat.chartSettings.legend.data ? stat.chartSettings.legend.data[i] : '',
                data: data.series[i],
                type: 'scatter',
                symbolSize: function (data: any) {
                    return Math.sqrt(data[2]) / 5e2;
                },
                label: {
                    emphasis: {
                        show: true,
                        formatter: function (param: any) {
                            return param.data[3];
                        },
                        position: 'top'
                    }
                },
                itemStyle: {
                    normal: {
                        color: this.options.chartColor[i]
                    }
                }
            })
        }
        ;

        let series = [];
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {
            backgroundColor: '#fff',
            title: {
                text: ''
            },
            series: series,
            legend: {
                right: 10,
                data: data.name
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
        let option: any = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        this.chart.setOption(option);
    }
}
class HieknSDKStatWordCloud extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const stat = this.options.config;
        const data = [];
        for (const series of d.series) {
            if (series.name) {
                data.push(series);
            }
        }
        const defaultSeries = {
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
                    color: () => {
                        return this.options.chartColor[Math.floor(Math.random() * this.options.chartColor.length)];
                    }
                },
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            data: data
        };
        let series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {};
        let option: any = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        option.series = [series];
        this.chart.setOption(option);
    }
}
interface HieknAssociationSetting extends HieknAjaxSetting {
    kgName?: string;
}

class HieknSDKAssociation {
    static defaults = {
        formData: {
            pageSize: 6
        }
    };

    static load(options: HieknAssociationSetting) {
        options = $.extend(true, {}, HieknSDKAssociation.defaults, options);
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        formData.kgName = options.kgName;
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'association', queryData),
            type: 'POST',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
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
interface HieknConceptTreeInsSearchSetting extends HieknAjaxSetting {
    paramName?: string
}

interface HieknConceptTreeInsSetting extends HieknAjaxSetting {
    enable?: boolean;
    onClick?: Function;
    searchSettings?: HieknConceptTreeInsSearchSetting;
}

interface HieknConceptTreeSetting extends HieknBaseSetting {
    kgName?: string;
    container?: string;
    getAsyncUrl?: Function;
    idKey?: string;
    initId?: number;
    nameKey?: string;
    onNodeClick?: Function;
    nodeHoverTools?: {
        infoboxSetting?: HieknNetChartInfoboxSetting,
        graphSetting?: {
            enable?: boolean;
            instanceEnable?: boolean;
            infoboxSetting?: HieknNetChartInfoboxSetting;
            conceptGraphSettings?: HieknConceptGraphSetting
        }
    },
    instance?: HieknConceptTreeInsSetting,
    namespace?: string,
    pIdKey?: string,
    readAll?: boolean,
    hiddenIds?: { self?: number[], rec?: number[] }
}
class HieknSDKConceptTree {
    $container: JQuery;
    $graphContainer: JQuery;
    $instanceContainer: JQuery;
    treeId: string;
    clickTimeout: any;
    isFirst = true;
    lastSelectedNode: any;
    startAsync = false;
    treeDbClick = false;
    instanceSearchSettings: any;
    zTreeSettings: any;
    zTree: any;
    treeInfobox: HieknSDKInfobox;
    tgc2ConceptGraph: HieknSDKConceptGraph;
    instanceSearch: any;
    options: HieknConceptTreeSetting;
    defaults: HieknConceptTreeSetting = {
        getAsyncUrl: () => {
            let queryData: any = {};
            queryData.kgName = this.options.kgName;
            if (this.options.readAll) {
                queryData.id = this.getLastSelectedNodeId() || 0;
            } else {
                queryData.id = this.getLastSelectedNodeId() || this.options.initId;
            }
            queryData.onlySubTree = this.isFirst ? 0 : 1;
            $.extend(true, queryData, this.options.queryData);
            return HieknSDKUtils.buildUrl(this.options.baseUrl + 'concept', queryData);
        },
        idKey: 'id',
        initId: 0,
        nameKey: 'name',
        onNodeClick: $.noop,
        nodeHoverTools: {
            infoboxSetting: {
                enable: false
            },
            graphSetting: {
                enable: false,
                instanceEnable: false,
                infoboxSetting: {
                    enable: false
                }
            }
        },
        instance: {
            enable: false,
            onClick: $.noop
        },
        namespace: 'hiekn-concept-tree',
        pIdKey: 'parentId',
        readAll: false,
        hiddenIds: {self: [], rec: []}
    };

    constructor(options: HieknConceptTreeSetting) {
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }

    private init() {
        this.$container = $(this.options.container);
        this.treeId = HieknSDKUtils.randomId(this.options.namespace + '-');
        this.$container.addClass('hiekn-concept-tree').append('<ul class="ztree" id="' + this.treeId + '"></ul>');
        this.zTreeSettings = this.updateZTreeSettings();
        this.zTree = (<any>$.fn).zTree.init(this.$container.find('.ztree'), this.zTreeSettings);
        if (this.options.nodeHoverTools.graphSetting.enable) {
            this.buildGraph();
        }
        if (this.options.nodeHoverTools.infoboxSetting.enable) {
            this.treeInfobox = this.buildInfobox(this.options.nodeHoverTools.infoboxSetting);
        }
        if (this.options.instance.enable) {
            const id = HieknSDKUtils.randomId(this.options.namespace + '-prompt-');
            this.$instanceContainer = $('<div class="hiekn-instance-container"><div class="hiekn-instance-prompt" id="' + id + '"></div><div class="hiekn-instance-list"></div></div>');
            this.$container.append(this.$instanceContainer);
            this.instanceSearchSettings = {
                container: '#' + id,
                promptEnable: false,
                placeholder: '实例搜索',
                onSearch: (kw: string) => {
                    let options: HieknConceptTreeInsSearchSetting = {
                        paramName: 'kw',
                        url: this.options.baseUrl + 'prompt',
                        type: 'POST',
                        formData: {
                            kgName: this.options.kgName
                        }
                    };
                    $.extend(true, options, this.options.instance.searchSettings);
                    options.formData[options.paramName] = kw;
                    let newOptions = {
                        url: HieknSDKUtils.buildUrl(options.url, options.queryData),
                        dataFilter: options.dataFilter || this.options.dataFilter,
                        data: options.formData,
                        success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
                            if (data) {
                                const $container = this.select('.instance-loader-container');
                                $container.attr({'data-more': '0', 'data-page': '1'});
                                this.drawInstanceList(data, false);
                                options.success && options.success(data, textStatus, jqXHR);
                            }
                        }
                    };
                    newOptions = $.extend(true, {}, options, newOptions);
                    HieknSDKUtils.ajax(newOptions);
                }
            };
            this.instanceSearch = new hieknPrompt(this.instanceSearchSettings);
            this.bindInstanceEvent();
        }
    }

    addHoverDom(treeId: string, treeNode: any) {
        const sObj = this.select('#' + treeNode.tId + '_span');
        if (this.select('#button-container_' + treeNode.tId).length > 0) {
            return;
        }
        const $container = $('<span class="button-container" id="button-container_' + treeNode.tId + '" ></span>');
        sObj.after($container);
        this.onNodeHover($container, treeNode);
    }

    beforeAsync(treeId: string, treeNode: any) {
        if (treeNode) {
            this.startAsync = true;
            this.lastSelectedNode = treeNode;
        }
        return true;
    }

    private bindInstanceEvent() {
        this.select('.hiekn-instance-list').on('scroll', (event: Event) => {
            if ($(event.target).height() + $(event.target).scrollTop() > $(event.target)[0].scrollHeight - 50) {
                this.loadInstanceService();
            }
        });
        this.select('.hiekn-instance-list').on('click', 'li[data-id]', (event: Event) => {
            const node = $(event.currentTarget).data('data');
            $(event.currentTarget).addClass('active').siblings('.active').removeClass('active');
            this.options.instance.onClick(node);
        });
    }

    private buildInfobox(infoboxOptions: HieknInfoboxSetting) {
        let options = {
            baseUrl: this.options.baseUrl,
            dataFilter: this.options.dataFilter,
            kgName: this.options.kgName
        };
        $.extend(true, options, infoboxOptions);
        return new HieknSDKInfobox(options);
    }

    /**
     * TODO to replace modal
     * */
    private buildGraph() {
        const selector = HieknSDKUtils.randomId(this.options.namespace + '-tgc2-');
        this.$graphContainer = $('<div class="modal fade hiekn-concept-tree-graph-modal" id="' + selector + '-modal" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">' +
            '<div class="modal-dialog modal-lg">' +
            '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">' +
            '<svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
            '</button>' +
            '<h4 class="modal-title"><span name="title"></span></h4></div><div class="modal-body"><div class="' + selector + '"></div></div></div></div></div>');
        $('body').append(this.$graphContainer);
        let settings: HieknConceptGraphSetting = {
            selector: '.' + selector,
            baseUrl: this.options.baseUrl,
            dataFilter: this.options.dataFilter,
            kgName: this.options.kgName,
            infoboxSetting: this.options.nodeHoverTools.graphSetting.infoboxSetting,
            instanceEnable: this.options.nodeHoverTools.graphSetting.instanceEnable,
            promptSettings: {
                dataFilter: this.options.dataFilter
            }
        };
        $.extend(true, settings, this.options.nodeHoverTools.graphSetting.conceptGraphSettings);
        this.tgc2ConceptGraph = new HieknConceptGraphService(settings);
    }

    private dataFilter(treeId: string, parentNode: any, data: any) {
        if (this.options.dataFilter) {
            data = this.options.dataFilter(data, undefined);
        }
        if (data.code == 200) {
            if (!data.data || !data.data.rsData) {
                return null;
            }
            data = data.data.rsData;
            const len = data.length;
            let result = [];
            for (let i = 0; i < len; i++) {
                !this.options.readAll && (data[i].isParent = true);
                if (_.indexOf(this.options.hiddenIds.self, data[i][this.options.idKey]) < 0
                    && _.indexOf(this.options.hiddenIds.rec, data[i][this.options.idKey]) < 0
                    && _.indexOf(this.options.hiddenIds.rec, data[i][this.options.pIdKey]) < 0) {
                    if (!parentNode || data[i][this.options.idKey] != parentNode[this.options.idKey]) {
                        result.push(data[i]);
                    }
                }
                if (_.indexOf(this.options.hiddenIds.rec, data[i][this.options.pIdKey]) >= 0) {
                    this.options.hiddenIds.rec.push(data[i][this.options.idKey]);
                }
            }
            if (result.length == 0) {
                parentNode.isParent = false;
            } else {
                return result;
            }
        } else {
            HieknSDKUtils.error(data.msg);
        }
        return null;
    }

    private drawInstanceList(instances: any[], append: boolean) {
        const $container = this.$instanceContainer.find('.hiekn-instance-list ul');
        let html = $('<ul></ul>');
        if (instances.length) {
            for (const instance of instances) {
                html.append($('<li data-id="' + instance.id + '" title="' + instance.name + '">' + instance.name + '</li>').data('data', instance));
            }
        } else if (!append) {
            html.append('<li>没有找到相关实例</li>');
        }
        if (append) {
            $container.append(html.children());
        } else {
            $container.empty().append(html.children());
        }
    }

    private expandNodes(nodeId: number) {
        const node = this.zTree.getNodeByParam(this.options.idKey, nodeId);
        if (node) {
            this.zTree.expandNode(node, true, false, true, false);
            const parentNode = node.getParentNode();
            parentNode && this.expandNodes(parentNode[this.options.idKey]);
        }
    }

    private getAsyncUrl() {
        return typeof this.options.getAsyncUrl == 'string' ? this.options.getAsyncUrl : this.options.getAsyncUrl(this);
    }

    getLastSelectedNodeId() {
        return this.lastSelectedNode ? this.lastSelectedNode[this.options.idKey] : null;
    }

    getLastSelectedInstance() {
        return this.select('.hiekn-instance-list li[data-id].active').data('data');
    }

    private loadGraph(id: number) {
        this.tgc2ConceptGraph.load({
            id: id,
            kgType: 0
        });
    }

    reloadInstance() {
        this.select('.hiekn-instance-list').html('<ul></ul><div class="instance-loader-container" data-more="1" data-page="1"></div>');
        this.loadInstanceService();
    }

    private loadInstanceService() {
        const $container = this.select('.instance-loader-container');
        if ($container.attr('data-more') != '0') {
            if ($container.data('inLoading') != 1) {
                $container.data('inLoading', 1);
                let options: HieknConceptTreeInsSetting = {
                    queryData: {
                        conceptId: this.getLastSelectedNodeId() || this.options.initId,
                        readAll: 0,
                        pageNo: $container.attr('data-page'),
                        pageSize: 15,
                        kgName: this.options.kgName
                    }
                };
                $.extend(true, options, this.options.instance);
                let newOptions = {
                    url: HieknSDKUtils.buildUrl(options.url, options.queryData),
                    dataFilter: options.dataFilter || this.options.dataFilter,
                    success: (data: any, textStatus: string, jqXHR: JQueryXHR, orgData: any, params: any) => {
                        let d = data;
                        if (d.length <= params.pageSize) {
                            $container.attr({'data-more': 0});
                        }
                        if (d.length > params.pageSize) {
                            d.pop();
                        }
                        this.drawInstanceList(d, params.pageNo != 1);
                        $container.attr({'data-page': parseInt(params.pageNo, 10) + 1});
                        options.success && options.success(data, textStatus, jqXHR);
                    },
                    complete: (jqXHR: JQueryXHR, textStatus: string) => {
                        $container.data('inLoading', 0);
                        const $ic = this.select('.hiekn-instance-list');
                        if ($ic.children('ul').height() < $ic.height()) {
                            this.loadInstanceService();
                        }
                        options.complete && options.complete(jqXHR, textStatus);
                    },
                    that: $container[0]
                };
                newOptions = $.extend(true, {}, options, newOptions);
                HieknSDKUtils.ajax(newOptions);
            }
        } else {
            console.log('no more instance');
        }
    }

    onAsyncSuccess(event: Event, treeId: string, treeNode: any) {
        let node = treeNode;
        if (node) {
            this.onNodeClick(node);
        }
        if (node && node.children.length == 0) {
            node.isParent = false;
            this.zTree.updateNode(node);
            HieknSDKUtils.info('当前概念没有子概念');
        } else if (!node) {
            this.expandNodes(this.getLastSelectedNodeId() || this.options.initId);
            if (!this.getLastSelectedNodeId()) {
                node = this.zTree.getNodeByParam(this.options.idKey, this.options.initId);
                this.zTree.selectNode(node);
                this.onNodeClick(node);
            }
        }
        const root = this.zTree.getNodeByParam(this.options.idKey, this.options.initId);
        this.addHoverDom(treeId, root);
        this.isFirst = false;
        this.startAsync = false;
    }

    onClick(event: Event, treeId: string, treeNode: any) {
        this.clickTimeout && clearTimeout(this.clickTimeout);
        this.clickTimeout = setTimeout(() => {
            this.lastSelectedNode = treeNode;
            this.onNodeClick(treeNode);
            this.treeDbClick = false;
        }, 500);
    }

    onNodeButtonClick($button: JQuery, treeNode: any) {
        this.select('.tree-button-active').removeClass('tree-button-active');
        this.zTree.selectNode(treeNode);
        $button.addClass('tree-button-active');
        this.lastSelectedNode = treeNode;
    }

    onNodeClick(node: any) {
        if (this.options.instance.enable) {
            this.reloadInstance();
        }
        this.options.onNodeClick(node);
    }

    /**
     * TODO to replace tooltipster, modal
     * */
    onNodeHover($container: JQuery, treeNode: any) {
        for (const key in this.options.nodeHoverTools) {
            const value = this.options.nodeHoverTools[key];
            if (key == 'graph' && value.enable) {
                const $graphBtn = $('<span class="button" title="图谱可视化">' +
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
                $graphBtn.on('click', (event: Event) => {
                    (<any>this.$graphContainer).modal('show');
                    this.loadGraph(treeNode[this.options.idKey]);
                    event.stopPropagation();
                });
            } else if (key == 'infobox' && value.enable) {
                const $infoboxBtn = $('<span class="button" title="知识卡片">' +
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
                (<any>$infoboxBtn).tooltipster({
                    side: ['bottom'],
                    theme: 'tooltipster-shadow',
                    distance: 16,
                    interactive: true,
                    trigger: 'click',
                    content: 'Loading...',
                    functionBefore: (instance: any, helper: any) => {
                        const $origin = $(helper.origin);
                        if ($origin.data('loaded') !== true) {
                            const id = treeNode[this.options.idKey];
                            this.treeInfobox.load(id, (data: any) => {
                                if (data) {
                                    const $container = this.treeInfobox.buildInfobox(data);
                                    instance.content($container);
                                    this.treeInfobox.initEvent($container);
                                } else {
                                    instance.content('没有当前概念的知识卡片信息');
                                }
                                $origin.data('loaded', true);
                            }, () => {
                                instance.content('read data failed');
                            });
                        }
                    }
                });
                $infoboxBtn.on('click', (event: Event) => {
                    event.stopPropagation();
                });
            } else if (value instanceof Function) {
                value($container, treeNode);
            }
        }
        return true;
    };

    removeHoverDom(treeId: string, treeNode: any) {
        if (treeNode.level > 0) {
            const $container = this.select('#button-container_' + treeNode.tId);
            $container.children().off('click');
            $container.remove();
        }
    };

    private select(selector: string) {
        return $(this.options.container).find(selector);
    };

    private updateZTreeSettings() {
        return {
            async: {
                enable: true,
                url: () => {
                    return this.getAsyncUrl();
                },
                dataFilter: (treeId: string, parentNode: any, data: any) => {
                    return this.dataFilter(treeId, parentNode, data);
                },
                type: 'get'
            },
            view: {
                showLine: false,
                showIcon: false,
                expandSpeed: 'fast',
                dblClickExpand: (treeId: string, treeNode: any) => {
                    return treeNode.level > 0;
                },
                selectedMulti: false,
                addHoverDom: (treeId: string, treeNode: any) => {
                    this.addHoverDom(treeId, treeNode);
                },
                removeHoverDom: (treeId: string, treeNode: any) => {
                    this.removeHoverDom(treeId, treeNode);
                }
            },
            callback: {
                beforeAsync: (treeId: string, treeNode: any) => {
                    return this.beforeAsync(treeId, treeNode);
                },
                onAsyncSuccess: (event: Event, treeId: string, treeNode: any) => {
                    return this.onAsyncSuccess(event, treeId, treeNode);
                },
                onClick: (event: Event, treeId: string, treeNode: any) => {
                    return this.onClick(event, treeId, treeNode);
                },
                onDblClick: () => {
                    this.treeDbClick = true;
                }
            },
            data: {
                simpleData: {
                    enable: true,
                    pIdKey: this.options.pIdKey,
                    idKey: this.options.idKey
                },
                key: {
                    name: this.options.nameKey
                }
            }
        };
    }
}
declare const hieknjs: any;
declare const moment: any;

interface HieknDisambiguateSetting extends HieknAjaxSetting {
}

class HieknSDKDisambiguate {
    static defaults: HieknDisambiguateSetting = {
        queryData:{
            useConcept: true,
            useEntity: true,
            useAttr: true
        }
    };

    static load(options: HieknDisambiguateSetting) {
        options = $.extend(true, {}, HieknSDKDisambiguate.defaults, options);
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'disambiguate', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
interface HieknInfoboxSetting extends HieknBaseSetting {
    kgName?: string;
    autoLen?: boolean;
    atts?: { visible: number[], hidden: number[] };
    enableLink?: boolean;
    imagePrefix?: string;
    onLoad?: Function;
    onFailed?: Function;
    selector?: string;
    changeInfobox?: Function;
}

class HieknSDKInfobox {
    callback: Function = $.noop;
    defaults: HieknInfoboxSetting = {
        atts: {visible: [], hidden: []},
        enableLink: false,
        autoLen: true,
        onLoad: $.noop,
        onFailed: $.noop
    };
    options: HieknInfoboxSetting;

    constructor(options: HieknInfoboxSetting) {
        this.options = $.extend(true, {}, this.defaults, options);
    }

    private changeInfobox(id: HieknIdType) {
        this.load(id, this.callback);
    };

    initEvent($container: JQuery) {
        $container.on('click', '.hiekn-infobox-link', (event: Event) => {
            const id = $(event.currentTarget).attr('data-id');
            this.options.changeInfobox ? this.options.changeInfobox(id, this) : this.changeInfobox(id);
        });

        $container.on('click', '.hiekn-infobox-info-detail a', (event: Event) => {
            $(event.currentTarget).closest('.hiekn-infobox-info-detail').toggleClass('on');
        });
    }

    private buildEntity(entity: any, buildLink: boolean) {
        const meaningTag = entity.meaningTag ? '(' + entity.meaningTag + ')' : '';
        const html = '<span class="hiekn-infobox-name">' + entity.name + '<span class="hiekn-infobox-meaningTag">' + meaningTag + '</span></span>';
        if (buildLink && this.options.enableLink) {
            return '<a href="javascript:void(0)" class="hiekn-infobox-link" data-id="' + entity.id + '">' + html + '</a>';
        }
        return html;
    }

    private buildExtra(extra: HieknKV) {
        let detail = extra.v || '-';
        if (this.options.autoLen) {
            const max = typeof this.options.autoLen == 'number' ? this.options.autoLen : 80;
            if (extra.v.length > max) {
                detail = '<span class="hiekn-infobox-info-detail-short">' + extra.v.substring(0, max) + '<a href="javascript:void(0)">查看全部&gt;&gt;</a></span><span class="hiekn-infobox-info-detail-long">' + extra.v + '<a href="javascript:void(0)">收起&lt;&lt;</a></span>';
            }
        }
        return '<tr><td class="hiekn-infobox-info-label">' + extra.k + '</td><td class="hiekn-infobox-info-detail">' + detail + '</td></tr>';
    }

    load(id: HieknIdType, callback: Function, onFailed?: Function) {
        const queryData = this.options.queryData || {};
        const formData = this.options.formData || {};
        formData.id = id;
        formData.kgName = this.options.kgName;
        HieknSDKUtils.ajax({
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'infobox', queryData),
            type: 'POST',
            data: formData,
            dataFilter: this.options.dataFilter,
            success: (data: any) => {
                data = data[0];
                if (data) {
                    if (callback) {
                        this.callback = callback;
                        callback(data);
                    } else if (this.options.selector) {
                        const $container = this.buildInfobox(data);
                        $(this.options.selector).html($container[0].outerHTML);
                        this.initEvent($container);
                    } else {
                        console.error('selector or callback can not be null');
                    }
                    this.options.onLoad(data);
                } else {
                    if (!onFailed || !onFailed(data)) {
                        this.options.onFailed(data);
                    }
                }
            },
            error: (jqXHR: JQueryXHR) => {
                if (!onFailed || !onFailed(null)) {
                    this.options.onFailed(null);
                }
            }
        });
    };

    buildInfobox(data: any) {
        const $infoxbox = $('<div class="hiekn-infobox"></div>');
        if (data.self) {
            $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"></div>');
            const baseEntity = this.buildEntity(data.self, false);
            $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + baseEntity + '</div>');
            if (data.self.img) {
                let imgUlrl = data.self.img;
                if (data.self.img.indexOf('http') != 0) {
                    imgUlrl = HieknSDKUtils.qiniuImg(this.options.imagePrefix + data.self.img);
                }
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-img"><img src="' + imgUlrl + '" alt=""></div>');
            }
            if (data.self.extra) {
                let html = '';
                const visible = this.options.atts.visible || [];
                const hidden = this.options.atts.hidden || [];
                for (const i in data.self.extra) {
                    if (data.self.extra.hasOwnProperty(i)) {
                        const extra = data.self.extra[i];
                        if ((visible.length && _.indexOf(visible, extra.k) >= 0) || (hidden.length && _.indexOf(hidden, extra.k) < 0) || (!visible.length && !hidden.length)) {
                            html += this.buildExtra(extra);
                        }
                    }
                }
                if (data.atts) {
                    for (const m in data.atts) {
                        if (data.atts.hasOwnProperty(m)) {
                            const att = data.atts[m];
                            let lis = '';
                            for (const j in att.v) {
                                if (att.v.hasOwnProperty(j)) {
                                    lis += '<li>' + this.buildEntity(att.v[j], true) + '</li>';
                                }
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
                for (const k in data.pars) {
                    if (data.pars.hasOwnProperty(k)) {
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + this.buildEntity(data.pars[k], true) + '</li>');
                    }
                }
            }
            if (data.sons) {
                let html = '';
                for (const l in data.sons) {
                    if (data.sons.hasOwnProperty(l)) {
                        html += '<li>' + this.buildEntity(data.sons[l], true) + '</li>';
                    }
                }
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">相关：</label><ul>' + html + '</ul></div>');
            }
        } else {
            $infoxbox.append('InfoBox读取错误');
        }
        return $infoxbox;
    }

    buildTabInfobox(data: any) {
        const $infoxbox = $('<div class="hiekn-infobox hiekn-infobox-tab"></div>');
        if (data.self) {
            $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"><ul class="nav nav-tabs" role="tablist"></ul><div class="tab-content"></div></div>');
            $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + this.buildEntity(data.self, false) + '</div>');
            const visible = this.options.atts.visible || [];
            const hidden = this.options.atts.hidden || [];
            if (data.self.extra) {
                let html = '';
                for (const i in data.self.extra) {
                    if (data.self.extra.hasOwnProperty(i)) {
                        const extra = data.self.extra[i];
                        if ((visible.length && _.indexOf(visible, extra.k) >= 0) || (hidden.length && _.indexOf(hidden, extra.k) < 0) || (!visible.length && !hidden.length)) {
                            html += this.buildExtra(extra);
                        }
                    }
                }
                const id = 'hiekn-infobox-' + new Date().getTime() + '-' + data.self.id;
                $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation" class="active"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">基本信息</a></li>');
                $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-detail tab-pane active" id="' + id + '"><table><tbody>' + html + '</tbody></table></div>');
            }
            if (data.pars) {
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                for (const k in data.pars) {
                    if (data.pars.hasOwnProperty(k)) {
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + this.buildEntity(data.pars[k], true) + '</li>');
                    }
                }
            }
            if (data.sons) {
                let html = '';
                for (const l in data.sons) {
                    if (data.sons.hasOwnProperty(l)) {
                        html += '<li>' + this.buildEntity(data.sons[l], true) + '</li>';
                    }
                }
                const id = 'hiekn-infobox-' + new Date().getTime() + '-sons-' + data.self.id;
                $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">子节点</a></li>');
                $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
            }
            if (data.atts) {
                for (const m in data.atts) {
                    if (data.atts.hasOwnProperty(m)) {
                        const att = data.atts[m];
                        let html = '';
                        for (const j in att.v) {
                            if (att.v.hasOwnProperty(j)) {
                                html += '<li>' + this.buildEntity(att.v[j], true) + '</li>';
                            }
                        }
                        if ((visible.length && _.indexOf(visible, att.k) >= 0) || (hidden.length && _.indexOf(hidden, att.k) < 0) || (!visible.length && !hidden.length)) {
                            const id = 'hiekn-infobox-' + new Date().getTime() + '-att-' + m + '-' + data.self.id;
                            $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">' + att.k + '</a></li>');
                            $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
                        }
                    }
                }
            }
        } else {
            $infoxbox.append('InfoBox读取错误');
        }
        return $infoxbox;
    }
}
interface HieknPromptSetting extends HieknBaseSetting {
    kgName?: string;
    beforeDrawPrompt?: Function;
    container?: string;
    ready?: Function;
    group?: boolean;
    replaceSearch?: boolean;
    onSearch?: Function;
    promptType?: 0 | 1;
    schemaSetting?: HieknSchemaSetting;
}

interface HieknPromptRequestSetting extends HieknPromptSetting {
    paramName?: string;
    url?: string;
    type?: 'GET' | 'POST';
}

class HieknSDKPrompt {
    defaults: HieknPromptSetting = {
        ready: $.noop,
        group: false,
        replaceSearch: false,
        onSearch: $.noop,
        promptType: 0
    };
    instance: any;
    options: HieknPromptSetting;

    constructor(options: HieknPromptSetting) {
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }

    private init() {
        let schemaSetting: HieknSchemaSetting = $.extend(true, {kgName: this.options.kgName}, this.options, this.options.schemaSetting);
        schemaSetting.success = ((schema: HieknSchema) => {
            let promptSettings: any;
            if (this.options.promptType === 0) {
                promptSettings = {
                    drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                    onPrompt: HieknSDKPrompt.onPrompt(this.options)
                };
            } else {
                promptSettings = {
                    drawPromptItem: HieknSDKPrompt.drawPromptKnowledgeItem(),
                    onPrompt: HieknSDKPrompt.onPromptKnowledge(this.options)
                };
            }
            if (this.options.group) {
                promptSettings.drawPromptItems = this.drawPromptItems(schema);
            }
            if (this.options.replaceSearch) {
                promptSettings.beforeSearch = (selectedItem: any, $container: JQuery) => {
                    if (selectedItem) {
                        $container.find('input[type=text]').val(selectedItem.name);
                    }
                };
            }
            $.extend(true, promptSettings, this.options);
            this.instance = new hieknPrompt(promptSettings);
            this.options.ready(this.instance);
        });
        HieknSDKSchema.load(schemaSetting);
    }

    static drawPromptItem(schema: HieknSchema) {
        let typeObj = {};
        for (const type of schema.types) {
            typeObj[type.k] = type.v;
        }
        return (data: any, pre: string) => {
            let title = data.name;
            if (data.meaningTag) {
                title = title + ' ( ' + data.meaningTag + ' )';
            }
            let line = '<span class="prompt-tip-title">' + title.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
            line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (data.className || typeObj[data.classId] || '') + '</span>' + line;
            return line;
        }
    }

    static drawPromptKnowledgeItem() {
        let typeObj = {
            0: '概念',
            1: '实例'
        };
        return (data: any, pre: string) => {
            let line = '<span class="prompt-tip-title">' + data.name.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
            line = '<span class="prompt-tip-type prompt-tip-' + data.kgType + '">' + (typeObj[data.kgType] || '') + '</span>' + line;
            return line;
        }
    }

    drawPromptItems(schema: HieknSchema) {
        let typeObj = {};
        for (const type of schema.types) {
            typeObj[type.k] = type.v;
        }
        return (data: any, pre: string) => {
            const $container = $('<div></div>');
            for (const v of data) {
                const text = this.instance.options.drawPromptItem(v, pre);
                const title = this.instance.options.drawItemTitle(v);
                const cls = 'prompt-item-' + v.classId;
                const $li = $('<li title="' + title + '" class="' + cls + '">' + text + '</li>').data('data', v);
                const ex = $container.find('.' + cls);
                if (ex.length) {
                    $(ex[ex.length - 1]).after($li);
                    $li.find('.prompt-tip-type').empty();
                } else {
                    $container.append($li);
                }
            }
            return $container.children();
        }
    }

    static onPromptStart(options: HieknPromptRequestSetting) {
        return (pre: string, $self: any) => {
            const queryData = options.queryData || {};
            let formData = options.formData || {};
            formData[options.paramName] = pre;
            formData.kgName = options.kgName;
            HieknSDKUtils.ajax({
                url: HieknSDKUtils.buildUrl(options.url, queryData),
                type: options.type,
                data: formData,
                dataFilter: options.dataFilter,
                success: (data: any) => {
                    if ($self.prompt == formData[options.paramName]) {
                        let d = data;
                        options.beforeDrawPrompt && (d = options.beforeDrawPrompt(d, pre));
                        $self.startDrawPromptItems(d, pre);
                    }
                }
            });
        }
    }

    static onPrompt(options: HieknPromptSetting) {
        let reqOptions: HieknPromptRequestSetting = options;
        reqOptions.paramName = 'kw';
        reqOptions.url = options.baseUrl + 'prompt';
        reqOptions.type = 'POST';
        return HieknSDKPrompt.onPromptStart(reqOptions);
    }

    static onPromptKnowledge(options: HieknPromptSetting) {
        let reqOptions: HieknPromptRequestSetting = options;
        reqOptions.paramName = 'text';
        reqOptions.url = options.baseUrl + 'prompt/knowledge';
        reqOptions.type = 'GET';
        return HieknSDKPrompt.onPromptStart(options);
    }
}

interface HieknResourceSetting extends HieknBaseSetting {
    beforeLoad?: Function,
    container?: string,
    config: HieknTableConfigSetting,
    onLoad?: Function
}

class HieknSDKResource {
    options: HieknResourceSetting;
    tableService: HieknSDKTable;
    query: any;

    constructor(options: HieknResourceSetting) {
        this.options = options;
        this.init();
    }

    private getQuery() {
        let must = [];
        const filter = this.tableService.getFilterOptions();
        for (const key in filter) {
            let should = [];
            const value = filter[key];
            const filterConfig = _.find(this.options.config.filter, ['key', key]);
            if (filterConfig.type == 'year' || filterConfig.type == 'month') {
                for (const year of value) {
                    let from = '';
                    let to = '';
                    if (filterConfig.type == 'year') {
                        from = moment(year + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                        to = moment((parseInt(year, 10) + 1) + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                    } else {
                        from = moment(year + '-01').format(filterConfig.format || 'YYYY-MM');
                        to = moment((parseInt(year, 10) + 1) + '-01').format(filterConfig.format || 'YYYY-MM');
                    }
                    let obj = {};
                    obj[key] = {
                        from: from,
                        to: to,
                        include_lower: true,
                        include_upper: false
                    };
                    should.push({
                        range: obj
                    });
                }
            } else {
                let obj = {};
                obj[key] = value;
                should.push({
                    terms: obj
                });
            }
            must.push({
                bool: {
                    should: should,
                    minimum_should_match: 1
                }
            });
        }
        const kw = this.tableService.getFilterKw();
        if (kw) {
            let should = [];
            const fields = this.options.config.fieldsKw || this.options.config.fieldsTable || this.options.config.fields;
            let obj = {
                query: kw,
                fields: fields
            };
            should.push({
                query_string: obj
            });
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
    }

    private init() {
        const config = {
            config: this.options.config,
            container: this.options.container,
            load: (pageNo: number, instance: HieknSDKTable) => {
                this.load(pageNo, instance);
            }
        };
        this.tableService = new HieknSDKTable(config);
    }

    private load(pageNo: number, instance: HieknSDKTable) {
        this.query = this.getQuery();
        this.options.beforeLoad && this.options.beforeLoad(this);
        const config = this.options.config;
        const queryData = this.options.queryData || {};
        let formData = this.options.formData || {};
        formData.databases = config.databases;
        formData.tables = config.tables;
        formData.fields = config.fields;
        formData.query = JSON.stringify(this.query);
        formData.pageNo = pageNo;
        formData.pageSize = formData.pageSize || 15;
        const $container = instance.getTableContainer();
        $container.empty();
        let newOptions = {
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'search', queryData),
            type: 'POST',
            data: formData,
            dataFilter: this.options.dataFilter,
            success: (rsData: any, textStatus: string, jqXHR: JQueryXHR, data: any, params: any) => {
                if (data) {
                    instance.drawPage(data.rsCount, params.pageNo, params.pageSize);
                    instance.drawData(data.rsData);
                } else {
                    instance.drawPage(0, params.pageNo, params.pageSize);
                }
                this.options.onLoad && this.options.onLoad(data, this);
            },
            error: (data: any,textStatus: string, jqXHR: JQueryXHR, errorThrown: string, params: any) => {
                instance.drawPage(0, params.pageNo, params.pageSize);
            },
            that: $container[0]
        };
        HieknSDKUtils.ajax(newOptions);
    }

    loadData(pageNo: number) {
        this.tableService.loadData(pageNo);
    }
}
interface HieknResourcesSetting extends HieknBaseSetting {
    beforeLoad?: Function;
    container: string;
    configs: HieknTableConfigSetting[];
    namespace?: string;
    onLoad?: Function;
}

class HieknSDKResources {
    resourcesService: HieknSDKResource[] = [];
    options: HieknResourcesSetting;
    $container: JQuery;
    $headContainer: JQuery;
    $bodyContainer: JQuery;

    constructor(options: HieknResourcesSetting) {
        this.options = options;
        this.init(this.options.namespace);
    }

    private bindEvent() {
        this.$headContainer.find('.hiekn-resource-nav-more').on('click', () => {
            this.$headContainer.find('.hiekn-resource-nav-more-container').toggleClass('hide');
        });

        this.$headContainer.on('shown.bs.tab', 'a[data-toggle="tab"]', () => {
            const href = $(this).attr('href');
            this.$headContainer.find('.hiekn-resource-nav a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
            this.$headContainer.find('.hiekn-resource-nav-hide-tabs a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
        });

        $('body').on('click', (event) => {
            if (!$(event.target).closest('.hiekn-resource-nav-more-container,.hiekn-resource-nav-more').length) {
                this.$headContainer.find('.hiekn-resource-nav-more-container').addClass('hide');
            }
        });

        $(window).on('resize', () => {
            this.updateTabVisibility();
        });
    }

    private init(namespace = 'hiekn-resource') {
        this.$container = $(this.options.container);
        this.$headContainer = $('<div class="hiekn-resource-nav-container">' +
            '<ul class="hiekn-resource-nav nav nav-tabs" role="tablist"></ul>' +
            '<div class="hiekn-resource-nav-more hide">更多</div>' +
            '<div class="hiekn-resource-nav-more-container hide">' +
            '<ul class="hiekn-resource-nav-hide-tabs"></ul>' +
            '</div>' +
            '</div>');
        this.$bodyContainer = $('<div class="hiekn-resource-container tab-content"></div>');
        this.$container.append(this.$headContainer);
        this.$container.append(this.$bodyContainer);
        const $navContainer = this.select('.hiekn-resource-nav-container ul.hiekn-resource-nav');
        const $navHideContainer = this.select('.hiekn-resource-nav-container ul.hiekn-resource-nav-hide-tabs');
        let allW = 0;
        for (const i in this.options.configs) {
            const cls = i == '0' ? 'active' : '';
            const id = namespace + '-tab-' + i + '-' + new Date().getTime();
            const $resourceContainer = $('<div role="tabpanel" class="tab-pane ' + cls + '" id="' + id + '"></div>');
            this.$bodyContainer.append($resourceContainer);
            let config = $.extend(true, {}, this.options);
            config.config = this.options.configs[i];
            config.container = $resourceContainer;
            config.onLoad = (data: any, instance: HieknSDKResource) => {
                const id = instance.tableService.$container.attr('id');
                this.$headContainer.find('a[href="#' + id + '"] .res-count').text(data.rsCount || 0);
                this.options.onLoad && this.options.onLoad(data, instance);
            };
            delete config.namespace;
            delete config.configs;
            this.resourcesService.push(new HieknSDKResource(config));
            const tab = '<li role="presentation" class="' + cls + '">' +
                '<a href="#' + id + '" aria-controls="" role="tab" data-toggle="tab">' +
                '<span class="res-name" title="' + config.config.name + '">' + config.config.name + '</span>' +
                '<span class="res-count"></span>' +
                '</a></li>';
            $navContainer.append(tab);
            $navHideContainer.append(tab);
            allW += $navContainer.find('li:last-child').width();
        }
        $navContainer.css('width', allW);
        this.updateTabVisibility();
        this.bindEvent();
    }

    loadData(pageNo: number) {
        for (const resourcesService of this.resourcesService) {
            resourcesService.loadData(pageNo);
        }
    }

    select(selector: string) {
        return this.$container.find(selector);
    }

    updateTabVisibility() {
        const $container = this.$headContainer;
        const cw = $container.width();
        const $navContainer = $container.find('.nav');
        const tw = $navContainer.width();
        const $nm = $container.find('.hiekn-resource-nav-more');
        if (cw < tw) {
            $nm.removeClass('hide');
        } else {
            $nm.addClass('hide');
            $container.find('.hiekn-resource-nav-more-container').addClass('hide');
        }
        let w = 0;
        const nmw = $nm.outerWidth();
        const $hideTabs = $container.find('.hiekn-resource-nav-hide-tabs>li');
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
    }
}
interface HieknSchemaAtts {
    k: number;
    v: string;
    type: 0 | 1;
}

interface HieknSchemaTypes {
    k: number;
    v: string;
}

interface HieknSchema {
    atts: HieknSchemaAtts[];
    types: HieknSchemaTypes[];
}

interface HieknSchemaSetting extends HieknAjaxSetting {
    kgName?: string
}

class HieknSDKSchema {
    static load(options: HieknSchemaSetting) {
        let queryData = options.queryData || {};
        let formData = $.extend(true, {kgName: options.kgName}, options.formData);
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'schema', queryData),
            type: 'POST',
            data: formData,
            beforeSend: () => {
                options.that && $(options.that).find('.ajax-loading').html(HieknSDKUtils.loadingHTML);
            },
            success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
                options.success(data[0], textStatus, jqXHR);
            }
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
interface HieknSegmentSetting extends HieknAjaxSetting {
}

class HieknSDKSegment {
    static defaults: HieknSegmentSetting = {
        queryData:{
            useConcept: true,
            useEntity: true,
            useAttr: true
        }
    };

    static load(options: HieknSegmentSetting) {
        options = $.extend(true, HieknSDKSegment.defaults, options);
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'segment', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
type HieknTableRendererFunction = (value: any, data: any) => string;
type HieknTableRendererType = 'date' | 'link' | 'year' | 'dateTime' | 'json' | 'string' | HieknTableRendererFunction;
type HieknTableRendererComplex = { type: HieknTableRendererType, array?: boolean, fields?: string[], name?: string };
type HieknTableRenderer = { [key: string]: HieknTableRendererType | HieknTableRendererComplex };
type HieknTableFilterType = 'year' | 'month' | 'day';
type HieknTableFilterOption = string | { key: string, value: string } | HieknKVType;

interface HieknTableFilter {
    key: string;
    label?: string;
    type?: HieknTableFilterType;
    format?: string;
    options: HieknTableFilterOption[];
}

interface HieknTableConfigSetting {
    name: string;
    databases: string[];
    tables: string[];
    fields: string[];
    fieldsName?: string[];
    fieldsTable?: string[];
    fieldsTableName?: string[];
    fieldsDetail?: string[];
    fieldsDetailName?: string[];
    fieldsKw?: string[];
    drawDetail?: boolean;
    fieldsRenderer?: HieknTableRenderer;
    filter?: HieknTableFilter[];
}

interface HieknTableSetting extends HieknBaseSetting {
    container: string;
    config: HieknTableConfigSetting;
    load: Function
}

class HieknSDKTable {
    $container: JQuery;
    data: any;
    options: HieknTableSetting;

    constructor(options: HieknTableSetting) {
        this.options = options;
        this.init();
    }

    private buildFilter() {
        let filterHtml = '';
        const filters = this.options.config.filter;
        for (const filter of filters) {
            const label = filter.label || filter.key;
            let filterOptions = '';
            for (const item of filter.options) {
                if (item instanceof Object) {
                    if ((<any>item).key !== undefined && (<any>item).value !== undefined) {
                        let option = <{ key: string, value: string }>item;
                        filterOptions += '<span option-value="' + option.value + '" option-key="' + option.key + '">' + option.key + '</span>';
                    } else {
                        let option = <{ [key: string]: string }>item;
                        for (const key in option) {
                            filterOptions += '<span option-value="' + option[key] + '" option-key="' + key + '">' + option[key] + '</span>';
                        }
                    }
                } else {
                    filterOptions += '<span option-value="' + item + '" option-key="' + filter.key + '">' + item + '</span>';
                }
            }
            filterHtml += '<div class="hiekn-table-filter-item">' +
                '<div class="hiekn-table-filter-item-label">' + label + '：</div>' +
                '<div class="hiekn-table-filter-item-content">' + filterOptions + '' +
                '<div class="hiekn-table-more-container">' +
                '<span class="hiekn-table-filter-more">更多 <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg></span>' +
                '<span class="hiekn-table-filter-less">收起 <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg></span>' +
                '<span class="hiekn-table-filter-multi"><svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> 多选</span>' +
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
        this.select('.hiekn-table-filter').html(filterHtml);
    }

    private bindFilterEvent() {
        this.select('.hiekn-table-filter').on('click', 'span[option-value]', (event: Event) => {
            const $item = $(event.currentTarget);
            const key = $item.attr('option-key');
            const value = $item.attr('option-value');
            if ($item.closest('.hiekn-table-filter-item').hasClass('multi')) {
                $item.toggleClass('active');
            } else {
                if (!$item.hasClass('active')) {
                    $item.addClass('active').siblings('.active').removeClass('active');
                } else {
                    $item.removeClass('active');
                }
                this.loadData(1);
            }
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-more', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').addClass('expend');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-less', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('expend');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-multi', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').addClass('multi');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-confirm', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('multi');
            this.loadData(1);
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-cancel', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('multi');
        });
        this.select('.hiekn-table-search-kw-container').on('keydown', 'input', (event: Event) => {
            const key = window.event ? (<KeyboardEvent>event).keyCode : (<KeyboardEvent>event).which;
            if (key == 13) {
                this.loadData(1);
            }
        });
    }

    private bindTableEvent() {
        this.select('.hiekn-table-content').on('click', '.hiekn-table-data-angle', (event: Event) => {
            $(event.currentTarget).toggleClass('on').closest('tr').next('tr.hiekn-table-detail-line').toggleClass('hide');
        });
    }

    private static dealContent(d: string, len = 80) {
        if (d) {
            let text = $('<div>' + d + '</div>').text();
            if (text.length > len) {
                return text.substring(0, len) + '...';
            } else {
                return text;
            }
        } else {
            return '';
        }
    }

    drawData(data: any) {
        const config = this.options.config;
        this.data = data;
        let ths = '<thead><tr>';
        let trs = '<tbody>';
        const fields = config.fieldsTable || config.fields;
        const fieldsName = config.fieldsTableName ? config.fieldsTableName : (config.fieldsName ? config.fieldsName : fields);
        const drawDetail = config.drawDetail || config.fieldsDetail || config.fieldsTable;
        const fieldsDetail = config.fieldsDetail || config.fields;
        const fieldsNameDetail = config.fieldsDetailName ? config.fieldsDetailName : (config.fieldsName ? config.fieldsName : fields);
        const fieldsRenderer = config.fieldsRenderer || {};
        let fieldsLink: HieknKVType = {};
        if (drawDetail) {
            ths += '<th></th>';
        }
        for (const fidx in fields) {
            const renderer = fieldsRenderer[fields[fidx]];
            if (renderer && renderer instanceof Object && (<HieknTableRendererComplex>renderer).type == 'link' && (<HieknTableRendererComplex>renderer).fields) {
                for (const f of (<HieknTableRendererComplex>renderer).fields) {
                    fieldsLink[f] = fields[fidx];
                }
                continue;
            }
            ths += '<th>' + fieldsName[fidx] + '</th>';
        }
        for (const d of data) {
            let tr = '<tr>';
            if (drawDetail) {
                tr += '<td class="hiekn-table-data-angle"><svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg></td>';
            }
            let len = 0;
            for (const k of fields) {
                len++;
                if (!fieldsRenderer[k] || !(<HieknTableRendererComplex>fieldsRenderer[k]).fields) {
                    tr += '<td>' + HieknSDKTable.rendererFields(d, k, fieldsLink, fieldsRenderer, true) + '</td>';
                }
            }
            tr += '</tr>';
            trs += tr;
            if (drawDetail) {
                let trDetail = '<tr class="hiekn-table-detail-line hide"><td colspan="' + (len + 1) + '">';
                for (const i in fieldsDetail) {
                    const k = fieldsDetail[i];
                    if (!fieldsRenderer[k] || !(<HieknTableRendererComplex>fieldsRenderer[k]).fields) {
                        trDetail += '<div class="hiekn-table-detail-' + k + '"><label>' + fieldsNameDetail[i] + ':</label>' + HieknSDKTable.rendererFields(d, k, fieldsLink, fieldsRenderer, false) + '</div>';
                    }
                }
                trDetail += '</td></tr>';
                trs += trDetail;
            }
        }
        trs += '</body>';
        ths += '</tr></thead>';
        this.select('.hiekn-table-content').html('<table class="hiekn-table-normal">' + ths + trs + '</table>');
    }

    drawPage(count: number, pageNo: number, pageSize: number) {
        const options = {
            totalItem: count,
            pageSize: pageSize,
            current: pageNo,
            selector: this.select('.pagination'),
            callback: (data: any, pageNo: number) => {
                this.loadData(pageNo);
            }
        };
        HieknSDKUtils.drawPagination(options);
    };

    getFilterKw() {
        return this.select('.hiekn-table-search-kw-container').find('input').val();
    }

    getFilterOptions() {
        let filterOptions = {};
        this.select('.hiekn-table-filter-item').each((i: number, v: HTMLElement) => {
            let key = '';
            const $items = $(v).find('span[option-value].active');
            if ($items.length) {
                let hasAll = false;
                let value: string[] = [];
                $items.each((j: number, e: HTMLElement) => {
                    const ov = $(e).attr('option-value');
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
    }

    getTableContainer() {
        return this.select('.hiekn-table-content');
    }

    private static getValues(value: any) {
        let values = [];
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
    }

    private init() {
        this.$container = $(this.options.container).addClass('hiekn-table');
        this.$container.append('<div class="hiekn-table-filter">' +
            '</div>' +
            '<div class="hiekn-table-content"></div>' +
            '<div class="hiekn-table-page">' +
            '<div class="pagination-outter">' +
            '<ul class="pagination"></ul>' +
            '</div>' +
            '</div>');
        this.buildFilter();
        this.bindFilterEvent();
        this.bindTableEvent();
    }

    loadData(pageNo: number) {
        this.options.load(pageNo, this);
    }

    private static rendererDate(v: string) {
        return moment(v).format('YYYYMMDD');
    }

    private static rendererDateTime(v: string) {
        return moment(v).format('YYYY-MM-DD HH:mm:ss');
    }

    private static rendererFields(d: any, k: string, fieldsLink: HieknKVType, fieldsRenderer: HieknTableRenderer, short: boolean) {
        let str = '';
        if (d[k]) {
            const values = HieknSDKTable.getValues(d[k]);
            for (const value of values) {
                if (!fieldsRenderer[k]) {
                    str += ',' + HieknSDKTable.rendererValue('string', value, undefined, short, d);
                } else {
                    str += ',' + HieknSDKTable.rendererValue((<HieknTableRendererComplex>fieldsRenderer[k]).type || <HieknTableRendererType>fieldsRenderer[k], value, <HieknTableRendererComplex>fieldsRenderer[k], short, d);
                }
            }
            str = str.substring(1);
        }
        if (fieldsLink[k]) {
            let name = d[k];
            if (!d[k]) {
                name = '链接';
            }
            str = HieknSDKTable.rendererLink(d[fieldsLink[k]], name);
        }
        return str;
    }

    private static rendererLink(v: string, name = '查看', cls = '') {
        return v ? '<a href="' + v + '" target="_blank" class="' + cls + '">' + name + '</a>' : '';
    }

    private static rendererValue(type: HieknTableRendererType, value: any, fieldsRenderer: HieknTableRendererComplex, short: boolean, data: any) {
        let str = '';
        try {
            if (type == 'year') {
                str = HieknSDKTable.rendererYear(value);
            } else if (type == 'date') {
                str = HieknSDKTable.rendererDate(value);
            } else if (type == 'dateTime') {
                str = HieknSDKTable.rendererDateTime(value);
            } else if (type == 'json') {
                str = JSON.stringify(value);
            } else if (type == 'link') {
                str = HieknSDKTable.rendererLink(value, fieldsRenderer.name, 'hiekn-table-btn-link');
            } else if (type == 'string' && short) {
                str = HieknSDKTable.dealContent(value);
            } else if (type instanceof Function) {
                str = type(value, data);
            } else {
                str = HieknSDKUtils.safeHTML(value);
            }
        } catch (e) {

        }
        return str;
    }

    private static rendererYear(v: string) {
        return moment(v).format('YYYY');
    }

    private select(selector: string) {
        return this.$container.find(selector);
    }

}
interface HieknTaggingSetting extends HieknAjaxSetting {
}

class HieknSDKTagging {
    static load(options: HieknTaggingSetting) {
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'tagging', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
type HieknIdType = number | string;
type HieknKVType = { [key: string]: string };
type JQueryAjaxSuccess = (data: any, textStatus: string, jqXHR: JQueryXHR) => any;
type JQueryAjaxDataFilter = (data: any, ty: any) => any;

interface HieknBaseSetting {
    baseUrl?: string;
    dataFilter?: JQueryAjaxDataFilter;
    formData?: any;
    queryData?: any;
}

interface HieknKV {
    k: string;
    v: string;
}

interface HieknAjaxSetting extends JQueryAjaxSettings {
    baseUrl?: string;
    formData?: any;
    queryData?: any;
    that?: HTMLElement;
}

class HieknSDKUtils {
    static VERSION = '3.0.0';
    static regChinese = /^[\u4e00-\u9fa5]$/;
    static regEnglish = /^[a-zA-Z]$/;
    static colorBase = ['#7bc0e1',
        '#9ec683',
        '#fde14d',
        '#ab89f4',
        '#e26f63',
        '#dca8c6',
        '#596690',
        '#eaad84',
        '#abe8bf',
        '#7979fc'];
    static colorEx = ['#6db5d6',
        '#d0648a',
        '#c0d684',
        '#f2bac9',
        '#847d99',
        '#baf2d8',
        '#bfb3de',
        '#f4817c',
        '#94cdba',
        '#b2cede'];
    static color = HieknSDKUtils.colorBase.concat(HieknSDKUtils.colorEx);
    static loadingHTML = `<div class="schema-init">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 14 32 18" width="32" height="4" preserveAspectRatio="none">
        <path opacity="0.8" transform="translate(0 0)" d="M2 14 V18 H6 V14z">
        <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>
        <path opacity="0.5" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
        <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.1s" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>
        <path opacity="0.25" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
        <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.2s" repeatCount="indefinite"
         keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>
        </svg>
        </div>`;

    static ajax(options: any) {
        let error = options.error || $.noop;
        let type = options.type;
        switch (type) {
            case 'GET':
                type = 0;
                break;
            case 'POST':
                type = 1;
                break;
        }
        let newOptions = {
            type: type,
            dataFilter: options.dataFilter || HieknSDKUtils.dataFilter,
            params: options.data,
            success: (data: any, textStatus: string, jqXHR: JQueryXHR, params: any) => {
                if (data && data.rsData) {
                    options.success(data.rsData, textStatus, jqXHR, data, params);
                } else {
                    error(data, textStatus, jqXHR, null, params);
                }
            },
            error: (xhr: JQueryXHR, textStatus: string, errorThrown: string) => {
                error(null, textStatus, xhr, errorThrown);
            },
        };
        newOptions = $.extend(true, {}, options, newOptions);
        hieknjs.kgLoader(newOptions);
    }

    static buildUrl(url: string, queryData: any) {
        if (queryData && !$.isEmptyObject(queryData)) {
            const link = url.indexOf('?') > 0 ? '&' : '?';
            return url + link + $.param(queryData);
        } else {
            return url;
        }
    }

    static dataFilter(data: any) {
        return data;
    }

    static drawPagination(options: any) {
        $.extend(true, options, {
            data: Math.ceil(options.totalItem / options.pageSize),
            cur: options.current,
            p: options.selector,
            event: options.callback
        });
        hieknjs.gentPage(options);
    }

    static error(msg: string) {
        toastr.error(msg);
    }

    static getVersion(){
        return HieknSDKUtils.VERSION;
    }

    static info(msg: string) {
        toastr.info(msg);
    }

    static qiniuImg(img: string) {
        return img + '?_=' + Math.floor(new Date().getTime() / 3600000);
    }

    static randomId(prefix = '', postfix = '', append = '') {
        return prefix + (append ? append : new Date().getTime() + Math.ceil(Math.random() * 10000)) + postfix;
    }

    static safeHTML(value: string) {
        return hieknjs.safeHTML(value)
    }

    static dealNull(data: any) {
        return hieknjs.dealNull(data);
    }
}

class HieknSDKService {

    schema(options: any, callback: JQueryAjaxSuccess) {
        let newOptions:HieknSchemaSetting = $.extend(true, {}, options, {
            queryData: options.data || {},
            formData: options.data2 || {},
            success: callback
        });
        HieknSDKSchema.load(newOptions);
    }

    association(options: any, callback: JQueryAjaxSuccess) {
        let formData = $.extend(true, {}, options.data2 || {}, {
            allowAtts: options.allowAtts,
            id: options.id,
            pageSize: options.pageSize
        });
        let newOptions = {
            queryData: options.data || {},
            formData: formData,
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKAssociation.load(newOptions);
    }

    tagging(options: any, callback: JQueryAjaxSuccess) {
        let queryData = $.extend(true, {}, options.data || {}, {
            kw: options.kw
        });
        let newOptions = {
            queryData: queryData,
            formData: options.data2 || {},
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKTagging.load(newOptions);
    }

    disambiguate(options: any, callback: JQueryAjaxSuccess) {
        let queryData = $.extend(true, {}, options.data || {}, {
            kw: options.kw
        });
        let newOptions = {
            queryData: queryData,
            formData: options.data2 || {},
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKDisambiguate.load(newOptions);
    }

    segment(options: any, callback: JQueryAjaxSuccess) {
        let queryData = $.extend(true, {}, options.data || {}, {
            kw: options.kw
        });
        let newOptions = {
            queryData: queryData,
            formData: options.data2 || {},
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKSegment.load(newOptions);
    }

    static updateOptionsData(options: any) {
        options.formData = options.formData || options.data2 || {};
        options.queryData = options.queryData || options.data || {};
        return options;
    }
}

class HieknNetChartUpdateService {

    static updateOptions(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        options.infoboxSetting = {enable:options.infobox};
        options.enableAutoUpdateStyle != undefined && (options.autoUpdateStyle = options.enableAutoUpdateStyle);
        return options;
    }
}

class HieknGraphService extends HieknSDKGraph {

    protected beforeInit(options: HieknNetChartSetting) {
        super.beforeInit(HieknNetChartUpdateService.updateOptions(options));
    }
}

class HieknTimingGraphService extends HieknSDKTiming {

    protected beforeInit(options: HieknNetChartSetting) {
        super.beforeInit(HieknNetChartUpdateService.updateOptions(options));
    }
}

class HieknPathService extends HieknSDKPath {

    protected beforeInit(options: HieknNetChartSetting) {
        super.beforeInit(HieknNetChartUpdateService.updateOptions(options));
    }
}

class HieknRelationService extends HieknSDKRelation {

    protected beforeInit(options: HieknNetChartSetting) {
        super.beforeInit(HieknNetChartUpdateService.updateOptions(options));
    }
}

class HieknInfoboxService extends HieknSDKInfobox {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        options.changeInfobox = options.href;
        super(options);
    }
}

class HieknPromptService extends HieknSDKPrompt {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        options.promptType = 0;
        super(options);
    }
}

class HieknConceptPromptService extends HieknSDKPrompt {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        options.promptType = 1;
        super(options);
    }
}

class HieknConceptGraphService extends HieknSDKConceptGraph {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        super(options);
    }
}

class HieknTableService extends HieknSDKTable {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        super(options);
    }
}

class HieknResourceService extends HieknSDKResource {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        super(options);
    }
}

class HieknResourcesService extends HieknSDKResources {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        super(options);
    }
}

class HieknConceptTreeService extends HieknSDKConceptTree {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        options.nodeHoverTools.infoboxSetting = options.nodeHoverTools.infobox;
        options.nodeHoverTools.graphSetting = options.nodeHoverTools.graph;
        options.nodeHoverTools.graphSetting.infoboxSetting = options.nodeHoverTools.graphSetting.infobox;
        super(options);
    }
}

class HieknStatService {
    constructor(options: any) {
        options = HieknSDKService.updateOptionsData(options);
        $.extend(true, options.formData, options.config.querySettings);
        options.formDataUpdater = options.beforeLoad; //TODO
        const type = options.config.type;
        if (type == 'pie') {
            return new HieknSDKStatPie(options);
        } else if (type == 'line' || type == 'bar') {
            return new HieknSDKStatLineBar(options);
        } else if (type == 'wordCloud') {
            return new HieknSDKStatWordCloud(options);
        } else if (type == 'radar') {
            return new HieknSDKStatRadar(options);
        } else if (type == 'scatter') {
            return new HieknSDKStatScatter(options);
        } else if (type == 'map') {
            return new HieknSDKStatMap(options);
        }
    }
}
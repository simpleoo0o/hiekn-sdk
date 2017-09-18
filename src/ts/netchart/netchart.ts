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
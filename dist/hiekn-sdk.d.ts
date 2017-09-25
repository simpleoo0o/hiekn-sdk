/// <reference types="jquery" />
declare type HieknTypeNE = {
    normal: string;
    emphases: string;
};
declare type HieknTypeUnionStringNE = string | HieknTypeNE;
declare type HieknTypeUnionMap = {
    [key: string]: HieknTypeUnionStringNE;
};
declare type HieknTypeStartInfo = Tgc2StartInfo | Tgc2PathStartInfo | Tgc2RelationStartInfo;
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
declare abstract class HieknSDKNetChart {
    isInit: boolean;
    isTiming: boolean;
    options: HieknNetChartSetting;
    baseSettings: HieknBaseSetting;
    promptSettings: HieknPromptSetting;
    filterSettings: HieknNetChartFilterSetting;
    infoboxSettings: HieknNetChartInfoboxSetting;
    loaderSettings: HieknNetChartLoaderSetting;
    nodeSettings: HieknNetChartNodeSetting;
    schemaSettings: HieknSchemaSetting;
    initSettings: HieknNetChartInitSetting;
    defaultTgc2Options: any;
    tgc2Settings: HieknTgc2Setting;
    tgc2: Tgc2;
    tgc2Filter: Tgc2Filter;
    tgc2Crumb: Tgc2Crumb;
    tgc2Find: Tgc2Find;
    tgc2Legend: Tgc2Legend;
    infoboxService: HieknSDKInfobox;
    legendFilter: {
        [key: number]: boolean;
    };
    layoutStatus: boolean;
    centerNode: ItemsChartNode;
    centerNodeRadius: number;
    defaultColor: string;
    constructor(options: HieknNetChartSetting);
    load(startInfo: HieknTypeStartInfo): void;
    protected beforeInit(options: HieknNetChartSetting): void;
    protected graphInit(options: HieknNetChartInitSetting): void;
    protected gentInfobox(options: HieknNetChartInfoboxSetting): void;
    protected infobox(data: any, node: any, callback: Function): string;
    protected init(options: HieknNetChartSetting, schema: HieknSchema): void;
    protected legend(schema: HieknSchema): (key: string, value: string) => string;
    protected legendClick(e: MouseEvent): void;
    protected legendDblClick(e: MouseEvent): void;
    protected legendDraw(schema: HieknSchema, legendType: string): (data: any, $container: JQuery) => void;
    protected legendMouseEnter(e: MouseEvent): void;
    protected legendMouseLeave(e: MouseEvent): void;
    protected loader(options: HieknNetChartLoaderSetting, schema: HieknSchema): ($self: any, callback: Function, failed: Function) => void;
    protected nodeFilter(nodeData: HieknNetChartDataNode): boolean;
    protected nodeStyleFunction(options: HieknNetChartNodeSetting): (node: Tgc2ChartNode) => void;
    protected updateStyle(): void;
    protected static buildFilter(schema: HieknSchema, options: HieknNetChartFilterSetting): {
        key: string;
        label: string;
        selected: number[];
        options: {
            value: number;
            label: string;
        }[];
    }[];
    protected static dealGraphData(data: any, schema: HieknSchema): any;
    protected static getHieknTypeUnionMapValue(value: HieknTypeUnionStringNE, type?: string): HieknTypeUnionStringNE;
    protected static linkContentsFunction(linkData: Tgc2DataLink): string;
    protected static orderRelation(data: any): {
        k: string;
        v: any;
    }[];
    protected abstract buildLoaderParams(options: HieknNetChartLoaderSetting): {
        queryData: any;
        formData: any;
        url: string;
    };
    protected abstract buildPrivateSetting(schema: HieknSchema): void;
}
declare class HieknSDKGraph extends HieknSDKNetChart {
    tgc2Prompt: Tgc2Prompt;
    tgc2Page: Tgc2Page;
    protected buildPrivateSetting(schema: HieknSchema): void;
    protected buildLoaderParams(options: HieknNetChartLoaderSetting): {
        queryData: any;
        formData: any;
        url: string;
    };
}
declare class HieknSDKPath extends HieknSDKNetChart {
    tgc2Stats: Tgc2Stats;
    tgc2Connects: Tgc2Connects;
    protected buildPrivateSetting(schema: HieknSchema): void;
    protected buildLoaderParams(options: HieknNetChartLoaderSetting): {
        queryData: any;
        formData: any;
        url: string;
    };
}
declare class HieknSDKRelation extends HieknSDKNetChart {
    tgc2Stats: Tgc2Stats;
    tgc2Connects: Tgc2Connects;
    protected buildPrivateSetting(schema: HieknSchema): void;
    protected buildLoaderParams(options: HieknNetChartLoaderSetting): {
        queryData: any;
        formData: any;
        url: string;
    };
}
declare class HieknSDKTiming extends HieknSDKNetChart {
    isTiming: true;
    tgc2Prompt: Tgc2Prompt;
    tgc2TimeChart: Tgc2TimeChart;
    tgc2Event: Tgc2Event;
    protected buildPrivateSetting(schema: HieknSchema): void;
    protected buildLoaderParams(options: HieknNetChartLoaderSetting): {
        queryData: any;
        formData: any;
        url: string;
    };
}
interface HieknStatConfigSetting {
    type: string;
    seriesName?: {
        [key: string]: string;
    };
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
declare abstract class HieknSDKStat {
    $container: JQuery;
    chart: any;
    options: HieknStatSetting;
    stat: any;
    defaults: HieknStatSetting;
    constructor(options: HieknStatSetting);
    protected init(): void;
    protected bindEvent(): void;
    protected abstract drawChart(): void;
    load(): void;
}
declare class HieknSDKStatLineBar extends HieknSDKStat {
    protected drawChart(): void;
}
declare class HieknSDKStatMap extends HieknSDKStat {
    protected drawChart(): void;
}
declare class HieknSDKStatPie extends HieknSDKStat {
    protected drawChart(): void;
}
declare class HieknSDKStatRadar extends HieknSDKStat {
    protected drawChart(): void;
}
declare class HieknSDKStatScatter extends HieknSDKStat {
    protected drawChart(): void;
}
declare class HieknSDKStatWordCloud extends HieknSDKStat {
    protected drawChart(): void;
}
interface HieknAssociationSetting extends HieknAjaxSetting {
    kgName?: string;
}
declare class HieknSDKAssociation {
    static defaults: {
        formData: {
            pageSize: number;
        };
    };
    static load(options: HieknAssociationSetting): void;
}
declare type HieknConceptGraphStartInfo = {
    id: HieknIdType;
    kgType: number;
};
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
declare class HieknSDKConceptGraph {
    promptSettings: HieknPromptSetting;
    graphInfobox: HieknSDKInfobox;
    options: HieknConceptGraphSetting;
    tgc2: Tgc2Graph;
    tgc2Prompt: Tgc2Prompt;
    tgc2Page: Tgc2Page;
    constructor(options: HieknConceptGraphSetting);
    private buildInfobox(infoboxOptions);
    private contentsFunction(data, node, callback);
    private init();
    load(node: HieknConceptGraphStartInfo): void;
    loader(instance: Tgc2Graph, callback: Function, onFailed: Function): void;
    private nodeStyleFunction(node);
}
interface HieknConceptTreeInsSearchSetting extends HieknAjaxSetting {
    paramName?: string;
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
        infoboxSetting?: HieknNetChartInfoboxSetting;
        graphSetting?: {
            enable?: boolean;
            instanceEnable?: boolean;
            infoboxSetting?: HieknNetChartInfoboxSetting;
            conceptGraphSettings?: HieknConceptGraphSetting;
        };
    };
    instance?: HieknConceptTreeInsSetting;
    namespace?: string;
    pIdKey?: string;
    readAll?: boolean;
    hiddenIds?: {
        self?: number[];
        rec?: number[];
    };
}
declare class HieknSDKConceptTree {
    $container: JQuery;
    $graphContainer: JQuery;
    $instanceContainer: JQuery;
    treeId: string;
    clickTimeout: any;
    isFirst: boolean;
    lastSelectedNode: any;
    startAsync: boolean;
    treeDbClick: boolean;
    instanceSearchSettings: any;
    zTreeSettings: any;
    zTree: any;
    treeInfobox: HieknSDKInfobox;
    tgc2ConceptGraph: HieknSDKConceptGraph;
    instanceSearch: any;
    options: HieknConceptTreeSetting;
    defaults: HieknConceptTreeSetting;
    constructor(options: HieknConceptTreeSetting);
    private init();
    addHoverDom(treeId: string, treeNode: any): void;
    beforeAsync(treeId: string, treeNode: any): boolean;
    private bindInstanceEvent();
    private buildInfobox(infoboxOptions);
    /**
     * TODO to replace modal
     * */
    private buildGraph();
    private dataFilter(treeId, parentNode, data);
    private drawInstanceList(instances, append);
    private expandNodes(nodeId);
    private getAsyncUrl();
    getLastSelectedNodeId(): any;
    getLastSelectedInstance(): any;
    private loadGraph(id);
    reloadInstance(): void;
    private loadInstanceService();
    onAsyncSuccess(event: Event, treeId: string, treeNode: any): void;
    onClick(event: Event, treeId: string, treeNode: any): void;
    onNodeButtonClick($button: JQuery, treeNode: any): void;
    onNodeClick(node: any): void;
    /**
     * TODO to replace tooltipster, modal
     * */
    onNodeHover($container: JQuery, treeNode: any): boolean;
    removeHoverDom(treeId: string, treeNode: any): void;
    private select(selector);
    private updateZTreeSettings();
}
declare const hieknjs: any;
declare const moment: any;
interface HieknDisambiguateSetting extends HieknAjaxSetting {
}
declare class HieknSDKDisambiguate {
    static defaults: HieknDisambiguateSetting;
    static load(options: HieknDisambiguateSetting): void;
}
interface HieknInfoboxSetting extends HieknBaseSetting {
    kgName?: string;
    autoLen?: boolean;
    atts?: {
        visible: number[];
        hidden: number[];
    };
    enableLink?: boolean;
    imagePrefix?: string;
    onLoad?: Function;
    onFailed?: Function;
    selector?: string;
    changeInfobox?: Function;
}
declare class HieknSDKInfobox {
    callback: Function;
    defaults: HieknInfoboxSetting;
    options: HieknInfoboxSetting;
    constructor(options: HieknInfoboxSetting);
    private changeInfobox(id);
    initEvent($container: JQuery): void;
    private buildEntity(entity, buildLink);
    private buildExtra(extra);
    load(id: HieknIdType, callback: Function, onFailed?: Function): void;
    buildInfobox(data: any): JQuery;
    buildTabInfobox(data: any): JQuery;
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
declare class HieknSDKPrompt {
    defaults: HieknPromptSetting;
    instance: any;
    options: HieknPromptSetting;
    constructor(options: HieknPromptSetting);
    private init();
    static drawPromptItem(schema: HieknSchema): (data: any, pre: string) => string;
    static drawPromptKnowledgeItem(): (data: any, pre: string) => string;
    drawPromptItems(schema: HieknSchema): (data: any, pre: string) => JQuery;
    static onPromptStart(options: HieknPromptRequestSetting): (pre: string, $self: any) => void;
    static onPrompt(options: HieknPromptSetting): (pre: string, $self: any) => void;
    static onPromptKnowledge(options: HieknPromptSetting): (pre: string, $self: any) => void;
}
interface HieknResourceSetting extends HieknBaseSetting {
    beforeLoad?: Function;
    container?: string;
    config: HieknTableConfigSetting;
    onLoad?: Function;
}
declare class HieknSDKResource {
    options: HieknResourceSetting;
    tableService: HieknSDKTable;
    query: any;
    constructor(options: HieknResourceSetting);
    private getQuery();
    private init();
    private load(pageNo, instance);
    loadData(pageNo: number): void;
}
interface HieknResourcesSetting extends HieknBaseSetting {
    beforeLoad?: Function;
    container: string;
    configs: HieknTableConfigSetting[];
    namespace?: string;
    onLoad?: Function;
}
declare class HieknSDKResources {
    resourcesService: HieknSDKResource[];
    options: HieknResourcesSetting;
    $container: JQuery;
    $headContainer: JQuery;
    $bodyContainer: JQuery;
    constructor(options: HieknResourcesSetting);
    private bindEvent();
    private init(namespace?);
    loadData(pageNo: number): void;
    select(selector: string): JQuery;
    updateTabVisibility(): void;
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
    kgName?: string;
}
declare class HieknSDKSchema {
    static load(options: HieknSchemaSetting): void;
}
interface HieknSegmentSetting extends HieknAjaxSetting {
}
declare class HieknSDKSegment {
    static defaults: HieknSegmentSetting;
    static load(options: HieknSegmentSetting): void;
}
declare type HieknTableRendererFunction = (value: any, data: any) => string;
declare type HieknTableRendererType = 'date' | 'link' | 'year' | 'dateTime' | 'json' | 'string' | HieknTableRendererFunction;
declare type HieknTableRendererComplex = {
    type: HieknTableRendererType;
    array?: boolean;
    fields?: string[];
    name?: string;
};
declare type HieknTableRenderer = {
    [key: string]: HieknTableRendererType | HieknTableRendererComplex;
};
declare type HieknTableFilterType = 'year' | 'month' | 'day';
declare type HieknTableFilterOption = string | {
    key: string;
    value: string;
} | HieknKVType;
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
    load: Function;
}
declare class HieknSDKTable {
    $container: JQuery;
    data: any;
    options: HieknTableSetting;
    constructor(options: HieknTableSetting);
    private buildFilter();
    private bindFilterEvent();
    private bindTableEvent();
    private static dealContent(d, len?);
    drawData(data: any): void;
    drawPage(count: number, pageNo: number, pageSize: number): void;
    getFilterKw(): any;
    getFilterOptions(): {};
    getTableContainer(): JQuery;
    private static getValues(value);
    private init();
    loadData(pageNo: number): void;
    private static rendererDate(v);
    private static rendererDateTime(v);
    private static rendererFields(d, k, fieldsLink, fieldsRenderer, short);
    private static rendererLink(v, name?, cls?);
    private static rendererValue(type, value, fieldsRenderer, short, data);
    private static rendererYear(v);
    private select(selector);
}
interface HieknTaggingSetting extends HieknAjaxSetting {
}
declare class HieknSDKTagging {
    static load(options: HieknTaggingSetting): void;
}
declare type HieknIdType = number | string;
declare type HieknKVType = {
    [key: string]: string;
};
declare type JQueryAjaxSuccess = (data: any, textStatus: string, jqXHR: JQueryXHR) => any;
declare type JQueryAjaxDataFilter = (data: any, ty: any) => any;
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
declare class HieknSDKUtils {
    static VERSION: string;
    static regChinese: RegExp;
    static regEnglish: RegExp;
    static colorBase: string[];
    static colorEx: string[];
    static color: string[];
    static loadingHTML: string;
    static ajax(options: any): void;
    static buildUrl(url: string, queryData: any): string;
    static dataFilter(data: any): any;
    static drawPagination(options: any): void;
    static error(msg: string): void;
    static getVersion(): string;
    static info(msg: string): void;
    static qiniuImg(img: string): string;
    static randomId(prefix?: string, postfix?: string, append?: string): string;
    static safeHTML(value: string): any;
    static dealNull(data: any): any;
}
declare class HieknSDKService {
    schema(options: any, callback: JQueryAjaxSuccess): void;
    association(options: any, callback: JQueryAjaxSuccess): void;
    tagging(options: any, callback: JQueryAjaxSuccess): void;
    disambiguate(options: any, callback: JQueryAjaxSuccess): void;
    segment(options: any, callback: JQueryAjaxSuccess): void;
    static updateOptionsData(options: any): any;
}
declare class HieknNetChartUpdateService {
    static updateOptions(options: any): any;
}
declare class HieknGraphService extends HieknSDKGraph {
    protected beforeInit(options: HieknNetChartSetting): void;
}
declare class HieknTimingGraphService extends HieknSDKTiming {
    protected beforeInit(options: HieknNetChartSetting): void;
}
declare class HieknPathService extends HieknSDKPath {
    protected beforeInit(options: HieknNetChartSetting): void;
}
declare class HieknRelationService extends HieknSDKRelation {
    protected beforeInit(options: HieknNetChartSetting): void;
}
declare class HieknInfoboxService extends HieknSDKInfobox {
    constructor(options: any);
}
declare class HieknPromptService extends HieknSDKPrompt {
    constructor(options: any);
}
declare class HieknConceptPromptService extends HieknSDKPrompt {
    constructor(options: any);
}
declare class HieknConceptGraphService extends HieknSDKConceptGraph {
    constructor(options: any);
}
declare class HieknTableService extends HieknSDKTable {
    constructor(options: any);
}
declare class HieknResourceService extends HieknSDKResource {
    constructor(options: any);
}
declare class HieknResourcesService extends HieknSDKResources {
    constructor(options: any);
}
declare class HieknConceptTreeService extends HieknSDKConceptTree {
    constructor(options: any);
}
declare class HieknStatService {
    constructor(options: any);
}

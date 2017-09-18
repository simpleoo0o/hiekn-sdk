interface Tgc2GraphStartInfo extends Tgc2StartInfo {
    name: string;
}
declare class Tgc2Graph extends Tgc2 {
    constructor(settings: Tgc2Setting);
    inStart(id: number | string): boolean;
    protected onDoubleClick(event: BaseMouseEvent, args: NetChartChartClickEventArguments): void;
    protected updateStartInfo(): void;
}

interface Tgc2PathSetting extends Tgc2Setting {
    path: {
        prompt: {
            settings: any;
        };
    };
}
interface Tgc2PathStartInfo extends Tgc2StartInfo {
    start?: Tgc2DataNode;
    end?: Tgc2DataNode;
}
declare class Tgc2Path extends Tgc2 {
    protected startPrompt: any;
    protected endPrompt: any;
    startInfo: Tgc2PathStartInfo;
    settings: Tgc2PathSetting;
    constructor(settings: Tgc2PathSetting);
    getStartInfo(): Tgc2StartInfo;
    inStart(id: number | string): boolean;
    protected initPathPanel(): void;
    protected initPathStartInfo(): void;
    protected updateStartInfo(): void;
}

interface Tgc2RelationSetting extends Tgc2Setting {
    relation: {
        prompt: {
            settings: any;
        };
    };
}
interface Tgc2RelationDataNode extends Tgc2DataNode {
    meaningTag?: string;
}
interface Tgc2RelationStartInfo extends Tgc2StartInfo {
    nodes?: Array<Tgc2RelationDataNode>;
}
declare class Tgc2Relation extends Tgc2 {
    protected relationPrompt: any;
    startInfo: Tgc2RelationStartInfo;
    settings: Tgc2RelationSetting;
    constructor(settings: Tgc2RelationSetting);
    getStartInfo(): Tgc2StartInfo;
    inStart(id: number | string): boolean;
    protected initPathPanel(): void;
    protected addRelationNode(node: Tgc2RelationDataNode): void;
    protected getRelationNodes(): Array<Tgc2RelationDataNode>;
    protected inRelationNodes(node: Tgc2RelationDataNode): boolean;
    protected removeRelationNode(event: Event): void;
    protected initRelationStartInfo(): void;
    protected updateStartInfo(): void;
}



import NetChartSettings = ZoomCharts.Configuration.NetChartSettings;
import NetChartDataObject = ZoomCharts.Configuration.NetChartDataObject;
import ItemsChartLink = ZoomCharts.Configuration.ItemsChartLink;
import BaseMouseEvent = ZoomCharts.Configuration.BaseMouseEvent;
import NetChartChartClickEventArguments = ZoomCharts.Configuration.NetChartChartClickEventArguments;
import NetChartDataObjectNode = ZoomCharts.Configuration.NetChartDataObjectNode;
import NetChartDataObjectLink = ZoomCharts.Configuration.NetChartDataObjectLink;
import ItemsChartNode = ZoomCharts.Configuration.ItemsChartNode;
import NetChartSettingsLocalization = ZoomCharts.Configuration.NetChartSettingsLocalization;
interface Tgc2ChartLink extends ItemsChartLink {
    data: Tgc2DataLink;
}
interface Tgc2ChartNode extends ItemsChartNode {
    data: Tgc2DataNode;
}
interface Tgc2Data {
    links?: Array<Tgc2DataLink>;
    nodes?: Array<Tgc2DataNode>;
}
interface Tgc2DataId {
    links?: Array<string>;
    nodes?: Array<number | string>;
}
interface Tgc2DataLink extends NetChartDataObjectLink {
    color?: string;
    hidden?: boolean;
    typeName?: string;
    oRInfo?: Array<Tgc2RInfo>;
    nRInfo?: Array<Tgc2RInfo>;
}
interface Tgc2RInfo {
    id?: number | string;
    kvs: Array<{
        k: string;
        v: string;
    }>;
}
interface Tgc2DataNode extends NetChartDataObjectNode {
    auras?: Array<string>;
    color?: string;
    hidden?: boolean;
    name?: string;
}
interface Tgc2PanelSetting {
    active?: boolean;
    mode?: string;
}
interface Tgc2Setting {
    autoResize?: boolean;
    extend?: boolean;
    leftPanels?: Tgc2PanelSetting;
    rightPanels?: Tgc2PanelSetting;
    floatPanels?: {
        enable?: boolean;
        style: {
            top?: string;
            right?: string;
            bottom?: string;
            left?: string;
        };
    };
    loader: Function;
    netChart?: {
        autoRelayout: boolean;
        callback?: {
            onFullScreenChange?: Function;
        };
        nodeDefaultColor: string;
        linkDefaultColor: string;
        emphasesColor: string;
        reduceColor: string;
        settings: NetChartSettings;
    };
    selector: string;
}
interface Tgc2Cache {
    startInfo: Tgc2StartInfo;
    data: Tgc2Data;
}
interface Tgc2Dimensions {
    width: number;
    height: number;
}
interface Tgc2History {
    startInfo: Tgc2StartInfo;
    idx: number;
}
interface Tgc2StartInfo {
    id?: number | string;
}
declare abstract class Tgc2 {
    protected $container: JQuery;
    protected $mainContainer: JQuery;
    protected availableData: Tgc2Data;
    protected beforeChartUpdate: Array<Function>;
    protected beforeDestroy: Array<Function>;
    protected beforeDraw: Array<Function>;
    protected beforeInit: Array<Function>;
    protected beforeLoad: Array<Function>;
    protected data: Tgc2Data;
    protected dimensions: Tgc2Dimensions;
    protected emphasesColor: string;
    protected inLoading: boolean;
    protected isInit: boolean;
    protected linkColor: string;
    protected localization: NetChartSettingsLocalization;
    protected nodeColor: string;
    protected nodeIds: {};
    protected onAvailableDataUpdate: Array<Function>;
    protected onChartUpdate: Array<Function>;
    protected onClear: Array<Function>;
    protected onDataUpdate: Array<Function>;
    protected onInit: Array<Function>;
    protected onFailed: Array<Function>;
    protected onLoad: Array<Function>;
    protected onMergeData: Array<Function>;
    protected onResize: Array<Function>;
    protected onVisibleDataUpdate: Array<Function>;
    protected pathIds: {};
    protected reduceColor: string;
    protected selectionColor: string;
    protected visibleData: Tgc2DataId;
    protected netChartSettings: NetChartSettings;
    end: string;
    forceRefresh: boolean;
    cacheList: Array<Tgc2Cache>;
    historyList: Array<Tgc2History>;
    netChart: NetChart;
    resizeInterval: number;
    settings: Tgc2Setting;
    start: string;
    startInfo: Tgc2StartInfo;
    constructor(settings: Tgc2Setting);
    addBeforeChartUpdate(callback: Function): void;
    addBeforeDestroy(callback: Function): void;
    addBeforeDraw(callback: Function): void;
    addBeforeInitEvent(callback: Function): void;
    addBeforeLoad(callback: Function): void;
    addLeftPanel(tabIcon: string, pageHTML: string, title: string, active?: boolean, tooltip?: string): string;
    addMainPanel(pageHTML: string, tabIcon?: string, title?: string, active?: boolean, tooltip?: string): string;
    addRightPanel(tabIcon: string, pageHTML: string, title: string, active?: boolean, tooltip?: string): string;
    addFloatPanel(tabIcon: string, pageHTML: string, title: string, active?: boolean, tooltip?: string): string;
    addTabNewTag(id: string): void;
    addOnAvailableDataUpdate(callback: Function): void;
    addOnChartUpdate(callback: Function): void;
    addOnClear(callback: Function): void;
    addOnDataUpdate(callback: Function): void;
    addOnResize(callback: Function): void;
    addOnVisibleDataUpdate(callback: Function): void;
    addOnInitEvent(callback: Function): void;
    addOnFailed(callback: Function): void;
    addOnLoad(callback: Function): void;
    addOnMergeData(callback: Function): void;
    back(): void;
    clear(): void;
    clearEmphasesNode(): void;
    clearEmphasesPath(): void;
    destroy(): void;
    drawHistory(history: Tgc2Cache): void;
    static gentId(prefix?: string): string;
    getContainer(): JQuery;
    getMainContainer(): JQuery;
    getAvailableData(): Tgc2Data;
    getData(): Tgc2Data;
    getDimensions(): Tgc2Dimensions;
    getEmphasesNode(): {};
    getEmphasesPath(): {};
    getStartInfo(): Tgc2StartInfo;
    getVisibleData(): Tgc2DataId;
    hasVisibleData(): boolean;
    init(): void;
    load(startInfo: Tgc2StartInfo): void;
    removeTabNewTag(id: string): void;
    resize(): void;
    select(selector: string): JQuery;
    setEmphasesNode(ids: Array<number | string>): void;
    setEmphasesPath(ids: Array<string>): void;
    togglePanel(id: string, toggle?: boolean): void;
    updateChart(): void;
    updateAvailableData(data: Tgc2Data): void;
    updateData(data: Tgc2Data): void;
    updateVisibleData(data: Tgc2DataId): void;
    protected addPanel(tabHTML: string, pageHTML: string, $container: JQuery, active?: boolean): string;
    static updateCheckboxStatus(target: any): void;
    static updateRadioStatus(target: any): void;
    protected autoResize(): void;
    protected buildLeftPanelContainer(): void;
    protected buildMainPanelContainer(): void;
    protected buildRightPanelContainer(): void;
    protected buildFloatPanelContainer(): void;
    protected static callEvent(eventList: Array<Function>): void;
    protected destroyDOM(): void;
    protected drawResult(): void;
    protected getGraphData(startInfo: Tgc2StartInfo): void;
    protected mergeData(src: Tgc2Data, dest: Tgc2Data): Tgc2Data;
    protected initEvent(): void;
    protected initNetChart(): void;
    protected initTemplate(): void;
    protected static linkContentsFunction(itemData: Tgc2DataLink): string;
    protected linkStyleFunction(link: Tgc2ChartLink): void;
    protected nodeStyleFunction(node: Tgc2ChartNode): void;
    protected onDoubleClick(event: BaseMouseEvent, args: NetChartChartClickEventArguments): void;
    protected resetToolbar(): void;
    protected runTooltip($item: JQuery): void;
    protected updateResult(): void;
    abstract inStart(id: number | string): boolean;
    protected abstract updateStartInfo(): void;
}


interface Tgc2ConnectsData extends Tgc2Data {
    connects: Array<Tgc2DataConnects>;
}
interface Tgc2DataConnects {
    end: string;
    edges: Array<string>;
    nodes: Array<string>;
    start: string;
}
interface Tgc2ConncetsSetting {
    enable?: boolean;
    mode?: string;
}
declare class Tgc2Connects {
    private static defaultSettings;
    private $container;
    private hoverNodes;
    private hoverLinks;
    private showAll;
    panelId: string;
    settings: Tgc2ConncetsSetting;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2ConncetsSetting);
    getContainer(): JQuery;
    select(selector: string): JQuery;
    private initEvent();
    private initTemplate();
    private beforeDraw();
    private drawData(data);
    private drawDataHorizontal(data);
    private drawDataVertical(data);
}


interface Tgc2CrumbSettings {
    enable?: boolean;
    drawItem?: Function;
}
declare class Tgc2Crumb {
    private static defaultSettings;
    private $container;
    settings: Tgc2CrumbSettings;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2CrumbSettings);
    getContainer(): JQuery;
    select(selector: string): JQuery;
    private beforeDraw();
    private drawItem(startInfo, isSelected);
    private initEvent();
    private initTemplate();
}


interface Tgc2EventData extends Tgc2Data {
}
interface Tgc2EventDataLink extends Tgc2DataLink {
    bsTime?: Array<string>;
}
interface Tgc2EventSettings {
    buildDetail?: Function;
    enable?: boolean;
    gentEventDetail?: Function;
    groupEvent?: Function;
    style?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
        width?: string;
    };
}
interface Tgc2Event extends Tgc2EventDataLink {
    day?: string;
    detail?: any;
    fromIds?: Array<number | string>;
    ids?: Array<number | string>;
    timestamp?: number;
    toIds?: Array<number | string>;
    year?: string;
}
declare class Tgc2Event {
    private static defaultSettings;
    private $container;
    events: Array<Tgc2Event>;
    showEvents: Array<Tgc2Event>;
    settings: Tgc2EventSettings;
    visibleEvents: Array<Tgc2Event>;
    start: string;
    end: string;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2EventSettings);
    drawEvents(): void;
    getContainer(): JQuery;
    select(selector: string): JQuery;
    private beforeDraw();
    private buildEvents();
    private static buildDetail(event);
    private static groupEvent(events);
    private initEvent();
    private initTemplate();
    private updateEventDetail(data);
    private static updateEventInfo(links);
}


interface Tgc2FacetData extends Tgc2Data {
    facetList: Array<Tgc2FacetItem>;
}
interface Tgc2FacetDataNode extends Tgc2DataNode {
    facets?: Array<string>;
}
interface Tgc2FacetDataLink extends Tgc2DataLink {
    facets?: Array<string>;
}
interface Tgc2FacetSettings {
    enable?: boolean;
    style?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
        width?: string;
    };
    facetMap: Array<string>;
    brush?: {
        color?: Array<string>;
    };
    afterItemChange?: Function;
}
interface Tgc2FacetInfo {
    brush: {
        isBrush: boolean;
        arrBrush: Array<any>;
        series: {
            all: {};
        };
    };
}
interface Tgc2FacetDetailItem {
    name: string;
    relNodeList: Array<number | string>;
    relRelationList: Array<string>;
    num: number;
    selected: boolean;
    timestamp: number;
}
interface Tgc2FacetItem {
    entityType: number | string;
    facetDetailList: Array<Tgc2FacetDetailItem>;
    typeName: string;
    typetotal: number;
}
declare class Tgc2Facet {
    private static defaultSettings;
    private $container;
    facet: Tgc2FacetInfo;
    settings: Tgc2FacetSettings;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2FacetSettings);
    clearSelectedFacet(): void;
    getContainer(): JQuery;
    removeFacetByTag(tag: string): void;
    select(selector: string): JQuery;
    private beforeDraw();
    private brushColor();
    private drawFacetName();
    private drawFacetPanel();
    private getEventsFacet(es);
    private initEvent();
    private initTemplate();
    private onLoad();
    private updateAuras();
    private updateColor();
    private updateNodeBrush();
    private updateVisibleData();
}


interface Tgc2FilterSettings {
    enable?: false;
    filters?: Array<any>;
}
declare class Tgc2Filter {
    private static filters;
    private static defaultSettings;
    private $container;
    panelId: string;
    settings: Tgc2FilterSettings;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2FilterSettings);
    getContainer(): JQuery;
    getFilterOptions(): any;
    select(selector: string): JQuery;
    private initEvent();
    private initTemplate();
    private static gentFilterItem(config);
    private updateFilter();
}


interface Tgc2FindSettings {
    enable?: boolean;
}
declare class Tgc2Find {
    private static defaultSettings;
    private $container;
    private find;
    settings: Tgc2FindSettings;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2FindSettings);
    getContainer(): JQuery;
    select(selector: string): JQuery;
    private initEvent();
    private initTemplate();
}


interface Tgc2LegendSettings {
    enable?: boolean;
    style?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
        width?: string;
    };
    data: Array<any>;
    itemDraw?: Function;
    legendDraw?: Function;
    onClick?: Function;
    onDblClick?: Function;
    onMouseEnter?: Function;
    onMouseLeave?: Function;
}
declare class Tgc2Legend {
    private defaultSettings;
    private $container;
    settings: Tgc2LegendSettings;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2LegendSettings);
    legendDraw(data: Array<any>, $container: JQuery): void;
    updateLegend(): void;
    getContainer(): JQuery;
    select(selector: string): JQuery;
    private initEvent();
    private initTemplate();
    private static itemDraw(key, value);
}


interface Tgc2PageSetting {
    enable?: boolean;
    pageNo?: number;
    pageSize?: number;
    style?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
}
interface Tgc2PageInfo {
    pageNo: number;
    pageSize: number;
    hasNext: boolean;
}
declare class Tgc2Page {
    private static defaultSettings;
    private $container;
    private isPageEvent;
    page: Tgc2PageInfo;
    settings: Tgc2PageSetting;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2PageSetting);
    getContainer(): JQuery;
    select(selector: string): JQuery;
    private beforeLoad();
    private initEvent();
    private initTemplate();
    private onLoad();
}


declare const hieknPrompt: any;
interface Tgc2PromptSetting {
    enable?: boolean;
    style?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
        maxWidth?: string;
    };
    settings?: {
        container?: string | JQuery;
        onSearch?: Function;
    };
}
declare class Tgc2Prompt {
    private defaultSettings;
    private $container;
    private prompt;
    settings: Tgc2PromptSetting;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2PromptSetting);
    getContainer(): JQuery;
    select(selector: string): JQuery;
    private initEvent();
    private initTemplate();
}


interface Tgc2StatsData extends Tgc2Data {
    stats: Array<Tgc2DataStats>;
}
interface Tgc2StatsConfig {
    id: string;
    atts: Array<string>;
    key: string;
    type: string;
}
interface Tgc2StatsPromptBean {
    k: string;
    v: string;
}
interface Tgc2DataStats extends Tgc2StatsConfig {
    rs: Array<Tgc2DataStatsRs>;
}
interface Tgc2DataStatsRs {
    id: number | string;
    count: number;
}
interface Tgc2StatsSettings {
    atts?: Tgc2StatsPromptBean[];
    editable?: boolean;
    enable?: boolean;
    types?: Tgc2StatsPromptBean[];
    statsConfig?: Tgc2StatsConfig[];
}
declare class Tgc2Stats {
    private static defaultSettings;
    private $container;
    private $settingModal;
    private namePrefix;
    statsConfig: Tgc2StatsConfig[];
    settings: Tgc2StatsSettings;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2StatsSettings);
    getContainer(): JQuery;
    getStatsConfig(): Tgc2StatsConfig[];
    select(selector: string): JQuery;
    private initEditEvent();
    private initEvent();
    private initTemplate();
    private beforeDraw();
    private drawData(data);
    private static gentItem(options, key, multi?);
    private clearConfigForm();
    private getConfigForm();
    private setConfigForm(d);
    private updateSettings();
}


declare const echarts: any;
interface Tgc2TimeChartData extends Tgc2Data {
    computerTime?: string;
}
interface Tgc2TimeChartDataLink extends Tgc2DataLink {
    bsTime?: Array<string>;
}
interface Tgc2TimeChartSettings {
    enable?: boolean;
    style?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    settings?: any;
    timelineSettings?: any;
}
interface Tgc2TimeFilterSettings {
    type?: string;
    pageSize?: string | number;
    fromTime?: string;
    toTime?: string;
}
interface Tgc2TimeChartEvent extends Tgc2TimeChartDataLink {
    time?: string;
    timestamp?: number;
}
declare class Tgc2TimeChart {
    private static defaultSettings;
    private $container;
    $settingModal: any;
    private timeChart;
    private namePrefix;
    private times;
    private counts;
    events: Array<Tgc2TimeChartEvent>;
    visibleEvents: Array<Tgc2TimeChartEvent>;
    start: string;
    end: string;
    settings: Tgc2TimeChartSettings;
    timeFilterSettings: Tgc2TimeFilterSettings;
    tgc2: Tgc2;
    constructor(tgc2: Tgc2, settings: Tgc2TimeChartSettings);
    getContainer(): JQuery;
    getSettings(): Tgc2TimeFilterSettings;
    select(selector: string): JQuery;
    private beforeDraw();
    private buildEvents();
    private buildAvailableData(allData);
    private drawTimeChart();
    private showStaticTimeChart();
    private showDynamicTimeChart();
    private initEvent();
    private initTemplate();
    private static today();
    private static updateEventInfo(links);
    private updateSettings();
}

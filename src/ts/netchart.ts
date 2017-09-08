interface HieknNetChartBaseSetting{
    baseUrl: string;
    formData?: any;
    kgName: string;
    queryString?: any;
    dataFilter?: Function;
}

interface HieknNetChartFilterSetting{
    selectedAtts?: any;
    selectedTypes?: any;
}

interface HieknNetChartInfoboxSetting extends HieknNetChartBaseSetting{
    enable?: boolean;
    selector?: string;
    imagePrefix?: string;
}

interface HieknNetChartLoaderSetting extends HieknNetChartBaseSetting{
    enable?:boolean;
    selector?: string;
}

interface HieknNetChartNodeSetting{
    enableAutoUpdateStyle?: boolean;
    imagePrefix?: string;
    images?: any;
    nodeColors?: any;
    textColors?: any;
    minRadius?:number;
    legendClass?: any;
    legendColor?: any;
}

interface HieknNetChartSchemaSetting extends HieknNetChartBaseSetting{
    preloadData?: any;
    that?: HTMLElement;
}

interface HieknNetChartInitSetting extends HieknNetChartBaseSetting{
    isTiming?: boolean;
    that?: HTMLElement;
    success?:Function;
    failed?:Function;
}

abstract class HikenNetChart{
    isInit = false;
    filterSettings:HieknNetChartFilterSetting = {};
}
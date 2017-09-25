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
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

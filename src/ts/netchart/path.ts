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

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

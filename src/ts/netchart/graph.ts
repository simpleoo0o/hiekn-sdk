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
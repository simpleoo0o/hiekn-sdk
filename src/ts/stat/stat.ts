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
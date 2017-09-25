class HieknSDKStatGauge extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        let stat:any  = this.options.config;

        const defaultSeries = {
            name: '',
            type: 'gauge',
            axisLine: {
                show: true,
                lineStyle: {
                    width: 30,
                    shadowBlur: 0,
                    color: [[0.25, this.options.chartColor[2]], [0.5, this.options.chartColor[0]], [0.75, this.options.chartColor[1]], [1, this.options.chartColor[3]]]
                }
            },
            detail: {formatter: '{value}%'},
            data: d.series
        };

        let series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {
            tooltip: {
                formatter: "{a} <br/>{b} : {c}%"
            },
            toolbox: {
                feature: {
                    restore: {},
                    saveAsImage: {}
                }
            }
        };
        let option: any = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        option.series = [series];
        this.chart.setOption(option);
    }
}
class HieknSDKStatPie extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const stat = this.options.config;
        const legend = [];
        for (const s of d.series) {
            if (stat.seriesName) {
                s.name = stat.seriesName[s.name] || s.name;
                legend.push(s.name);
            }
        }
        const defaultSeries = {
            name: '',
            type: 'pie',
            radius: '75%',
            center: ['50%', '50%'],
            data: d.series,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };
        let series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {
            color: this.options.chartColor,
            tooltip: {
                trigger: 'item',
                formatter: '{b} <br/>{c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data: legend
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
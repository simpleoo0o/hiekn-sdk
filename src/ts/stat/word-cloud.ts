class HieknSDKStatWordCloud extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const stat = this.options.config;
        const data = [];
        for (const series of d.series) {
            if (series.name) {
                data.push(series);
            }
        }
        const defaultSeries = {
            type: 'wordCloud',
            sizeRange: [12, 50],
            rotationRange: [-45, 90],
            textPadding: 0,
            autoSize: {
                enable: true,
                minSize: 6
            },
            textStyle: {
                normal: {
                    color: () => {
                        return this.options.chartColor[Math.floor(Math.random() * this.options.chartColor.length)];
                    }
                },
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            data: data
        };
        let series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {};
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
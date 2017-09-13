class HieknSDKStatLineBar extends HieknSDKStat {
    protected drawChart() {
        const type = this.options.config.type;
        const defaultXAxis = {
            type: 'category',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false,
                alignWithLabel: true
            },
            splitLine: {
                show: true
            }
        };
        const defaultSeries = {
            name: '',
            type: type,
            symbol: 'circle',
            symbolSize: 10
        };
        const d = this.stat;
        const stat = this.options.config;
        const legend = [];
        for (const s of d.series) {
            if (stat.seriesName) {
                s.name = stat.seriesName[s.name] || s.name;
                legend.push(s.name);
            }
        }
        let idx = 0;
        const xAxisArr = [];
        for (const xAxis of d.xAxis) {
            if (stat.chartSettings && stat.chartSettings.xAxis) {
                if (stat.chartSettings.xAxis instanceof Array) {
                    $.extend(true, defaultXAxis, stat.chartSettings.xAxis[idx]);
                } else {
                    $.extend(true, defaultXAxis, stat.chartSettings.xAxis);
                }
            }
            xAxisArr.push($.extend(true, {}, defaultXAxis, xAxis));
        }
        idx = 0;
        const seriesArr = [];
        for (const series of d.series) {
            if (stat.chartSettings && stat.chartSettings.series) {
                if (stat.chartSettings.series instanceof Array) {
                    $.extend(true, defaultSeries, stat.chartSettings.series[idx]);
                } else {
                    $.extend(true, defaultSeries, stat.chartSettings.series);
                }
            }
            if (series.name == '') {
                delete series.name;
            }
            const s = $.extend(true, {}, defaultSeries, series);
            if (stat.seriesName && stat.seriesName[s.name]) {
                s.name = stat.seriesName[s.name] || s.name;
            }
            seriesArr.push(s);
            idx++;
        }
        this.chart = echarts.init(this.$container[0]);
        let defaultOption: any = {
            color: this.options.chartColor,
            tooltip: {
                position: 'top',
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                }
            },
            legend: {
                show: false,
                orient: 'vertical',
                x: 'left',
                data: legend
            },
            grid: {
                left: 9,
                right: 9,
                bottom: 24,
                top: 24,
                containLabel: true
            },
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    }
                }
            ]
        };
        if (stat.seriesName && !$.isEmptyObject(stat.seriesName)) {
            defaultOption.tooltip.formatter = (param: any) => {
                let str = '';
                for (const item of param) {
                    str += item.seriesName + ':' + item.data + '<br>';
                }
                return str;
            }
        }
        let option: any = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        if (stat.changeXY) {
            option.xAxis = option.yAxis;
            option.yAxis = xAxisArr;
        } else {
            option.xAxis = xAxisArr;
        }
        option.series = seriesArr;
        this.chart.setOption(option);
    }
}
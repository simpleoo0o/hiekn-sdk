class HieknSDKStatRadar extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const stat = this.options.config;
        const data = d.series;
        let arr = [];
        for (const val of data) {
            arr.push(val.value);
        }
        console.log(arr)


        const defaultSeries = {
            name: '',
            type: 'radar',
            data: [arr],
            symbol: 'none',
            itemStyle: {
                normal: {
                    color: this.options.chartColor[0]
                }
            },
            areaStyle: {
                normal: {
                    opacity: 0.1
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
            backgroundColor: '#fff',
            title: {
                text: stat.chartSettings.title.text,
                left: 'center',
                textStyle: {
                    color: '#eee'
                }
            },
            legend: {
                bottom: 5,
                data: stat.chartSettings.title.text,
                itemGap: 20,
                textStyle: {
                    color: '#fff',
                    fontSize: 14
                },
                selectedMode: 'single'
            },
            radar: {
                shape: 'circle',
                splitNumber: 5,
                name: {
                    textStyle: {
                        color: 'rgb(0, 179, 138)'
                    }
                },
                splitArea: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 179, 138, 0.5)'
                    }
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
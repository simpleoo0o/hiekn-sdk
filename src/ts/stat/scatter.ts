class HieknSDKStatScatter extends HieknSDKStat {
    protected drawChart() {
        const data = this.stat;
        console.log(data);
        const stat = this.options.config;
        let defaultSeries: any[] = [];
        for (let i = 0; i < data.series.length; i++) {
            defaultSeries.push({
                name: stat.chartSettings.legend.data ? stat.chartSettings.legend.data[i] : '',
                data: data.series[i],
                type: 'scatter',
                symbolSize: function (data: any) {
                    return Math.sqrt(data[2]) / 5e2;
                },
                label: {
                    emphasis: {
                        show: true,
                        formatter: function (param: any) {
                            return param.data[3];
                        },
                        position: 'top'
                    }
                },
                itemStyle: {
                    normal: {
                        color: this.options.chartColor[i]
                    }
                }
            })
        }
        ;

        let series = [];
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {
            backgroundColor: '#fff',
            title: {
                text: ''
            },
            series: series,
            legend: {
                right: 10,
                data: data.name
            },
            xAxis: {
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            yAxis: {
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                scale: true
            }
        };
        let option: any = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        this.chart.setOption(option);
    }
}
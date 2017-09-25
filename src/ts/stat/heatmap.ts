class HieknSDKStatHeatmap extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const data = d.series;
        const stat = this.options.config;
        const defaultSeries = {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: data
        };
        let series: any = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        let direction = 'horizontal';
        const defaultOption = {
            title: {
                top: 30,
                left: 'center',
                text: ''
            },
            graphic: {
                id: 'left-btn',
                type: 'circle',
                shape: {r: 20},
                style: {
                    text: '+',
                    fill: '#eee'
                },
                left: 10,
                top: 10,
                onclick: () => {
                    if (direction == 'horizontal') {
                        this.chart.setOption(option = {
                            title: {
                                left: 111,
                            },
                            visualMap: {
                                orient: 'vertical',
                                left: 65
                            },
                            calendar: {
                                top: 40,
                                left: 'center',
                                bottom: 10,
                                orient: 'vertical',
                                cellSize: [13, 'auto'],
                                yearLabel: {show: false}
                            }
                        })
                        direction = 'vertical';
                    } else {
                        this.chart.setOption(option = {
                            title: {
                                left: 'center',
                            },
                            visualMap: {
                                orient: 'horizontal',
                                left: 'center',
                                top: 65,
                            },
                            calendar: {
                                top: 120,
                                left: 30,
                                right: 30,
                                orient: 'horizontal',
                                cellSize: ['auto', 13],
                                yearLabel: {show: false}
                            }
                        });
                        direction = 'horizontal';
                    }
                }
            },
            tooltip: {},
            visualMap: {
                min: 0,
                max: 10000,
                type: 'piecewise',
                orient: 'horizontal',
                left: 'center',
                top: 65,
                textStyle: {
                    color: '#000'
                }
            },
            calendar: {
                top: 120,
                left: 30,
                right: 30,
                cellSize: ['auto', 13],
                range: '2016',
                itemStyle: {
                    normal: {borderWidth: 0.5}
                },
                yearLabel: {show: false}
            }
        }
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
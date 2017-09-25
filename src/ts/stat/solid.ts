class HieknSDKStatSolid extends HieknSDKStat {
    protected drawChart() {
        const d = this.stat;
        const stat = this.options.config;
        const defaultSeries = {
            name: '',
            type: 'solid',
            layout: 'force',

            force: {
                repulsion: [100, 500],
                edgeLength: [50, 200],
                gravity: 0.1
            },
            tooltip: {
                formatter: (params: any) => {
                    let sub2 = "", sub1 = "";
                    if (!!params.data.subtext1) {
                        sub1 = params.data.subtext1 + '<br />'
                    }
                    if (!!params.data.subtext2) {
                        sub2 = params.data.subtext2
                    }
                    if (sub1 || sub2) {
                        return sub1 + sub2;
                    }
                }
            },
            data: d.series.nodes,
            links: d.series.links,
            lineStyle: {
                normal: {
                    color: 'source',
                    curveness: 0,
                    type: "solid"
                }
            },
            label: {
                normal: {
                    show: true,
                    position: 'top',
                    formatter: function (params) {
                        return params.data.subtext2
                    }

                }
            }
        }
        let series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        } else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        const defaultOption = {
            backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [{
                offset: 0,
                color: '#fff'
            }, {
                offset: 1,
                color: '#fff'
            }]),
            title: {
                text: "solid",
                top: "top",
                left: "center"
            },
            tooltip: {
                trigger: 'item'
            },
            legend: [{
                formatter: (name: any) => {
                    return echarts.format.truncateText(name, 40, '14px Microsoft Yahei', '…');
                },
                tooltip: {
                    show: true
                },
                selectedMode: 'false',
                bottom: 20
            }],
            toolbox: {
                show: true,
                feature: {
                    dataView: {
                        show: true,
                        readOnly: true
                    },
                    restore: {
                        show: true
                    },
                    saveAsImage: {
                        show: true
                    }
                }
            },
            animationDuration: 1000,
            animationEasingUpdate: 'quinticInOut'
        }
        let option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }
        option.series = series;
        console.log(JSON.stringify(option));
        this.chart.setOption(option);
    }
}
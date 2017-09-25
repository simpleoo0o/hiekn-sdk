class HieknSDKStatMap extends HieknSDKStat {
    protected drawChart() {
        const stat = this.options.config;
        this.chart = echarts.init(this.$container[0]);
        const d = this.stat;
        const data = d.series;
        console.log(data)

        //34个省、市、自治区的名字拼音映射数组
        const provinces = {
            //23个省
            "台湾": "taiwan",
            "河北": "hebei",
            "山西": "shanxi",
            "辽宁": "liaoning",
            "吉林": "jilin",
            "黑龙江": "heilongjiang",
            "江苏": "jiangsu",
            "浙江": "zhejiang",
            "安徽": "anhui",
            "福建": "fujian",
            "江西": "jiangxi",
            "山东": "shandong",
            "河南": "henan",
            "湖北": "hubei",
            "湖南": "hunan",
            "广东": "guangdong",
            "海南": "hainan",
            "四川": "sichuan",
            "贵州": "guizhou",
            "云南": "yunnan",
            "陕西": "shanxi1",
            "甘肃": "gansu",
            "青海": "qinghai",
            //5个自治区
            "新疆": "xinjiang",
            "广西": "guangxi",
            "内蒙古": "neimenggu",
            "宁夏": "ningxia",
            "西藏": "xizang",
            //4个直辖市
            "北京": "beijing",
            "天津": "tianjin",
            "上海": "shanghai",
            "重庆": "chongqing",
            //2个特别行政区
            "香港": "xianggang",
            "澳门": "aomen"
        };

        //直辖市和特别行政区-只有二级地图，没有三级地图
        const special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
        let mapdata: any[] = [];
        //绘制全国地图
        $.getJSON('../json/china.json', data => {
            const d = [];
            for (let i = 0; i < data.features.length; i++) {
                d.push({
                    name: data.features[i].properties.name
                })
            }
            mapdata = d;
            //注册地图
            echarts.registerMap('china', data);
            //绘制地图
            renderMap('china', d);
        });



        //初始化绘制全国地图配置
        let defaultOption = {
            backgroundColor: '#fff',
            title: {
                text: '地图',
                left: 'center',
                textStyle: {
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'normal',
                    fontFamily: "Microsoft YaHei"
                },
                subtextStyle: {
                    color: '#ccc',
                    fontSize: 13,
                    fontWeight: 'normal',
                    fontFamily: "Microsoft YaHei"
                }
            },
            graphic: {
                id: 'goback',
                type: 'circle',
                shape: {r: 20},
                style: {
                    text: '返回',
                    fill: '#eee'
                },
                left: 10,
                top: 10,
                onclick: () => {
                    renderMap('china', mapdata);
                }
            },
            tooltip: {
                trigger: 'item'
            },
            visualMap: {
                min: 0,
                max: 2500,
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],           // 文本，默认为数值文本
                inRange: {
                    color: [this.options.chartColor[2], this.options.chartColor[3]]
                },
                calculable: true
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                    dataView: {readOnly: false},
                    restore: {},
                    saveAsImage: {}
                },
                iconStyle: {
                    normal: {
                        color: '#fff'
                    }
                }
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 1000

        };
        let option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        } else {
            option = defaultOption;
        }



        if(stat.openClick){
            //地图点击事件
            this.chart.on('click', (params:any) => {
                if (params.name in provinces) {
                    //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
                    $.getJSON('../json/province/' + provinces[params.name] + '.json', data => {
                        echarts.registerMap(params.name, data);
                        const d = [];
                        for (let i = 0; i < data.features.length; i++) {
                            d.push({
                                name: data.features[i].properties.name
                            })
                        }
                        renderMap(params.name, d);
                    });
                } else if (params.seriesName in provinces) {
                    //如果是【直辖市/特别行政区】只有二级下钻
                    if (special.indexOf(params.seriesName) >= 0) {
                        renderMap('china', mapdata);
                    } else {
                        //显示县级地图
                        $.getJSON('../json/city/' + cityMap[params.name] + '.json', data => {
                            echarts.registerMap(params.name, data);
                            const d = [];
                            for (let i = 0; i < data.features.length; i++) {
                                d.push({
                                    name: data.features[i].properties.name
                                })
                            }
                            renderMap(params.name, d);
                        });
                    }
                } else {
                    renderMap('china', mapdata);
                }
            });
        }
        let renderMap = (map: any, data: any) => {
            option.title.subtext = map;
            option.series = [
                {
                    name: map,
                    type: 'map',
                    mapType: map,
                    roam: true,
                    nameMap: {
                        'china': '中国'
                    },
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                color: '#999',
                                fontSize: 13
                            }
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                color: '#fff',
                                fontSize: 13
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            areaColor: '#eee',
                            borderColor: 'dodgerblue'
                        },
                        emphasis: {
                            areaColor: 'darkorange'
                        }
                    },
                    data: data
                }
            ];

            //渲染地图
            console.log(JSON.stringify(option));
            this.chart.setOption(option);
        }
    }
}
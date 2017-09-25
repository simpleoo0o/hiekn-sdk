(function (window, $) {
    'use strict';

    window.HieknStatService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                container: null,
                beforeLoad: null,
                data: null,
                config: {},
                baseUrl: null,
                kgName: null,
                chartColor: ['#66d1b9', '#f0cb69', '#88bbf5', '#e99592']
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container);
            self.bindEvent();
        };

        Service.prototype.bindEvent = function () {
            var self = this;
            $(window).on('resize', function () {
                self.chart && self.chart.resize();
            });
        };

        Service.prototype.drawChart = function () {
            var self = this;
            switch (self.options.config.type) {
                case 'bar':
                    self.drawLineBarChart('bar');
                    break;
                case 'line':
                    self.drawLineBarChart('line');
                    break;
                case 'pie':
                    self.drawPieChart();
                    break;
                case 'wordCloud':
                    self.drawWordCloudChart();
                    break;
                case 'radar':
                    self.drawRadarChart();
                    break;
                case 'scatter':
                    self.drawScatterChart();
                    break;
                case 'map':
                    self.drawMapChart();
                    break;
                case 'gauge':
                    self.drawGaugeChart();
                    break;
                case 'heatmap':
                    self.drawHeatmapChart();
                    break;
                case 'solid':
                    self.drawSolidChart();
                    break;
            }
        };

        Service.prototype.drawPieChart = function () {
            var self = this;
            var d = self.stat;
            var stat = self.options.config;
            var legend = [];
            for (var is in d.series) {
                var s = d.series[is];
                if (stat.seriesName) {
                    s.name = stat.seriesName[s.name] || s.name;
                    legend.push(s.name);
                }
            }
            var defaultSeries = {
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
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
                color: self.options.chartColor,
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
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);
        };

        Service.prototype.drawWordCloudChart = function () {
            var self = this;
            var d = self.stat;
            var stat = self.options.config;
            var data = [];
            for (var is in d.series) {
                if (d.series[is].name) {
                    data.push(d.series[is]);
                }
            }
            var defaultSeries = {
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
                        color: function () {
                            return self.options.chartColor[Math.floor(Math.random() * self.options.chartColor.length)];
                        }
                    },
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
                data: data
            };
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {};
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);
        };

        Service.prototype.drawLineBarChart = function (type) {
            var self = this;
            var defaultXAxis = {
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
            var defaultSeries = {
                name: '',
                type: type,
                symbol: 'circle',
                symbolSize: 10
            };
            var d = self.stat;
            var stat = self.options.config;
            var idx = 0;
            var xAxisArr = [];
            for (var xAxisi in d.xAxis) {
                var xAxis = d.xAxis[xAxisi];
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
            var seriesArr = [];
            for (var seriesi in d.series) {
                var series = d.series[seriesi];
                if (stat.chartSettings && stat.chartSettings.series) {
                    if (stat.chartSettings.series instanceof Array) {
                        $.extend(true, defaultSeries, stat.chartSettings.series[idx]);
                    } else {
                        $.extend(true, defaultSeries, stat.chartSettings.series);
                    }
                }
                var s = $.extend(true, {}, defaultSeries, series);
                if (stat.seriesName) {
                    s.name = stat.seriesName[s.name] || s.name;
                }
                seriesArr.push(s);
                idx++;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
                color: self.options.chartColor,
                tooltip: {
                    formatter: function (param) {
                        var str = '';
                        for (var itemi in param) {
                            var item = param[itemi];
                            str += item.seriesName + ':' + item.data + '<br>';
                        }
                        return str;
                    },
                    position: 'top',
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line'
                    }
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
            var option = {};
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
            self.chart.setOption(option);
        };

        Service.prototype.drawRadarChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;

            var defaultSeries = {
                name: '',
                type: 'radar',
                data: data,
                symbol: 'none',
                itemStyle: {
                    normal: {
                        color: self.options.chartColor[0]
                    }
                },
                areaStyle: {
                    normal: {
                        opacity: 0.1
                    }
                }
            };
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
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
                    indicator: [
                        {name: 'AQI', max: 300},
                        {name: 'PM2.5', max: 250},
                        {name: 'PM10', max: 300},
                        {name: 'CO', max: 5},
                        {name: 'NO2', max: 200},
                        {name: 'SO2', max: 100}
                    ],
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
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);
        };

        Service.prototype.drawScatterChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;
            var defaultSeries = {
                name: '散点图',
                data: data,
                type: 'scatter',
                symbolSize: function (data) {
                    return Math.sqrt(data[2]) / 5e2;
                },
                label: {
                    emphasis: {
                        show: true,
                        formatter: function (param) {
                            return param.data[3];
                        },
                        position: 'top'
                    }
                },
                itemStyle: {
                    normal: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(120, 36, 50, 0.5)',
                        shadowOffsetY: 5,
                        color: self.options.chartColor[0]
                    }
                }
            };

            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
                backgroundColor: '#fff',
                title: {
                    text: '散点图'
                },
                legend: {
                    right: 10,
                    data: ['1990']
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
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);

        };

        Service.prototype.drawMapChart = function () {

            //地图容器
            var self = this;
            var stat = self.options.config;
            self.chart = echarts.init(self.$container[0]);
            var data = self.stat;
            //34个省、市、自治区的名字拼音映射数组
            var provinces = {
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
            var special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
            var mapdata = [];
            //绘制全国地图
            $.getJSON('../json/china.json', function (data) {
                var d = [];
                for (var i = 0; i < data.features.length; i++) {
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
            var defaultOption = {
                openClick:false,
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
                    shape: { r: 20 },
                    style: {
                        text: '返回',
                        fill: '#eee'
                    },
                    left: 10,
                    top: 10,
                    onclick: function () {
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
                        color: [self.options.chartColor[2], self.options.chartColor[3]]
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
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            console.log(option.openClick);
            if(option.openClick){
                //地图点击事件
                self.chart.on('click', function (params) {
                    console.log(params.name);
                    if (params.name in provinces) {
                        //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
                        $.getJSON('../json/province/' + provinces[params.name] + '.json', function (data) {
                            echarts.registerMap(params.name, data);
                            var d = [];
                            for (var i = 0; i < data.features.length; i++) {
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
                            $.getJSON('../json/city/' + cityMap[params.name] + '.json', function (data) {
                                echarts.registerMap(params.name, data);
                                var d = [];
                                for (var i = 0; i < data.features.length; i++) {
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

            function renderMap(map, data) {
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
                        data: self.stat
                    }
                ];

                //渲染地图
                self.chart.setOption(option);
            }

        }

        Service.prototype.drawGaugeChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;

            var defaultSeries = {
                name: '业务指标',
                type: 'gauge',
                axisLine: {
                    show: true,
                    lineStyle: {
                        width: 30,
                        shadowBlur: 0,
                        color: [[0.25, self.options.chartColor[2]], [0.5, self.options.chartColor[0]], [0.75, self.options.chartColor[1]], [1, self.options.chartColor[3]]]
                    }
                },
                detail: {formatter: '{value}%'},
                data: [{value: 50, name: '完成率'}]
            };

            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption = {
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
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);

            setInterval(function () {
                option.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
                self.chart.setOption(option, true);
            }, 2000);
        }

        Service.prototype.drawHeatmapChart = function () {
            var direction = 'horizontal';
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;
            var defaultSeries = {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data

            };
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption ={
                title: {
                    top: 30,
                    left: 'center',
                    text: '热力图'
                },
                graphic: {
                    id: 'left-btn',
                    type: 'circle',
                    shape: { r: 20 },
                    style: {
                        text: '+',
                        fill: '#eee'
                    },
                    left: 10,
                    top: 10,
                    onclick: function () {
                        if(direction=='horizontal'){
                            self.chart.setOption(option={
                                title: {
                                    left: 111,
                                },
                                visualMap: {
                                    orient: 'vertical',
                                    left:65
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
                            direction='vertical';
                        }else{
                            self.chart.setOption(option={
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
                            direction='horizontal';
                        }
                    }
                },
                tooltip : {},
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
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            self.chart.setOption(option);

        }

        Service.prototype.drawSolidChart = function () {
            var self = this;
            var d = self.stat;
            var data = d;
            var stat = self.options.config;
            var defaultSeries ={
                name: 'solid',
                type: 'graph',
                layout: 'force',

                force: {
                    repulsion: [100,500],
                    edgeLength:[50,200],
                    gravity:0.1
                },
                tooltip:{
                    formatter:function(params){
                        var sub2="",sub1="";
                        if(!!params.data.subtext1){
                            sub1=params.data.subtext1+'<br />'
                        }
                        if(!!params.data.subtext2){
                            sub2=params.data.subtext2
                        }
                        if(sub1||sub2){
                            return sub1+sub2;
                        }
                    }
                },
                data: data.nodes,
                links: data.links,
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
                        formatter:function(params){
                            return params.data.subtext2
                        }

                    }
                }
            }
            var series = {};
            if (stat.chartSettings && stat.chartSettings.series) {
                series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
            } else {
                series = defaultSeries;
            }
            self.chart = echarts.init(self.$container[0]);
            var defaultOption ={
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
                    formatter: function(name) {
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
            var option = {};
            if (stat.chartSettings) {
                option = $.extend(true, {}, defaultOption, stat.chartSettings);
            } else {
                option = defaultOption;
            }
            option.series = [series];
            console.log(JSON.stringify(option));
            self.chart.setOption(option);
        }

        Service.prototype.load = function () {
            var self = this;
            var param = self.options.data || {};
            var param2 = self.options.data2 || {};
            param2 = $.extend(true, param2, self.options.config.querySettings);
            if (self.options.beforeLoad) {
                param2 = self.options.beforeLoad(param2);
            }
            var $container = self.$container;
            $container.empty();
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'stat/data' + '?' + $.param(param),
                type: 1,
                params: param2,
                success: function (data, textStatus, jqXHR, params) {
                    if (data) {
                        // self.stat = data.rsData[0];
                        // self.stat = radarData;
                        // self.stat = scatterData
                        // self.stat = mapData;
                        // self.stat = heatmap;
                        self.stat = solidData;
                        self.drawChart();
                    }
                },
                that: $container[0]
            });
        };

        return Service;
    }

    var radarData = [
        [55, 9, 56, 0.46, 18, 6, 1]
    ];

    var scatterData = [[28604, 77, 17096869, 'Australia', 1990], [31163, 77.4, 27662440, 'Canada', 1990], [1516, 68, 1154605773, 'China', 1990], [13670, 74.7, 10582082, 'Cuba', 1990], [28599, 75, 4986705, 'Finland', 1990], [29476, 77.1, 56943299, 'France', 1990], [31476, 75.4, 78958237, 'Germany', 1990], [28666, 78.1, 254830, 'Iceland', 1990], [1777, 57.7, 870601776, 'India', 1990], [29550, 79.1, 122249285, 'Japan', 1990], [2076, 67.9, 20194354, 'North Korea', 1990], [12087, 72, 42972254, 'South Korea', 1990], [24021, 75.4, 3397534, 'New Zealand', 1990], [43296, 76.8, 4240375, 'Norway', 1990], [10088, 70.8, 38195258, 'Poland', 1990], [19349, 69.6, 147568552, 'Russia', 1990], [10670, 67.3, 53994605, 'Turkey', 1990], [26424, 75.7, 57110117, 'United Kingdom', 1990], [37062, 75.4, 252847810, 'United States', 1990]]


    var mapData = [
        {name: '北京', value: Math.round(Math.random() * 2000)},
        {name: '天津', value: Math.round(Math.random() * 2000)},
        {name: '上海', value: Math.round(Math.random() * 2000)},
        {name: '重庆', value: Math.round(Math.random() * 2000)},
        {name: '河北', value: Math.round(Math.random() * 2000)},
        {name: '河南', value: Math.round(Math.random() * 2000)},
        {name: '云南', value: Math.round(Math.random() * 2000)},
        {name: '辽宁', value: Math.round(Math.random() * 2000)},
        {name: '黑龙江', value: Math.round(Math.random() * 2000)},
        {name: '湖南', value: Math.round(Math.random() * 2000)},
        {name: '安徽', value: Math.round(Math.random() * 2000)},
        {name: '山东', value: Math.round(Math.random() * 2000)},
        {name: '新疆', value: Math.round(Math.random() * 2000)},
        {name: '江苏', value: Math.round(Math.random() * 2000)},
        {name: '浙江', value: Math.round(Math.random() * 2000)},
        {name: '江西', value: Math.round(Math.random() * 2000)},
        {name: '湖北', value: Math.round(Math.random() * 2000)},
        {name: '广西', value: Math.round(Math.random() * 2000)},
        {name: '甘肃', value: Math.round(Math.random() * 2000)},
        {name: '山西', value: Math.round(Math.random() * 2000)},
        {name: '内蒙古', value: Math.round(Math.random() * 2000)},
        {name: '陕西', value: Math.round(Math.random() * 2000)},
        {name: '吉林', value: Math.round(Math.random() * 2000)},
        {name: '福建', value: Math.round(Math.random() * 2000)},
        {name: '贵州', value: Math.round(Math.random() * 2000)},
        {name: '广东', value: Math.round(Math.random() * 2000)},
        {name: '青海', value: Math.round(Math.random() * 2000)},
        {name: '西藏', value: Math.round(Math.random() * 2000)},
        {name: '四川', value: Math.round(Math.random() * 2000)},
        {name: '宁夏', value: Math.round(Math.random() * 2000)},
        {name: '海南', value: Math.round(Math.random() * 2000)},
        {name: '台湾', value: Math.round(Math.random() * 2000)},
        {name: '香港', value: Math.round(Math.random() * 2000)},
        {name: '澳门', value: Math.round(Math.random() * 2000)},
        {name: '重庆市', value: Math.round(Math.random() * 1000)},
        {name: '北京市', value: Math.round(Math.random() * 1000)},
        {name: '天津市', value: Math.round(Math.random() * 1000)},
        {name: '上海市', value: Math.round(Math.random() * 1000)},
        {name: '香港', value: Math.round(Math.random() * 1000)},
        {name: '澳门', value: Math.round(Math.random() * 1000)},
        {name: '巴音郭楞蒙古自治州', value: Math.round(Math.random() * 1000)},
        {name: '和田地区', value: Math.round(Math.random() * 1000)},
        {name: '哈密地区', value: Math.round(Math.random() * 1000)},
        {name: '阿克苏地区', value: Math.round(Math.random() * 1000)},
        {name: '阿勒泰地区', value: Math.round(Math.random() * 1000)},
        {name: '喀什地区', value: Math.round(Math.random() * 1000)},
        {name: '塔城地区', value: Math.round(Math.random() * 1000)},
        {name: '昌吉回族自治州', value: Math.round(Math.random() * 1000)},
        {name: '克孜勒苏柯尔克孜自治州', value: Math.round(Math.random() * 1000)},
        {name: '吐鲁番地区', value: Math.round(Math.random() * 1000)},
        {name: '伊犁哈萨克自治州', value: Math.round(Math.random() * 1000)},
        {name: '博尔塔拉蒙古自治州', value: Math.round(Math.random() * 1000)},
        {name: '乌鲁木齐市', value: Math.round(Math.random() * 1000)},
        {name: '克拉玛依市', value: Math.round(Math.random() * 1000)},
        {name: '阿拉尔市', value: Math.round(Math.random() * 1000)},
        {name: '图木舒克市', value: Math.round(Math.random() * 1000)},
        {name: '五家渠市', value: Math.round(Math.random() * 1000)},
        {name: '石河子市', value: Math.round(Math.random() * 1000)},
        {name: '那曲地区', value: Math.round(Math.random() * 1000)},
        {name: '阿里地区', value: Math.round(Math.random() * 1000)},
        {name: '日喀则地区', value: Math.round(Math.random() * 1000)},
        {name: '林芝地区', value: Math.round(Math.random() * 1000)},
        {name: '昌都地区', value: Math.round(Math.random() * 1000)},
        {name: '山南地区', value: Math.round(Math.random() * 1000)},
        {name: '拉萨市', value: Math.round(Math.random() * 1000)},
        {name: '呼伦贝尔市', value: Math.round(Math.random() * 1000)},
        {name: '阿拉善盟', value: Math.round(Math.random() * 1000)},
        {name: '锡林郭勒盟', value: Math.round(Math.random() * 1000)},
        {name: '鄂尔多斯市', value: Math.round(Math.random() * 1000)},
        {name: '赤峰市', value: Math.round(Math.random() * 1000)},
        {name: '巴彦淖尔市', value: Math.round(Math.random() * 1000)},
        {name: '通辽市', value: Math.round(Math.random() * 1000)},
        {name: '乌兰察布市', value: Math.round(Math.random() * 1000)},
        {name: '兴安盟', value: Math.round(Math.random() * 1000)},
        {name: '包头市', value: Math.round(Math.random() * 1000)},
        {name: '呼和浩特市', value: Math.round(Math.random() * 1000)},
        {name: '乌海市', value: Math.round(Math.random() * 1000)},
        {name: '海西蒙古族藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '玉树藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '果洛藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '海南藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '海北藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '黄南藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '海东地区', value: Math.round(Math.random() * 1000)},
        {name: '西宁市', value: Math.round(Math.random() * 1000)},
        {name: '甘孜藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '阿坝藏族羌族自治州', value: Math.round(Math.random() * 1000)},
        {name: '凉山彝族自治州', value: Math.round(Math.random() * 1000)},
        {name: '绵阳市', value: Math.round(Math.random() * 1000)},
        {name: '达州市', value: Math.round(Math.random() * 1000)},
        {name: '广元市', value: Math.round(Math.random() * 1000)},
        {name: '雅安市', value: Math.round(Math.random() * 1000)},
        {name: '宜宾市', value: Math.round(Math.random() * 1000)},
        {name: '乐山市', value: Math.round(Math.random() * 1000)},
        {name: '南充市', value: Math.round(Math.random() * 1000)},
        {name: '巴中市', value: Math.round(Math.random() * 1000)},
        {name: '泸州市', value: Math.round(Math.random() * 1000)},
        {name: '成都市', value: Math.round(Math.random() * 1000)},
        {name: '资阳市', value: Math.round(Math.random() * 1000)},
        {name: '攀枝花市', value: Math.round(Math.random() * 1000)},
        {name: '眉山市', value: Math.round(Math.random() * 1000)},
        {name: '广安市', value: Math.round(Math.random() * 1000)},
        {name: '德阳市', value: Math.round(Math.random() * 1000)},
        {name: '内江市', value: Math.round(Math.random() * 1000)},
        {name: '遂宁市', value: Math.round(Math.random() * 1000)},
        {name: '自贡市', value: Math.round(Math.random() * 1000)},
        {name: '黑河市', value: Math.round(Math.random() * 1000)},
        {name: '大兴安岭地区', value: Math.round(Math.random() * 1000)},
        {name: '哈尔滨市', value: Math.round(Math.random() * 1000)},
        {name: '齐齐哈尔市', value: Math.round(Math.random() * 1000)},
        {name: '牡丹江市', value: Math.round(Math.random() * 1000)},
        {name: '绥化市', value: Math.round(Math.random() * 1000)},
        {name: '伊春市', value: Math.round(Math.random() * 1000)},
        {name: '佳木斯市', value: Math.round(Math.random() * 1000)},
        {name: '鸡西市', value: Math.round(Math.random() * 1000)},
        {name: '双鸭山市', value: Math.round(Math.random() * 1000)},
        {name: '大庆市', value: Math.round(Math.random() * 1000)},
        {name: '鹤岗市', value: Math.round(Math.random() * 1000)},
        {name: '七台河市', value: Math.round(Math.random() * 1000)},
        {name: '酒泉市', value: Math.round(Math.random() * 1000)},
        {name: '张掖市', value: Math.round(Math.random() * 1000)},
        {name: '甘南藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '武威市', value: Math.round(Math.random() * 1000)},
        {name: '陇南市', value: Math.round(Math.random() * 1000)},
        {name: '庆阳市', value: Math.round(Math.random() * 1000)},
        {name: '白银市', value: Math.round(Math.random() * 1000)},
        {name: '定西市', value: Math.round(Math.random() * 1000)},
        {name: '天水市', value: Math.round(Math.random() * 1000)},
        {name: '兰州市', value: Math.round(Math.random() * 1000)},
        {name: '平凉市', value: Math.round(Math.random() * 1000)},
        {name: '临夏回族自治州', value: Math.round(Math.random() * 1000)},
        {name: '金昌市', value: Math.round(Math.random() * 1000)},
        {name: '嘉峪关市', value: Math.round(Math.random() * 1000)},
        {name: '普洱市', value: Math.round(Math.random() * 1000)},
        {name: '红河哈尼族彝族自治州', value: Math.round(Math.random() * 1000)},
        {name: '文山壮族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '曲靖市', value: Math.round(Math.random() * 1000)},
        {name: '楚雄彝族自治州', value: Math.round(Math.random() * 1000)},
        {name: '大理白族自治州', value: Math.round(Math.random() * 1000)},
        {name: '临沧市', value: Math.round(Math.random() * 1000)},
        {name: '迪庆藏族自治州', value: Math.round(Math.random() * 1000)},
        {name: '昭通市', value: Math.round(Math.random() * 1000)},
        {name: '昆明市', value: Math.round(Math.random() * 1000)},
        {name: '丽江市', value: Math.round(Math.random() * 1000)},
        {name: '西双版纳傣族自治州', value: Math.round(Math.random() * 1000)},
        {name: '保山市', value: Math.round(Math.random() * 1000)},
        {name: '玉溪市', value: Math.round(Math.random() * 1000)},
        {name: '怒江傈僳族自治州', value: Math.round(Math.random() * 1000)},
        {name: '德宏傣族景颇族自治州', value: Math.round(Math.random() * 1000)},
        {name: '百色市', value: Math.round(Math.random() * 1000)},
        {name: '河池市', value: Math.round(Math.random() * 1000)},
        {name: '桂林市', value: Math.round(Math.random() * 1000)},
        {name: '南宁市', value: Math.round(Math.random() * 1000)},
        {name: '柳州市', value: Math.round(Math.random() * 1000)},
        {name: '崇左市', value: Math.round(Math.random() * 1000)},
        {name: '来宾市', value: Math.round(Math.random() * 1000)},
        {name: '玉林市', value: Math.round(Math.random() * 1000)},
        {name: '梧州市', value: Math.round(Math.random() * 1000)},
        {name: '贺州市', value: Math.round(Math.random() * 1000)},
        {name: '钦州市', value: Math.round(Math.random() * 1000)},
        {name: '贵港市', value: Math.round(Math.random() * 1000)},
        {name: '防城港市', value: Math.round(Math.random() * 1000)},
        {name: '北海市', value: Math.round(Math.random() * 1000)},
        {name: '怀化市', value: Math.round(Math.random() * 1000)},
        {name: '永州市', value: Math.round(Math.random() * 1000)},
        {name: '邵阳市', value: Math.round(Math.random() * 1000)},
        {name: '郴州市', value: Math.round(Math.random() * 1000)},
        {name: '常德市', value: Math.round(Math.random() * 1000)},
        {name: '湘西土家族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '衡阳市', value: Math.round(Math.random() * 1000)},
        {name: '岳阳市', value: Math.round(Math.random() * 1000)},
        {name: '益阳市', value: Math.round(Math.random() * 1000)},
        {name: '长沙市', value: Math.round(Math.random() * 1000)},
        {name: '株洲市', value: Math.round(Math.random() * 1000)},
        {name: '张家界市', value: Math.round(Math.random() * 1000)},
        {name: '娄底市', value: Math.round(Math.random() * 1000)},
        {name: '湘潭市', value: Math.round(Math.random() * 1000)},
        {name: '榆林市', value: Math.round(Math.random() * 1000)},
        {name: '延安市', value: Math.round(Math.random() * 1000)},
        {name: '汉中市', value: Math.round(Math.random() * 1000)},
        {name: '安康市', value: Math.round(Math.random() * 1000)},
        {name: '商洛市', value: Math.round(Math.random() * 1000)},
        {name: '宝鸡市', value: Math.round(Math.random() * 1000)},
        {name: '渭南市', value: Math.round(Math.random() * 1000)},
        {name: '咸阳市', value: Math.round(Math.random() * 1000)},
        {name: '西安市', value: Math.round(Math.random() * 1000)},
        {name: '铜川市', value: Math.round(Math.random() * 1000)},
        {name: '清远市', value: Math.round(Math.random() * 1000)},
        {name: '韶关市', value: Math.round(Math.random() * 1000)},
        {name: '湛江市', value: Math.round(Math.random() * 1000)},
        {name: '梅州市', value: Math.round(Math.random() * 1000)},
        {name: '河源市', value: Math.round(Math.random() * 1000)},
        {name: '肇庆市', value: Math.round(Math.random() * 1000)},
        {name: '惠州市', value: Math.round(Math.random() * 1000)},
        {name: '茂名市', value: Math.round(Math.random() * 1000)},
        {name: '江门市', value: Math.round(Math.random() * 1000)},
        {name: '阳江市', value: Math.round(Math.random() * 1000)},
        {name: '云浮市', value: Math.round(Math.random() * 1000)},
        {name: '广州市', value: Math.round(Math.random() * 1000)},
        {name: '汕尾市', value: Math.round(Math.random() * 1000)},
        {name: '揭阳市', value: Math.round(Math.random() * 1000)},
        {name: '珠海市', value: Math.round(Math.random() * 1000)},
        {name: '佛山市', value: Math.round(Math.random() * 1000)},
        {name: '潮州市', value: Math.round(Math.random() * 1000)},
        {name: '汕头市', value: Math.round(Math.random() * 1000)},
        {name: '深圳市', value: Math.round(Math.random() * 1000)},
        {name: '东莞市', value: Math.round(Math.random() * 1000)},
        {name: '中山市', value: Math.round(Math.random() * 1000)},
        {name: '延边朝鲜族自治州', value: Math.round(Math.random() * 1000)},
        {name: '吉林市', value: Math.round(Math.random() * 1000)},
        {name: '白城市', value: Math.round(Math.random() * 1000)},
        {name: '松原市', value: Math.round(Math.random() * 1000)},
        {name: '长春市', value: Math.round(Math.random() * 1000)},
        {name: '白山市', value: Math.round(Math.random() * 1000)},
        {name: '通化市', value: Math.round(Math.random() * 1000)},
        {name: '四平市', value: Math.round(Math.random() * 1000)},
        {name: '辽源市', value: Math.round(Math.random() * 1000)},
        {name: '承德市', value: Math.round(Math.random() * 1000)},
        {name: '张家口市', value: Math.round(Math.random() * 1000)},
        {name: '保定市', value: Math.round(Math.random() * 1000)},
        {name: '唐山市', value: Math.round(Math.random() * 1000)},
        {name: '沧州市', value: Math.round(Math.random() * 1000)},
        {name: '石家庄市', value: Math.round(Math.random() * 1000)},
        {name: '邢台市', value: Math.round(Math.random() * 1000)},
        {name: '邯郸市', value: Math.round(Math.random() * 1000)},
        {name: '秦皇岛市', value: Math.round(Math.random() * 1000)},
        {name: '衡水市', value: Math.round(Math.random() * 1000)},
        {name: '廊坊市', value: Math.round(Math.random() * 1000)},
        {name: '恩施土家族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '十堰市', value: Math.round(Math.random() * 1000)},
        {name: '宜昌市', value: Math.round(Math.random() * 1000)},
        {name: '襄樊市', value: Math.round(Math.random() * 1000)},
        {name: '黄冈市', value: Math.round(Math.random() * 1000)},
        {name: '荆州市', value: Math.round(Math.random() * 1000)},
        {name: '荆门市', value: Math.round(Math.random() * 1000)},
        {name: '咸宁市', value: Math.round(Math.random() * 1000)},
        {name: '随州市', value: Math.round(Math.random() * 1000)},
        {name: '孝感市', value: Math.round(Math.random() * 1000)},
        {name: '武汉市', value: Math.round(Math.random() * 1000)},
        {name: '黄石市', value: Math.round(Math.random() * 1000)},
        {name: '神农架林区', value: Math.round(Math.random() * 1000)},
        {name: '天门市', value: Math.round(Math.random() * 1000)},
        {name: '仙桃市', value: Math.round(Math.random() * 1000)},
        {name: '潜江市', value: Math.round(Math.random() * 1000)},
        {name: '鄂州市', value: Math.round(Math.random() * 1000)},
        {name: '遵义市', value: Math.round(Math.random() * 1000)},
        {name: '黔东南苗族侗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '毕节地区', value: Math.round(Math.random() * 1000)},
        {name: '黔南布依族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '铜仁地区', value: Math.round(Math.random() * 1000)},
        {name: '黔西南布依族苗族自治州', value: Math.round(Math.random() * 1000)},
        {name: '六盘水市', value: Math.round(Math.random() * 1000)},
        {name: '安顺市', value: Math.round(Math.random() * 1000)},
        {name: '贵阳市', value: Math.round(Math.random() * 1000)},
        {name: '烟台市', value: Math.round(Math.random() * 1000)},
        {name: '临沂市', value: Math.round(Math.random() * 1000)},
        {name: '潍坊市', value: Math.round(Math.random() * 1000)},
        {name: '青岛市', value: Math.round(Math.random() * 1000)},
        {name: '菏泽市', value: Math.round(Math.random() * 1000)},
        {name: '济宁市', value: Math.round(Math.random() * 1000)},
        {name: '德州市', value: Math.round(Math.random() * 1000)},
        {name: '滨州市', value: Math.round(Math.random() * 1000)},
        {name: '聊城市', value: Math.round(Math.random() * 1000)},
        {name: '东营市', value: Math.round(Math.random() * 1000)},
        {name: '济南市', value: Math.round(Math.random() * 1000)},
        {name: '泰安市', value: Math.round(Math.random() * 1000)},
        {name: '威海市', value: Math.round(Math.random() * 1000)},
        {name: '日照市', value: Math.round(Math.random() * 1000)},
        {name: '淄博市', value: Math.round(Math.random() * 1000)},
        {name: '枣庄市', value: Math.round(Math.random() * 1000)},
        {name: '莱芜市', value: Math.round(Math.random() * 1000)},
        {name: '赣州市', value: Math.round(Math.random() * 1000)},
        {name: '吉安市', value: Math.round(Math.random() * 1000)},
        {name: '上饶市', value: Math.round(Math.random() * 1000)},
        {name: '九江市', value: Math.round(Math.random() * 1000)},
        {name: '抚州市', value: Math.round(Math.random() * 1000)},
        {name: '宜春市', value: Math.round(Math.random() * 1000)},
        {name: '南昌市', value: Math.round(Math.random() * 1000)},
        {name: '景德镇市', value: Math.round(Math.random() * 1000)},
        {name: '萍乡市', value: Math.round(Math.random() * 1000)},
        {name: '鹰潭市', value: Math.round(Math.random() * 1000)},
        {name: '新余市', value: Math.round(Math.random() * 1000)},
        {name: '南阳市', value: Math.round(Math.random() * 1000)},
        {name: '信阳市', value: Math.round(Math.random() * 1000)},
        {name: '洛阳市', value: Math.round(Math.random() * 1000)},
        {name: '驻马店市', value: Math.round(Math.random() * 1000)},
        {name: '周口市', value: Math.round(Math.random() * 1000)},
        {name: '商丘市', value: Math.round(Math.random() * 1000)},
        {name: '三门峡市', value: Math.round(Math.random() * 1000)},
        {name: '新乡市', value: Math.round(Math.random() * 1000)},
        {name: '平顶山市', value: Math.round(Math.random() * 1000)},
        {name: '郑州市', value: Math.round(Math.random() * 1000)},
        {name: '安阳市', value: Math.round(Math.random() * 1000)},
        {name: '开封市', value: Math.round(Math.random() * 1000)},
        {name: '焦作市', value: Math.round(Math.random() * 1000)},
        {name: '许昌市', value: Math.round(Math.random() * 1000)},
        {name: '濮阳市', value: Math.round(Math.random() * 1000)},
        {name: '漯河市', value: Math.round(Math.random() * 1000)},
        {name: '鹤壁市', value: Math.round(Math.random() * 1000)},
        {name: '大连市', value: Math.round(Math.random() * 1000)},
        {name: '朝阳市', value: Math.round(Math.random() * 1000)},
        {name: '丹东市', value: Math.round(Math.random() * 1000)},
        {name: '铁岭市', value: Math.round(Math.random() * 1000)},
        {name: '沈阳市', value: Math.round(Math.random() * 1000)},
        {name: '抚顺市', value: Math.round(Math.random() * 1000)},
        {name: '葫芦岛市', value: Math.round(Math.random() * 1000)},
        {name: '阜新市', value: Math.round(Math.random() * 1000)},
        {name: '锦州市', value: Math.round(Math.random() * 1000)},
        {name: '鞍山市', value: Math.round(Math.random() * 1000)},
        {name: '本溪市', value: Math.round(Math.random() * 1000)},
        {name: '营口市', value: Math.round(Math.random() * 1000)},
        {name: '辽阳市', value: Math.round(Math.random() * 1000)},
        {name: '盘锦市', value: Math.round(Math.random() * 1000)},
        {name: '忻州市', value: Math.round(Math.random() * 1000)},
        {name: '吕梁市', value: Math.round(Math.random() * 1000)},
        {name: '临汾市', value: Math.round(Math.random() * 1000)},
        {name: '晋中市', value: Math.round(Math.random() * 1000)},
        {name: '运城市', value: Math.round(Math.random() * 1000)},
        {name: '大同市', value: Math.round(Math.random() * 1000)},
        {name: '长治市', value: Math.round(Math.random() * 1000)},
        {name: '朔州市', value: Math.round(Math.random() * 1000)},
        {name: '晋城市', value: Math.round(Math.random() * 1000)},
        {name: '太原市', value: Math.round(Math.random() * 1000)},
        {name: '阳泉市', value: Math.round(Math.random() * 1000)},
        {name: '六安市', value: Math.round(Math.random() * 1000)},
        {name: '安庆市', value: Math.round(Math.random() * 1000)},
        {name: '滁州市', value: Math.round(Math.random() * 1000)},
        {name: '宣城市', value: Math.round(Math.random() * 1000)},
        {name: '阜阳市', value: Math.round(Math.random() * 1000)},
        {name: '宿州市', value: Math.round(Math.random() * 1000)},
        {name: '黄山市', value: Math.round(Math.random() * 1000)},
        {name: '巢湖市', value: Math.round(Math.random() * 1000)},
        {name: '亳州市', value: Math.round(Math.random() * 1000)},
        {name: '池州市', value: Math.round(Math.random() * 1000)},
        {name: '合肥市', value: Math.round(Math.random() * 1000)},
        {name: '蚌埠市', value: Math.round(Math.random() * 1000)},
        {name: '芜湖市', value: Math.round(Math.random() * 1000)},
        {name: '繁昌县', value: Math.round(Math.random() * 2000)},
        {name: '淮北市', value: Math.round(Math.random() * 1000)},
        {name: '淮南市', value: Math.round(Math.random() * 1000)},
        {name: '马鞍山市', value: Math.round(Math.random() * 1000)},
        {name: '铜陵市', value: Math.round(Math.random() * 1000)},
        {name: '南平市', value: Math.round(Math.random() * 1000)},
        {name: '三明市', value: Math.round(Math.random() * 1000)},
        {name: '龙岩市', value: Math.round(Math.random() * 1000)},
        {name: '宁德市', value: Math.round(Math.random() * 1000)},
        {name: '福州市', value: Math.round(Math.random() * 1000)},
        {name: '漳州市', value: Math.round(Math.random() * 1000)},
        {name: '泉州市', value: Math.round(Math.random() * 1000)},
        {name: '莆田市', value: Math.round(Math.random() * 1000)},
        {name: '厦门市', value: Math.round(Math.random() * 1000)},
        {name: '丽水市', value: Math.round(Math.random() * 1000)},
        {name: '杭州市', value: Math.round(Math.random() * 1000)},
        {name: '温州市', value: Math.round(Math.random() * 1000)},
        {name: '宁波市', value: Math.round(Math.random() * 1000)},
        {name: '舟山市', value: Math.round(Math.random() * 1000)},
        {name: '台州市', value: Math.round(Math.random() * 1000)},
        {name: '金华市', value: Math.round(Math.random() * 1000)},
        {name: '衢州市', value: Math.round(Math.random() * 1000)},
        {name: '绍兴市', value: Math.round(Math.random() * 1000)},
        {name: '嘉兴市', value: Math.round(Math.random() * 1000)},
        {name: '湖州市', value: Math.round(Math.random() * 1000)},
        {name: '盐城市', value: Math.round(Math.random() * 1000)},
        {name: '徐州市', value: Math.round(Math.random() * 1000)},
        {name: '南通市', value: Math.round(Math.random() * 1000)},
        {name: '淮安市', value: Math.round(Math.random() * 1000)},
        {name: '苏州市', value: Math.round(Math.random() * 1000)},
        {name: '宿迁市', value: Math.round(Math.random() * 1000)},
        {name: '连云港市', value: Math.round(Math.random() * 1000)},
        {name: '扬州市', value: Math.round(Math.random() * 1000)},
        {name: '南京市', value: Math.round(Math.random() * 1000)},
        {name: '泰州市', value: Math.round(Math.random() * 1000)},
        {name: '无锡市', value: Math.round(Math.random() * 1000)},
        {name: '常州市', value: Math.round(Math.random() * 1000)},
        {name: '镇江市', value: Math.round(Math.random() * 1000)},
        {name: '吴忠市', value: Math.round(Math.random() * 1000)},
        {name: '中卫市', value: Math.round(Math.random() * 1000)},
        {name: '固原市', value: Math.round(Math.random() * 1000)},
        {name: '银川市', value: Math.round(Math.random() * 1000)},
        {name: '石嘴山市', value: Math.round(Math.random() * 1000)},
        {name: '儋州市', value: Math.round(Math.random() * 1000)},
        {name: '文昌市', value: Math.round(Math.random() * 1000)},
        {name: '乐东黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '三亚市', value: Math.round(Math.random() * 1000)},
        {name: '琼中黎族苗族自治县', value: Math.round(Math.random() * 1000)},
        {name: '东方市', value: Math.round(Math.random() * 1000)},
        {name: '海口市', value: Math.round(Math.random() * 1000)},
        {name: '万宁市', value: Math.round(Math.random() * 1000)},
        {name: '澄迈县', value: Math.round(Math.random() * 1000)},
        {name: '白沙黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '琼海市', value: Math.round(Math.random() * 1000)},
        {name: '昌江黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '临高县', value: Math.round(Math.random() * 1000)},
        {name: '陵水黎族自治县', value: Math.round(Math.random() * 1000)},
        {name: '屯昌县', value: Math.round(Math.random() * 1000)},
        {name: '定安县', value: Math.round(Math.random() * 1000)},
        {name: '保亭黎族苗族自治县', value: Math.round(Math.random() * 1000)},
        {name: '五指山市', value: Math.round(Math.random() * 1000)}
    ];

    var heatmap = [
        [
            "2016-01-01",
            7165
        ],
        [
            "2016-01-02",
            753
        ],
        [
            "2016-01-03",
            5419
        ],
        [
            "2016-01-04",
            1230
        ],
        [
            "2016-01-05",
            4040
        ],
        [
            "2016-01-06",
            5801
        ],
        [
            "2016-01-07",
            1929
        ],
        [
            "2016-01-08",
            6393
        ],
        [
            "2016-01-09",
            6467
        ],
        [
            "2016-01-10",
            4825
        ],
        [
            "2016-01-11",
            7663
        ],
        [
            "2016-01-12",
            2525
        ],
        [
            "2016-01-13",
            1586
        ],
        [
            "2016-01-14",
            3645
        ],
        [
            "2016-01-15",
            7300
        ],
        [
            "2016-01-16",
            3613
        ],
        [
            "2016-01-17",
            907
        ],
        [
            "2016-01-18",
            8878
        ],
        [
            "2016-01-19",
            315
        ],
        [
            "2016-01-20",
            8323
        ],
        [
            "2016-01-21",
            4312
        ],
        [
            "2016-01-22",
            5181
        ],
        [
            "2016-01-23",
            4037
        ],
        [
            "2016-01-24",
            254
        ],
        [
            "2016-01-25",
            3743
        ],
        [
            "2016-01-26",
            5598
        ],
        [
            "2016-01-27",
            5566
        ],
        [
            "2016-01-28",
            4727
        ],
        [
            "2016-01-29",
            7888
        ],
        [
            "2016-01-30",
            7107
        ],
        [
            "2016-01-31",
            2475
        ],
        [
            "2016-02-01",
            9982
        ],
        [
            "2016-02-02",
            2462
        ],
        [
            "2016-02-03",
            9490
        ],
        [
            "2016-02-04",
            6450
        ],
        [
            "2016-02-05",
            3502
        ],
        [
            "2016-02-06",
            9907
        ],
        [
            "2016-02-07",
            9267
        ],
        [
            "2016-02-08",
            887
        ],
        [
            "2016-02-09",
            3886
        ],
        [
            "2016-02-10",
            2772
        ],
        [
            "2016-02-11",
            9255
        ],
        [
            "2016-02-12",
            4778
        ],
        [
            "2016-02-13",
            9590
        ],
        [
            "2016-02-14",
            1762
        ],
        [
            "2016-02-15",
            4037
        ],
        [
            "2016-02-16",
            8241
        ],
        [
            "2016-02-17",
            4576
        ],
        [
            "2016-02-18",
            3588
        ],
        [
            "2016-02-19",
            4176
        ],
        [
            "2016-02-20",
            940
        ],
        [
            "2016-02-21",
            4596
        ],
        [
            "2016-02-22",
            8277
        ],
        [
            "2016-02-23",
            4349
        ],
        [
            "2016-02-24",
            7374
        ],
        [
            "2016-02-25",
            1327
        ],
        [
            "2016-02-26",
            1474
        ],
        [
            "2016-02-27",
            2604
        ],
        [
            "2016-02-28",
            5009
        ],
        [
            "2016-02-29",
            545
        ],
        [
            "2016-03-01",
            1027
        ],
        [
            "2016-03-02",
            9856
        ],
        [
            "2016-03-03",
            9134
        ],
        [
            "2016-03-04",
            7413
        ],
        [
            "2016-03-05",
            779
        ],
        [
            "2016-03-06",
            9312
        ],
        [
            "2016-03-07",
            2969
        ],
        [
            "2016-03-08",
            8281
        ],
        [
            "2016-03-09",
            9725
        ],
        [
            "2016-03-10",
            6446
        ],
        [
            "2016-03-11",
            1587
        ],
        [
            "2016-03-12",
            8191
        ],
        [
            "2016-03-13",
            7800
        ],
        [
            "2016-03-14",
            6753
        ],
        [
            "2016-03-15",
            5407
        ],
        [
            "2016-03-16",
            6817
        ],
        [
            "2016-03-17",
            3055
        ],
        [
            "2016-03-18",
            2291
        ],
        [
            "2016-03-19",
            607
        ],
        [
            "2016-03-20",
            9865
        ],
        [
            "2016-03-21",
            2460
        ],
        [
            "2016-03-22",
            3101
        ],
        [
            "2016-03-23",
            2774
        ],
        [
            "2016-03-24",
            3018
        ],
        [
            "2016-03-25",
            6228
        ],
        [
            "2016-03-26",
            9455
        ],
        [
            "2016-03-27",
            4166
        ],
        [
            "2016-03-28",
            698
        ],
        [
            "2016-03-29",
            3846
        ],
        [
            "2016-03-30",
            8493
        ],
        [
            "2016-03-31",
            2191
        ],
        [
            "2016-04-01",
            1801
        ],
        [
            "2016-04-02",
            7452
        ],
        [
            "2016-04-03",
            4137
        ],
        [
            "2016-04-04",
            7579
        ],
        [
            "2016-04-05",
            132
        ],
        [
            "2016-04-06",
            5070
        ],
        [
            "2016-04-07",
            7516
        ],
        [
            "2016-04-08",
            1209
        ],
        [
            "2016-04-09",
            8816
        ],
        [
            "2016-04-10",
            994
        ],
        [
            "2016-04-11",
            4164
        ],
        [
            "2016-04-12",
            2210
        ],
        [
            "2016-04-13",
            2599
        ],
        [
            "2016-04-14",
            760
        ],
        [
            "2016-04-15",
            4609
        ],
        [
            "2016-04-16",
            6440
        ],
        [
            "2016-04-17",
            6768
        ],
        [
            "2016-04-18",
            8977
        ],
        [
            "2016-04-19",
            6300
        ],
        [
            "2016-04-20",
            1687
        ],
        [
            "2016-04-21",
            5595
        ],
        [
            "2016-04-22",
            9549
        ],
        [
            "2016-04-23",
            6722
        ],
        [
            "2016-04-24",
            9217
        ],
        [
            "2016-04-25",
            7631
        ],
        [
            "2016-04-26",
            8669
        ],
        [
            "2016-04-27",
            5680
        ],
        [
            "2016-04-28",
            5593
        ],
        [
            "2016-04-29",
            1489
        ],
        [
            "2016-04-30",
            8813
        ],
        [
            "2016-05-01",
            5996
        ],
        [
            "2016-05-02",
            5859
        ],
        [
            "2016-05-03",
            1539
        ],
        [
            "2016-05-04",
            8500
        ],
        [
            "2016-05-05",
            7658
        ],
        [
            "2016-05-06",
            5913
        ],
        [
            "2016-05-07",
            5595
        ],
        [
            "2016-05-08",
            4699
        ],
        [
            "2016-05-09",
            8769
        ],
        [
            "2016-05-10",
            5455
        ],
        [
            "2016-05-11",
            4052
        ],
        [
            "2016-05-12",
            1665
        ],
        [
            "2016-05-13",
            1827
        ],
        [
            "2016-05-14",
            7288
        ],
        [
            "2016-05-15",
            1846
        ],
        [
            "2016-05-16",
            2062
        ],
        [
            "2016-05-17",
            1524
        ],
        [
            "2016-05-18",
            6591
        ],
        [
            "2016-05-19",
            9719
        ],
        [
            "2016-05-20",
            7180
        ],
        [
            "2016-05-21",
            6056
        ],
        [
            "2016-05-22",
            7563
        ],
        [
            "2016-05-23",
            7004
        ],
        [
            "2016-05-24",
            6035
        ],
        [
            "2016-05-25",
            7859
        ],
        [
            "2016-05-26",
            5828
        ],
        [
            "2016-05-27",
            2549
        ],
        [
            "2016-05-28",
            8813
        ],
        [
            "2016-05-29",
            6843
        ],
        [
            "2016-05-30",
            819
        ],
        [
            "2016-05-31",
            8091
        ],
        [
            "2016-06-01",
            5243
        ],
        [
            "2016-06-02",
            9546
        ],
        [
            "2016-06-03",
            1454
        ],
        [
            "2016-06-04",
            4590
        ],
        [
            "2016-06-05",
            2884
        ],
        [
            "2016-06-06",
            2009
        ],
        [
            "2016-06-07",
            7719
        ],
        [
            "2016-06-08",
            6076
        ],
        [
            "2016-06-09",
            6
        ],
        [
            "2016-06-10",
            1368
        ],
        [
            "2016-06-11",
            958
        ],
        [
            "2016-06-12",
            2108
        ],
        [
            "2016-06-13",
            5430
        ],
        [
            "2016-06-14",
            9123
        ],
        [
            "2016-06-15",
            7266
        ],
        [
            "2016-06-16",
            6994
        ],
        [
            "2016-06-17",
            7553
        ],
        [
            "2016-06-18",
            5503
        ],
        [
            "2016-06-19",
            9790
        ],
        [
            "2016-06-20",
            9171
        ],
        [
            "2016-06-21",
            7193
        ],
        [
            "2016-06-22",
            5600
        ],
        [
            "2016-06-23",
            8233
        ],
        [
            "2016-06-24",
            5986
        ],
        [
            "2016-06-25",
            3578
        ],
        [
            "2016-06-26",
            7847
        ],
        [
            "2016-06-27",
            8776
        ],
        [
            "2016-06-28",
            7683
        ],
        [
            "2016-06-29",
            6312
        ],
        [
            "2016-06-30",
            5302
        ],
        [
            "2016-07-01",
            6466
        ],
        [
            "2016-07-02",
            2130
        ],
        [
            "2016-07-03",
            3003
        ],
        [
            "2016-07-04",
            4805
        ],
        [
            "2016-07-05",
            6523
        ],
        [
            "2016-07-06",
            3200
        ],
        [
            "2016-07-07",
            755
        ],
        [
            "2016-07-08",
            4613
        ],
        [
            "2016-07-09",
            9498
        ],
        [
            "2016-07-10",
            6824
        ],
        [
            "2016-07-11",
            8485
        ],
        [
            "2016-07-12",
            7620
        ],
        [
            "2016-07-13",
            5433
        ],
        [
            "2016-07-14",
            8490
        ],
        [
            "2016-07-15",
            6329
        ],
        [
            "2016-07-16",
            5340
        ],
        [
            "2016-07-17",
            7672
        ],
        [
            "2016-07-18",
            2813
        ],
        [
            "2016-07-19",
            9240
        ],
        [
            "2016-07-20",
            660
        ],
        [
            "2016-07-21",
            5228
        ],
        [
            "2016-07-22",
            6639
        ],
        [
            "2016-07-23",
            2356
        ],
        [
            "2016-07-24",
            9512
        ],
        [
            "2016-07-25",
            3674
        ],
        [
            "2016-07-26",
            1164
        ],
        [
            "2016-07-27",
            8488
        ],
        [
            "2016-07-28",
            2509
        ],
        [
            "2016-07-29",
            8849
        ],
        [
            "2016-07-30",
            5865
        ],
        [
            "2016-07-31",
            444
        ],
        [
            "2016-08-01",
            4935
        ],
        [
            "2016-08-02",
            6397
        ],
        [
            "2016-08-03",
            3045
        ],
        [
            "2016-08-04",
            6820
        ],
        [
            "2016-08-05",
            9629
        ],
        [
            "2016-08-06",
            9688
        ],
        [
            "2016-08-07",
            6926
        ],
        [
            "2016-08-08",
            7024
        ],
        [
            "2016-08-09",
            8102
        ],
        [
            "2016-08-10",
            9111
        ],
        [
            "2016-08-11",
            2920
        ],
        [
            "2016-08-12",
            4023
        ],
        [
            "2016-08-13",
            1161
        ],
        [
            "2016-08-14",
            8790
        ],
        [
            "2016-08-15",
            8739
        ],
        [
            "2016-08-16",
            593
        ],
        [
            "2016-08-17",
            9393
        ],
        [
            "2016-08-18",
            5334
        ],
        [
            "2016-08-19",
            902
        ],
        [
            "2016-08-20",
            878
        ],
        [
            "2016-08-21",
            8620
        ],
        [
            "2016-08-22",
            7869
        ],
        [
            "2016-08-23",
            170
        ],
        [
            "2016-08-24",
            3911
        ],
        [
            "2016-08-25",
            1424
        ],
        [
            "2016-08-26",
            1190
        ],
        [
            "2016-08-27",
            1859
        ],
        [
            "2016-08-28",
            8349
        ],
        [
            "2016-08-29",
            724
        ],
        [
            "2016-08-30",
            3586
        ],
        [
            "2016-08-31",
            9913
        ],
        [
            "2016-09-01",
            372
        ],
        [
            "2016-09-02",
            6500
        ],
        [
            "2016-09-03",
            6284
        ],
        [
            "2016-09-04",
            7333
        ],
        [
            "2016-09-05",
            2166
        ],
        [
            "2016-09-06",
            7016
        ],
        [
            "2016-09-07",
            4958
        ],
        [
            "2016-09-08",
            4716
        ],
        [
            "2016-09-09",
            4644
        ],
        [
            "2016-09-10",
            4594
        ],
        [
            "2016-09-11",
            2107
        ],
        [
            "2016-09-12",
            5665
        ],
        [
            "2016-09-13",
            174
        ],
        [
            "2016-09-14",
            854
        ],
        [
            "2016-09-15",
            107
        ],
        [
            "2016-09-16",
            9854
        ],
        [
            "2016-09-17",
            3792
        ],
        [
            "2016-09-18",
            5297
        ],
        [
            "2016-09-19",
            5219
        ],
        [
            "2016-09-20",
            4407
        ],
        [
            "2016-09-21",
            5945
        ],
        [
            "2016-09-22",
            3075
        ],
        [
            "2016-09-23",
            189
        ],
        [
            "2016-09-24",
            4446
        ],
        [
            "2016-09-25",
            1003
        ],
        [
            "2016-09-26",
            1304
        ],
        [
            "2016-09-27",
            8106
        ],
        [
            "2016-09-28",
            4664
        ],
        [
            "2016-09-29",
            5359
        ],
        [
            "2016-09-30",
            9839
        ],
        [
            "2016-10-01",
            9195
        ],
        [
            "2016-10-02",
            3415
        ],
        [
            "2016-10-03",
            7954
        ],
        [
            "2016-10-04",
            7699
        ],
        [
            "2016-10-05",
            5625
        ],
        [
            "2016-10-06",
            6656
        ],
        [
            "2016-10-07",
            3323
        ],
        [
            "2016-10-08",
            9146
        ],
        [
            "2016-10-09",
            7858
        ],
        [
            "2016-10-10",
            4223
        ],
        [
            "2016-10-11",
            294
        ],
        [
            "2016-10-12",
            8542
        ],
        [
            "2016-10-13",
            9094
        ],
        [
            "2016-10-14",
            493
        ],
        [
            "2016-10-15",
            8424
        ],
        [
            "2016-10-16",
            5608
        ],
        [
            "2016-10-17",
            6049
        ],
        [
            "2016-10-18",
            8845
        ],
        [
            "2016-10-19",
            328
        ],
        [
            "2016-10-20",
            8225
        ],
        [
            "2016-10-21",
            5339
        ],
        [
            "2016-10-22",
            935
        ],
        [
            "2016-10-23",
            1644
        ],
        [
            "2016-10-24",
            1267
        ],
        [
            "2016-10-25",
            5356
        ],
        [
            "2016-10-26",
            8331
        ],
        [
            "2016-10-27",
            8756
        ],
        [
            "2016-10-28",
            6504
        ],
        [
            "2016-10-29",
            4880
        ],
        [
            "2016-10-30",
            3974
        ],
        [
            "2016-10-31",
            5896
        ],
        [
            "2016-11-01",
            6658
        ],
        [
            "2016-11-02",
            6919
        ],
        [
            "2016-11-03",
            1312
        ],
        [
            "2016-11-04",
            7943
        ],
        [
            "2016-11-05",
            9403
        ],
        [
            "2016-11-06",
            7677
        ],
        [
            "2016-11-07",
            7706
        ],
        [
            "2016-11-08",
            6078
        ],
        [
            "2016-11-09",
            201
        ],
        [
            "2016-11-10",
            2471
        ],
        [
            "2016-11-11",
            1997
        ],
        [
            "2016-11-12",
            7274
        ],
        [
            "2016-11-13",
            2339
        ],
        [
            "2016-11-14",
            5917
        ],
        [
            "2016-11-15",
            6966
        ],
        [
            "2016-11-16",
            6619
        ],
        [
            "2016-11-17",
            63
        ],
        [
            "2016-11-18",
            9325
        ],
        [
            "2016-11-19",
            8396
        ],
        [
            "2016-11-20",
            3786
        ],
        [
            "2016-11-21",
            4792
        ],
        [
            "2016-11-22",
            8724
        ],
        [
            "2016-11-23",
            6157
        ],
        [
            "2016-11-24",
            3979
        ],
        [
            "2016-11-25",
            1276
        ],
        [
            "2016-11-26",
            4313
        ],
        [
            "2016-11-27",
            8642
        ],
        [
            "2016-11-28",
            6285
        ],
        [
            "2016-11-29",
            71
        ],
        [
            "2016-11-30",
            7244
        ],
        [
            "2016-12-01",
            6747
        ],
        [
            "2016-12-02",
            9588
        ],
        [
            "2016-12-03",
            5975
        ],
        [
            "2016-12-04",
            9949
        ],
        [
            "2016-12-05",
            769
        ],
        [
            "2016-12-06",
            4748
        ],
        [
            "2016-12-07",
            4864
        ],
        [
            "2016-12-08",
            2209
        ],
        [
            "2016-12-09",
            1366
        ],
        [
            "2016-12-10",
            485
        ],
        [
            "2016-12-11",
            7382
        ],
        [
            "2016-12-12",
            3169
        ],
        [
            "2016-12-13",
            3502
        ],
        [
            "2016-12-14",
            5425
        ],
        [
            "2016-12-15",
            3677
        ],
        [
            "2016-12-16",
            7708
        ],
        [
            "2016-12-17",
            9298
        ],
        [
            "2016-12-18",
            3671
        ],
        [
            "2016-12-19",
            2446
        ],
        [
            "2016-12-20",
            8867
        ],
        [
            "2016-12-21",
            1100
        ],
        [
            "2016-12-22",
            8020
        ],
        [
            "2016-12-23",
            9828
        ],
        [
            "2016-12-24",
            793
        ],
        [
            "2016-12-25",
            3032
        ],
        [
            "2016-12-26",
            5902
        ],
        [
            "2016-12-27",
            2608
        ],
        [
            "2016-12-28",
            6739
        ],
        [
            "2016-12-29",
            2971
        ],
        [
            "2016-12-30",
            263
        ],
        [
            "2016-12-31",
            9944
        ]
    ];

    var solidData = {
        nodes: [{
            "name": "刘备2239",
            "value": 20,
            subtext:'mings',
            subtext2:'mingssss',
            "symbolSize": 40,
            "draggable": "true"
        },{
            "name": "关羽",
            // "x": 0,
            // y: 0,
            "symbolSize": 10,
            "draggable": "true",
            "value":20
        },{
            "name": "曹操",
            // "x": 0,
            // y: 0,
            "symbolSize": 30,
            "draggable": "true",
            "value":20,
            // symbolOffset:['50%','50%']
        },{
            "name": "许褚",
            "value": 100,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "典韦",
            "value": 100,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "玄德",
            "value": 20,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "曹冲",
            "value": 50,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "张辽",
            "value": 50,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "关云",
            "value": 20,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "张飞",
            "value": 20,
            "symbolSize": 10,
            "draggable": "true"
        },{
            "name": "云长",
            "value": 10,
            "symbolSize": 10,
            "draggable": "true"
        }],
        links:[{
            "source": "刘备2239",
            "target": "曹操",
            value:30,
            subtext1:'ming'
        },{
            "source": "刘备2239",
            "target": "张飞",
            value:300
        },{
            "source": "关羽",
            "target": "云长",
            value:300
        },{
            "source": "刘备2239",
            "target": "关云",
            value:300
        },{
            "source": "刘备2239",
            "target": "玄德",
            value:300
        },{
            "source": "刘备2239",
            "target": "关羽",
            value:300
        },{
            "source": "曹操",
            "target": "典韦",
            value:300
        },{
            "source": "曹操",
            "target": "许褚",
            value:300
        },{
            "source": "曹操",
            "target": "曹冲",
            value:300
        },{
            "source": "曹操",
            "target": "张辽",
            value:300
        }]
    }
})(window, jQuery);
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
            window.onresize = function () {
                self.chart && self.chart.resize();
            }
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

        Service.prototype.load = function () {
            var self = this;
            var param = self.options.data || {};
            param = $.extend(true, param, self.options.config.querySettings);
            if (self.options.beforeLoad) {
                param = self.options.beforeLoad(param);
            }
            var $container = self.$container;
            $container.empty();
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'stat/data',
                type: 1,
                params: param,
                success: function (data, textStatus, jqXHR, params) {
                    if (data) {
                        self.stat = data.rsData[0];
                        self.drawChart();
                    }
                },
                that: $container[0]
            });
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    'use strict';

    window.HieknResourceService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                baseUrl: null,
                beforeLoad: $.noop,
                container: null,
                config: {},
                data: null,
                onLoad: $.noop
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.getQuery = function () {
            var self = this;
            var must = [];
            var filter = self.tableService.getFilterOptions();
            for (var key in filter) {
                var should = [];
                var value = filter[key];
                var filterConfig = _.find(self.options.config.filter, ['key', key]);
                if (filterConfig.type == 'year' || filterConfig.type == 'month') {
                    for (var i in value) {
                        var year = value[i];
                        var from = '';
                        var to = '';
                        if (filterConfig.type == 'year') {
                            from = moment(year + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                            to = moment((parseInt(year, 10) + 1) + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                        } else {
                            from = moment(year + '-01').format(filterConfig.format || 'YYYY-MM');
                            to = moment((parseInt(year, 10) + 1) + '-01').format(filterConfig.format || 'YYYY-MM');
                        }
                        var obj = {};
                        obj[key] = {
                            from: from,
                            to: to,
                            include_lower: true,
                            include_upper: false
                        };
                        var rangeObj = {
                            range: obj
                        };
                        should.push(rangeObj);
                    }
                } else {
                    var obj = {};
                    obj[key] = value;
                    var termObj = {
                        terms: obj
                    };
                    should.push(termObj);
                }
                must.push({
                    bool: {
                        should: should,
                        minimum_should_match: 1
                    }
                });
            }
            var kw = self.tableService.getFilterKw();
            if (kw) {
                var should = [];
                var fields = self.options.config.fieldsKw || self.options.config.fieldsTable || self.options.config.fields;
                var obj = {};
                obj.query = kw;
                obj.fields = fields;
                var termObj = {
                    query_string: obj
                };
                should.push(termObj);
                must.push({
                    bool: {
                        should: should,
                        minimum_should_match: 1
                    }
                });
            }
            return {
                bool: {
                    must: must
                }
            };
        };

        Service.prototype.init = function () {
            var self = this;
            var config = {
                config: self.options.config,
                container: self.options.container,
                load: function (pageNo, instance) {
                    self.load(pageNo, instance);
                }
            };
            self.tableService = new HieknTableService(config);
        };

        Service.prototype.loadData = function (pageNo) {
            var self = this;
            self.tableService.loadData(pageNo);
        };

        Service.prototype.load = function (pageNo, instance) {
            var self = this;
            self.query = self.getQuery();
            self.options.beforeLoad(self);
            var res = self.options.config;
            var param = self.options.data || {};
            param.databases = res.databases;
            param.tables = res.tables;
            param.fields = res.fields;
            param.query = JSON.stringify(self.query);
            param.pageNo = pageNo;
            param.pageSize = param.pageSize || 15;
            var $container = instance.getTableContainer();
            $container.empty();
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'search',
                type: 1,
                params: param,
                success: function (data, textStatus, jqXHR, params) {
                    if (data) {
                        instance.drawPage(data.rsCount, params.pageNo, params.pageSize);
                        instance.drawData(data.rsData);
                    } else {
                        instance.drawPage(0, params.pageNo, params.pageSize);
                    }
                    self.options.onLoad(data, self);
                },
                that: $container[0]
            });
        };

        return Service;
    }
})(window, jQuery);
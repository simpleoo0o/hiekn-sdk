(function (window, $) {
    'use strict';

    window.HieknTableService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                container: null,
                config: {},
                load: $.noop
            };
            self.$container = null;
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
            return self;
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container).addClass('hiekn-table');
            self.$container.append('<div class="hiekn-table-filter">' +
                '</div>' +
                '<div class="hiekn-table-content"></div>' +
                '<div class="hiekn-table-page">' +
                '<div class="pagination-outter">' +
                '<ul class="pagination"></ul>' +
                '</div>' +
                '</div>');
            self.buildFilter();
            self.bindEvent();
        };

        Service.prototype.bindEvent = function () {
            var self = this;
            self.bindFilterEvent();
            self.bindTableEvent();
        };

        Service.prototype.bindFilterEvent = function () {
            var self = this;
            this.select('.hiekn-table-filter').on('click', 'span[option-value]', function (event) {
                var $item = $(event.target);
                var key = $item.attr('option-key');
                var value = $item.attr('option-value');
                if ($item.closest('.hiekn-table-filter-item').hasClass('multi')) {
                    $item.toggleClass('active');
                } else {
                    if (!$item.hasClass('active')) {
                        $item.addClass('active').siblings('.active').removeClass('active');
                    } else {
                        $item.removeClass('active');
                    }
                    self.loadData(1);
                }
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-more', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').addClass('expend');
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-less', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').removeClass('expend');
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-multi', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').addClass('multi');
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-confirm', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').removeClass('multi');
                self.loadData(1);
            });
            this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-cancel', function (event) {
                var $item = $(event.target);
                $item.closest('.hiekn-table-filter-item').removeClass('multi');
            });
            this.select('.hiekn-table-search-kw-container').on('keydown', 'input', function (event) {
                var key = window.event ? event.keyCode : event.which;
                if (key == 13) {
                    self.loadData(1);
                }
            });
        };

        Service.prototype.bindTableEvent = function () {
            var self = this;
            self.select('.hiekn-table-content').on('click', '.hiekn-table-data-angle', function () {
                $(this).toggleClass('on').closest('tr').next('tr.hiekn-table-detail-line').toggleClass('hide');
            });
        };

        Service.prototype.buildFilter = function () {
            var self = this;
            var filterHtml = '';
            var filters = self.options.config.filter;
            for (var i in filters) {
                var filter = filters[i];
                var label = filter.label || filter.key;
                var filterOptions = '';
                for (var j in filter.options) {
                    var item = filter.options[j];
                    if (item instanceof Object) {
                        filterOptions += '<span option-value="' + item.value + '" option-key="' + filter.key + '">' + item.key + '</span>';
                    } else {
                        filterOptions += '<span option-value="' + item + '" option-key="' + filter.key + '">' + item + '</span>';
                    }
                }
                filterHtml += '<div class="hiekn-table-filter-item">' +
                    '<div class="hiekn-table-filter-item-label">' + label + '：</div>' +
                    '<div class="hiekn-table-filter-item-content">' + filterOptions + '' +
                    '<div class="hiekn-table-more-container">' +
                    '<span class="hiekn-table-filter-more">更多 <i class="fa fa-angle-down"></i></span>' +
                    '<span class="hiekn-table-filter-less">收起 <i class="fa fa-angle-up"></i></span>' +
                    '<span class="hiekn-table-filter-multi"><i class="fa fa-plus"></i> 多选</span>' +
                    '<button class="btn btn-primary hiekn-table-btn-confirm">确定</button>' +
                    '<button class="btn btn-primary-outline hiekn-table-btn-cancel">取消</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }
            filterHtml += '<div class="hiekn-table-filter-item hiekn-table-filter-item-kw">' +
                '<div class="hiekn-table-filter-item-label">关键词：</div>' +
                '<div class="hiekn-table-filter-item-content">' +
                '<div class="hiekn-table-search-kw-container"><input type="text"><button class="btn btn-primary hiekn-table-btn-confirm">确定</button></div>' +
                '</div>' +
                '</div>';
            self.select('.hiekn-table-filter').html(filterHtml);
        };

        Service.prototype.dealContent = function (d) {
            if (d) {
                var text = $('<div>' + d + '</div>').text();
                if (text.length > 80) {
                    return text.substring(0, 80) + '...';
                } else {
                    return text;
                }
            } else {
                return '';
            }
        };

        Service.prototype.drawPage = function (count, pageNo, pageSize) {
            var self = this;
            hieknjs.gentPage({
                data: Math.ceil(count / pageSize),
                cur: pageNo,
                p: self.select('.pagination'),
                event: function (data, pageNo) {
                    self.loadData(pageNo);
                }
            });
        };

        Service.prototype.drawData = function (data) {
            var self = this;
            var res = self.options.config;
            data = hieknjs.dealNull(data);
            self.data = data;
            var ths = '<thead><tr>';
            var trs = '<tbody>';
            var fields = res.fieldsTable || res.fields;
            var fieldsName = res.fieldsTableName ? res.fieldsTableName : (res.fieldsName ? res.fieldsName : fields);
            var drawDetail = res.drawDetail || res.fieldsDetail || res.fieldsTable;
            var fieldsDetail = res.fieldsDetail || res.fields;
            var fieldsNameDetail = res.fieldsDetailName ? res.fieldsDetailName : (res.fieldsName ? res.fieldsName : fields);
            var fieldsRenderer = res.fieldsRenderer || {};
            var fieldsLink = {};
            if (drawDetail) {
                ths += '<th></th>';
            }
            for (var fidx in fields) {
                var renderer = fieldsRenderer[fields[fidx]];
                if (renderer && renderer instanceof Object && renderer.type == 'link' && renderer.fields) {
                    for (var i in renderer.fields) {
                        var f = renderer.fields[i];
                        fieldsLink[f] = fields[fidx];
                    }
                    continue;
                }
                ths += '<th>' + fieldsName[fidx] + '</th>';
            }
            for (var l in data) {
                var d = data[l];
                var tr = '<tr>';
                if (drawDetail) {
                    tr += '<td class="hiekn-table-data-angle"><i class="fa fa-caret-right"></i></td>';
                }
                var len = 0;
                for (var j in fields) {
                    len++;
                    var k = fields[j];
                    if (!fieldsRenderer[k] || !fieldsRenderer[k].fields) {
                        tr += '<td>' + self.rendererFields(d, k, fieldsLink, fieldsRenderer, true) + '</td>';
                    }
                }
                tr += '</tr>';
                trs += tr;
                if (drawDetail) {
                    var trDetail = '<tr class="hiekn-table-detail-line hide"><td colspan="' + (len + 1) + '">';
                    for (var i in fieldsDetail) {
                        var k = fieldsDetail[i];
                        if (!fieldsRenderer[k] || !fieldsRenderer[k].fields) {
                            trDetail += '<div class="hiekn-table-detail-' + k + '"><label>' + fieldsNameDetail[i] + ':</label>' + self.rendererFields(d, k, fieldsLink, fieldsRenderer, false) + '</div>';
                        }
                    }
                    trDetail += '</td></tr>';
                    trs += trDetail;
                }
            }
            trs += '</body>';
            ths += '</tr></thead>';
            self.select('.hiekn-table-content').html('<table class="hiekn-table-normal">' + ths + trs + '</table>');
        };

        Service.prototype.getFilterKw = function () {
            var self = this;
            var $item = self.select('.hiekn-table-search-kw-container');
            return $item.find('input').val();
        };

        Service.prototype.getFilterOptions = function () {
            var self = this;
            var filterOptions = {};
            self.select('.hiekn-table-filter-item').each(function (i, v) {
                var key = '';
                var $items = $(v).find('span[option-value].active');
                if ($items.length) {
                    var hasAll = false;
                    var value = [];
                    $items.each(function (j, e) {
                        var ov = $(e).attr('option-value');
                        if (!ov) {
                            hasAll = true;
                        } else {
                            key = $(e).attr('option-key');
                            value.push(ov);
                        }
                    });
                    if (!hasAll) {
                        filterOptions[key] = value;
                    }
                }
            });
            return filterOptions;
        };

        Service.prototype.getTableContainer = function () {
            var self = this;
            return self.select('.hiekn-table-content');
        };

        Service.prototype.getValues = function (value) {
            var values = [];
            if (value instanceof Array) {
                values = value;
            } else if (typeof value == 'string') {
                if (value.indexOf('[') == 0) {
                    try {
                        values = JSON.parse(value);
                    } catch (e) {
                        values = [value];
                    }
                } else {
                    values = value.split(',');
                }
            }
            return values;
        };

        Service.prototype.loadData = function (pageNo) {
            var self = this;
            self.options.load(pageNo, self);
        };

        Service.prototype.rendererDateTime = function (v) {
            return moment(v).format('YYYY-MM-DD HH:mm:ss');
        };

        Service.prototype.rendererDate = function (v) {
            return moment(v).format('YYYYMMDD');
        };

        Service.prototype.rendererFields = function (d, k, fieldsLink, fieldsRenderer, short) {
            var self = this;
            var str = '';
            if (d[k]) {
                var values = self.getValues(d[k]);
                for (var idx in values) {
                    if (!fieldsRenderer[k]) {
                        str += ',' + self.rendererValue('string', values[idx], undefined, short);
                    } else {
                        str += ',' + self.rendererValue(fieldsRenderer[k].type || fieldsRenderer[k], values[idx], fieldsRenderer[k], short);
                    }
                }
                str = str.substring(1);
            }
            if (fieldsLink[k]) {
                var name = d[k];
                if (!d[k]) {
                    name = '链接';
                }
                str = self.rendererLink(d[fieldsLink[k]], name);
            }
            return str;
        };

        Service.prototype.rendererYear = function (v) {
            return moment(v).format('YYYY');
        };

        Service.prototype.rendererLink = function (v, name, cls) {
            name = name || '查看';
            cls = cls || '';
            return v ? '<a href="' + v + '" target="_blank" class="' + cls + '">' + name + '</a>' : '';
        };

        Service.prototype.rendererValue = function (type, value, fieldsRenderer, short) {
            var self = this;
            var str = '';
            try {
                if (type == 'year') {
                    str = self.rendererYear(value);
                } else if (type == 'date') {
                    str = self.rendererDate(value);
                } else if (type == 'dateTime') {
                    str = self.rendererDateTime(value);
                } else if (type == 'json') {
                    str = JSON.stringify(value);
                } else if (type == 'link') {
                    str = self.rendererLink(value, fieldsRenderer.name, 'hiekn-table-btn-link');
                } else if (type == 'string' && short) {
                    str = self.dealContent(value);
                } else {
                    str = hieknjs.safeHTML(value);
                }
            } catch (e) {

            }
            return str;
        };

        Service.prototype.select = function (selector) {
            var self = this;
            return self.$container.find(selector);
        };

        return Service;
    }
})(window, jQuery);
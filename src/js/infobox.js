(function (window, $) {
    'use strict';

    window.HieknInfoboxService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                selector: null,
                data: null,
                baseUrl: null,
                kgName: null,
                enableLink: false,
                autoLen: true,
                imagePrefix: null,
                onLoad: $.noop,
                href: null
            };
            self.options = $.extend(true, {}, defaultSettings, options);
        };

        Service.prototype.href = function (id) {
            var self = this;
            self.load(id, self.callback);
        };

        Service.prototype.initEvent = function ($container) {
            var self = this;
            $container.on('click', '.hiekn-infobox-link', function () {
                var id = $(this).attr('data-id');
                self.options.href ? self.options.href(id, self) : self.href(id);
            });
            $container.on('click', '.hiekn-infobox-info-detail a', function () {
                $(this).closest('.hiekn-infobox-info-detail').toggleClass('on');
            });
        };

        Service.prototype.buildEntity = function (entity, buildLink) {
            var self = this;
            var meaningTag = entity.meaningTag ? '(' + entity.meaningTag + ')' : '';
            var html = '<span class="hiekn-infobox-name">' + entity.name + '<span class="hiekn-infobox-meaningTag">' + meaningTag + '</span></span>';
            if (buildLink && self.options.enableLink) {
                return '<a href="javascript:void(0)" class="hiekn-infobox-link" data-id="' + entity.id + '">' + html + '</a>';
            }
            return html;
        };

        Service.prototype.buildExtra = function (extra) {
            var self = this;
            var detail = extra.v || '-';
            if (self.options.autoLen && extra.v.length > 80) {
                detail = '<span class="hiekn-infobox-info-detail-short">' + extra.v.substring(0, 56) + '<a href="javascript:void(0)">查看全部&gt;&gt;</a></span><span class="hiekn-infobox-info-detail-long">' + extra.v + '<a href="javascript:void(0)">收起&lt;&lt;</a></span>';
            }
            return '<tr><td class="hiekn-infobox-info-label">' + extra.k + '</td><td class="hiekn-infobox-info-detail">' + detail + '</td></tr>';
        };

        Service.prototype.load = function (id, callback, onFailed) {
            var self = this;
            var param = self.options.data || {};
            var param2 = self.options.data2 || {};
            param2.kgName = self.options.kgName;
            param2.id = id;
            hieknjs.kgLoader({
                url: self.options.baseUrl + 'infobox' + '?' + $.param(param),
                type: 1,
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        if (callback) {
                            self.callback = callback;
                            callback(data);
                        } else if (self.options.selector) {
                            var $container = self.buildInfobox(data);
                            $(self.options.selector).html($container);
                            self.initEvent($container);
                        } else {
                            console.error('selector or callback must be config');
                        }
                        self.options.onLoad(data);
                    } else {
                        onFailed && onFailed();
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                    onFailed && onFailed();
                }
            });
        };

        Service.prototype.buildInfobox = function (data) {
            var self = this;
            var $infoxbox = $('<div class="hiekn-infobox"></div>');
            if (data.self) {
                $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"></div>');
                var entity = self.buildEntity(data.self, false);
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + entity + '</div>');
                if(data.self.img) {
                    var imgUlrl = data.self.img;
                    if(data.self.img.indexOf('http') != 0){
                        imgUlrl = self.options.imagePrefix + data.self.img + '?_=' + Math.round(new Date() / 3600000);
                    }
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-img"><img src="' + imgUlrl + '" alt=""></div>');
                }
                if (data.self.extra) {
                    var html = '';
                    for (var i in data.self.extra) {
                        var extra = data.self.extra[i];
                        html += self.buildExtra(extra);
                    }
                    if (data.atts) {
                        for (var m in data.atts) {
                            if (data.atts.hasOwnProperty(m)) {
                                var att = data.atts[m];
                                var lis = '';
                                for (var j in att.v) {
                                    var obj = att.v[j];
                                    var entity = self.buildEntity(obj, true);
                                    lis += '<li>' + entity + '</li>';
                                }
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            }
                        }
                    }
                    $infoxbox.find('.hiekn-infobox-body').append('<table><tbody>' + html + '</tbody></table>');
                }
                if (data.pars) {
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                    for (var k in data.pars) {
                        var obj = data.pars[k];
                        var entity = self.buildEntity(obj, true);
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + entity + '</li>');
                    }
                }
                if (data.sons) {
                    var html = '';
                    for (var l in data.sons) {
                        var obj = data.sons[l];
                        var entity = self.buildEntity(obj, true);
                        html += '<li>' + entity + '</li>';
                    }
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">相关：</label><ul>' + html + '</ul></div>');
                }
            } else {
                $infoxbox.append('InfoBox读取错误');
            }
            return $infoxbox;
        };

        Service.prototype.buildTabInfobox = function (data) {
            var self = this;
            var $infoxbox = $('<div class="hiekn-infobox hiekn-infobox-tab"></div>');
            if (data.self) {
                $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"><ul class="nav nav-tabs" role="tablist"></ul><div class="tab-content"></div></div>');
                var entity = self.buildEntity(data.self, false);
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + entity + '</div>');
                if (data.self.extra) {
                    var html = '';
                    for (var i in data.self.extra) {
                        var extra = data.self.extra[i];
                        html += self.buildExtra(extra);
                    }
                    var id = 'hiekn-infobox-' + new Date().getTime() + '-' + data.self.id;
                    $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation" class="active"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">基本信息</a></li>');
                    $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-detail tab-pane active" id="' + id + '"><table><tbody>' + html + '</tbody></table></div>');
                }
                if (data.pars) {
                    $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                    for (var k in data.pars) {
                        var obj = data.pars[k];
                        var entity = self.buildEntity(obj, true);
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + entity + '</li>');
                    }
                }
                if (data.sons) {
                    var html = '';
                    for (var l in data.sons) {
                        var obj = data.sons[l];
                        var entity = self.buildEntity(obj, true);
                        html += '<li>' + entity + '</li>';
                    }
                    var id = 'hiekn-infobox-' + new Date().getTime() + '-sons-' + data.self.id;
                    $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">子节点</a></li>');
                    $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
                }
                if (data.atts) {
                    for (var m in data.atts) {
                        if (data.atts.hasOwnProperty(m)) {
                            var att = data.atts[m];
                            var html = '';
                            for (var j in att.v) {
                                var obj = att.v[j];
                                var entity = self.buildEntity(obj, true);
                                html += '<li>' + entity + '</li>';
                            }
                            var id = 'hiekn-infobox-' + new Date().getTime() + '-att-' + m + '-' + data.self.id;
                            $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">' + att.k + '</a></li>');
                            $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
                        }
                    }
                }
            } else {
                $infoxbox.append('InfoBox读取错误');
            }
            return $infoxbox;
        };

        return Service;
    }
})(window, jQuery);
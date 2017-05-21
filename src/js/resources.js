(function (window, $) {
    'use strict';

    window.HieknResourcesService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                baseUrl: null,
                beforeLoad: $.noop,
                container: null,
                configs: [],
                namespace: 'hiekn-resource',
                data: null
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.resourcesService = [];
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container);
            self.$headContainer = $('<div class="hiekn-resource-nav-container">' +
                '<ul class="hiekn-resource-nav nav nav-tabs" role="tablist"></ul>' +
                '<div class="hiekn-resource-nav-more hide">更多</div>' +
                '<div class="hiekn-resource-nav-more-container hide">' +
                '<ul class="hiekn-resource-nav-hide-tabs"></ul>' +
                '</div>' +
                '</div>');
            self.$bodyContainer = $('<div class="hiekn-resource-container tab-content"></div>');
            self.$container.append(self.$headContainer);
            self.$container.append(self.$bodyContainer);
            var $navContainer = self.select('.hiekn-resource-nav-container ul.hiekn-resource-nav');
            var $navHideContainer = self.select('.hiekn-resource-nav-container ul.hiekn-resource-nav-hide-tabs');
            var allW = 0;
            for (var i in self.options.configs) {
                var cls = i == 0 ? 'active' : '';
                var id = self.options.namespace + '-tab-' + i + '-' + new Date().getTime();
                var $resourceContainer = $('<div role="tabpanel" class="tab-pane ' + cls + '" id="' + id + '"></div>');
                self.$bodyContainer.append($resourceContainer);
                var config = $.extend(true, {}, self.options);
                config.config = self.options.configs[i];
                config.container = $resourceContainer;
                config.onLoad = function (data, instance) {
                    var id = instance.tableService.$container.attr('id');
                    self.$headContainer.find('a[href="#'+id+'"] .res-count').text(data.rsCount || 0);
                };
                delete config.configs;
                self.resourcesService.push(new HieknResourceService(config));
                var tab = '<li role="presentation" class="' + cls + '">' +
                    '<a href="#' + id + '" aria-controls="" role="tab" data-toggle="tab">' +
                    '<span class="res-name" title="' + config.config.name + '">' + config.config.name + '</span>' +
                    '<span class="res-count"></span>' +
                    '</a></li>';
                $navContainer.append(tab);
                $navHideContainer.append(tab);
                allW += $navContainer.find('li:last-child').width();
            }
            $navContainer.css('width', allW);
            self.updateTabVisibility();
            self.bindEvent();
        };

        Service.prototype.bindEvent = function () {
            var self = this;
            self.select('.hiekn-resource-nav-more').on('click', function () {
                self.select('.hiekn-resource-nav-more-container').toggleClass('hide');
            });

            self.$headContainer.on('shown.bs.tab', 'a[data-toggle="tab"]', function () {
                var href = $(this).attr('href');
                self.$headContainer.find('.hiekn-resource-nav a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
                self.$headContainer.find('.hiekn-resource-nav-hide-tabs a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
            });

            self.$container.on('click', function (event) {
                if (!$(event.target).closest('.hiekn-resource-nav-more-container,.hiekn-resource-nav-more').length) {
                    self.select('.hiekn-resource-nav-more-container').addClass('hide');
                }
            });

            window.onresize = function () {
                self.updateTabVisibility();
            }
        };

        Service.prototype.loadData = function (pageNo) {
            var self = this;
            for (var i in self.resourcesService) {
                self.resourcesService[i].loadData(pageNo);
            }
        };

        Service.prototype.select = function (selector) {
            var self = this;
            return self.$container.find(selector);
        };

        Service.prototype.updateTabVisibility = function () {
            var self = this;
            var $container = self.$headContainer;
            var cw = $container.width();
            var $navContainer = $container.find('.nav');
            var tw = $navContainer.width();
            var $nm = $container.find('.hiekn-resource-nav-more');
            if (cw < tw) {
                $nm.removeClass('hide');
            } else {
                $nm.addClass('hide');
                $container.find('.hiekn-resource-nav-more-container').addClass('hide');
            }
            var w = 0;
            var nmw = $nm.outerWidth();
            var $hideTabs = $container.find('.hiekn-resource-nav-hide-tabs>li');
            $navContainer.find('li').each(function (i, v) {
                $(v).removeClass('hide');
                w += $(v).width();
                if (w >= cw - nmw) {
                    $(v).addClass('hide');
                    $($hideTabs.get(i)).removeClass('hide');
                } else {
                    $($hideTabs.get(i)).addClass('hide');
                }
            });
        };

        return Service;
    }
})(window, jQuery);
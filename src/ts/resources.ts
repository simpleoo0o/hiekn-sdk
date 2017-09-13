interface HieknResourcesSetting extends HieknBaseSetting {
    beforeLoad?: Function;
    container: string;
    configs: HieknTableConfigSetting[];
    namespace?: string;
    onLoad?: Function;
}

class HieknSDKResources {
    resourcesService: HieknSDKResource[] = [];
    options: HieknResourcesSetting;
    $container: JQuery;
    $headContainer: JQuery;
    $bodyContainer: JQuery;

    constructor(options: HieknResourcesSetting) {
        this.options = options;
        this.init(this.options.namespace);
    }

    private bindEvent() {
        this.$headContainer.find('.hiekn-resource-nav-more').on('click', () => {
            this.$headContainer.find('.hiekn-resource-nav-more-container').toggleClass('hide');
        });

        this.$headContainer.on('shown.bs.tab', 'a[data-toggle="tab"]', () => {
            const href = $(this).attr('href');
            this.$headContainer.find('.hiekn-resource-nav a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
            this.$headContainer.find('.hiekn-resource-nav-hide-tabs a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
        });

        $('body').on('click', (event) => {
            if (!$(event.target).closest('.hiekn-resource-nav-more-container,.hiekn-resource-nav-more').length) {
                this.$headContainer.find('.hiekn-resource-nav-more-container').addClass('hide');
            }
        });

        $(window).on('resize', () => {
            this.updateTabVisibility();
        });
    }

    private init(namespace = 'hiekn-resource') {
        this.$container = $(this.options.container);
        this.$headContainer = $('<div class="hiekn-resource-nav-container">' +
            '<ul class="hiekn-resource-nav nav nav-tabs" role="tablist"></ul>' +
            '<div class="hiekn-resource-nav-more hide">更多</div>' +
            '<div class="hiekn-resource-nav-more-container hide">' +
            '<ul class="hiekn-resource-nav-hide-tabs"></ul>' +
            '</div>' +
            '</div>');
        this.$bodyContainer = $('<div class="hiekn-resource-container tab-content"></div>');
        this.$container.append(this.$headContainer);
        this.$container.append(this.$bodyContainer);
        const $navContainer = this.select('.hiekn-resource-nav-container ul.hiekn-resource-nav');
        const $navHideContainer = this.select('.hiekn-resource-nav-container ul.hiekn-resource-nav-hide-tabs');
        let allW = 0;
        for (const i in this.options.configs) {
            const cls = i == '0' ? 'active' : '';
            const id = namespace + '-tab-' + i + '-' + new Date().getTime();
            const $resourceContainer = $('<div role="tabpanel" class="tab-pane ' + cls + '" id="' + id + '"></div>');
            this.$bodyContainer.append($resourceContainer);
            let config = $.extend(true, {}, this.options);
            config.config = this.options.configs[i];
            config.container = $resourceContainer;
            config.onLoad = (data: any, instance: HieknSDKResource) => {
                const id = instance.tableService.$container.attr('id');
                this.$headContainer.find('a[href="#' + id + '"] .res-count').text(data.rsCount || 0);
                this.options.onLoad && this.options.onLoad(data, instance);
            };
            delete config.namespace;
            delete config.configs;
            this.resourcesService.push(new HieknSDKResource(config));
            const tab = '<li role="presentation" class="' + cls + '">' +
                '<a href="#' + id + '" aria-controls="" role="tab" data-toggle="tab">' +
                '<span class="res-name" title="' + config.config.name + '">' + config.config.name + '</span>' +
                '<span class="res-count"></span>' +
                '</a></li>';
            $navContainer.append(tab);
            $navHideContainer.append(tab);
            allW += $navContainer.find('li:last-child').width();
        }
        $navContainer.css('width', allW);
        this.updateTabVisibility();
        this.bindEvent();
    }

    loadData(pageNo: number) {
        for (const resourcesService of this.resourcesService) {
            resourcesService.loadData(pageNo);
        }
    }

    select(selector: string) {
        return this.$container.find(selector);
    }

    updateTabVisibility() {
        const $container = this.$headContainer;
        const cw = $container.width();
        const $navContainer = $container.find('.nav');
        const tw = $navContainer.width();
        const $nm = $container.find('.hiekn-resource-nav-more');
        if (cw < tw) {
            $nm.removeClass('hide');
        } else {
            $nm.addClass('hide');
            $container.find('.hiekn-resource-nav-more-container').addClass('hide');
        }
        let w = 0;
        const nmw = $nm.outerWidth();
        const $hideTabs = $container.find('.hiekn-resource-nav-hide-tabs>li');
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
    }
}
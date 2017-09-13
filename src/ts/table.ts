type HieknTableRendererFunction = (value: any, data: any) => string;
type HieknTableRendererType = 'date' | 'link' | 'year' | 'dateTime' | 'json' | 'string' | HieknTableRendererFunction;
type HieknTableRendererComplex = { type: HieknTableRendererType, array?: boolean, fields?: string[], name?: string };
type HieknTableRenderer = { [key: string]: HieknTableRendererType | HieknTableRendererComplex };
type HieknTableFilterType = 'year' | 'month' | 'day';
type HieknTableFilterOption = string | { key: string, value: string } | HieknKVType;

interface HieknTableFilter {
    key: string;
    label?: string;
    type?: HieknTableFilterType;
    format?: string;
    options: HieknTableFilterOption[];
}

interface HieknTableConfigSetting {
    name: string;
    databases: string[];
    tables: string[];
    fields: string[];
    fieldsName?: string[];
    fieldsTable?: string[];
    fieldsTableName?: string[];
    fieldsDetail?: string[];
    fieldsDetailName?: string[];
    fieldsKw?: string[];
    drawDetail?: boolean;
    fieldsRenderer?: HieknTableRenderer;
    filter?: HieknTableFilter[];
}

interface HieknTableSetting extends HieknBaseSetting {
    container: string;
    config: HieknTableConfigSetting;
    load: Function
}

class HieknSDKTable {
    $container: JQuery;
    data: any;
    options: HieknTableSetting;

    constructor(options: HieknTableSetting) {
        this.options = options;
        this.init();
    }

    private buildFilter() {
        let filterHtml = '';
        const filters = this.options.config.filter;
        for (const filter of filters) {
            const label = filter.label || filter.key;
            let filterOptions = '';
            for (const item of filter.options) {
                if (item instanceof Object) {
                    if ((<any>item).key !== undefined && (<any>item).value !== undefined) {
                        let option = <{ key: string, value: string }>item;
                        filterOptions += '<span option-value="' + option.value + '" option-key="' + option.key + '">' + option.key + '</span>';
                    } else {
                        let option = <{ [key: string]: string }>item;
                        for (const key in option) {
                            filterOptions += '<span option-value="' + option[key] + '" option-key="' + key + '">' + option[key] + '</span>';
                        }
                    }
                } else {
                    filterOptions += '<span option-value="' + item + '" option-key="' + filter.key + '">' + item + '</span>';
                }
            }
            filterHtml += '<div class="hiekn-table-filter-item">' +
                '<div class="hiekn-table-filter-item-label">' + label + '：</div>' +
                '<div class="hiekn-table-filter-item-content">' + filterOptions + '' +
                '<div class="hiekn-table-more-container">' +
                '<span class="hiekn-table-filter-more">更多 <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg></span>' +
                '<span class="hiekn-table-filter-less">收起 <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg></span>' +
                '<span class="hiekn-table-filter-multi"><svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> 多选</span>' +
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
        this.select('.hiekn-table-filter').html(filterHtml);
    }

    private bindFilterEvent() {
        this.select('.hiekn-table-filter').on('click', 'span[option-value]', (event: Event) => {
            const $item = $(event.currentTarget);
            const key = $item.attr('option-key');
            const value = $item.attr('option-value');
            if ($item.closest('.hiekn-table-filter-item').hasClass('multi')) {
                $item.toggleClass('active');
            } else {
                if (!$item.hasClass('active')) {
                    $item.addClass('active').siblings('.active').removeClass('active');
                } else {
                    $item.removeClass('active');
                }
                this.loadData(1);
            }
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-more', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').addClass('expend');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-less', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('expend');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-multi', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').addClass('multi');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-confirm', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('multi');
            this.loadData(1);
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-cancel', (event: Event) => {
            const $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('multi');
        });
        this.select('.hiekn-table-search-kw-container').on('keydown', 'input', (event: Event) => {
            const key = window.event ? (<KeyboardEvent>event).keyCode : (<KeyboardEvent>event).which;
            if (key == 13) {
                this.loadData(1);
            }
        });
    }

    private bindTableEvent() {
        this.select('.hiekn-table-content').on('click', '.hiekn-table-data-angle', (event: Event) => {
            $(event.currentTarget).toggleClass('on').closest('tr').next('tr.hiekn-table-detail-line').toggleClass('hide');
        });
    }

    private static dealContent(d: string, len = 80) {
        if (d) {
            let text = $('<div>' + d + '</div>').text();
            if (text.length > len) {
                return text.substring(0, len) + '...';
            } else {
                return text;
            }
        } else {
            return '';
        }
    }

    drawData(data: any) {
        const config = this.options.config;
        this.data = data;
        let ths = '<thead><tr>';
        let trs = '<tbody>';
        const fields = config.fieldsTable || config.fields;
        const fieldsName = config.fieldsTableName ? config.fieldsTableName : (config.fieldsName ? config.fieldsName : fields);
        const drawDetail = config.drawDetail || config.fieldsDetail || config.fieldsTable;
        const fieldsDetail = config.fieldsDetail || config.fields;
        const fieldsNameDetail = config.fieldsDetailName ? config.fieldsDetailName : (config.fieldsName ? config.fieldsName : fields);
        const fieldsRenderer = config.fieldsRenderer || {};
        let fieldsLink: HieknKVType = {};
        if (drawDetail) {
            ths += '<th></th>';
        }
        for (const fidx in fields) {
            const renderer = fieldsRenderer[fields[fidx]];
            if (renderer && renderer instanceof Object && (<HieknTableRendererComplex>renderer).type == 'link' && (<HieknTableRendererComplex>renderer).fields) {
                for (const f of (<HieknTableRendererComplex>renderer).fields) {
                    fieldsLink[f] = fields[fidx];
                }
                continue;
            }
            ths += '<th>' + fieldsName[fidx] + '</th>';
        }
        for (const d of data) {
            let tr = '<tr>';
            if (drawDetail) {
                tr += '<td class="hiekn-table-data-angle"><svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg></td>';
            }
            let len = 0;
            for (const k of fields) {
                len++;
                if (!fieldsRenderer[k] || !(<HieknTableRendererComplex>fieldsRenderer[k]).fields) {
                    tr += '<td>' + HieknSDKTable.rendererFields(d, k, fieldsLink, fieldsRenderer, true) + '</td>';
                }
            }
            tr += '</tr>';
            trs += tr;
            if (drawDetail) {
                let trDetail = '<tr class="hiekn-table-detail-line hide"><td colspan="' + (len + 1) + '">';
                for (const i in fieldsDetail) {
                    const k = fieldsDetail[i];
                    if (!fieldsRenderer[k] || !(<HieknTableRendererComplex>fieldsRenderer[k]).fields) {
                        trDetail += '<div class="hiekn-table-detail-' + k + '"><label>' + fieldsNameDetail[i] + ':</label>' + HieknSDKTable.rendererFields(d, k, fieldsLink, fieldsRenderer, false) + '</div>';
                    }
                }
                trDetail += '</td></tr>';
                trs += trDetail;
            }
        }
        trs += '</body>';
        ths += '</tr></thead>';
        this.select('.hiekn-table-content').html('<table class="hiekn-table-normal">' + ths + trs + '</table>');
    }

    drawPage(count: number, pageNo: number, pageSize: number) {
        const options = {
            totalItem: count,
            pageSize: pageSize,
            current: pageNo,
            selector: this.select('.pagination'),
            callback: (data: any, pageNo: number) => {
                this.loadData(pageNo);
            }
        };
        HieknSDKUtils.drawPagination(options);
    };

    getFilterKw() {
        return this.select('.hiekn-table-search-kw-container').find('input').val();
    }

    getFilterOptions() {
        let filterOptions = {};
        this.select('.hiekn-table-filter-item').each((i: number, v: HTMLElement) => {
            let key = '';
            const $items = $(v).find('span[option-value].active');
            if ($items.length) {
                let hasAll = false;
                let value: string[] = [];
                $items.each((j: number, e: HTMLElement) => {
                    const ov = $(e).attr('option-value');
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
    }

    getTableContainer() {
        return this.select('.hiekn-table-content');
    }

    private static getValues(value: any) {
        let values = [];
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
    }

    private init() {
        this.$container = $(this.options.container).addClass('hiekn-table');
        this.$container.append('<div class="hiekn-table-filter">' +
            '</div>' +
            '<div class="hiekn-table-content"></div>' +
            '<div class="hiekn-table-page">' +
            '<div class="pagination-outter">' +
            '<ul class="pagination"></ul>' +
            '</div>' +
            '</div>');
        this.buildFilter();
        this.bindFilterEvent();
        this.bindTableEvent();
    }

    loadData(pageNo: number) {
        this.options.load(pageNo, this);
    }

    private static rendererDate(v: string) {
        return moment(v).format('YYYYMMDD');
    }

    private static rendererDateTime(v: string) {
        return moment(v).format('YYYY-MM-DD HH:mm:ss');
    }

    private static rendererFields(d: any, k: string, fieldsLink: HieknKVType, fieldsRenderer: HieknTableRenderer, short: boolean) {
        let str = '';
        if (d[k]) {
            const values = HieknSDKTable.getValues(d[k]);
            for (const value of values) {
                if (!fieldsRenderer[k]) {
                    str += ',' + HieknSDKTable.rendererValue('string', value, undefined, short, d);
                } else {
                    str += ',' + HieknSDKTable.rendererValue((<HieknTableRendererComplex>fieldsRenderer[k]).type || <HieknTableRendererType>fieldsRenderer[k], value, <HieknTableRendererComplex>fieldsRenderer[k], short, d);
                }
            }
            str = str.substring(1);
        }
        if (fieldsLink[k]) {
            let name = d[k];
            if (!d[k]) {
                name = '链接';
            }
            str = HieknSDKTable.rendererLink(d[fieldsLink[k]], name);
        }
        return str;
    }

    private static rendererLink(v: string, name = '查看', cls = '') {
        return v ? '<a href="' + v + '" target="_blank" class="' + cls + '">' + name + '</a>' : '';
    }

    private static rendererValue(type: HieknTableRendererType, value: any, fieldsRenderer: HieknTableRendererComplex, short: boolean, data: any) {
        let str = '';
        try {
            if (type == 'year') {
                str = HieknSDKTable.rendererYear(value);
            } else if (type == 'date') {
                str = HieknSDKTable.rendererDate(value);
            } else if (type == 'dateTime') {
                str = HieknSDKTable.rendererDateTime(value);
            } else if (type == 'json') {
                str = JSON.stringify(value);
            } else if (type == 'link') {
                str = HieknSDKTable.rendererLink(value, fieldsRenderer.name, 'hiekn-table-btn-link');
            } else if (type == 'string' && short) {
                str = HieknSDKTable.dealContent(value);
            } else if (type instanceof Function) {
                str = type(value, data);
            } else {
                str = HieknSDKUtils.safeHTML(value);
            }
        } catch (e) {

        }
        return str;
    }

    private static rendererYear(v: string) {
        return moment(v).format('YYYY');
    }

    private select(selector: string) {
        return this.$container.find(selector);
    }

}
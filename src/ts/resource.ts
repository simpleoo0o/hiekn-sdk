interface HieknResourceSetting extends HieknBaseSetting {
    beforeLoad?: Function,
    container?: string,
    config: HieknTableConfigSetting,
    onLoad?: Function
}

class HieknSDKResource {
    options: HieknResourceSetting;
    tableService: HieknSDKTable;
    query: any;

    constructor(options: HieknResourceSetting) {
        this.options = options;
        this.init();
    }

    private getQuery() {
        let must = [];
        const filter = this.tableService.getFilterOptions();
        for (const key in filter) {
            let should = [];
            const value = filter[key];
            const filterConfig = _.find(this.options.config.filter, ['key', key]);
            if (filterConfig.type == 'year' || filterConfig.type == 'month') {
                for (const year of value) {
                    let from = '';
                    let to = '';
                    if (filterConfig.type == 'year') {
                        from = moment(year + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                        to = moment((parseInt(year, 10) + 1) + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                    } else {
                        from = moment(year + '-01').format(filterConfig.format || 'YYYY-MM');
                        to = moment((parseInt(year, 10) + 1) + '-01').format(filterConfig.format || 'YYYY-MM');
                    }
                    let obj = {};
                    obj[key] = {
                        from: from,
                        to: to,
                        include_lower: true,
                        include_upper: false
                    };
                    should.push({
                        range: obj
                    });
                }
            } else {
                let obj = {};
                obj[key] = value;
                should.push({
                    terms: obj
                });
            }
            must.push({
                bool: {
                    should: should,
                    minimum_should_match: 1
                }
            });
        }
        const kw = this.tableService.getFilterKw();
        if (kw) {
            let should = [];
            const fields = this.options.config.fieldsKw || this.options.config.fieldsTable || this.options.config.fields;
            let obj = {
                query: kw,
                fields: fields
            };
            should.push({
                query_string: obj
            });
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
    }

    private init() {
        const config = {
            config: this.options.config,
            container: this.options.container,
            load: (pageNo: number, instance: HieknSDKTable) => {
                this.load(pageNo, instance);
            }
        };
        this.tableService = new HieknSDKTable(config);
    }

    private load(pageNo: number, instance: HieknSDKTable) {
        this.query = this.getQuery();
        this.options.beforeLoad && this.options.beforeLoad(this);
        const config = this.options.config;
        const queryData = this.options.queryData || {};
        let formData = this.options.formData || {};
        formData.databases = config.databases;
        formData.tables = config.tables;
        formData.fields = config.fields;
        formData.query = JSON.stringify(this.query);
        formData.pageNo = pageNo;
        formData.pageSize = formData.pageSize || 15;
        const $container = instance.getTableContainer();
        $container.empty();
        let newOptions = {
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'search', queryData),
            type: 'POST',
            data: formData,
            dataFilter: this.options.dataFilter,
            success: (rsData: any, textStatus: string, jqXHR: JQueryXHR, data: any, params: any) => {
                if (data) {
                    instance.drawPage(data.rsCount, params.pageNo, params.pageSize);
                    instance.drawData(data.rsData);
                } else {
                    instance.drawPage(0, params.pageNo, params.pageSize);
                }
                this.options.onLoad && this.options.onLoad(data, this);
            },
            error: (data: any,textStatus: string, jqXHR: JQueryXHR, errorThrown: string, params: any) => {
                instance.drawPage(0, params.pageNo, params.pageSize);
            },
            that: $container[0]
        };
        HieknSDKUtils.ajax(newOptions);
    }

    loadData(pageNo: number) {
        this.tableService.loadData(pageNo);
    }
}
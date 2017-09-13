type HieknIdType = number | string;
type HieknKVType = { [key: string]: string };
type JQueryAjaxSuccess = (data: any, textStatus: string, jqXHR: JQueryXHR) => any;
type JQueryAjaxDataFilter = (data: any, ty: any) => any;

interface HieknBaseSetting {
    baseUrl?: string;
    dataFilter?: JQueryAjaxDataFilter;
    formData?: any;
    queryData?: any;
}

interface HieknKV {
    k: string;
    v: string;
}

interface HieknAjaxSetting extends JQueryAjaxSettings {
    baseUrl?: string;
    formData?: any;
    queryData?: any;
    that?: HTMLElement;
}

class HieknSDKUtils {

    static regChinese = /^[\u4e00-\u9fa5]$/;
    static regEnglish = /^[a-zA-Z]$/;
    static colorBase = ['#7bc0e1',
        '#9ec683',
        '#fde14d',
        '#ab89f4',
        '#e26f63',
        '#dca8c6',
        '#596690',
        '#eaad84',
        '#abe8bf',
        '#7979fc'];
    static colorEx = ['#6db5d6',
        '#d0648a',
        '#c0d684',
        '#f2bac9',
        '#847d99',
        '#baf2d8',
        '#bfb3de',
        '#f4817c',
        '#94cdba',
        '#b2cede'];
    static color = HieknSDKUtils.colorBase.concat(HieknSDKUtils.colorEx);
    static loadingHTML = `<div class="schema-init">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 14 32 18" width="32" height="4" preserveAspectRatio="none">
        <path opacity="0.8" transform="translate(0 0)" d="M2 14 V18 H6 V14z">
        <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>
        <path opacity="0.5" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
        <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.1s" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>
        <path opacity="0.25" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
        <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.2s" repeatCount="indefinite"
         keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>
        </svg>
        </div>`;

    static ajax(options: any) {
        let error = options.error || $.noop;
        let type = options.type;
        switch (type) {
            case 'GET':
                type = 0;
                break;
            case 'POST':
                type = 1;
                break;
        }
        let newOptions = {
            type: type,
            dataFilter: options.dataFilter || HieknSDKUtils.dataFilter,
            params: options.data,
            success: (data: any, textStatus: string, jqXHR: JQueryXHR, params: any) => {
                if (data && data.rsData) {
                    options.success(data.rsData, textStatus, jqXHR, data, params);
                } else {
                    error(data, textStatus, jqXHR, null, params);
                }
            },
            error: (xhr: JQueryXHR, textStatus: string, errorThrown: string) => {
                error(null, textStatus, xhr, errorThrown);
            },
        };
        newOptions = $.extend(true, {}, options, newOptions);
        hieknjs.kgLoader(newOptions);
    }

    static buildUrl(url: string, queryData: any) {
        if (queryData && !$.isEmptyObject(queryData)) {
            const link = url.indexOf('?') > 0 ? '&' : '?';
            return url + link + $.param(queryData);
        } else {
            return url;
        }
    }

    static dataFilter(data: any) {
        return data;
    }

    static drawPagination(options: any) {
        $.extend(true, options, {
            data: Math.ceil(options.totalItem / options.pageSize),
            cur: options.current,
            p: options.selector,
            event: options.callback
        });
        hieknjs.gentPage(options);
    }

    static error(msg: string) {
        toastr.error(msg);
    }

    static info(msg: string) {
        toastr.info(msg);
    }

    static qiniuImg(img: string) {
        return img + '?_=' + Math.floor(new Date().getTime() / 3600000);
    }

    static randomId(prefix = '', postfix = '', append = '') {
        return prefix + (append ? append : new Date().getTime() + Math.ceil(Math.random() * 10000)) + postfix;
    }

    static safeHTML(value: string) {
        return hieknjs.safeHTML(value)
    }

    static dealNull(data: any) {
        return hieknjs.dealNull(data);
    }
}

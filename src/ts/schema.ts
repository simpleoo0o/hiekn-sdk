interface HieknSchemaAtts {
    k: number;
    v: string;
    type: 0 | 1;
}

interface HieknSchemaTypes {
    k: number;
    v: string;
}

interface HieknSchema {
    atts: HieknSchemaAtts[];
    types: HieknSchemaTypes[];
}

interface HieknSchemaSetting extends HieknAjaxSetting {
    kgName: string
}

class HieknSDKSchema {
    static load(options: HieknSchemaSetting) {
        let queryData = options.queryData || {};
        let formData = $.extend(true, {kgName: options.kgName}, options.formData);
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'schema', queryData),
            type: 'POST',
            data: formData,
            beforeSend: () => {
                options.that && $(options.that).find('.ajax-loading').html(HieknSDKUtils.loadingHTML);
            },
            success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
                options.success(data[0], textStatus, jqXHR);
            }
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
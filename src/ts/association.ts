interface HieknAssociationSetting extends HieknAjaxSetting {
    kgName?: string;
}

class HieknSDKAssociation {
    static defaults = {
        formData: {
            pageSize: 6
        }
    };

    static load(options: HieknAssociationSetting) {
        options = $.extend(true, {}, HieknSDKAssociation.defaults, options);
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        formData.kgName = options.kgName;
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'association', queryData),
            type: 'POST',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
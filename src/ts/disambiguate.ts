interface HieknDisambiguateSetting extends HieknAjaxSetting {
}

class HieknSDKDisambiguate {
    static defaults: HieknDisambiguateSetting = {
        queryData:{
            useConcept: true,
            useEntity: true,
            useAttr: true
        }
    };

    static load(options: HieknDisambiguateSetting) {
        options = $.extend(true, {}, HieknSDKDisambiguate.defaults, options);
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'disambiguate', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
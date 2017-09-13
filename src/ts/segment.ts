interface HieknSegmentSetting extends HieknAjaxSetting {
}

class HieknSDKSegment {
    static defaults: HieknSegmentSetting = {
        queryData:{
            useConcept: true,
            useEntity: true,
            useAttr: true
        }
    };

    static load(options: HieknSegmentSetting) {
        options = $.extend(true, HieknSDKSegment.defaults, options);
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'segment', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
interface HieknTaggingSetting extends HieknAjaxSetting {
}

class HieknSDKTagging {
    static load(options: HieknTaggingSetting) {
        const queryData = options.queryData || {};
        let formData = options.formData || {};
        let newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'tagging', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
}
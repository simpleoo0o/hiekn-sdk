(function (window, $) {
    'use strict';

    window.HieknConceptPromptService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                beforeDrawPrompt: null,
                container: null,
                data: null,
                baseUrl: null,
                kgName: null,
                ready: $.noop,
                onSearch: $.noop
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            var sdk = new HieknSDKService(self.options);
            var typeObj = {
                0: '概念',
                1: '实例'
            };
            var promptSettings = {
                drawPromptItem: function (data, pre) {
                    var line = '<span class="prompt-tip-title">' + data.name.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
                    line = '<span class="prompt-tip-type prompt-tip-' + data.kgType + '">' + (typeObj[data.kgType] || '') + '</span>' + line;
                    return line;
                },
                onPrompt: sdk.onPromptKnowledge(self.options)
            };
            $.extend(true, promptSettings, self.options);
            self.instance = new hieknPrompt(promptSettings);
            self.options.ready(self.instance);
        };

        return Service;
    }
})(window, jQuery);
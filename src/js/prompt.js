(function (window, $) {
    'use strict';

    window.HieknPromptService = gentService();

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
                group: false,
                replaceSearch: false,
                onSearch: $.noop
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            var sdk = new HieknSDKService(self.options);
            sdk.schema(self.options, function (schema) {
                var promptSettings = {
                    drawPromptItem: sdk.drawPromptItem(schema),
                    onPrompt: sdk.onPrompt(self.options)
                };
                if (self.options.group) {
                    promptSettings.drawPromptItems = sdk.drawPromptItems(schema, self);
                }
                if (self.options.replaceSearch) {
                    promptSettings.beforeSearch = sdk.beforeSearch();
                }
                $.extend(true, promptSettings, self.options);
                self.instance = new hieknPrompt(promptSettings);
                self.options.ready(self.instance);
            });
        };

        return Service;
    }
})(window, jQuery);
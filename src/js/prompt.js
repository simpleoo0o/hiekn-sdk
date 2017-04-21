(function (window, $) {
    'use strict';

    window.HieknPromptService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            var defaultSettings = {
                selector: null,
                data: null,
                url: null,
                kgName: null,
                ready: $.noop
            };
            self.settings = $.extend(true, {}, defaultSettings, options);
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            var sdk = new HieknSDKService(self.settings);
            sdk.schema(self.settings, function (schema) {
                var promptSettings = {
                    drawPromptItem: sdk.drawPromptItem(schema),
                    onPrompt: sdk.onPrompt(self.settings)
                };
                $.extend(true, promptSettings, self.settings);
                var instance = new hieknPrompt(promptSettings);
                self.settings.ready(instance);
            });
        };

        return Service;
    }
})(window, jQuery);
(function (window, $) {
    window.indexService = gentService();

    function gentService() {
        var Service = {};

        $(function () {
            Service.bindEvent();
            // Service.initPrompt();
            var refer = window.localStorage.getItem('data-page');
            refer && Service.initPage(refer);
        });

        Service.bindEvent = function () {
            $('.control-bar').on('click', function () {
                $('body').toggleClass('close-nav');
            });
            $('.tree-item').on('click', function () {
                $(this).closest('li').toggleClass('on').siblings('li').removeClass('on');
            });
            $('[data-page]').on('click', function () {
                var refer = $(this).attr('data-page');
                window.localStorage.setItem('data-page', refer);
                Service.initPage(refer);
            });
        };

        Service.initPage = function (refer) {
            $('.' + refer).addClass('active').siblings().removeClass('active');
        };

        Service.initPrompt = function () {
            var config1 = {
                container: '#prompt',
                onPrompt: function (pre, $self) {
                    //do ajax
                    setTimeout(function () {
                        var d = [{id: 1, name: 'test'}, {id: 2, name: 'test2'}];
                        $self.startDrawPromptItems(d, pre);
                    }, 100);
                },
                onSearch: function (data) {
                    alert(JSON.stringify(data));
                }
            };
            new hieknPrompt(config1);
        };

        return Service;
    }
})(window, jQuery);
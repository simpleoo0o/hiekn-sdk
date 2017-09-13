interface HieknPromptSetting extends HieknBaseSetting {
    kgName?: string;
    beforeDrawPrompt?: Function;
    container?: string;
    ready?: Function;
    group?: boolean;
    replaceSearch?: boolean;
    onSearch?: Function;
    promptType?: 0 | 1;
    schemaSetting?: HieknSchemaSetting;
}

interface HieknPromptRequestSetting extends HieknPromptSetting {
    paramName?: string;
    url?: string;
    type?: 'GET' | 'POST';
}

class HieknSDKPrompt {
    defaults: HieknPromptSetting = {
        ready: $.noop,
        group: false,
        replaceSearch: false,
        onSearch: $.noop,
        promptType: 0
    };
    instance: any;
    options: HieknPromptSetting;

    constructor(options: HieknPromptSetting) {
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }

    private init() {
        let schemaSetting: HieknSchemaSetting = $.extend(true, {kgName: this.options.kgName}, this.options, this.options.schemaSetting);
        schemaSetting.success = ((schema: HieknSchema) => {
            let promptSettings: any;
            if (this.options.promptType === 0) {
                promptSettings = {
                    drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                    onPrompt: HieknSDKPrompt.onPrompt(this.options)
                };
            } else {
                promptSettings = {
                    drawPromptItem: HieknSDKPrompt.drawPromptKnowledgeItem(),
                    onPrompt: HieknSDKPrompt.onPromptKnowledge(this.options)
                };
            }
            if (this.options.group) {
                promptSettings.drawPromptItems = this.drawPromptItems(schema);
            }
            if (this.options.replaceSearch) {
                promptSettings.beforeSearch = (selectedItem: any, $container: JQuery) => {
                    if (selectedItem) {
                        $container.find('input[type=text]').val(selectedItem.name);
                    }
                };
            }
            $.extend(true, promptSettings, this.options);
            this.instance = new hieknPrompt(promptSettings);
            this.options.ready(this.instance);
        });
        HieknSDKSchema.load(schemaSetting);
    }

    static drawPromptItem(schema: HieknSchema) {
        let typeObj = {};
        for (const type of schema.types) {
            typeObj[type.k] = type.v;
        }
        return (data: any, pre: string) => {
            let title = data.name;
            if (data.meaningTag) {
                title = title + ' ( ' + data.meaningTag + ' )';
            }
            let line = '<span class="prompt-tip-title">' + title.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
            line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (data.className || typeObj[data.classId] || '') + '</span>' + line;
            return line;
        }
    }

    static drawPromptKnowledgeItem() {
        let typeObj = {
            0: '概念',
            1: '实例'
        };
        return (data: any, pre: string) => {
            let line = '<span class="prompt-tip-title">' + data.name.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
            line = '<span class="prompt-tip-type prompt-tip-' + data.kgType + '">' + (typeObj[data.kgType] || '') + '</span>' + line;
            return line;
        }
    }

    drawPromptItems(schema: HieknSchema) {
        let typeObj = {};
        for (const type of schema.types) {
            typeObj[type.k] = type.v;
        }
        return (data: any, pre: string) => {
            const $container = $('<div></div>');
            for (const v of data) {
                const text = this.instance.options.drawPromptItem(v, pre);
                const title = this.instance.options.drawItemTitle(v);
                const cls = 'prompt-item-' + v.classId;
                const $li = $('<li title="' + title + '" class="' + cls + '">' + text + '</li>').data('data', v);
                const ex = $container.find('.' + cls);
                if (ex.length) {
                    $(ex[ex.length - 1]).after($li);
                    $li.find('.prompt-tip-type').empty();
                } else {
                    $container.append($li);
                }
            }
            return $container.children();
        }
    }

    static onPromptStart(options: HieknPromptRequestSetting) {
        return (pre: string, $self: any) => {
            const queryData = options.queryData || {};
            let formData = options.formData || {};
            formData[options.paramName] = pre;
            formData.kgName = options.kgName;
            HieknSDKUtils.ajax({
                url: HieknSDKUtils.buildUrl(options.url, queryData),
                type: options.type,
                data: formData,
                dataFilter: options.dataFilter,
                success: (data: any) => {
                    if ($self.prompt == formData[options.paramName]) {
                        let d = data;
                        options.beforeDrawPrompt && (d = options.beforeDrawPrompt(d, pre));
                        $self.startDrawPromptItems(d, pre);
                    }
                }
            });
        }
    }

    static onPrompt(options: HieknPromptSetting) {
        let reqOptions: HieknPromptRequestSetting = options;
        reqOptions.paramName = 'kw';
        reqOptions.url = options.baseUrl + 'prompt';
        reqOptions.type = 'POST';
        return HieknSDKPrompt.onPromptStart(reqOptions);
    }

    static onPromptKnowledge(options: HieknPromptSetting) {
        let reqOptions: HieknPromptRequestSetting = options;
        reqOptions.paramName = 'text';
        reqOptions.url = options.baseUrl + 'prompt/knowledge';
        reqOptions.type = 'GET';
        return HieknSDKPrompt.onPromptStart(options);
    }
}

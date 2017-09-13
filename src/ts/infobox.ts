interface HieknInfoboxSetting extends HieknBaseSetting {
    kgName: string;
    autoLen?: boolean;
    atts?: { visible: number[], hidden: number[] };
    enable?: boolean;
    enableLink?: boolean;
    imagePrefix?: string;
    onLoad?: Function;
    onFailed?: Function;
    selector?: string;
    changeInfobox?: Function;
}

class HieknSDKInfobox {
    callback: Function = $.noop;
    defaults: HieknInfoboxSetting = {
        kgName: null,
        atts: {visible: [], hidden: []},
        enableLink: false,
        autoLen: true,
        onLoad: $.noop,
        onFailed: $.noop
    };
    options: HieknInfoboxSetting;

    constructor(options: HieknInfoboxSetting) {
        this.options = $.extend(true, {}, this.defaults, options);
    }

    private changeInfobox(id: HieknIdType) {
        this.load(id, this.callback);
    };

    initEvent($container: JQuery) {
        $container.on('click', '.hiekn-infobox-link', (event: Event) => {
            const id = $(event.currentTarget).attr('data-id');
            this.options.changeInfobox ? this.options.changeInfobox(id, this) : this.changeInfobox(id);
        });

        $container.on('click', '.hiekn-infobox-info-detail a', (event: Event) => {
            $(event.currentTarget).closest('.hiekn-infobox-info-detail').toggleClass('on');
        });
    }

    private buildEntity(entity: any, buildLink: boolean) {
        const meaningTag = entity.meaningTag ? '(' + entity.meaningTag + ')' : '';
        const html = '<span class="hiekn-infobox-name">' + entity.name + '<span class="hiekn-infobox-meaningTag">' + meaningTag + '</span></span>';
        if (buildLink && this.options.enableLink) {
            return '<a href="javascript:void(0)" class="hiekn-infobox-link" data-id="' + entity.id + '">' + html + '</a>';
        }
        return html;
    }

    private buildExtra(extra: HieknKV) {
        let detail = extra.v || '-';
        if (this.options.autoLen) {
            const max = typeof this.options.autoLen == 'number' ? this.options.autoLen : 80;
            if (extra.v.length > max) {
                detail = '<span class="hiekn-infobox-info-detail-short">' + extra.v.substring(0, max) + '<a href="javascript:void(0)">查看全部&gt;&gt;</a></span><span class="hiekn-infobox-info-detail-long">' + extra.v + '<a href="javascript:void(0)">收起&lt;&lt;</a></span>';
            }
        }
        return '<tr><td class="hiekn-infobox-info-label">' + extra.k + '</td><td class="hiekn-infobox-info-detail">' + detail + '</td></tr>';
    }

    load(id: HieknIdType, callback: Function, onFailed?: Function) {
        const queryData = this.options.queryData || {};
        const formData = this.options.formData || {};
        formData.id = id;
        formData.kgName = this.options.kgName;
        HieknSDKUtils.ajax({
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'infobox', queryData),
            type: 'POST',
            data: formData,
            dataFilter: this.options.dataFilter,
            success: (data: any) => {
                data = data[0];
                if (data) {
                    if (callback) {
                        this.callback = callback;
                        callback(data);
                    } else if (this.options.selector) {
                        const $container = this.buildInfobox(data);
                        $(this.options.selector).html($container[0].outerHTML);
                        this.initEvent($container);
                    } else {
                        console.error('selector or callback can not be null');
                    }
                    this.options.onLoad(data);
                } else {
                    if (!onFailed || !onFailed(data)) {
                        this.options.onFailed(data);
                    }
                }
            },
            error: (jqXHR: JQueryXHR) => {
                if (!onFailed || !onFailed(null)) {
                    this.options.onFailed(null);
                }
            }
        });
    };

    buildInfobox(data: any) {
        const $infoxbox = $('<div class="hiekn-infobox"></div>');
        if (data.self) {
            $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"></div>');
            const baseEntity = this.buildEntity(data.self, false);
            $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + baseEntity + '</div>');
            if (data.self.img) {
                let imgUlrl = data.self.img;
                if (data.self.img.indexOf('http') != 0) {
                    imgUlrl = HieknSDKUtils.qiniuImg(this.options.imagePrefix + data.self.img);
                }
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-img"><img src="' + imgUlrl + '" alt=""></div>');
            }
            if (data.self.extra) {
                let html = '';
                const visible = this.options.atts.visible || [];
                const hidden = this.options.atts.hidden || [];
                for (const i in data.self.extra) {
                    if (data.self.extra.hasOwnProperty(i)) {
                        const extra = data.self.extra[i];
                        if ((visible.length && _.indexOf(visible, extra.k) >= 0) || (hidden.length && _.indexOf(hidden, extra.k) < 0) || (!visible.length && !hidden.length)) {
                            html += this.buildExtra(extra);
                        }
                    }
                }
                if (data.atts) {
                    for (const m in data.atts) {
                        if (data.atts.hasOwnProperty(m)) {
                            const att = data.atts[m];
                            let lis = '';
                            for (const j in att.v) {
                                if (att.v.hasOwnProperty(j)) {
                                    lis += '<li>' + this.buildEntity(att.v[j], true) + '</li>';
                                }
                            }
                            if (visible.length && _.indexOf(visible, att.k) >= 0) {
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            } else if (hidden.length && _.indexOf(hidden, att.k) < 0) {
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            } else if (!visible.length && !hidden.length) {
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            }
                        }
                    }
                }
                $infoxbox.find('.hiekn-infobox-body').append('<table><tbody>' + html + '</tbody></table>');
            }
            if (data.pars) {
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                for (const k in data.pars) {
                    if (data.pars.hasOwnProperty(k)) {
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + this.buildEntity(data.pars[k], true) + '</li>');
                    }
                }
            }
            if (data.sons) {
                let html = '';
                for (const l in data.sons) {
                    if (data.sons.hasOwnProperty(l)) {
                        html += '<li>' + this.buildEntity(data.sons[l], true) + '</li>';
                    }
                }
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">相关：</label><ul>' + html + '</ul></div>');
            }
        } else {
            $infoxbox.append('InfoBox读取错误');
        }
        return $infoxbox;
    }

    buildTabInfobox(data: any) {
        const $infoxbox = $('<div class="hiekn-infobox hiekn-infobox-tab"></div>');
        if (data.self) {
            $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"><ul class="nav nav-tabs" role="tablist"></ul><div class="tab-content"></div></div>');
            $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + this.buildEntity(data.self, false) + '</div>');
            const visible = this.options.atts.visible || [];
            const hidden = this.options.atts.hidden || [];
            if (data.self.extra) {
                let html = '';
                for (const i in data.self.extra) {
                    if (data.self.extra.hasOwnProperty(i)) {
                        const extra = data.self.extra[i];
                        if ((visible.length && _.indexOf(visible, extra.k) >= 0) || (hidden.length && _.indexOf(hidden, extra.k) < 0) || (!visible.length && !hidden.length)) {
                            html += this.buildExtra(extra);
                        }
                    }
                }
                const id = 'hiekn-infobox-' + new Date().getTime() + '-' + data.self.id;
                $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation" class="active"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">基本信息</a></li>');
                $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-detail tab-pane active" id="' + id + '"><table><tbody>' + html + '</tbody></table></div>');
            }
            if (data.pars) {
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                for (const k in data.pars) {
                    if (data.pars.hasOwnProperty(k)) {
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + this.buildEntity(data.pars[k], true) + '</li>');
                    }
                }
            }
            if (data.sons) {
                let html = '';
                for (const l in data.sons) {
                    if (data.sons.hasOwnProperty(l)) {
                        html += '<li>' + this.buildEntity(data.sons[l], true) + '</li>';
                    }
                }
                const id = 'hiekn-infobox-' + new Date().getTime() + '-sons-' + data.self.id;
                $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">子节点</a></li>');
                $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
            }
            if (data.atts) {
                for (const m in data.atts) {
                    if (data.atts.hasOwnProperty(m)) {
                        const att = data.atts[m];
                        let html = '';
                        for (const j in att.v) {
                            if (att.v.hasOwnProperty(j)) {
                                html += '<li>' + this.buildEntity(att.v[j], true) + '</li>';
                            }
                        }
                        if ((visible.length && _.indexOf(visible, att.k) >= 0) || (hidden.length && _.indexOf(hidden, att.k) < 0) || (!visible.length && !hidden.length)) {
                            const id = 'hiekn-infobox-' + new Date().getTime() + '-att-' + m + '-' + data.self.id;
                            $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">' + att.k + '</a></li>');
                            $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
                        }
                    }
                }
            }
        } else {
            $infoxbox.append('InfoBox读取错误');
        }
        return $infoxbox;
    }
}
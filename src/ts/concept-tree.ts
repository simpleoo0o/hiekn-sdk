interface HieknConceptTreeInsSearchSetting extends HieknAjaxSetting {
    paramName?: string
}

interface HieknConceptTreeInsSetting extends HieknAjaxSetting {
    enable?: boolean;
    onClick?: Function;
    searchSettings?: HieknConceptTreeInsSearchSetting;
}

interface HieknConceptTreeSetting extends HieknBaseSetting {
    kgName?: string;
    container?: string;
    getAsyncUrl?: Function;
    idKey?: string;
    initId?: number;
    nameKey?: string;
    onNodeClick?: Function;
    nodeHoverTools?: {
        infoboxSetting?: HieknNetChartInfoboxSetting,
        graphSetting?: {
            enable?: boolean;
            instanceEnable?: boolean;
            infoboxSetting?: HieknNetChartInfoboxSetting;
            conceptGraphSettings?: HieknConceptGraphSetting
        }
    },
    instance?: HieknConceptTreeInsSetting,
    namespace?: string,
    pIdKey?: string,
    readAll?: boolean,
    hiddenIds?: { self?: number[], rec?: number[] }
}
class HieknSDKConceptTree {
    $container: JQuery;
    $graphContainer: JQuery;
    $instanceContainer: JQuery;
    treeId: string;
    clickTimeout: any;
    isFirst = true;
    lastSelectedNode: any;
    startAsync = false;
    treeDbClick = false;
    instanceSearchSettings: any;
    zTreeSettings: any;
    zTree: any;
    treeInfobox: HieknSDKInfobox;
    tgc2ConceptGraph: HieknSDKConceptGraph;
    instanceSearch: any;
    options: HieknConceptTreeSetting;
    defaults: HieknConceptTreeSetting = {
        getAsyncUrl: () => {
            let queryData: any = {};
            queryData.kgName = this.options.kgName;
            if (this.options.readAll) {
                queryData.id = this.getLastSelectedNodeId() || 0;
            } else {
                queryData.id = this.getLastSelectedNodeId() || this.options.initId;
            }
            queryData.onlySubTree = this.isFirst ? 0 : 1;
            $.extend(true, queryData, this.options.queryData);
            return HieknSDKUtils.buildUrl(this.options.baseUrl + 'concept', queryData);
        },
        idKey: 'id',
        initId: 0,
        nameKey: 'name',
        onNodeClick: $.noop,
        nodeHoverTools: {
            infoboxSetting: {
                enable: false
            },
            graphSetting: {
                enable: false,
                instanceEnable: false,
                infoboxSetting: {
                    enable: false
                }
            }
        },
        instance: {
            enable: false,
            onClick: $.noop
        },
        namespace: 'hiekn-concept-tree',
        pIdKey: 'parentId',
        readAll: false,
        hiddenIds: {self: [], rec: []}
    };

    constructor(options: HieknConceptTreeSetting) {
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }

    private init() {
        this.$container = $(this.options.container);
        this.treeId = HieknSDKUtils.randomId(this.options.namespace + '-');
        this.$container.addClass('hiekn-concept-tree').append('<ul class="ztree" id="' + this.treeId + '"></ul>');
        this.zTreeSettings = this.updateZTreeSettings();
        this.zTree = (<any>$.fn).zTree.init(this.$container.find('.ztree'), this.zTreeSettings);
        if (this.options.nodeHoverTools.graphSetting.enable) {
            this.buildGraph();
        }
        if (this.options.nodeHoverTools.infoboxSetting.enable) {
            this.treeInfobox = this.buildInfobox(this.options.nodeHoverTools.infoboxSetting);
        }
        if (this.options.instance.enable) {
            const id = HieknSDKUtils.randomId(this.options.namespace + '-prompt-');
            this.$instanceContainer = $('<div class="hiekn-instance-container"><div class="hiekn-instance-prompt" id="' + id + '"></div><div class="hiekn-instance-list"></div></div>');
            this.$container.append(this.$instanceContainer);
            this.instanceSearchSettings = {
                container: '#' + id,
                promptEnable: false,
                placeholder: '实例搜索',
                onSearch: (kw: string) => {
                    let options: HieknConceptTreeInsSearchSetting = {
                        paramName: 'kw',
                        url: this.options.baseUrl + 'prompt',
                        type: 'POST',
                        formData: {
                            kgName: this.options.kgName
                        }
                    };
                    $.extend(true, options, this.options.instance.searchSettings);
                    options.formData[options.paramName] = kw;
                    let newOptions = {
                        url: HieknSDKUtils.buildUrl(options.url, options.queryData),
                        dataFilter: options.dataFilter || this.options.dataFilter,
                        data: options.formData,
                        success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
                            if (data) {
                                const $container = this.select('.instance-loader-container');
                                $container.attr({'data-more': '0', 'data-page': '1'});
                                this.drawInstanceList(data, false);
                                options.success && options.success(data, textStatus, jqXHR);
                            }
                        }
                    };
                    newOptions = $.extend(true, {}, options, newOptions);
                    HieknSDKUtils.ajax(newOptions);
                }
            };
            this.instanceSearch = new hieknPrompt(this.instanceSearchSettings);
            this.bindInstanceEvent();
        }
    }

    addHoverDom(treeId: string, treeNode: any) {
        const sObj = this.select('#' + treeNode.tId + '_span');
        if (this.select('#button-container_' + treeNode.tId).length > 0) {
            return;
        }
        const $container = $('<span class="button-container" id="button-container_' + treeNode.tId + '" ></span>');
        sObj.after($container);
        this.onNodeHover($container, treeNode);
    }

    beforeAsync(treeId: string, treeNode: any) {
        if (treeNode) {
            this.startAsync = true;
            this.lastSelectedNode = treeNode;
        }
        return true;
    }

    private bindInstanceEvent() {
        this.select('.hiekn-instance-list').on('scroll', (event: Event) => {
            if ($(event.target).height() + $(event.target).scrollTop() > $(event.target)[0].scrollHeight - 50) {
                this.loadInstanceService();
            }
        });
        this.select('.hiekn-instance-list').on('click', 'li[data-id]', (event: Event) => {
            const node = $(event.currentTarget).data('data');
            $(event.currentTarget).addClass('active').siblings('.active').removeClass('active');
            this.options.instance.onClick(node);
        });
    }

    private buildInfobox(infoboxOptions: HieknInfoboxSetting) {
        let options = {
            baseUrl: this.options.baseUrl,
            dataFilter: this.options.dataFilter,
            kgName: this.options.kgName
        };
        $.extend(true, options, infoboxOptions);
        return new HieknSDKInfobox(options);
    }

    /**
     * TODO to replace modal
     * */
    private buildGraph() {
        const selector = HieknSDKUtils.randomId(this.options.namespace + '-tgc2-');
        this.$graphContainer = $('<div class="modal fade hiekn-concept-tree-graph-modal" id="' + selector + '-modal" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">' +
            '<div class="modal-dialog modal-lg">' +
            '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">' +
            '<svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
            '</button>' +
            '<h4 class="modal-title"><span name="title"></span></h4></div><div class="modal-body"><div class="' + selector + '"></div></div></div></div></div>');
        $('body').append(this.$graphContainer);
        let settings: HieknConceptGraphSetting = {
            selector: '.' + selector,
            baseUrl: this.options.baseUrl,
            dataFilter: this.options.dataFilter,
            kgName: this.options.kgName,
            infoboxSetting: this.options.nodeHoverTools.graphSetting.infoboxSetting,
            instanceEnable: this.options.nodeHoverTools.graphSetting.instanceEnable,
            promptSettings: {
                dataFilter: this.options.dataFilter
            }
        };
        $.extend(true, settings, this.options.nodeHoverTools.graphSetting.conceptGraphSettings);
        this.tgc2ConceptGraph = new HieknConceptGraphService(settings);
    }

    private dataFilter(treeId: string, parentNode: any, data: any) {
        if (this.options.dataFilter) {
            data = this.options.dataFilter(data, undefined);
        }
        if (data.code == 200) {
            if (!data.data || !data.data.rsData) {
                return null;
            }
            data = data.data.rsData;
            const len = data.length;
            let result = [];
            for (let i = 0; i < len; i++) {
                !this.options.readAll && (data[i].isParent = true);
                if (_.indexOf(this.options.hiddenIds.self, data[i][this.options.idKey]) < 0
                    && _.indexOf(this.options.hiddenIds.rec, data[i][this.options.idKey]) < 0
                    && _.indexOf(this.options.hiddenIds.rec, data[i][this.options.pIdKey]) < 0) {
                    if (!parentNode || data[i][this.options.idKey] != parentNode[this.options.idKey]) {
                        result.push(data[i]);
                    }
                }
                if (_.indexOf(this.options.hiddenIds.rec, data[i][this.options.pIdKey]) >= 0) {
                    this.options.hiddenIds.rec.push(data[i][this.options.idKey]);
                }
            }
            if (result.length == 0) {
                parentNode.isParent = false;
            } else {
                return result;
            }
        } else {
            HieknSDKUtils.error(data.msg);
        }
        return null;
    }

    private drawInstanceList(instances: any[], append: boolean) {
        const $container = this.$instanceContainer.find('.hiekn-instance-list ul');
        let html = $('<ul></ul>');
        if (instances.length) {
            for (const instance of instances) {
                html.append($('<li data-id="' + instance.id + '" title="' + instance.name + '">' + instance.name + '</li>').data('data', instance));
            }
        } else if (!append) {
            html.append('<li>没有找到相关实例</li>');
        }
        if (append) {
            $container.append(html.children());
        } else {
            $container.empty().append(html.children());
        }
    }

    private expandNodes(nodeId: number) {
        const node = this.zTree.getNodeByParam(this.options.idKey, nodeId);
        if (node) {
            this.zTree.expandNode(node, true, false, true, false);
            const parentNode = node.getParentNode();
            parentNode && this.expandNodes(parentNode[this.options.idKey]);
        }
    }

    private getAsyncUrl() {
        return typeof this.options.getAsyncUrl == 'string' ? this.options.getAsyncUrl : this.options.getAsyncUrl(this);
    }

    getLastSelectedNodeId() {
        return this.lastSelectedNode ? this.lastSelectedNode[this.options.idKey] : null;
    }

    getLastSelectedInstance() {
        return this.select('.hiekn-instance-list li[data-id].active').data('data');
    }

    private loadGraph(id: number) {
        this.tgc2ConceptGraph.load({
            id: id,
            kgType: 0
        });
    }

    reloadInstance() {
        this.select('.hiekn-instance-list').html('<ul></ul><div class="instance-loader-container" data-more="1" data-page="1"></div>');
        this.loadInstanceService();
    }

    private loadInstanceService() {
        const $container = this.select('.instance-loader-container');
        if ($container.attr('data-more') != '0') {
            if ($container.data('inLoading') != 1) {
                $container.data('inLoading', 1);
                let options: HieknConceptTreeInsSetting = {
                    queryData: {
                        conceptId: this.getLastSelectedNodeId() || this.options.initId,
                        readAll: 0,
                        pageNo: $container.attr('data-page'),
                        pageSize: 15,
                        kgName: this.options.kgName
                    }
                };
                $.extend(true, options, this.options.instance);
                let newOptions = {
                    url: HieknSDKUtils.buildUrl(options.url, options.queryData),
                    dataFilter: options.dataFilter || this.options.dataFilter,
                    success: (data: any, textStatus: string, jqXHR: JQueryXHR, orgData: any, params: any) => {
                        let d = data;
                        if (d.length <= params.pageSize) {
                            $container.attr({'data-more': 0});
                        }
                        if (d.length > params.pageSize) {
                            d.pop();
                        }
                        this.drawInstanceList(d, params.pageNo != 1);
                        $container.attr({'data-page': parseInt(params.pageNo, 10) + 1});
                        options.success && options.success(data, textStatus, jqXHR);
                    },
                    complete: (jqXHR: JQueryXHR, textStatus: string) => {
                        $container.data('inLoading', 0);
                        const $ic = this.select('.hiekn-instance-list');
                        if ($ic.children('ul').height() < $ic.height()) {
                            this.loadInstanceService();
                        }
                        options.complete && options.complete(jqXHR, textStatus);
                    },
                    that: $container[0]
                };
                newOptions = $.extend(true, {}, options, newOptions);
                HieknSDKUtils.ajax(newOptions);
            }
        } else {
            console.log('no more instance');
        }
    }

    onAsyncSuccess(event: Event, treeId: string, treeNode: any) {
        let node = treeNode;
        if (node) {
            this.onNodeClick(node);
        }
        if (node && node.children.length == 0) {
            node.isParent = false;
            this.zTree.updateNode(node);
            HieknSDKUtils.info('当前概念没有子概念');
        } else if (!node) {
            this.expandNodes(this.getLastSelectedNodeId() || this.options.initId);
            if (!this.getLastSelectedNodeId()) {
                node = this.zTree.getNodeByParam(this.options.idKey, this.options.initId);
                this.zTree.selectNode(node);
                this.onNodeClick(node);
            }
        }
        const root = this.zTree.getNodeByParam(this.options.idKey, this.options.initId);
        this.addHoverDom(treeId, root);
        this.isFirst = false;
        this.startAsync = false;
    }

    onClick(event: Event, treeId: string, treeNode: any) {
        this.clickTimeout && clearTimeout(this.clickTimeout);
        this.clickTimeout = setTimeout(() => {
            this.lastSelectedNode = treeNode;
            this.onNodeClick(treeNode);
            this.treeDbClick = false;
        }, 500);
    }

    onNodeButtonClick($button: JQuery, treeNode: any) {
        this.select('.tree-button-active').removeClass('tree-button-active');
        this.zTree.selectNode(treeNode);
        $button.addClass('tree-button-active');
        this.lastSelectedNode = treeNode;
    }

    onNodeClick(node: any) {
        if (this.options.instance.enable) {
            this.reloadInstance();
        }
        this.options.onNodeClick(node);
    }

    /**
     * TODO to replace tooltipster, modal
     * */
    onNodeHover($container: JQuery, treeNode: any) {
        for (const key in this.options.nodeHoverTools) {
            const value = this.options.nodeHoverTools[key];
            if (key == 'graph' && value.enable) {
                const $graphBtn = $('<span class="button" title="图谱可视化">' +
                    '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12">' +
                    '<path d="M892.790083 1009.647551c-58.355904 31.366176-131.161266 9.611215-162.610663-48.591301-24.342972-' +
                    '45.045432-16.764962-98.703426 14.947153-135.21462L698.862198 739.012706c-23.246413 7.764034-48.157246 11' +
                    '.970777-74.066732 11.970777-114.073211 0-208.817925-81.626793-227.545924-188.916672l-96.293279-0.561334c' +
                    '-16.764962 45.964127-60.950442 78.79075-112.82979 78.79075-66.291275 0-120.03249-53.600882-120.03249-119' +
                    '.725715 0-66.119938 53.741215-119.725715 120.03249-119.725715 51.30496 0 95.064544 32.111902 112.242348 7' +
                    '7.279717l97.913641 0.567861C419.241111 374.137368 512.680397 295.287873 624.795466 295.287873c18.375534 0' +
                    ' 36.248477 2.12948 53.382222 6.132249l39.022512-93.152092c-36.248477-32.934321-49.896729-86.177842-30.1749' +
                    '73-134.041367 25.204555-61.154415 95.338684-90.360108 156.651383-65.220824 61.319226 25.132756 90.596716 9' +
                    '5.089021 65.398689 156.243437-19.504729 47.334826-65.92086 75.494544-114.326137 74.176062l-39.959157 95.3' +
                    '82743c60.924334 41.018186 100.921022 110.062283 100.921022 188.324334 0 70.620402-32.565538 133.736223-83.6' +
                    '86106 175.526243l46.409604 87.10796c48.521134-7.086843 98.455394 16.133461 123.065979 61.683114C972.95806 90' +
                    '5.658773 951.145986 978.273217 892.790083 1009.647551L892.790083 1009.647551zM892.790083 1009.647551"></path>' +
                    '</svg>' +
                    '</span>');
                $container.append($graphBtn);
                $graphBtn.on('click', (event: Event) => {
                    (<any>this.$graphContainer).modal('show');
                    this.loadGraph(treeNode[this.options.idKey]);
                    event.stopPropagation();
                });
            } else if (key == 'infobox' && value.enable) {
                const $infoboxBtn = $('<span class="button" title="知识卡片">' +
                    '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12">' +
                    '<path d="M638.596211 191.936191q30.628116 0 54.62014 13.272183t41.347956 32.66999 26.544367 41.85842' +
                    '5 9.188435 39.81655l0 576.829511q0 29.607178-11.740778 53.088734t-30.628116 39.81655-42.368893 25.5' +
                    '2343-46.963111 9.188435l-503.322034 0q-19.397807 0-42.368893-11.230309t-42.879362-29.607178-33.1804' +
                    '59-42.368893-13.272183-48.494516l0-568.662014q0-21.439681 10.209372-44.410768t26.544367-42.368893 37' +
                    '.774676-32.159521 44.921236-12.761715l515.57328 0zM578.360917 830.021934q26.544367 0 45.431705-18.3' +
                    '76869t18.887338-44.921236-18.887338-45.431705-45.431705-18.887338l-382.851446 0q-26.544367 0-45.431' +
                    '705 18.887338t-18.887338 45.431705 18.887338 44.921236 45.431705 18.376869l382.851446 0zM578.360917 5' +
                    '74.787637q26.544367 0 45.431705-18.376869t18.887338-44.921236-18.887338-45.431705-45.431705-18.8873' +
                    '38l-382.851446 0q-26.544367 0-45.431705 18.887338t-18.887338 45.431705 18.887338 44.921236 45.4317' +
                    '05 18.376869l382.851446 0zM759.0668 0q43.900299 0 80.654038 26.033898t63.808574 64.319043 42.368893 82.' +
                    '695912 15.314058 81.164506l0 542.117647q0 21.439681-12.761715 39.306082t-31.138584 30.628116-39.816' +
                    '55 20.418744-39.81655 7.657029l-4.083749 0 0-609.499501q-8.167498-70.444666-43.900299-108.219342t-' +
                    '94.947159-49.004985l-498.217348 0q1.020937-2.041874 1.020937-7.14656 0-20.418744 12.251246-41.85842' +
                    '5t32.159521-38.795613 44.410768-28.586241 49.004985-11.230309l423.688933 0z"></path>' +
                    '</svg>' +
                    '</span>');
                $container.append($infoboxBtn);
                (<any>$infoboxBtn).tooltipster({
                    side: ['bottom'],
                    theme: 'tooltipster-shadow',
                    distance: 16,
                    interactive: true,
                    trigger: 'click',
                    content: 'Loading...',
                    functionBefore: (instance: any, helper: any) => {
                        const $origin = $(helper.origin);
                        if ($origin.data('loaded') !== true) {
                            const id = treeNode[this.options.idKey];
                            this.treeInfobox.load(id, (data: any) => {
                                if (data) {
                                    const $container = this.treeInfobox.buildInfobox(data);
                                    instance.content($container);
                                    this.treeInfobox.initEvent($container);
                                } else {
                                    instance.content('没有当前概念的知识卡片信息');
                                }
                                $origin.data('loaded', true);
                            }, () => {
                                instance.content('read data failed');
                            });
                        }
                    }
                });
                $infoboxBtn.on('click', (event: Event) => {
                    event.stopPropagation();
                });
            } else if (value instanceof Function) {
                value($container, treeNode);
            }
        }
        return true;
    };

    removeHoverDom(treeId: string, treeNode: any) {
        if (treeNode.level > 0) {
            const $container = this.select('#button-container_' + treeNode.tId);
            $container.children().off('click');
            $container.remove();
        }
    };

    private select(selector: string) {
        return $(this.options.container).find(selector);
    };

    private updateZTreeSettings() {
        return {
            async: {
                enable: true,
                url: () => {
                    return this.getAsyncUrl();
                },
                dataFilter: (treeId: string, parentNode: any, data: any) => {
                    return this.dataFilter(treeId, parentNode, data);
                },
                type: 'get'
            },
            view: {
                showLine: false,
                showIcon: false,
                expandSpeed: 'fast',
                dblClickExpand: (treeId: string, treeNode: any) => {
                    return treeNode.level > 0;
                },
                selectedMulti: false,
                addHoverDom: (treeId: string, treeNode: any) => {
                    this.addHoverDom(treeId, treeNode);
                },
                removeHoverDom: (treeId: string, treeNode: any) => {
                    this.removeHoverDom(treeId, treeNode);
                }
            },
            callback: {
                beforeAsync: (treeId: string, treeNode: any) => {
                    return this.beforeAsync(treeId, treeNode);
                },
                onAsyncSuccess: (event: Event, treeId: string, treeNode: any) => {
                    return this.onAsyncSuccess(event, treeId, treeNode);
                },
                onClick: (event: Event, treeId: string, treeNode: any) => {
                    return this.onClick(event, treeId, treeNode);
                },
                onDblClick: () => {
                    this.treeDbClick = true;
                }
            },
            data: {
                simpleData: {
                    enable: true,
                    pIdKey: this.options.pIdKey,
                    idKey: this.options.idKey
                },
                key: {
                    name: this.options.nameKey
                }
            }
        };
    }
}
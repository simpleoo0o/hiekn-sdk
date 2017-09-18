/**
     * @author: 
     *    jiangrun002
     * @version: 
     *    v3.0.0
     * @license:
     *    Copyright 2017, jiangrun. All rights reserved.
     */

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var HieknSDKNetChart = /** @class */ (function () {
    function HieknSDKNetChart(options) {
        this.isInit = false;
        this.isTiming = false;
        this.options = {};
        this.baseSettings = {};
        this.promptSettings = {};
        this.filterSettings = {};
        this.infoboxSettings = {};
        this.loaderSettings = {};
        this.nodeSettings = {};
        this.schemaSettings = {};
        this.initSettings = {};
        this.defaultTgc2Options = {};
        this.defaultColor = '#00b38a';
        this.options = options;
        this.beforeInit(options);
    }
    HieknSDKNetChart.prototype.load = function (startInfo) {
        var _this = this;
        setTimeout(function () {
            if (_this.isInit) {
                if (!startInfo) {
                    _this.graphInit(_this.initSettings);
                }
                else {
                    _this.tgc2.load(startInfo);
                }
            }
            else {
                _this.load(startInfo);
            }
        }, 30);
    };
    HieknSDKNetChart.prototype.beforeInit = function (options) {
        var _this = this;
        this.isInit = false;
        this.baseSettings = {
            baseUrl: options.baseUrl,
            dataFilter: options.dataFilter,
            formData: options.formData || {},
            queryData: options.queryData || {}
        };
        this.filterSettings = {
            selectedAtts: options.selectedAtts,
            selectedTypes: options.selectedTypes
        };
        this.infoboxSettings = {
            enable: true,
            selector: options.selector,
            imagePrefix: options.imagePrefix,
            kgName: options.kgName
        };
        $.extend(true, this.infoboxSettings, this.baseSettings, options.infoboxSetting);
        this.loaderSettings = {
            selector: options.selector,
            formData: { kgName: options.kgName }
        };
        $.extend(true, this.loaderSettings, this.baseSettings);
        this.nodeSettings = {
            autoUpdateStyle: typeof (options.autoUpdateStyle) == 'boolean' ? options.autoUpdateStyle : true,
            imagePrefix: options.imagePrefix,
            images: options.images,
            nodeColors: options.nodeColors,
            textColors: options.textColors,
            minRadius: options.minRadius || 10,
            legendClass: null,
            legendColor: null
        };
        this.promptSettings = {
            kgName: options.kgName
        };
        $.extend(true, this.promptSettings, this.baseSettings);
        this.initSettings = {
            formData: { kgName: options.kgName },
            that: $(options.selector)[0]
        };
        $.extend(true, this.initSettings, this.baseSettings);
        this.legendFilter = {};
        this.layoutStatus = options.layoutStatus;
        if (options.schema) {
            this.init(options, options.schema);
        }
        else {
            this.schemaSettings = {
                kgName: options.kgName,
                that: $(options.selector)[0]
            };
            $.extend(true, this.schemaSettings, this.baseSettings, options.schemaSetting);
            this.schemaSettings.success = function (schema) {
                _this.init(options, schema);
            };
            HieknSDKSchema.load(this.schemaSettings);
        }
    };
    HieknSDKNetChart.prototype.graphInit = function (options) {
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        formData.isTiming = this.isTiming;
        HieknSDKUtils.ajax({
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'graph/init', queryData),
            type: 'POST',
            data: formData,
            dataFilter: options.dataFilter,
            success: function (data) {
                options.success(data[0]);
            }
        });
    };
    HieknSDKNetChart.prototype.gentInfobox = function (options) {
        options.formData.isRelationAtts = typeof (options.formData.isRelationAtts) == 'boolean' ? options.formData.isRelationAtts : true;
        this.infoboxService = new HieknSDKInfobox(options);
        this.infoboxService.initEvent($(options.selector));
    };
    HieknSDKNetChart.prototype.infobox = function (data, node, callback) {
        var _this = this;
        if (node.detail) {
            callback(node.detail);
        }
        else {
            this.infoboxService.load(data.id, function (data) {
                data = _this.infoboxService.buildInfobox(data)[0].outerHTML;
                node.detail = data;
                callback(data);
            });
        }
        return null;
    };
    HieknSDKNetChart.prototype.init = function (options, schema) {
        var _this = this;
        if (options.autoColor) {
            var colors = {};
            for (var i in schema.types) {
                colors[schema.types[i].k] = HieknSDKUtils.color[parseInt(i) % HieknSDKUtils.color.length];
            }
            $.extend(true, colors, this.nodeSettings.nodeColors || {});
            this.nodeSettings.nodeColors = colors;
        }
        this.defaultTgc2Options = {
            selector: options.selector,
            filter: {
                enable: true,
                filters: HieknSDKNetChart.buildFilter(schema, this.filterSettings)
            },
            crumb: {
                enable: true
            },
            find: {
                enable: true
            },
            legend: {
                enable: true,
                data: this.nodeSettings.nodeColors || {},
                legendDraw: this.legendDraw(schema, options.legendType),
                onClick: function (e) {
                    _this.legendClick(e);
                },
                onDblClick: function (e) {
                    _this.legendDblClick(e);
                },
                onMouseEnter: function (e) {
                    _this.legendMouseEnter(e);
                },
                onMouseLeave: function (e) {
                    _this.legendMouseLeave(e);
                }
            },
            netChart: {
                settings: {
                    filters: {
                        nodeFilter: function (nodeData) {
                            return _this.nodeFilter(nodeData);
                        }
                    },
                    nodeMenu: {
                        contentsFunction: function (data, node, callback) {
                            return _this.infobox(data, node, callback);
                        }
                    },
                    style: {
                        node: {
                            display: options.display || 'circle'
                        },
                        nodeStyleFunction: this.nodeStyleFunction(this.nodeSettings)
                    },
                    info: {
                        linkContentsFunction: HieknSDKNetChart.linkContentsFunction
                    }
                }
            },
            loader: this.loader(this.loaderSettings, schema)
        };
        this.buildPrivateSetting(schema);
        this.tgc2Filter = new Tgc2Filter(this.tgc2, this.tgc2Settings.filter);
        this.tgc2Crumb = new Tgc2Crumb(this.tgc2, this.tgc2Settings.crumb);
        this.tgc2Find = new Tgc2Find(this.tgc2, this.tgc2Settings.find);
        this.tgc2Legend = new Tgc2Legend(this.tgc2, this.tgc2Settings.legend);
        this.infoboxSettings.enable && this.gentInfobox(this.infoboxSettings);
        this.tgc2.init();
        this.isInit = true;
        if (options.startInfo) {
            this.load(options.startInfo);
        }
    };
    HieknSDKNetChart.prototype.legend = function (schema) {
        var typeObj = {};
        for (var _i = 0, _a = schema.types; _i < _a.length; _i++) {
            var type = _a[_i];
            typeObj[type.k] = type.v;
        }
        return function (key, value) {
            return '<i style="background: ' + value + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>';
        };
    };
    HieknSDKNetChart.prototype.legendClick = function (e) {
        var $obj = $(e.currentTarget);
        $obj.toggleClass('off');
        this.legendFilter[$obj.data('key')] = $obj.hasClass('off');
        this.tgc2.netChart.updateFilters();
    };
    HieknSDKNetChart.prototype.legendDblClick = function (e) {
        var _this = this;
        var $obj = $(e.currentTarget);
        var others = $obj.removeClass('off').siblings();
        others.addClass('off');
        var classId = $obj.data('key');
        this.legendFilter = {};
        this.legendFilter[classId] = false;
        others.each(function (i, v) {
            _this.legendFilter[$(v).data('key')] = true;
        });
        this.tgc2.netChart.updateFilters();
    };
    HieknSDKNetChart.prototype.legendDraw = function (schema, legendType) {
        var _this = this;
        var typeObj = {};
        for (var _i = 0, _a = schema.types; _i < _a.length; _i++) {
            var type = _a[_i];
            typeObj[type.k] = type.v;
        }
        return function (data, $container) {
            _this.legendFilter = {};
            var nodes = _.filter(_this.tgc2.getAvailableData().nodes, function (n) {
                return !n.hidden;
            });
            var classIds = _.keys(_.groupBy(nodes, 'classId'));
            // const $fabContainer = $('<div class="legend-fab-container"></div>');
            // $container.html($fabContainer);
            if (legendType == 'fab') {
                var items = [];
                for (var key in data) {
                    if (data.hasOwnProperty(key) && _.indexOf(classIds, key) >= 0) {
                        var html = '';
                        var text = typeObj[key];
                        if (text.length > 3) {
                            html = '<div title="' + text + '"><div>' + text.substring(0, 2) + '</div><div class="line-hidden">' + text.substring(2) + '</div></div>';
                        }
                        else {
                            html = '<div class="line-hidden" title="' + text + '">' + text + '</div>';
                        }
                        items.push({
                            html: html,
                            data: {
                                'key': key,
                                'value': data[key]
                            },
                            style: {
                                'background': data[key],
                                'color': '#fff'
                            },
                            events: {
                                'click': function (e) {
                                    _this.legendClick(e);
                                },
                                'mouseenter': function (e) {
                                    _this.legendMouseEnter(e);
                                },
                                'mouseleave': function (e) {
                                    _this.legendMouseLeave(e);
                                },
                                'dblclick': function (e) {
                                    _this.legendDblClick(e);
                                }
                            }
                        });
                    }
                }
                var fab = new hieknjs.fab({
                    container: $container,
                    radius: 80,
                    angle: 90,
                    startAngle: 90,
                    initStatus: _this.layoutStatus,
                    main: {
                        html: '图例',
                        style: {
                            background: _this.defaultColor,
                            color: '#fff'
                        },
                        events: {
                            'click': function () {
                                _this.layoutStatus = !_this.layoutStatus;
                            }
                        }
                    },
                    items: items
                });
                // fab.run();
            }
            else {
                $container.html('');
                for (var key in data) {
                    if (data.hasOwnProperty(key) && _.indexOf(classIds, key) >= 0) {
                        var $obj = $('<div class="tgc2-legend-item tgc2-legend-item-' + key + '"></div>').data({
                            'key': key,
                            'value': data[key]
                        });
                        $container.append($obj.html('<i style="background: ' + data[key] + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>'));
                    }
                }
            }
        };
    };
    HieknSDKNetChart.prototype.legendMouseEnter = function (e) {
        var $obj = $(e.currentTarget);
        $obj.addClass('active').siblings().addClass('inactive');
        this.nodeSettings.legendClass = $obj.data('key');
        this.nodeSettings.legendColor = $obj.data('value');
        this.tgc2.netChart.updateStyle();
        // const nodes = _.filter(this.tgc2.getAvailableData().nodes, (n)=> {
        //     return !n.hidden && (<HieknNetChartDataNode>n).classId == $obj.data('key');
        // });
        // const ids = _.keys(_.groupBy(nodes, 'id'));
        // this.tgc2.netChart.scrollIntoView(ids);
    };
    HieknSDKNetChart.prototype.legendMouseLeave = function (e) {
        var $obj = $(e.currentTarget);
        $obj.removeClass('active inactive').siblings().removeClass('active inactive');
        this.nodeSettings.legendClass = null;
        this.nodeSettings.legendColor = null;
        this.tgc2.netChart.updateStyle();
    };
    HieknSDKNetChart.prototype.loader = function (options, schema) {
        var _this = this;
        return function ($self, callback, failed) {
            var params = _this.buildLoaderParams(options);
            HieknSDKUtils.ajax({
                url: HieknSDKUtils.buildUrl(options.baseUrl + params.url, params.queryData),
                type: 'POST',
                data: params.formData,
                dataFilter: options.dataFilter,
                success: function (data) {
                    data = data[0];
                    if (data) {
                        data = HieknSDKNetChart.dealGraphData(data, schema);
                    }
                    callback(data);
                },
                error: function () {
                    failed();
                },
                that: $(options.selector).find('.tgc2-netchart-container')[0]
            });
        };
    };
    HieknSDKNetChart.prototype.nodeFilter = function (nodeData) {
        return this.tgc2.inStart(nodeData.id) || !this.legendFilter[nodeData.classId];
    };
    HieknSDKNetChart.prototype.nodeStyleFunction = function (options) {
        var _this = this;
        if (options.autoUpdateStyle) {
            setInterval(function () {
                _this.updateStyle();
            }, 30);
        }
        return function (node) {
            var data = node.data;
            var classId = data.classId;
            var nodeIds = _this.tgc2.getEmphasesNode();
            var tgc2NetChartSetting = _this.tgc2.settings.netChart;
            node.label = node.data.name;
            node.lineWidth = 2;
            node.fillColor = node.data.color || tgc2NetChartSetting.nodeDefaultColor || node.fillColor;
            node.labelStyle.textStyle.font = '18px Microsoft Yahei';
            node.aura = node.data.auras;
            if (_this.tgc2.inStart(node.id)) {
                node.radius = 50;
                node.fillColor = tgc2NetChartSetting.emphasesColor;
            }
            if (nodeIds[node.id]) {
                node.fillColor = tgc2NetChartSetting.emphasesColor;
                node.label = node.data.name;
                node.radius = node.radius * 1.5;
            }
            else if (!$.isEmptyObject(nodeIds)) {
                node.fillColor = tgc2NetChartSetting.reduceColor;
                node.radius = node.radius * 0.5;
            }
            node.imageCropping = 'fit';
            if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                if (nodeIds[node.id] || options.legendClass == data.classId) {
                    node.radius = node.radius * 1.5;
                }
                else {
                    node.fillColor = _this.tgc2.settings.netChart.reduceColor;
                    node.label = '';
                    node.lineColor = node.fillColor;
                    node.radius = node.radius * 0.5;
                }
            }
            else {
                if (_this.tgc2.inStart(node.id)) {
                }
                else {
                    node.fillColor = data.color || '#fff';
                    node.lineColor = _this.defaultColor;
                    if (node.hovered) {
                        node.fillColor = node.lineColor;
                        node.shadowBlur = 0;
                    }
                }
            }
            if (options.nodeColors) {
                var value = HieknSDKNetChart.getHieknTypeUnionMapValue(options.nodeColors[classId]);
                if (value) {
                    if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                        if (nodeIds[node.id] || options.legendClass == classId) {
                            node.fillColor = options.legendColor || _this.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        }
                        else {
                        }
                    }
                    else {
                        if (_this.tgc2.inStart(node.id)) {
                            node.fillColor = _this.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        }
                        else {
                            node.lineColor = value;
                            if (!options.imagePrefix && !options.images && !data.img) {
                                node.fillColor = node.lineColor;
                            }
                            if (node.hovered) {
                                node.fillColor = node.lineColor;
                            }
                        }
                    }
                }
            }
            if (data.img) {
                if (data.img.indexOf('http') != 0 && options.imagePrefix) {
                    node.image = HieknSDKUtils.qiniuImg(options.imagePrefix + data.img);
                }
                else {
                    node.image = data.img;
                }
                // if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                //     if (nodeIds[node.id] || options.legendClass == classId) {
                //     } else {
                //         node.image = '';
                //     }
                // } else {
                //     if (this.tgc2.inStart(node.id) || node.hovered) {
                //     } else {
                //         node.image = '';
                //     }
                // }
                // && !$.isEmptyObject(nodeIds)
                // if (!this.tgc2.inStart(node.id)
                //     && !nodeIds[node.id]
                //     || (options.legendClass && options.legendClass !== classId) ) {
                //     node.image = '';
                // }
                node.fillColor = '#fff';
            }
            else if (options.images && options.images[classId]) {
                var value = HieknSDKNetChart.getHieknTypeUnionMapValue(options.images[classId]);
                if (value) {
                    if (!$.isEmptyObject(nodeIds) || options.legendClass) {
                        if (nodeIds[node.id] || options.legendClass == classId) {
                            node.image = options.legendColor || value.emphases;
                        }
                        else {
                            node.image = '';
                        }
                    }
                    else {
                        if (_this.tgc2.inStart(node.id) || node.hovered) {
                            node.image = value.emphases;
                        }
                        else {
                            node.image = value.normal;
                        }
                    }
                }
            }
            var radius = _this.tgc2.netChart.getNodeDimensions(node).radius;
            if (options.autoUpdateStyle) {
                if (radius < options.minRadius) {
                    node.image = '';
                    node.fillColor = node.lineColor;
                }
                if (_this.tgc2.inStart(node.id)) {
                    _this.centerNodeRadius = radius;
                    !_this.centerNode && (_this.centerNode = node);
                }
            }
            if (options.textColors) {
                var value = HieknSDKNetChart.getHieknTypeUnionMapValue(options.textColors[classId]);
                if (value) {
                    if (typeof value == 'string') {
                        node.labelStyle.textStyle.fillColor = value;
                    }
                    else {
                        if (_this.tgc2.inStart(node.id) || nodeIds[node.id]) {
                            node.labelStyle.textStyle.fillColor = value.emphases;
                        }
                        else {
                            if (node.hovered) {
                                node.labelStyle.textStyle.fillColor = value.emphases;
                            }
                            else {
                                node.labelStyle.textStyle.fillColor = value.normal;
                            }
                        }
                    }
                }
            }
            var len = node.label.length;
            if (node.display == 'roundtext') {
                var label = node.label;
                var regChinese = HieknSDKUtils.regChinese;
                var regEnglish = HieknSDKUtils.regEnglish;
                for (var i = 1; i < label.length - 1; i++) {
                    var char = label.charAt(i);
                    var charNext = label.charAt(i + 1);
                    if ((regChinese.test(char) && regEnglish.test(charNext)) || (regEnglish.test(char) && regChinese.test(charNext))) {
                        label = label.substring(0, i + 1) + ' ' + label.substring(i + 1);
                        i++;
                    }
                }
                node.label = label;
                if (node.label.indexOf(' ') < 0 && len > 5) {
                    if (len > 9) {
                        var perLine = Math.floor(node.label.length / 3);
                        var split2 = len - perLine;
                        node.label = node.label.substring(0, perLine) + ' ' +
                            node.label.substring(perLine, split2) + ' ' +
                            node.label.substring(split2);
                    }
                    else if (len > 5) {
                        node.label = node.label.substring(0, 4) + ' ' + node.label.substring(4);
                    }
                }
            }
        };
    };
    HieknSDKNetChart.prototype.updateStyle = function () {
        if (this.centerNode) {
            var radius = this.tgc2.netChart.getNodeDimensions(this.centerNode).radius;
            if (this.centerNodeRadius != radius) {
                var nodes = this.tgc2.netChart.nodes();
                var ids = [];
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    ids.push(node.id);
                }
                this.tgc2.netChart.updateStyle(ids);
            }
        }
    };
    HieknSDKNetChart.buildFilter = function (schema, options) {
        var allowAtts = [];
        var allowAttsSelected = [];
        var allowTypes = [];
        var allowTypesSelected = [];
        for (var i in schema.atts) {
            var att = schema.atts[i];
            if (att.type == 1) {
                allowAtts.push({ value: att.k, label: att.v });
                allowAttsSelected.push(att.k);
            }
        }
        for (var j in schema.types) {
            var type = schema.types[j];
            allowTypes.push({ value: type.k, label: type.v });
            allowTypesSelected.push(type.k);
        }
        allowAttsSelected = options.selectedAtts || allowAttsSelected;
        allowTypesSelected = options.selectedTypes || allowTypesSelected;
        return [
            {
                key: 'allowTypes',
                label: '设定分析主体',
                selected: allowTypesSelected,
                options: allowTypes
            },
            {
                key: 'allowAtts',
                label: '设定分析关系',
                selected: allowAttsSelected,
                options: allowAtts
            }
        ];
    };
    HieknSDKNetChart.dealGraphData = function (data, schema) {
        data.nodes = data.entityList;
        data.links = data.relationList;
        delete data.entityList;
        delete data.relationList;
        var schemas = {};
        var arr = _.concat(schema.types, schema.atts);
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var kv = arr_1[_i];
            schemas[kv.k] = kv.v;
        }
        for (var _a = 0, _b = data.nodes; _a < _b.length; _a++) {
            var node = _b[_a];
            node.typeName = schemas[node.classId];
        }
        for (var _c = 0, _d = data.links; _c < _d.length; _c++) {
            var link = _d[_c];
            link.typeName = schemas[link.attId];
        }
        return data;
    };
    HieknSDKNetChart.getHieknTypeUnionMapValue = function (value, type) {
        if (value instanceof String) {
            return value;
        }
        else if (type) {
            return value[type];
        }
        else {
            return value;
        }
    };
    HieknSDKNetChart.linkContentsFunction = function (linkData) {
        var rInfo = $.extend(true, [], (linkData.nRInfo || []), (linkData.oRInfo || []));
        if (rInfo) {
            var items = '';
            for (var _i = 0, rInfo_1 = rInfo; _i < rInfo_1.length; _i++) {
                var d = rInfo_1[_i];
                items += '<tr>';
                var kvs = d.kvs;
                var thead = '<tr>';
                var tbody = '<tr>';
                for (var j in kvs) {
                    if (kvs.hasOwnProperty(j)) {
                        thead += '<th><div class="link-info-key">' + kvs[j].k + '</div></th>';
                        tbody += '<td><div class="link-info-value">' + kvs[j].v + '</div></td>';
                    }
                }
                items += '<li><table><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table></li>';
            }
            return '<ul class="link-info">' + items + '</ul>';
        }
        else {
            return linkData.typeName;
        }
    };
    HieknSDKNetChart.orderRelation = function (data) {
        var obj = {};
        var from = _.countBy(data, 'from');
        var to = _.countBy(data, 'to');
        for (var f in from) {
            obj[f] = (obj[f] || 0) + (to[f] || 0) + from[f];
        }
        for (var t in to) {
            obj[t] = (obj[t] || 0) + (from[t] || 0) + to[t];
        }
        var arr = [];
        for (var o in obj) {
            arr.push({ k: o, v: obj[o] });
        }
        return _.orderBy(arr, 'v', 'desc');
    };
    return HieknSDKNetChart;
}());
var HieknSDKGraph = /** @class */ (function (_super) {
    __extends(HieknSDKGraph, _super);
    function HieknSDKGraph() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKGraph.prototype.buildPrivateSetting = function (schema) {
        var _this = this;
        var initSettings = {
            success: function (data) {
                if (data.entityList && data.entityList.length) {
                    _this.load(data.entityList[0]);
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        var filters = [{
                key: 'distance',
                label: '设定显示层数',
                selected: this.options.selectedDistance || 1,
                options: [1, 2, 3]
            }].concat(this.defaultTgc2Options.filter.filters);
        var defaultTgc2Options = {
            prompt: {
                enable: true,
                settings: {
                    drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                    onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                }
            },
            page: {
                enable: true,
                pageSize: 20
            }
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2Settings.filter.filters = filters;
        this.tgc2 = new Tgc2Graph(this.tgc2Settings);
        this.tgc2Prompt = new Tgc2Prompt(this.tgc2, this.tgc2Settings.prompt);
        this.tgc2Page = new Tgc2Page(this.tgc2, this.tgc2Settings.page);
    };
    HieknSDKGraph.prototype.buildLoaderParams = function (options) {
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        formData.id = this.tgc2.startInfo.id;
        formData.isRelationMerge = true;
        if (this.tgc2Filter) {
            var filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2Page) {
            var page = this.tgc2Page.page;
            formData.pageNo = page.pageNo;
            formData.pageSize = page.pageSize;
        }
        return { queryData: queryData, formData: formData, url: 'graph' };
    };
    return HieknSDKGraph;
}(HieknSDKNetChart));
var HieknSDKPath = /** @class */ (function (_super) {
    __extends(HieknSDKPath, _super);
    function HieknSDKPath() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKPath.prototype.buildPrivateSetting = function (schema) {
        var _this = this;
        var initSettings = {
            success: function (data) {
                if (data.relationList && data.relationList.length) {
                    var arr = HieknSDKNetChart.orderRelation(data.relationList);
                    var start = arr[2] ? arr[2].k : arr[0].k;
                    var end = arr[1].k;
                    _this.load({ id: new Date().getTime(), start: { 'id': start }, end: { 'id': end } });
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        var filters = [{
                key: 'distance',
                label: '设定分析步长',
                selected: this.options.selectedDistance || 3,
                options: [3, 4, 5, 6]
            }].concat(this.defaultTgc2Options.filter.filters);
        var defaultTgc2Options = {
            stats: {
                enable: true,
                editable: true,
                atts: schema.atts,
                types: schema.types,
                statsConfig: this.options.statsConfig
            },
            connects: {
                enable: true,
                mode: 'click'
            },
            legend: {
                enable: false
            },
            path: {
                prompt: {
                    settings: {
                        drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                        onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                    }
                }
            }
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2Settings.filter.filters = filters;
        this.tgc2 = new Tgc2Path(this.tgc2Settings);
        this.tgc2Stats = new Tgc2Stats(this.tgc2, this.tgc2Settings.stats);
        this.tgc2Connects = new Tgc2Connects(this.tgc2, this.tgc2Settings.connects);
    };
    HieknSDKPath.prototype.buildLoaderParams = function (options) {
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        formData.start = this.tgc2.startInfo.start.id;
        formData.end = this.tgc2.startInfo.end.id;
        formData.isShortest = true;
        formData.connectsCompute = true;
        formData.statsCompute = true;
        if (this.tgc2Filter) {
            var filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2Stats) {
            formData.statsConfig = this.tgc2Stats.getStatsConfig();
        }
        return { queryData: queryData, formData: formData, url: 'path' };
    };
    return HieknSDKPath;
}(HieknSDKNetChart));
var HieknSDKRelation = /** @class */ (function (_super) {
    __extends(HieknSDKRelation, _super);
    function HieknSDKRelation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKRelation.prototype.buildPrivateSetting = function (schema) {
        var _this = this;
        var initSettings = {
            success: function (data) {
                if (data.relationList && data.relationList.length) {
                    var arr = HieknSDKNetChart.orderRelation(data.relationList);
                    var nodes = [];
                    for (var i in arr) {
                        if (parseInt(i) < 3) {
                            nodes.push({ id: arr[i].k });
                        }
                    }
                    _this.load({ id: new Date().getTime(), nodes: nodes });
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        var filters = [{
                key: 'distance',
                label: '设定分析步长',
                selected: this.options.selectedDistance || 3,
                options: [3, 4, 5, 6]
            }].concat(this.defaultTgc2Options.filter.filters);
        var defaultTgc2Options = {
            stats: {
                enable: true,
                editable: true,
                atts: schema.atts,
                types: schema.types,
                statsConfig: this.options.statsConfig
            },
            connects: {
                enable: true,
                mode: 'click'
            },
            legend: {
                enable: false
            },
            relation: {
                prompt: {
                    settings: {
                        drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                        onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                    }
                }
            }
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2Settings.filter.filters = filters;
        this.tgc2 = new Tgc2Relation(this.tgc2Settings);
        this.tgc2Stats = new Tgc2Stats(this.tgc2, this.tgc2Settings.stats);
        this.tgc2Connects = new Tgc2Connects(this.tgc2, this.tgc2Settings.connects);
    };
    HieknSDKRelation.prototype.buildLoaderParams = function (options) {
        var ids = _.map(this.tgc2.startInfo.nodes, 'id');
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        formData.ids = ids;
        formData.isShortest = true;
        formData.connectsCompute = true;
        formData.statsCompute = true;
        if (this.tgc2Filter) {
            var filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2Stats) {
            formData.statsConfig = this.tgc2Stats.getStatsConfig();
        }
        return { queryData: queryData, formData: formData, url: 'relation' };
    };
    return HieknSDKRelation;
}(HieknSDKNetChart));
var HieknSDKTiming = /** @class */ (function (_super) {
    __extends(HieknSDKTiming, _super);
    function HieknSDKTiming() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKTiming.prototype.buildPrivateSetting = function (schema) {
        var _this = this;
        var initSettings = {
            success: function (data) {
                if (data.entityList && data.entityList.length) {
                    _this.load(data.entityList[0]);
                }
            }
        };
        $.extend(true, this.initSettings, initSettings);
        var defaultTgc2Options = {
            autoResize: true,
            prompt: {
                enable: true,
                settings: {
                    drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                    onPrompt: HieknSDKPrompt.onPrompt(this.promptSettings)
                }
            },
            legend: {
                style: {
                    bottom: '60px'
                }
            },
            timeChart: {
                enable: true
            },
            event: {
                enable: true
            },
        };
        this.tgc2Settings = $.extend(true, {}, this.defaultTgc2Options, defaultTgc2Options, this.options.tgc2Settings);
        this.tgc2 = new Tgc2Graph(this.tgc2Settings);
        this.tgc2Prompt = new Tgc2Prompt(this.tgc2, this.tgc2Settings.prompt);
        this.tgc2TimeChart = new Tgc2TimeChart(this.tgc2, this.tgc2Settings.timeChart);
        this.tgc2Event = new Tgc2Event(this.tgc2, this.tgc2Settings.event);
        try {
            this.tgc2TimeChart.$settingModal.find('.input-daterange').datepicker({
                format: 'yyyy-mm-dd'
            });
            this.tgc2TimeChart.$settingModal.find('.input-daterange').find('input').prop('type', 'text');
        }
        catch (e) {
        }
    };
    HieknSDKTiming.prototype.buildLoaderParams = function (options) {
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        formData.id = this.tgc2.startInfo.id;
        formData.isRelationMerge = true;
        if (this.tgc2Filter) {
            var filters = this.tgc2Filter.getFilterOptions();
            $.extend(true, formData, filters);
        }
        if (this.tgc2TimeChart) {
            var settings = this.tgc2TimeChart.getSettings();
            delete settings.type;
            $.extend(true, formData, settings);
        }
        return { queryData: queryData, formData: formData, url: 'graph/timing' };
    };
    return HieknSDKTiming;
}(HieknSDKNetChart));
var HieknSDKStat = /** @class */ (function () {
    function HieknSDKStat(options) {
        this.defaults = {
            chartColor: HieknSDKUtils.color
        };
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }
    HieknSDKStat.prototype.init = function () {
        this.$container = $(this.options.container);
        this.bindEvent();
    };
    HieknSDKStat.prototype.bindEvent = function () {
        var _this = this;
        $(window).on('resize', function () {
            _this.chart && _this.chart.resize();
        });
    };
    HieknSDKStat.prototype.load = function () {
        var _this = this;
        var queryData = this.options.queryData || {};
        var formData = this.options.formData || {};
        if (this.options.formDataUpdater) {
            formData = this.options.formDataUpdater(formData);
        }
        var $container = this.$container.empty();
        var newOptions = {
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'stat/data', queryData),
            type: 'POST',
            data: formData,
            success: function (data, textStatus, jqXHR) {
                _this.stat = data[0];
                _this.drawChart();
            },
            that: $container[0]
        };
        newOptions = $.extend(true, {}, this.options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
    return HieknSDKStat;
}());
var HieknSDKStatLineBar = /** @class */ (function (_super) {
    __extends(HieknSDKStatLineBar, _super);
    function HieknSDKStatLineBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKStatLineBar.prototype.drawChart = function () {
        var type = this.options.config.type;
        var defaultXAxis = {
            type: 'category',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false,
                alignWithLabel: true
            },
            splitLine: {
                show: true
            }
        };
        var defaultSeries = {
            name: '',
            type: type,
            symbol: 'circle',
            symbolSize: 10
        };
        var d = this.stat;
        var stat = this.options.config;
        var legend = [];
        for (var _i = 0, _a = d.series; _i < _a.length; _i++) {
            var s = _a[_i];
            if (stat.seriesName) {
                s.name = stat.seriesName[s.name] || s.name;
                legend.push(s.name);
            }
        }
        var idx = 0;
        var xAxisArr = [];
        for (var _b = 0, _c = d.xAxis; _b < _c.length; _b++) {
            var xAxis = _c[_b];
            if (stat.chartSettings && stat.chartSettings.xAxis) {
                if (stat.chartSettings.xAxis instanceof Array) {
                    $.extend(true, defaultXAxis, stat.chartSettings.xAxis[idx]);
                }
                else {
                    $.extend(true, defaultXAxis, stat.chartSettings.xAxis);
                }
            }
            xAxisArr.push($.extend(true, {}, defaultXAxis, xAxis));
        }
        idx = 0;
        var seriesArr = [];
        for (var _d = 0, _e = d.series; _d < _e.length; _d++) {
            var series = _e[_d];
            if (stat.chartSettings && stat.chartSettings.series) {
                if (stat.chartSettings.series instanceof Array) {
                    $.extend(true, defaultSeries, stat.chartSettings.series[idx]);
                }
                else {
                    $.extend(true, defaultSeries, stat.chartSettings.series);
                }
            }
            if (series.name == '') {
                delete series.name;
            }
            var s = $.extend(true, {}, defaultSeries, series);
            if (stat.seriesName && stat.seriesName[s.name]) {
                s.name = stat.seriesName[s.name] || s.name;
            }
            seriesArr.push(s);
            idx++;
        }
        this.chart = echarts.init(this.$container[0]);
        var defaultOption = {
            color: this.options.chartColor,
            tooltip: {
                position: 'top',
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                }
            },
            legend: {
                show: false,
                orient: 'vertical',
                x: 'left',
                data: legend
            },
            grid: {
                left: 9,
                right: 9,
                bottom: 24,
                top: 24,
                containLabel: true
            },
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    }
                }
            ]
        };
        if (stat.seriesName && !$.isEmptyObject(stat.seriesName)) {
            defaultOption.tooltip.formatter = function (param) {
                var str = '';
                for (var _i = 0, param_1 = param; _i < param_1.length; _i++) {
                    var item = param_1[_i];
                    str += item.seriesName + ':' + item.data + '<br>';
                }
                return str;
            };
        }
        var option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        }
        else {
            option = defaultOption;
        }
        if (stat.changeXY) {
            option.xAxis = option.yAxis;
            option.yAxis = xAxisArr;
        }
        else {
            option.xAxis = xAxisArr;
        }
        option.series = seriesArr;
        this.chart.setOption(option);
    };
    return HieknSDKStatLineBar;
}(HieknSDKStat));
var HieknSDKStatPie = /** @class */ (function (_super) {
    __extends(HieknSDKStatPie, _super);
    function HieknSDKStatPie() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKStatPie.prototype.drawChart = function () {
        var d = this.stat;
        var stat = this.options.config;
        var legend = [];
        for (var _i = 0, _a = d.series; _i < _a.length; _i++) {
            var s = _a[_i];
            if (stat.seriesName) {
                s.name = stat.seriesName[s.name] || s.name;
                legend.push(s.name);
            }
        }
        var defaultSeries = {
            name: '',
            type: 'pie',
            radius: '75%',
            center: ['50%', '50%'],
            data: d.series,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };
        var series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        }
        else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        var defaultOption = {
            color: this.options.chartColor,
            tooltip: {
                trigger: 'item',
                formatter: '{b} <br/>{c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data: legend
            }
        };
        var option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        }
        else {
            option = defaultOption;
        }
        option.series = [series];
        this.chart.setOption(option);
    };
    return HieknSDKStatPie;
}(HieknSDKStat));
var HieknSDKStatWordCloud = /** @class */ (function (_super) {
    __extends(HieknSDKStatWordCloud, _super);
    function HieknSDKStatWordCloud() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKStatWordCloud.prototype.drawChart = function () {
        var _this = this;
        var d = this.stat;
        var stat = this.options.config;
        var data = [];
        for (var _i = 0, _a = d.series; _i < _a.length; _i++) {
            var series_1 = _a[_i];
            if (series_1.name) {
                data.push(series_1);
            }
        }
        var defaultSeries = {
            type: 'wordCloud',
            sizeRange: [12, 50],
            rotationRange: [-45, 90],
            textPadding: 0,
            autoSize: {
                enable: true,
                minSize: 6
            },
            textStyle: {
                normal: {
                    color: function () {
                        return _this.options.chartColor[Math.floor(Math.random() * _this.options.chartColor.length)];
                    }
                },
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            data: data
        };
        var series = {};
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        }
        else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        var defaultOption = {};
        var option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        }
        else {
            option = defaultOption;
        }
        option.series = [series];
        this.chart.setOption(option);
    };
    return HieknSDKStatWordCloud;
}(HieknSDKStat));
var HieknSDKAssociation = /** @class */ (function () {
    function HieknSDKAssociation() {
    }
    HieknSDKAssociation.load = function (options) {
        options = $.extend(true, {}, HieknSDKAssociation.defaults, options);
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        formData.kgName = options.kgName;
        var newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'association', queryData),
            type: 'POST',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
    ;
    HieknSDKAssociation.defaults = {
        formData: {
            pageSize: 6
        }
    };
    return HieknSDKAssociation;
}());
var HieknSDKConceptGraph = /** @class */ (function () {
    function HieknSDKConceptGraph(options) {
        var _this = this;
        this.options = {};
        var defaultPromptSettings = {
            baseUrl: options.baseUrl,
            queryData: options.queryData,
            kgName: options.kgName
        };
        this.promptSettings = $.extend(true, defaultPromptSettings, options.promptSettings);
        var defaultOptions = {
            lightColor: '#fff',
            primaryColor: '#00b38a',
            primaryLightColor: 'rgba(0,179,138,0.3)',
            emphasesColor: '#faa01b',
            emphasesLightColor: 'rgba(250, 160, 27,0.3)',
            instanceEnable: false,
            tgc2Settings: {
                netChart: {
                    settings: {
                        toolbar: {
                            enabled: false
                        },
                        info: {
                            enabled: false
                        },
                        nodeMenu: {},
                        style: {
                            selection: {
                                enabled: false,
                                fillColor: ''
                            },
                            nodeStyleFunction: function (node) {
                                _this.nodeStyleFunction(node);
                            },
                            nodeHovered: {
                                shadowBlur: 0,
                                shadowColor: 'rgba(0, 0, 0, 0)'
                            },
                            linkStyleFunction: function (link) {
                                if (link.hovered) {
                                    link.label = link.data.attName;
                                }
                                link.toDecoration = 'arrow';
                                link.fillColor = '#ddd';
                            },
                            linkLabel: {
                                textStyle: {
                                    fillColor: '#999'
                                }
                            }
                        }
                    }
                },
                prompt: {
                    enable: true,
                    settings: {
                        onPrompt: HieknSDKPrompt.onPromptKnowledge(this.promptSettings)
                    }
                },
                page: {
                    enable: true,
                    style: {
                        right: '15px'
                    },
                    pageSize: 20
                },
                loader: function (instance, callback, onFailed) {
                    _this.loader(instance, callback, onFailed);
                }
            }
        };
        this.options = $.extend(true, {}, defaultOptions, options);
        var infobox = this.options.infoboxSetting;
        if (infobox && infobox.enable) {
            this.graphInfobox = this.buildInfobox(infobox);
            this.graphInfobox.initEvent($(this.options.selector));
            this.options.tgc2Settings.netChart.settings.nodeMenu.contentsFunction = function (data, node, callback) {
                return _this.contentsFunction(data, node, callback);
            };
        }
        this.options.tgc2Settings.selector = this.options.tgc2Settings.selector || this.options.selector;
        this.init();
        if (options.startInfo) {
            this.load(options.startInfo);
        }
    }
    HieknSDKConceptGraph.prototype.buildInfobox = function (infoboxOptions) {
        var options = {
            baseUrl: this.options.baseUrl,
            dataFilter: this.options.dataFilter,
            queryData: this.options.queryData,
            formData: this.options.formData,
            kgName: this.options.kgName
        };
        $.extend(true, options, infoboxOptions);
        return new HieknSDKInfobox(options);
    };
    HieknSDKConceptGraph.prototype.contentsFunction = function (data, node, callback) {
        var _this = this;
        if (node.detail) {
            callback(node.detail);
        }
        else {
            this.graphInfobox.load(data.id, function (data) {
                if (data) {
                    data = _this.graphInfobox.buildInfobox(data)[0].outerHTML;
                }
                else {
                    data = '没有知识卡片信息';
                }
                node.detail = data;
                callback(data);
            });
        }
        return null;
    };
    HieknSDKConceptGraph.prototype.init = function () {
        this.tgc2 = new Tgc2Graph(this.options.tgc2Settings);
        this.tgc2Prompt = new Tgc2Prompt(this.tgc2, this.options.tgc2Settings.prompt);
        this.tgc2Page = new Tgc2Page(this.tgc2, this.options.tgc2Settings.page);
        this.tgc2.init();
        $(this.options.tgc2Settings.selector).addClass('tgc2 tgc2-concept-graph');
        if (this.options.instanceEnable) {
            $(this.options.tgc2Settings.selector).append('<div class="tgc2-info-top">' +
                '<ul class="info-top">' +
                '<li class="current"><div class="legend-circle" style="background-color:' + this.options.emphasesColor + '"></div><span>当前节点</span></li>' +
                '<li class="concept"><div class="legend-circle" style="background-color:' + this.options.primaryColor + '"></div><span>概念</span></li>' +
                '<li class="instance"><div class="legend-circle-o" style="border-color:' + this.options.primaryColor + '"></div><span>实例</span></li>' +
                '</ul>' +
                '</div>');
        }
        $(this.options.tgc2Settings.selector).append('<div class="tgc2-info-bottom">' +
            '<div class="info-bottom"><span>中心节点：</span><span name="name" style="color:' + this.options.emphasesColor + '"></span></div>' +
            '</div>');
    };
    HieknSDKConceptGraph.prototype.load = function (node) {
        var _this = this;
        this.tgc2.load(node);
        setTimeout(function () {
            _this.tgc2.resize();
        }, 300);
    };
    HieknSDKConceptGraph.prototype.loader = function (instance, callback, onFailed) {
        var _this = this;
        var node = this.tgc2.startInfo;
        var page = this.tgc2Page.page;
        var queryData = this.options.queryData || {};
        queryData.type = node.kgType || 0;
        queryData.pageNo = page.pageNo;
        queryData.pageSize = page.pageSize;
        queryData.kgName = this.options.kgName;
        queryData.entityId = node.id;
        HieknSDKUtils.ajax({
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'graph/knowlegde', queryData),
            type: 'GET',
            dataFilter: this.options.dataFilter,
            that: $(this.options.tgc2Settings.selector)[0],
            success: function (data) {
                data = data[0];
                if (data.entityList && data.entityList.length) {
                    for (var _i = 0, _a = data.entityList; _i < _a.length; _i++) {
                        var d = _a[_i];
                        if (d.id == node.id) {
                            $(_this.options.tgc2Settings.selector).find('.tgc2-info-bottom').find('[name="name"]').text(d.name);
                        }
                    }
                }
                data.nodes = data.entityList;
                data.links = data.relationList;
                delete data.entityList;
                delete data.relationList;
                callback(data);
                instance.netChart.resetLayout();
            },
            error: function () {
                onFailed && onFailed();
                instance.netChart.replaceData({ nodes: [], links: [] });
            }
        });
    };
    HieknSDKConceptGraph.prototype.nodeStyleFunction = function (node) {
        var data = node.data;
        var centerNode = this.tgc2.startInfo;
        node.label = data.name;
        node.labelStyle.textStyle.font = '18px Microsoft Yahei';
        node.radius = 15;
        node.imageCropping = 'fit';
        var isCenter = (node.id == centerNode.id);
        if (data.kgType == 0) {
            node.lineWidth = 10;
            node.lineColor = this.options.primaryLightColor;
            node.fillColor = this.options.primaryColor;
            node.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjhENzQwNUZFMTVFQjExRTc4QTJDOTY3REE4RkM4MjFCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjhENzQwNUZGMTVFQjExRTc4QTJDOTY3REE4RkM4MjFCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OEQ3NDA1RkMxNUVCMTFFNzhBMkM5NjdEQThGQzgyMUIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OEQ3NDA1RkQxNUVCMTFFNzhBMkM5NjdEQThGQzgyMUIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7rBsIlAAAFUklEQVR42uydX05TURDGp5V3ygq8JJJINIGugLICy4PySF0BdQGGsgLqCixviibCCrisgJLoEybUFUjfNfVM7iESUyi1vXNmzvm+ZCJg0p5753fmzPlfGY1GBKWrCgAAAHgLAAACABAAgAAABAAgAAABAAgAxKDM2Zqzdf8zW83/Pk59Z9fOBt749wv/MwAwIHbuC2cNb9mcPpcByL2deEgAgCLtOGt6k9Cxt0MAELa27zpr+59DiCNB19k7q1HBIgDs7D1nrYCOHwdCz9m+NRCsAcA1vqPI8eNA6PiIAADmKM7a39+TvWsT9x5e+38BwIza87XKotrao4FmADjMf/HdOcviruOW1txAKwDWQr7ZJkEjAOz0U8WJ3iwJ4qY2CLQBEKvz1UKgCYDYna8SAi0ApOL82xDUScEkkwYAat7565SW+j4SXKcOAGf7LUpTPd87SBYAHig5oLT1hooJpeQAyJydJ9Tuq8wHQgLAo3xNgli8tmArJQCaHgDor7Y8CEkAcEXzW64Vi7gJWJb+0mqAB23B+XfmRK0UIgBqv6IoIA1Ag4pBH+hu8eBQHmsT0IJ/db0jyQhQ8+G/Bh9PHBdYJqEhYskI0ITzH1xRGjE2ARIPdeTsubMFjm4l2IL//COByhJdE1B29v/Z2UtBoD86e2W9NyAFAE/1npf8HVwzvwkC8MzZ1xI/f5kE5gekmgCJfv+lcFt9KVBposkBJB5mRRiAFQCg62H2hAF4CwCm69qULU4APzhbdfaoxPe16r9nO4J3JpYE5s42FPW1K/f8n5Zl0mcSXWcpALTtPrEAAI8ELgGAdAGYVE4AAAAAAAAw0gs4I0jlO6viPactAKBXUa0HyOHPqdWPCYAB/Jk2AH34U2elkVwQwm3aIrqBD9KQhOYCJJNA5AEPl9gWsWqMDxWBxCqLZBOQUbEuEE3AZC1RhMvCOanBiOBkid5HID0Q1IV/J6onGgoDbA7lSPAYTcBY/SDhjbPV2Ak3JvEIGSICcP+2HzgK8A6f32P+zmsJfwWs/eskfGxciAhwc6lCSD2d8u8S6lCAMwNDHhIVMhf4ROO3dUms9h2nCwp0UGZIACS2i90n3tvHd/x8d/aEin0F24HKUqdA8yWhD4rskPyGDm3aD9kkajgqlslfS9T5Imv/tQOQeQgWE3P+0DeDg9QBuMkH8oQgGPqaH3ydhKYLI1I6PTTIqaDaAWC1qDg+Pmbx8fA9LYXReGkUQ9CNsDngsN8mZUPhmq+NiyknUNPmWwEgJgjUOl87AERxHC1bJ8Wroi3cHcxt5o5R5x+S8uNxLQAQes5gFokc9RY7AEQ6VhFNK/HVPf8jK5tDBwZrv4kyY3dw4gIAAAACAFAZugYA81NuEIA+AEjsZVoss5VxAGtjAcFW+cYMgKURwTqhCSglpPJiiqHiMg59Gc00WZYiwO1IwAtGNpSVi1f4tq3lKxYBuFFGxXRxpiA3ycnoSWiWAYAAAAQAIAAApdENvC0+ZII3lfKpY6PA9tPZARm9F9liBOAXfUr6Rtq4+7dJRiaBLAPAYwC7SsumfhFoDACUfQn1LBK56St1ALQXuAIAym9rtR4oYWIlsPVeQBdlwziAxkTQXAJoGQBWg4pDJUJ3BwdUbF/LMQ4AAQAIAEAAAAIAYcXZ+MYc++Q8wnfsM30AoFw5lbde0OSET0oASIwPmOzvpwKA1MNUYnlhMW0OlRwQaiACpB0BxO71QwSYTicC33GGJFCvyr6QSsUR7wBgMgQd306vzdHxPA7Qjqn2xwoABAAgAAABAAgAQAAAAgAQAIAAAAQAoH/1R4ABAHF3K+2bw1JCAAAAAElFTkSuQmCC';
            if (isCenter) {
                node.fillColor = this.options.emphasesColor;
                node.lineColor = this.options.emphasesLightColor;
            }
        }
        else {
            node.lineWidth = 2;
            node.lineColor = this.options.primaryColor;
            node.fillColor = this.options.lightColor;
            node.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA3RUVGNzVBMTVFQzExRTdBM0FERjI5RjczQUM4N0QyIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA3RUVGNzVCMTVFQzExRTdBM0FERjI5RjczQUM4N0QyIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDdFRUY3NTgxNUVDMTFFN0EzQURGMjlGNzNBQzg3RDIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDdFRUY3NTkxNUVDMTFFN0EzQURGMjlGNzNBQzg3RDIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5z4BZ4AAADHUlEQVR42uzbTU4UQRyG8QYMbLyBK1mKiR8L3RsXfnABWeugO7mIrkwEcc0FJGFhOIExaohLogtvIDGQCP47NAkboGeYwuqu35O8mYR0MdNTz1Qq1XknDg4OKpTLBAEI4FsgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACnMTKysq1eHkaeRi52vx5O7IRWY18L3kCBoNBPwWIiZ+Ol1eRF5HJEy7bj7yLLEX+DPkW9f9/HnkSuR653DM3fke2ImuRtyHKXmcEaCZ/PXK/5ZDNZoVoe5NXIh8iNwtZKL5E5kOCX+P+x5OJPvDrISa/5l6zWrT95Zc0+VVzr+vxw5rJXoD4kHPxsjjC0Ho5n2tx3WJhk3/EjXrL0IUVoN7wTY0wbqoZexYLBe8ZF7ogwIPEY28XLMCtLggwm3jsdMECzHRBgPOwV+FCSSHA9jnG/iTJmWcD2QuwcY6xH1tc87lgAba6IMD7yN8RxtVjVltct1awAGvZCzAYDGpLl0cYutzS8Pq6rwVO/rcRv9f/sglcarmcH7HZjGnDbuRxdXg8Wgq18I/ix7XbCQGaBxf1JL2pDh/4nMR+Y/X8kJu7+kz8buRl5FNkp4eTvtPcW32Pd1I8B6i5iMfB9fHus+rwkGe2megfzQqxmmJj0yV6+zh4CEEqAvTrHAAdggAEAAFAABAABAABQAAQAAQAAUAA9JtLqd9AOzhvtIPzRTv4FLSDM98DaAePF+3gY2gHZ74CaAenQzu40g7OXgDt4HRoByN/AbSD054NZC+AdnA6tIMr7eC8BdAOToZ2cIN2cO4CaAePBe3gEtAO1g7u3TkAOgQBCAACgAAgAAgAAoAAIAAIAAKAAOg32sGFox2cL9rBp6AdnPkeQDt4vGgHH0M7OPMVQDs4HdrBlXZw9gJoB6dDOxj5C6AdnPZsIHsBtIPToR1caQfnLYB2cDK0gxu0g3MXQDt4LGgHl0Dx7WBUBAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABMCT/BBgA8SDQyY7AsYEAAAAASUVORK5CYII=';
            if (isCenter) {
                node.fillColor = this.options.lightColor;
                node.lineColor = this.options.emphasesColor;
            }
        }
        if (node.hovered) {
            node.radius = node.radius * 1.25;
        }
    };
    return HieknSDKConceptGraph;
}());
var HieknSDKConceptTree = /** @class */ (function () {
    function HieknSDKConceptTree(options) {
        var _this = this;
        this.isFirst = true;
        this.startAsync = false;
        this.treeDbClick = false;
        this.defaults = {
            getAsyncUrl: function () {
                var queryData = {};
                queryData.kgName = _this.options.kgName;
                if (_this.options.readAll) {
                    queryData.id = _this.getLastSelectedNodeId() || 0;
                }
                else {
                    queryData.id = _this.getLastSelectedNodeId() || _this.options.initId;
                }
                queryData.onlySubTree = _this.isFirst ? 0 : 1;
                $.extend(true, queryData, _this.options.queryData);
                return HieknSDKUtils.buildUrl(_this.options.baseUrl + 'concept', queryData);
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
            hiddenIds: { self: [], rec: [] }
        };
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }
    HieknSDKConceptTree.prototype.init = function () {
        var _this = this;
        this.$container = $(this.options.container);
        this.treeId = HieknSDKUtils.randomId(this.options.namespace + '-');
        this.$container.addClass('hiekn-concept-tree').append('<ul class="ztree" id="' + this.treeId + '"></ul>');
        this.zTreeSettings = this.updateZTreeSettings();
        this.zTree = $.fn.zTree.init(this.$container.find('.ztree'), this.zTreeSettings);
        if (this.options.nodeHoverTools.graphSetting.enable) {
            this.buildGraph();
        }
        if (this.options.nodeHoverTools.infoboxSetting.enable) {
            this.treeInfobox = this.buildInfobox(this.options.nodeHoverTools.infoboxSetting);
        }
        if (this.options.instance.enable) {
            var id = HieknSDKUtils.randomId(this.options.namespace + '-prompt-');
            this.$instanceContainer = $('<div class="hiekn-instance-container"><div class="hiekn-instance-prompt" id="' + id + '"></div><div class="hiekn-instance-list"></div></div>');
            this.$container.append(this.$instanceContainer);
            this.instanceSearchSettings = {
                container: '#' + id,
                promptEnable: false,
                placeholder: '实例搜索',
                onSearch: function (kw) {
                    var options = {
                        paramName: 'kw',
                        url: _this.options.baseUrl + 'prompt',
                        type: 'POST',
                        formData: {
                            kgName: _this.options.kgName
                        }
                    };
                    $.extend(true, options, _this.options.instance.searchSettings);
                    options.formData[options.paramName] = kw;
                    var newOptions = {
                        url: HieknSDKUtils.buildUrl(options.url, options.queryData),
                        dataFilter: options.dataFilter || _this.options.dataFilter,
                        data: options.formData,
                        success: function (data, textStatus, jqXHR) {
                            if (data) {
                                var $container = _this.select('.instance-loader-container');
                                $container.attr({ 'data-more': '0', 'data-page': '1' });
                                _this.drawInstanceList(data, false);
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
    };
    HieknSDKConceptTree.prototype.addHoverDom = function (treeId, treeNode) {
        var sObj = this.select('#' + treeNode.tId + '_span');
        if (this.select('#button-container_' + treeNode.tId).length > 0) {
            return;
        }
        var $container = $('<span class="button-container" id="button-container_' + treeNode.tId + '" ></span>');
        sObj.after($container);
        this.onNodeHover($container, treeNode);
    };
    HieknSDKConceptTree.prototype.beforeAsync = function (treeId, treeNode) {
        if (treeNode) {
            this.startAsync = true;
            this.lastSelectedNode = treeNode;
        }
        return true;
    };
    HieknSDKConceptTree.prototype.bindInstanceEvent = function () {
        var _this = this;
        this.select('.hiekn-instance-list').on('scroll', function (event) {
            if ($(event.target).height() + $(event.target).scrollTop() > $(event.target)[0].scrollHeight - 50) {
                _this.loadInstanceService();
            }
        });
        this.select('.hiekn-instance-list').on('click', 'li[data-id]', function (event) {
            var node = $(event.currentTarget).data('data');
            $(event.currentTarget).addClass('active').siblings('.active').removeClass('active');
            _this.options.instance.onClick(node);
        });
    };
    HieknSDKConceptTree.prototype.buildInfobox = function (infoboxOptions) {
        var options = {
            baseUrl: this.options.baseUrl,
            dataFilter: this.options.dataFilter,
            kgName: this.options.kgName
        };
        $.extend(true, options, infoboxOptions);
        return new HieknSDKInfobox(options);
    };
    /**
     * TODO to replace modal
     * */
    HieknSDKConceptTree.prototype.buildGraph = function () {
        var selector = HieknSDKUtils.randomId(this.options.namespace + '-tgc2-');
        this.$graphContainer = $('<div class="modal fade hiekn-concept-tree-graph-modal" id="' + selector + '-modal" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">' +
            '<div class="modal-dialog modal-lg">' +
            '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">' +
            '<svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
            '</button>' +
            '<h4 class="modal-title"><span name="title"></span></h4></div><div class="modal-body"><div class="' + selector + '"></div></div></div></div></div>');
        $('body').append(this.$graphContainer);
        var settings = {
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
    };
    HieknSDKConceptTree.prototype.dataFilter = function (treeId, parentNode, data) {
        if (this.options.dataFilter) {
            data = this.options.dataFilter(data, undefined);
        }
        if (data.code == 200) {
            if (!data.data || !data.data.rsData) {
                return null;
            }
            data = data.data.rsData;
            var len = data.length;
            var result = [];
            for (var i = 0; i < len; i++) {
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
            }
            else {
                return result;
            }
        }
        else {
            HieknSDKUtils.error(data.msg);
        }
        return null;
    };
    HieknSDKConceptTree.prototype.drawInstanceList = function (instances, append) {
        var $container = this.$instanceContainer.find('.hiekn-instance-list ul');
        var html = $('<ul></ul>');
        if (instances.length) {
            for (var _i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
                var instance = instances_1[_i];
                html.append($('<li data-id="' + instance.id + '" title="' + instance.name + '">' + instance.name + '</li>').data('data', instance));
            }
        }
        else if (!append) {
            html.append('<li>没有找到相关实例</li>');
        }
        if (append) {
            $container.append(html.children());
        }
        else {
            $container.empty().append(html.children());
        }
    };
    HieknSDKConceptTree.prototype.expandNodes = function (nodeId) {
        var node = this.zTree.getNodeByParam(this.options.idKey, nodeId);
        if (node) {
            this.zTree.expandNode(node, true, false, true, false);
            var parentNode = node.getParentNode();
            parentNode && this.expandNodes(parentNode[this.options.idKey]);
        }
    };
    HieknSDKConceptTree.prototype.getAsyncUrl = function () {
        return typeof this.options.getAsyncUrl == 'string' ? this.options.getAsyncUrl : this.options.getAsyncUrl(this);
    };
    HieknSDKConceptTree.prototype.getLastSelectedNodeId = function () {
        return this.lastSelectedNode ? this.lastSelectedNode[this.options.idKey] : null;
    };
    HieknSDKConceptTree.prototype.getLastSelectedInstance = function () {
        return this.select('.hiekn-instance-list li[data-id].active').data('data');
    };
    HieknSDKConceptTree.prototype.loadGraph = function (id) {
        this.tgc2ConceptGraph.load({
            id: id,
            kgType: 0
        });
    };
    HieknSDKConceptTree.prototype.reloadInstance = function () {
        this.select('.hiekn-instance-list').html('<ul></ul><div class="instance-loader-container" data-more="1" data-page="1"></div>');
        this.loadInstanceService();
    };
    HieknSDKConceptTree.prototype.loadInstanceService = function () {
        var _this = this;
        var $container = this.select('.instance-loader-container');
        if ($container.attr('data-more') != '0') {
            if ($container.data('inLoading') != 1) {
                $container.data('inLoading', 1);
                var options_1 = {
                    queryData: {
                        conceptId: this.getLastSelectedNodeId() || this.options.initId,
                        readAll: 0,
                        pageNo: $container.attr('data-page'),
                        pageSize: 15,
                        kgName: this.options.kgName
                    }
                };
                $.extend(true, options_1, this.options.instance);
                var newOptions = {
                    url: HieknSDKUtils.buildUrl(options_1.url, options_1.queryData),
                    dataFilter: options_1.dataFilter || this.options.dataFilter,
                    success: function (data, textStatus, jqXHR, orgData, params) {
                        var d = data;
                        if (d.length <= params.pageSize) {
                            $container.attr({ 'data-more': 0 });
                        }
                        if (d.length > params.pageSize) {
                            d.pop();
                        }
                        _this.drawInstanceList(d, params.pageNo != 1);
                        $container.attr({ 'data-page': parseInt(params.pageNo, 10) + 1 });
                        options_1.success && options_1.success(data, textStatus, jqXHR);
                    },
                    complete: function (jqXHR, textStatus) {
                        $container.data('inLoading', 0);
                        var $ic = _this.select('.hiekn-instance-list');
                        if ($ic.children('ul').height() < $ic.height()) {
                            _this.loadInstanceService();
                        }
                        options_1.complete && options_1.complete(jqXHR, textStatus);
                    },
                    that: $container[0]
                };
                newOptions = $.extend(true, {}, options_1, newOptions);
                HieknSDKUtils.ajax(newOptions);
            }
        }
        else {
            console.log('no more instance');
        }
    };
    HieknSDKConceptTree.prototype.onAsyncSuccess = function (event, treeId, treeNode) {
        var node = treeNode;
        if (node) {
            this.onNodeClick(node);
        }
        if (node && node.children.length == 0) {
            node.isParent = false;
            this.zTree.updateNode(node);
            HieknSDKUtils.info('当前概念没有子概念');
        }
        else if (!node) {
            this.expandNodes(this.getLastSelectedNodeId() || this.options.initId);
            if (!this.getLastSelectedNodeId()) {
                node = this.zTree.getNodeByParam(this.options.idKey, this.options.initId);
                this.zTree.selectNode(node);
                this.onNodeClick(node);
            }
        }
        var root = this.zTree.getNodeByParam(this.options.idKey, this.options.initId);
        this.addHoverDom(treeId, root);
        this.isFirst = false;
        this.startAsync = false;
    };
    HieknSDKConceptTree.prototype.onClick = function (event, treeId, treeNode) {
        var _this = this;
        this.clickTimeout && clearTimeout(this.clickTimeout);
        this.clickTimeout = setTimeout(function () {
            _this.lastSelectedNode = treeNode;
            _this.onNodeClick(treeNode);
            _this.treeDbClick = false;
        }, 500);
    };
    HieknSDKConceptTree.prototype.onNodeButtonClick = function ($button, treeNode) {
        this.select('.tree-button-active').removeClass('tree-button-active');
        this.zTree.selectNode(treeNode);
        $button.addClass('tree-button-active');
        this.lastSelectedNode = treeNode;
    };
    HieknSDKConceptTree.prototype.onNodeClick = function (node) {
        if (this.options.instance.enable) {
            this.reloadInstance();
        }
        this.options.onNodeClick(node);
    };
    /**
     * TODO to replace tooltipster, modal
     * */
    HieknSDKConceptTree.prototype.onNodeHover = function ($container, treeNode) {
        var _this = this;
        for (var key in this.options.nodeHoverTools) {
            var value = this.options.nodeHoverTools[key];
            if (key == 'graph' && value.enable) {
                var $graphBtn = $('<span class="button" title="图谱可视化">' +
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
                $graphBtn.on('click', function (event) {
                    _this.$graphContainer.modal('show');
                    _this.loadGraph(treeNode[_this.options.idKey]);
                    event.stopPropagation();
                });
            }
            else if (key == 'infobox' && value.enable) {
                var $infoboxBtn = $('<span class="button" title="知识卡片">' +
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
                $infoboxBtn.tooltipster({
                    side: ['bottom'],
                    theme: 'tooltipster-shadow',
                    distance: 16,
                    interactive: true,
                    trigger: 'click',
                    content: 'Loading...',
                    functionBefore: function (instance, helper) {
                        var $origin = $(helper.origin);
                        if ($origin.data('loaded') !== true) {
                            var id = treeNode[_this.options.idKey];
                            _this.treeInfobox.load(id, function (data) {
                                if (data) {
                                    var $container_1 = _this.treeInfobox.buildInfobox(data);
                                    instance.content($container_1);
                                    _this.treeInfobox.initEvent($container_1);
                                }
                                else {
                                    instance.content('没有当前概念的知识卡片信息');
                                }
                                $origin.data('loaded', true);
                            }, function () {
                                instance.content('read data failed');
                            });
                        }
                    }
                });
                $infoboxBtn.on('click', function (event) {
                    event.stopPropagation();
                });
            }
            else if (value instanceof Function) {
                value($container, treeNode);
            }
        }
        return true;
    };
    ;
    HieknSDKConceptTree.prototype.removeHoverDom = function (treeId, treeNode) {
        if (treeNode.level > 0) {
            var $container = this.select('#button-container_' + treeNode.tId);
            $container.children().off('click');
            $container.remove();
        }
    };
    ;
    HieknSDKConceptTree.prototype.select = function (selector) {
        return $(this.options.container).find(selector);
    };
    ;
    HieknSDKConceptTree.prototype.updateZTreeSettings = function () {
        var _this = this;
        return {
            async: {
                enable: true,
                url: function () {
                    return _this.getAsyncUrl();
                },
                dataFilter: function (treeId, parentNode, data) {
                    return _this.dataFilter(treeId, parentNode, data);
                },
                type: 'get'
            },
            view: {
                showLine: false,
                showIcon: false,
                expandSpeed: 'fast',
                dblClickExpand: function (treeId, treeNode) {
                    return treeNode.level > 0;
                },
                selectedMulti: false,
                addHoverDom: function (treeId, treeNode) {
                    _this.addHoverDom(treeId, treeNode);
                },
                removeHoverDom: function (treeId, treeNode) {
                    _this.removeHoverDom(treeId, treeNode);
                }
            },
            callback: {
                beforeAsync: function (treeId, treeNode) {
                    return _this.beforeAsync(treeId, treeNode);
                },
                onAsyncSuccess: function (event, treeId, treeNode) {
                    return _this.onAsyncSuccess(event, treeId, treeNode);
                },
                onClick: function (event, treeId, treeNode) {
                    return _this.onClick(event, treeId, treeNode);
                },
                onDblClick: function () {
                    _this.treeDbClick = true;
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
    };
    return HieknSDKConceptTree;
}());
var HieknSDKDisambiguate = /** @class */ (function () {
    function HieknSDKDisambiguate() {
    }
    HieknSDKDisambiguate.load = function (options) {
        options = $.extend(true, {}, HieknSDKDisambiguate.defaults, options);
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        var newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'disambiguate', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
    ;
    HieknSDKDisambiguate.defaults = {
        queryData: {
            useConcept: true,
            useEntity: true,
            useAttr: true
        }
    };
    return HieknSDKDisambiguate;
}());
var HieknSDKInfobox = /** @class */ (function () {
    function HieknSDKInfobox(options) {
        this.callback = $.noop;
        this.defaults = {
            atts: { visible: [], hidden: [] },
            enableLink: false,
            autoLen: true,
            onLoad: $.noop,
            onFailed: $.noop
        };
        this.options = $.extend(true, {}, this.defaults, options);
    }
    HieknSDKInfobox.prototype.changeInfobox = function (id) {
        this.load(id, this.callback);
    };
    ;
    HieknSDKInfobox.prototype.initEvent = function ($container) {
        var _this = this;
        $container.on('click', '.hiekn-infobox-link', function (event) {
            var id = $(event.currentTarget).attr('data-id');
            _this.options.changeInfobox ? _this.options.changeInfobox(id, _this) : _this.changeInfobox(id);
        });
        $container.on('click', '.hiekn-infobox-info-detail a', function (event) {
            $(event.currentTarget).closest('.hiekn-infobox-info-detail').toggleClass('on');
        });
    };
    HieknSDKInfobox.prototype.buildEntity = function (entity, buildLink) {
        var meaningTag = entity.meaningTag ? '(' + entity.meaningTag + ')' : '';
        var html = '<span class="hiekn-infobox-name">' + entity.name + '<span class="hiekn-infobox-meaningTag">' + meaningTag + '</span></span>';
        if (buildLink && this.options.enableLink) {
            return '<a href="javascript:void(0)" class="hiekn-infobox-link" data-id="' + entity.id + '">' + html + '</a>';
        }
        return html;
    };
    HieknSDKInfobox.prototype.buildExtra = function (extra) {
        var detail = extra.v || '-';
        if (this.options.autoLen) {
            var max = typeof this.options.autoLen == 'number' ? this.options.autoLen : 80;
            if (extra.v.length > max) {
                detail = '<span class="hiekn-infobox-info-detail-short">' + extra.v.substring(0, max) + '<a href="javascript:void(0)">查看全部&gt;&gt;</a></span><span class="hiekn-infobox-info-detail-long">' + extra.v + '<a href="javascript:void(0)">收起&lt;&lt;</a></span>';
            }
        }
        return '<tr><td class="hiekn-infobox-info-label">' + extra.k + '</td><td class="hiekn-infobox-info-detail">' + detail + '</td></tr>';
    };
    HieknSDKInfobox.prototype.load = function (id, callback, onFailed) {
        var _this = this;
        var queryData = this.options.queryData || {};
        var formData = this.options.formData || {};
        formData.id = id;
        formData.kgName = this.options.kgName;
        HieknSDKUtils.ajax({
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'infobox', queryData),
            type: 'POST',
            data: formData,
            dataFilter: this.options.dataFilter,
            success: function (data) {
                data = data[0];
                if (data) {
                    if (callback) {
                        _this.callback = callback;
                        callback(data);
                    }
                    else if (_this.options.selector) {
                        var $container = _this.buildInfobox(data);
                        $(_this.options.selector).html($container[0].outerHTML);
                        _this.initEvent($container);
                    }
                    else {
                        console.error('selector or callback can not be null');
                    }
                    _this.options.onLoad(data);
                }
                else {
                    if (!onFailed || !onFailed(data)) {
                        _this.options.onFailed(data);
                    }
                }
            },
            error: function (jqXHR) {
                if (!onFailed || !onFailed(null)) {
                    _this.options.onFailed(null);
                }
            }
        });
    };
    ;
    HieknSDKInfobox.prototype.buildInfobox = function (data) {
        var $infoxbox = $('<div class="hiekn-infobox"></div>');
        if (data.self) {
            $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"></div>');
            var baseEntity = this.buildEntity(data.self, false);
            $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + baseEntity + '</div>');
            if (data.self.img) {
                var imgUlrl = data.self.img;
                if (data.self.img.indexOf('http') != 0) {
                    imgUlrl = HieknSDKUtils.qiniuImg(this.options.imagePrefix + data.self.img);
                }
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-img"><img src="' + imgUlrl + '" alt=""></div>');
            }
            if (data.self.extra) {
                var html = '';
                var visible = this.options.atts.visible || [];
                var hidden = this.options.atts.hidden || [];
                for (var i in data.self.extra) {
                    if (data.self.extra.hasOwnProperty(i)) {
                        var extra = data.self.extra[i];
                        if ((visible.length && _.indexOf(visible, extra.k) >= 0) || (hidden.length && _.indexOf(hidden, extra.k) < 0) || (!visible.length && !hidden.length)) {
                            html += this.buildExtra(extra);
                        }
                    }
                }
                if (data.atts) {
                    for (var m in data.atts) {
                        if (data.atts.hasOwnProperty(m)) {
                            var att = data.atts[m];
                            var lis = '';
                            for (var j in att.v) {
                                if (att.v.hasOwnProperty(j)) {
                                    lis += '<li>' + this.buildEntity(att.v[j], true) + '</li>';
                                }
                            }
                            if (visible.length && _.indexOf(visible, att.k) >= 0) {
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            }
                            else if (hidden.length && _.indexOf(hidden, att.k) < 0) {
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            }
                            else if (!visible.length && !hidden.length) {
                                html += '<tr><td class="hiekn-infobox-info-label">' + att.k + '</td><td class="hiekn-infobox-info-detail">' + lis + '</td></tr>';
                            }
                        }
                    }
                }
                $infoxbox.find('.hiekn-infobox-body').append('<table><tbody>' + html + '</tbody></table>');
            }
            if (data.pars) {
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                for (var k in data.pars) {
                    if (data.pars.hasOwnProperty(k)) {
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + this.buildEntity(data.pars[k], true) + '</li>');
                    }
                }
            }
            if (data.sons) {
                var html = '';
                for (var l in data.sons) {
                    if (data.sons.hasOwnProperty(l)) {
                        html += '<li>' + this.buildEntity(data.sons[l], true) + '</li>';
                    }
                }
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">相关：</label><ul>' + html + '</ul></div>');
            }
        }
        else {
            $infoxbox.append('InfoBox读取错误');
        }
        return $infoxbox;
    };
    HieknSDKInfobox.prototype.buildTabInfobox = function (data) {
        var $infoxbox = $('<div class="hiekn-infobox hiekn-infobox-tab"></div>');
        if (data.self) {
            $infoxbox.append('<div class="hiekn-infobox-head"></div><div class="hiekn-infobox-body"><ul class="nav nav-tabs" role="tablist"></ul><div class="tab-content"></div></div>');
            $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-title">' + this.buildEntity(data.self, false) + '</div>');
            var visible = this.options.atts.visible || [];
            var hidden = this.options.atts.hidden || [];
            if (data.self.extra) {
                var html = '';
                for (var i in data.self.extra) {
                    if (data.self.extra.hasOwnProperty(i)) {
                        var extra = data.self.extra[i];
                        if ((visible.length && _.indexOf(visible, extra.k) >= 0) || (hidden.length && _.indexOf(hidden, extra.k) < 0) || (!visible.length && !hidden.length)) {
                            html += this.buildExtra(extra);
                        }
                    }
                }
                var id = 'hiekn-infobox-' + new Date().getTime() + '-' + data.self.id;
                $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation" class="active"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">基本信息</a></li>');
                $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-detail tab-pane active" id="' + id + '"><table><tbody>' + html + '</tbody></table></div>');
            }
            if (data.pars) {
                $infoxbox.find('.hiekn-infobox-head').append('<div class="hiekn-infobox-pars"><label class="hiekn-infobox-label">所属：</label><ul></ul></div>');
                for (var k in data.pars) {
                    if (data.pars.hasOwnProperty(k)) {
                        $infoxbox.find('.hiekn-infobox-pars ul').append('<li>' + this.buildEntity(data.pars[k], true) + '</li>');
                    }
                }
            }
            if (data.sons) {
                var html = '';
                for (var l in data.sons) {
                    if (data.sons.hasOwnProperty(l)) {
                        html += '<li>' + this.buildEntity(data.sons[l], true) + '</li>';
                    }
                }
                var id = 'hiekn-infobox-' + new Date().getTime() + '-sons-' + data.self.id;
                $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">子节点</a></li>');
                $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
            }
            if (data.atts) {
                for (var m in data.atts) {
                    if (data.atts.hasOwnProperty(m)) {
                        var att = data.atts[m];
                        var html = '';
                        for (var j in att.v) {
                            if (att.v.hasOwnProperty(j)) {
                                html += '<li>' + this.buildEntity(att.v[j], true) + '</li>';
                            }
                        }
                        if ((visible.length && _.indexOf(visible, att.k) >= 0) || (hidden.length && _.indexOf(hidden, att.k) < 0) || (!visible.length && !hidden.length)) {
                            var id = 'hiekn-infobox-' + new Date().getTime() + '-att-' + m + '-' + data.self.id;
                            $infoxbox.find('.hiekn-infobox-body>.nav-tabs').append('<li role="presentation"><a href="#' + id + '" role="tab" data-toggle="tab" aria-expanded="true">' + att.k + '</a></li>');
                            $infoxbox.find('.hiekn-infobox-body>.tab-content').append('<div role="tabpanel" class="tab-pane-sons tab-pane" id="' + id + '"><ul>' + html + '</ul></div>');
                        }
                    }
                }
            }
        }
        else {
            $infoxbox.append('InfoBox读取错误');
        }
        return $infoxbox;
    };
    return HieknSDKInfobox;
}());
var HieknSDKPrompt = /** @class */ (function () {
    function HieknSDKPrompt(options) {
        this.defaults = {
            ready: $.noop,
            group: false,
            replaceSearch: false,
            onSearch: $.noop,
            promptType: 0
        };
        this.options = $.extend(true, {}, this.defaults, options);
        this.init();
    }
    HieknSDKPrompt.prototype.init = function () {
        var _this = this;
        var schemaSetting = $.extend(true, { kgName: this.options.kgName }, this.options, this.options.schemaSetting);
        schemaSetting.success = (function (schema) {
            var promptSettings;
            if (_this.options.promptType === 0) {
                promptSettings = {
                    drawPromptItem: HieknSDKPrompt.drawPromptItem(schema),
                    onPrompt: HieknSDKPrompt.onPrompt(_this.options)
                };
            }
            else {
                promptSettings = {
                    drawPromptItem: HieknSDKPrompt.drawPromptKnowledgeItem(),
                    onPrompt: HieknSDKPrompt.onPromptKnowledge(_this.options)
                };
            }
            if (_this.options.group) {
                promptSettings.drawPromptItems = _this.drawPromptItems(schema);
            }
            if (_this.options.replaceSearch) {
                promptSettings.beforeSearch = function (selectedItem, $container) {
                    if (selectedItem) {
                        $container.find('input[type=text]').val(selectedItem.name);
                    }
                };
            }
            $.extend(true, promptSettings, _this.options);
            _this.instance = new hieknPrompt(promptSettings);
            _this.options.ready(_this.instance);
        });
        HieknSDKSchema.load(schemaSetting);
    };
    HieknSDKPrompt.drawPromptItem = function (schema) {
        var typeObj = {};
        for (var _i = 0, _a = schema.types; _i < _a.length; _i++) {
            var type = _a[_i];
            typeObj[type.k] = type.v;
        }
        return function (data, pre) {
            var title = data.name;
            if (data.meaningTag) {
                title = title + ' ( ' + data.meaningTag + ' )';
            }
            var line = '<span class="prompt-tip-title">' + title.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
            line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (data.className || typeObj[data.classId] || '') + '</span>' + line;
            return line;
        };
    };
    HieknSDKPrompt.drawPromptKnowledgeItem = function () {
        var typeObj = {
            0: '概念',
            1: '实例'
        };
        return function (data, pre) {
            var line = '<span class="prompt-tip-title">' + data.name.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
            line = '<span class="prompt-tip-type prompt-tip-' + data.kgType + '">' + (typeObj[data.kgType] || '') + '</span>' + line;
            return line;
        };
    };
    HieknSDKPrompt.prototype.drawPromptItems = function (schema) {
        var _this = this;
        var typeObj = {};
        for (var _i = 0, _a = schema.types; _i < _a.length; _i++) {
            var type = _a[_i];
            typeObj[type.k] = type.v;
        }
        return function (data, pre) {
            var $container = $('<div></div>');
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var v = data_1[_i];
                var text = _this.instance.options.drawPromptItem(v, pre);
                var title = _this.instance.options.drawItemTitle(v);
                var cls = 'prompt-item-' + v.classId;
                var $li = $('<li title="' + title + '" class="' + cls + '">' + text + '</li>').data('data', v);
                var ex = $container.find('.' + cls);
                if (ex.length) {
                    $(ex[ex.length - 1]).after($li);
                    $li.find('.prompt-tip-type').empty();
                }
                else {
                    $container.append($li);
                }
            }
            return $container.children();
        };
    };
    HieknSDKPrompt.onPromptStart = function (options) {
        return function (pre, $self) {
            var queryData = options.queryData || {};
            var formData = options.formData || {};
            formData[options.paramName] = pre;
            formData.kgName = options.kgName;
            HieknSDKUtils.ajax({
                url: HieknSDKUtils.buildUrl(options.url, queryData),
                type: options.type,
                data: formData,
                dataFilter: options.dataFilter,
                success: function (data) {
                    if ($self.prompt == formData[options.paramName]) {
                        var d = data;
                        options.beforeDrawPrompt && (d = options.beforeDrawPrompt(d, pre));
                        $self.startDrawPromptItems(d, pre);
                    }
                }
            });
        };
    };
    HieknSDKPrompt.onPrompt = function (options) {
        var reqOptions = options;
        reqOptions.paramName = 'kw';
        reqOptions.url = options.baseUrl + 'prompt';
        reqOptions.type = 'POST';
        return HieknSDKPrompt.onPromptStart(reqOptions);
    };
    HieknSDKPrompt.onPromptKnowledge = function (options) {
        var reqOptions = options;
        reqOptions.paramName = 'text';
        reqOptions.url = options.baseUrl + 'prompt/knowledge';
        reqOptions.type = 'GET';
        return HieknSDKPrompt.onPromptStart(options);
    };
    return HieknSDKPrompt;
}());
var HieknSDKResource = /** @class */ (function () {
    function HieknSDKResource(options) {
        this.options = options;
        this.init();
    }
    HieknSDKResource.prototype.getQuery = function () {
        var must = [];
        var filter = this.tableService.getFilterOptions();
        for (var key in filter) {
            var should = [];
            var value = filter[key];
            var filterConfig = _.find(this.options.config.filter, ['key', key]);
            if (filterConfig.type == 'year' || filterConfig.type == 'month') {
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var year = value_1[_i];
                    var from = '';
                    var to = '';
                    if (filterConfig.type == 'year') {
                        from = moment(year + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                        to = moment((parseInt(year, 10) + 1) + '-01-01').format(filterConfig.format || 'YYYY-MM-DD');
                    }
                    else {
                        from = moment(year + '-01').format(filterConfig.format || 'YYYY-MM');
                        to = moment((parseInt(year, 10) + 1) + '-01').format(filterConfig.format || 'YYYY-MM');
                    }
                    var obj = {};
                    obj[key] = {
                        from: from,
                        to: to,
                        include_lower: true,
                        include_upper: false
                    };
                    should.push({
                        range: obj
                    });
                }
            }
            else {
                var obj = {};
                obj[key] = value;
                should.push({
                    terms: obj
                });
            }
            must.push({
                bool: {
                    should: should,
                    minimum_should_match: 1
                }
            });
        }
        var kw = this.tableService.getFilterKw();
        if (kw) {
            var should = [];
            var fields = this.options.config.fieldsKw || this.options.config.fieldsTable || this.options.config.fields;
            var obj = {
                query: kw,
                fields: fields
            };
            should.push({
                query_string: obj
            });
            must.push({
                bool: {
                    should: should,
                    minimum_should_match: 1
                }
            });
        }
        return {
            bool: {
                must: must
            }
        };
    };
    HieknSDKResource.prototype.init = function () {
        var _this = this;
        var config = {
            config: this.options.config,
            container: this.options.container,
            load: function (pageNo, instance) {
                _this.load(pageNo, instance);
            }
        };
        this.tableService = new HieknSDKTable(config);
    };
    HieknSDKResource.prototype.load = function (pageNo, instance) {
        var _this = this;
        this.query = this.getQuery();
        this.options.beforeLoad && this.options.beforeLoad(this);
        var config = this.options.config;
        var queryData = this.options.queryData || {};
        var formData = this.options.formData || {};
        formData.databases = config.databases;
        formData.tables = config.tables;
        formData.fields = config.fields;
        formData.query = JSON.stringify(this.query);
        formData.pageNo = pageNo;
        formData.pageSize = formData.pageSize || 15;
        var $container = instance.getTableContainer();
        $container.empty();
        var newOptions = {
            url: HieknSDKUtils.buildUrl(this.options.baseUrl + 'search', queryData),
            type: 'POST',
            data: formData,
            dataFilter: this.options.dataFilter,
            success: function (rsData, textStatus, jqXHR, data, params) {
                if (data) {
                    instance.drawPage(data.rsCount, params.pageNo, params.pageSize);
                    instance.drawData(data.rsData);
                }
                else {
                    instance.drawPage(0, params.pageNo, params.pageSize);
                }
                _this.options.onLoad && _this.options.onLoad(data, _this);
            },
            error: function (data, textStatus, jqXHR, errorThrown, params) {
                instance.drawPage(0, params.pageNo, params.pageSize);
            },
            that: $container[0]
        };
        HieknSDKUtils.ajax(newOptions);
    };
    HieknSDKResource.prototype.loadData = function (pageNo) {
        this.tableService.loadData(pageNo);
    };
    return HieknSDKResource;
}());
var HieknSDKResources = /** @class */ (function () {
    function HieknSDKResources(options) {
        this.resourcesService = [];
        this.options = options;
        this.init(this.options.namespace);
    }
    HieknSDKResources.prototype.bindEvent = function () {
        var _this = this;
        this.$headContainer.find('.hiekn-resource-nav-more').on('click', function () {
            _this.$headContainer.find('.hiekn-resource-nav-more-container').toggleClass('hide');
        });
        this.$headContainer.on('shown.bs.tab', 'a[data-toggle="tab"]', function () {
            var href = $(_this).attr('href');
            _this.$headContainer.find('.hiekn-resource-nav a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
            _this.$headContainer.find('.hiekn-resource-nav-hide-tabs a[href="' + href + '"]').parent().addClass('active').siblings().removeClass('active');
        });
        $('body').on('click', function (event) {
            if (!$(event.target).closest('.hiekn-resource-nav-more-container,.hiekn-resource-nav-more').length) {
                _this.$headContainer.find('.hiekn-resource-nav-more-container').addClass('hide');
            }
        });
        $(window).on('resize', function () {
            _this.updateTabVisibility();
        });
    };
    HieknSDKResources.prototype.init = function (namespace) {
        var _this = this;
        if (namespace === void 0) { namespace = 'hiekn-resource'; }
        this.$container = $(this.options.container);
        this.$headContainer = $('<div class="hiekn-resource-nav-container">' +
            '<ul class="hiekn-resource-nav nav nav-tabs" role="tablist"></ul>' +
            '<div class="hiekn-resource-nav-more hide">更多</div>' +
            '<div class="hiekn-resource-nav-more-container hide">' +
            '<ul class="hiekn-resource-nav-hide-tabs"></ul>' +
            '</div>' +
            '</div>');
        this.$bodyContainer = $('<div class="hiekn-resource-container tab-content"></div>');
        this.$container.append(this.$headContainer);
        this.$container.append(this.$bodyContainer);
        var $navContainer = this.select('.hiekn-resource-nav-container ul.hiekn-resource-nav');
        var $navHideContainer = this.select('.hiekn-resource-nav-container ul.hiekn-resource-nav-hide-tabs');
        var allW = 0;
        for (var i in this.options.configs) {
            var cls = i == '0' ? 'active' : '';
            var id = namespace + '-tab-' + i + '-' + new Date().getTime();
            var $resourceContainer = $('<div role="tabpanel" class="tab-pane ' + cls + '" id="' + id + '"></div>');
            this.$bodyContainer.append($resourceContainer);
            var config = $.extend(true, {}, this.options);
            config.config = this.options.configs[i];
            config.container = $resourceContainer;
            config.onLoad = function (data, instance) {
                var id = instance.tableService.$container.attr('id');
                _this.$headContainer.find('a[href="#' + id + '"] .res-count').text(data.rsCount || 0);
                _this.options.onLoad && _this.options.onLoad(data, instance);
            };
            delete config.namespace;
            delete config.configs;
            this.resourcesService.push(new HieknSDKResource(config));
            var tab = '<li role="presentation" class="' + cls + '">' +
                '<a href="#' + id + '" aria-controls="" role="tab" data-toggle="tab">' +
                '<span class="res-name" title="' + config.config.name + '">' + config.config.name + '</span>' +
                '<span class="res-count"></span>' +
                '</a></li>';
            $navContainer.append(tab);
            $navHideContainer.append(tab);
            allW += $navContainer.find('li:last-child').width();
        }
        $navContainer.css('width', allW);
        this.updateTabVisibility();
        this.bindEvent();
    };
    HieknSDKResources.prototype.loadData = function (pageNo) {
        for (var _i = 0, _a = this.resourcesService; _i < _a.length; _i++) {
            var resourcesService = _a[_i];
            resourcesService.loadData(pageNo);
        }
    };
    HieknSDKResources.prototype.select = function (selector) {
        return this.$container.find(selector);
    };
    HieknSDKResources.prototype.updateTabVisibility = function () {
        var $container = this.$headContainer;
        var cw = $container.width();
        var $navContainer = $container.find('.nav');
        var tw = $navContainer.width();
        var $nm = $container.find('.hiekn-resource-nav-more');
        if (cw < tw) {
            $nm.removeClass('hide');
        }
        else {
            $nm.addClass('hide');
            $container.find('.hiekn-resource-nav-more-container').addClass('hide');
        }
        var w = 0;
        var nmw = $nm.outerWidth();
        var $hideTabs = $container.find('.hiekn-resource-nav-hide-tabs>li');
        $navContainer.find('li').each(function (i, v) {
            $(v).removeClass('hide');
            w += $(v).width();
            if (w >= cw - nmw) {
                $(v).addClass('hide');
                $($hideTabs.get(i)).removeClass('hide');
            }
            else {
                $($hideTabs.get(i)).addClass('hide');
            }
        });
    };
    return HieknSDKResources;
}());
var HieknSDKSchema = /** @class */ (function () {
    function HieknSDKSchema() {
    }
    HieknSDKSchema.load = function (options) {
        var queryData = options.queryData || {};
        var formData = $.extend(true, { kgName: options.kgName }, options.formData);
        var newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'schema', queryData),
            type: 'POST',
            data: formData,
            beforeSend: function () {
                options.that && $(options.that).find('.ajax-loading').html(HieknSDKUtils.loadingHTML);
            },
            success: function (data, textStatus, jqXHR) {
                options.success(data[0], textStatus, jqXHR);
            }
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
    ;
    return HieknSDKSchema;
}());
var HieknSDKSegment = /** @class */ (function () {
    function HieknSDKSegment() {
    }
    HieknSDKSegment.load = function (options) {
        options = $.extend(true, HieknSDKSegment.defaults, options);
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        var newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'segment', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
    ;
    HieknSDKSegment.defaults = {
        queryData: {
            useConcept: true,
            useEntity: true,
            useAttr: true
        }
    };
    return HieknSDKSegment;
}());
var HieknSDKTable = /** @class */ (function () {
    function HieknSDKTable(options) {
        this.options = options;
        this.init();
    }
    HieknSDKTable.prototype.buildFilter = function () {
        var filterHtml = '';
        var filters = this.options.config.filter;
        for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
            var filter = filters_1[_i];
            var label = filter.label || filter.key;
            var filterOptions = '';
            for (var _a = 0, _b = filter.options; _a < _b.length; _a++) {
                var item = _b[_a];
                if (item instanceof Object) {
                    if (item.key !== undefined && item.value !== undefined) {
                        var option = item;
                        filterOptions += '<span option-value="' + option.value + '" option-key="' + option.key + '">' + option.key + '</span>';
                    }
                    else {
                        var option = item;
                        for (var key in option) {
                            filterOptions += '<span option-value="' + option[key] + '" option-key="' + key + '">' + option[key] + '</span>';
                        }
                    }
                }
                else {
                    filterOptions += '<span option-value="' + item + '" option-key="' + filter.key + '">' + item + '</span>';
                }
            }
            filterHtml += '<div class="hiekn-table-filter-item">' +
                '<div class="hiekn-table-filter-item-label">' + label + '：</div>' +
                '<div class="hiekn-table-filter-item-content">' + filterOptions + '' +
                '<div class="hiekn-table-more-container">' +
                '<span class="hiekn-table-filter-more">更多 <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg></span>' +
                '<span class="hiekn-table-filter-less">收起 <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg></span>' +
                '<span class="hiekn-table-filter-multi"><svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> 多选</span>' +
                '<button class="btn btn-primary hiekn-table-btn-confirm">确定</button>' +
                '<button class="btn btn-primary-outline hiekn-table-btn-cancel">取消</button>' +
                '</div>' +
                '</div>' +
                '</div>';
        }
        filterHtml += '<div class="hiekn-table-filter-item hiekn-table-filter-item-kw">' +
            '<div class="hiekn-table-filter-item-label">关键词：</div>' +
            '<div class="hiekn-table-filter-item-content">' +
            '<div class="hiekn-table-search-kw-container"><input type="text"><button class="btn btn-primary hiekn-table-btn-confirm">确定</button></div>' +
            '</div>' +
            '</div>';
        this.select('.hiekn-table-filter').html(filterHtml);
    };
    HieknSDKTable.prototype.bindFilterEvent = function () {
        var _this = this;
        this.select('.hiekn-table-filter').on('click', 'span[option-value]', function (event) {
            var $item = $(event.currentTarget);
            var key = $item.attr('option-key');
            var value = $item.attr('option-value');
            if ($item.closest('.hiekn-table-filter-item').hasClass('multi')) {
                $item.toggleClass('active');
            }
            else {
                if (!$item.hasClass('active')) {
                    $item.addClass('active').siblings('.active').removeClass('active');
                }
                else {
                    $item.removeClass('active');
                }
                _this.loadData(1);
            }
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-more', function (event) {
            var $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').addClass('expend');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-less', function (event) {
            var $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('expend');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-filter-multi', function (event) {
            var $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').addClass('multi');
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-confirm', function (event) {
            var $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('multi');
            _this.loadData(1);
        });
        this.select('.hiekn-table-filter').on('click', '.hiekn-table-btn-cancel', function (event) {
            var $item = $(event.currentTarget);
            $item.closest('.hiekn-table-filter-item').removeClass('multi');
        });
        this.select('.hiekn-table-search-kw-container').on('keydown', 'input', function (event) {
            var key = window.event ? event.keyCode : event.which;
            if (key == 13) {
                _this.loadData(1);
            }
        });
    };
    HieknSDKTable.prototype.bindTableEvent = function () {
        this.select('.hiekn-table-content').on('click', '.hiekn-table-data-angle', function (event) {
            $(event.currentTarget).toggleClass('on').closest('tr').next('tr.hiekn-table-detail-line').toggleClass('hide');
        });
    };
    HieknSDKTable.dealContent = function (d, len) {
        if (len === void 0) { len = 80; }
        if (d) {
            var text = $('<div>' + d + '</div>').text();
            if (text.length > len) {
                return text.substring(0, len) + '...';
            }
            else {
                return text;
            }
        }
        else {
            return '';
        }
    };
    HieknSDKTable.prototype.drawData = function (data) {
        var config = this.options.config;
        this.data = data;
        var ths = '<thead><tr>';
        var trs = '<tbody>';
        var fields = config.fieldsTable || config.fields;
        var fieldsName = config.fieldsTableName ? config.fieldsTableName : (config.fieldsName ? config.fieldsName : fields);
        var drawDetail = config.drawDetail || config.fieldsDetail || config.fieldsTable;
        var fieldsDetail = config.fieldsDetail || config.fields;
        var fieldsNameDetail = config.fieldsDetailName ? config.fieldsDetailName : (config.fieldsName ? config.fieldsName : fields);
        var fieldsRenderer = config.fieldsRenderer || {};
        var fieldsLink = {};
        if (drawDetail) {
            ths += '<th></th>';
        }
        for (var fidx in fields) {
            var renderer = fieldsRenderer[fields[fidx]];
            if (renderer && renderer instanceof Object && renderer.type == 'link' && renderer.fields) {
                for (var _i = 0, _a = renderer.fields; _i < _a.length; _i++) {
                    var f = _a[_i];
                    fieldsLink[f] = fields[fidx];
                }
                continue;
            }
            ths += '<th>' + fieldsName[fidx] + '</th>';
        }
        for (var _b = 0, data_2 = data; _b < data_2.length; _b++) {
            var d = data_2[_b];
            var tr = '<tr>';
            if (drawDetail) {
                tr += '<td class="hiekn-table-data-angle"><svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg></td>';
            }
            var len = 0;
            for (var _c = 0, fields_1 = fields; _c < fields_1.length; _c++) {
                var k = fields_1[_c];
                len++;
                if (!fieldsRenderer[k] || !fieldsRenderer[k].fields) {
                    tr += '<td>' + HieknSDKTable.rendererFields(d, k, fieldsLink, fieldsRenderer, true) + '</td>';
                }
            }
            tr += '</tr>';
            trs += tr;
            if (drawDetail) {
                var trDetail = '<tr class="hiekn-table-detail-line hide"><td colspan="' + (len + 1) + '">';
                for (var i in fieldsDetail) {
                    var k = fieldsDetail[i];
                    if (!fieldsRenderer[k] || !fieldsRenderer[k].fields) {
                        trDetail += '<div class="hiekn-table-detail-' + k + '"><label>' + fieldsNameDetail[i] + ':</label>' + HieknSDKTable.rendererFields(d, k, fieldsLink, fieldsRenderer, false) + '</div>';
                    }
                }
                trDetail += '</td></tr>';
                trs += trDetail;
            }
        }
        trs += '</body>';
        ths += '</tr></thead>';
        this.select('.hiekn-table-content').html('<table class="hiekn-table-normal">' + ths + trs + '</table>');
    };
    HieknSDKTable.prototype.drawPage = function (count, pageNo, pageSize) {
        var _this = this;
        var options = {
            totalItem: count,
            pageSize: pageSize,
            current: pageNo,
            selector: this.select('.pagination'),
            callback: function (data, pageNo) {
                _this.loadData(pageNo);
            }
        };
        HieknSDKUtils.drawPagination(options);
    };
    ;
    HieknSDKTable.prototype.getFilterKw = function () {
        return this.select('.hiekn-table-search-kw-container').find('input').val();
    };
    HieknSDKTable.prototype.getFilterOptions = function () {
        var filterOptions = {};
        this.select('.hiekn-table-filter-item').each(function (i, v) {
            var key = '';
            var $items = $(v).find('span[option-value].active');
            if ($items.length) {
                var hasAll_1 = false;
                var value_2 = [];
                $items.each(function (j, e) {
                    var ov = $(e).attr('option-value');
                    if (!ov) {
                        hasAll_1 = true;
                    }
                    else {
                        key = $(e).attr('option-key');
                        value_2.push(ov);
                    }
                });
                if (!hasAll_1) {
                    filterOptions[key] = value_2;
                }
            }
        });
        return filterOptions;
    };
    HieknSDKTable.prototype.getTableContainer = function () {
        return this.select('.hiekn-table-content');
    };
    HieknSDKTable.getValues = function (value) {
        var values = [];
        if (value instanceof Array) {
            values = value;
        }
        else if (typeof value == 'string') {
            if (value.indexOf('[') == 0) {
                try {
                    values = JSON.parse(value);
                }
                catch (e) {
                    values = [value];
                }
            }
            else {
                values = value.split(',');
            }
        }
        return values;
    };
    HieknSDKTable.prototype.init = function () {
        this.$container = $(this.options.container).addClass('hiekn-table');
        this.$container.append('<div class="hiekn-table-filter">' +
            '</div>' +
            '<div class="hiekn-table-content"></div>' +
            '<div class="hiekn-table-page">' +
            '<div class="pagination-outter">' +
            '<ul class="pagination"></ul>' +
            '</div>' +
            '</div>');
        this.buildFilter();
        this.bindFilterEvent();
        this.bindTableEvent();
    };
    HieknSDKTable.prototype.loadData = function (pageNo) {
        this.options.load(pageNo, this);
    };
    HieknSDKTable.rendererDate = function (v) {
        return moment(v).format('YYYYMMDD');
    };
    HieknSDKTable.rendererDateTime = function (v) {
        return moment(v).format('YYYY-MM-DD HH:mm:ss');
    };
    HieknSDKTable.rendererFields = function (d, k, fieldsLink, fieldsRenderer, short) {
        var str = '';
        if (d[k]) {
            var values = HieknSDKTable.getValues(d[k]);
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var value = values_1[_i];
                if (!fieldsRenderer[k]) {
                    str += ',' + HieknSDKTable.rendererValue('string', value, undefined, short, d);
                }
                else {
                    str += ',' + HieknSDKTable.rendererValue(fieldsRenderer[k].type || fieldsRenderer[k], value, fieldsRenderer[k], short, d);
                }
            }
            str = str.substring(1);
        }
        if (fieldsLink[k]) {
            var name_1 = d[k];
            if (!d[k]) {
                name_1 = '链接';
            }
            str = HieknSDKTable.rendererLink(d[fieldsLink[k]], name_1);
        }
        return str;
    };
    HieknSDKTable.rendererLink = function (v, name, cls) {
        if (name === void 0) { name = '查看'; }
        if (cls === void 0) { cls = ''; }
        return v ? '<a href="' + v + '" target="_blank" class="' + cls + '">' + name + '</a>' : '';
    };
    HieknSDKTable.rendererValue = function (type, value, fieldsRenderer, short, data) {
        var str = '';
        try {
            if (type == 'year') {
                str = HieknSDKTable.rendererYear(value);
            }
            else if (type == 'date') {
                str = HieknSDKTable.rendererDate(value);
            }
            else if (type == 'dateTime') {
                str = HieknSDKTable.rendererDateTime(value);
            }
            else if (type == 'json') {
                str = JSON.stringify(value);
            }
            else if (type == 'link') {
                str = HieknSDKTable.rendererLink(value, fieldsRenderer.name, 'hiekn-table-btn-link');
            }
            else if (type == 'string' && short) {
                str = HieknSDKTable.dealContent(value);
            }
            else if (type instanceof Function) {
                str = type(value, data);
            }
            else {
                str = HieknSDKUtils.safeHTML(value);
            }
        }
        catch (e) {
        }
        return str;
    };
    HieknSDKTable.rendererYear = function (v) {
        return moment(v).format('YYYY');
    };
    HieknSDKTable.prototype.select = function (selector) {
        return this.$container.find(selector);
    };
    return HieknSDKTable;
}());
var HieknSDKTagging = /** @class */ (function () {
    function HieknSDKTagging() {
    }
    HieknSDKTagging.load = function (options) {
        var queryData = options.queryData || {};
        var formData = options.formData || {};
        var newOptions = {
            url: HieknSDKUtils.buildUrl(options.baseUrl + 'tagging', queryData),
            type: 'GET',
            data: formData,
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKUtils.ajax(newOptions);
    };
    ;
    return HieknSDKTagging;
}());
var HieknSDKUtils = /** @class */ (function () {
    function HieknSDKUtils() {
    }
    HieknSDKUtils.ajax = function (options) {
        var error = options.error || $.noop;
        var type = options.type;
        switch (type) {
            case 'GET':
                type = 0;
                break;
            case 'POST':
                type = 1;
                break;
        }
        var newOptions = {
            type: type,
            dataFilter: options.dataFilter || HieknSDKUtils.dataFilter,
            params: options.data,
            success: function (data, textStatus, jqXHR, params) {
                if (data && data.rsData) {
                    options.success(data.rsData, textStatus, jqXHR, data, params);
                }
                else {
                    error(data, textStatus, jqXHR, null, params);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                error(null, textStatus, xhr, errorThrown);
            },
        };
        newOptions = $.extend(true, {}, options, newOptions);
        hieknjs.kgLoader(newOptions);
    };
    HieknSDKUtils.buildUrl = function (url, queryData) {
        if (queryData && !$.isEmptyObject(queryData)) {
            var link = url.indexOf('?') > 0 ? '&' : '?';
            return url + link + $.param(queryData);
        }
        else {
            return url;
        }
    };
    HieknSDKUtils.dataFilter = function (data) {
        return data;
    };
    HieknSDKUtils.drawPagination = function (options) {
        $.extend(true, options, {
            data: Math.ceil(options.totalItem / options.pageSize),
            cur: options.current,
            p: options.selector,
            event: options.callback
        });
        hieknjs.gentPage(options);
    };
    HieknSDKUtils.error = function (msg) {
        toastr.error(msg);
    };
    HieknSDKUtils.getVersion = function () {
        return HieknSDKUtils.VERSION;
    };
    HieknSDKUtils.info = function (msg) {
        toastr.info(msg);
    };
    HieknSDKUtils.qiniuImg = function (img) {
        return img + '?_=' + Math.floor(new Date().getTime() / 3600000);
    };
    HieknSDKUtils.randomId = function (prefix, postfix, append) {
        if (prefix === void 0) { prefix = ''; }
        if (postfix === void 0) { postfix = ''; }
        if (append === void 0) { append = ''; }
        return prefix + (append ? append : new Date().getTime() + Math.ceil(Math.random() * 10000)) + postfix;
    };
    HieknSDKUtils.safeHTML = function (value) {
        return hieknjs.safeHTML(value);
    };
    HieknSDKUtils.dealNull = function (data) {
        return hieknjs.dealNull(data);
    };
    HieknSDKUtils.VERSION = '3.0.0';
    HieknSDKUtils.regChinese = /^[\u4e00-\u9fa5]$/;
    HieknSDKUtils.regEnglish = /^[a-zA-Z]$/;
    HieknSDKUtils.colorBase = ['#7bc0e1',
        '#9ec683',
        '#fde14d',
        '#ab89f4',
        '#e26f63',
        '#dca8c6',
        '#596690',
        '#eaad84',
        '#abe8bf',
        '#7979fc'];
    HieknSDKUtils.colorEx = ['#6db5d6',
        '#d0648a',
        '#c0d684',
        '#f2bac9',
        '#847d99',
        '#baf2d8',
        '#bfb3de',
        '#f4817c',
        '#94cdba',
        '#b2cede'];
    HieknSDKUtils.color = HieknSDKUtils.colorBase.concat(HieknSDKUtils.colorEx);
    HieknSDKUtils.loadingHTML = "<div class=\"schema-init\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 14 32 18\" width=\"32\" height=\"4\" preserveAspectRatio=\"none\">\n        <path opacity=\"0.8\" transform=\"translate(0 0)\" d=\"M2 14 V18 H6 V14z\">\n        <animateTransform attributeName=\"transform\" type=\"translate\" values=\"0 0; 24 0; 0 0\" dur=\"2s\" begin=\"0\" repeatCount=\"indefinite\" keySplines=\"0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8\" calcMode=\"spline\" /></path>\n        <path opacity=\"0.5\" transform=\"translate(0 0)\" d=\"M0 14 V18 H8 V14z\">\n        <animateTransform attributeName=\"transform\" type=\"translate\" values=\"0 0; 24 0; 0 0\" dur=\"2s\" begin=\"0.1s\" repeatCount=\"indefinite\" keySplines=\"0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8\" calcMode=\"spline\" /></path>\n        <path opacity=\"0.25\" transform=\"translate(0 0)\" d=\"M0 14 V18 H8 V14z\">\n        <animateTransform attributeName=\"transform\" type=\"translate\" values=\"0 0; 24 0; 0 0\" dur=\"2s\" begin=\"0.2s\" repeatCount=\"indefinite\"\n         keySplines=\"0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8\" calcMode=\"spline\" /></path>\n        </svg>\n        </div>";
    return HieknSDKUtils;
}());
var HieknSDKService = /** @class */ (function () {
    function HieknSDKService() {
    }
    HieknSDKService.prototype.schema = function (options, callback) {
        var newOptions = $.extend(true, {}, options, {
            queryData: options.data || {},
            formData: options.data2 || {},
            success: callback
        });
        HieknSDKSchema.load(newOptions);
    };
    HieknSDKService.prototype.association = function (options, callback) {
        var formData = $.extend(true, {}, options.data2 || {}, {
            allowAtts: options.allowAtts,
            id: options.id,
            pageSize: options.pageSize
        });
        var newOptions = {
            queryData: options.data || {},
            formData: formData,
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKAssociation.load(newOptions);
    };
    HieknSDKService.prototype.tagging = function (options, callback) {
        var queryData = $.extend(true, {}, options.data || {}, {
            kw: options.kw
        });
        var newOptions = {
            queryData: queryData,
            formData: options.data2 || {},
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKTagging.load(newOptions);
    };
    HieknSDKService.prototype.disambiguate = function (options, callback) {
        var queryData = $.extend(true, {}, options.data || {}, {
            kw: options.kw
        });
        var newOptions = {
            queryData: queryData,
            formData: options.data2 || {},
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKDisambiguate.load(newOptions);
    };
    HieknSDKService.prototype.segment = function (options, callback) {
        var queryData = $.extend(true, {}, options.data || {}, {
            kw: options.kw
        });
        var newOptions = {
            queryData: queryData,
            formData: options.data2 || {},
            success: callback
        };
        newOptions = $.extend(true, {}, options, newOptions);
        HieknSDKSegment.load(newOptions);
    };
    HieknSDKService.updateOptionsData = function (options) {
        options.formData = options.formData || options.data2 || {};
        options.queryData = options.queryData || options.data || {};
        return options;
    };
    return HieknSDKService;
}());
var HieknNetChartUpdateService = /** @class */ (function () {
    function HieknNetChartUpdateService() {
    }
    HieknNetChartUpdateService.updateOptions = function (options) {
        options = HieknSDKService.updateOptionsData(options);
        options.infoboxSetting = { enable: options.infobox };
        options.enableAutoUpdateStyle != undefined && (options.autoUpdateStyle = options.enableAutoUpdateStyle);
        return options;
    };
    return HieknNetChartUpdateService;
}());
var HieknGraphService = /** @class */ (function (_super) {
    __extends(HieknGraphService, _super);
    function HieknGraphService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknGraphService.prototype.beforeInit = function (options) {
        _super.prototype.beforeInit.call(this, HieknNetChartUpdateService.updateOptions(options));
    };
    return HieknGraphService;
}(HieknSDKGraph));
var HieknTimingGraphService = /** @class */ (function (_super) {
    __extends(HieknTimingGraphService, _super);
    function HieknTimingGraphService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknTimingGraphService.prototype.beforeInit = function (options) {
        _super.prototype.beforeInit.call(this, HieknNetChartUpdateService.updateOptions(options));
    };
    return HieknTimingGraphService;
}(HieknSDKTiming));
var HieknPathService = /** @class */ (function (_super) {
    __extends(HieknPathService, _super);
    function HieknPathService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknPathService.prototype.beforeInit = function (options) {
        _super.prototype.beforeInit.call(this, HieknNetChartUpdateService.updateOptions(options));
    };
    return HieknPathService;
}(HieknSDKPath));
var HieknRelationService = /** @class */ (function (_super) {
    __extends(HieknRelationService, _super);
    function HieknRelationService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknRelationService.prototype.beforeInit = function (options) {
        _super.prototype.beforeInit.call(this, HieknNetChartUpdateService.updateOptions(options));
    };
    return HieknRelationService;
}(HieknSDKRelation));
var HieknInfoboxService = /** @class */ (function (_super) {
    __extends(HieknInfoboxService, _super);
    function HieknInfoboxService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        options.changeInfobox = options.href;
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknInfoboxService;
}(HieknSDKInfobox));
var HieknPromptService = /** @class */ (function (_super) {
    __extends(HieknPromptService, _super);
    function HieknPromptService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        options.promptType = 0;
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknPromptService;
}(HieknSDKPrompt));
var HieknConceptPromptService = /** @class */ (function (_super) {
    __extends(HieknConceptPromptService, _super);
    function HieknConceptPromptService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        options.promptType = 1;
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknConceptPromptService;
}(HieknSDKPrompt));
var HieknConceptGraphService = /** @class */ (function (_super) {
    __extends(HieknConceptGraphService, _super);
    function HieknConceptGraphService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknConceptGraphService;
}(HieknSDKConceptGraph));
var HieknTableService = /** @class */ (function (_super) {
    __extends(HieknTableService, _super);
    function HieknTableService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknTableService;
}(HieknSDKTable));
var HieknResourceService = /** @class */ (function (_super) {
    __extends(HieknResourceService, _super);
    function HieknResourceService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknResourceService;
}(HieknSDKResource));
var HieknResourcesService = /** @class */ (function (_super) {
    __extends(HieknResourcesService, _super);
    function HieknResourcesService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknResourcesService;
}(HieknSDKResources));
var HieknConceptTreeService = /** @class */ (function (_super) {
    __extends(HieknConceptTreeService, _super);
    function HieknConceptTreeService(options) {
        var _this = this;
        options = HieknSDKService.updateOptionsData(options);
        options.nodeHoverTools.infoboxSetting = options.nodeHoverTools.infobox;
        options.nodeHoverTools.graphSetting = options.nodeHoverTools.graph;
        options.nodeHoverTools.graphSetting.infoboxSetting = options.nodeHoverTools.graphSetting.infobox;
        _this = _super.call(this, options) || this;
        return _this;
    }
    return HieknConceptTreeService;
}(HieknSDKConceptTree));
var HieknStatService = /** @class */ (function () {
    function HieknStatService(options) {
        options = HieknSDKService.updateOptionsData(options);
        $.extend(true, options.formData, options.config.querySettings);
        options.formDataUpdater = options.beforeLoad; //TODO
        var type = options.config.type;
        if (type == 'pie') {
            return new HieknSDKStatPie(options);
        }
        else if (type == 'line' || type == 'bar') {
            return new HieknSDKStatLineBar(options);
        }
        else if (type == 'wordCloud') {
            return new HieknSDKStatWordCloud(options);
        }
    }
    return HieknStatService;
}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLENBQUM7SUFDTCxDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQWRBLEFBY0MsSUFBQSIsImZpbGUiOiJoaWVrbi1zZGsuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ0eXBlIEhpZWtuVHlwZU5FID0geyBub3JtYWw6IHN0cmluZywgZW1waGFzZXM6IHN0cmluZyB9O1xyXG50eXBlIEhpZWtuVHlwZVVuaW9uU3RyaW5nTkUgPSBzdHJpbmcgfCBIaWVrblR5cGVORTtcclxudHlwZSBIaWVrblR5cGVVbmlvbk1hcCA9IHsgW2tleTogc3RyaW5nXTogSGlla25UeXBlVW5pb25TdHJpbmdORSB9O1xyXG50eXBlIEhpZWtuVHlwZVN0YXJ0SW5mbyA9IFRnYzJTdGFydEluZm8gfCBUZ2MyUGF0aFN0YXJ0SW5mbyB8IFRnYzJSZWxhdGlvblN0YXJ0SW5mbztcclxuXHJcbmludGVyZmFjZSBIaWVrbk5ldENoYXJ0RmlsdGVyU2V0dGluZyB7XHJcbiAgICBzZWxlY3RlZEF0dHM/OiBudW1iZXJbXTtcclxuICAgIHNlbGVjdGVkVHlwZXM/OiBudW1iZXJbXTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEhpZWtuTmV0Q2hhcnRMb2FkZXJTZXR0aW5nIGV4dGVuZHMgSGlla25CYXNlU2V0dGluZyB7XHJcbiAgICBlbmFibGU/OiBib29sZWFuO1xyXG4gICAgc2VsZWN0b3I/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrbk5ldENoYXJ0Tm9kZVNldHRpbmcge1xyXG4gICAgYXV0b1VwZGF0ZVN0eWxlPzogYm9vbGVhbjtcclxuICAgIGltYWdlUHJlZml4Pzogc3RyaW5nO1xyXG4gICAgaW1hZ2VzPzogSGlla25UeXBlVW5pb25NYXA7XHJcbiAgICBsZWdlbmRDbGFzcz86IG51bWJlcjtcclxuICAgIGxlZ2VuZENvbG9yPzogc3RyaW5nO1xyXG4gICAgbWluUmFkaXVzPzogbnVtYmVyO1xyXG4gICAgbm9kZUNvbG9ycz86IEhpZWtuVHlwZVVuaW9uTWFwO1xyXG4gICAgdGV4dENvbG9ycz86IEhpZWtuVHlwZVVuaW9uTWFwO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSGlla25OZXRDaGFydERhdGFOb2RlIGV4dGVuZHMgVGdjMkRhdGFOb2RlIHtcclxuICAgIGNsYXNzSWQ/OiBudW1iZXI7XHJcbiAgICBpbWc/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrbk5ldENoYXJ0SW5pdFNldHRpbmcgZXh0ZW5kcyBIaWVrbkJhc2VTZXR0aW5nIHtcclxuICAgIGZhaWxlZD86IEZ1bmN0aW9uO1xyXG4gICAgc3VjY2Vzcz86IEZ1bmN0aW9uO1xyXG4gICAgdGhhdD86IEhUTUxFbGVtZW50O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSGlla25OZXRDaGFydEluZm9ib3hTZXR0aW5nIGV4dGVuZHMgSGlla25JbmZvYm94U2V0dGluZyB7XHJcbiAgICBlbmFibGU/OiBib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSGlla25UZ2MyU2V0dGluZyBleHRlbmRzIFRnYzJTZXR0aW5nLCBUZ2MyUGF0aFNldHRpbmcsIFRnYzJSZWxhdGlvblNldHRpbmcge1xyXG4gICAgZmlsdGVyOiBUZ2MyRmlsdGVyU2V0dGluZ3M7XHJcbiAgICBwcm9tcHQ6IFRnYzJQcm9tcHRTZXR0aW5nO1xyXG4gICAgcGFnZTogVGdjMlBhZ2VTZXR0aW5nO1xyXG4gICAgY3J1bWI6IFRnYzJDcnVtYlNldHRpbmdzO1xyXG4gICAgZmluZDogVGdjMkZpbmRTZXR0aW5ncztcclxuICAgIGxlZ2VuZDogVGdjMkxlZ2VuZFNldHRpbmdzO1xyXG4gICAgdGltZUNoYXJ0OiBUZ2MyVGltZUNoYXJ0U2V0dGluZ3M7XHJcbiAgICBldmVudDogVGdjMkV2ZW50U2V0dGluZ3M7XHJcbiAgICBzdGF0czogVGdjMlN0YXRzU2V0dGluZ3M7XHJcbiAgICBjb25uZWN0czogVGdjMkNvbm5jZXRzU2V0dGluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEhpZWtuTmV0Q2hhcnRTZXR0aW5nIHtcclxuICAgIGtnTmFtZT86IHN0cmluZztcclxuICAgIGF1dG9Db2xvcj86IGJvb2xlYW47XHJcbiAgICBhdXRvVXBkYXRlU3R5bGU/OiBib29sZWFuO1xyXG4gICAgYmFzZVVybD86IHN0cmluZztcclxuICAgIGRhdGFGaWx0ZXI/OiBKUXVlcnlBamF4RGF0YUZpbHRlcjtcclxuICAgIGRpc3BsYXk/OiBzdHJpbmc7XHJcbiAgICBmb3JtRGF0YT86IGFueTtcclxuICAgIGltYWdlUHJlZml4Pzogc3RyaW5nO1xyXG4gICAgaW1hZ2VzPzogSGlla25UeXBlVW5pb25NYXA7XHJcbiAgICBpbmZvYm94U2V0dGluZz86IEhpZWtuTmV0Q2hhcnRJbmZvYm94U2V0dGluZztcclxuICAgIGxheW91dFN0YXR1cz86IGJvb2xlYW47XHJcbiAgICBsZWdlbmRUeXBlPzogc3RyaW5nO1xyXG4gICAgbWluUmFkaXVzPzogbnVtYmVyO1xyXG4gICAgbm9kZUNvbG9ycz86IEhpZWtuVHlwZVVuaW9uTWFwO1xyXG4gICAgcXVlcnlEYXRhPzogYW55O1xyXG4gICAgc2NoZW1hPzogSGlla25TY2hlbWE7XHJcbiAgICBzY2hlbWFTZXR0aW5nPzogSGlla25TY2hlbWFTZXR0aW5nO1xyXG4gICAgc2VsZWN0ZWRBdHRzPzogbnVtYmVyW107XHJcbiAgICBzZWxlY3RlZERpc3RhbmNlPzogbnVtYmVyO1xyXG4gICAgc2VsZWN0ZWRUeXBlcz86IG51bWJlcltdO1xyXG4gICAgc2VsZWN0b3I/OiBzdHJpbmc7XHJcbiAgICBzdGFydEluZm8/OiBIaWVrblR5cGVTdGFydEluZm87XHJcbiAgICB0ZXh0Q29sb3JzPzogSGlla25UeXBlVW5pb25NYXA7XHJcbiAgICB0Z2MyU2V0dGluZ3M/OiBIaWVrblRnYzJTZXR0aW5nO1xyXG4gICAgc3RhdHNDb25maWc/OiBhbnlbXTtcclxufVxyXG5cclxuYWJzdHJhY3QgY2xhc3MgSGlla25TREtOZXRDaGFydCB7XHJcbiAgICBpc0luaXQgPSBmYWxzZTtcclxuICAgIGlzVGltaW5nID0gZmFsc2U7XHJcbiAgICBvcHRpb25zOiBIaWVrbk5ldENoYXJ0U2V0dGluZyA9IHt9O1xyXG5cclxuICAgIGJhc2VTZXR0aW5nczogSGlla25CYXNlU2V0dGluZyA9IHt9O1xyXG4gICAgcHJvbXB0U2V0dGluZ3M6IEhpZWtuUHJvbXB0U2V0dGluZyA9IHt9O1xyXG4gICAgZmlsdGVyU2V0dGluZ3M6IEhpZWtuTmV0Q2hhcnRGaWx0ZXJTZXR0aW5nID0ge307XHJcbiAgICBpbmZvYm94U2V0dGluZ3M6IEhpZWtuTmV0Q2hhcnRJbmZvYm94U2V0dGluZyA9IHt9O1xyXG4gICAgbG9hZGVyU2V0dGluZ3M6IEhpZWtuTmV0Q2hhcnRMb2FkZXJTZXR0aW5nID0ge307XHJcbiAgICBub2RlU2V0dGluZ3M6IEhpZWtuTmV0Q2hhcnROb2RlU2V0dGluZyA9IHt9O1xyXG4gICAgc2NoZW1hU2V0dGluZ3M6IEhpZWtuU2NoZW1hU2V0dGluZyA9IHt9O1xyXG4gICAgaW5pdFNldHRpbmdzOiBIaWVrbk5ldENoYXJ0SW5pdFNldHRpbmcgPSB7fTtcclxuICAgIGRlZmF1bHRUZ2MyT3B0aW9uczogYW55ID0ge307XHJcbiAgICB0Z2MyU2V0dGluZ3M6IEhpZWtuVGdjMlNldHRpbmc7XHJcblxyXG4gICAgdGdjMjogVGdjMjtcclxuICAgIHRnYzJGaWx0ZXI6IFRnYzJGaWx0ZXI7XHJcbiAgICB0Z2MyQ3J1bWI6IFRnYzJDcnVtYjtcclxuICAgIHRnYzJGaW5kOiBUZ2MyRmluZDtcclxuICAgIHRnYzJMZWdlbmQ6IFRnYzJMZWdlbmQ7XHJcblxyXG4gICAgaW5mb2JveFNlcnZpY2U6IEhpZWtuU0RLSW5mb2JveDtcclxuICAgIGxlZ2VuZEZpbHRlcjogeyBba2V5OiBudW1iZXJdOiBib29sZWFuIH07XHJcbiAgICBsYXlvdXRTdGF0dXM6IGJvb2xlYW47XHJcbiAgICBjZW50ZXJOb2RlOiBJdGVtc0NoYXJ0Tm9kZTtcclxuICAgIGNlbnRlck5vZGVSYWRpdXM6IG51bWJlcjtcclxuICAgIGRlZmF1bHRDb2xvcjogc3RyaW5nID0gJyMwMGIzOGEnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhpZWtuTmV0Q2hhcnRTZXR0aW5nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLmJlZm9yZUluaXQob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZChzdGFydEluZm86IEhpZWtuVHlwZVN0YXJ0SW5mbykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0luaXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghc3RhcnRJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaEluaXQodGhpcy5pbml0U2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRnYzIubG9hZChzdGFydEluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkKHN0YXJ0SW5mbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAzMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJlZm9yZUluaXQob3B0aW9uczogSGlla25OZXRDaGFydFNldHRpbmcpIHtcclxuICAgICAgICB0aGlzLmlzSW5pdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYmFzZVNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBiYXNlVXJsOiBvcHRpb25zLmJhc2VVcmwsXHJcbiAgICAgICAgICAgIGRhdGFGaWx0ZXI6IG9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgZm9ybURhdGE6IG9wdGlvbnMuZm9ybURhdGEgfHwge30sXHJcbiAgICAgICAgICAgIHF1ZXJ5RGF0YTogb3B0aW9ucy5xdWVyeURhdGEgfHwge31cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZmlsdGVyU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkQXR0czogb3B0aW9ucy5zZWxlY3RlZEF0dHMsXHJcbiAgICAgICAgICAgIHNlbGVjdGVkVHlwZXM6IG9wdGlvbnMuc2VsZWN0ZWRUeXBlc1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5pbmZvYm94U2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2VsZWN0b3I6IG9wdGlvbnMuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgIGltYWdlUHJlZml4OiBvcHRpb25zLmltYWdlUHJlZml4LFxyXG4gICAgICAgICAgICBrZ05hbWU6IG9wdGlvbnMua2dOYW1lXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLmluZm9ib3hTZXR0aW5ncywgdGhpcy5iYXNlU2V0dGluZ3MsIG9wdGlvbnMuaW5mb2JveFNldHRpbmcpO1xyXG4gICAgICAgIHRoaXMubG9hZGVyU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBvcHRpb25zLnNlbGVjdG9yLFxyXG4gICAgICAgICAgICBmb3JtRGF0YToge2tnTmFtZTogb3B0aW9ucy5rZ05hbWV9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLmxvYWRlclNldHRpbmdzLCB0aGlzLmJhc2VTZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5ub2RlU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGF1dG9VcGRhdGVTdHlsZTogdHlwZW9mIChvcHRpb25zLmF1dG9VcGRhdGVTdHlsZSkgPT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5hdXRvVXBkYXRlU3R5bGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBpbWFnZVByZWZpeDogb3B0aW9ucy5pbWFnZVByZWZpeCxcclxuICAgICAgICAgICAgaW1hZ2VzOiBvcHRpb25zLmltYWdlcyxcclxuICAgICAgICAgICAgbm9kZUNvbG9yczogb3B0aW9ucy5ub2RlQ29sb3JzLFxyXG4gICAgICAgICAgICB0ZXh0Q29sb3JzOiBvcHRpb25zLnRleHRDb2xvcnMsXHJcbiAgICAgICAgICAgIG1pblJhZGl1czogb3B0aW9ucy5taW5SYWRpdXMgfHwgMTAsXHJcbiAgICAgICAgICAgIGxlZ2VuZENsYXNzOiBudWxsLFxyXG4gICAgICAgICAgICBsZWdlbmRDb2xvcjogbnVsbFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5wcm9tcHRTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAga2dOYW1lOiBvcHRpb25zLmtnTmFtZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcy5wcm9tcHRTZXR0aW5ncywgdGhpcy5iYXNlU2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuaW5pdFNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBmb3JtRGF0YToge2tnTmFtZTogb3B0aW9ucy5rZ05hbWV9LFxyXG4gICAgICAgICAgICB0aGF0OiAkKG9wdGlvbnMuc2VsZWN0b3IpWzBdXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLmluaXRTZXR0aW5ncywgdGhpcy5iYXNlU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICB0aGlzLmxlZ2VuZEZpbHRlciA9IHt9O1xyXG4gICAgICAgIHRoaXMubGF5b3V0U3RhdHVzID0gb3B0aW9ucy5sYXlvdXRTdGF0dXM7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLnNjaGVtYSkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQob3B0aW9ucywgb3B0aW9ucy5zY2hlbWEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZW1hU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICBrZ05hbWU6IG9wdGlvbnMua2dOYW1lLFxyXG4gICAgICAgICAgICAgICAgdGhhdDogJChvcHRpb25zLnNlbGVjdG9yKVswXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLnNjaGVtYVNldHRpbmdzLCB0aGlzLmJhc2VTZXR0aW5ncywgb3B0aW9ucy5zY2hlbWFTZXR0aW5nKTtcclxuICAgICAgICAgICAgdGhpcy5zY2hlbWFTZXR0aW5ncy5zdWNjZXNzID0gKHNjaGVtYTogSGlla25TY2hlbWEpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdChvcHRpb25zLCBzY2hlbWEpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBIaWVrblNES1NjaGVtYS5sb2FkKHRoaXMuc2NoZW1hU2V0dGluZ3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ3JhcGhJbml0KG9wdGlvbnM6IEhpZWtuTmV0Q2hhcnRJbml0U2V0dGluZykge1xyXG4gICAgICAgIGNvbnN0IHF1ZXJ5RGF0YSA9IG9wdGlvbnMucXVlcnlEYXRhIHx8IHt9O1xyXG4gICAgICAgIGxldCBmb3JtRGF0YSA9IG9wdGlvbnMuZm9ybURhdGEgfHwge307XHJcbiAgICAgICAgZm9ybURhdGEuaXNUaW1pbmcgPSB0aGlzLmlzVGltaW5nO1xyXG4gICAgICAgIEhpZWtuU0RLVXRpbHMuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogSGlla25TREtVdGlscy5idWlsZFVybChvcHRpb25zLmJhc2VVcmwgKyAnZ3JhcGgvaW5pdCcsIHF1ZXJ5RGF0YSksXHJcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcclxuICAgICAgICAgICAgZGF0YTogZm9ybURhdGEsXHJcbiAgICAgICAgICAgIGRhdGFGaWx0ZXI6IG9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5zdWNjZXNzKGRhdGFbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdlbnRJbmZvYm94KG9wdGlvbnM6IEhpZWtuTmV0Q2hhcnRJbmZvYm94U2V0dGluZykge1xyXG4gICAgICAgIG9wdGlvbnMuZm9ybURhdGEuaXNSZWxhdGlvbkF0dHMgPSB0eXBlb2YgKG9wdGlvbnMuZm9ybURhdGEuaXNSZWxhdGlvbkF0dHMpID09ICdib29sZWFuJyA/IG9wdGlvbnMuZm9ybURhdGEuaXNSZWxhdGlvbkF0dHMgOiB0cnVlO1xyXG4gICAgICAgIHRoaXMuaW5mb2JveFNlcnZpY2UgPSBuZXcgSGlla25TREtJbmZvYm94KG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuaW5mb2JveFNlcnZpY2UuaW5pdEV2ZW50KCQob3B0aW9ucy5zZWxlY3RvcikpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBpbmZvYm94KGRhdGE6IGFueSwgbm9kZTogYW55LCBjYWxsYmFjazogRnVuY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChub2RlLmRldGFpbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhub2RlLmRldGFpbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pbmZvYm94U2VydmljZS5sb2FkKGRhdGEuaWQsIChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB0aGlzLmluZm9ib3hTZXJ2aWNlLmJ1aWxkSW5mb2JveChkYXRhKVswXS5vdXRlckhUTUw7XHJcbiAgICAgICAgICAgICAgICBub2RlLmRldGFpbCA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBpbml0KG9wdGlvbnM6IEhpZWtuTmV0Q2hhcnRTZXR0aW5nLCBzY2hlbWE6IEhpZWtuU2NoZW1hKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuYXV0b0NvbG9yKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xvcnM6IEhpZWtuVHlwZVVuaW9uTWFwID0ge307XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiBzY2hlbWEudHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbG9yc1tzY2hlbWEudHlwZXNbaV0ua10gPSBIaWVrblNES1V0aWxzLmNvbG9yW3BhcnNlSW50KGkpICUgSGlla25TREtVdGlscy5jb2xvci5sZW5ndGhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGNvbG9ycywgdGhpcy5ub2RlU2V0dGluZ3Mubm9kZUNvbG9ycyB8fCB7fSk7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZVNldHRpbmdzLm5vZGVDb2xvcnMgPSBjb2xvcnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGVmYXVsdFRnYzJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZWxlY3Rvcjogb3B0aW9ucy5zZWxlY3RvcixcclxuICAgICAgICAgICAgZmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzOiBIaWVrblNES05ldENoYXJ0LmJ1aWxkRmlsdGVyKHNjaGVtYSwgdGhpcy5maWx0ZXJTZXR0aW5ncylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY3J1bWI6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaW5kOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLm5vZGVTZXR0aW5ncy5ub2RlQ29sb3JzIHx8IHt9LFxyXG4gICAgICAgICAgICAgICAgbGVnZW5kRHJhdzogdGhpcy5sZWdlbmREcmF3KHNjaGVtYSwgb3B0aW9ucy5sZWdlbmRUeXBlKSxcclxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZWdlbmRDbGljayhlKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkRibENsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kRGJsQ2xpY2soZSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyOiAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kTW91c2VFbnRlcihlKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU6IChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZWdlbmRNb3VzZUxlYXZlKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuZXRDaGFydDoge1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVGaWx0ZXI6IChub2RlRGF0YTogSGlla25OZXRDaGFydERhdGFOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ub2RlRmlsdGVyKG5vZGVEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZU1lbnU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHNGdW5jdGlvbjogKGRhdGE6IGFueSwgbm9kZTogYW55LCBjYWxsYmFjazogRnVuY3Rpb24pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluZm9ib3goZGF0YSwgbm9kZSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBvcHRpb25zLmRpc3BsYXkgfHwgJ2NpcmNsZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVN0eWxlRnVuY3Rpb246IHRoaXMubm9kZVN0eWxlRnVuY3Rpb24odGhpcy5ub2RlU2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtDb250ZW50c0Z1bmN0aW9uOiBIaWVrblNES05ldENoYXJ0LmxpbmtDb250ZW50c0Z1bmN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBsb2FkZXI6IHRoaXMubG9hZGVyKHRoaXMubG9hZGVyU2V0dGluZ3MsIHNjaGVtYSlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuYnVpbGRQcml2YXRlU2V0dGluZyhzY2hlbWEpO1xyXG4gICAgICAgIHRoaXMudGdjMkZpbHRlciA9IG5ldyBUZ2MyRmlsdGVyKHRoaXMudGdjMiwgdGhpcy50Z2MyU2V0dGluZ3MuZmlsdGVyKTtcclxuICAgICAgICB0aGlzLnRnYzJDcnVtYiA9IG5ldyBUZ2MyQ3J1bWIodGhpcy50Z2MyLCB0aGlzLnRnYzJTZXR0aW5ncy5jcnVtYik7XHJcbiAgICAgICAgdGhpcy50Z2MyRmluZCA9IG5ldyBUZ2MyRmluZCh0aGlzLnRnYzIsIHRoaXMudGdjMlNldHRpbmdzLmZpbmQpO1xyXG4gICAgICAgIHRoaXMudGdjMkxlZ2VuZCA9IG5ldyBUZ2MyTGVnZW5kKHRoaXMudGdjMiwgdGhpcy50Z2MyU2V0dGluZ3MubGVnZW5kKTtcclxuICAgICAgICB0aGlzLmluZm9ib3hTZXR0aW5ncy5lbmFibGUgJiYgdGhpcy5nZW50SW5mb2JveCh0aGlzLmluZm9ib3hTZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy50Z2MyLmluaXQoKTtcclxuICAgICAgICB0aGlzLmlzSW5pdCA9IHRydWU7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc3RhcnRJbmZvKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZChvcHRpb25zLnN0YXJ0SW5mbyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBsZWdlbmQoc2NoZW1hOiBIaWVrblNjaGVtYSkge1xyXG4gICAgICAgIGxldCB0eXBlT2JqID0ge307XHJcbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIHNjaGVtYS50eXBlcykge1xyXG4gICAgICAgICAgICB0eXBlT2JqW3R5cGUua10gPSB0eXBlLnY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuICc8aSBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyB2YWx1ZSArICdcIj48L2k+PHNwYW4gdGl0bGU9XCInICsgdHlwZU9ialtrZXldICsgJ1wiPicgKyB0eXBlT2JqW2tleV0gKyAnPC9zcGFuPic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBsZWdlbmRDbGljayhlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgY29uc3QgJG9iaiA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAkb2JqLnRvZ2dsZUNsYXNzKCdvZmYnKTtcclxuICAgICAgICB0aGlzLmxlZ2VuZEZpbHRlclskb2JqLmRhdGEoJ2tleScpXSA9ICRvYmouaGFzQ2xhc3MoJ29mZicpO1xyXG4gICAgICAgIHRoaXMudGdjMi5uZXRDaGFydC51cGRhdGVGaWx0ZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGxlZ2VuZERibENsaWNrKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICBjb25zdCAkb2JqID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIGNvbnN0IG90aGVycyA9ICRvYmoucmVtb3ZlQ2xhc3MoJ29mZicpLnNpYmxpbmdzKCk7XHJcbiAgICAgICAgb3RoZXJzLmFkZENsYXNzKCdvZmYnKTtcclxuICAgICAgICBjb25zdCBjbGFzc0lkID0gJG9iai5kYXRhKCdrZXknKTtcclxuICAgICAgICB0aGlzLmxlZ2VuZEZpbHRlciA9IHt9O1xyXG4gICAgICAgIHRoaXMubGVnZW5kRmlsdGVyW2NsYXNzSWRdID0gZmFsc2U7XHJcbiAgICAgICAgb3RoZXJzLmVhY2goKGk6IG51bWJlciwgdjogSFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5sZWdlbmRGaWx0ZXJbJCh2KS5kYXRhKCdrZXknKV0gPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudGdjMi5uZXRDaGFydC51cGRhdGVGaWx0ZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGxlZ2VuZERyYXcoc2NoZW1hOiBIaWVrblNjaGVtYSwgbGVnZW5kVHlwZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHR5cGVPYmogPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2Ygc2NoZW1hLnR5cGVzKSB7XHJcbiAgICAgICAgICAgIHR5cGVPYmpbdHlwZS5rXSA9IHR5cGUudjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChkYXRhOiBhbnksICRjb250YWluZXI6IEpRdWVyeSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmxlZ2VuZEZpbHRlciA9IHt9O1xyXG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IF8uZmlsdGVyKHRoaXMudGdjMi5nZXRBdmFpbGFibGVEYXRhKCkubm9kZXMsIChuOiBUZ2MyRGF0YU5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhbi5oaWRkZW47XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25zdCBjbGFzc0lkcyA9IF8ua2V5cyhfLmdyb3VwQnkobm9kZXMsICdjbGFzc0lkJykpO1xyXG4gICAgICAgICAgICAvLyBjb25zdCAkZmFiQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImxlZ2VuZC1mYWItY29udGFpbmVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIC8vICRjb250YWluZXIuaHRtbCgkZmFiQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgaWYgKGxlZ2VuZFR5cGUgPT0gJ2ZhYicpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGtleSkgJiYgXy5pbmRleE9mKGNsYXNzSWRzLCBrZXkpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHR5cGVPYmpba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gMykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9ICc8ZGl2IHRpdGxlPVwiJyArIHRleHQgKyAnXCI+PGRpdj4nICsgdGV4dC5zdWJzdHJpbmcoMCwgMikgKyAnPC9kaXY+PGRpdiBjbGFzcz1cImxpbmUtaGlkZGVuXCI+JyArIHRleHQuc3Vic3RyaW5nKDIpICsgJzwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gJzxkaXYgY2xhc3M9XCJsaW5lLWhpZGRlblwiIHRpdGxlPVwiJyArIHRleHQgKyAnXCI+JyArIHRleHQgKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6IGh0bWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tleSc6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBkYXRhW2tleV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kJzogZGF0YVtrZXldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2xvcic6ICcjZmZmJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljayc6IChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kQ2xpY2soZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbW91c2VlbnRlcic6IChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGVnZW5kTW91c2VFbnRlcihlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtb3VzZWxlYXZlJzogKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sZWdlbmRNb3VzZUxlYXZlKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RibGNsaWNrJzogKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sZWdlbmREYmxDbGljayhlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGZhYiA9IG5ldyBoaWVrbmpzLmZhYih7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyOiAkY29udGFpbmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogODAsXHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGU6IDkwLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5nbGU6IDkwLFxyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTdGF0dXM6IHRoaXMubGF5b3V0U3RhdHVzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1haW46IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogJ+WbvuS+iycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiB0aGlzLmRlZmF1bHRDb2xvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2ZmZidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpY2snOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXlvdXRTdGF0dXMgPSAhdGhpcy5sYXlvdXRTdGF0dXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBmYWIucnVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLmh0bWwoJycpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGtleSkgJiYgXy5pbmRleE9mKGNsYXNzSWRzLCBrZXkpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgJG9iaiA9ICQoJzxkaXYgY2xhc3M9XCJ0Z2MyLWxlZ2VuZC1pdGVtIHRnYzItbGVnZW5kLWl0ZW0tJyArIGtleSArICdcIj48L2Rpdj4nKS5kYXRhKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdrZXknOiBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBkYXRhW2tleV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuYXBwZW5kKCRvYmouaHRtbCgnPGkgc3R5bGU9XCJiYWNrZ3JvdW5kOiAnICsgZGF0YVtrZXldICsgJ1wiPjwvaT48c3BhbiB0aXRsZT1cIicgKyB0eXBlT2JqW2tleV0gKyAnXCI+JyArIHR5cGVPYmpba2V5XSArICc8L3NwYW4+JykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGVnZW5kTW91c2VFbnRlcihlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgY29uc3QgJG9iaiA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAkb2JqLmFkZENsYXNzKCdhY3RpdmUnKS5zaWJsaW5ncygpLmFkZENsYXNzKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMubm9kZVNldHRpbmdzLmxlZ2VuZENsYXNzID0gJG9iai5kYXRhKCdrZXknKTtcclxuICAgICAgICB0aGlzLm5vZGVTZXR0aW5ncy5sZWdlbmRDb2xvciA9ICRvYmouZGF0YSgndmFsdWUnKTtcclxuICAgICAgICB0aGlzLnRnYzIubmV0Q2hhcnQudXBkYXRlU3R5bGUoKTtcclxuICAgICAgICAvLyBjb25zdCBub2RlcyA9IF8uZmlsdGVyKHRoaXMudGdjMi5nZXRBdmFpbGFibGVEYXRhKCkubm9kZXMsIChuKT0+IHtcclxuICAgICAgICAvLyAgICAgcmV0dXJuICFuLmhpZGRlbiAmJiAoPEhpZWtuTmV0Q2hhcnREYXRhTm9kZT5uKS5jbGFzc0lkID09ICRvYmouZGF0YSgna2V5Jyk7XHJcbiAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgLy8gY29uc3QgaWRzID0gXy5rZXlzKF8uZ3JvdXBCeShub2RlcywgJ2lkJykpO1xyXG4gICAgICAgIC8vIHRoaXMudGdjMi5uZXRDaGFydC5zY3JvbGxJbnRvVmlldyhpZHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBsZWdlbmRNb3VzZUxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICBjb25zdCAkb2JqID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICRvYmoucmVtb3ZlQ2xhc3MoJ2FjdGl2ZSBpbmFjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZSBpbmFjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMubm9kZVNldHRpbmdzLmxlZ2VuZENsYXNzID0gbnVsbDtcclxuICAgICAgICB0aGlzLm5vZGVTZXR0aW5ncy5sZWdlbmRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50Z2MyLm5ldENoYXJ0LnVwZGF0ZVN0eWxlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGxvYWRlcihvcHRpb25zOiBIaWVrbk5ldENoYXJ0TG9hZGVyU2V0dGluZywgc2NoZW1hOiBIaWVrblNjaGVtYSkge1xyXG4gICAgICAgIHJldHVybiAoJHNlbGY6IGFueSwgY2FsbGJhY2s6IEZ1bmN0aW9uLCBmYWlsZWQ6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtczogYW55ID0gdGhpcy5idWlsZExvYWRlclBhcmFtcyhvcHRpb25zKTtcclxuICAgICAgICAgICAgSGlla25TREtVdGlscy5hamF4KHtcclxuICAgICAgICAgICAgICAgIHVybDogSGlla25TREtVdGlscy5idWlsZFVybChvcHRpb25zLmJhc2VVcmwgKyBwYXJhbXMudXJsLCBwYXJhbXMucXVlcnlEYXRhKSxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcy5mb3JtRGF0YSxcclxuICAgICAgICAgICAgICAgIGRhdGFGaWx0ZXI6IG9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gSGlla25TREtOZXRDaGFydC5kZWFsR3JhcGhEYXRhKGRhdGEsIHNjaGVtYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbGVkKCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGhhdDogJChvcHRpb25zLnNlbGVjdG9yKS5maW5kKCcudGdjMi1uZXRjaGFydC1jb250YWluZXInKVswXVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG5vZGVGaWx0ZXIobm9kZURhdGE6IEhpZWtuTmV0Q2hhcnREYXRhTm9kZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRnYzIuaW5TdGFydChub2RlRGF0YS5pZCkgfHwgIXRoaXMubGVnZW5kRmlsdGVyW25vZGVEYXRhLmNsYXNzSWRdO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBub2RlU3R5bGVGdW5jdGlvbihvcHRpb25zOiBIaWVrbk5ldENoYXJ0Tm9kZVNldHRpbmcpIHtcclxuICAgICAgICBpZiAob3B0aW9ucy5hdXRvVXBkYXRlU3R5bGUpIHtcclxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTdHlsZSgpO1xyXG4gICAgICAgICAgICB9LCAzMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAobm9kZTogVGdjMkNoYXJ0Tm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gPEhpZWtuTmV0Q2hhcnREYXRhTm9kZT5ub2RlLmRhdGE7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzSWQgPSBkYXRhLmNsYXNzSWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVJZHMgPSB0aGlzLnRnYzIuZ2V0RW1waGFzZXNOb2RlKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRnYzJOZXRDaGFydFNldHRpbmcgPSB0aGlzLnRnYzIuc2V0dGluZ3MubmV0Q2hhcnQ7XHJcbiAgICAgICAgICAgIG5vZGUubGFiZWwgPSBub2RlLmRhdGEubmFtZTtcclxuICAgICAgICAgICAgbm9kZS5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgICAgICBub2RlLmZpbGxDb2xvciA9IG5vZGUuZGF0YS5jb2xvciB8fCB0Z2MyTmV0Q2hhcnRTZXR0aW5nLm5vZGVEZWZhdWx0Q29sb3IgfHwgbm9kZS5maWxsQ29sb3I7XHJcbiAgICAgICAgICAgIG5vZGUubGFiZWxTdHlsZS50ZXh0U3R5bGUuZm9udCA9ICcxOHB4IE1pY3Jvc29mdCBZYWhlaSc7XHJcbiAgICAgICAgICAgIG5vZGUuYXVyYSA9IG5vZGUuZGF0YS5hdXJhcztcclxuICAgICAgICAgICAgaWYgKHRoaXMudGdjMi5pblN0YXJ0KG5vZGUuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnJhZGl1cyA9IDUwO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5maWxsQ29sb3IgPSB0Z2MyTmV0Q2hhcnRTZXR0aW5nLmVtcGhhc2VzQ29sb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5vZGVJZHNbbm9kZS5pZF0pIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuZmlsbENvbG9yID0gdGdjMk5ldENoYXJ0U2V0dGluZy5lbXBoYXNlc0NvbG9yO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5sYWJlbCA9IG5vZGUuZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yYWRpdXMgPSBub2RlLnJhZGl1cyAqIDEuNTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghJC5pc0VtcHR5T2JqZWN0KG5vZGVJZHMpKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmZpbGxDb2xvciA9IHRnYzJOZXRDaGFydFNldHRpbmcucmVkdWNlQ29sb3I7XHJcbiAgICAgICAgICAgICAgICBub2RlLnJhZGl1cyA9IG5vZGUucmFkaXVzICogMC41O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGUuaW1hZ2VDcm9wcGluZyA9ICdmaXQnO1xyXG4gICAgICAgICAgICBpZiAoISQuaXNFbXB0eU9iamVjdChub2RlSWRzKSB8fCBvcHRpb25zLmxlZ2VuZENsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZUlkc1tub2RlLmlkXSB8fCBvcHRpb25zLmxlZ2VuZENsYXNzID09IGRhdGEuY2xhc3NJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmFkaXVzID0gbm9kZS5yYWRpdXMgKiAxLjU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZmlsbENvbG9yID0gdGhpcy50Z2MyLnNldHRpbmdzLm5ldENoYXJ0LnJlZHVjZUNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUubGFiZWwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBub2RlLmxpbmVDb2xvciA9IG5vZGUuZmlsbENvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmFkaXVzID0gbm9kZS5yYWRpdXMgKiAwLjU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50Z2MyLmluU3RhcnQobm9kZS5pZCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZmlsbENvbG9yID0gZGF0YS5jb2xvciB8fCAnI2ZmZic7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5saW5lQ29sb3IgPSB0aGlzLmRlZmF1bHRDb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ob3ZlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZmlsbENvbG9yID0gbm9kZS5saW5lQ29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2hhZG93Qmx1ciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm5vZGVDb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gPHN0cmluZz5IaWVrblNES05ldENoYXJ0LmdldEhpZWtuVHlwZVVuaW9uTWFwVmFsdWUob3B0aW9ucy5ub2RlQ29sb3JzW2NsYXNzSWRdKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KG5vZGVJZHMpIHx8IG9wdGlvbnMubGVnZW5kQ2xhc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVJZHNbbm9kZS5pZF0gfHwgb3B0aW9ucy5sZWdlbmRDbGFzcyA9PSBjbGFzc0lkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmZpbGxDb2xvciA9IG9wdGlvbnMubGVnZW5kQ29sb3IgfHwgdGhpcy50Z2MyLnNldHRpbmdzLm5ldENoYXJ0LmVtcGhhc2VzQ29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxpbmVDb2xvciA9IG5vZGUuZmlsbENvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudGdjMi5pblN0YXJ0KG5vZGUuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmZpbGxDb2xvciA9IHRoaXMudGdjMi5zZXR0aW5ncy5uZXRDaGFydC5lbXBoYXNlc0NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5saW5lQ29sb3IgPSBub2RlLmZpbGxDb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubGluZUNvbG9yID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuaW1hZ2VQcmVmaXggJiYgIW9wdGlvbnMuaW1hZ2VzICYmICFkYXRhLmltZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZmlsbENvbG9yID0gbm9kZS5saW5lQ29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ob3ZlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5maWxsQ29sb3IgPSBub2RlLmxpbmVDb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5pbWcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmltZy5pbmRleE9mKCdodHRwJykgIT0gMCAmJiBvcHRpb25zLmltYWdlUHJlZml4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pbWFnZSA9IEhpZWtuU0RLVXRpbHMucWluaXVJbWcob3B0aW9ucy5pbWFnZVByZWZpeCArIGRhdGEuaW1nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pbWFnZSA9IGRhdGEuaW1nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gaWYgKCEkLmlzRW1wdHlPYmplY3Qobm9kZUlkcykgfHwgb3B0aW9ucy5sZWdlbmRDbGFzcykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChub2RlSWRzW25vZGUuaWRdIHx8IG9wdGlvbnMubGVnZW5kQ2xhc3MgPT0gY2xhc3NJZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIG5vZGUuaW1hZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmICh0aGlzLnRnYzIuaW5TdGFydChub2RlLmlkKSB8fCBub2RlLmhvdmVyZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBub2RlLmltYWdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgLy8gJiYgISQuaXNFbXB0eU9iamVjdChub2RlSWRzKVxyXG4gICAgICAgICAgICAgICAgLy8gaWYgKCF0aGlzLnRnYzIuaW5TdGFydChub2RlLmlkKVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICYmICFub2RlSWRzW25vZGUuaWRdXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfHwgKG9wdGlvbnMubGVnZW5kQ2xhc3MgJiYgb3B0aW9ucy5sZWdlbmRDbGFzcyAhPT0gY2xhc3NJZCkgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgbm9kZS5pbWFnZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgbm9kZS5maWxsQ29sb3IgPSAnI2ZmZic7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5pbWFnZXMgJiYgb3B0aW9ucy5pbWFnZXNbY2xhc3NJZF0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gPEhpZWtuVHlwZU5FPkhpZWtuU0RLTmV0Q2hhcnQuZ2V0SGlla25UeXBlVW5pb25NYXBWYWx1ZShvcHRpb25zLmltYWdlc1tjbGFzc0lkXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISQuaXNFbXB0eU9iamVjdChub2RlSWRzKSB8fCBvcHRpb25zLmxlZ2VuZENsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlSWRzW25vZGUuaWRdIHx8IG9wdGlvbnMubGVnZW5kQ2xhc3MgPT0gY2xhc3NJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pbWFnZSA9IG9wdGlvbnMubGVnZW5kQ29sb3IgfHwgdmFsdWUuZW1waGFzZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmltYWdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50Z2MyLmluU3RhcnQobm9kZS5pZCkgfHwgbm9kZS5ob3ZlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmltYWdlID0gdmFsdWUuZW1waGFzZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmltYWdlID0gdmFsdWUubm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMudGdjMi5uZXRDaGFydC5nZXROb2RlRGltZW5zaW9ucyhub2RlKS5yYWRpdXM7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9VcGRhdGVTdHlsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJhZGl1cyA8IG9wdGlvbnMubWluUmFkaXVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pbWFnZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZmlsbENvbG9yID0gbm9kZS5saW5lQ29sb3I7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50Z2MyLmluU3RhcnQobm9kZS5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNlbnRlck5vZGVSYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuY2VudGVyTm9kZSAmJiAodGhpcy5jZW50ZXJOb2RlID0gbm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGV4dENvbG9ycykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBIaWVrblNES05ldENoYXJ0LmdldEhpZWtuVHlwZVVuaW9uTWFwVmFsdWUob3B0aW9ucy50ZXh0Q29sb3JzW2NsYXNzSWRdKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbFN0eWxlLnRleHRTdHlsZS5maWxsQ29sb3IgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50Z2MyLmluU3RhcnQobm9kZS5pZCkgfHwgbm9kZUlkc1tub2RlLmlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbFN0eWxlLnRleHRTdHlsZS5maWxsQ29sb3IgPSB2YWx1ZS5lbXBoYXNlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmhvdmVyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsU3R5bGUudGV4dFN0eWxlLmZpbGxDb2xvciA9IHZhbHVlLmVtcGhhc2VzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsU3R5bGUudGV4dFN0eWxlLmZpbGxDb2xvciA9IHZhbHVlLm5vcm1hbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBsZW4gPSBub2RlLmxhYmVsLmxlbmd0aDtcclxuICAgICAgICAgICAgaWYgKG5vZGUuZGlzcGxheSA9PSAncm91bmR0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhYmVsID0gbm9kZS5sYWJlbDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ0NoaW5lc2UgPSBIaWVrblNES1V0aWxzLnJlZ0NoaW5lc2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWdFbmdsaXNoID0gSGlla25TREtVdGlscy5yZWdFbmdsaXNoO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsYWJlbC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGFyID0gbGFiZWwuY2hhckF0KGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYXJOZXh0ID0gbGFiZWwuY2hhckF0KGkgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKHJlZ0NoaW5lc2UudGVzdChjaGFyKSAmJiByZWdFbmdsaXNoLnRlc3QoY2hhck5leHQpKSB8fCAocmVnRW5nbGlzaC50ZXN0KGNoYXIpICYmIHJlZ0NoaW5lc2UudGVzdChjaGFyTmV4dCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbGFiZWwuc3Vic3RyaW5nKDAsIGkgKyAxKSArICcgJyArIGxhYmVsLnN1YnN0cmluZyhpICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2RlLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5sYWJlbC5pbmRleE9mKCcgJykgPCAwICYmIGxlbiA+IDUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuID4gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJMaW5lID0gTWF0aC5mbG9vcihub2RlLmxhYmVsLmxlbmd0aCAvIDMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGxpdDIgPSBsZW4gLSBwZXJMaW5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsID0gbm9kZS5sYWJlbC5zdWJzdHJpbmcoMCwgcGVyTGluZSkgKyAnICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbC5zdWJzdHJpbmcocGVyTGluZSwgc3BsaXQyKSArICcgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsLnN1YnN0cmluZyhzcGxpdDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGVuID4gNSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsID0gbm9kZS5sYWJlbC5zdWJzdHJpbmcoMCwgNCkgKyAnICcgKyBub2RlLmxhYmVsLnN1YnN0cmluZyg0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVN0eWxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNlbnRlck5vZGUpIHtcclxuICAgICAgICAgICAgY29uc3QgcmFkaXVzID0gdGhpcy50Z2MyLm5ldENoYXJ0LmdldE5vZGVEaW1lbnNpb25zKHRoaXMuY2VudGVyTm9kZSkucmFkaXVzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jZW50ZXJOb2RlUmFkaXVzICE9IHJhZGl1cykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLnRnYzIubmV0Q2hhcnQubm9kZXMoKTtcclxuICAgICAgICAgICAgICAgIGxldCBpZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZHMucHVzaChub2RlLmlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMudGdjMi5uZXRDaGFydC51cGRhdGVTdHlsZShpZHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgYnVpbGRGaWx0ZXIoc2NoZW1hOiBIaWVrblNjaGVtYSwgb3B0aW9uczogSGlla25OZXRDaGFydEZpbHRlclNldHRpbmcpIHtcclxuICAgICAgICBsZXQgYWxsb3dBdHRzID0gW107XHJcbiAgICAgICAgbGV0IGFsbG93QXR0c1NlbGVjdGVkID0gW107XHJcbiAgICAgICAgbGV0IGFsbG93VHlwZXMgPSBbXTtcclxuICAgICAgICBsZXQgYWxsb3dUeXBlc1NlbGVjdGVkID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHNjaGVtYS5hdHRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dCA9IHNjaGVtYS5hdHRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoYXR0LnR5cGUgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgYWxsb3dBdHRzLnB1c2goe3ZhbHVlOiBhdHQuaywgbGFiZWw6IGF0dC52fSk7XHJcbiAgICAgICAgICAgICAgICBhbGxvd0F0dHNTZWxlY3RlZC5wdXNoKGF0dC5rKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IGogaW4gc2NoZW1hLnR5cGVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBzY2hlbWEudHlwZXNbal07XHJcbiAgICAgICAgICAgIGFsbG93VHlwZXMucHVzaCh7dmFsdWU6IHR5cGUuaywgbGFiZWw6IHR5cGUudn0pO1xyXG4gICAgICAgICAgICBhbGxvd1R5cGVzU2VsZWN0ZWQucHVzaCh0eXBlLmspO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhbGxvd0F0dHNTZWxlY3RlZCA9IG9wdGlvbnMuc2VsZWN0ZWRBdHRzIHx8IGFsbG93QXR0c1NlbGVjdGVkO1xyXG4gICAgICAgIGFsbG93VHlwZXNTZWxlY3RlZCA9IG9wdGlvbnMuc2VsZWN0ZWRUeXBlcyB8fCBhbGxvd1R5cGVzU2VsZWN0ZWQ7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5OiAnYWxsb3dUeXBlcycsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ+iuvuWumuWIhuaekOS4u+S9kycsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogYWxsb3dUeXBlc1NlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogYWxsb3dUeXBlc1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXk6ICdhbGxvd0F0dHMnLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICforr7lrprliIbmnpDlhbPns7snLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGFsbG93QXR0c1NlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogYWxsb3dBdHRzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBkZWFsR3JhcGhEYXRhKGRhdGE6IGFueSwgc2NoZW1hOiBIaWVrblNjaGVtYSkge1xyXG4gICAgICAgIGRhdGEubm9kZXMgPSBkYXRhLmVudGl0eUxpc3Q7XHJcbiAgICAgICAgZGF0YS5saW5rcyA9IGRhdGEucmVsYXRpb25MaXN0O1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmVudGl0eUxpc3Q7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEucmVsYXRpb25MaXN0O1xyXG4gICAgICAgIGxldCBzY2hlbWFzOiBhbnkgPSB7fTtcclxuICAgICAgICBjb25zdCBhcnIgPSBfLmNvbmNhdChzY2hlbWEudHlwZXMsIHNjaGVtYS5hdHRzKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGt2IG9mIGFycikge1xyXG4gICAgICAgICAgICBzY2hlbWFzW2t2LmtdID0ga3YudjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBkYXRhLm5vZGVzKSB7XHJcbiAgICAgICAgICAgIG5vZGUudHlwZU5hbWUgPSBzY2hlbWFzW25vZGUuY2xhc3NJZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGxpbmsgb2YgZGF0YS5saW5rcykge1xyXG4gICAgICAgICAgICBsaW5rLnR5cGVOYW1lID0gc2NoZW1hc1tsaW5rLmF0dElkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBnZXRIaWVrblR5cGVVbmlvbk1hcFZhbHVlKHZhbHVlOiBIaWVrblR5cGVVbmlvblN0cmluZ05FLCB0eXBlPzogc3RyaW5nKTogSGlla25UeXBlVW5pb25TdHJpbmdORSB7XHJcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlW3R5cGVdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBsaW5rQ29udGVudHNGdW5jdGlvbihsaW5rRGF0YTogVGdjMkRhdGFMaW5rKSB7XHJcbiAgICAgICAgY29uc3QgckluZm8gPSAkLmV4dGVuZCh0cnVlLCBbXSwgKGxpbmtEYXRhLm5SSW5mbyB8fCBbXSksIChsaW5rRGF0YS5vUkluZm8gfHwgW10pKTtcclxuICAgICAgICBpZiAockluZm8pIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW1zID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZCBvZiBySW5mbykge1xyXG4gICAgICAgICAgICAgICAgaXRlbXMgKz0gJzx0cj4nO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qga3ZzID0gZC5rdnM7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGhlYWQgPSAnPHRyPic7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGJvZHkgPSAnPHRyPic7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGogaW4ga3ZzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGt2cy5oYXNPd25Qcm9wZXJ0eShqKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVhZCArPSAnPHRoPjxkaXYgY2xhc3M9XCJsaW5rLWluZm8ta2V5XCI+JyArIGt2c1tqXS5rICsgJzwvZGl2PjwvdGg+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGJvZHkgKz0gJzx0ZD48ZGl2IGNsYXNzPVwibGluay1pbmZvLXZhbHVlXCI+JyArIGt2c1tqXS52ICsgJzwvZGl2PjwvdGQ+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpdGVtcyArPSAnPGxpPjx0YWJsZT48dGhlYWQ+JyArIHRoZWFkICsgJzwvdGhlYWQ+PHRib2R5PicgKyB0Ym9keSArICc8L3Rib2R5PjwvdGFibGU+PC9saT4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAnPHVsIGNsYXNzPVwibGluay1pbmZvXCI+JyArIGl0ZW1zICsgJzwvdWw+JztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbGlua0RhdGEudHlwZU5hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgb3JkZXJSZWxhdGlvbihkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgb2JqID0ge307XHJcbiAgICAgICAgY29uc3QgZnJvbSA9IF8uY291bnRCeShkYXRhLCAnZnJvbScpO1xyXG4gICAgICAgIGNvbnN0IHRvID0gXy5jb3VudEJ5KGRhdGEsICd0bycpO1xyXG4gICAgICAgIGZvciAoY29uc3QgZiBpbiBmcm9tKSB7XHJcbiAgICAgICAgICAgIG9ialtmXSA9IChvYmpbZl0gfHwgMCkgKyAodG9bZl0gfHwgMCkgKyBmcm9tW2ZdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IHQgaW4gdG8pIHtcclxuICAgICAgICAgICAgb2JqW3RdID0gKG9ialt0XSB8fCAwKSArIChmcm9tW3RdIHx8IDApICsgdG9bdF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhcnIgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IG8gaW4gb2JqKSB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKHtrOiBvLCB2OiBvYmpbb119KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF8ub3JkZXJCeShhcnIsICd2JywgJ2Rlc2MnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgYnVpbGRMb2FkZXJQYXJhbXMob3B0aW9uczogSGlla25OZXRDaGFydExvYWRlclNldHRpbmcpOiB7IHF1ZXJ5RGF0YTogYW55LCBmb3JtRGF0YTogYW55LCB1cmw6IHN0cmluZyB9O1xyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBidWlsZFByaXZhdGVTZXR0aW5nKHNjaGVtYTogSGlla25TY2hlbWEpOiB2b2lkO1xyXG5cclxufVxuY2xhc3MgSGlla25TREtHcmFwaCBleHRlbmRzIEhpZWtuU0RLTmV0Q2hhcnQge1xyXG5cclxuICAgIHRnYzJQcm9tcHQ6IFRnYzJQcm9tcHQ7XHJcbiAgICB0Z2MyUGFnZTogVGdjMlBhZ2U7XHJcblxyXG4gICAgcHJvdGVjdGVkIGJ1aWxkUHJpdmF0ZVNldHRpbmcoc2NoZW1hOiBIaWVrblNjaGVtYSkge1xyXG4gICAgICAgIGNvbnN0IGluaXRTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZW50aXR5TGlzdCAmJiBkYXRhLmVudGl0eUxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkKGRhdGEuZW50aXR5TGlzdFswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIHRoaXMuaW5pdFNldHRpbmdzLCBpbml0U2V0dGluZ3MpO1xyXG4gICAgICAgIGNvbnN0IGZpbHRlcnMgPSBbe1xyXG4gICAgICAgICAgICBrZXk6ICdkaXN0YW5jZScsXHJcbiAgICAgICAgICAgIGxhYmVsOiAn6K6+5a6a5pi+56S65bGC5pWwJyxcclxuICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMub3B0aW9ucy5zZWxlY3RlZERpc3RhbmNlIHx8IDEsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IFsxLCAyLCAzXVxyXG4gICAgICAgIH1dLmNvbmNhdCh0aGlzLmRlZmF1bHRUZ2MyT3B0aW9ucy5maWx0ZXIuZmlsdGVycyk7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdFRnYzJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBwcm9tcHQ6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd1Byb21wdEl0ZW06IEhpZWtuU0RLUHJvbXB0LmRyYXdQcm9tcHRJdGVtKHNjaGVtYSksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Qcm9tcHQ6IEhpZWtuU0RLUHJvbXB0Lm9uUHJvbXB0KHRoaXMucHJvbXB0U2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhZ2U6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHBhZ2VTaXplOiAyMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnRnYzJTZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRUZ2MyT3B0aW9ucywgZGVmYXVsdFRnYzJPcHRpb25zLCB0aGlzLm9wdGlvbnMudGdjMlNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnRnYzJTZXR0aW5ncy5maWx0ZXIuZmlsdGVycyA9IGZpbHRlcnM7XHJcbiAgICAgICAgdGhpcy50Z2MyID0gbmV3IFRnYzJHcmFwaCh0aGlzLnRnYzJTZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy50Z2MyUHJvbXB0ID0gbmV3IFRnYzJQcm9tcHQodGhpcy50Z2MyLCB0aGlzLnRnYzJTZXR0aW5ncy5wcm9tcHQpO1xyXG4gICAgICAgIHRoaXMudGdjMlBhZ2UgPSBuZXcgVGdjMlBhZ2UodGhpcy50Z2MyLCB0aGlzLnRnYzJTZXR0aW5ncy5wYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYnVpbGRMb2FkZXJQYXJhbXMob3B0aW9uczogSGlla25OZXRDaGFydExvYWRlclNldHRpbmcpIHtcclxuICAgICAgICBjb25zdCBxdWVyeURhdGEgPSBvcHRpb25zLnF1ZXJ5RGF0YSB8fCB7fTtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSBvcHRpb25zLmZvcm1EYXRhIHx8IHt9O1xyXG4gICAgICAgIGZvcm1EYXRhLmlkID0gdGhpcy50Z2MyLnN0YXJ0SW5mby5pZDtcclxuICAgICAgICBmb3JtRGF0YS5pc1JlbGF0aW9uTWVyZ2UgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLnRnYzJGaWx0ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgZmlsdGVycyA9IHRoaXMudGdjMkZpbHRlci5nZXRGaWx0ZXJPcHRpb25zKCk7XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGZvcm1EYXRhLCBmaWx0ZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudGdjMlBhZ2UpIHtcclxuICAgICAgICAgICAgY29uc3QgcGFnZSA9IHRoaXMudGdjMlBhZ2UucGFnZTtcclxuICAgICAgICAgICAgZm9ybURhdGEucGFnZU5vID0gcGFnZS5wYWdlTm87XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLnBhZ2VTaXplID0gcGFnZS5wYWdlU2l6ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtxdWVyeURhdGE6IHF1ZXJ5RGF0YSwgZm9ybURhdGE6IGZvcm1EYXRhLCB1cmw6ICdncmFwaCd9O1xyXG4gICAgfVxyXG59XG5jbGFzcyBIaWVrblNES1BhdGggZXh0ZW5kcyBIaWVrblNES05ldENoYXJ0IHtcclxuXHJcbiAgICB0Z2MyU3RhdHM6IFRnYzJTdGF0cztcclxuICAgIHRnYzJDb25uZWN0czogVGdjMkNvbm5lY3RzO1xyXG5cclxuICAgIHByb3RlY3RlZCBidWlsZFByaXZhdGVTZXR0aW5nKHNjaGVtYTogSGlla25TY2hlbWEpIHtcclxuICAgICAgICBjb25zdCBpbml0U2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnJlbGF0aW9uTGlzdCAmJiBkYXRhLnJlbGF0aW9uTGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBIaWVrblNES05ldENoYXJ0Lm9yZGVyUmVsYXRpb24oZGF0YS5yZWxhdGlvbkxpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gYXJyWzJdID8gYXJyWzJdLmsgOiBhcnJbMF0uaztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSBhcnJbMV0uaztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWQoe2lkOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSwgc3RhcnQ6IHsnaWQnOiBzdGFydH0sIGVuZDogeydpZCc6IGVuZH19KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcy5pbml0U2V0dGluZ3MsIGluaXRTZXR0aW5ncyk7XHJcbiAgICAgICAgY29uc3QgZmlsdGVycyA9IFt7XHJcbiAgICAgICAgICAgIGtleTogJ2Rpc3RhbmNlJyxcclxuICAgICAgICAgICAgbGFiZWw6ICforr7lrprliIbmnpDmraXplb8nLFxyXG4gICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5vcHRpb25zLnNlbGVjdGVkRGlzdGFuY2UgfHwgMyxcclxuICAgICAgICAgICAgb3B0aW9uczogWzMsIDQsIDUsIDZdXHJcbiAgICAgICAgfV0uY29uY2F0KHRoaXMuZGVmYXVsdFRnYzJPcHRpb25zLmZpbHRlci5maWx0ZXJzKTtcclxuICAgICAgICBjb25zdCBkZWZhdWx0VGdjMk9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHN0YXRzOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGF0dHM6IHNjaGVtYS5hdHRzLFxyXG4gICAgICAgICAgICAgICAgdHlwZXM6IHNjaGVtYS50eXBlcyxcclxuICAgICAgICAgICAgICAgIHN0YXRzQ29uZmlnOiB0aGlzLm9wdGlvbnMuc3RhdHNDb25maWdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29ubmVjdHM6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG1vZGU6ICdjbGljaydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhdGg6IHtcclxuICAgICAgICAgICAgICAgIHByb21wdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdQcm9tcHRJdGVtOiBIaWVrblNES1Byb21wdC5kcmF3UHJvbXB0SXRlbShzY2hlbWEpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvblByb21wdDogSGlla25TREtQcm9tcHQub25Qcm9tcHQodGhpcy5wcm9tcHRTZXR0aW5ncylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMudGdjMlNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdFRnYzJPcHRpb25zLCBkZWZhdWx0VGdjMk9wdGlvbnMsIHRoaXMub3B0aW9ucy50Z2MyU2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMudGdjMlNldHRpbmdzLmZpbHRlci5maWx0ZXJzID0gZmlsdGVycztcclxuICAgICAgICB0aGlzLnRnYzIgPSBuZXcgVGdjMlBhdGgodGhpcy50Z2MyU2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMudGdjMlN0YXRzID0gbmV3IFRnYzJTdGF0cyh0aGlzLnRnYzIsIHRoaXMudGdjMlNldHRpbmdzLnN0YXRzKTtcclxuICAgICAgICB0aGlzLnRnYzJDb25uZWN0cyA9IG5ldyBUZ2MyQ29ubmVjdHModGhpcy50Z2MyLCB0aGlzLnRnYzJTZXR0aW5ncy5jb25uZWN0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJ1aWxkTG9hZGVyUGFyYW1zKG9wdGlvbnM6IEhpZWtuTmV0Q2hhcnRMb2FkZXJTZXR0aW5nKSB7XHJcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gb3B0aW9ucy5xdWVyeURhdGEgfHwge307XHJcbiAgICAgICAgbGV0IGZvcm1EYXRhID0gb3B0aW9ucy5mb3JtRGF0YSB8fCB7fTtcclxuICAgICAgICBmb3JtRGF0YS5zdGFydCA9ICg8VGdjMlBhdGhTdGFydEluZm8+dGhpcy50Z2MyLnN0YXJ0SW5mbykuc3RhcnQuaWQ7XHJcbiAgICAgICAgZm9ybURhdGEuZW5kID0gKDxUZ2MyUGF0aFN0YXJ0SW5mbz50aGlzLnRnYzIuc3RhcnRJbmZvKS5lbmQuaWQ7XHJcbiAgICAgICAgZm9ybURhdGEuaXNTaG9ydGVzdCA9IHRydWU7XHJcbiAgICAgICAgZm9ybURhdGEuY29ubmVjdHNDb21wdXRlID0gdHJ1ZTtcclxuICAgICAgICBmb3JtRGF0YS5zdGF0c0NvbXB1dGUgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLnRnYzJGaWx0ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgZmlsdGVycyA9IHRoaXMudGdjMkZpbHRlci5nZXRGaWx0ZXJPcHRpb25zKCk7XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGZvcm1EYXRhLCBmaWx0ZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudGdjMlN0YXRzKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLnN0YXRzQ29uZmlnID0gdGhpcy50Z2MyU3RhdHMuZ2V0U3RhdHNDb25maWcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtxdWVyeURhdGE6IHF1ZXJ5RGF0YSwgZm9ybURhdGE6IGZvcm1EYXRhLCB1cmw6ICdwYXRoJ307XHJcbiAgICB9XHJcbn1cclxuXG5jbGFzcyBIaWVrblNES1JlbGF0aW9uIGV4dGVuZHMgSGlla25TREtOZXRDaGFydCB7XHJcblxyXG4gICAgdGdjMlN0YXRzOiBUZ2MyU3RhdHM7XHJcbiAgICB0Z2MyQ29ubmVjdHM6IFRnYzJDb25uZWN0cztcclxuXHJcbiAgICBwcm90ZWN0ZWQgYnVpbGRQcml2YXRlU2V0dGluZyhzY2hlbWE6IEhpZWtuU2NoZW1hKSB7XHJcbiAgICAgICAgY29uc3QgaW5pdFNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5yZWxhdGlvbkxpc3QgJiYgZGF0YS5yZWxhdGlvbkxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJyID0gSGlla25TREtOZXRDaGFydC5vcmRlclJlbGF0aW9uKGRhdGEucmVsYXRpb25MaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGkgaW4gYXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChpKSA8IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goe2lkOiBhcnJbaV0ua30pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZCh7aWQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLCBub2Rlczogbm9kZXN9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcy5pbml0U2V0dGluZ3MsIGluaXRTZXR0aW5ncyk7XHJcbiAgICAgICAgY29uc3QgZmlsdGVycyA9IFt7XHJcbiAgICAgICAgICAgIGtleTogJ2Rpc3RhbmNlJyxcclxuICAgICAgICAgICAgbGFiZWw6ICforr7lrprliIbmnpDmraXplb8nLFxyXG4gICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5vcHRpb25zLnNlbGVjdGVkRGlzdGFuY2UgfHwgMyxcclxuICAgICAgICAgICAgb3B0aW9uczogWzMsIDQsIDUsIDZdXHJcbiAgICAgICAgfV0uY29uY2F0KHRoaXMuZGVmYXVsdFRnYzJPcHRpb25zLmZpbHRlci5maWx0ZXJzKTtcclxuICAgICAgICBjb25zdCBkZWZhdWx0VGdjMk9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHN0YXRzOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGF0dHM6IHNjaGVtYS5hdHRzLFxyXG4gICAgICAgICAgICAgICAgdHlwZXM6IHNjaGVtYS50eXBlcyxcclxuICAgICAgICAgICAgICAgIHN0YXRzQ29uZmlnOiB0aGlzLm9wdGlvbnMuc3RhdHNDb25maWdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29ubmVjdHM6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG1vZGU6ICdjbGljaydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbGF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3UHJvbXB0SXRlbTogSGlla25TREtQcm9tcHQuZHJhd1Byb21wdEl0ZW0oc2NoZW1hKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Qcm9tcHQ6IEhpZWtuU0RLUHJvbXB0Lm9uUHJvbXB0KHRoaXMucHJvbXB0U2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnRnYzJTZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRUZ2MyT3B0aW9ucywgZGVmYXVsdFRnYzJPcHRpb25zLCB0aGlzLm9wdGlvbnMudGdjMlNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnRnYzJTZXR0aW5ncy5maWx0ZXIuZmlsdGVycyA9IGZpbHRlcnM7XHJcbiAgICAgICAgdGhpcy50Z2MyID0gbmV3IFRnYzJSZWxhdGlvbih0aGlzLnRnYzJTZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy50Z2MyU3RhdHMgPSBuZXcgVGdjMlN0YXRzKHRoaXMudGdjMiwgdGhpcy50Z2MyU2V0dGluZ3Muc3RhdHMpO1xyXG4gICAgICAgIHRoaXMudGdjMkNvbm5lY3RzID0gbmV3IFRnYzJDb25uZWN0cyh0aGlzLnRnYzIsIHRoaXMudGdjMlNldHRpbmdzLmNvbm5lY3RzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYnVpbGRMb2FkZXJQYXJhbXMob3B0aW9uczogSGlla25OZXRDaGFydExvYWRlclNldHRpbmcpIHtcclxuICAgICAgICBjb25zdCBpZHMgPSBfLm1hcCgoPFRnYzJSZWxhdGlvblN0YXJ0SW5mbz50aGlzLnRnYzIuc3RhcnRJbmZvKS5ub2RlcywgJ2lkJyk7XHJcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gb3B0aW9ucy5xdWVyeURhdGEgfHwge307XHJcbiAgICAgICAgbGV0IGZvcm1EYXRhID0gb3B0aW9ucy5mb3JtRGF0YSB8fCB7fTtcclxuICAgICAgICBmb3JtRGF0YS5pZHMgPSBpZHM7XHJcbiAgICAgICAgZm9ybURhdGEuaXNTaG9ydGVzdCA9IHRydWU7XHJcbiAgICAgICAgZm9ybURhdGEuY29ubmVjdHNDb21wdXRlID0gdHJ1ZTtcclxuICAgICAgICBmb3JtRGF0YS5zdGF0c0NvbXB1dGUgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLnRnYzJGaWx0ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgZmlsdGVycyA9IHRoaXMudGdjMkZpbHRlci5nZXRGaWx0ZXJPcHRpb25zKCk7XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGZvcm1EYXRhLCBmaWx0ZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudGdjMlN0YXRzKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLnN0YXRzQ29uZmlnID0gdGhpcy50Z2MyU3RhdHMuZ2V0U3RhdHNDb25maWcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtxdWVyeURhdGE6IHF1ZXJ5RGF0YSwgZm9ybURhdGE6IGZvcm1EYXRhLCB1cmw6ICdyZWxhdGlvbid9O1xyXG4gICAgfVxyXG59XHJcblxuY2xhc3MgSGlla25TREtUaW1pbmcgZXh0ZW5kcyBIaWVrblNES05ldENoYXJ0IHtcclxuICAgIGlzVGltaW5nOiB0cnVlO1xyXG4gICAgdGdjMlByb21wdDogVGdjMlByb21wdDtcclxuICAgIHRnYzJUaW1lQ2hhcnQ6IFRnYzJUaW1lQ2hhcnQ7XHJcbiAgICB0Z2MyRXZlbnQ6IFRnYzJFdmVudDtcclxuXHJcbiAgICBwcm90ZWN0ZWQgYnVpbGRQcml2YXRlU2V0dGluZyhzY2hlbWE6IEhpZWtuU2NoZW1hKSB7XHJcbiAgICAgICAgY29uc3QgaW5pdFNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5lbnRpdHlMaXN0ICYmIGRhdGEuZW50aXR5TGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWQoZGF0YS5lbnRpdHlMaXN0WzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcy5pbml0U2V0dGluZ3MsIGluaXRTZXR0aW5ncyk7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdFRnYzJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBhdXRvUmVzaXplOiB0cnVlLFxyXG4gICAgICAgICAgICBwcm9tcHQ6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd1Byb21wdEl0ZW06IEhpZWtuU0RLUHJvbXB0LmRyYXdQcm9tcHRJdGVtKHNjaGVtYSksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Qcm9tcHQ6IEhpZWtuU0RLUHJvbXB0Lm9uUHJvbXB0KHRoaXMucHJvbXB0U2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBib3R0b206ICc2MHB4J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0aW1lQ2hhcnQ6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgZW5hYmxlOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnRnYzJTZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRUZ2MyT3B0aW9ucywgZGVmYXVsdFRnYzJPcHRpb25zLCB0aGlzLm9wdGlvbnMudGdjMlNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnRnYzIgPSBuZXcgVGdjMkdyYXBoKHRoaXMudGdjMlNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnRnYzJQcm9tcHQgPSBuZXcgVGdjMlByb21wdCh0aGlzLnRnYzIsIHRoaXMudGdjMlNldHRpbmdzLnByb21wdCk7XHJcbiAgICAgICAgdGhpcy50Z2MyVGltZUNoYXJ0ID0gbmV3IFRnYzJUaW1lQ2hhcnQodGhpcy50Z2MyLCB0aGlzLnRnYzJTZXR0aW5ncy50aW1lQ2hhcnQpO1xyXG4gICAgICAgIHRoaXMudGdjMkV2ZW50ID0gbmV3IFRnYzJFdmVudCh0aGlzLnRnYzIsIHRoaXMudGdjMlNldHRpbmdzLmV2ZW50KTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLnRnYzJUaW1lQ2hhcnQuJHNldHRpbmdNb2RhbC5maW5kKCcuaW5wdXQtZGF0ZXJhbmdlJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6ICd5eXl5LW1tLWRkJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy50Z2MyVGltZUNoYXJ0LiRzZXR0aW5nTW9kYWwuZmluZCgnLmlucHV0LWRhdGVyYW5nZScpLmZpbmQoJ2lucHV0JykucHJvcCgndHlwZScsICd0ZXh0Jyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYnVpbGRMb2FkZXJQYXJhbXMob3B0aW9uczogSGlla25OZXRDaGFydExvYWRlclNldHRpbmcpIHtcclxuICAgICAgICBjb25zdCBxdWVyeURhdGEgPSBvcHRpb25zLnF1ZXJ5RGF0YSB8fCB7fTtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSBvcHRpb25zLmZvcm1EYXRhIHx8IHt9O1xyXG4gICAgICAgIGZvcm1EYXRhLmlkID0gdGhpcy50Z2MyLnN0YXJ0SW5mby5pZDtcclxuICAgICAgICBmb3JtRGF0YS5pc1JlbGF0aW9uTWVyZ2UgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLnRnYzJGaWx0ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgZmlsdGVycyA9IHRoaXMudGdjMkZpbHRlci5nZXRGaWx0ZXJPcHRpb25zKCk7XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGZvcm1EYXRhLCBmaWx0ZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudGdjMlRpbWVDaGFydCkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMudGdjMlRpbWVDaGFydC5nZXRTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICBkZWxldGUgc2V0dGluZ3MudHlwZTtcclxuICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgZm9ybURhdGEsIHNldHRpbmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtxdWVyeURhdGE6IHF1ZXJ5RGF0YSwgZm9ybURhdGE6IGZvcm1EYXRhLCB1cmw6ICdncmFwaC90aW1pbmcnfTtcclxuICAgIH1cclxufVxyXG5cbmludGVyZmFjZSBIaWVrblN0YXRDb25maWdTZXR0aW5nIHtcclxuICAgIHR5cGU6IHN0cmluZztcclxuICAgIHNlcmllc05hbWU/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gICAgY2hhcnRTZXR0aW5ncz86IGFueTtcclxuICAgIGNoYW5nZVhZPzogYm9vbGVhbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEhpZWtuU3RhdFNldHRpbmcgZXh0ZW5kcyBIaWVrbkJhc2VTZXR0aW5nIHtcclxuICAgIGNvbnRhaW5lcj86IHN0cmluZztcclxuICAgIGZvcm1EYXRhVXBkYXRlcj86IChmb3JtRGF0YTogYW55KSA9PiBhbnk7XHJcbiAgICBjb25maWc/OiBIaWVrblN0YXRDb25maWdTZXR0aW5nO1xyXG4gICAga2dOYW1lPzogc3RyaW5nO1xyXG4gICAgY2hhcnRDb2xvcj86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5hYnN0cmFjdCBjbGFzcyBIaWVrblNES1N0YXQge1xyXG4gICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgY2hhcnQ6IGFueTtcclxuICAgIG9wdGlvbnM6IEhpZWtuU3RhdFNldHRpbmc7XHJcbiAgICBzdGF0OiBhbnk7XHJcbiAgICBkZWZhdWx0czogSGlla25TdGF0U2V0dGluZyA9IHtcclxuICAgICAgICBjaGFydENvbG9yOiBIaWVrblNES1V0aWxzLmNvbG9yXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhpZWtuU3RhdFNldHRpbmcpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyID0gJCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmJpbmRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKSB7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcnQgJiYgdGhpcy5jaGFydC5yZXNpemUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZHJhd0NoYXJ0KCk6IHZvaWQ7XHJcblxyXG4gICAgbG9hZCgpIHtcclxuICAgICAgICBsZXQgcXVlcnlEYXRhID0gdGhpcy5vcHRpb25zLnF1ZXJ5RGF0YSB8fCB7fTtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSB0aGlzLm9wdGlvbnMuZm9ybURhdGEgfHwge307XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JtRGF0YVVwZGF0ZXIpIHtcclxuICAgICAgICAgICAgZm9ybURhdGEgPSB0aGlzLm9wdGlvbnMuZm9ybURhdGFVcGRhdGVyKGZvcm1EYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0ICRjb250YWluZXIgPSB0aGlzLiRjb250YWluZXIuZW1wdHkoKTtcclxuICAgICAgICBsZXQgbmV3T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdXJsOiBIaWVrblNES1V0aWxzLmJ1aWxkVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsICsgJ3N0YXQvZGF0YScsIHF1ZXJ5RGF0YSksXHJcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcclxuICAgICAgICAgICAgZGF0YTogZm9ybURhdGEsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhOiBhbnksIHRleHRTdGF0dXM6IHN0cmluZywganFYSFI6IEpRdWVyeVhIUikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ID0gZGF0YVswXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJ0KCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRoYXQ6ICRjb250YWluZXJbMF1cclxuICAgICAgICB9O1xyXG4gICAgICAgIG5ld09wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgdGhpcy5vcHRpb25zLCBuZXdPcHRpb25zKTtcclxuICAgICAgICBIaWVrblNES1V0aWxzLmFqYXgobmV3T3B0aW9ucyk7XHJcbiAgICB9XHJcbn1cbmNsYXNzIEhpZWtuU0RLU3RhdExpbmVCYXIgZXh0ZW5kcyBIaWVrblNES1N0YXQge1xyXG4gICAgcHJvdGVjdGVkIGRyYXdDaGFydCgpIHtcclxuICAgICAgICBjb25zdCB0eXBlID0gdGhpcy5vcHRpb25zLmNvbmZpZy50eXBlO1xyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRYQXhpcyA9IHtcclxuICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3J5JyxcclxuICAgICAgICAgICAgYXhpc0xpbmU6IHtcclxuICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGF4aXNUaWNrOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFsaWduV2l0aExhYmVsOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNwbGl0TGluZToge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBkZWZhdWx0U2VyaWVzID0ge1xyXG4gICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgc3ltYm9sOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgc3ltYm9sU2l6ZTogMTBcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGQgPSB0aGlzLnN0YXQ7XHJcbiAgICAgICAgY29uc3Qgc3RhdCA9IHRoaXMub3B0aW9ucy5jb25maWc7XHJcbiAgICAgICAgY29uc3QgbGVnZW5kID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIGQuc2VyaWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChzdGF0LnNlcmllc05hbWUpIHtcclxuICAgICAgICAgICAgICAgIHMubmFtZSA9IHN0YXQuc2VyaWVzTmFtZVtzLm5hbWVdIHx8IHMubmFtZTtcclxuICAgICAgICAgICAgICAgIGxlZ2VuZC5wdXNoKHMubmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlkeCA9IDA7XHJcbiAgICAgICAgY29uc3QgeEF4aXNBcnIgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IHhBeGlzIG9mIGQueEF4aXMpIHtcclxuICAgICAgICAgICAgaWYgKHN0YXQuY2hhcnRTZXR0aW5ncyAmJiBzdGF0LmNoYXJ0U2V0dGluZ3MueEF4aXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0LmNoYXJ0U2V0dGluZ3MueEF4aXMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGRlZmF1bHRYQXhpcywgc3RhdC5jaGFydFNldHRpbmdzLnhBeGlzW2lkeF0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCBkZWZhdWx0WEF4aXMsIHN0YXQuY2hhcnRTZXR0aW5ncy54QXhpcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeEF4aXNBcnIucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdFhBeGlzLCB4QXhpcykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZHggPSAwO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0FyciA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3Qgc2VyaWVzIG9mIGQuc2VyaWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChzdGF0LmNoYXJ0U2V0dGluZ3MgJiYgc3RhdC5jaGFydFNldHRpbmdzLnNlcmllcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXQuY2hhcnRTZXR0aW5ncy5zZXJpZXMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGRlZmF1bHRTZXJpZXMsIHN0YXQuY2hhcnRTZXR0aW5ncy5zZXJpZXNbaWR4XSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIGRlZmF1bHRTZXJpZXMsIHN0YXQuY2hhcnRTZXR0aW5ncy5zZXJpZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzZXJpZXMubmFtZSA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHNlcmllcy5uYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdFNlcmllcywgc2VyaWVzKTtcclxuICAgICAgICAgICAgaWYgKHN0YXQuc2VyaWVzTmFtZSAmJiBzdGF0LnNlcmllc05hbWVbcy5uYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgcy5uYW1lID0gc3RhdC5zZXJpZXNOYW1lW3MubmFtZV0gfHwgcy5uYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlcmllc0Fyci5wdXNoKHMpO1xyXG4gICAgICAgICAgICBpZHgrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jaGFydCA9IGVjaGFydHMuaW5pdCh0aGlzLiRjb250YWluZXJbMF0pO1xyXG4gICAgICAgIGxldCBkZWZhdWx0T3B0aW9uOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGNvbG9yOiB0aGlzLm9wdGlvbnMuY2hhcnRDb2xvcixcclxuICAgICAgICAgICAgdG9vbHRpcDoge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICd0b3AnLFxyXG4gICAgICAgICAgICAgICAgdHJpZ2dlcjogJ2F4aXMnLFxyXG4gICAgICAgICAgICAgICAgYXhpc1BvaW50ZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG9yaWVudDogJ3ZlcnRpY2FsJyxcclxuICAgICAgICAgICAgICAgIHg6ICdsZWZ0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGxlZ2VuZFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0OiA5LFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6IDksXHJcbiAgICAgICAgICAgICAgICBib3R0b206IDI0LFxyXG4gICAgICAgICAgICAgICAgdG9wOiAyNCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5MYWJlbDogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB5QXhpczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd2YWx1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgYXhpc0xpbmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGF4aXNUaWNrOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoc3RhdC5zZXJpZXNOYW1lICYmICEkLmlzRW1wdHlPYmplY3Qoc3RhdC5zZXJpZXNOYW1lKSkge1xyXG4gICAgICAgICAgICBkZWZhdWx0T3B0aW9uLnRvb2x0aXAuZm9ybWF0dGVyID0gKHBhcmFtOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzdHIgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBwYXJhbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciArPSBpdGVtLnNlcmllc05hbWUgKyAnOicgKyBpdGVtLmRhdGEgKyAnPGJyPic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvcHRpb246IGFueSA9IHt9O1xyXG4gICAgICAgIGlmIChzdGF0LmNoYXJ0U2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgb3B0aW9uID0gJC5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRPcHRpb24sIHN0YXQuY2hhcnRTZXR0aW5ncyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3B0aW9uID0gZGVmYXVsdE9wdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0YXQuY2hhbmdlWFkpIHtcclxuICAgICAgICAgICAgb3B0aW9uLnhBeGlzID0gb3B0aW9uLnlBeGlzO1xyXG4gICAgICAgICAgICBvcHRpb24ueUF4aXMgPSB4QXhpc0FycjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvcHRpb24ueEF4aXMgPSB4QXhpc0FycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9uLnNlcmllcyA9IHNlcmllc0FycjtcclxuICAgICAgICB0aGlzLmNoYXJ0LnNldE9wdGlvbihvcHRpb24pO1xyXG4gICAgfVxyXG59XG5jbGFzcyBIaWVrblNES1N0YXRQaWUgZXh0ZW5kcyBIaWVrblNES1N0YXQge1xyXG4gICAgcHJvdGVjdGVkIGRyYXdDaGFydCgpIHtcclxuICAgICAgICBjb25zdCBkID0gdGhpcy5zdGF0O1xyXG4gICAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLm9wdGlvbnMuY29uZmlnO1xyXG4gICAgICAgIGNvbnN0IGxlZ2VuZCA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgcyBvZiBkLnNlcmllcykge1xyXG4gICAgICAgICAgICBpZiAoc3RhdC5zZXJpZXNOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzLm5hbWUgPSBzdGF0LnNlcmllc05hbWVbcy5uYW1lXSB8fCBzLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBsZWdlbmQucHVzaChzLm5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRTZXJpZXMgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICB0eXBlOiAncGllJyxcclxuICAgICAgICAgICAgcmFkaXVzOiAnNzUlJyxcclxuICAgICAgICAgICAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcclxuICAgICAgICAgICAgZGF0YTogZC5zZXJpZXMsXHJcbiAgICAgICAgICAgIGl0ZW1TdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZW1waGFzaXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaGFkb3dCbHVyOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBzaGFkb3dPZmZzZXRYOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHNoYWRvd0NvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjUpJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgc2VyaWVzID0ge307XHJcbiAgICAgICAgaWYgKHN0YXQuY2hhcnRTZXR0aW5ncyAmJiBzdGF0LmNoYXJ0U2V0dGluZ3Muc2VyaWVzKSB7XHJcbiAgICAgICAgICAgIHNlcmllcyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0U2VyaWVzLCBzdGF0LmNoYXJ0U2V0dGluZ3Muc2VyaWVzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZXJpZXMgPSBkZWZhdWx0U2VyaWVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNoYXJ0ID0gZWNoYXJ0cy5pbml0KHRoaXMuJGNvbnRhaW5lclswXSk7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdE9wdGlvbiA9IHtcclxuICAgICAgICAgICAgY29sb3I6IHRoaXMub3B0aW9ucy5jaGFydENvbG9yLFxyXG4gICAgICAgICAgICB0b29sdGlwOiB7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOiAnaXRlbScsXHJcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZXI6ICd7Yn0gPGJyLz57Y30gKHtkfSUpJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgIG9yaWVudDogJ3ZlcnRpY2FsJyxcclxuICAgICAgICAgICAgICAgIHg6ICdsZWZ0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGxlZ2VuZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgb3B0aW9uOiBhbnkgPSB7fTtcclxuICAgICAgICBpZiAoc3RhdC5jaGFydFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbiA9ICQuZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0T3B0aW9uLCBzdGF0LmNoYXJ0U2V0dGluZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9wdGlvbiA9IGRlZmF1bHRPcHRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdGlvbi5zZXJpZXMgPSBbc2VyaWVzXTtcclxuICAgICAgICB0aGlzLmNoYXJ0LnNldE9wdGlvbihvcHRpb24pO1xyXG4gICAgfVxyXG59XG5jbGFzcyBIaWVrblNES1N0YXRXb3JkQ2xvdWQgZXh0ZW5kcyBIaWVrblNES1N0YXQge1xyXG4gICAgcHJvdGVjdGVkIGRyYXdDaGFydCgpIHtcclxuICAgICAgICBjb25zdCBkID0gdGhpcy5zdGF0O1xyXG4gICAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLm9wdGlvbnMuY29uZmlnO1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IHNlcmllcyBvZiBkLnNlcmllcykge1xyXG4gICAgICAgICAgICBpZiAoc2VyaWVzLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChzZXJpZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRTZXJpZXMgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6ICd3b3JkQ2xvdWQnLFxyXG4gICAgICAgICAgICBzaXplUmFuZ2U6IFsxMiwgNTBdLFxyXG4gICAgICAgICAgICByb3RhdGlvblJhbmdlOiBbLTQ1LCA5MF0sXHJcbiAgICAgICAgICAgIHRleHRQYWRkaW5nOiAwLFxyXG4gICAgICAgICAgICBhdXRvU2l6ZToge1xyXG4gICAgICAgICAgICAgICAgZW5hYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbWluU2l6ZTogNlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZXh0U3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIG5vcm1hbDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY2hhcnRDb2xvcltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLm9wdGlvbnMuY2hhcnRDb2xvci5sZW5ndGgpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZW1waGFzaXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaGFkb3dCbHVyOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBzaGFkb3dDb2xvcjogJyMzMzMnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBzZXJpZXMgPSB7fTtcclxuICAgICAgICBpZiAoc3RhdC5jaGFydFNldHRpbmdzICYmIHN0YXQuY2hhcnRTZXR0aW5ncy5zZXJpZXMpIHtcclxuICAgICAgICAgICAgc2VyaWVzID0gJC5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRTZXJpZXMsIHN0YXQuY2hhcnRTZXR0aW5ncy5zZXJpZXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlcmllcyA9IGRlZmF1bHRTZXJpZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2hhcnQgPSBlY2hhcnRzLmluaXQodGhpcy4kY29udGFpbmVyWzBdKTtcclxuICAgICAgICBjb25zdCBkZWZhdWx0T3B0aW9uID0ge307XHJcbiAgICAgICAgbGV0IG9wdGlvbjogYW55ID0ge307XHJcbiAgICAgICAgaWYgKHN0YXQuY2hhcnRTZXR0aW5ncykge1xyXG4gICAgICAgICAgICBvcHRpb24gPSAkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdE9wdGlvbiwgc3RhdC5jaGFydFNldHRpbmdzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvcHRpb24gPSBkZWZhdWx0T3B0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb24uc2VyaWVzID0gW3Nlcmllc107XHJcbiAgICAgICAgdGhpcy5jaGFydC5zZXRPcHRpb24ob3B0aW9uKTtcclxuICAgIH1cclxufVxuaW50ZXJmYWNlIEhpZWtuQXNzb2NpYXRpb25TZXR0aW5nIGV4dGVuZHMgSGlla25BamF4U2V0dGluZyB7XHJcbiAgICBrZ05hbWU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuU0RLQXNzb2NpYXRpb24ge1xyXG4gICAgc3RhdGljIGRlZmF1bHRzID0ge1xyXG4gICAgICAgIGZvcm1EYXRhOiB7XHJcbiAgICAgICAgICAgIHBhZ2VTaXplOiA2XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzdGF0aWMgbG9hZChvcHRpb25zOiBIaWVrbkFzc29jaWF0aW9uU2V0dGluZykge1xyXG4gICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgSGlla25TREtBc3NvY2lhdGlvbi5kZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gb3B0aW9ucy5xdWVyeURhdGEgfHwge307XHJcbiAgICAgICAgbGV0IGZvcm1EYXRhID0gb3B0aW9ucy5mb3JtRGF0YSB8fCB7fTtcclxuICAgICAgICBmb3JtRGF0YS5rZ05hbWUgPSBvcHRpb25zLmtnTmFtZTtcclxuICAgICAgICBsZXQgbmV3T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdXJsOiBIaWVrblNES1V0aWxzLmJ1aWxkVXJsKG9wdGlvbnMuYmFzZVVybCArICdhc3NvY2lhdGlvbicsIHF1ZXJ5RGF0YSksXHJcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcclxuICAgICAgICAgICAgZGF0YTogZm9ybURhdGEsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBuZXdPcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMsIG5ld09wdGlvbnMpO1xyXG4gICAgICAgIEhpZWtuU0RLVXRpbHMuYWpheChuZXdPcHRpb25zKTtcclxuICAgIH07XHJcbn1cbnR5cGUgSGlla25Db25jZXB0R3JhcGhTdGFydEluZm8gPSB7IGlkOiBIaWVrbklkVHlwZSwga2dUeXBlOiBudW1iZXIgfTtcclxuXHJcbmludGVyZmFjZSBIaWVrbkNvbmNlcHRHcmFwaFNldHRpbmcgZXh0ZW5kcyBIaWVrbkJhc2VTZXR0aW5nIHtcclxuICAgIGtnTmFtZT86IHN0cmluZztcclxuICAgIGVtcGhhc2VzQ29sb3I/OiBzdHJpbmc7XHJcbiAgICBlbXBoYXNlc0xpZ2h0Q29sb3I/OiBzdHJpbmc7XHJcbiAgICBpbnN0YW5jZUVuYWJsZT86IGJvb2xlYW47XHJcbiAgICBpbmZvYm94U2V0dGluZz86IEhpZWtuTmV0Q2hhcnRJbmZvYm94U2V0dGluZztcclxuICAgIGxpZ2h0Q29sb3I/OiBzdHJpbmc7XHJcbiAgICBwcmltYXJ5Q29sb3I/OiBzdHJpbmc7XHJcbiAgICBwcmltYXJ5TGlnaHRDb2xvcj86IHN0cmluZztcclxuICAgIHByb21wdFNldHRpbmdzPzogSGlla25Qcm9tcHRTZXR0aW5nO1xyXG4gICAgc2VsZWN0b3I/OiBzdHJpbmc7XHJcbiAgICBzdGFydEluZm8/OiBIaWVrbkNvbmNlcHRHcmFwaFN0YXJ0SW5mbztcclxuICAgIHRnYzJTZXR0aW5ncz86IEhpZWtuVGdjMlNldHRpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrbkNvbmNlcHRHcmFwaERhdGFOb2RlIGV4dGVuZHMgVGdjMkRhdGFOb2RlIHtcclxuICAgIGtnVHlwZT86IG51bWJlcjtcclxufVxyXG5pbnRlcmZhY2UgSGlla25Db25jZXB0R3JhcGhEYXRhTGluayBleHRlbmRzIFRnYzJEYXRhTGluayB7XHJcbiAgICBhdHROYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5jbGFzcyBIaWVrblNES0NvbmNlcHRHcmFwaCB7XHJcbiAgICBwcm9tcHRTZXR0aW5nczogSGlla25Qcm9tcHRTZXR0aW5nO1xyXG4gICAgZ3JhcGhJbmZvYm94OiBIaWVrblNES0luZm9ib3g7XHJcbiAgICBvcHRpb25zOiBIaWVrbkNvbmNlcHRHcmFwaFNldHRpbmcgPSB7fTtcclxuICAgIHRnYzI6IFRnYzJHcmFwaDtcclxuICAgIHRnYzJQcm9tcHQ6IFRnYzJQcm9tcHQ7XHJcbiAgICB0Z2MyUGFnZTogVGdjMlBhZ2U7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSGlla25Db25jZXB0R3JhcGhTZXR0aW5nKSB7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdFByb21wdFNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBiYXNlVXJsOiBvcHRpb25zLmJhc2VVcmwsXHJcbiAgICAgICAgICAgIHF1ZXJ5RGF0YTogb3B0aW9ucy5xdWVyeURhdGEsXHJcbiAgICAgICAgICAgIGtnTmFtZTogb3B0aW9ucy5rZ05hbWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucHJvbXB0U2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCBkZWZhdWx0UHJvbXB0U2V0dGluZ3MsIG9wdGlvbnMucHJvbXB0U2V0dGluZ3MpO1xyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBsaWdodENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgIHByaW1hcnlDb2xvcjogJyMwMGIzOGEnLFxyXG4gICAgICAgICAgICBwcmltYXJ5TGlnaHRDb2xvcjogJ3JnYmEoMCwxNzksMTM4LDAuMyknLFxyXG4gICAgICAgICAgICBlbXBoYXNlc0NvbG9yOiAnI2ZhYTAxYicsXHJcbiAgICAgICAgICAgIGVtcGhhc2VzTGlnaHRDb2xvcjogJ3JnYmEoMjUwLCAxNjAsIDI3LDAuMyknLFxyXG4gICAgICAgICAgICBpbnN0YW5jZUVuYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHRnYzJTZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgbmV0Q2hhcnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sYmFyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlTWVudToge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVN0eWxlRnVuY3Rpb246IChub2RlOiBUZ2MyQ2hhcnROb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlU3R5bGVGdW5jdGlvbihub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlSG92ZXJlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYWRvd0JsdXI6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhZG93Q29sb3I6ICdyZ2JhKDAsIDAsIDAsIDApJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtTdHlsZUZ1bmN0aW9uOiAobGluazogVGdjMkNoYXJ0TGluaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5rLmhvdmVyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5sYWJlbCA9ICg8SGlla25Db25jZXB0R3JhcGhEYXRhTGluaz5saW5rLmRhdGEpLmF0dE5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsudG9EZWNvcmF0aW9uID0gJ2Fycm93JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmZpbGxDb2xvciA9ICcjZGRkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0U3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnIzk5OSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcHJvbXB0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJvbXB0OiBIaWVrblNES1Byb21wdC5vblByb21wdEtub3dsZWRnZSh0aGlzLnByb21wdFNldHRpbmdzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwYWdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAnMTVweCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VTaXplOiAyMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxvYWRlcjogKGluc3RhbmNlOiBUZ2MyR3JhcGgsIGNhbGxiYWNrOiBGdW5jdGlvbiwgb25GYWlsZWQ6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkZXIoaW5zdGFuY2UsIGNhbGxiYWNrLCBvbkZhaWxlZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICAgICAgbGV0IGluZm9ib3ggPSB0aGlzLm9wdGlvbnMuaW5mb2JveFNldHRpbmc7XHJcbiAgICAgICAgaWYgKGluZm9ib3ggJiYgaW5mb2JveC5lbmFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5ncmFwaEluZm9ib3ggPSB0aGlzLmJ1aWxkSW5mb2JveChpbmZvYm94KTtcclxuICAgICAgICAgICAgdGhpcy5ncmFwaEluZm9ib3guaW5pdEV2ZW50KCQodGhpcy5vcHRpb25zLnNlbGVjdG9yKSk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50Z2MyU2V0dGluZ3MubmV0Q2hhcnQuc2V0dGluZ3Mubm9kZU1lbnUuY29udGVudHNGdW5jdGlvbiA9IChkYXRhOiBhbnksIG5vZGU6IGFueSwgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50c0Z1bmN0aW9uKGRhdGEsIG5vZGUsIGNhbGxiYWNrKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMudGdjMlNldHRpbmdzLnNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnRnYzJTZXR0aW5ncy5zZWxlY3RvciB8fCB0aGlzLm9wdGlvbnMuc2VsZWN0b3I7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc3RhcnRJbmZvKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZChvcHRpb25zLnN0YXJ0SW5mbyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnVpbGRJbmZvYm94KGluZm9ib3hPcHRpb25zOiBIaWVrbkluZm9ib3hTZXR0aW5nKSB7XHJcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGJhc2VVcmw6IHRoaXMub3B0aW9ucy5iYXNlVXJsLFxyXG4gICAgICAgICAgICBkYXRhRmlsdGVyOiB0aGlzLm9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgcXVlcnlEYXRhOiB0aGlzLm9wdGlvbnMucXVlcnlEYXRhLFxyXG4gICAgICAgICAgICBmb3JtRGF0YTogdGhpcy5vcHRpb25zLmZvcm1EYXRhLFxyXG4gICAgICAgICAgICBrZ05hbWU6IHRoaXMub3B0aW9ucy5rZ05hbWVcclxuICAgICAgICB9O1xyXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIG9wdGlvbnMsIGluZm9ib3hPcHRpb25zKTtcclxuICAgICAgICByZXR1cm4gbmV3IEhpZWtuU0RLSW5mb2JveChvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbnRlbnRzRnVuY3Rpb24oZGF0YTogYW55LCBub2RlOiBhbnksIGNhbGxiYWNrOiBGdW5jdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKG5vZGUuZGV0YWlsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG5vZGUuZGV0YWlsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmdyYXBoSW5mb2JveC5sb2FkKGRhdGEuaWQsIChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMuZ3JhcGhJbmZvYm94LmJ1aWxkSW5mb2JveChkYXRhKVswXS5vdXRlckhUTUw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAn5rKh5pyJ55+l6K+G5Y2h54mH5L+h5oGvJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5vZGUuZGV0YWlsID0gZGF0YTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0KCkge1xyXG4gICAgICAgIHRoaXMudGdjMiA9IG5ldyBUZ2MyR3JhcGgodGhpcy5vcHRpb25zLnRnYzJTZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy50Z2MyUHJvbXB0ID0gbmV3IFRnYzJQcm9tcHQodGhpcy50Z2MyLCB0aGlzLm9wdGlvbnMudGdjMlNldHRpbmdzLnByb21wdCk7XHJcbiAgICAgICAgdGhpcy50Z2MyUGFnZSA9IG5ldyBUZ2MyUGFnZSh0aGlzLnRnYzIsIHRoaXMub3B0aW9ucy50Z2MyU2V0dGluZ3MucGFnZSk7XHJcbiAgICAgICAgdGhpcy50Z2MyLmluaXQoKTtcclxuICAgICAgICAkKHRoaXMub3B0aW9ucy50Z2MyU2V0dGluZ3Muc2VsZWN0b3IpLmFkZENsYXNzKCd0Z2MyIHRnYzItY29uY2VwdC1ncmFwaCcpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5zdGFuY2VFbmFibGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzLm9wdGlvbnMudGdjMlNldHRpbmdzLnNlbGVjdG9yKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJ0Z2MyLWluZm8tdG9wXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPHVsIGNsYXNzPVwiaW5mby10b3BcIj4nICtcclxuICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCJjdXJyZW50XCI+PGRpdiBjbGFzcz1cImxlZ2VuZC1jaXJjbGVcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6JyArIHRoaXMub3B0aW9ucy5lbXBoYXNlc0NvbG9yICsgJ1wiPjwvZGl2PjxzcGFuPuW9k+WJjeiKgueCuTwvc3Bhbj48L2xpPicgK1xyXG4gICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cImNvbmNlcHRcIj48ZGl2IGNsYXNzPVwibGVnZW5kLWNpcmNsZVwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjonICsgdGhpcy5vcHRpb25zLnByaW1hcnlDb2xvciArICdcIj48L2Rpdj48c3Bhbj7mpoLlv7U8L3NwYW4+PC9saT4nICtcclxuICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCJpbnN0YW5jZVwiPjxkaXYgY2xhc3M9XCJsZWdlbmQtY2lyY2xlLW9cIiBzdHlsZT1cImJvcmRlci1jb2xvcjonICsgdGhpcy5vcHRpb25zLnByaW1hcnlDb2xvciArICdcIj48L2Rpdj48c3Bhbj7lrp7kvos8L3NwYW4+PC9saT4nICtcclxuICAgICAgICAgICAgICAgICc8L3VsPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKHRoaXMub3B0aW9ucy50Z2MyU2V0dGluZ3Muc2VsZWN0b3IpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInRnYzItaW5mby1ib3R0b21cIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbmZvLWJvdHRvbVwiPjxzcGFuPuS4reW/g+iKgueCue+8mjwvc3Bhbj48c3BhbiBuYW1lPVwibmFtZVwiIHN0eWxlPVwiY29sb3I6JyArIHRoaXMub3B0aW9ucy5lbXBoYXNlc0NvbG9yICsgJ1wiPjwvc3Bhbj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWQobm9kZTogSGlla25Db25jZXB0R3JhcGhTdGFydEluZm8pIHtcclxuICAgICAgICB0aGlzLnRnYzIubG9hZChub2RlKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy50Z2MyLnJlc2l6ZSgpO1xyXG4gICAgICAgIH0sIDMwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZGVyKGluc3RhbmNlOiBUZ2MyR3JhcGgsIGNhbGxiYWNrOiBGdW5jdGlvbiwgb25GYWlsZWQ6IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IDxIaWVrbkNvbmNlcHRHcmFwaFN0YXJ0SW5mbz50aGlzLnRnYzIuc3RhcnRJbmZvO1xyXG4gICAgICAgIGNvbnN0IHBhZ2UgPSB0aGlzLnRnYzJQYWdlLnBhZ2U7XHJcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gdGhpcy5vcHRpb25zLnF1ZXJ5RGF0YSB8fCB7fTtcclxuICAgICAgICBxdWVyeURhdGEudHlwZSA9IG5vZGUua2dUeXBlIHx8IDA7XHJcbiAgICAgICAgcXVlcnlEYXRhLnBhZ2VObyA9IHBhZ2UucGFnZU5vO1xyXG4gICAgICAgIHF1ZXJ5RGF0YS5wYWdlU2l6ZSA9IHBhZ2UucGFnZVNpemU7XHJcbiAgICAgICAgcXVlcnlEYXRhLmtnTmFtZSA9IHRoaXMub3B0aW9ucy5rZ05hbWU7XHJcbiAgICAgICAgcXVlcnlEYXRhLmVudGl0eUlkID0gbm9kZS5pZDtcclxuICAgICAgICBIaWVrblNES1V0aWxzLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IEhpZWtuU0RLVXRpbHMuYnVpbGRVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwgKyAnZ3JhcGgva25vd2xlZ2RlJywgcXVlcnlEYXRhKSxcclxuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgICAgIGRhdGFGaWx0ZXI6IHRoaXMub3B0aW9ucy5kYXRhRmlsdGVyLFxyXG4gICAgICAgICAgICB0aGF0OiAkKHRoaXMub3B0aW9ucy50Z2MyU2V0dGluZ3Muc2VsZWN0b3IpWzBdLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVswXTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmVudGl0eUxpc3QgJiYgZGF0YS5lbnRpdHlMaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZCBvZiBkYXRhLmVudGl0eUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGQuaWQgPT0gbm9kZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzLm9wdGlvbnMudGdjMlNldHRpbmdzLnNlbGVjdG9yKS5maW5kKCcudGdjMi1pbmZvLWJvdHRvbScpLmZpbmQoJ1tuYW1lPVwibmFtZVwiXScpLnRleHQoZC5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRhdGEubm9kZXMgPSBkYXRhLmVudGl0eUxpc3Q7XHJcbiAgICAgICAgICAgICAgICBkYXRhLmxpbmtzID0gZGF0YS5yZWxhdGlvbkxpc3Q7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5lbnRpdHlMaXN0O1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEucmVsYXRpb25MaXN0O1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5uZXRDaGFydC5yZXNldExheW91dCgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb25GYWlsZWQgJiYgb25GYWlsZWQoKTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm5ldENoYXJ0LnJlcGxhY2VEYXRhKHtub2RlczogW10sIGxpbmtzOiBbXX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBub2RlU3R5bGVGdW5jdGlvbihub2RlOiBUZ2MyQ2hhcnROb2RlKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IDxIaWVrbkNvbmNlcHRHcmFwaERhdGFOb2RlPm5vZGUuZGF0YTtcclxuICAgICAgICBjb25zdCBjZW50ZXJOb2RlID0gdGhpcy50Z2MyLnN0YXJ0SW5mbztcclxuICAgICAgICBub2RlLmxhYmVsID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIG5vZGUubGFiZWxTdHlsZS50ZXh0U3R5bGUuZm9udCA9ICcxOHB4IE1pY3Jvc29mdCBZYWhlaSc7XHJcbiAgICAgICAgbm9kZS5yYWRpdXMgPSAxNTtcclxuICAgICAgICBub2RlLmltYWdlQ3JvcHBpbmcgPSAnZml0JztcclxuICAgICAgICBjb25zdCBpc0NlbnRlciA9IChub2RlLmlkID09IGNlbnRlck5vZGUuaWQpO1xyXG4gICAgICAgIGlmIChkYXRhLmtnVHlwZSA9PSAwKSB7XHJcbiAgICAgICAgICAgIG5vZGUubGluZVdpZHRoID0gMTA7XHJcbiAgICAgICAgICAgIG5vZGUubGluZUNvbG9yID0gdGhpcy5vcHRpb25zLnByaW1hcnlMaWdodENvbG9yO1xyXG4gICAgICAgICAgICBub2RlLmZpbGxDb2xvciA9IHRoaXMub3B0aW9ucy5wcmltYXJ5Q29sb3I7XHJcbiAgICAgICAgICAgIG5vZGUuaW1hZ2UgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFJQUFBQUNBQ0FZQUFBRERQbUhMQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUF5WnBWRmgwV0UxTU9tTnZiUzVoWkc5aVpTNTRiWEFBQUFBQUFEdy9lSEJoWTJ0bGRDQmlaV2RwYmowaTc3dS9JaUJwWkQwaVZ6Vk5NRTF3UTJWb2FVaDZjbVZUZWs1VVkzcHJZemxrSWo4K0lEeDRPbmh0Y0cxbGRHRWdlRzFzYm5NNmVEMGlZV1J2WW1VNmJuTTZiV1YwWVM4aUlIZzZlRzF3ZEdzOUlrRmtiMkpsSUZoTlVDQkRiM0psSURVdU5pMWpNRFkzSURjNUxqRTFOemMwTnl3Z01qQXhOUzh3TXk4ek1DMHlNem8wTURvME1pQWdJQ0FnSUNBZ0lqNGdQSEprWmpwU1JFWWdlRzFzYm5NNmNtUm1QU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh4T1RrNUx6QXlMekl5TFhKa1ppMXplVzUwWVhndGJuTWpJajRnUEhKa1pqcEVaWE5qY21sd2RHbHZiaUJ5WkdZNllXSnZkWFE5SWlJZ2VHMXNibk02ZUcxd1BTSm9kSFJ3T2k4dmJuTXVZV1J2WW1VdVkyOXRMM2hoY0M4eExqQXZJaUI0Yld4dWN6cDRiWEJOVFQwaWFIUjBjRG92TDI1ekxtRmtiMkpsTG1OdmJTOTRZWEF2TVM0d0wyMXRMeUlnZUcxc2JuTTZjM1JTWldZOUltaDBkSEE2THk5dWN5NWhaRzlpWlM1amIyMHZlR0Z3THpFdU1DOXpWSGx3WlM5U1pYTnZkWEpqWlZKbFppTWlJSGh0Y0RwRGNtVmhkRzl5Vkc5dmJEMGlRV1J2WW1VZ1VHaHZkRzl6YUc5d0lFTkRJREl3TVRVZ0tGZHBibVJ2ZDNNcElpQjRiWEJOVFRwSmJuTjBZVzVqWlVsRVBTSjRiWEF1YVdsa09qaEVOelF3TlVaRk1UVkZRakV4UlRjNFFUSkRPVFkzUkVFNFJrTTRNakZDSWlCNGJYQk5UVHBFYjJOMWJXVnVkRWxFUFNKNGJYQXVaR2xrT2poRU56UXdOVVpHTVRWRlFqRXhSVGM0UVRKRE9UWTNSRUU0UmtNNE1qRkNJajRnUEhodGNFMU5Pa1JsY21sMlpXUkdjbTl0SUhOMFVtVm1PbWx1YzNSaGJtTmxTVVE5SW5odGNDNXBhV1E2T0VRM05EQTFSa014TlVWQ01URkZOemhCTWtNNU5qZEVRVGhHUXpneU1VSWlJSE4wVW1WbU9tUnZZM1Z0Wlc1MFNVUTlJbmh0Y0M1a2FXUTZPRVEzTkRBMVJrUXhOVVZDTVRGRk56aEJNa001TmpkRVFUaEdRemd5TVVJaUx6NGdQQzl5WkdZNlJHVnpZM0pwY0hScGIyNCtJRHd2Y21SbU9sSkVSajRnUEM5NE9uaHRjRzFsZEdFK0lEdy9lSEJoWTJ0bGRDQmxibVE5SW5JaVB6N3JCc0lsQUFBRlVrbEVRVlI0MnV5ZFgwNVRVUkRHcDVWM3lncThKSkpJTklHdWdMSUN5NFB5U0YwQmRRR0dzZ0xxQ2l4dmlpYkNDcmlzZ0pMb0V5YlVGVWpmTmZWTTdpRVNVeWkxdlhObXp2bStaQ0pnMHA1NzUzZm16UGxmR1kxR0JLV3JDZ0FBQUhnTEFBQUNBQkFBZ0FBQUJBQWdBQUFCQUFnQXhLRE0yWnF6ZGY4elc4My9QazU5WjlmT0J0NzQ5d3YvTXdBd0lIYnVDMmNOYjltY1BwY0J5TDJkZUVnQWdDTHRPR3Q2azlDeHQwTUFFTGEyN3pwcis1OURpQ05CMTlrN3ExSEJJZ0RzN0QxbnJZQ09Id2RDejltK05SQ3NBY0ExdnFQSThlTkE2UGlJQUFEbUtNN2EzOStUdldzVDl4NWUrMzhCd0l6YTg3WEtvdHJhbzRGbUFEak1mL0hkT2N2aXJ1T1cxdHhBS3dEV1FyN1pKa0VqQU96MFU4V0ozaXdKNHFZMkNMUUJFS3Z6MVVLZ0NZRFluYThTQWkwQXBPTDgyeERVU2NFa2t3WUFhdDc1NjVTVytqNFNYS2NPQUdmN0xVcFRQZDg3U0JZQUhpZzVvTFQxaG9vSnBlUUF5SnlkSjlUdXE4d0hRZ0xBbzN4TmdsaTh0bUFySlFDYUhnRG9yN1k4Q0VrQWNFWHpXNjRWaTdnSldKYiswbXFBQjIzQitYZm1SSzBVSWdCcXY2SW9JQTFBZzRwQkgraHU4ZUJRSG1zVDBJSi9kYjBqeVFoUTgrRy9CaDlQSEJkWUpxRWhZc2tJMElUekgxeFJHakUyQVJJUGRlVHN1Yk1Gam00bDJJTC8vQ09CeWhKZEUxQjI5di9aMlV0Qm9EODZlMlc5TnlBRkFFLzFucGY4SFZ3enZ3a0M4TXpaMXhJL2Y1a0U1Z2VrbWdDSmZ2K2xjRnQ5S1ZCcG9za0JKQjVtUlJpQUZRQ2c2MkgyaEFGNEN3Q202OXFVTFU0QVB6aGJkZmFveFBlMTZyOW5PNEozSnBZRTVzNDJGUFcxSy9mOG41WmwwbWNTWFdjcEFMVHRQckVBQUk4RUxnR0FkQUdZVkU0QUFBQUFBQUF3MGdzNEkwamxPNnZpUGFjdEFLQlhVYTBIeU9IUHFkV1BDWUFCL0prMkFIMzRVMmVsa1Z3UXdtM2FJcnFCRDlLUWhPWUNKSk5BNUFFUGw5Z1dzV3FNRHhXQnhDcUxaQk9RVWJFdUVFM0FaQzFSaE12Q09hbkJpT0JraWQ1SElEMFExSVYvSjZvbkdnb0RiQTdsU1BBWVRjQlkvU0RoamJQVjJBazNKdkVJR1NJQ2NQKzJIemdLOEE2ZjMyUCt6bXNKZndXcy9lc2tmR3hjaUFod2M2bENTRDJkOHU4UzZsQ0FNd05ESGhJVk1oZjRST08zZFVtczloMm5Dd3AwVUdaSUFDUzJpOTBuM3R2SGQveDhkL2FFaW4wRjI0SEtVcWRBOHlXaEQ0cnNrUHlHRG0zYUQ5a2thamdxbHNsZlM5VDVJbXYvdFFPUWVRZ1dFM1ArMERlRGc5UUJ1TWtIOG9RZ0dQcWFIM3lkaEtZTEkxSTZQVFRJcWFEYUFXQzFxRGcrUG1ieDhmQTlMWVhSZUdrVVE5Q05zRG5nc044bVpVUGhtcStOaXlrblVOUG1Xd0VnSmdqVU9sODdBRVJ4SEMxYko4V3JvaTNjSGN4dDVvNVI1eCtTOHVOeExRQVFlczVnRm9rYzlSWTdBRVE2VmhGTksvSFZQZjhqSzV0REJ3WnJ2NGt5WTNkdzRnSUFBQUFDQUZBWnVnWUE4MU51RUlBK0FFanNaVm9zczVWeEFHdGpBY0ZXK2NZTWdLVVJ3VHFoQ1NnbHBQSmlpcUhpTWc1OUdjMDBXWllpd08xSXdBdEdOcFNWaTFmNHRxM2xLeFlCdUZGR3hYUnhwaUEzeWNub1NXaVdBWUFBQUFRQUlBQUFwZEVOdkMwK1pJSTNsZktwWTZQQTl0UFpBUm05RjlsaUJPQVhmVXI2UnRxNCs3ZEpSaWFCTEFQQVl3QzdTc3VtZmhGb0RBQ1VmUW4xTEJLNTZTdDFBTFFYdUFJQXltOXJ0UjRvWVdJbHNQVmVRQmRsd3ppQXhrVFFYQUpvR1FCV2c0cERKVUozQndkVWJGL0xNUTRBQVFBSUFFQUFBQUlBWWNYWitNWWMrK1E4d25mc00zMEFvRnc1bGJkZTBPU0VUMG9BU0l3UG1PenZwd0tBMU1OVVlubGhNVzBPbFJ3UWFpQUNwQjBCeE83MVF3U1lUaWNDMzNHR0pGQ3Z5cjZRU3NVUjd3QmdNZ1FkMzA2dnpkSHhQQTdRanFuMnh3b0FCQUFnQUFBQkFBZ0FRQUFBQWdBUUFJQUFBQVFBb0gvMVI0QUJBSEYzSysyYncxSkNBQUFBQUVsRlRrU3VRbUNDJztcclxuICAgICAgICAgICAgaWYgKGlzQ2VudGVyKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmZpbGxDb2xvciA9IHRoaXMub3B0aW9ucy5lbXBoYXNlc0NvbG9yO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5saW5lQ29sb3IgPSB0aGlzLm9wdGlvbnMuZW1waGFzZXNMaWdodENvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbm9kZS5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgICAgICBub2RlLmxpbmVDb2xvciA9IHRoaXMub3B0aW9ucy5wcmltYXJ5Q29sb3I7XHJcbiAgICAgICAgICAgIG5vZGUuZmlsbENvbG9yID0gdGhpcy5vcHRpb25zLmxpZ2h0Q29sb3I7XHJcbiAgICAgICAgICAgIG5vZGUuaW1hZ2UgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFJQUFBQUNBQ0FZQUFBRERQbUhMQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUF5WnBWRmgwV0UxTU9tTnZiUzVoWkc5aVpTNTRiWEFBQUFBQUFEdy9lSEJoWTJ0bGRDQmlaV2RwYmowaTc3dS9JaUJwWkQwaVZ6Vk5NRTF3UTJWb2FVaDZjbVZUZWs1VVkzcHJZemxrSWo4K0lEeDRPbmh0Y0cxbGRHRWdlRzFzYm5NNmVEMGlZV1J2WW1VNmJuTTZiV1YwWVM4aUlIZzZlRzF3ZEdzOUlrRmtiMkpsSUZoTlVDQkRiM0psSURVdU5pMWpNRFkzSURjNUxqRTFOemMwTnl3Z01qQXhOUzh3TXk4ek1DMHlNem8wTURvME1pQWdJQ0FnSUNBZ0lqNGdQSEprWmpwU1JFWWdlRzFzYm5NNmNtUm1QU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh4T1RrNUx6QXlMekl5TFhKa1ppMXplVzUwWVhndGJuTWpJajRnUEhKa1pqcEVaWE5qY21sd2RHbHZiaUJ5WkdZNllXSnZkWFE5SWlJZ2VHMXNibk02ZUcxd1BTSm9kSFJ3T2k4dmJuTXVZV1J2WW1VdVkyOXRMM2hoY0M4eExqQXZJaUI0Yld4dWN6cDRiWEJOVFQwaWFIUjBjRG92TDI1ekxtRmtiMkpsTG1OdmJTOTRZWEF2TVM0d0wyMXRMeUlnZUcxc2JuTTZjM1JTWldZOUltaDBkSEE2THk5dWN5NWhaRzlpWlM1amIyMHZlR0Z3THpFdU1DOXpWSGx3WlM5U1pYTnZkWEpqWlZKbFppTWlJSGh0Y0RwRGNtVmhkRzl5Vkc5dmJEMGlRV1J2WW1VZ1VHaHZkRzl6YUc5d0lFTkRJREl3TVRVZ0tGZHBibVJ2ZDNNcElpQjRiWEJOVFRwSmJuTjBZVzVqWlVsRVBTSjRiWEF1YVdsa09qQTNSVVZHTnpWQk1UVkZRekV4UlRkQk0wRkVSakk1UmpjelFVTTROMFF5SWlCNGJYQk5UVHBFYjJOMWJXVnVkRWxFUFNKNGJYQXVaR2xrT2pBM1JVVkdOelZDTVRWRlF6RXhSVGRCTTBGRVJqSTVSamN6UVVNNE4wUXlJajRnUEhodGNFMU5Pa1JsY21sMlpXUkdjbTl0SUhOMFVtVm1PbWx1YzNSaGJtTmxTVVE5SW5odGNDNXBhV1E2TURkRlJVWTNOVGd4TlVWRE1URkZOMEV6UVVSR01qbEdOek5CUXpnM1JESWlJSE4wVW1WbU9tUnZZM1Z0Wlc1MFNVUTlJbmh0Y0M1a2FXUTZNRGRGUlVZM05Ua3hOVVZETVRGRk4wRXpRVVJHTWpsR056TkJRemczUkRJaUx6NGdQQzl5WkdZNlJHVnpZM0pwY0hScGIyNCtJRHd2Y21SbU9sSkVSajRnUEM5NE9uaHRjRzFsZEdFK0lEdy9lSEJoWTJ0bGRDQmxibVE5SW5JaVB6NXo0Qlo0QUFBREhVbEVRVlI0MnV6YlRVNFVRUnlHOFFZTWJMeUJLMW1LaVI4TDNSc1hmbkFCV2V1Z083bUlya3dFY2MwRkpHRmhPSUV4YW9oTG9ndHZJREdRQ1A0N05Ba2JvR2VZd3VxdTM1TzhtWVIwTWROVHoxUXExWGtuRGc0T0twVExCQUVJNEZzZ0FBZ0FBb0FBSUFBSUFBS0FBQ0FBQ0FBQ2dBQWdBQWdBQW9BQUlBQUlBQUtBQUNBQUNBQUNuTVRLeXNxMWVIa2FlUmk1MnZ4NU83SVJXWTE4TDNrQ0JvTkJQd1dJaVorT2wxZVJGNUhKRXk3Ymo3eUxMRVgrRFBrVzlmOS9IbmtTdVI2NTNETTNma2UySW11UnR5SEtYbWNFYUNaL1BYSy81WkROWm9Wb2U1TlhJaDhpTnd0WktMNUU1a09DWCtQK3g1T0pQdkRySVNhLzVsNnpXclQ5NVpjMCtWVnpyK3Z4dzVySlhvRDRrSFB4c2pqQzBIbzVuMnR4M1dKaGszL0VqWHJMMElVVm9ON3dUWTB3YnFvWmV4WUxCZThaRjdvZ3dJUEVZMjhYTE1DdExnZ3dtM2pzZE1FQ3pIUkJnUE93VitGQ1NTSEE5am5HL2lUSm1XY0QyUXV3Y1k2eEgxdGM4N2xnQWJhNklNRDd5TjhSeHRWalZsdGN0MWF3QUd2WkN6QVlER3BMbDBjWXV0elM4UHE2cndWTy9yY1J2OWYvc2dsY2FybWNIN0haakduRGJ1UnhkWGc4V2dxMThJL2l4N1hiQ1FHYUJ4ZjFKTDJwRGgvNG5NUitZL1g4a0p1NytrejhidVJsNUZOa3A0ZVR2dFBjVzMyUGQxSThCNmk1aU1mQjlmSHVzK3J3a0dlMm1lZ2Z6UXF4bW1KajB5VjYremg0Q0VFcUF2VHJIQUFkZ2dBRUFBRkFBQkFBQkFBQlFBQVFBQVFBQVVBQTlKdExxZDlBT3podnRJUHpSVHY0RkxTRE05OERhQWVQRiszZ1kyZ0haNzRDYUFlblF6dTQwZzdPWGdEdDRIUm9CeU4vQWJTRDA1NE5aQytBZG5BNnRJTXI3ZUM4QmRBT1RvWjJjSU4yY080Q2FBZVBCZTNnRXRBTzFnN3UzVGtBT2dRQkNBQUNnQUFnQUFnQUFvQUFJQUFJQUFLQUFPZzMyc0dGb3gyY0w5ckJwNkFkblBrZVFEdDR2R2dISDBNN09QTVZRRHM0SGRyQmxYWnc5Z0pvQjZkRE94ajVDNkFkblBac0lIc0J0SVBUb1IxY2FRZm5MWUIyY0RLMGd4dTBnM01YUUR0NExHZ0hsMER4N1dCVUJBQUJRQUFRQUFRQUFVQUFFQUFFQUFGQUFCQUFCQUFCUUFBUUFBUUFBVUFBRUFBRUFBRkFBQkFBQkFBQk1DVC9CQmdBOFNEUXlZN0FzWUVBQUFBQVNVVk9SSzVDWUlJPSc7XHJcbiAgICAgICAgICAgIGlmIChpc0NlbnRlcikge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5maWxsQ29sb3IgPSB0aGlzLm9wdGlvbnMubGlnaHRDb2xvcjtcclxuICAgICAgICAgICAgICAgIG5vZGUubGluZUNvbG9yID0gdGhpcy5vcHRpb25zLmVtcGhhc2VzQ29sb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUuaG92ZXJlZCkge1xyXG4gICAgICAgICAgICBub2RlLnJhZGl1cyA9IG5vZGUucmFkaXVzICogMS4yNTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cbmludGVyZmFjZSBIaWVrbkNvbmNlcHRUcmVlSW5zU2VhcmNoU2V0dGluZyBleHRlbmRzIEhpZWtuQWpheFNldHRpbmcge1xyXG4gICAgcGFyYW1OYW1lPzogc3RyaW5nXHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrbkNvbmNlcHRUcmVlSW5zU2V0dGluZyBleHRlbmRzIEhpZWtuQWpheFNldHRpbmcge1xyXG4gICAgZW5hYmxlPzogYm9vbGVhbjtcclxuICAgIG9uQ2xpY2s/OiBGdW5jdGlvbjtcclxuICAgIHNlYXJjaFNldHRpbmdzPzogSGlla25Db25jZXB0VHJlZUluc1NlYXJjaFNldHRpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrbkNvbmNlcHRUcmVlU2V0dGluZyBleHRlbmRzIEhpZWtuQmFzZVNldHRpbmcge1xyXG4gICAga2dOYW1lPzogc3RyaW5nO1xyXG4gICAgY29udGFpbmVyPzogc3RyaW5nO1xyXG4gICAgZ2V0QXN5bmNVcmw/OiBGdW5jdGlvbjtcclxuICAgIGlkS2V5Pzogc3RyaW5nO1xyXG4gICAgaW5pdElkPzogbnVtYmVyO1xyXG4gICAgbmFtZUtleT86IHN0cmluZztcclxuICAgIG9uTm9kZUNsaWNrPzogRnVuY3Rpb247XHJcbiAgICBub2RlSG92ZXJUb29scz86IHtcclxuICAgICAgICBpbmZvYm94U2V0dGluZz86IEhpZWtuTmV0Q2hhcnRJbmZvYm94U2V0dGluZyxcclxuICAgICAgICBncmFwaFNldHRpbmc/OiB7XHJcbiAgICAgICAgICAgIGVuYWJsZT86IGJvb2xlYW47XHJcbiAgICAgICAgICAgIGluc3RhbmNlRW5hYmxlPzogYm9vbGVhbjtcclxuICAgICAgICAgICAgaW5mb2JveFNldHRpbmc/OiBIaWVrbk5ldENoYXJ0SW5mb2JveFNldHRpbmc7XHJcbiAgICAgICAgICAgIGNvbmNlcHRHcmFwaFNldHRpbmdzPzogSGlla25Db25jZXB0R3JhcGhTZXR0aW5nXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGluc3RhbmNlPzogSGlla25Db25jZXB0VHJlZUluc1NldHRpbmcsXHJcbiAgICBuYW1lc3BhY2U/OiBzdHJpbmcsXHJcbiAgICBwSWRLZXk/OiBzdHJpbmcsXHJcbiAgICByZWFkQWxsPzogYm9vbGVhbixcclxuICAgIGhpZGRlbklkcz86IHsgc2VsZj86IG51bWJlcltdLCByZWM/OiBudW1iZXJbXSB9XHJcbn1cclxuY2xhc3MgSGlla25TREtDb25jZXB0VHJlZSB7XHJcbiAgICAkY29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAkZ3JhcGhDb250YWluZXI6IEpRdWVyeTtcclxuICAgICRpbnN0YW5jZUNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgdHJlZUlkOiBzdHJpbmc7XHJcbiAgICBjbGlja1RpbWVvdXQ6IGFueTtcclxuICAgIGlzRmlyc3QgPSB0cnVlO1xyXG4gICAgbGFzdFNlbGVjdGVkTm9kZTogYW55O1xyXG4gICAgc3RhcnRBc3luYyA9IGZhbHNlO1xyXG4gICAgdHJlZURiQ2xpY2sgPSBmYWxzZTtcclxuICAgIGluc3RhbmNlU2VhcmNoU2V0dGluZ3M6IGFueTtcclxuICAgIHpUcmVlU2V0dGluZ3M6IGFueTtcclxuICAgIHpUcmVlOiBhbnk7XHJcbiAgICB0cmVlSW5mb2JveDogSGlla25TREtJbmZvYm94O1xyXG4gICAgdGdjMkNvbmNlcHRHcmFwaDogSGlla25TREtDb25jZXB0R3JhcGg7XHJcbiAgICBpbnN0YW5jZVNlYXJjaDogYW55O1xyXG4gICAgb3B0aW9uczogSGlla25Db25jZXB0VHJlZVNldHRpbmc7XHJcbiAgICBkZWZhdWx0czogSGlla25Db25jZXB0VHJlZVNldHRpbmcgPSB7XHJcbiAgICAgICAgZ2V0QXN5bmNVcmw6ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHF1ZXJ5RGF0YTogYW55ID0ge307XHJcbiAgICAgICAgICAgIHF1ZXJ5RGF0YS5rZ05hbWUgPSB0aGlzLm9wdGlvbnMua2dOYW1lO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJlYWRBbGwpIHtcclxuICAgICAgICAgICAgICAgIHF1ZXJ5RGF0YS5pZCA9IHRoaXMuZ2V0TGFzdFNlbGVjdGVkTm9kZUlkKCkgfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHF1ZXJ5RGF0YS5pZCA9IHRoaXMuZ2V0TGFzdFNlbGVjdGVkTm9kZUlkKCkgfHwgdGhpcy5vcHRpb25zLmluaXRJZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBxdWVyeURhdGEub25seVN1YlRyZWUgPSB0aGlzLmlzRmlyc3QgPyAwIDogMTtcclxuICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgcXVlcnlEYXRhLCB0aGlzLm9wdGlvbnMucXVlcnlEYXRhKTtcclxuICAgICAgICAgICAgcmV0dXJuIEhpZWtuU0RLVXRpbHMuYnVpbGRVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwgKyAnY29uY2VwdCcsIHF1ZXJ5RGF0YSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpZEtleTogJ2lkJyxcclxuICAgICAgICBpbml0SWQ6IDAsXHJcbiAgICAgICAgbmFtZUtleTogJ25hbWUnLFxyXG4gICAgICAgIG9uTm9kZUNsaWNrOiAkLm5vb3AsXHJcbiAgICAgICAgbm9kZUhvdmVyVG9vbHM6IHtcclxuICAgICAgICAgICAgaW5mb2JveFNldHRpbmc6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ3JhcGhTZXR0aW5nOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VFbmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5mb2JveFNldHRpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGluc3RhbmNlOiB7XHJcbiAgICAgICAgICAgIGVuYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIG9uQ2xpY2s6ICQubm9vcFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmFtZXNwYWNlOiAnaGlla24tY29uY2VwdC10cmVlJyxcclxuICAgICAgICBwSWRLZXk6ICdwYXJlbnRJZCcsXHJcbiAgICAgICAgcmVhZEFsbDogZmFsc2UsXHJcbiAgICAgICAgaGlkZGVuSWRzOiB7c2VsZjogW10sIHJlYzogW119XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhpZWtuQ29uY2VwdFRyZWVTZXR0aW5nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLiRjb250YWluZXIgPSAkKHRoaXMub3B0aW9ucy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMudHJlZUlkID0gSGlla25TREtVdGlscy5yYW5kb21JZCh0aGlzLm9wdGlvbnMubmFtZXNwYWNlICsgJy0nKTtcclxuICAgICAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2hpZWtuLWNvbmNlcHQtdHJlZScpLmFwcGVuZCgnPHVsIGNsYXNzPVwienRyZWVcIiBpZD1cIicgKyB0aGlzLnRyZWVJZCArICdcIj48L3VsPicpO1xyXG4gICAgICAgIHRoaXMuelRyZWVTZXR0aW5ncyA9IHRoaXMudXBkYXRlWlRyZWVTZXR0aW5ncygpO1xyXG4gICAgICAgIHRoaXMuelRyZWUgPSAoPGFueT4kLmZuKS56VHJlZS5pbml0KHRoaXMuJGNvbnRhaW5lci5maW5kKCcuenRyZWUnKSwgdGhpcy56VHJlZVNldHRpbmdzKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm5vZGVIb3ZlclRvb2xzLmdyYXBoU2V0dGluZy5lbmFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5idWlsZEdyYXBoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubm9kZUhvdmVyVG9vbHMuaW5mb2JveFNldHRpbmcuZW5hYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJlZUluZm9ib3ggPSB0aGlzLmJ1aWxkSW5mb2JveCh0aGlzLm9wdGlvbnMubm9kZUhvdmVyVG9vbHMuaW5mb2JveFNldHRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmluc3RhbmNlLmVuYWJsZSkge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IEhpZWtuU0RLVXRpbHMucmFuZG9tSWQodGhpcy5vcHRpb25zLm5hbWVzcGFjZSArICctcHJvbXB0LScpO1xyXG4gICAgICAgICAgICB0aGlzLiRpbnN0YW5jZUNvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJoaWVrbi1pbnN0YW5jZS1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwiaGlla24taW5zdGFuY2UtcHJvbXB0XCIgaWQ9XCInICsgaWQgKyAnXCI+PC9kaXY+PGRpdiBjbGFzcz1cImhpZWtuLWluc3RhbmNlLWxpc3RcIj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0aGlzLiRpbnN0YW5jZUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VTZWFyY2hTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogJyMnICsgaWQsXHJcbiAgICAgICAgICAgICAgICBwcm9tcHRFbmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICflrp7kvovmkJzntKInLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2g6IChrdzogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbnM6IEhpZWtuQ29uY2VwdFRyZWVJbnNTZWFyY2hTZXR0aW5nID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbU5hbWU6ICdrdycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdGhpcy5vcHRpb25zLmJhc2VVcmwgKyAncHJvbXB0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2dOYW1lOiB0aGlzLm9wdGlvbnMua2dOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIG9wdGlvbnMsIHRoaXMub3B0aW9ucy5pbnN0YW5jZS5zZWFyY2hTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5mb3JtRGF0YVtvcHRpb25zLnBhcmFtTmFtZV0gPSBrdztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBIaWVrblNES1V0aWxzLmJ1aWxkVXJsKG9wdGlvbnMudXJsLCBvcHRpb25zLnF1ZXJ5RGF0YSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFGaWx0ZXI6IG9wdGlvbnMuZGF0YUZpbHRlciB8fCB0aGlzLm9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb3B0aW9ucy5mb3JtRGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGE6IGFueSwgdGV4dFN0YXR1czogc3RyaW5nLCBqcVhIUjogSlF1ZXJ5WEhSKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0ICRjb250YWluZXIgPSB0aGlzLnNlbGVjdCgnLmluc3RhbmNlLWxvYWRlci1jb250YWluZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmF0dHIoeydkYXRhLW1vcmUnOiAnMCcsICdkYXRhLXBhZ2UnOiAnMSd9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdJbnN0YW5jZUxpc3QoZGF0YSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcyAmJiBvcHRpb25zLnN1Y2Nlc3MoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMsIG5ld09wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIEhpZWtuU0RLVXRpbHMuYWpheChuZXdPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZVNlYXJjaCA9IG5ldyBoaWVrblByb21wdCh0aGlzLmluc3RhbmNlU2VhcmNoU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmJpbmRJbnN0YW5jZUV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZEhvdmVyRG9tKHRyZWVJZDogc3RyaW5nLCB0cmVlTm9kZTogYW55KSB7XHJcbiAgICAgICAgY29uc3Qgc09iaiA9IHRoaXMuc2VsZWN0KCcjJyArIHRyZWVOb2RlLnRJZCArICdfc3BhbicpO1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdCgnI2J1dHRvbi1jb250YWluZXJfJyArIHRyZWVOb2RlLnRJZCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0ICRjb250YWluZXIgPSAkKCc8c3BhbiBjbGFzcz1cImJ1dHRvbi1jb250YWluZXJcIiBpZD1cImJ1dHRvbi1jb250YWluZXJfJyArIHRyZWVOb2RlLnRJZCArICdcIiA+PC9zcGFuPicpO1xyXG4gICAgICAgIHNPYmouYWZ0ZXIoJGNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5vbk5vZGVIb3ZlcigkY29udGFpbmVyLCB0cmVlTm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgYmVmb3JlQXN5bmModHJlZUlkOiBzdHJpbmcsIHRyZWVOb2RlOiBhbnkpIHtcclxuICAgICAgICBpZiAodHJlZU5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEFzeW5jID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5sYXN0U2VsZWN0ZWROb2RlID0gdHJlZU5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYmluZEluc3RhbmNlRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3QoJy5oaWVrbi1pbnN0YW5jZS1saXN0Jykub24oJ3Njcm9sbCcsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKCQoZXZlbnQudGFyZ2V0KS5oZWlnaHQoKSArICQoZXZlbnQudGFyZ2V0KS5zY3JvbGxUb3AoKSA+ICQoZXZlbnQudGFyZ2V0KVswXS5zY3JvbGxIZWlnaHQgLSA1MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkSW5zdGFuY2VTZXJ2aWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlbGVjdCgnLmhpZWtuLWluc3RhbmNlLWxpc3QnKS5vbignY2xpY2snLCAnbGlbZGF0YS1pZF0nLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2RhdGEnKTtcclxuICAgICAgICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pbnN0YW5jZS5vbkNsaWNrKG5vZGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnVpbGRJbmZvYm94KGluZm9ib3hPcHRpb25zOiBIaWVrbkluZm9ib3hTZXR0aW5nKSB7XHJcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGJhc2VVcmw6IHRoaXMub3B0aW9ucy5iYXNlVXJsLFxyXG4gICAgICAgICAgICBkYXRhRmlsdGVyOiB0aGlzLm9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAga2dOYW1lOiB0aGlzLm9wdGlvbnMua2dOYW1lXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkLmV4dGVuZCh0cnVlLCBvcHRpb25zLCBpbmZvYm94T3B0aW9ucyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIaWVrblNES0luZm9ib3gob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUT0RPIHRvIHJlcGxhY2UgbW9kYWxcclxuICAgICAqICovXHJcbiAgICBwcml2YXRlIGJ1aWxkR3JhcGgoKSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBIaWVrblNES1V0aWxzLnJhbmRvbUlkKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UgKyAnLXRnYzItJyk7XHJcbiAgICAgICAgdGhpcy4kZ3JhcGhDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwibW9kYWwgZmFkZSBoaWVrbi1jb25jZXB0LXRyZWUtZ3JhcGgtbW9kYWxcIiBpZD1cIicgKyBzZWxlY3RvciArICctbW9kYWxcIiB0YWJpbmRleD1cIi0xXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbGFiZWxsZWRieT1cIlwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZyBtb2RhbC1sZ1wiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj48ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+JyArXHJcbiAgICAgICAgICAgICc8c3ZnIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZD1cIk0xOSA2LjQxTDE3LjU5IDUgMTIgMTAuNTkgNi40MSA1IDUgNi40MSAxMC41OSAxMiA1IDE3LjU5IDYuNDEgMTkgMTIgMTMuNDEgMTcuNTkgMTkgMTkgMTcuNTkgMTMuNDEgMTJ6XCIvPjwvc3ZnPicgK1xyXG4gICAgICAgICAgICAnPC9idXR0b24+JyArXHJcbiAgICAgICAgICAgICc8aDQgY2xhc3M9XCJtb2RhbC10aXRsZVwiPjxzcGFuIG5hbWU9XCJ0aXRsZVwiPjwvc3Bhbj48L2g0PjwvZGl2PjxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCI+PGRpdiBjbGFzcz1cIicgKyBzZWxlY3RvciArICdcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJGdyYXBoQ29udGFpbmVyKTtcclxuICAgICAgICBsZXQgc2V0dGluZ3M6IEhpZWtuQ29uY2VwdEdyYXBoU2V0dGluZyA9IHtcclxuICAgICAgICAgICAgc2VsZWN0b3I6ICcuJyArIHNlbGVjdG9yLFxyXG4gICAgICAgICAgICBiYXNlVXJsOiB0aGlzLm9wdGlvbnMuYmFzZVVybCxcclxuICAgICAgICAgICAgZGF0YUZpbHRlcjogdGhpcy5vcHRpb25zLmRhdGFGaWx0ZXIsXHJcbiAgICAgICAgICAgIGtnTmFtZTogdGhpcy5vcHRpb25zLmtnTmFtZSxcclxuICAgICAgICAgICAgaW5mb2JveFNldHRpbmc6IHRoaXMub3B0aW9ucy5ub2RlSG92ZXJUb29scy5ncmFwaFNldHRpbmcuaW5mb2JveFNldHRpbmcsXHJcbiAgICAgICAgICAgIGluc3RhbmNlRW5hYmxlOiB0aGlzLm9wdGlvbnMubm9kZUhvdmVyVG9vbHMuZ3JhcGhTZXR0aW5nLmluc3RhbmNlRW5hYmxlLFxyXG4gICAgICAgICAgICBwcm9tcHRTZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgZGF0YUZpbHRlcjogdGhpcy5vcHRpb25zLmRhdGFGaWx0ZXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgc2V0dGluZ3MsIHRoaXMub3B0aW9ucy5ub2RlSG92ZXJUb29scy5ncmFwaFNldHRpbmcuY29uY2VwdEdyYXBoU2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMudGdjMkNvbmNlcHRHcmFwaCA9IG5ldyBIaWVrbkNvbmNlcHRHcmFwaFNlcnZpY2Uoc2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGF0YUZpbHRlcih0cmVlSWQ6IHN0cmluZywgcGFyZW50Tm9kZTogYW55LCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRhdGFGaWx0ZXIpIHtcclxuICAgICAgICAgICAgZGF0YSA9IHRoaXMub3B0aW9ucy5kYXRhRmlsdGVyKGRhdGEsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmNvZGUgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgIGlmICghZGF0YS5kYXRhIHx8ICFkYXRhLmRhdGEucnNEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkYXRhID0gZGF0YS5kYXRhLnJzRGF0YTtcclxuICAgICAgICAgICAgY29uc3QgbGVuID0gZGF0YS5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgIXRoaXMub3B0aW9ucy5yZWFkQWxsICYmIChkYXRhW2ldLmlzUGFyZW50ID0gdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoXy5pbmRleE9mKHRoaXMub3B0aW9ucy5oaWRkZW5JZHMuc2VsZiwgZGF0YVtpXVt0aGlzLm9wdGlvbnMuaWRLZXldKSA8IDBcclxuICAgICAgICAgICAgICAgICAgICAmJiBfLmluZGV4T2YodGhpcy5vcHRpb25zLmhpZGRlbklkcy5yZWMsIGRhdGFbaV1bdGhpcy5vcHRpb25zLmlkS2V5XSkgPCAwXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgXy5pbmRleE9mKHRoaXMub3B0aW9ucy5oaWRkZW5JZHMucmVjLCBkYXRhW2ldW3RoaXMub3B0aW9ucy5wSWRLZXldKSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmVudE5vZGUgfHwgZGF0YVtpXVt0aGlzLm9wdGlvbnMuaWRLZXldICE9IHBhcmVudE5vZGVbdGhpcy5vcHRpb25zLmlkS2V5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChkYXRhW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoXy5pbmRleE9mKHRoaXMub3B0aW9ucy5oaWRkZW5JZHMucmVjLCBkYXRhW2ldW3RoaXMub3B0aW9ucy5wSWRLZXldKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhpZGRlbklkcy5yZWMucHVzaChkYXRhW2ldW3RoaXMub3B0aW9ucy5pZEtleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUuaXNQYXJlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBIaWVrblNES1V0aWxzLmVycm9yKGRhdGEubXNnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkcmF3SW5zdGFuY2VMaXN0KGluc3RhbmNlczogYW55W10sIGFwcGVuZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0ICRjb250YWluZXIgPSB0aGlzLiRpbnN0YW5jZUNvbnRhaW5lci5maW5kKCcuaGlla24taW5zdGFuY2UtbGlzdCB1bCcpO1xyXG4gICAgICAgIGxldCBodG1sID0gJCgnPHVsPjwvdWw+Jyk7XHJcbiAgICAgICAgaWYgKGluc3RhbmNlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBpbnN0YW5jZSBvZiBpbnN0YW5jZXMpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwuYXBwZW5kKCQoJzxsaSBkYXRhLWlkPVwiJyArIGluc3RhbmNlLmlkICsgJ1wiIHRpdGxlPVwiJyArIGluc3RhbmNlLm5hbWUgKyAnXCI+JyArIGluc3RhbmNlLm5hbWUgKyAnPC9saT4nKS5kYXRhKCdkYXRhJywgaW5zdGFuY2UpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWFwcGVuZCkge1xyXG4gICAgICAgICAgICBodG1sLmFwcGVuZCgnPGxpPuayoeacieaJvuWIsOebuOWFs+WunuS+izwvbGk+Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhcHBlbmQpIHtcclxuICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQoaHRtbC5jaGlsZHJlbigpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLmVtcHR5KCkuYXBwZW5kKGh0bWwuY2hpbGRyZW4oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXhwYW5kTm9kZXMobm9kZUlkOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gdGhpcy56VHJlZS5nZXROb2RlQnlQYXJhbSh0aGlzLm9wdGlvbnMuaWRLZXksIG5vZGVJZCk7XHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy56VHJlZS5leHBhbmROb2RlKG5vZGUsIHRydWUsIGZhbHNlLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSBub2RlLmdldFBhcmVudE5vZGUoKTtcclxuICAgICAgICAgICAgcGFyZW50Tm9kZSAmJiB0aGlzLmV4cGFuZE5vZGVzKHBhcmVudE5vZGVbdGhpcy5vcHRpb25zLmlkS2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QXN5bmNVcmwoKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLm9wdGlvbnMuZ2V0QXN5bmNVcmwgPT0gJ3N0cmluZycgPyB0aGlzLm9wdGlvbnMuZ2V0QXN5bmNVcmwgOiB0aGlzLm9wdGlvbnMuZ2V0QXN5bmNVcmwodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGFzdFNlbGVjdGVkTm9kZUlkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RTZWxlY3RlZE5vZGUgPyB0aGlzLmxhc3RTZWxlY3RlZE5vZGVbdGhpcy5vcHRpb25zLmlkS2V5XSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGFzdFNlbGVjdGVkSW5zdGFuY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0KCcuaGlla24taW5zdGFuY2UtbGlzdCBsaVtkYXRhLWlkXS5hY3RpdmUnKS5kYXRhKCdkYXRhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBsb2FkR3JhcGgoaWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudGdjMkNvbmNlcHRHcmFwaC5sb2FkKHtcclxuICAgICAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgICAgICBrZ1R5cGU6IDBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZWxvYWRJbnN0YW5jZSgpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdCgnLmhpZWtuLWluc3RhbmNlLWxpc3QnKS5odG1sKCc8dWw+PC91bD48ZGl2IGNsYXNzPVwiaW5zdGFuY2UtbG9hZGVyLWNvbnRhaW5lclwiIGRhdGEtbW9yZT1cIjFcIiBkYXRhLXBhZ2U9XCIxXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgdGhpcy5sb2FkSW5zdGFuY2VTZXJ2aWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBsb2FkSW5zdGFuY2VTZXJ2aWNlKCkge1xyXG4gICAgICAgIGNvbnN0ICRjb250YWluZXIgPSB0aGlzLnNlbGVjdCgnLmluc3RhbmNlLWxvYWRlci1jb250YWluZXInKTtcclxuICAgICAgICBpZiAoJGNvbnRhaW5lci5hdHRyKCdkYXRhLW1vcmUnKSAhPSAnMCcpIHtcclxuICAgICAgICAgICAgaWYgKCRjb250YWluZXIuZGF0YSgnaW5Mb2FkaW5nJykgIT0gMSkge1xyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lci5kYXRhKCdpbkxvYWRpbmcnLCAxKTtcclxuICAgICAgICAgICAgICAgIGxldCBvcHRpb25zOiBIaWVrbkNvbmNlcHRUcmVlSW5zU2V0dGluZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBxdWVyeURhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uY2VwdElkOiB0aGlzLmdldExhc3RTZWxlY3RlZE5vZGVJZCgpIHx8IHRoaXMub3B0aW9ucy5pbml0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRBbGw6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VObzogJGNvbnRhaW5lci5hdHRyKCdkYXRhLXBhZ2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVNpemU6IDE1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZ05hbWU6IHRoaXMub3B0aW9ucy5rZ05hbWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgb3B0aW9ucywgdGhpcy5vcHRpb25zLmluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogSGlla25TREtVdGlscy5idWlsZFVybChvcHRpb25zLnVybCwgb3B0aW9ucy5xdWVyeURhdGEpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFGaWx0ZXI6IG9wdGlvbnMuZGF0YUZpbHRlciB8fCB0aGlzLm9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YTogYW55LCB0ZXh0U3RhdHVzOiBzdHJpbmcsIGpxWEhSOiBKUXVlcnlYSFIsIG9yZ0RhdGE6IGFueSwgcGFyYW1zOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGQgPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZC5sZW5ndGggPD0gcGFyYW1zLnBhZ2VTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmF0dHIoeydkYXRhLW1vcmUnOiAwfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGQubGVuZ3RoID4gcGFyYW1zLnBhZ2VTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0luc3RhbmNlTGlzdChkLCBwYXJhbXMucGFnZU5vICE9IDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmF0dHIoeydkYXRhLXBhZ2UnOiBwYXJzZUludChwYXJhbXMucGFnZU5vLCAxMCkgKyAxfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcyAmJiBvcHRpb25zLnN1Y2Nlc3MoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IChqcVhIUjogSlF1ZXJ5WEhSLCB0ZXh0U3RhdHVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5kYXRhKCdpbkxvYWRpbmcnLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgJGljID0gdGhpcy5zZWxlY3QoJy5oaWVrbi1pbnN0YW5jZS1saXN0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkaWMuY2hpbGRyZW4oJ3VsJykuaGVpZ2h0KCkgPCAkaWMuaGVpZ2h0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZEluc3RhbmNlU2VydmljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29tcGxldGUgJiYgb3B0aW9ucy5jb21wbGV0ZShqcVhIUiwgdGV4dFN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB0aGF0OiAkY29udGFpbmVyWzBdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgbmV3T3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLCBuZXdPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIEhpZWtuU0RLVXRpbHMuYWpheChuZXdPcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBtb3JlIGluc3RhbmNlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uQXN5bmNTdWNjZXNzKGV2ZW50OiBFdmVudCwgdHJlZUlkOiBzdHJpbmcsIHRyZWVOb2RlOiBhbnkpIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHRyZWVOb2RlO1xyXG4gICAgICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25Ob2RlQ2xpY2sobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgbm9kZS5pc1BhcmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnpUcmVlLnVwZGF0ZU5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgIEhpZWtuU0RLVXRpbHMuaW5mbygn5b2T5YmN5qaC5b+15rKh5pyJ5a2Q5qaC5b+1Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGFuZE5vZGVzKHRoaXMuZ2V0TGFzdFNlbGVjdGVkTm9kZUlkKCkgfHwgdGhpcy5vcHRpb25zLmluaXRJZCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5nZXRMYXN0U2VsZWN0ZWROb2RlSWQoKSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHRoaXMuelRyZWUuZ2V0Tm9kZUJ5UGFyYW0odGhpcy5vcHRpb25zLmlkS2V5LCB0aGlzLm9wdGlvbnMuaW5pdElkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuelRyZWUuc2VsZWN0Tm9kZShub2RlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Ob2RlQ2xpY2sobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuelRyZWUuZ2V0Tm9kZUJ5UGFyYW0odGhpcy5vcHRpb25zLmlkS2V5LCB0aGlzLm9wdGlvbnMuaW5pdElkKTtcclxuICAgICAgICB0aGlzLmFkZEhvdmVyRG9tKHRyZWVJZCwgcm9vdCk7XHJcbiAgICAgICAgdGhpcy5pc0ZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGFydEFzeW5jID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb25DbGljayhldmVudDogRXZlbnQsIHRyZWVJZDogc3RyaW5nLCB0cmVlTm9kZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy5jbGlja1RpbWVvdXQgJiYgY2xlYXJUaW1lb3V0KHRoaXMuY2xpY2tUaW1lb3V0KTtcclxuICAgICAgICB0aGlzLmNsaWNrVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3RlZE5vZGUgPSB0cmVlTm9kZTtcclxuICAgICAgICAgICAgdGhpcy5vbk5vZGVDbGljayh0cmVlTm9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMudHJlZURiQ2xpY2sgPSBmYWxzZTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG5cclxuICAgIG9uTm9kZUJ1dHRvbkNsaWNrKCRidXR0b246IEpRdWVyeSwgdHJlZU5vZGU6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0KCcudHJlZS1idXR0b24tYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3RyZWUtYnV0dG9uLWFjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMuelRyZWUuc2VsZWN0Tm9kZSh0cmVlTm9kZSk7XHJcbiAgICAgICAgJGJ1dHRvbi5hZGRDbGFzcygndHJlZS1idXR0b24tYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5sYXN0U2VsZWN0ZWROb2RlID0gdHJlZU5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgb25Ob2RlQ2xpY2sobm9kZTogYW55KSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbnN0YW5jZS5lbmFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWxvYWRJbnN0YW5jZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMub25Ob2RlQ2xpY2sobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUT0RPIHRvIHJlcGxhY2UgdG9vbHRpcHN0ZXIsIG1vZGFsXHJcbiAgICAgKiAqL1xyXG4gICAgb25Ob2RlSG92ZXIoJGNvbnRhaW5lcjogSlF1ZXJ5LCB0cmVlTm9kZTogYW55KSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5vcHRpb25zLm5vZGVIb3ZlclRvb2xzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5vcHRpb25zLm5vZGVIb3ZlclRvb2xzW2tleV07XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT0gJ2dyYXBoJyAmJiB2YWx1ZS5lbmFibGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0ICRncmFwaEJ0biA9ICQoJzxzcGFuIGNsYXNzPVwiYnV0dG9uXCIgdGl0bGU9XCLlm77osLHlj6/op4bljJZcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHN2ZyB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxwYXRoIGQ9XCJNODkyLjc5MDA4MyAxMDA5LjY0NzU1MWMtNTguMzU1OTA0IDMxLjM2NjE3Ni0xMzEuMTYxMjY2IDkuNjExMjE1LTE2Mi42MTA2NjMtNDguNTkxMzAxLTI0LjM0Mjk3Mi0nICtcclxuICAgICAgICAgICAgICAgICAgICAnNDUuMDQ1NDMyLTE2Ljc2NDk2Mi05OC43MDM0MjYgMTQuOTQ3MTUzLTEzNS4yMTQ2Mkw2OTguODYyMTk4IDczOS4wMTI3MDZjLTIzLjI0NjQxMyA3Ljc2NDAzNC00OC4xNTcyNDYgMTEnICtcclxuICAgICAgICAgICAgICAgICAgICAnLjk3MDc3Ny03NC4wNjY3MzIgMTEuOTcwNzc3LTExNC4wNzMyMTEgMC0yMDguODE3OTI1LTgxLjYyNjc5My0yMjcuNTQ1OTI0LTE4OC45MTY2NzJsLTk2LjI5MzI3OS0wLjU2MTMzNGMnICtcclxuICAgICAgICAgICAgICAgICAgICAnLTE2Ljc2NDk2MiA0NS45NjQxMjctNjAuOTUwNDQyIDc4Ljc5MDc1LTExMi44Mjk3OSA3OC43OTA3NS02Ni4yOTEyNzUgMC0xMjAuMDMyNDktNTMuNjAwODgyLTEyMC4wMzI0OS0xMTknICtcclxuICAgICAgICAgICAgICAgICAgICAnLjcyNTcxNSAwLTY2LjExOTkzOCA1My43NDEyMTUtMTE5LjcyNTcxNSAxMjAuMDMyNDktMTE5LjcyNTcxNSA1MS4zMDQ5NiAwIDk1LjA2NDU0NCAzMi4xMTE5MDIgMTEyLjI0MjM0OCA3JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzcuMjc5NzE3bDk3LjkxMzY0MSAwLjU2Nzg2MUM0MTkuMjQxMTExIDM3NC4xMzczNjggNTEyLjY4MDM5NyAyOTUuMjg3ODczIDYyNC43OTU0NjYgMjk1LjI4Nzg3M2MxOC4zNzU1MzQgMCcgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgMzYuMjQ4NDc3IDIuMTI5NDggNTMuMzgyMjIyIDYuMTMyMjQ5bDM5LjAyMjUxMi05My4xNTIwOTJjLTM2LjI0ODQ3Ny0zMi45MzQzMjEtNDkuODk2NzI5LTg2LjE3Nzg0Mi0zMC4xNzQ5JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzczLTEzNC4wNDEzNjcgMjUuMjA0NTU1LTYxLjE1NDQxNSA5NS4zMzg2ODQtOTAuMzYwMTA4IDE1Ni42NTEzODMtNjUuMjIwODI0IDYxLjMxOTIyNiAyNS4xMzI3NTYgOTAuNTk2NzE2IDknICtcclxuICAgICAgICAgICAgICAgICAgICAnNS4wODkwMjEgNjUuMzk4Njg5IDE1Ni4yNDM0MzctMTkuNTA0NzI5IDQ3LjMzNDgyNi02NS45MjA4NiA3NS40OTQ1NDQtMTE0LjMyNjEzNyA3NC4xNzYwNjJsLTM5Ljk1OTE1NyA5NS4zJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzgyNzQzYzYwLjkyNDMzNCA0MS4wMTgxODYgMTAwLjkyMTAyMiAxMTAuMDYyMjgzIDEwMC45MjEwMjIgMTg4LjMyNDMzNCAwIDcwLjYyMDQwMi0zMi41NjU1MzggMTMzLjczNjIyMy04My42JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzg2MTA2IDE3NS41MjYyNDNsNDYuNDA5NjA0IDg3LjEwNzk2YzQ4LjUyMTEzNC03LjA4Njg0MyA5OC40NTUzOTQgMTYuMTMzNDYxIDEyMy4wNjU5NzkgNjEuNjgzMTE0Qzk3Mi45NTgwNiA5MCcgK1xyXG4gICAgICAgICAgICAgICAgICAgICc1LjY1ODc3MyA5NTEuMTQ1OTg2IDk3OC4yNzMyMTcgODkyLjc5MDA4MyAxMDA5LjY0NzU1MUw4OTIuNzkwMDgzIDEwMDkuNjQ3NTUxek04OTIuNzkwMDgzIDEwMDkuNjQ3NTUxXCI+PC9wYXRoPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L3N2Zz4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPC9zcGFuPicpO1xyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJGdyYXBoQnRuKTtcclxuICAgICAgICAgICAgICAgICRncmFwaEJ0bi5vbignY2xpY2snLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcy4kZ3JhcGhDb250YWluZXIpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkR3JhcGgodHJlZU5vZGVbdGhpcy5vcHRpb25zLmlkS2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT0gJ2luZm9ib3gnICYmIHZhbHVlLmVuYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgJGluZm9ib3hCdG4gPSAkKCc8c3BhbiBjbGFzcz1cImJ1dHRvblwiIHRpdGxlPVwi55+l6K+G5Y2h54mHXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxzdmcgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8cGF0aCBkPVwiTTYzOC41OTYyMTEgMTkxLjkzNjE5MXEzMC42MjgxMTYgMCA1NC42MjAxNCAxMy4yNzIxODN0NDEuMzQ3OTU2IDMyLjY2OTk5IDI2LjU0NDM2NyA0MS44NTg0MicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc1IDkuMTg4NDM1IDM5LjgxNjU1bDAgNTc2LjgyOTUxMXEwIDI5LjYwNzE3OC0xMS43NDA3NzggNTMuMDg4NzM0dC0zMC42MjgxMTYgMzkuODE2NTUtNDIuMzY4ODkzIDI1LjUnICtcclxuICAgICAgICAgICAgICAgICAgICAnMjM0My00Ni45NjMxMTEgOS4xODg0MzVsLTUwMy4zMjIwMzQgMHEtMTkuMzk3ODA3IDAtNDIuMzY4ODkzLTExLjIzMDMwOXQtNDIuODc5MzYyLTI5LjYwNzE3OC0zMy4xODA0JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzU5LTQyLjM2ODg5My0xMy4yNzIxODMtNDguNDk0NTE2bDAtNTY4LjY2MjAxNHEwLTIxLjQzOTY4MSAxMC4yMDkzNzItNDQuNDEwNzY4dDI2LjU0NDM2Ny00Mi4zNjg4OTMgMzcnICtcclxuICAgICAgICAgICAgICAgICAgICAnLjc3NDY3Ni0zMi4xNTk1MjEgNDQuOTIxMjM2LTEyLjc2MTcxNWw1MTUuNTczMjggMHpNNTc4LjM2MDkxNyA4MzAuMDIxOTM0cTI2LjU0NDM2NyAwIDQ1LjQzMTcwNS0xOC4zJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzc2ODY5dDE4Ljg4NzMzOC00NC45MjEyMzYtMTguODg3MzM4LTQ1LjQzMTcwNS00NS40MzE3MDUtMTguODg3MzM4bC0zODIuODUxNDQ2IDBxLTI2LjU0NDM2NyAwLTQ1LjQzMScgK1xyXG4gICAgICAgICAgICAgICAgICAgICc3MDUgMTguODg3MzM4dC0xOC44ODczMzggNDUuNDMxNzA1IDE4Ljg4NzMzOCA0NC45MjEyMzYgNDUuNDMxNzA1IDE4LjM3Njg2OWwzODIuODUxNDQ2IDB6TTU3OC4zNjA5MTcgNScgK1xyXG4gICAgICAgICAgICAgICAgICAgICc3NC43ODc2MzdxMjYuNTQ0MzY3IDAgNDUuNDMxNzA1LTE4LjM3Njg2OXQxOC44ODczMzgtNDQuOTIxMjM2LTE4Ljg4NzMzOC00NS40MzE3MDUtNDUuNDMxNzA1LTE4Ljg4NzMnICtcclxuICAgICAgICAgICAgICAgICAgICAnMzhsLTM4Mi44NTE0NDYgMHEtMjYuNTQ0MzY3IDAtNDUuNDMxNzA1IDE4Ljg4NzMzOHQtMTguODg3MzM4IDQ1LjQzMTcwNSAxOC44ODczMzggNDQuOTIxMjM2IDQ1LjQzMTcnICtcclxuICAgICAgICAgICAgICAgICAgICAnMDUgMTguMzc2ODY5bDM4Mi44NTE0NDYgMHpNNzU5LjA2NjggMHE0My45MDAyOTkgMCA4MC42NTQwMzggMjYuMDMzODk4dDYzLjgwODU3NCA2NC4zMTkwNDMgNDIuMzY4ODkzIDgyLicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc2OTU5MTIgMTUuMzE0MDU4IDgxLjE2NDUwNmwwIDU0Mi4xMTc2NDdxMCAyMS40Mzk2ODEtMTIuNzYxNzE1IDM5LjMwNjA4MnQtMzEuMTM4NTg0IDMwLjYyODExNi0zOS44MTYnICtcclxuICAgICAgICAgICAgICAgICAgICAnNTUgMjAuNDE4NzQ0LTM5LjgxNjU1IDcuNjU3MDI5bC00LjA4Mzc0OSAwIDAtNjA5LjQ5OTUwMXEtOC4xNjc0OTgtNzAuNDQ0NjY2LTQzLjkwMDI5OS0xMDguMjE5MzQydC0nICtcclxuICAgICAgICAgICAgICAgICAgICAnOTQuOTQ3MTU5LTQ5LjAwNDk4NWwtNDk4LjIxNzM0OCAwcTEuMDIwOTM3LTIuMDQxODc0IDEuMDIwOTM3LTcuMTQ2NTYgMC0yMC40MTg3NDQgMTIuMjUxMjQ2LTQxLjg1ODQyJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzV0MzIuMTU5NTIxLTM4Ljc5NTYxMyA0NC40MTA3NjgtMjguNTg2MjQxIDQ5LjAwNDk4NS0xMS4yMzAzMDlsNDIzLjY4ODkzMyAwelwiPjwvcGF0aD4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPC9zdmc+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgICAgICRjb250YWluZXIuYXBwZW5kKCRpbmZvYm94QnRuKTtcclxuICAgICAgICAgICAgICAgICg8YW55PiRpbmZvYm94QnRuKS50b29sdGlwc3Rlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgc2lkZTogWydib3R0b20nXSxcclxuICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3Rvb2x0aXBzdGVyLXNoYWRvdycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IDE2LFxyXG4gICAgICAgICAgICAgICAgICAgIGludGVyYWN0aXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXI6ICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ0xvYWRpbmcuLi4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uQmVmb3JlOiAoaW5zdGFuY2U6IGFueSwgaGVscGVyOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgJG9yaWdpbiA9ICQoaGVscGVyLm9yaWdpbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkb3JpZ2luLmRhdGEoJ2xvYWRlZCcpICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IHRyZWVOb2RlW3RoaXMub3B0aW9ucy5pZEtleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyZWVJbmZvYm94LmxvYWQoaWQsIChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCAkY29udGFpbmVyID0gdGhpcy50cmVlSW5mb2JveC5idWlsZEluZm9ib3goZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmNvbnRlbnQoJGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJlZUluZm9ib3guaW5pdEV2ZW50KCRjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmNvbnRlbnQoJ+ayoeacieW9k+WJjeamguW/teeahOefpeivhuWNoeeJh+S/oeaBrycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkb3JpZ2luLmRhdGEoJ2xvYWRlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmNvbnRlbnQoJ3JlYWQgZGF0YSBmYWlsZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkaW5mb2JveEJ0bi5vbignY2xpY2snLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSgkY29udGFpbmVyLCB0cmVlTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJlbW92ZUhvdmVyRG9tKHRyZWVJZDogc3RyaW5nLCB0cmVlTm9kZTogYW55KSB7XHJcbiAgICAgICAgaWYgKHRyZWVOb2RlLmxldmVsID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCAkY29udGFpbmVyID0gdGhpcy5zZWxlY3QoJyNidXR0b24tY29udGFpbmVyXycgKyB0cmVlTm9kZS50SWQpO1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLmNoaWxkcmVuKCkub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Qoc2VsZWN0b3I6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkKHRoaXMub3B0aW9ucy5jb250YWluZXIpLmZpbmQoc2VsZWN0b3IpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVpUcmVlU2V0dGluZ3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXN5bmM6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHVybDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEFzeW5jVXJsKCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YUZpbHRlcjogKHRyZWVJZDogc3RyaW5nLCBwYXJlbnROb2RlOiBhbnksIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFGaWx0ZXIodHJlZUlkLCBwYXJlbnROb2RlLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZ2V0J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2aWV3OiB7XHJcbiAgICAgICAgICAgICAgICBzaG93TGluZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBzaG93SWNvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBleHBhbmRTcGVlZDogJ2Zhc3QnLFxyXG4gICAgICAgICAgICAgICAgZGJsQ2xpY2tFeHBhbmQ6ICh0cmVlSWQ6IHN0cmluZywgdHJlZU5vZGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVlTm9kZS5sZXZlbCA+IDA7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRNdWx0aTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhZGRIb3ZlckRvbTogKHRyZWVJZDogc3RyaW5nLCB0cmVlTm9kZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRIb3ZlckRvbSh0cmVlSWQsIHRyZWVOb2RlKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICByZW1vdmVIb3ZlckRvbTogKHRyZWVJZDogc3RyaW5nLCB0cmVlTm9kZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVIb3ZlckRvbSh0cmVlSWQsIHRyZWVOb2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IHtcclxuICAgICAgICAgICAgICAgIGJlZm9yZUFzeW5jOiAodHJlZUlkOiBzdHJpbmcsIHRyZWVOb2RlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5iZWZvcmVBc3luYyh0cmVlSWQsIHRyZWVOb2RlKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkFzeW5jU3VjY2VzczogKGV2ZW50OiBFdmVudCwgdHJlZUlkOiBzdHJpbmcsIHRyZWVOb2RlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbkFzeW5jU3VjY2VzcyhldmVudCwgdHJlZUlkLCB0cmVlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25DbGljazogKGV2ZW50OiBFdmVudCwgdHJlZUlkOiBzdHJpbmcsIHRyZWVOb2RlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbkNsaWNrKGV2ZW50LCB0cmVlSWQsIHRyZWVOb2RlKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkRibENsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmVlRGJDbGljayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIHNpbXBsZURhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcElkS2V5OiB0aGlzLm9wdGlvbnMucElkS2V5LFxyXG4gICAgICAgICAgICAgICAgICAgIGlkS2V5OiB0aGlzLm9wdGlvbnMuaWRLZXlcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBrZXk6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm9wdGlvbnMubmFtZUtleVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxuZGVjbGFyZSBjb25zdCBoaWVrbmpzOiBhbnk7XHJcbmRlY2xhcmUgY29uc3QgbW9tZW50OiBhbnk7XHJcblxuaW50ZXJmYWNlIEhpZWtuRGlzYW1iaWd1YXRlU2V0dGluZyBleHRlbmRzIEhpZWtuQWpheFNldHRpbmcge1xyXG59XHJcblxyXG5jbGFzcyBIaWVrblNES0Rpc2FtYmlndWF0ZSB7XHJcbiAgICBzdGF0aWMgZGVmYXVsdHM6IEhpZWtuRGlzYW1iaWd1YXRlU2V0dGluZyA9IHtcclxuICAgICAgICBxdWVyeURhdGE6e1xyXG4gICAgICAgICAgICB1c2VDb25jZXB0OiB0cnVlLFxyXG4gICAgICAgICAgICB1c2VFbnRpdHk6IHRydWUsXHJcbiAgICAgICAgICAgIHVzZUF0dHI6IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHN0YXRpYyBsb2FkKG9wdGlvbnM6IEhpZWtuRGlzYW1iaWd1YXRlU2V0dGluZykge1xyXG4gICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgSGlla25TREtEaXNhbWJpZ3VhdGUuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHF1ZXJ5RGF0YSA9IG9wdGlvbnMucXVlcnlEYXRhIHx8IHt9O1xyXG4gICAgICAgIGxldCBmb3JtRGF0YSA9IG9wdGlvbnMuZm9ybURhdGEgfHwge307XHJcbiAgICAgICAgbGV0IG5ld09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHVybDogSGlla25TREtVdGlscy5idWlsZFVybChvcHRpb25zLmJhc2VVcmwgKyAnZGlzYW1iaWd1YXRlJywgcXVlcnlEYXRhKSxcclxuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGZvcm1EYXRhLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbmV3T3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLCBuZXdPcHRpb25zKTtcclxuICAgICAgICBIaWVrblNES1V0aWxzLmFqYXgobmV3T3B0aW9ucyk7XHJcbiAgICB9O1xyXG59XG5pbnRlcmZhY2UgSGlla25JbmZvYm94U2V0dGluZyBleHRlbmRzIEhpZWtuQmFzZVNldHRpbmcge1xyXG4gICAga2dOYW1lPzogc3RyaW5nO1xyXG4gICAgYXV0b0xlbj86IGJvb2xlYW47XHJcbiAgICBhdHRzPzogeyB2aXNpYmxlOiBudW1iZXJbXSwgaGlkZGVuOiBudW1iZXJbXSB9O1xyXG4gICAgZW5hYmxlTGluaz86IGJvb2xlYW47XHJcbiAgICBpbWFnZVByZWZpeD86IHN0cmluZztcclxuICAgIG9uTG9hZD86IEZ1bmN0aW9uO1xyXG4gICAgb25GYWlsZWQ/OiBGdW5jdGlvbjtcclxuICAgIHNlbGVjdG9yPzogc3RyaW5nO1xyXG4gICAgY2hhbmdlSW5mb2JveD86IEZ1bmN0aW9uO1xyXG59XHJcblxyXG5jbGFzcyBIaWVrblNES0luZm9ib3gge1xyXG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uID0gJC5ub29wO1xyXG4gICAgZGVmYXVsdHM6IEhpZWtuSW5mb2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgYXR0czoge3Zpc2libGU6IFtdLCBoaWRkZW46IFtdfSxcclxuICAgICAgICBlbmFibGVMaW5rOiBmYWxzZSxcclxuICAgICAgICBhdXRvTGVuOiB0cnVlLFxyXG4gICAgICAgIG9uTG9hZDogJC5ub29wLFxyXG4gICAgICAgIG9uRmFpbGVkOiAkLm5vb3BcclxuICAgIH07XHJcbiAgICBvcHRpb25zOiBIaWVrbkluZm9ib3hTZXR0aW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhpZWtuSW5mb2JveFNldHRpbmcpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGFuZ2VJbmZvYm94KGlkOiBIaWVrbklkVHlwZSkge1xyXG4gICAgICAgIHRoaXMubG9hZChpZCwgdGhpcy5jYWxsYmFjayk7XHJcbiAgICB9O1xyXG5cclxuICAgIGluaXRFdmVudCgkY29udGFpbmVyOiBKUXVlcnkpIHtcclxuICAgICAgICAkY29udGFpbmVyLm9uKCdjbGljaycsICcuaGlla24taW5mb2JveC1saW5rJywgKGV2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cignZGF0YS1pZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuY2hhbmdlSW5mb2JveCA/IHRoaXMub3B0aW9ucy5jaGFuZ2VJbmZvYm94KGlkLCB0aGlzKSA6IHRoaXMuY2hhbmdlSW5mb2JveChpZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRjb250YWluZXIub24oJ2NsaWNrJywgJy5oaWVrbi1pbmZvYm94LWluZm8tZGV0YWlsIGEnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnLmhpZWtuLWluZm9ib3gtaW5mby1kZXRhaWwnKS50b2dnbGVDbGFzcygnb24nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJ1aWxkRW50aXR5KGVudGl0eTogYW55LCBidWlsZExpbms6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBtZWFuaW5nVGFnID0gZW50aXR5Lm1lYW5pbmdUYWcgPyAnKCcgKyBlbnRpdHkubWVhbmluZ1RhZyArICcpJyA6ICcnO1xyXG4gICAgICAgIGNvbnN0IGh0bWwgPSAnPHNwYW4gY2xhc3M9XCJoaWVrbi1pbmZvYm94LW5hbWVcIj4nICsgZW50aXR5Lm5hbWUgKyAnPHNwYW4gY2xhc3M9XCJoaWVrbi1pbmZvYm94LW1lYW5pbmdUYWdcIj4nICsgbWVhbmluZ1RhZyArICc8L3NwYW4+PC9zcGFuPic7XHJcbiAgICAgICAgaWYgKGJ1aWxkTGluayAmJiB0aGlzLm9wdGlvbnMuZW5hYmxlTGluaykge1xyXG4gICAgICAgICAgICByZXR1cm4gJzxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImhpZWtuLWluZm9ib3gtbGlua1wiIGRhdGEtaWQ9XCInICsgZW50aXR5LmlkICsgJ1wiPicgKyBodG1sICsgJzwvYT4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJ1aWxkRXh0cmEoZXh0cmE6IEhpZWtuS1YpIHtcclxuICAgICAgICBsZXQgZGV0YWlsID0gZXh0cmEudiB8fCAnLSc7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvTGVuKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1heCA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuYXV0b0xlbiA9PSAnbnVtYmVyJyA/IHRoaXMub3B0aW9ucy5hdXRvTGVuIDogODA7XHJcbiAgICAgICAgICAgIGlmIChleHRyYS52Lmxlbmd0aCA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgZGV0YWlsID0gJzxzcGFuIGNsYXNzPVwiaGlla24taW5mb2JveC1pbmZvLWRldGFpbC1zaG9ydFwiPicgKyBleHRyYS52LnN1YnN0cmluZygwLCBtYXgpICsgJzxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIj7mn6XnnIvlhajpg6gmZ3Q7Jmd0OzwvYT48L3NwYW4+PHNwYW4gY2xhc3M9XCJoaWVrbi1pbmZvYm94LWluZm8tZGV0YWlsLWxvbmdcIj4nICsgZXh0cmEudiArICc8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCI+5pS26LW3Jmx0OyZsdDs8L2E+PC9zcGFuPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICc8dHI+PHRkIGNsYXNzPVwiaGlla24taW5mb2JveC1pbmZvLWxhYmVsXCI+JyArIGV4dHJhLmsgKyAnPC90ZD48dGQgY2xhc3M9XCJoaWVrbi1pbmZvYm94LWluZm8tZGV0YWlsXCI+JyArIGRldGFpbCArICc8L3RkPjwvdHI+JztcclxuICAgIH1cclxuXHJcbiAgICBsb2FkKGlkOiBIaWVrbklkVHlwZSwgY2FsbGJhY2s6IEZ1bmN0aW9uLCBvbkZhaWxlZD86IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gdGhpcy5vcHRpb25zLnF1ZXJ5RGF0YSB8fCB7fTtcclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IHRoaXMub3B0aW9ucy5mb3JtRGF0YSB8fCB7fTtcclxuICAgICAgICBmb3JtRGF0YS5pZCA9IGlkO1xyXG4gICAgICAgIGZvcm1EYXRhLmtnTmFtZSA9IHRoaXMub3B0aW9ucy5rZ05hbWU7XHJcbiAgICAgICAgSGlla25TREtVdGlscy5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBIaWVrblNES1V0aWxzLmJ1aWxkVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsICsgJ2luZm9ib3gnLCBxdWVyeURhdGEpLFxyXG4gICAgICAgICAgICB0eXBlOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGZvcm1EYXRhLFxyXG4gICAgICAgICAgICBkYXRhRmlsdGVyOiB0aGlzLm9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGFbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0ICRjb250YWluZXIgPSB0aGlzLmJ1aWxkSW5mb2JveChkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzLm9wdGlvbnMuc2VsZWN0b3IpLmh0bWwoJGNvbnRhaW5lclswXS5vdXRlckhUTUwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRFdmVudCgkY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdzZWxlY3RvciBvciBjYWxsYmFjayBjYW4gbm90IGJlIG51bGwnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uTG9hZChkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvbkZhaWxlZCB8fCAhb25GYWlsZWQoZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uRmFpbGVkKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IChqcVhIUjogSlF1ZXJ5WEhSKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW9uRmFpbGVkIHx8ICFvbkZhaWxlZChudWxsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZhaWxlZChudWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBidWlsZEluZm9ib3goZGF0YTogYW55KSB7XHJcbiAgICAgICAgY29uc3QgJGluZm94Ym94ID0gJCgnPGRpdiBjbGFzcz1cImhpZWtuLWluZm9ib3hcIj48L2Rpdj4nKTtcclxuICAgICAgICBpZiAoZGF0YS5zZWxmKSB7XHJcbiAgICAgICAgICAgICRpbmZveGJveC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJoaWVrbi1pbmZvYm94LWhlYWRcIj48L2Rpdj48ZGl2IGNsYXNzPVwiaGlla24taW5mb2JveC1ib2R5XCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGJhc2VFbnRpdHkgPSB0aGlzLmJ1aWxkRW50aXR5KGRhdGEuc2VsZiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAkaW5mb3hib3guZmluZCgnLmhpZWtuLWluZm9ib3gtaGVhZCcpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhpZWtuLWluZm9ib3gtdGl0bGVcIj4nICsgYmFzZUVudGl0eSArICc8L2Rpdj4nKTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuc2VsZi5pbWcpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdVbHJsID0gZGF0YS5zZWxmLmltZztcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNlbGYuaW1nLmluZGV4T2YoJ2h0dHAnKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1nVWxybCA9IEhpZWtuU0RLVXRpbHMucWluaXVJbWcodGhpcy5vcHRpb25zLmltYWdlUHJlZml4ICsgZGF0YS5zZWxmLmltZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkaW5mb3hib3guZmluZCgnLmhpZWtuLWluZm9ib3gtaGVhZCcpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhpZWtuLWluZm9ib3gtaW1nXCI+PGltZyBzcmM9XCInICsgaW1nVWxybCArICdcIiBhbHQ9XCJcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5zZWxmLmV4dHJhKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmlzaWJsZSA9IHRoaXMub3B0aW9ucy5hdHRzLnZpc2libGUgfHwgW107XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoaWRkZW4gPSB0aGlzLm9wdGlvbnMuYXR0cy5oaWRkZW4gfHwgW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGkgaW4gZGF0YS5zZWxmLmV4dHJhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuc2VsZi5leHRyYS5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRyYSA9IGRhdGEuc2VsZi5leHRyYVtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCh2aXNpYmxlLmxlbmd0aCAmJiBfLmluZGV4T2YodmlzaWJsZSwgZXh0cmEuaykgPj0gMCkgfHwgKGhpZGRlbi5sZW5ndGggJiYgXy5pbmRleE9mKGhpZGRlbiwgZXh0cmEuaykgPCAwKSB8fCAoIXZpc2libGUubGVuZ3RoICYmICFoaWRkZW4ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLmJ1aWxkRXh0cmEoZXh0cmEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuYXR0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbSBpbiBkYXRhLmF0dHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuYXR0cy5oYXNPd25Qcm9wZXJ0eShtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0ID0gZGF0YS5hdHRzW21dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxpcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBqIGluIGF0dC52KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dC52Lmhhc093blByb3BlcnR5KGopKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpcyArPSAnPGxpPicgKyB0aGlzLmJ1aWxkRW50aXR5KGF0dC52W2pdLCB0cnVlKSArICc8L2xpPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZpc2libGUubGVuZ3RoICYmIF8uaW5kZXhPZih2aXNpYmxlLCBhdHQuaykgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx0cj48dGQgY2xhc3M9XCJoaWVrbi1pbmZvYm94LWluZm8tbGFiZWxcIj4nICsgYXR0LmsgKyAnPC90ZD48dGQgY2xhc3M9XCJoaWVrbi1pbmZvYm94LWluZm8tZGV0YWlsXCI+JyArIGxpcyArICc8L3RkPjwvdHI+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGlkZGVuLmxlbmd0aCAmJiBfLmluZGV4T2YoaGlkZGVuLCBhdHQuaykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPHRyPjx0ZCBjbGFzcz1cImhpZWtuLWluZm9ib3gtaW5mby1sYWJlbFwiPicgKyBhdHQuayArICc8L3RkPjx0ZCBjbGFzcz1cImhpZWtuLWluZm9ib3gtaW5mby1kZXRhaWxcIj4nICsgbGlzICsgJzwvdGQ+PC90cj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdmlzaWJsZS5sZW5ndGggJiYgIWhpZGRlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8dHI+PHRkIGNsYXNzPVwiaGlla24taW5mb2JveC1pbmZvLWxhYmVsXCI+JyArIGF0dC5rICsgJzwvdGQ+PHRkIGNsYXNzPVwiaGlla24taW5mb2JveC1pbmZvLWRldGFpbFwiPicgKyBsaXMgKyAnPC90ZD48L3RyPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkaW5mb3hib3guZmluZCgnLmhpZWtuLWluZm9ib3gtYm9keScpLmFwcGVuZCgnPHRhYmxlPjx0Ym9keT4nICsgaHRtbCArICc8L3Rib2R5PjwvdGFibGU+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEucGFycykge1xyXG4gICAgICAgICAgICAgICAgJGluZm94Ym94LmZpbmQoJy5oaWVrbi1pbmZvYm94LWhlYWQnKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJoaWVrbi1pbmZvYm94LXBhcnNcIj48bGFiZWwgY2xhc3M9XCJoaWVrbi1pbmZvYm94LWxhYmVsXCI+5omA5bGe77yaPC9sYWJlbD48dWw+PC91bD48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgayBpbiBkYXRhLnBhcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5wYXJzLmhhc093blByb3BlcnR5KGspKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbmZveGJveC5maW5kKCcuaGlla24taW5mb2JveC1wYXJzIHVsJykuYXBwZW5kKCc8bGk+JyArIHRoaXMuYnVpbGRFbnRpdHkoZGF0YS5wYXJzW2tdLCB0cnVlKSArICc8L2xpPicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5zb25zKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBsIGluIGRhdGEuc29ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnNvbnMuaGFzT3duUHJvcGVydHkobCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPGxpPicgKyB0aGlzLmJ1aWxkRW50aXR5KGRhdGEuc29uc1tsXSwgdHJ1ZSkgKyAnPC9saT4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRpbmZveGJveC5maW5kKCcuaGlla24taW5mb2JveC1oZWFkJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiaGlla24taW5mb2JveC1wYXJzXCI+PGxhYmVsIGNsYXNzPVwiaGlla24taW5mb2JveC1sYWJlbFwiPuebuOWFs++8mjwvbGFiZWw+PHVsPicgKyBodG1sICsgJzwvdWw+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkaW5mb3hib3guYXBwZW5kKCdJbmZvQm946K+75Y+W6ZSZ6K+vJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAkaW5mb3hib3g7XHJcbiAgICB9XHJcblxyXG4gICAgYnVpbGRUYWJJbmZvYm94KGRhdGE6IGFueSkge1xyXG4gICAgICAgIGNvbnN0ICRpbmZveGJveCA9ICQoJzxkaXYgY2xhc3M9XCJoaWVrbi1pbmZvYm94IGhpZWtuLWluZm9ib3gtdGFiXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgaWYgKGRhdGEuc2VsZikge1xyXG4gICAgICAgICAgICAkaW5mb3hib3guYXBwZW5kKCc8ZGl2IGNsYXNzPVwiaGlla24taW5mb2JveC1oZWFkXCI+PC9kaXY+PGRpdiBjbGFzcz1cImhpZWtuLWluZm9ib3gtYm9keVwiPjx1bCBjbGFzcz1cIm5hdiBuYXYtdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCI+PC91bD48ZGl2IGNsYXNzPVwidGFiLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgJGluZm94Ym94LmZpbmQoJy5oaWVrbi1pbmZvYm94LWhlYWQnKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJoaWVrbi1pbmZvYm94LXRpdGxlXCI+JyArIHRoaXMuYnVpbGRFbnRpdHkoZGF0YS5zZWxmLCBmYWxzZSkgKyAnPC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHZpc2libGUgPSB0aGlzLm9wdGlvbnMuYXR0cy52aXNpYmxlIHx8IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBoaWRkZW4gPSB0aGlzLm9wdGlvbnMuYXR0cy5oaWRkZW4gfHwgW107XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnNlbGYuZXh0cmEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGkgaW4gZGF0YS5zZWxmLmV4dHJhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuc2VsZi5leHRyYS5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRyYSA9IGRhdGEuc2VsZi5leHRyYVtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCh2aXNpYmxlLmxlbmd0aCAmJiBfLmluZGV4T2YodmlzaWJsZSwgZXh0cmEuaykgPj0gMCkgfHwgKGhpZGRlbi5sZW5ndGggJiYgXy5pbmRleE9mKGhpZGRlbiwgZXh0cmEuaykgPCAwKSB8fCAoIXZpc2libGUubGVuZ3RoICYmICFoaWRkZW4ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLmJ1aWxkRXh0cmEoZXh0cmEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSAnaGlla24taW5mb2JveC0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCkgKyAnLScgKyBkYXRhLnNlbGYuaWQ7XHJcbiAgICAgICAgICAgICAgICAkaW5mb3hib3guZmluZCgnLmhpZWtuLWluZm9ib3gtYm9keT4ubmF2LXRhYnMnKS5hcHBlbmQoJzxsaSByb2xlPVwicHJlc2VudGF0aW9uXCIgY2xhc3M9XCJhY3RpdmVcIj48YSBocmVmPVwiIycgKyBpZCArICdcIiByb2xlPVwidGFiXCIgZGF0YS10b2dnbGU9XCJ0YWJcIiBhcmlhLWV4cGFuZGVkPVwidHJ1ZVwiPuWfuuacrOS/oeaBrzwvYT48L2xpPicpO1xyXG4gICAgICAgICAgICAgICAgJGluZm94Ym94LmZpbmQoJy5oaWVrbi1pbmZvYm94LWJvZHk+LnRhYi1jb250ZW50JykuYXBwZW5kKCc8ZGl2IHJvbGU9XCJ0YWJwYW5lbFwiIGNsYXNzPVwidGFiLXBhbmUtZGV0YWlsIHRhYi1wYW5lIGFjdGl2ZVwiIGlkPVwiJyArIGlkICsgJ1wiPjx0YWJsZT48dGJvZHk+JyArIGh0bWwgKyAnPC90Ym9keT48L3RhYmxlPjwvZGl2PicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnBhcnMpIHtcclxuICAgICAgICAgICAgICAgICRpbmZveGJveC5maW5kKCcuaGlla24taW5mb2JveC1oZWFkJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiaGlla24taW5mb2JveC1wYXJzXCI+PGxhYmVsIGNsYXNzPVwiaGlla24taW5mb2JveC1sYWJlbFwiPuaJgOWxnu+8mjwvbGFiZWw+PHVsPjwvdWw+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGsgaW4gZGF0YS5wYXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucGFycy5oYXNPd25Qcm9wZXJ0eShrKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW5mb3hib3guZmluZCgnLmhpZWtuLWluZm9ib3gtcGFycyB1bCcpLmFwcGVuZCgnPGxpPicgKyB0aGlzLmJ1aWxkRW50aXR5KGRhdGEucGFyc1trXSwgdHJ1ZSkgKyAnPC9saT4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuc29ucykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbCBpbiBkYXRhLnNvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zb25zLmhhc093blByb3BlcnR5KGwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaT4nICsgdGhpcy5idWlsZEVudGl0eShkYXRhLnNvbnNbbF0sIHRydWUpICsgJzwvbGk+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9ICdoaWVrbi1pbmZvYm94LScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSArICctc29ucy0nICsgZGF0YS5zZWxmLmlkO1xyXG4gICAgICAgICAgICAgICAgJGluZm94Ym94LmZpbmQoJy5oaWVrbi1pbmZvYm94LWJvZHk+Lm5hdi10YWJzJykuYXBwZW5kKCc8bGkgcm9sZT1cInByZXNlbnRhdGlvblwiPjxhIGhyZWY9XCIjJyArIGlkICsgJ1wiIHJvbGU9XCJ0YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiIGFyaWEtZXhwYW5kZWQ9XCJ0cnVlXCI+5a2Q6IqC54K5PC9hPjwvbGk+Jyk7XHJcbiAgICAgICAgICAgICAgICAkaW5mb3hib3guZmluZCgnLmhpZWtuLWluZm9ib3gtYm9keT4udGFiLWNvbnRlbnQnKS5hcHBlbmQoJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCJ0YWItcGFuZS1zb25zIHRhYi1wYW5lXCIgaWQ9XCInICsgaWQgKyAnXCI+PHVsPicgKyBodG1sICsgJzwvdWw+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuYXR0cykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtIGluIGRhdGEuYXR0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmF0dHMuaGFzT3duUHJvcGVydHkobSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0ID0gZGF0YS5hdHRzW21dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGogaW4gYXR0LnYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHQudi5oYXNPd25Qcm9wZXJ0eShqKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaT4nICsgdGhpcy5idWlsZEVudGl0eShhdHQudltqXSwgdHJ1ZSkgKyAnPC9saT4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgodmlzaWJsZS5sZW5ndGggJiYgXy5pbmRleE9mKHZpc2libGUsIGF0dC5rKSA+PSAwKSB8fCAoaGlkZGVuLmxlbmd0aCAmJiBfLmluZGV4T2YoaGlkZGVuLCBhdHQuaykgPCAwKSB8fCAoIXZpc2libGUubGVuZ3RoICYmICFoaWRkZW4ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSAnaGlla24taW5mb2JveC0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCkgKyAnLWF0dC0nICsgbSArICctJyArIGRhdGEuc2VsZi5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbmZveGJveC5maW5kKCcuaGlla24taW5mb2JveC1ib2R5Pi5uYXYtdGFicycpLmFwcGVuZCgnPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIj48YSBocmVmPVwiIycgKyBpZCArICdcIiByb2xlPVwidGFiXCIgZGF0YS10b2dnbGU9XCJ0YWJcIiBhcmlhLWV4cGFuZGVkPVwidHJ1ZVwiPicgKyBhdHQuayArICc8L2E+PC9saT4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbmZveGJveC5maW5kKCcuaGlla24taW5mb2JveC1ib2R5Pi50YWItY29udGVudCcpLmFwcGVuZCgnPGRpdiByb2xlPVwidGFicGFuZWxcIiBjbGFzcz1cInRhYi1wYW5lLXNvbnMgdGFiLXBhbmVcIiBpZD1cIicgKyBpZCArICdcIj48dWw+JyArIGh0bWwgKyAnPC91bD48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRpbmZveGJveC5hcHBlbmQoJ0luZm9Cb3jor7vlj5bplJnor68nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICRpbmZveGJveDtcclxuICAgIH1cclxufVxuaW50ZXJmYWNlIEhpZWtuUHJvbXB0U2V0dGluZyBleHRlbmRzIEhpZWtuQmFzZVNldHRpbmcge1xyXG4gICAga2dOYW1lPzogc3RyaW5nO1xyXG4gICAgYmVmb3JlRHJhd1Byb21wdD86IEZ1bmN0aW9uO1xyXG4gICAgY29udGFpbmVyPzogc3RyaW5nO1xyXG4gICAgcmVhZHk/OiBGdW5jdGlvbjtcclxuICAgIGdyb3VwPzogYm9vbGVhbjtcclxuICAgIHJlcGxhY2VTZWFyY2g/OiBib29sZWFuO1xyXG4gICAgb25TZWFyY2g/OiBGdW5jdGlvbjtcclxuICAgIHByb21wdFR5cGU/OiAwIHwgMTtcclxuICAgIHNjaGVtYVNldHRpbmc/OiBIaWVrblNjaGVtYVNldHRpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrblByb21wdFJlcXVlc3RTZXR0aW5nIGV4dGVuZHMgSGlla25Qcm9tcHRTZXR0aW5nIHtcclxuICAgIHBhcmFtTmFtZT86IHN0cmluZztcclxuICAgIHVybD86IHN0cmluZztcclxuICAgIHR5cGU/OiAnR0VUJyB8ICdQT1NUJztcclxufVxyXG5cclxuY2xhc3MgSGlla25TREtQcm9tcHQge1xyXG4gICAgZGVmYXVsdHM6IEhpZWtuUHJvbXB0U2V0dGluZyA9IHtcclxuICAgICAgICByZWFkeTogJC5ub29wLFxyXG4gICAgICAgIGdyb3VwOiBmYWxzZSxcclxuICAgICAgICByZXBsYWNlU2VhcmNoOiBmYWxzZSxcclxuICAgICAgICBvblNlYXJjaDogJC5ub29wLFxyXG4gICAgICAgIHByb21wdFR5cGU6IDBcclxuICAgIH07XHJcbiAgICBpbnN0YW5jZTogYW55O1xyXG4gICAgb3B0aW9uczogSGlla25Qcm9tcHRTZXR0aW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhpZWtuUHJvbXB0U2V0dGluZykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXQoKSB7XHJcbiAgICAgICAgbGV0IHNjaGVtYVNldHRpbmc6IEhpZWtuU2NoZW1hU2V0dGluZyA9ICQuZXh0ZW5kKHRydWUsIHtrZ05hbWU6IHRoaXMub3B0aW9ucy5rZ05hbWV9LCB0aGlzLm9wdGlvbnMsIHRoaXMub3B0aW9ucy5zY2hlbWFTZXR0aW5nKTtcclxuICAgICAgICBzY2hlbWFTZXR0aW5nLnN1Y2Nlc3MgPSAoKHNjaGVtYTogSGlla25TY2hlbWEpID0+IHtcclxuICAgICAgICAgICAgbGV0IHByb21wdFNldHRpbmdzOiBhbnk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJvbXB0VHlwZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcHJvbXB0U2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd1Byb21wdEl0ZW06IEhpZWtuU0RLUHJvbXB0LmRyYXdQcm9tcHRJdGVtKHNjaGVtYSksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Qcm9tcHQ6IEhpZWtuU0RLUHJvbXB0Lm9uUHJvbXB0KHRoaXMub3B0aW9ucylcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcHRTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3UHJvbXB0SXRlbTogSGlla25TREtQcm9tcHQuZHJhd1Byb21wdEtub3dsZWRnZUl0ZW0oKSxcclxuICAgICAgICAgICAgICAgICAgICBvblByb21wdDogSGlla25TREtQcm9tcHQub25Qcm9tcHRLbm93bGVkZ2UodGhpcy5vcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcHRTZXR0aW5ncy5kcmF3UHJvbXB0SXRlbXMgPSB0aGlzLmRyYXdQcm9tcHRJdGVtcyhzY2hlbWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVwbGFjZVNlYXJjaCkge1xyXG4gICAgICAgICAgICAgICAgcHJvbXB0U2V0dGluZ3MuYmVmb3JlU2VhcmNoID0gKHNlbGVjdGVkSXRlbTogYW55LCAkY29udGFpbmVyOiBKUXVlcnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuZmluZCgnaW5wdXRbdHlwZT10ZXh0XScpLnZhbChzZWxlY3RlZEl0ZW0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCBwcm9tcHRTZXR0aW5ncywgdGhpcy5vcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG5ldyBoaWVrblByb21wdChwcm9tcHRTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZWFkeSh0aGlzLmluc3RhbmNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBIaWVrblNES1NjaGVtYS5sb2FkKHNjaGVtYVNldHRpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkcmF3UHJvbXB0SXRlbShzY2hlbWE6IEhpZWtuU2NoZW1hKSB7XHJcbiAgICAgICAgbGV0IHR5cGVPYmogPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2Ygc2NoZW1hLnR5cGVzKSB7XHJcbiAgICAgICAgICAgIHR5cGVPYmpbdHlwZS5rXSA9IHR5cGUudjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChkYXRhOiBhbnksIHByZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0aXRsZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgaWYgKGRhdGEubWVhbmluZ1RhZykge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSB0aXRsZSArICcgKCAnICsgZGF0YS5tZWFuaW5nVGFnICsgJyApJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbGluZSA9ICc8c3BhbiBjbGFzcz1cInByb21wdC10aXAtdGl0bGVcIj4nICsgdGl0bGUucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHByZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodFwiPicgKyAnJDEnICsgJzwvc3Bhbj4nKSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgbGluZSA9ICc8c3BhbiBjbGFzcz1cInByb21wdC10aXAtdHlwZSBwcm9tcHQtdGlwLScgKyBkYXRhLmNsYXNzSWQgKyAnXCI+JyArIChkYXRhLmNsYXNzTmFtZSB8fCB0eXBlT2JqW2RhdGEuY2xhc3NJZF0gfHwgJycpICsgJzwvc3Bhbj4nICsgbGluZTtcclxuICAgICAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkcmF3UHJvbXB0S25vd2xlZGdlSXRlbSgpIHtcclxuICAgICAgICBsZXQgdHlwZU9iaiA9IHtcclxuICAgICAgICAgICAgMDogJ+amguW/tScsXHJcbiAgICAgICAgICAgIDE6ICflrp7kvosnXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gKGRhdGE6IGFueSwgcHJlOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxpbmUgPSAnPHNwYW4gY2xhc3M9XCJwcm9tcHQtdGlwLXRpdGxlXCI+JyArIGRhdGEubmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJygnICsgcHJlICsgJyknLCAnZ2knKSwgJzxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0XCI+JyArICckMScgKyAnPC9zcGFuPicpICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICBsaW5lID0gJzxzcGFuIGNsYXNzPVwicHJvbXB0LXRpcC10eXBlIHByb21wdC10aXAtJyArIGRhdGEua2dUeXBlICsgJ1wiPicgKyAodHlwZU9ialtkYXRhLmtnVHlwZV0gfHwgJycpICsgJzwvc3Bhbj4nICsgbGluZTtcclxuICAgICAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXdQcm9tcHRJdGVtcyhzY2hlbWE6IEhpZWtuU2NoZW1hKSB7XHJcbiAgICAgICAgbGV0IHR5cGVPYmogPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2Ygc2NoZW1hLnR5cGVzKSB7XHJcbiAgICAgICAgICAgIHR5cGVPYmpbdHlwZS5rXSA9IHR5cGUudjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChkYXRhOiBhbnksIHByZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0ICRjb250YWluZXIgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuaW5zdGFuY2Uub3B0aW9ucy5kcmF3UHJvbXB0SXRlbSh2LCBwcmUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmluc3RhbmNlLm9wdGlvbnMuZHJhd0l0ZW1UaXRsZSh2KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNscyA9ICdwcm9tcHQtaXRlbS0nICsgdi5jbGFzc0lkO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgJGxpID0gJCgnPGxpIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiIGNsYXNzPVwiJyArIGNscyArICdcIj4nICsgdGV4dCArICc8L2xpPicpLmRhdGEoJ2RhdGEnLCB2KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV4ID0gJGNvbnRhaW5lci5maW5kKCcuJyArIGNscyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChleFtleC5sZW5ndGggLSAxXSkuYWZ0ZXIoJGxpKTtcclxuICAgICAgICAgICAgICAgICAgICAkbGkuZmluZCgnLnByb21wdC10aXAtdHlwZScpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuYXBwZW5kKCRsaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICRjb250YWluZXIuY2hpbGRyZW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIG9uUHJvbXB0U3RhcnQob3B0aW9uczogSGlla25Qcm9tcHRSZXF1ZXN0U2V0dGluZykge1xyXG4gICAgICAgIHJldHVybiAocHJlOiBzdHJpbmcsICRzZWxmOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gb3B0aW9ucy5xdWVyeURhdGEgfHwge307XHJcbiAgICAgICAgICAgIGxldCBmb3JtRGF0YSA9IG9wdGlvbnMuZm9ybURhdGEgfHwge307XHJcbiAgICAgICAgICAgIGZvcm1EYXRhW29wdGlvbnMucGFyYW1OYW1lXSA9IHByZTtcclxuICAgICAgICAgICAgZm9ybURhdGEua2dOYW1lID0gb3B0aW9ucy5rZ05hbWU7XHJcbiAgICAgICAgICAgIEhpZWtuU0RLVXRpbHMuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IEhpZWtuU0RLVXRpbHMuYnVpbGRVcmwob3B0aW9ucy51cmwsIHF1ZXJ5RGF0YSksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmb3JtRGF0YSxcclxuICAgICAgICAgICAgICAgIGRhdGFGaWx0ZXI6IG9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHNlbGYucHJvbXB0ID09IGZvcm1EYXRhW29wdGlvbnMucGFyYW1OYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZCA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuYmVmb3JlRHJhd1Byb21wdCAmJiAoZCA9IG9wdGlvbnMuYmVmb3JlRHJhd1Byb21wdChkLCBwcmUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGYuc3RhcnREcmF3UHJvbXB0SXRlbXMoZCwgcHJlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgb25Qcm9tcHQob3B0aW9uczogSGlla25Qcm9tcHRTZXR0aW5nKSB7XHJcbiAgICAgICAgbGV0IHJlcU9wdGlvbnM6IEhpZWtuUHJvbXB0UmVxdWVzdFNldHRpbmcgPSBvcHRpb25zO1xyXG4gICAgICAgIHJlcU9wdGlvbnMucGFyYW1OYW1lID0gJ2t3JztcclxuICAgICAgICByZXFPcHRpb25zLnVybCA9IG9wdGlvbnMuYmFzZVVybCArICdwcm9tcHQnO1xyXG4gICAgICAgIHJlcU9wdGlvbnMudHlwZSA9ICdQT1NUJztcclxuICAgICAgICByZXR1cm4gSGlla25TREtQcm9tcHQub25Qcm9tcHRTdGFydChyZXFPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgb25Qcm9tcHRLbm93bGVkZ2Uob3B0aW9uczogSGlla25Qcm9tcHRTZXR0aW5nKSB7XHJcbiAgICAgICAgbGV0IHJlcU9wdGlvbnM6IEhpZWtuUHJvbXB0UmVxdWVzdFNldHRpbmcgPSBvcHRpb25zO1xyXG4gICAgICAgIHJlcU9wdGlvbnMucGFyYW1OYW1lID0gJ3RleHQnO1xyXG4gICAgICAgIHJlcU9wdGlvbnMudXJsID0gb3B0aW9ucy5iYXNlVXJsICsgJ3Byb21wdC9rbm93bGVkZ2UnO1xyXG4gICAgICAgIHJlcU9wdGlvbnMudHlwZSA9ICdHRVQnO1xyXG4gICAgICAgIHJldHVybiBIaWVrblNES1Byb21wdC5vblByb21wdFN0YXJ0KG9wdGlvbnMpO1xyXG4gICAgfVxyXG59XHJcblxuaW50ZXJmYWNlIEhpZWtuUmVzb3VyY2VTZXR0aW5nIGV4dGVuZHMgSGlla25CYXNlU2V0dGluZyB7XHJcbiAgICBiZWZvcmVMb2FkPzogRnVuY3Rpb24sXHJcbiAgICBjb250YWluZXI/OiBzdHJpbmcsXHJcbiAgICBjb25maWc6IEhpZWtuVGFibGVDb25maWdTZXR0aW5nLFxyXG4gICAgb25Mb2FkPzogRnVuY3Rpb25cclxufVxyXG5cclxuY2xhc3MgSGlla25TREtSZXNvdXJjZSB7XHJcbiAgICBvcHRpb25zOiBIaWVrblJlc291cmNlU2V0dGluZztcclxuICAgIHRhYmxlU2VydmljZTogSGlla25TREtUYWJsZTtcclxuICAgIHF1ZXJ5OiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSGlla25SZXNvdXJjZVNldHRpbmcpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UXVlcnkoKSB7XHJcbiAgICAgICAgbGV0IG11c3QgPSBbXTtcclxuICAgICAgICBjb25zdCBmaWx0ZXIgPSB0aGlzLnRhYmxlU2VydmljZS5nZXRGaWx0ZXJPcHRpb25zKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZmlsdGVyKSB7XHJcbiAgICAgICAgICAgIGxldCBzaG91bGQgPSBbXTtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBmaWx0ZXJba2V5XTtcclxuICAgICAgICAgICAgY29uc3QgZmlsdGVyQ29uZmlnID0gXy5maW5kKHRoaXMub3B0aW9ucy5jb25maWcuZmlsdGVyLCBbJ2tleScsIGtleV0pO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyQ29uZmlnLnR5cGUgPT0gJ3llYXInIHx8IGZpbHRlckNvbmZpZy50eXBlID09ICdtb250aCcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeWVhciBvZiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmcm9tID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckNvbmZpZy50eXBlID09ICd5ZWFyJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tID0gbW9tZW50KHllYXIgKyAnLTAxLTAxJykuZm9ybWF0KGZpbHRlckNvbmZpZy5mb3JtYXQgfHwgJ1lZWVktTU0tREQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG8gPSBtb21lbnQoKHBhcnNlSW50KHllYXIsIDEwKSArIDEpICsgJy0wMS0wMScpLmZvcm1hdChmaWx0ZXJDb25maWcuZm9ybWF0IHx8ICdZWVlZLU1NLUREJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSA9IG1vbWVudCh5ZWFyICsgJy0wMScpLmZvcm1hdChmaWx0ZXJDb25maWcuZm9ybWF0IHx8ICdZWVlZLU1NJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvID0gbW9tZW50KChwYXJzZUludCh5ZWFyLCAxMCkgKyAxKSArICctMDEnKS5mb3JtYXQoZmlsdGVyQ29uZmlnLmZvcm1hdCB8fCAnWVlZWS1NTScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgb2JqID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqW2tleV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IGZyb20sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiB0byxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVkZV9sb3dlcjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVkZV91cHBlcjogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IG9ialxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9iaiA9IHt9O1xyXG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHNob3VsZC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXJtczogb2JqXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtdXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgYm9vbDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZDogc2hvdWxkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW1fc2hvdWxkX21hdGNoOiAxXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBrdyA9IHRoaXMudGFibGVTZXJ2aWNlLmdldEZpbHRlckt3KCk7XHJcbiAgICAgICAgaWYgKGt3KSB7XHJcbiAgICAgICAgICAgIGxldCBzaG91bGQgPSBbXTtcclxuICAgICAgICAgICAgY29uc3QgZmllbGRzID0gdGhpcy5vcHRpb25zLmNvbmZpZy5maWVsZHNLdyB8fCB0aGlzLm9wdGlvbnMuY29uZmlnLmZpZWxkc1RhYmxlIHx8IHRoaXMub3B0aW9ucy5jb25maWcuZmllbGRzO1xyXG4gICAgICAgICAgICBsZXQgb2JqID0ge1xyXG4gICAgICAgICAgICAgICAgcXVlcnk6IGt3LFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiBmaWVsZHNcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgc2hvdWxkLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgcXVlcnlfc3RyaW5nOiBvYmpcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG11c3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBib29sOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkOiBzaG91bGQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bV9zaG91bGRfbWF0Y2g6IDFcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGJvb2w6IHtcclxuICAgICAgICAgICAgICAgIG11c3Q6IG11c3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgY29uZmlnOiB0aGlzLm9wdGlvbnMuY29uZmlnLFxyXG4gICAgICAgICAgICBjb250YWluZXI6IHRoaXMub3B0aW9ucy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIGxvYWQ6IChwYWdlTm86IG51bWJlciwgaW5zdGFuY2U6IEhpZWtuU0RLVGFibGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZChwYWdlTm8sIGluc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy50YWJsZVNlcnZpY2UgPSBuZXcgSGlla25TREtUYWJsZShjb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbG9hZChwYWdlTm86IG51bWJlciwgaW5zdGFuY2U6IEhpZWtuU0RLVGFibGUpIHtcclxuICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5nZXRRdWVyeSgpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5iZWZvcmVMb2FkICYmIHRoaXMub3B0aW9ucy5iZWZvcmVMb2FkKHRoaXMpO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMub3B0aW9ucy5jb25maWc7XHJcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gdGhpcy5vcHRpb25zLnF1ZXJ5RGF0YSB8fCB7fTtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSB0aGlzLm9wdGlvbnMuZm9ybURhdGEgfHwge307XHJcbiAgICAgICAgZm9ybURhdGEuZGF0YWJhc2VzID0gY29uZmlnLmRhdGFiYXNlcztcclxuICAgICAgICBmb3JtRGF0YS50YWJsZXMgPSBjb25maWcudGFibGVzO1xyXG4gICAgICAgIGZvcm1EYXRhLmZpZWxkcyA9IGNvbmZpZy5maWVsZHM7XHJcbiAgICAgICAgZm9ybURhdGEucXVlcnkgPSBKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcclxuICAgICAgICBmb3JtRGF0YS5wYWdlTm8gPSBwYWdlTm87XHJcbiAgICAgICAgZm9ybURhdGEucGFnZVNpemUgPSBmb3JtRGF0YS5wYWdlU2l6ZSB8fCAxNTtcclxuICAgICAgICBjb25zdCAkY29udGFpbmVyID0gaW5zdGFuY2UuZ2V0VGFibGVDb250YWluZXIoKTtcclxuICAgICAgICAkY29udGFpbmVyLmVtcHR5KCk7XHJcbiAgICAgICAgbGV0IG5ld09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHVybDogSGlla25TREtVdGlscy5idWlsZFVybCh0aGlzLm9wdGlvbnMuYmFzZVVybCArICdzZWFyY2gnLCBxdWVyeURhdGEpLFxyXG4gICAgICAgICAgICB0eXBlOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGZvcm1EYXRhLFxyXG4gICAgICAgICAgICBkYXRhRmlsdGVyOiB0aGlzLm9wdGlvbnMuZGF0YUZpbHRlcixcclxuICAgICAgICAgICAgc3VjY2VzczogKHJzRGF0YTogYW55LCB0ZXh0U3RhdHVzOiBzdHJpbmcsIGpxWEhSOiBKUXVlcnlYSFIsIGRhdGE6IGFueSwgcGFyYW1zOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZHJhd1BhZ2UoZGF0YS5yc0NvdW50LCBwYXJhbXMucGFnZU5vLCBwYXJhbXMucGFnZVNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRyYXdEYXRhKGRhdGEucnNEYXRhKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZHJhd1BhZ2UoMCwgcGFyYW1zLnBhZ2VObywgcGFyYW1zLnBhZ2VTaXplKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkxvYWQgJiYgdGhpcy5vcHRpb25zLm9uTG9hZChkYXRhLCB0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IChkYXRhOiBhbnksdGV4dFN0YXR1czogc3RyaW5nLCBqcVhIUjogSlF1ZXJ5WEhSLCBlcnJvclRocm93bjogc3RyaW5nLCBwYXJhbXM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuZHJhd1BhZ2UoMCwgcGFyYW1zLnBhZ2VObywgcGFyYW1zLnBhZ2VTaXplKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhhdDogJGNvbnRhaW5lclswXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgSGlla25TREtVdGlscy5hamF4KG5ld09wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWREYXRhKHBhZ2VObzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy50YWJsZVNlcnZpY2UubG9hZERhdGEocGFnZU5vKTtcclxuICAgIH1cclxufVxuaW50ZXJmYWNlIEhpZWtuUmVzb3VyY2VzU2V0dGluZyBleHRlbmRzIEhpZWtuQmFzZVNldHRpbmcge1xyXG4gICAgYmVmb3JlTG9hZD86IEZ1bmN0aW9uO1xyXG4gICAgY29udGFpbmVyOiBzdHJpbmc7XHJcbiAgICBjb25maWdzOiBIaWVrblRhYmxlQ29uZmlnU2V0dGluZ1tdO1xyXG4gICAgbmFtZXNwYWNlPzogc3RyaW5nO1xyXG4gICAgb25Mb2FkPzogRnVuY3Rpb247XHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuU0RLUmVzb3VyY2VzIHtcclxuICAgIHJlc291cmNlc1NlcnZpY2U6IEhpZWtuU0RLUmVzb3VyY2VbXSA9IFtdO1xyXG4gICAgb3B0aW9uczogSGlla25SZXNvdXJjZXNTZXR0aW5nO1xyXG4gICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgJGhlYWRDb250YWluZXI6IEpRdWVyeTtcclxuICAgICRib2R5Q29udGFpbmVyOiBKUXVlcnk7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSGlla25SZXNvdXJjZXNTZXR0aW5nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLmluaXQodGhpcy5vcHRpb25zLm5hbWVzcGFjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBiaW5kRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kaGVhZENvbnRhaW5lci5maW5kKCcuaGlla24tcmVzb3VyY2UtbmF2LW1vcmUnKS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJGhlYWRDb250YWluZXIuZmluZCgnLmhpZWtuLXJlc291cmNlLW5hdi1tb3JlLWNvbnRhaW5lcicpLnRvZ2dsZUNsYXNzKCdoaWRlJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJGhlYWRDb250YWluZXIub24oJ3Nob3duLmJzLnRhYicsICdhW2RhdGEtdG9nZ2xlPVwidGFiXCJdJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGhlYWRDb250YWluZXIuZmluZCgnLmhpZWtuLXJlc291cmNlLW5hdiBhW2hyZWY9XCInICsgaHJlZiArICdcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGhlYWRDb250YWluZXIuZmluZCgnLmhpZWtuLXJlc291cmNlLW5hdi1oaWRlLXRhYnMgYVtocmVmPVwiJyArIGhyZWYgKyAnXCJdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5oaWVrbi1yZXNvdXJjZS1uYXYtbW9yZS1jb250YWluZXIsLmhpZWtuLXJlc291cmNlLW5hdi1tb3JlJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRoZWFkQ29udGFpbmVyLmZpbmQoJy5oaWVrbi1yZXNvdXJjZS1uYXYtbW9yZS1jb250YWluZXInKS5hZGRDbGFzcygnaGlkZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYlZpc2liaWxpdHkoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXQobmFtZXNwYWNlID0gJ2hpZWtuLXJlc291cmNlJykge1xyXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQodGhpcy5vcHRpb25zLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy4kaGVhZENvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJoaWVrbi1yZXNvdXJjZS1uYXYtY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAgICc8dWwgY2xhc3M9XCJoaWVrbi1yZXNvdXJjZS1uYXYgbmF2IG5hdi10YWJzXCIgcm9sZT1cInRhYmxpc3RcIj48L3VsPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhpZWtuLXJlc291cmNlLW5hdi1tb3JlIGhpZGVcIj7mm7TlpJo8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoaWVrbi1yZXNvdXJjZS1uYXYtbW9yZS1jb250YWluZXIgaGlkZVwiPicgK1xyXG4gICAgICAgICAgICAnPHVsIGNsYXNzPVwiaGlla24tcmVzb3VyY2UtbmF2LWhpZGUtdGFic1wiPjwvdWw+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicpO1xyXG4gICAgICAgIHRoaXMuJGJvZHlDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwiaGlla24tcmVzb3VyY2UtY29udGFpbmVyIHRhYi1jb250ZW50XCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0aGlzLiRoZWFkQ29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRoaXMuJGJvZHlDb250YWluZXIpO1xyXG4gICAgICAgIGNvbnN0ICRuYXZDb250YWluZXIgPSB0aGlzLnNlbGVjdCgnLmhpZWtuLXJlc291cmNlLW5hdi1jb250YWluZXIgdWwuaGlla24tcmVzb3VyY2UtbmF2Jyk7XHJcbiAgICAgICAgY29uc3QgJG5hdkhpZGVDb250YWluZXIgPSB0aGlzLnNlbGVjdCgnLmhpZWtuLXJlc291cmNlLW5hdi1jb250YWluZXIgdWwuaGlla24tcmVzb3VyY2UtbmF2LWhpZGUtdGFicycpO1xyXG4gICAgICAgIGxldCBhbGxXID0gMDtcclxuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gdGhpcy5vcHRpb25zLmNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY2xzID0gaSA9PSAnMCcgPyAnYWN0aXZlJyA6ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IG5hbWVzcGFjZSArICctdGFiLScgKyBpICsgJy0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRyZXNvdXJjZUNvbnRhaW5lciA9ICQoJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCJ0YWItcGFuZSAnICsgY2xzICsgJ1wiIGlkPVwiJyArIGlkICsgJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLiRib2R5Q29udGFpbmVyLmFwcGVuZCgkcmVzb3VyY2VDb250YWluZXIpO1xyXG4gICAgICAgICAgICBsZXQgY29uZmlnID0gJC5leHRlbmQodHJ1ZSwge30sIHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb25maWcgPSB0aGlzLm9wdGlvbnMuY29uZmlnc1tpXTtcclxuICAgICAgICAgICAgY29uZmlnLmNvbnRhaW5lciA9ICRyZXNvdXJjZUNvbnRhaW5lcjtcclxuICAgICAgICAgICAgY29uZmlnLm9uTG9hZCA9IChkYXRhOiBhbnksIGluc3RhbmNlOiBIaWVrblNES1Jlc291cmNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGluc3RhbmNlLnRhYmxlU2VydmljZS4kY29udGFpbmVyLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRoZWFkQ29udGFpbmVyLmZpbmQoJ2FbaHJlZj1cIiMnICsgaWQgKyAnXCJdIC5yZXMtY291bnQnKS50ZXh0KGRhdGEucnNDb3VudCB8fCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkxvYWQgJiYgdGhpcy5vcHRpb25zLm9uTG9hZChkYXRhLCBpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWcubmFtZXNwYWNlO1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZmlnLmNvbmZpZ3M7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VzU2VydmljZS5wdXNoKG5ldyBIaWVrblNES1Jlc291cmNlKGNvbmZpZykpO1xyXG4gICAgICAgICAgICBjb25zdCB0YWIgPSAnPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIiBjbGFzcz1cIicgKyBjbHMgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiMnICsgaWQgKyAnXCIgYXJpYS1jb250cm9scz1cIlwiIHJvbGU9XCJ0YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwicmVzLW5hbWVcIiB0aXRsZT1cIicgKyBjb25maWcuY29uZmlnLm5hbWUgKyAnXCI+JyArIGNvbmZpZy5jb25maWcubmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJyZXMtY291bnRcIj48L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9hPjwvbGk+JztcclxuICAgICAgICAgICAgJG5hdkNvbnRhaW5lci5hcHBlbmQodGFiKTtcclxuICAgICAgICAgICAgJG5hdkhpZGVDb250YWluZXIuYXBwZW5kKHRhYik7XHJcbiAgICAgICAgICAgIGFsbFcgKz0gJG5hdkNvbnRhaW5lci5maW5kKCdsaTpsYXN0LWNoaWxkJykud2lkdGgoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJG5hdkNvbnRhaW5lci5jc3MoJ3dpZHRoJywgYWxsVyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUYWJWaXNpYmlsaXR5KCk7XHJcbiAgICAgICAgdGhpcy5iaW5kRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkRGF0YShwYWdlTm86IG51bWJlcikge1xyXG4gICAgICAgIGZvciAoY29uc3QgcmVzb3VyY2VzU2VydmljZSBvZiB0aGlzLnJlc291cmNlc1NlcnZpY2UpIHtcclxuICAgICAgICAgICAgcmVzb3VyY2VzU2VydmljZS5sb2FkRGF0YShwYWdlTm8pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3Qoc2VsZWN0b3I6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVGFiVmlzaWJpbGl0eSgpIHtcclxuICAgICAgICBjb25zdCAkY29udGFpbmVyID0gdGhpcy4kaGVhZENvbnRhaW5lcjtcclxuICAgICAgICBjb25zdCBjdyA9ICRjb250YWluZXIud2lkdGgoKTtcclxuICAgICAgICBjb25zdCAkbmF2Q29udGFpbmVyID0gJGNvbnRhaW5lci5maW5kKCcubmF2Jyk7XHJcbiAgICAgICAgY29uc3QgdHcgPSAkbmF2Q29udGFpbmVyLndpZHRoKCk7XHJcbiAgICAgICAgY29uc3QgJG5tID0gJGNvbnRhaW5lci5maW5kKCcuaGlla24tcmVzb3VyY2UtbmF2LW1vcmUnKTtcclxuICAgICAgICBpZiAoY3cgPCB0dykge1xyXG4gICAgICAgICAgICAkbm0ucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkbm0uYWRkQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcuaGlla24tcmVzb3VyY2UtbmF2LW1vcmUtY29udGFpbmVyJykuYWRkQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHcgPSAwO1xyXG4gICAgICAgIGNvbnN0IG5tdyA9ICRubS5vdXRlcldpZHRoKCk7XHJcbiAgICAgICAgY29uc3QgJGhpZGVUYWJzID0gJGNvbnRhaW5lci5maW5kKCcuaGlla24tcmVzb3VyY2UtbmF2LWhpZGUtdGFicz5saScpO1xyXG4gICAgICAgICRuYXZDb250YWluZXIuZmluZCgnbGknKS5lYWNoKGZ1bmN0aW9uIChpLCB2KSB7XHJcbiAgICAgICAgICAgICQodikucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgICAgICAgdyArPSAkKHYpLndpZHRoKCk7XHJcbiAgICAgICAgICAgIGlmICh3ID49IGN3IC0gbm13KSB7XHJcbiAgICAgICAgICAgICAgICAkKHYpLmFkZENsYXNzKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAkKCRoaWRlVGFicy5nZXQoaSkpLnJlbW92ZUNsYXNzKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCRoaWRlVGFicy5nZXQoaSkpLmFkZENsYXNzKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxuaW50ZXJmYWNlIEhpZWtuU2NoZW1hQXR0cyB7XHJcbiAgICBrOiBudW1iZXI7XHJcbiAgICB2OiBzdHJpbmc7XHJcbiAgICB0eXBlOiAwIHwgMTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEhpZWtuU2NoZW1hVHlwZXMge1xyXG4gICAgazogbnVtYmVyO1xyXG4gICAgdjogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSGlla25TY2hlbWEge1xyXG4gICAgYXR0czogSGlla25TY2hlbWFBdHRzW107XHJcbiAgICB0eXBlczogSGlla25TY2hlbWFUeXBlc1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSGlla25TY2hlbWFTZXR0aW5nIGV4dGVuZHMgSGlla25BamF4U2V0dGluZyB7XHJcbiAgICBrZ05hbWU/OiBzdHJpbmdcclxufVxyXG5cclxuY2xhc3MgSGlla25TREtTY2hlbWEge1xyXG4gICAgc3RhdGljIGxvYWQob3B0aW9uczogSGlla25TY2hlbWFTZXR0aW5nKSB7XHJcbiAgICAgICAgbGV0IHF1ZXJ5RGF0YSA9IG9wdGlvbnMucXVlcnlEYXRhIHx8IHt9O1xyXG4gICAgICAgIGxldCBmb3JtRGF0YSA9ICQuZXh0ZW5kKHRydWUsIHtrZ05hbWU6IG9wdGlvbnMua2dOYW1lfSwgb3B0aW9ucy5mb3JtRGF0YSk7XHJcbiAgICAgICAgbGV0IG5ld09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHVybDogSGlla25TREtVdGlscy5idWlsZFVybChvcHRpb25zLmJhc2VVcmwgKyAnc2NoZW1hJywgcXVlcnlEYXRhKSxcclxuICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxyXG4gICAgICAgICAgICBkYXRhOiBmb3JtRGF0YSxcclxuICAgICAgICAgICAgYmVmb3JlU2VuZDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy50aGF0ICYmICQob3B0aW9ucy50aGF0KS5maW5kKCcuYWpheC1sb2FkaW5nJykuaHRtbChIaWVrblNES1V0aWxzLmxvYWRpbmdIVE1MKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGE6IGFueSwgdGV4dFN0YXR1czogc3RyaW5nLCBqcVhIUjogSlF1ZXJ5WEhSKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MoZGF0YVswXSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBuZXdPcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMsIG5ld09wdGlvbnMpO1xyXG4gICAgICAgIEhpZWtuU0RLVXRpbHMuYWpheChuZXdPcHRpb25zKTtcclxuICAgIH07XHJcbn1cbmludGVyZmFjZSBIaWVrblNlZ21lbnRTZXR0aW5nIGV4dGVuZHMgSGlla25BamF4U2V0dGluZyB7XHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuU0RLU2VnbWVudCB7XHJcbiAgICBzdGF0aWMgZGVmYXVsdHM6IEhpZWtuU2VnbWVudFNldHRpbmcgPSB7XHJcbiAgICAgICAgcXVlcnlEYXRhOntcclxuICAgICAgICAgICAgdXNlQ29uY2VwdDogdHJ1ZSxcclxuICAgICAgICAgICAgdXNlRW50aXR5OiB0cnVlLFxyXG4gICAgICAgICAgICB1c2VBdHRyOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzdGF0aWMgbG9hZChvcHRpb25zOiBIaWVrblNlZ21lbnRTZXR0aW5nKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIEhpZWtuU0RLU2VnbWVudC5kZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gb3B0aW9ucy5xdWVyeURhdGEgfHwge307XHJcbiAgICAgICAgbGV0IGZvcm1EYXRhID0gb3B0aW9ucy5mb3JtRGF0YSB8fCB7fTtcclxuICAgICAgICBsZXQgbmV3T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdXJsOiBIaWVrblNES1V0aWxzLmJ1aWxkVXJsKG9wdGlvbnMuYmFzZVVybCArICdzZWdtZW50JywgcXVlcnlEYXRhKSxcclxuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGZvcm1EYXRhLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbmV3T3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLCBuZXdPcHRpb25zKTtcclxuICAgICAgICBIaWVrblNES1V0aWxzLmFqYXgobmV3T3B0aW9ucyk7XHJcbiAgICB9O1xyXG59XG50eXBlIEhpZWtuVGFibGVSZW5kZXJlckZ1bmN0aW9uID0gKHZhbHVlOiBhbnksIGRhdGE6IGFueSkgPT4gc3RyaW5nO1xyXG50eXBlIEhpZWtuVGFibGVSZW5kZXJlclR5cGUgPSAnZGF0ZScgfCAnbGluaycgfCAneWVhcicgfCAnZGF0ZVRpbWUnIHwgJ2pzb24nIHwgJ3N0cmluZycgfCBIaWVrblRhYmxlUmVuZGVyZXJGdW5jdGlvbjtcclxudHlwZSBIaWVrblRhYmxlUmVuZGVyZXJDb21wbGV4ID0geyB0eXBlOiBIaWVrblRhYmxlUmVuZGVyZXJUeXBlLCBhcnJheT86IGJvb2xlYW4sIGZpZWxkcz86IHN0cmluZ1tdLCBuYW1lPzogc3RyaW5nIH07XHJcbnR5cGUgSGlla25UYWJsZVJlbmRlcmVyID0geyBba2V5OiBzdHJpbmddOiBIaWVrblRhYmxlUmVuZGVyZXJUeXBlIHwgSGlla25UYWJsZVJlbmRlcmVyQ29tcGxleCB9O1xyXG50eXBlIEhpZWtuVGFibGVGaWx0ZXJUeXBlID0gJ3llYXInIHwgJ21vbnRoJyB8ICdkYXknO1xyXG50eXBlIEhpZWtuVGFibGVGaWx0ZXJPcHRpb24gPSBzdHJpbmcgfCB7IGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIH0gfCBIaWVrbktWVHlwZTtcclxuXHJcbmludGVyZmFjZSBIaWVrblRhYmxlRmlsdGVyIHtcclxuICAgIGtleTogc3RyaW5nO1xyXG4gICAgbGFiZWw/OiBzdHJpbmc7XHJcbiAgICB0eXBlPzogSGlla25UYWJsZUZpbHRlclR5cGU7XHJcbiAgICBmb3JtYXQ/OiBzdHJpbmc7XHJcbiAgICBvcHRpb25zOiBIaWVrblRhYmxlRmlsdGVyT3B0aW9uW107XHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrblRhYmxlQ29uZmlnU2V0dGluZyB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhYmFzZXM6IHN0cmluZ1tdO1xyXG4gICAgdGFibGVzOiBzdHJpbmdbXTtcclxuICAgIGZpZWxkczogc3RyaW5nW107XHJcbiAgICBmaWVsZHNOYW1lPzogc3RyaW5nW107XHJcbiAgICBmaWVsZHNUYWJsZT86IHN0cmluZ1tdO1xyXG4gICAgZmllbGRzVGFibGVOYW1lPzogc3RyaW5nW107XHJcbiAgICBmaWVsZHNEZXRhaWw/OiBzdHJpbmdbXTtcclxuICAgIGZpZWxkc0RldGFpbE5hbWU/OiBzdHJpbmdbXTtcclxuICAgIGZpZWxkc0t3Pzogc3RyaW5nW107XHJcbiAgICBkcmF3RGV0YWlsPzogYm9vbGVhbjtcclxuICAgIGZpZWxkc1JlbmRlcmVyPzogSGlla25UYWJsZVJlbmRlcmVyO1xyXG4gICAgZmlsdGVyPzogSGlla25UYWJsZUZpbHRlcltdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSGlla25UYWJsZVNldHRpbmcgZXh0ZW5kcyBIaWVrbkJhc2VTZXR0aW5nIHtcclxuICAgIGNvbnRhaW5lcjogc3RyaW5nO1xyXG4gICAgY29uZmlnOiBIaWVrblRhYmxlQ29uZmlnU2V0dGluZztcclxuICAgIGxvYWQ6IEZ1bmN0aW9uXHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuU0RLVGFibGUge1xyXG4gICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgZGF0YTogYW55O1xyXG4gICAgb3B0aW9uczogSGlla25UYWJsZVNldHRpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSGlla25UYWJsZVNldHRpbmcpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnVpbGRGaWx0ZXIoKSB7XHJcbiAgICAgICAgbGV0IGZpbHRlckh0bWwgPSAnJztcclxuICAgICAgICBjb25zdCBmaWx0ZXJzID0gdGhpcy5vcHRpb25zLmNvbmZpZy5maWx0ZXI7XHJcbiAgICAgICAgZm9yIChjb25zdCBmaWx0ZXIgb2YgZmlsdGVycykge1xyXG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9IGZpbHRlci5sYWJlbCB8fCBmaWx0ZXIua2V5O1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVyT3B0aW9ucyA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZmlsdGVyLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCg8YW55Pml0ZW0pLmtleSAhPT0gdW5kZWZpbmVkICYmICg8YW55Pml0ZW0pLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbiA9IDx7IGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIH0+aXRlbTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyT3B0aW9ucyArPSAnPHNwYW4gb3B0aW9uLXZhbHVlPVwiJyArIG9wdGlvbi52YWx1ZSArICdcIiBvcHRpb24ta2V5PVwiJyArIG9wdGlvbi5rZXkgKyAnXCI+JyArIG9wdGlvbi5rZXkgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbiA9IDx7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9Pml0ZW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9wdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyT3B0aW9ucyArPSAnPHNwYW4gb3B0aW9uLXZhbHVlPVwiJyArIG9wdGlvbltrZXldICsgJ1wiIG9wdGlvbi1rZXk9XCInICsga2V5ICsgJ1wiPicgKyBvcHRpb25ba2V5XSArICc8L3NwYW4+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyT3B0aW9ucyArPSAnPHNwYW4gb3B0aW9uLXZhbHVlPVwiJyArIGl0ZW0gKyAnXCIgb3B0aW9uLWtleT1cIicgKyBmaWx0ZXIua2V5ICsgJ1wiPicgKyBpdGVtICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbHRlckh0bWwgKz0gJzxkaXYgY2xhc3M9XCJoaWVrbi10YWJsZS1maWx0ZXItaXRlbVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoaWVrbi10YWJsZS1maWx0ZXItaXRlbS1sYWJlbFwiPicgKyBsYWJlbCArICfvvJo8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGlla24tdGFibGUtZmlsdGVyLWl0ZW0tY29udGVudFwiPicgKyBmaWx0ZXJPcHRpb25zICsgJycgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJoaWVrbi10YWJsZS1tb3JlLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGlla24tdGFibGUtZmlsdGVyLW1vcmVcIj7mm7TlpJogPHN2ZyBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGQ9XCJNMTYuNTkgOC41OUwxMiAxMy4xNyA3LjQxIDguNTkgNiAxMGw2IDYgNi02elwiLz48L3N2Zz48L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJoaWVrbi10YWJsZS1maWx0ZXItbGVzc1wiPuaUtui1tyA8c3ZnIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZD1cIk0xMiA4bC02IDYgMS40MSAxLjQxTDEyIDEwLjgzbDQuNTkgNC41OEwxOCAxNHpcIi8+PC9zdmc+PC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGlla24tdGFibGUtZmlsdGVyLW11bHRpXCI+PHN2ZyBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGQ9XCJNMTkgMTNoLTZ2NmgtMnYtNkg1di0yaDZWNWgydjZoNnYyelwiLz48L3N2Zz4g5aSa6YCJPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgaGlla24tdGFibGUtYnRuLWNvbmZpcm1cIj7noa7lrpo8L2J1dHRvbj4nICtcclxuICAgICAgICAgICAgICAgICc8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5LW91dGxpbmUgaGlla24tdGFibGUtYnRuLWNhbmNlbFwiPuWPlua2iDwvYnV0dG9uPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbHRlckh0bWwgKz0gJzxkaXYgY2xhc3M9XCJoaWVrbi10YWJsZS1maWx0ZXItaXRlbSBoaWVrbi10YWJsZS1maWx0ZXItaXRlbS1rd1wiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhpZWtuLXRhYmxlLWZpbHRlci1pdGVtLWxhYmVsXCI+5YWz6ZSu6K+N77yaPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGlla24tdGFibGUtZmlsdGVyLWl0ZW0tY29udGVudFwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhpZWtuLXRhYmxlLXNlYXJjaC1rdy1jb250YWluZXJcIj48aW5wdXQgdHlwZT1cInRleHRcIj48YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGhpZWtuLXRhYmxlLWJ0bi1jb25maXJtXCI+56Gu5a6aPC9idXR0b24+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgdGhpcy5zZWxlY3QoJy5oaWVrbi10YWJsZS1maWx0ZXInKS5odG1sKGZpbHRlckh0bWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYmluZEZpbHRlckV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0KCcuaGlla24tdGFibGUtZmlsdGVyJykub24oJ2NsaWNrJywgJ3NwYW5bb3B0aW9uLXZhbHVlXScsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgJGl0ZW0gPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSAkaXRlbS5hdHRyKCdvcHRpb24ta2V5Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gJGl0ZW0uYXR0cignb3B0aW9uLXZhbHVlJyk7XHJcbiAgICAgICAgICAgIGlmICgkaXRlbS5jbG9zZXN0KCcuaGlla24tdGFibGUtZmlsdGVyLWl0ZW0nKS5oYXNDbGFzcygnbXVsdGknKSkge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW0udG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkaXRlbS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZERhdGEoMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlbGVjdCgnLmhpZWtuLXRhYmxlLWZpbHRlcicpLm9uKCdjbGljaycsICcuaGlla24tdGFibGUtZmlsdGVyLW1vcmUnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0ICRpdGVtID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAgICAgJGl0ZW0uY2xvc2VzdCgnLmhpZWtuLXRhYmxlLWZpbHRlci1pdGVtJykuYWRkQ2xhc3MoJ2V4cGVuZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0KCcuaGlla24tdGFibGUtZmlsdGVyJykub24oJ2NsaWNrJywgJy5oaWVrbi10YWJsZS1maWx0ZXItbGVzcycsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgJGl0ZW0gPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICAgICAkaXRlbS5jbG9zZXN0KCcuaGlla24tdGFibGUtZmlsdGVyLWl0ZW0nKS5yZW1vdmVDbGFzcygnZXhwZW5kJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3QoJy5oaWVrbi10YWJsZS1maWx0ZXInKS5vbignY2xpY2snLCAnLmhpZWtuLXRhYmxlLWZpbHRlci1tdWx0aScsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgJGl0ZW0gPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICAgICAkaXRlbS5jbG9zZXN0KCcuaGlla24tdGFibGUtZmlsdGVyLWl0ZW0nKS5hZGRDbGFzcygnbXVsdGknKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlbGVjdCgnLmhpZWtuLXRhYmxlLWZpbHRlcicpLm9uKCdjbGljaycsICcuaGlla24tdGFibGUtYnRuLWNvbmZpcm0nLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0ICRpdGVtID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAgICAgJGl0ZW0uY2xvc2VzdCgnLmhpZWtuLXRhYmxlLWZpbHRlci1pdGVtJykucmVtb3ZlQ2xhc3MoJ211bHRpJyk7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZERhdGEoMSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3QoJy5oaWVrbi10YWJsZS1maWx0ZXInKS5vbignY2xpY2snLCAnLmhpZWtuLXRhYmxlLWJ0bi1jYW5jZWwnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0ICRpdGVtID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAgICAgJGl0ZW0uY2xvc2VzdCgnLmhpZWtuLXRhYmxlLWZpbHRlci1pdGVtJykucmVtb3ZlQ2xhc3MoJ211bHRpJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3QoJy5oaWVrbi10YWJsZS1zZWFyY2gta3ctY29udGFpbmVyJykub24oJ2tleWRvd24nLCAnaW5wdXQnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHdpbmRvdy5ldmVudCA/ICg8S2V5Ym9hcmRFdmVudD5ldmVudCkua2V5Q29kZSA6ICg8S2V5Ym9hcmRFdmVudD5ldmVudCkud2hpY2g7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZERhdGEoMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJpbmRUYWJsZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0KCcuaGlla24tdGFibGUtY29udGVudCcpLm9uKCdjbGljaycsICcuaGlla24tdGFibGUtZGF0YS1hbmdsZScsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS50b2dnbGVDbGFzcygnb24nKS5jbG9zZXN0KCd0cicpLm5leHQoJ3RyLmhpZWtuLXRhYmxlLWRldGFpbC1saW5lJykudG9nZ2xlQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBkZWFsQ29udGVudChkOiBzdHJpbmcsIGxlbiA9IDgwKSB7XHJcbiAgICAgICAgaWYgKGQpIHtcclxuICAgICAgICAgICAgbGV0IHRleHQgPSAkKCc8ZGl2PicgKyBkICsgJzwvZGl2PicpLnRleHQoKTtcclxuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gbGVuKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dC5zdWJzdHJpbmcoMCwgbGVuKSArICcuLi4nO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXdEYXRhKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMub3B0aW9ucy5jb25maWc7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICBsZXQgdGhzID0gJzx0aGVhZD48dHI+JztcclxuICAgICAgICBsZXQgdHJzID0gJzx0Ym9keT4nO1xyXG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IGNvbmZpZy5maWVsZHNUYWJsZSB8fCBjb25maWcuZmllbGRzO1xyXG4gICAgICAgIGNvbnN0IGZpZWxkc05hbWUgPSBjb25maWcuZmllbGRzVGFibGVOYW1lID8gY29uZmlnLmZpZWxkc1RhYmxlTmFtZSA6IChjb25maWcuZmllbGRzTmFtZSA/IGNvbmZpZy5maWVsZHNOYW1lIDogZmllbGRzKTtcclxuICAgICAgICBjb25zdCBkcmF3RGV0YWlsID0gY29uZmlnLmRyYXdEZXRhaWwgfHwgY29uZmlnLmZpZWxkc0RldGFpbCB8fCBjb25maWcuZmllbGRzVGFibGU7XHJcbiAgICAgICAgY29uc3QgZmllbGRzRGV0YWlsID0gY29uZmlnLmZpZWxkc0RldGFpbCB8fCBjb25maWcuZmllbGRzO1xyXG4gICAgICAgIGNvbnN0IGZpZWxkc05hbWVEZXRhaWwgPSBjb25maWcuZmllbGRzRGV0YWlsTmFtZSA/IGNvbmZpZy5maWVsZHNEZXRhaWxOYW1lIDogKGNvbmZpZy5maWVsZHNOYW1lID8gY29uZmlnLmZpZWxkc05hbWUgOiBmaWVsZHMpO1xyXG4gICAgICAgIGNvbnN0IGZpZWxkc1JlbmRlcmVyID0gY29uZmlnLmZpZWxkc1JlbmRlcmVyIHx8IHt9O1xyXG4gICAgICAgIGxldCBmaWVsZHNMaW5rOiBIaWVrbktWVHlwZSA9IHt9O1xyXG4gICAgICAgIGlmIChkcmF3RGV0YWlsKSB7XHJcbiAgICAgICAgICAgIHRocyArPSAnPHRoPjwvdGg+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChjb25zdCBmaWR4IGluIGZpZWxkcykge1xyXG4gICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IGZpZWxkc1JlbmRlcmVyW2ZpZWxkc1tmaWR4XV07XHJcbiAgICAgICAgICAgIGlmIChyZW5kZXJlciAmJiByZW5kZXJlciBpbnN0YW5jZW9mIE9iamVjdCAmJiAoPEhpZWtuVGFibGVSZW5kZXJlckNvbXBsZXg+cmVuZGVyZXIpLnR5cGUgPT0gJ2xpbmsnICYmICg8SGlla25UYWJsZVJlbmRlcmVyQ29tcGxleD5yZW5kZXJlcikuZmllbGRzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGYgb2YgKDxIaWVrblRhYmxlUmVuZGVyZXJDb21wbGV4PnJlbmRlcmVyKS5maWVsZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNMaW5rW2ZdID0gZmllbGRzW2ZpZHhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhzICs9ICc8dGg+JyArIGZpZWxkc05hbWVbZmlkeF0gKyAnPC90aD4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZGF0YSkge1xyXG4gICAgICAgICAgICBsZXQgdHIgPSAnPHRyPic7XHJcbiAgICAgICAgICAgIGlmIChkcmF3RGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICB0ciArPSAnPHRkIGNsYXNzPVwiaGlla24tdGFibGUtZGF0YS1hbmdsZVwiPjxzdmcgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj48cGF0aCBkPVwiTTcgMTBsNSA1IDUtNXpcIi8+PC9zdmc+PC90ZD4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgZmllbGRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZW4rKztcclxuICAgICAgICAgICAgICAgIGlmICghZmllbGRzUmVuZGVyZXJba10gfHwgISg8SGlla25UYWJsZVJlbmRlcmVyQ29tcGxleD5maWVsZHNSZW5kZXJlcltrXSkuZmllbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHIgKz0gJzx0ZD4nICsgSGlla25TREtUYWJsZS5yZW5kZXJlckZpZWxkcyhkLCBrLCBmaWVsZHNMaW5rLCBmaWVsZHNSZW5kZXJlciwgdHJ1ZSkgKyAnPC90ZD4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyICs9ICc8L3RyPic7XHJcbiAgICAgICAgICAgIHRycyArPSB0cjtcclxuICAgICAgICAgICAgaWYgKGRyYXdEZXRhaWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ckRldGFpbCA9ICc8dHIgY2xhc3M9XCJoaWVrbi10YWJsZS1kZXRhaWwtbGluZSBoaWRlXCI+PHRkIGNvbHNwYW49XCInICsgKGxlbiArIDEpICsgJ1wiPic7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGkgaW4gZmllbGRzRGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgayA9IGZpZWxkc0RldGFpbFtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpZWxkc1JlbmRlcmVyW2tdIHx8ICEoPEhpZWtuVGFibGVSZW5kZXJlckNvbXBsZXg+ZmllbGRzUmVuZGVyZXJba10pLmZpZWxkcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ckRldGFpbCArPSAnPGRpdiBjbGFzcz1cImhpZWtuLXRhYmxlLWRldGFpbC0nICsgayArICdcIj48bGFiZWw+JyArIGZpZWxkc05hbWVEZXRhaWxbaV0gKyAnOjwvbGFiZWw+JyArIEhpZWtuU0RLVGFibGUucmVuZGVyZXJGaWVsZHMoZCwgaywgZmllbGRzTGluaywgZmllbGRzUmVuZGVyZXIsIGZhbHNlKSArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRyRGV0YWlsICs9ICc8L3RkPjwvdHI+JztcclxuICAgICAgICAgICAgICAgIHRycyArPSB0ckRldGFpbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0cnMgKz0gJzwvYm9keT4nO1xyXG4gICAgICAgIHRocyArPSAnPC90cj48L3RoZWFkPic7XHJcbiAgICAgICAgdGhpcy5zZWxlY3QoJy5oaWVrbi10YWJsZS1jb250ZW50JykuaHRtbCgnPHRhYmxlIGNsYXNzPVwiaGlla24tdGFibGUtbm9ybWFsXCI+JyArIHRocyArIHRycyArICc8L3RhYmxlPicpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdQYWdlKGNvdW50OiBudW1iZXIsIHBhZ2VObzogbnVtYmVyLCBwYWdlU2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdG90YWxJdGVtOiBjb3VudCxcclxuICAgICAgICAgICAgcGFnZVNpemU6IHBhZ2VTaXplLFxyXG4gICAgICAgICAgICBjdXJyZW50OiBwYWdlTm8sXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLnNlbGVjdCgnLnBhZ2luYXRpb24nKSxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IChkYXRhOiBhbnksIHBhZ2VObzogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWREYXRhKHBhZ2VObyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIEhpZWtuU0RLVXRpbHMuZHJhd1BhZ2luYXRpb24ob3B0aW9ucyk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldEZpbHRlckt3KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdCgnLmhpZWtuLXRhYmxlLXNlYXJjaC1rdy1jb250YWluZXInKS5maW5kKCdpbnB1dCcpLnZhbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZpbHRlck9wdGlvbnMoKSB7XHJcbiAgICAgICAgbGV0IGZpbHRlck9wdGlvbnMgPSB7fTtcclxuICAgICAgICB0aGlzLnNlbGVjdCgnLmhpZWtuLXRhYmxlLWZpbHRlci1pdGVtJykuZWFjaCgoaTogbnVtYmVyLCB2OiBIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0gJyc7XHJcbiAgICAgICAgICAgIGNvbnN0ICRpdGVtcyA9ICQodikuZmluZCgnc3BhbltvcHRpb24tdmFsdWVdLmFjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoJGl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGhhc0FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goKGo6IG51bWJlciwgZTogSFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdiA9ICQoZSkuYXR0cignb3B0aW9uLXZhbHVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvdikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNBbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9ICQoZSkuYXR0cignb3B0aW9uLWtleScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5wdXNoKG92KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICghaGFzQWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyT3B0aW9uc1trZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZmlsdGVyT3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBnZXRUYWJsZUNvbnRhaW5lcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3QoJy5oaWVrbi10YWJsZS1jb250ZW50Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VmFsdWVzKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICBsZXQgdmFsdWVzID0gW107XHJcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJ1snKSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IEpTT04ucGFyc2UodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IFt2YWx1ZV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikuYWRkQ2xhc3MoJ2hpZWtuLXRhYmxlJyk7XHJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cImhpZWtuLXRhYmxlLWZpbHRlclwiPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaGlla24tdGFibGUtY29udGVudFwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhpZWtuLXRhYmxlLXBhZ2VcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uLW91dHRlclwiPicgK1xyXG4gICAgICAgICAgICAnPHVsIGNsYXNzPVwicGFnaW5hdGlvblwiPjwvdWw+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicpO1xyXG4gICAgICAgIHRoaXMuYnVpbGRGaWx0ZXIoKTtcclxuICAgICAgICB0aGlzLmJpbmRGaWx0ZXJFdmVudCgpO1xyXG4gICAgICAgIHRoaXMuYmluZFRhYmxlRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkRGF0YShwYWdlTm86IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5sb2FkKHBhZ2VObywgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyZXJEYXRlKHY6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBtb21lbnQodikuZm9ybWF0KCdZWVlZTU1ERCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlbmRlcmVyRGF0ZVRpbWUodjogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vbWVudCh2KS5mb3JtYXQoJ1lZWVktTU0tREQgSEg6bW06c3MnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZW5kZXJlckZpZWxkcyhkOiBhbnksIGs6IHN0cmluZywgZmllbGRzTGluazogSGlla25LVlR5cGUsIGZpZWxkc1JlbmRlcmVyOiBIaWVrblRhYmxlUmVuZGVyZXIsIHNob3J0OiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IHN0ciA9ICcnO1xyXG4gICAgICAgIGlmIChkW2tdKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IEhpZWtuU0RLVGFibGUuZ2V0VmFsdWVzKGRba10pO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWVsZHNSZW5kZXJlcltrXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciArPSAnLCcgKyBIaWVrblNES1RhYmxlLnJlbmRlcmVyVmFsdWUoJ3N0cmluZycsIHZhbHVlLCB1bmRlZmluZWQsIHNob3J0LCBkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyICs9ICcsJyArIEhpZWtuU0RLVGFibGUucmVuZGVyZXJWYWx1ZSgoPEhpZWtuVGFibGVSZW5kZXJlckNvbXBsZXg+ZmllbGRzUmVuZGVyZXJba10pLnR5cGUgfHwgPEhpZWtuVGFibGVSZW5kZXJlclR5cGU+ZmllbGRzUmVuZGVyZXJba10sIHZhbHVlLCA8SGlla25UYWJsZVJlbmRlcmVyQ29tcGxleD5maWVsZHNSZW5kZXJlcltrXSwgc2hvcnQsIGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmaWVsZHNMaW5rW2tdKSB7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gZFtrXTtcclxuICAgICAgICAgICAgaWYgKCFkW2tdKSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lID0gJ+mTvuaOpSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyID0gSGlla25TREtUYWJsZS5yZW5kZXJlckxpbmsoZFtmaWVsZHNMaW5rW2tdXSwgbmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyZXJMaW5rKHY6IHN0cmluZywgbmFtZSA9ICfmn6XnnIsnLCBjbHMgPSAnJykge1xyXG4gICAgICAgIHJldHVybiB2ID8gJzxhIGhyZWY9XCInICsgdiArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cIicgKyBjbHMgKyAnXCI+JyArIG5hbWUgKyAnPC9hPicgOiAnJztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZW5kZXJlclZhbHVlKHR5cGU6IEhpZWtuVGFibGVSZW5kZXJlclR5cGUsIHZhbHVlOiBhbnksIGZpZWxkc1JlbmRlcmVyOiBIaWVrblRhYmxlUmVuZGVyZXJDb21wbGV4LCBzaG9ydDogYm9vbGVhbiwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IHN0ciA9ICcnO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICd5ZWFyJykge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gSGlla25TREtUYWJsZS5yZW5kZXJlclllYXIodmFsdWUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ2RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBIaWVrblNES1RhYmxlLnJlbmRlcmVyRGF0ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnZGF0ZVRpbWUnKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBIaWVrblNES1RhYmxlLnJlbmRlcmVyRGF0ZVRpbWUodmFsdWUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ2pzb24nKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnbGluaycpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IEhpZWtuU0RLVGFibGUucmVuZGVyZXJMaW5rKHZhbHVlLCBmaWVsZHNSZW5kZXJlci5uYW1lLCAnaGlla24tdGFibGUtYnRuLWxpbmsnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09ICdzdHJpbmcnICYmIHNob3J0KSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBIaWVrblNES1RhYmxlLmRlYWxDb250ZW50KHZhbHVlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHR5cGUodmFsdWUsIGRhdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gSGlla25TREtVdGlscy5zYWZlSFRNTCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlbmRlcmVyWWVhcih2OiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gbW9tZW50KHYpLmZvcm1hdCgnWVlZWScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0KHNlbGVjdG9yOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxufVxuaW50ZXJmYWNlIEhpZWtuVGFnZ2luZ1NldHRpbmcgZXh0ZW5kcyBIaWVrbkFqYXhTZXR0aW5nIHtcclxufVxyXG5cclxuY2xhc3MgSGlla25TREtUYWdnaW5nIHtcclxuICAgIHN0YXRpYyBsb2FkKG9wdGlvbnM6IEhpZWtuVGFnZ2luZ1NldHRpbmcpIHtcclxuICAgICAgICBjb25zdCBxdWVyeURhdGEgPSBvcHRpb25zLnF1ZXJ5RGF0YSB8fCB7fTtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSBvcHRpb25zLmZvcm1EYXRhIHx8IHt9O1xyXG4gICAgICAgIGxldCBuZXdPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB1cmw6IEhpZWtuU0RLVXRpbHMuYnVpbGRVcmwob3B0aW9ucy5iYXNlVXJsICsgJ3RhZ2dpbmcnLCBxdWVyeURhdGEpLFxyXG4gICAgICAgICAgICB0eXBlOiAnR0VUJyxcclxuICAgICAgICAgICAgZGF0YTogZm9ybURhdGEsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBuZXdPcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMsIG5ld09wdGlvbnMpO1xyXG4gICAgICAgIEhpZWtuU0RLVXRpbHMuYWpheChuZXdPcHRpb25zKTtcclxuICAgIH07XHJcbn1cbnR5cGUgSGlla25JZFR5cGUgPSBudW1iZXIgfCBzdHJpbmc7XHJcbnR5cGUgSGlla25LVlR5cGUgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG50eXBlIEpRdWVyeUFqYXhTdWNjZXNzID0gKGRhdGE6IGFueSwgdGV4dFN0YXR1czogc3RyaW5nLCBqcVhIUjogSlF1ZXJ5WEhSKSA9PiBhbnk7XHJcbnR5cGUgSlF1ZXJ5QWpheERhdGFGaWx0ZXIgPSAoZGF0YTogYW55LCB0eTogYW55KSA9PiBhbnk7XHJcblxyXG5pbnRlcmZhY2UgSGlla25CYXNlU2V0dGluZyB7XHJcbiAgICBiYXNlVXJsPzogc3RyaW5nO1xyXG4gICAgZGF0YUZpbHRlcj86IEpRdWVyeUFqYXhEYXRhRmlsdGVyO1xyXG4gICAgZm9ybURhdGE/OiBhbnk7XHJcbiAgICBxdWVyeURhdGE/OiBhbnk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBIaWVrbktWIHtcclxuICAgIGs6IHN0cmluZztcclxuICAgIHY6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEhpZWtuQWpheFNldHRpbmcgZXh0ZW5kcyBKUXVlcnlBamF4U2V0dGluZ3Mge1xyXG4gICAgYmFzZVVybD86IHN0cmluZztcclxuICAgIGZvcm1EYXRhPzogYW55O1xyXG4gICAgcXVlcnlEYXRhPzogYW55O1xyXG4gICAgdGhhdD86IEhUTUxFbGVtZW50O1xyXG59XHJcblxyXG5jbGFzcyBIaWVrblNES1V0aWxzIHtcclxuICAgIHN0YXRpYyBWRVJTSU9OID0gJzMuMC4wJztcclxuICAgIHN0YXRpYyByZWdDaGluZXNlID0gL15bXFx1NGUwMC1cXHU5ZmE1XSQvO1xyXG4gICAgc3RhdGljIHJlZ0VuZ2xpc2ggPSAvXlthLXpBLVpdJC87XHJcbiAgICBzdGF0aWMgY29sb3JCYXNlID0gWycjN2JjMGUxJyxcclxuICAgICAgICAnIzllYzY4MycsXHJcbiAgICAgICAgJyNmZGUxNGQnLFxyXG4gICAgICAgICcjYWI4OWY0JyxcclxuICAgICAgICAnI2UyNmY2MycsXHJcbiAgICAgICAgJyNkY2E4YzYnLFxyXG4gICAgICAgICcjNTk2NjkwJyxcclxuICAgICAgICAnI2VhYWQ4NCcsXHJcbiAgICAgICAgJyNhYmU4YmYnLFxyXG4gICAgICAgICcjNzk3OWZjJ107XHJcbiAgICBzdGF0aWMgY29sb3JFeCA9IFsnIzZkYjVkNicsXHJcbiAgICAgICAgJyNkMDY0OGEnLFxyXG4gICAgICAgICcjYzBkNjg0JyxcclxuICAgICAgICAnI2YyYmFjOScsXHJcbiAgICAgICAgJyM4NDdkOTknLFxyXG4gICAgICAgICcjYmFmMmQ4JyxcclxuICAgICAgICAnI2JmYjNkZScsXHJcbiAgICAgICAgJyNmNDgxN2MnLFxyXG4gICAgICAgICcjOTRjZGJhJyxcclxuICAgICAgICAnI2IyY2VkZSddO1xyXG4gICAgc3RhdGljIGNvbG9yID0gSGlla25TREtVdGlscy5jb2xvckJhc2UuY29uY2F0KEhpZWtuU0RLVXRpbHMuY29sb3JFeCk7XHJcbiAgICBzdGF0aWMgbG9hZGluZ0hUTUwgPSBgPGRpdiBjbGFzcz1cInNjaGVtYS1pbml0XCI+XHJcbiAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMTQgMzIgMThcIiB3aWR0aD1cIjMyXCIgaGVpZ2h0PVwiNFwiIHByZXNlcnZlQXNwZWN0UmF0aW89XCJub25lXCI+XHJcbiAgICAgICAgPHBhdGggb3BhY2l0eT1cIjAuOFwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgwIDApXCIgZD1cIk0yIDE0IFYxOCBINiBWMTR6XCI+XHJcbiAgICAgICAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT1cInRyYW5zZm9ybVwiIHR5cGU9XCJ0cmFuc2xhdGVcIiB2YWx1ZXM9XCIwIDA7IDI0IDA7IDAgMFwiIGR1cj1cIjJzXCIgYmVnaW49XCIwXCIgcmVwZWF0Q291bnQ9XCJpbmRlZmluaXRlXCIga2V5U3BsaW5lcz1cIjAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjhcIiBjYWxjTW9kZT1cInNwbGluZVwiIC8+PC9wYXRoPlxyXG4gICAgICAgIDxwYXRoIG9wYWNpdHk9XCIwLjVcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMCAwKVwiIGQ9XCJNMCAxNCBWMTggSDggVjE0elwiPlxyXG4gICAgICAgIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9XCJ0cmFuc2Zvcm1cIiB0eXBlPVwidHJhbnNsYXRlXCIgdmFsdWVzPVwiMCAwOyAyNCAwOyAwIDBcIiBkdXI9XCIyc1wiIGJlZ2luPVwiMC4xc1wiIHJlcGVhdENvdW50PVwiaW5kZWZpbml0ZVwiIGtleVNwbGluZXM9XCIwLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44XCIgY2FsY01vZGU9XCJzcGxpbmVcIiAvPjwvcGF0aD5cclxuICAgICAgICA8cGF0aCBvcGFjaXR5PVwiMC4yNVwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgwIDApXCIgZD1cIk0wIDE0IFYxOCBIOCBWMTR6XCI+XHJcbiAgICAgICAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT1cInRyYW5zZm9ybVwiIHR5cGU9XCJ0cmFuc2xhdGVcIiB2YWx1ZXM9XCIwIDA7IDI0IDA7IDAgMFwiIGR1cj1cIjJzXCIgYmVnaW49XCIwLjJzXCIgcmVwZWF0Q291bnQ9XCJpbmRlZmluaXRlXCJcclxuICAgICAgICAga2V5U3BsaW5lcz1cIjAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjhcIiBjYWxjTW9kZT1cInNwbGluZVwiIC8+PC9wYXRoPlxyXG4gICAgICAgIDwvc3ZnPlxyXG4gICAgICAgIDwvZGl2PmA7XHJcblxyXG4gICAgc3RhdGljIGFqYXgob3B0aW9uczogYW55KSB7XHJcbiAgICAgICAgbGV0IGVycm9yID0gb3B0aW9ucy5lcnJvciB8fCAkLm5vb3A7XHJcbiAgICAgICAgbGV0IHR5cGUgPSBvcHRpb25zLnR5cGU7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ0dFVCc6XHJcbiAgICAgICAgICAgICAgICB0eXBlID0gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdQT1NUJzpcclxuICAgICAgICAgICAgICAgIHR5cGUgPSAxO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBuZXdPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICBkYXRhRmlsdGVyOiBvcHRpb25zLmRhdGFGaWx0ZXIgfHwgSGlla25TREtVdGlscy5kYXRhRmlsdGVyLFxyXG4gICAgICAgICAgICBwYXJhbXM6IG9wdGlvbnMuZGF0YSxcclxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGE6IGFueSwgdGV4dFN0YXR1czogc3RyaW5nLCBqcVhIUjogSlF1ZXJ5WEhSLCBwYXJhbXM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5yc0RhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MoZGF0YS5yc0RhdGEsIHRleHRTdGF0dXMsIGpxWEhSLCBkYXRhLCBwYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUiwgbnVsbCwgcGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6ICh4aHI6IEpRdWVyeVhIUiwgdGV4dFN0YXR1czogc3RyaW5nLCBlcnJvclRocm93bjogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcihudWxsLCB0ZXh0U3RhdHVzLCB4aHIsIGVycm9yVGhyb3duKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIG5ld09wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucywgbmV3T3B0aW9ucyk7XHJcbiAgICAgICAgaGlla25qcy5rZ0xvYWRlcihuZXdPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYnVpbGRVcmwodXJsOiBzdHJpbmcsIHF1ZXJ5RGF0YTogYW55KSB7XHJcbiAgICAgICAgaWYgKHF1ZXJ5RGF0YSAmJiAhJC5pc0VtcHR5T2JqZWN0KHF1ZXJ5RGF0YSkpIHtcclxuICAgICAgICAgICAgY29uc3QgbGluayA9IHVybC5pbmRleE9mKCc/JykgPiAwID8gJyYnIDogJz8nO1xyXG4gICAgICAgICAgICByZXR1cm4gdXJsICsgbGluayArICQucGFyYW0ocXVlcnlEYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGF0YUZpbHRlcihkYXRhOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZHJhd1BhZ2luYXRpb24ob3B0aW9uczogYW55KSB7XHJcbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgb3B0aW9ucywge1xyXG4gICAgICAgICAgICBkYXRhOiBNYXRoLmNlaWwob3B0aW9ucy50b3RhbEl0ZW0gLyBvcHRpb25zLnBhZ2VTaXplKSxcclxuICAgICAgICAgICAgY3VyOiBvcHRpb25zLmN1cnJlbnQsXHJcbiAgICAgICAgICAgIHA6IG9wdGlvbnMuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgIGV2ZW50OiBvcHRpb25zLmNhbGxiYWNrXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaGlla25qcy5nZW50UGFnZShvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZXJyb3IobXNnOiBzdHJpbmcpIHtcclxuICAgICAgICB0b2FzdHIuZXJyb3IobXNnKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0VmVyc2lvbigpe1xyXG4gICAgICAgIHJldHVybiBIaWVrblNES1V0aWxzLlZFUlNJT047XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluZm8obXNnOiBzdHJpbmcpIHtcclxuICAgICAgICB0b2FzdHIuaW5mbyhtc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBxaW5pdUltZyhpbWc6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBpbWcgKyAnP189JyArIE1hdGguZmxvb3IobmV3IERhdGUoKS5nZXRUaW1lKCkgLyAzNjAwMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcmFuZG9tSWQocHJlZml4ID0gJycsIHBvc3RmaXggPSAnJywgYXBwZW5kID0gJycpIHtcclxuICAgICAgICByZXR1cm4gcHJlZml4ICsgKGFwcGVuZCA/IGFwcGVuZCA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiAxMDAwMCkpICsgcG9zdGZpeDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2FmZUhUTUwodmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBoaWVrbmpzLnNhZmVIVE1MKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkZWFsTnVsbChkYXRhOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gaGlla25qcy5kZWFsTnVsbChkYXRhKTtcclxuICAgIH1cclxufVxyXG5cbmNsYXNzIEhpZWtuU0RLU2VydmljZSB7XHJcblxyXG4gICAgc2NoZW1hKG9wdGlvbnM6IGFueSwgY2FsbGJhY2s6IEpRdWVyeUFqYXhTdWNjZXNzKSB7XHJcbiAgICAgICAgbGV0IG5ld09wdGlvbnM6SGlla25TY2hlbWFTZXR0aW5nID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMsIHtcclxuICAgICAgICAgICAgcXVlcnlEYXRhOiBvcHRpb25zLmRhdGEgfHwge30sXHJcbiAgICAgICAgICAgIGZvcm1EYXRhOiBvcHRpb25zLmRhdGEyIHx8IHt9LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIEhpZWtuU0RLU2NoZW1hLmxvYWQobmV3T3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzb2NpYXRpb24ob3B0aW9uczogYW55LCBjYWxsYmFjazogSlF1ZXJ5QWpheFN1Y2Nlc3MpIHtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucy5kYXRhMiB8fCB7fSwge1xyXG4gICAgICAgICAgICBhbGxvd0F0dHM6IG9wdGlvbnMuYWxsb3dBdHRzLFxyXG4gICAgICAgICAgICBpZDogb3B0aW9ucy5pZCxcclxuICAgICAgICAgICAgcGFnZVNpemU6IG9wdGlvbnMucGFnZVNpemVcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbmV3T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcXVlcnlEYXRhOiBvcHRpb25zLmRhdGEgfHwge30sXHJcbiAgICAgICAgICAgIGZvcm1EYXRhOiBmb3JtRGF0YSxcclxuICAgICAgICAgICAgc3VjY2VzczogY2FsbGJhY2tcclxuICAgICAgICB9O1xyXG4gICAgICAgIG5ld09wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucywgbmV3T3B0aW9ucyk7XHJcbiAgICAgICAgSGlla25TREtBc3NvY2lhdGlvbi5sb2FkKG5ld09wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRhZ2dpbmcob3B0aW9uczogYW55LCBjYWxsYmFjazogSlF1ZXJ5QWpheFN1Y2Nlc3MpIHtcclxuICAgICAgICBsZXQgcXVlcnlEYXRhID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMuZGF0YSB8fCB7fSwge1xyXG4gICAgICAgICAgICBrdzogb3B0aW9ucy5rd1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBuZXdPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBxdWVyeURhdGE6IHF1ZXJ5RGF0YSxcclxuICAgICAgICAgICAgZm9ybURhdGE6IG9wdGlvbnMuZGF0YTIgfHwge30sXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXHJcbiAgICAgICAgfTtcclxuICAgICAgICBuZXdPcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMsIG5ld09wdGlvbnMpO1xyXG4gICAgICAgIEhpZWtuU0RLVGFnZ2luZy5sb2FkKG5ld09wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc2FtYmlndWF0ZShvcHRpb25zOiBhbnksIGNhbGxiYWNrOiBKUXVlcnlBamF4U3VjY2Vzcykge1xyXG4gICAgICAgIGxldCBxdWVyeURhdGEgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucy5kYXRhIHx8IHt9LCB7XHJcbiAgICAgICAgICAgIGt3OiBvcHRpb25zLmt3XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGV0IG5ld09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5RGF0YTogcXVlcnlEYXRhLFxyXG4gICAgICAgICAgICBmb3JtRGF0YTogb3B0aW9ucy5kYXRhMiB8fCB7fSxcclxuICAgICAgICAgICAgc3VjY2VzczogY2FsbGJhY2tcclxuICAgICAgICB9O1xyXG4gICAgICAgIG5ld09wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucywgbmV3T3B0aW9ucyk7XHJcbiAgICAgICAgSGlla25TREtEaXNhbWJpZ3VhdGUubG9hZChuZXdPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzZWdtZW50KG9wdGlvbnM6IGFueSwgY2FsbGJhY2s6IEpRdWVyeUFqYXhTdWNjZXNzKSB7XHJcbiAgICAgICAgbGV0IHF1ZXJ5RGF0YSA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLmRhdGEgfHwge30sIHtcclxuICAgICAgICAgICAga3c6IG9wdGlvbnMua3dcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbmV3T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcXVlcnlEYXRhOiBxdWVyeURhdGEsXHJcbiAgICAgICAgICAgIGZvcm1EYXRhOiBvcHRpb25zLmRhdGEyIHx8IHt9LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgbmV3T3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLCBuZXdPcHRpb25zKTtcclxuICAgICAgICBIaWVrblNES1NlZ21lbnQubG9hZChuZXdPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdXBkYXRlT3B0aW9uc0RhdGEob3B0aW9uczogYW55KSB7XHJcbiAgICAgICAgb3B0aW9ucy5mb3JtRGF0YSA9IG9wdGlvbnMuZm9ybURhdGEgfHwgb3B0aW9ucy5kYXRhMiB8fCB7fTtcclxuICAgICAgICBvcHRpb25zLnF1ZXJ5RGF0YSA9IG9wdGlvbnMucXVlcnlEYXRhIHx8IG9wdGlvbnMuZGF0YSB8fCB7fTtcclxuICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGlla25OZXRDaGFydFVwZGF0ZVNlcnZpY2Uge1xyXG5cclxuICAgIHN0YXRpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6IGFueSkge1xyXG4gICAgICAgIG9wdGlvbnMgPSBIaWVrblNES1NlcnZpY2UudXBkYXRlT3B0aW9uc0RhdGEob3B0aW9ucyk7XHJcbiAgICAgICAgb3B0aW9ucy5pbmZvYm94U2V0dGluZyA9IHtlbmFibGU6b3B0aW9ucy5pbmZvYm94fTtcclxuICAgICAgICBvcHRpb25zLmVuYWJsZUF1dG9VcGRhdGVTdHlsZSAhPSB1bmRlZmluZWQgJiYgKG9wdGlvbnMuYXV0b1VwZGF0ZVN0eWxlID0gb3B0aW9ucy5lbmFibGVBdXRvVXBkYXRlU3R5bGUpO1xyXG4gICAgICAgIHJldHVybiBvcHRpb25zO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWVrbkdyYXBoU2VydmljZSBleHRlbmRzIEhpZWtuU0RLR3JhcGgge1xyXG5cclxuICAgIHByb3RlY3RlZCBiZWZvcmVJbml0KG9wdGlvbnM6IEhpZWtuTmV0Q2hhcnRTZXR0aW5nKSB7XHJcbiAgICAgICAgc3VwZXIuYmVmb3JlSW5pdChIaWVrbk5ldENoYXJ0VXBkYXRlU2VydmljZS51cGRhdGVPcHRpb25zKG9wdGlvbnMpKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGlla25UaW1pbmdHcmFwaFNlcnZpY2UgZXh0ZW5kcyBIaWVrblNES1RpbWluZyB7XHJcblxyXG4gICAgcHJvdGVjdGVkIGJlZm9yZUluaXQob3B0aW9uczogSGlla25OZXRDaGFydFNldHRpbmcpIHtcclxuICAgICAgICBzdXBlci5iZWZvcmVJbml0KEhpZWtuTmV0Q2hhcnRVcGRhdGVTZXJ2aWNlLnVwZGF0ZU9wdGlvbnMob3B0aW9ucykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWVrblBhdGhTZXJ2aWNlIGV4dGVuZHMgSGlla25TREtQYXRoIHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgYmVmb3JlSW5pdChvcHRpb25zOiBIaWVrbk5ldENoYXJ0U2V0dGluZykge1xyXG4gICAgICAgIHN1cGVyLmJlZm9yZUluaXQoSGlla25OZXRDaGFydFVwZGF0ZVNlcnZpY2UudXBkYXRlT3B0aW9ucyhvcHRpb25zKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuUmVsYXRpb25TZXJ2aWNlIGV4dGVuZHMgSGlla25TREtSZWxhdGlvbiB7XHJcblxyXG4gICAgcHJvdGVjdGVkIGJlZm9yZUluaXQob3B0aW9uczogSGlla25OZXRDaGFydFNldHRpbmcpIHtcclxuICAgICAgICBzdXBlci5iZWZvcmVJbml0KEhpZWtuTmV0Q2hhcnRVcGRhdGVTZXJ2aWNlLnVwZGF0ZU9wdGlvbnMob3B0aW9ucykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWVrbkluZm9ib3hTZXJ2aWNlIGV4dGVuZHMgSGlla25TREtJbmZvYm94IHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkge1xyXG4gICAgICAgIG9wdGlvbnMgPSBIaWVrblNES1NlcnZpY2UudXBkYXRlT3B0aW9uc0RhdGEob3B0aW9ucyk7XHJcbiAgICAgICAgb3B0aW9ucy5jaGFuZ2VJbmZvYm94ID0gb3B0aW9ucy5ocmVmO1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWVrblByb21wdFNlcnZpY2UgZXh0ZW5kcyBIaWVrblNES1Byb21wdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHtcclxuICAgICAgICBvcHRpb25zID0gSGlla25TREtTZXJ2aWNlLnVwZGF0ZU9wdGlvbnNEYXRhKG9wdGlvbnMpO1xyXG4gICAgICAgIG9wdGlvbnMucHJvbXB0VHlwZSA9IDA7XHJcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuQ29uY2VwdFByb21wdFNlcnZpY2UgZXh0ZW5kcyBIaWVrblNES1Byb21wdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHtcclxuICAgICAgICBvcHRpb25zID0gSGlla25TREtTZXJ2aWNlLnVwZGF0ZU9wdGlvbnNEYXRhKG9wdGlvbnMpO1xyXG4gICAgICAgIG9wdGlvbnMucHJvbXB0VHlwZSA9IDE7XHJcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuQ29uY2VwdEdyYXBoU2VydmljZSBleHRlbmRzIEhpZWtuU0RLQ29uY2VwdEdyYXBoIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkge1xyXG4gICAgICAgIG9wdGlvbnMgPSBIaWVrblNES1NlcnZpY2UudXBkYXRlT3B0aW9uc0RhdGEob3B0aW9ucyk7XHJcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEhpZWtuVGFibGVTZXJ2aWNlIGV4dGVuZHMgSGlla25TREtUYWJsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHtcclxuICAgICAgICBvcHRpb25zID0gSGlla25TREtTZXJ2aWNlLnVwZGF0ZU9wdGlvbnNEYXRhKG9wdGlvbnMpO1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWVrblJlc291cmNlU2VydmljZSBleHRlbmRzIEhpZWtuU0RLUmVzb3VyY2Uge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogYW55KSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IEhpZWtuU0RLU2VydmljZS51cGRhdGVPcHRpb25zRGF0YShvcHRpb25zKTtcclxuICAgICAgICBzdXBlcihvcHRpb25zKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGlla25SZXNvdXJjZXNTZXJ2aWNlIGV4dGVuZHMgSGlla25TREtSZXNvdXJjZXMge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogYW55KSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IEhpZWtuU0RLU2VydmljZS51cGRhdGVPcHRpb25zRGF0YShvcHRpb25zKTtcclxuICAgICAgICBzdXBlcihvcHRpb25zKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGlla25Db25jZXB0VHJlZVNlcnZpY2UgZXh0ZW5kcyBIaWVrblNES0NvbmNlcHRUcmVlIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkge1xyXG4gICAgICAgIG9wdGlvbnMgPSBIaWVrblNES1NlcnZpY2UudXBkYXRlT3B0aW9uc0RhdGEob3B0aW9ucyk7XHJcbiAgICAgICAgb3B0aW9ucy5ub2RlSG92ZXJUb29scy5pbmZvYm94U2V0dGluZyA9IG9wdGlvbnMubm9kZUhvdmVyVG9vbHMuaW5mb2JveDtcclxuICAgICAgICBvcHRpb25zLm5vZGVIb3ZlclRvb2xzLmdyYXBoU2V0dGluZyA9IG9wdGlvbnMubm9kZUhvdmVyVG9vbHMuZ3JhcGg7XHJcbiAgICAgICAgb3B0aW9ucy5ub2RlSG92ZXJUb29scy5ncmFwaFNldHRpbmcuaW5mb2JveFNldHRpbmcgPSBvcHRpb25zLm5vZGVIb3ZlclRvb2xzLmdyYXBoU2V0dGluZy5pbmZvYm94O1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWVrblN0YXRTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkge1xyXG4gICAgICAgIG9wdGlvbnMgPSBIaWVrblNES1NlcnZpY2UudXBkYXRlT3B0aW9uc0RhdGEob3B0aW9ucyk7XHJcbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgb3B0aW9ucy5mb3JtRGF0YSwgb3B0aW9ucy5jb25maWcucXVlcnlTZXR0aW5ncyk7XHJcbiAgICAgICAgb3B0aW9ucy5mb3JtRGF0YVVwZGF0ZXIgPSBvcHRpb25zLmJlZm9yZUxvYWQ7IC8vVE9ET1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSBvcHRpb25zLmNvbmZpZy50eXBlO1xyXG4gICAgICAgIGlmICh0eXBlID09ICdwaWUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGlla25TREtTdGF0UGllKG9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnbGluZScgfHwgdHlwZSA9PSAnYmFyJykge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEhpZWtuU0RLU3RhdExpbmVCYXIob3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09ICd3b3JkQ2xvdWQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGlla25TREtTdGF0V29yZENsb3VkKG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==

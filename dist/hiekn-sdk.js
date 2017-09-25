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
var HieknSDKStatMap = /** @class */ (function (_super) {
    __extends(HieknSDKStatMap, _super);
    function HieknSDKStatMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKStatMap.prototype.drawChart = function () {
        var _this = this;
        var stat = this.options.config;
        this.chart = echarts.init(this.$container[0]);
        var data = this.stat;
        //34个省、市、自治区的名字拼音映射数组
        var provinces = {
            //23个省
            "台湾": "taiwan",
            "河北": "hebei",
            "山西": "shanxi",
            "辽宁": "liaoning",
            "吉林": "jilin",
            "黑龙江": "heilongjiang",
            "江苏": "jiangsu",
            "浙江": "zhejiang",
            "安徽": "anhui",
            "福建": "fujian",
            "江西": "jiangxi",
            "山东": "shandong",
            "河南": "henan",
            "湖北": "hubei",
            "湖南": "hunan",
            "广东": "guangdong",
            "海南": "hainan",
            "四川": "sichuan",
            "贵州": "guizhou",
            "云南": "yunnan",
            "陕西": "shanxi1",
            "甘肃": "gansu",
            "青海": "qinghai",
            //5个自治区
            "新疆": "xinjiang",
            "广西": "guangxi",
            "内蒙古": "neimenggu",
            "宁夏": "ningxia",
            "西藏": "xizang",
            //4个直辖市
            "北京": "beijing",
            "天津": "tianjin",
            "上海": "shanghai",
            "重庆": "chongqing",
            //2个特别行政区
            "香港": "xianggang",
            "澳门": "aomen"
        };
        //直辖市和特别行政区-只有二级地图，没有三级地图
        var special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
        var mapdata = [];
        //绘制全国地图
        $.getJSON('../json/china.json', function (data) {
            var d = [];
            for (var i = 0; i < data.features.length; i++) {
                d.push({
                    name: data.features[i].properties.name
                });
            }
            mapdata = d;
            //注册地图
            echarts.registerMap('china', data);
            //绘制地图
            renderMap('china', d);
        });
        //地图点击事件
        this.chart.on('click', function (params) {
            // console.log(params);
            if (params.name in provinces) {
                //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
                $.getJSON('../json/province/' + provinces[params.name] + '.json', function (data) {
                    echarts.registerMap(params.name, data);
                    var d = [];
                    for (var i = 0; i < data.features.length; i++) {
                        d.push({
                            name: data.features[i].properties.name
                        });
                    }
                    renderMap(params.name, d);
                });
            }
            else if (params.seriesName in provinces) {
                //如果是【直辖市/特别行政区】只有二级下钻
                if (special.indexOf(params.seriesName) >= 0) {
                    renderMap('china', mapdata);
                }
                else {
                    //显示县级地图
                    $.getJSON('../json/city/' + cityMap[params.name] + '.json', function (data) {
                        echarts.registerMap(params.name, data);
                        var d = [];
                        for (var i = 0; i < data.features.length; i++) {
                            d.push({
                                name: data.features[i].properties.name
                            });
                        }
                        renderMap(params.name, d);
                    });
                }
            }
            else {
                renderMap('china', mapdata);
            }
        });
        //初始化绘制全国地图配置
        var defaultOption = {
            backgroundColor: '#fff',
            title: {
                text: '地图',
                left: 'center',
                textStyle: {
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'normal',
                    fontFamily: "Microsoft YaHei"
                },
                subtextStyle: {
                    color: '#ccc',
                    fontSize: 13,
                    fontWeight: 'normal',
                    fontFamily: "Microsoft YaHei"
                }
            },
            graphic: {
                id: 'goback',
                type: 'circle',
                shape: { r: 20 },
                style: {
                    text: '返回',
                    fill: '#eee'
                },
                left: 10,
                top: 10,
                onclick: function () {
                    renderMap('china', mapdata);
                }
            },
            tooltip: {
                trigger: 'item'
            },
            visualMap: {
                min: 0,
                max: 2500,
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                inRange: {
                    color: [this.options.chartColor[2], this.options.chartColor[3]]
                },
                calculable: true
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                    dataView: { readOnly: false },
                    restore: {},
                    saveAsImage: {}
                },
                iconStyle: {
                    normal: {
                        color: '#fff'
                    }
                }
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 1000
        };
        var option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        }
        else {
            option = defaultOption;
        }
        var renderMap = function (map, data) {
            option.title.subtext = map;
            option.series = [
                {
                    name: map,
                    type: 'map',
                    mapType: map,
                    roam: true,
                    nameMap: {
                        'china': '中国'
                    },
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                color: '#999',
                                fontSize: 13
                            }
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                color: '#fff',
                                fontSize: 13
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            areaColor: '#eee',
                            borderColor: 'dodgerblue'
                        },
                        emphasis: {
                            areaColor: 'darkorange'
                        }
                    },
                    data: _this.stat
                }
            ];
            //渲染地图
            console.log(JSON.stringify(option));
            _this.chart.setOption(option);
        };
    };
    return HieknSDKStatMap;
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
var HieknSDKStatRadar = /** @class */ (function (_super) {
    __extends(HieknSDKStatRadar, _super);
    function HieknSDKStatRadar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKStatRadar.prototype.drawChart = function () {
        var d = this.stat;
        var stat = this.options.config;
        var data = d.series;
        var arr = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var val = data_1[_i];
            arr.push(val.value);
        }
        console.log(arr);
        var defaultSeries = {
            name: '',
            type: 'radar',
            data: [arr],
            symbol: 'none',
            itemStyle: {
                normal: {
                    color: this.options.chartColor[0]
                }
            },
            areaStyle: {
                normal: {
                    opacity: 0.1
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
            backgroundColor: '#fff',
            title: {
                text: stat.chartSettings.title.text,
                left: 'center',
                textStyle: {
                    color: '#eee'
                }
            },
            legend: {
                bottom: 5,
                data: stat.chartSettings.title.text,
                itemGap: 20,
                textStyle: {
                    color: '#fff',
                    fontSize: 14
                },
                selectedMode: 'single'
            },
            radar: {
                shape: 'circle',
                splitNumber: 5,
                name: {
                    textStyle: {
                        color: 'rgb(0, 179, 138)'
                    }
                },
                splitArea: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 179, 138, 0.5)'
                    }
                }
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
    return HieknSDKStatRadar;
}(HieknSDKStat));
var HieknSDKStatScatter = /** @class */ (function (_super) {
    __extends(HieknSDKStatScatter, _super);
    function HieknSDKStatScatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HieknSDKStatScatter.prototype.drawChart = function () {
        var data = this.stat;
        console.log(data);
        var stat = this.options.config;
        var defaultSeries = [];
        for (var i = 0; i < data.series.length; i++) {
            defaultSeries.push({
                name: stat.chartSettings.legend.data ? stat.chartSettings.legend.data[i] : '',
                data: data.series[i],
                type: 'scatter',
                symbolSize: function (data) {
                    return Math.sqrt(data[2]) / 5e2;
                },
                label: {
                    emphasis: {
                        show: true,
                        formatter: function (param) {
                            return param.data[3];
                        },
                        position: 'top'
                    }
                },
                itemStyle: {
                    normal: {
                        color: this.options.chartColor[i]
                    }
                }
            });
        }
        ;
        var series = [];
        if (stat.chartSettings && stat.chartSettings.series) {
            series = $.extend(true, {}, defaultSeries, stat.chartSettings.series);
        }
        else {
            series = defaultSeries;
        }
        this.chart = echarts.init(this.$container[0]);
        var defaultOption = {
            backgroundColor: '#fff',
            title: {
                text: ''
            },
            series: series,
            legend: {
                right: 10,
                data: data.name
            },
            xAxis: {
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            yAxis: {
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                scale: true
            }
        };
        var option = {};
        if (stat.chartSettings) {
            option = $.extend(true, {}, defaultOption, stat.chartSettings);
        }
        else {
            option = defaultOption;
        }
        this.chart.setOption(option);
    };
    return HieknSDKStatScatter;
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
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var v = data_2[_i];
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
        for (var _b = 0, data_3 = data; _b < data_3.length; _b++) {
            var d = data_3[_b];
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
        else if (type == 'radar') {
            return new HieknSDKStatRadar(options);
        }
        else if (type == 'scatter') {
            return new HieknSDKStatScatter(options);
        }
        else if (type == 'map') {
            return new HieknSDKStatMap(options);
        }
    }
    return HieknStatService;
}());

//# sourceMappingURL=hiekn-sdk.js.map

(function () {

    window.HieknSDKService = gentService();

    function gentService() {
        var Service = function () {
            this.colorList = {
                'aliceblue': '#f0f8ff',
                'antiquewhite': '#faebd7',
                'aqua': '#00ffff',
                'aquamarine': '#7fffd4',
                'azure': '#f0ffff',
                'beige': '#f5f5dc',
                'bisque': '#ffe4c4',
                'black': '#000000',
                'blanchedalmond': '#ffebcd',
                'blue': '#0000ff',
                'blueviolet': '#8a2be2',
                'brown': '#a52a2a',
                'burlywood': '#deb887',
                'cadetblue': '#5f9ea0',
                'chartreuse': '#7fff00',
                'chocolate': '#d2691e',
                'coral': '#ff7f50',
                'cornflowerblue': '#6495ed',
                'cornsilk': '#fff8dc',
                'crimson': '#dc143c',
                'cyan': '#00ffff',
                'darkblue': '#00008b',
                'darkcyan': '#008b8b',
                'darkgoldenrod': '#b8860b',
                'darkgray': '#a9a9a9',
                'darkgrey': '#a9a9a9',
                'darkgreen': '#006400',
                'darkkhaki': '#bdb76b',
                'darkmagenta': '#8b008b',
                'darkolivegreen': '#556b2f',
                'darkorange': '#ff8c00',
                'darkorchid': '#9932cc',
                'darkred': '#8b0000',
                'darksalmon': '#e9967a',
                'darkseagreen': '#8fbc8f',
                'darkslateblue': '#483d8b',
                'darkslategray': '#2f4f4f',
                'darkslategrey': '#2f4f4f',
                'darkturquoise': '#00ced1',
                'darkviolet': '#9400d3',
                'deeppink': '#ff1493',
                'deepskyblue': '#00bfff',
                'dimgray': '#696969',
                'dimgrey': '#696969',
                'dodgerblue': '#1e90ff',
                'firebrick': '#b22222',
                'floralwhite': '#fffaf0',
                'forestgreen': '#228b22',
                'fuchsia': '#ff00ff',
                'gainsboro': '#dcdcdc',
                'ghostwhite': '#f8f8ff',
                'gold': '#ffd700',
                'goldenrod': '#daa520',
                'gray': '#808080',
                'grey': '#808080',
                'green': '#008000',
                'greenyellow': '#adff2f',
                'honeydew': '#f0fff0',
                'hotpink': '#ff69b4',
                'indianred': '#cd5c5c',
                'indigo': '#4b0082',
                'ivory': '#fffff0',
                'khaki': '#f0e68c',
                'lavender': '#e6e6fa',
                'lavenderblush': '#fff0f5',
                'lawngreen': '#7cfc00',
                'lemonchiffon': '#fffacd',
                'lightblue': '#add8e6',
                'lightcoral': '#f08080',
                'lightcyan': '#e0ffff',
                'lightgoldenrodyellow': '#fafad2',
                'lightgray': '#d3d3d3',
                'lightgrey': '#d3d3d3',
                'lightgreen': '#90ee90',
                'lightpink': '#ffb6c1',
                'lightsalmon': '#ffa07a',
                'lightseagreen': '#20b2aa',
                'lightskyblue': '#87cefa',
                'lightslategray': '#778899',
                'lightslategrey': '#778899',
                'lightsteelblue': '#b0c4de',
                'lightyellow': '#ffffe0',
                'lime': '#00ff00',
                'limegreen': '#32cd32',
                'linen': '#faf0e6',
                'magenta': '#ff00ff',
                'maroon': '#800000',
                'mediumaquamarine': '#66cdaa',
                'mediumblue': '#0000cd',
                'mediumorchid': '#ba55d3',
                'mediumpurple': '#9370d8',
                'mediumseagreen': '#3cb371',
                'mediumslateblue': '#7b68ee',
                'mediumspringgreen': '#00fa9a',
                'mediumturquoise': '#48d1cc',
                'mediumvioletred': '#c71585',
                'midnightblue': '#191970',
                'mintcream': '#f5fffa',
                'mistyrose': '#ffe4e1',
                'moccasin': '#ffe4b5',
                'navajowhite': '#ffdead',
                'navy': '#000080',
                'oldlace': '#fdf5e6',
                'olive': '#808000',
                'olivedrab': '#6b8e23',
                'orange': '#ffa500',
                'orangered': '#ff4500',
                'orchid': '#da70d6',
                'palegoldenrod': '#eee8aa',
                'palegreen': '#98fb98',
                'paleturquoise': '#afeeee',
                'palevioletred': '#d87093',
                'papayawhip': '#ffefd5',
                'peachpuff': '#ffdab9',
                'peru': '#cd853f',
                'pink': '#ffc0cb',
                'plum': '#dda0dd',
                'powderblue': '#b0e0e6',
                'purple': '#800080',
                'rebeccapurple': '#663399',
                'red': '#ff0000',
                'rosybrown': '#bc8f8f',
                'royalblue': '#4169e1',
                'saddlebrown': '#8b4513',
                'salmon': '#fa8072',
                'sandybrown': '#f4a460',
                'seagreen': '#2e8b57',
                'seashell': '#fff5ee',
                'sienna': '#a0522d',
                'silver': '#c0c0c0',
                'skyblue': '#87ceeb',
                'slateblue': '#6a5acd',
                'slategray': '#708090',
                'slategrey': '#708090',
                'snow': '#fffafa',
                'springgreen': '#00ff7f',
                'steelblue': '#4682b4',
                'tan': '#d2b48c',
                'teal': '#008080',
                'thistle': '#d8bfd8',
                'tomato': '#ff6347',
                'turquoise': '#40e0d0',
                'violet': '#ee82ee',
                'wheat': '#f5deb3',
                'white': '#ffffff',
                'whitesmoke': '#f5f5f5',
                'yellow': '#ffff00',
                'yellowgreen': '#9acd32'
            };
        };

        Service.prototype.drawPromptItem = function (schema) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (data, pre) {
                var line = '<span class="prompt-tip-title">' + data.name.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
                line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (data.className || typeObj[data.classId] || '') + '</span>' + line;
                return line;
            }
        };

        Service.prototype.onPrompt = function (options) {
            var self = this;
            return function (pre, $self) {
                var param = options.data || {};
                param.kgName = options.kgName;
                param.kw = pre;
                hieknjs.kgLoader({
                    url: options.baseUrl + 'prompt',
                    params: param,
                    type: 1,
                    success: function (data) {
                        if ($self.prompt == param.kw) {
                            var d = data.rsData;
                            options.beforeDrawPrompt && (d = options.beforeDrawPrompt(d, pre));
                            $self.startDrawPromptItems(d, pre);
                        }
                    }
                });
            }
        };

        Service.prototype.schema = function (options, callback) {
            var self = this;
            var param = options.data || {};
            param.kgName = options.kgName;
            hieknjs.kgLoader({
                url: options.baseUrl + 'schema',
                type: 1,
                params: param,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                }
            });
        };

        Service.prototype.gentInfobox = function (options) {
            var self = this;
            var data = options.data || {};
            data.isRelationAtts = true;
            self.infoboxService = new HieknInfoboxService({
                baseUrl: options.baseUrl,
                kgName: options.kgName,
                imagePrefix: options.imagePrefix,
                data: data
            });
            self.infoboxService.initEvent($(options.selector));
        };

        Service.prototype.infobox = function () {
            var self = this;
            return function (data, node, callback) {
                if (node.detail) {
                    callback(node.detail);
                } else {
                    self.infoboxService.load(data.id, function (data) {
                        data = self.infoboxService.buildInfobox(data)[0].outerHTML;
                        node.detail = data;
                        callback(data);
                    });
                }
                return null;
            }
        };

        Service.prototype.qiniuImg = function (img) {
            return img + '?_=' + parseInt(new Date().getTime() / 3600000);
        };

        Service.prototype.nodeStyleFunction = function (options) {
            var self = this;
            return function (node) {
                options.tgc2.nodeStyleFunction(node);
                node.imageCropping = 'fit';
                if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                } else if (!$.isEmptyObject(options.tgc2.nodeIds)) {
                    node.fillColor = options.tgc2.settings.netChart.reduceColor;
                    node.lineColor = node.fillColor;
                    node.label = '';
                } else {
                    node.fillColor = node.data.color || '#fff';
                    node.lineColor = '#00b38a';
                    if (node.hovered) {
                        node.fillColor = node.lineColor;
                        node.shadowBlur = 0;
                    }
                }
                if (options.nodeColors && options.nodeColors[node.data.classId]) {
                    node.lineWidth = 2;
                    if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                        node.fillColor = options.tgc2.settings.netChart.emphasesColor;
                        node.lineColor = node.fillColor;
                    } else if (!$.isEmptyObject(options.tgc2.nodeIds)) {
                    } else {
                        node.lineColor = options.nodeColors[node.data.classId];
                        if (node.hovered) {
                            node.fillColor = node.lineColor;
                        }
                    }
                }
                if (node.data.img) {
                    if (node.data.img.indexOf('http') != 0 && options.imagePrefix) {
                        node.image = self.qiniuImg(options.imagePrefix + node.data.img);
                    } else {
                        node.image = node.data.img;
                    }
                    if (!options.tgc2.inStart(node.id) && !options.tgc2.nodeIds[node.id] && !$.isEmptyObject(options.tgc2.nodeIds)) {
                        node.image = '';
                    }
                    node.fillColor = '#fff';
                } else if (options.images && options.images[node.data.classId]) {
                    if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                        node.image = options.images[node.data.classId].emphases;
                    } else if (!$.isEmptyObject(options.tgc2.nodeIds)) {
                        node.image = '';
                    } else {
                        if (node.hovered) {
                            node.image = options.images[node.data.classId].emphases;
                        } else {
                            node.image = options.images[node.data.classId].normal;
                        }
                    }
                }
            }
        };

        Service.prototype.colorFade = function (color, amount) {
            try {
                var rgba = [];
                if (this.colorList[color]) {
                    color = this.colorList[color];
                }
                if (color.indexOf('rgb') == 0 || color.indexOf('hsl') == 0) {
                    rgba = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',');
                } else if (color.indexOf('#') == 0) {
                    color = color.substring(1);
                    rgba = color.match(/.{2}/g).map(function (c) {
                        return parseInt(c, 16);
                    });
                }
                rgba[3] = parseInt((rgba[3] || 1) * amount * 100) / 100;
                if (color.indexOf('hsl') == 0) {
                    return 'hsla(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ')';
                } else {
                    return 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ')';
                }
            } catch (e) {
                return color;
            }
        };

        Service.prototype.buildFilter = function (schema, options) {
            var allowAtts = [];
            var allowAttsSelected = [];
            var allowTypes = [];
            var allowTypesSelected = [];
            for (var i in schema.atts) {
                var att = schema.atts[i];
                if (att.type == 1) {
                    allowAtts.push({value: att.k, label: att.v});
                    allowAttsSelected.push(att.k);
                }
            }
            for (var j in schema.types) {
                var type = schema.types[j];
                allowTypes.push({value: type.k, label: type.v});
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
            ]
        };

        Service.prototype.dealGraphData = function (data, schema) {
            data.nodes = data.entityList;
            data.links = data.relationList;
            delete data.entityList;
            delete data.relationList;
            var schemas = {};
            var arr = _.concat(schema.types, schema.atts);
            for (var j in arr) {
                var kv = arr[j];
                schemas[kv.k] = kv.v;
            }
            for (var i in data.nodes) {
                var node = data.nodes[i];
                node.typeName = schemas[node.classId];
            }
            for (var k in data.links) {
                var link = data.links[k];
                link.typeName = schemas[link.attId];
            }
            return data;
        };

        Service.prototype.linkContentsFunction = function (linkData) {
            var self = this;
            if (linkData.rInfo) {
                var items = '';
                for (var i in linkData.rInfo) {
                    var d = linkData.rInfo[i];
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
            } else {
                return linkData.typeName;
            }
        };

        Service.prototype.graph = function (options, schema) {
            var self = this;
            return function ($self, callback, failed) {
                var param = options.data || {};
                param.kgName = options.kgName;
                param.id = options.tgc2.startInfo.id;
                param.isRelationMerge = true;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                if (options.tgc2Page) {
                    var page = options.tgc2Page.page;
                    param.pageNo = page.pageNo;
                    param.pageSize = page.pageSize;
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'graph',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            if (data) {
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        } else {
                            failed();
                        }
                    },
                    error: function () {
                        failed();
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        Service.prototype.relation = function (options, schema) {
            var self = this;
            return function (instance, callback, failed) {
                var ids = _.map(options.tgc2.startInfo.nodes, 'id');
                var param = options.data || {};
                param.ids = ids;
                param.isShortest = true;
                param.connectsCompute = true;
                param.statsCompute = true;
                param.kgName = options.kgName;
                param.statsConfig = options.statsConfig;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'relation',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            if (data) {
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        } else {
                            failed();
                        }
                    },
                    error: function () {
                        toastr.error('网络接口错误！');
                        failed();
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        Service.prototype.path = function (options, schema) {
            var self = this;
            return function (instance, callback, failed) {
                var param = options.data || {};
                param.start = options.tgc2.startInfo.start.id;
                param.end = options.tgc2.startInfo.end.id;
                param.isShortest = true;
                param.connectsCompute = true;
                param.statsCompute = true;
                param.kgName = options.kgName;
                param.statsConfig = options.statsConfig;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'path',
                    type: 1,
                    params: param,
                    success: function (response) {
                        if (response && response.rsData && response.rsData.length) {
                            var data = response.rsData[0];
                            if (data) {
                                data = self.dealGraphData(data, schema);
                            }
                            callback(data);
                        } else {
                            failed();
                        }
                    },
                    error: function () {
                        toastr.error('网络接口错误！');
                        failed();
                    },
                    that: $(options.selector).find('.tgc2-netchart-container')[0]
                });
            }
        };

        return Service;
    }
})();

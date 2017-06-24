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
                var title = data.name;
                if (data.meaningTag) {
                    title = title + ' ( ' + data.meaningTag + ' )';
                }
                var line = '<span class="prompt-tip-title">' + title.replace(new RegExp('(' + pre + ')', 'gi'), '<span class="highlight">' + '$1' + '</span>') + '</span>';
                line = '<span class="prompt-tip-type prompt-tip-' + data.classId + '">' + (data.className || typeObj[data.classId] || '') + '</span>' + line;
                return line;
            }
        };

        Service.prototype.drawPromptItems = function (schema, hieknPrompt) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (data, pre) {
                var $container = $('<div></div>');
                data.forEach(function (v) {
                    var text = hieknPrompt.instance.options.drawPromptItem(v, pre);
                    var title = hieknPrompt.instance.options.drawItemTitle(v);
                    var cls = 'prompt-item-' + v.classId;
                    var $li = $('<li title="' + title + '" class="' + cls + '">' + text + '</li>').data('data', v);
                    var ex = $container.find('.' + cls);
                    if (ex.length) {
                        $(ex[ex.length - 1]).after($li);
                        $li.find('.prompt-tip-type').empty();
                    } else {
                        $container.append($li);
                    }
                });
                return $container.children();
            }
        };

        Service.prototype.onPromptStart = function (options) {
            var self = this;
            return function (pre, $self) {
                var param = options.data || {};
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2[options.paramName] = pre;
                hieknjs.kgLoader({
                    url: options.url + '?' + $.param(param),
                    params: param2,
                    type: options.type,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    success: function (data) {
                        if ($self.prompt == param2[options.paramName]) {
                            var d = data.rsData;
                            options.beforeDrawPrompt && (d = options.beforeDrawPrompt(d, pre));
                            $self.startDrawPromptItems(d, pre);
                        }
                    }
                });
            }
        };

        Service.prototype.onPrompt = function (options) {
            var self = this;
            options.paramName = 'kw';
            options.url = options.baseUrl + 'prompt';
            options.type = 1;
            return self.onPromptStart(options);
        };

        Service.prototype.onPromptKnowledge = function (options) {
            var self = this;
            options.paramName = 'text';
            options.url = options.baseUrl + 'prompt/knowledge';
            options.type = 0;
            return self.onPromptStart(options);
        };

        Service.prototype.beforeSearch = function () {
            var self = this;
            return function (selectedItem, $container) {
                if (selectedItem) {
                    $container.find('input[type=text]').val(selectedItem.name);
                }
            }
        };

        Service.prototype.schema = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param2.kgName = options.kgName;
            hieknjs.kgLoader({
                url: options.baseUrl + 'schema' + '?' + $.param(param),
                type: 1,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                beforeSend: function () {
                    options.that && $(options.that).find('.ajax-loading').html('<div class="schema-init">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 14 32 18" width="32" height="4" preserveAspectRatio="none">' +
                        '<path opacity="0.8" transform="translate(0 0)" d="M2 14 V18 H6 V14z">' +
                        '<animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0" repeatCount="indefinite"' +
                        ' keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>' +
                        '<path opacity="0.5" transform="translate(0 0)" d="M0 14 V18 H8 V14z">' +
                        '<animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.1s" repeatCount="indefinite"' +
                        ' keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>' +
                        '<path opacity="0.25" transform="translate(0 0)" d="M0 14 V18 H8 V14z">' +
                        '<animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.2s" repeatCount="indefinite"' +
                        ' keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" /></path>' +
                        '</svg>' +
                        '</div>');
                },
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                },
                that: options.that
            });
        };

        Service.prototype.segment = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param.kgName = options.kgName;
            param.kw = options.kw;
            hieknjs.kgLoader({
                url: options.baseUrl + 'segment' + '?' + $.param(param),
                type: 0,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData;
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                },
                that: options.that
            });
        };

        Service.prototype.association = function (options, callback) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param2.kgName = options.kgName;
            param2.id = options.id;
            param2.allowAtts = options.allowAtts;
            param2.pageSize = options.pageSize || 6;
            hieknjs.kgLoader({
                url: options.baseUrl + 'association' + '?' + $.param(param),
                type: 1,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData;
                        callback(data);
                    }
                },
                error: function () {
                    toastr.error('网络接口错误！');
                },
                that: options.that
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

        Service.prototype.legend = function (schema) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (key, value) {
                return '<i style="background: ' + value + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>';
            }
        };

        Service.prototype.legendDraw = function (schema, $self, legendType) {
            var self = this;
            var typeObj = {};
            for (var i in schema.types) {
                var type = schema.types[i];
                typeObj[type.k] = type.v;
            }
            return function (data, $container) {
                $self.legendFilter = {};
                var nodes = _.filter($self.tgc2.getAvailableData().nodes, function (n) {
                    return !n.hidden;
                });
                var classIds = _.keys(_.groupBy(nodes, 'classId'));
                // var $fabContainer = $('<div class="legend-fab-container"></div>');
                // $container.html($fabContainer);
                if (legendType == 'fab') {
                    var items = [];
                    for (var key in data) {
                        if (_.indexOf(classIds, key) >= 0) {
                            var html = '';
                            var text = typeObj[key];
                            if (text.length > 3) {
                                html = '<div title="' + text + '"><div>' + text.substring(0, 2) + '</div><div class="line-hidden">' + text.substring(2) + '</div></div>';
                            } else {
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
                                        $self.sdkUtils.legendClick(e, $self);
                                    },
                                    'mouseenter': function (e) {
                                        $self.sdkUtils.legendMouseEnter(e, $self);
                                    },
                                    'mouseleave': function (e) {
                                        $self.sdkUtils.legendMouseLeave(e, $self);
                                    },
                                    'dblclick': function (e) {
                                        $self.sdkUtils.legendDblClick(e, $self);
                                    }
                                }
                            });
                        }
                    }
                    var fab = new hieknjs.fab({
                        container: $container,
                        radius: 80,
                        angle: 90,
                        // startAngle: 270,
                        initStatus: $self.layoutStatus,
                        main: {
                            html: '图例',
                            style: {
                                background: $self.primary || '#00b38a',
                                color: '#fff'
                            },
                            events: {
                                'click': function () {
                                    $self.layoutStatus = !$self.layoutStatus;
                                }
                            }
                        },
                        items: items
                    });
                    // fab.run();
                } else {
                    $container.html('');
                    for (var key in data) {
                        if (_.indexOf(classIds, key) >= 0) {
                            var $obj = $('<div class="tgc2-legend-item tgc2-legend-item-' + key + '"></div>').data({
                                'key': key,
                                'value': data[key]
                            });
                            var html = $obj.html('<i style="background: ' + data[key] + '"></i><span title="' + typeObj[key] + '">' + typeObj[key] + '</span>');
                            $container.append(html);
                        }
                    }
                }
            }
        };

        Service.prototype.legendClick = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            $obj.toggleClass('off');
            var classId = $obj.data('key');
            $self.legendFilter[classId] = $obj.hasClass('off');
            $self.tgc2.netChart.updateFilters();
        };

        Service.prototype.legendDblClick = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            var others = $obj.removeClass('off').siblings();
            others.addClass('off');
            var classId = $obj.data('key');
            $self.legendFilter = {};
            $self.legendFilter[classId] = false;
            for (var i = 0; i < others.length; i++) {
                var id = $(others[i]).data('key');
                $self.legendFilter[id] = true;
            }
            $self.tgc2.netChart.updateFilters();
        };

        Service.prototype.legendMouseEnter = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            $obj.addClass('active').siblings().addClass('inactive');
            $self.nodeSettings.legendClass = $obj.data('key');
            $self.nodeSettings.legendColor = $obj.data('value');
            $self.tgc2.netChart.updateStyle();
            // var nodes = _.filter($self.tgc2.getAvailableData().nodes, function (n) {
            //     return !n.hidden && n.classId == $obj.data('key');
            // });
            // var ids = _.keys(_.groupBy(nodes, 'id'));
            // $self.tgc2.netChart.scrollIntoView(ids);
        };

        Service.prototype.legendMouseLeave = function (e, $self) {
            var self = this;
            var $obj = $(e.currentTarget);
            $obj.removeClass('active inactive').siblings().removeClass('active inactive');
            $self.nodeSettings.legendClass = null;
            $self.nodeSettings.legendColor = null;
            $self.tgc2.netChart.updateStyle();
        };

        Service.prototype.nodeFilter = function (nodeData, $self) {
            var self = this;
            return $self.tgc2.inStart(nodeData.id) || !$self.legendFilter[nodeData.classId];
        };

        Service.prototype.qiniuImg = function (img) {
            return img + '?_=' + parseInt(new Date().getTime() / 3600000);
        };

        Service.prototype.nodeStyleFunction = function (options) {
            var self = this;
            if (options.enableAutoUpdateStyle) {
                setInterval(function () {
                    if (self.centerNode) {
                        var radius = options.tgc2.netChart.getNodeDimensions(self.centerNode).radius;
                        if (self.nodeRadius != radius) {
                            var nodes = options.tgc2.netChart.nodes();
                            var ids = [];
                            for (var i in nodes) {
                                ids.push(nodes[i].id);
                            }
                            options.tgc2.netChart.updateStyle(ids);
                        }
                    }
                }, 30);
            }
            return function (node) {
                options.tgc2.nodeStyleFunction(node);
                node.imageCropping = 'fit';
                if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                    if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                        node.radius = node.radius * 1.5;
                    } else {
                        node.fillColor = options.tgc2.settings.netChart.reduceColor;
                        node.label = '';
                        node.lineColor = node.fillColor;
                        node.radius = node.radius * 0.5;
                    }
                } else {
                    if (options.tgc2.inStart(node.id)) {

                    } else {
                        node.fillColor = node.data.color || '#fff';
                        node.lineColor = '#00b38a';
                        if (node.hovered) {
                            node.fillColor = node.lineColor;
                            node.shadowBlur = 0;
                        }
                    }
                }
                if (options.nodeColors && options.nodeColors[node.data.classId]) {
                    node.lineWidth = 2;
                    if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                        if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                            node.fillColor = options.legendColor || options.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        } else {
                        }
                    } else {
                        if (options.tgc2.inStart(node.id)) {
                            node.fillColor = options.tgc2.settings.netChart.emphasesColor;
                            node.lineColor = node.fillColor;
                        } else {
                            node.lineColor = options.nodeColors[node.data.classId];
                            if (!options.imagePrefix && !options.images && !node.data.img) {
                                node.fillColor = node.lineColor;
                            }
                            if (node.hovered) {
                                node.fillColor = node.lineColor;
                            }
                        }
                    }
                }
                if (node.data.img) {
                    if (node.data.img.indexOf('http') != 0 && options.imagePrefix) {
                        node.image = self.qiniuImg(options.imagePrefix + node.data.img);
                    } else {
                        node.image = node.data.img;
                    }
                    if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                        if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                        } else {
                            node.image = '';
                        }
                    } else {
                        if (options.tgc2.inStart(node.id) || node.hovered) {
                        } else {
                            node.image = '';
                        }
                    }
                    // && !$.isEmptyObject(options.tgc2.nodeIds)
                    // if (!options.tgc2.inStart(node.id)
                    //     && !options.tgc2.nodeIds[node.id]
                    //     || (options.legendClass && options.legendClass !== node.data.classId) ) {
                    //     node.image = '';
                    // }
                    node.fillColor = '#fff';
                } else if (options.images && options.images[node.data.classId]) {
                    if (!$.isEmptyObject(options.tgc2.nodeIds) || options.legendClass) {
                        if (options.tgc2.nodeIds[node.id] || options.legendClass == node.data.classId) {
                            node.image = options.legendColor || options.images[node.data.classId].emphases;
                        } else {
                            node.image = '';
                        }
                    } else {
                        if (options.tgc2.inStart(node.id) || node.hovered) {
                            node.image = options.images[node.data.classId].emphases;
                        } else {
                            node.image = options.images[node.data.classId].normal;
                        }
                    }
                }
                var radius = options.tgc2.netChart.getNodeDimensions(node).radius;
                if (options.enableAutoUpdateStyle) {
                    if (radius < options.minRadius) {
                        node.image = '';
                        node.fillColor = node.lineColor;
                    }
                    if (options.tgc2.inStart(node.id)) {
                        self.nodeRadius = radius;
                        !self.centerNode && (self.centerNode = node);
                    }
                }
                if (options.textColors && options.textColors[node.data.classId]) {
                    if (typeof options.textColors[node.data.classId] == 'string') {
                        node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId];
                    } else {
                        if (options.tgc2.inStart(node.id) || options.tgc2.nodeIds[node.id]) {
                            node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId].emphases;
                        } else {
                            if (node.hovered) {
                                node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId].emphases;
                            } else {
                                node.labelStyle.textStyle.fillColor = options.textColors[node.data.classId].normal;
                            }
                        }
                    }
                }
                var len = node.label.length;
                if (node.display == 'roundtext') {
                    var label = node.label;
                    for (var i = 1; i < label.length - 1; i++) {
                        var regChinese = /^[\u4e00-\u9fa5]$/;
                        var regEnglish = /^[a-zA-Z]$/;
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
                        } else if (len > 5) {
                            node.label = node.label.substring(0, 4) + ' ' + node.label.substring(4);
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
            linkData.rInfo = $.extend(true, [], (linkData.nRInfo || []), (linkData.oRInfo || []));
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
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.id = options.tgc2.startInfo.id;
                param2.isRelationMerge = true;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                if (options.tgc2Page) {
                    var page = options.tgc2Page.page;
                    param2.pageNo = page.pageNo;
                    param2.pageSize = page.pageSize;
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'graph' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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

        Service.prototype.graphInit = function (options) {
            var self = this;
            var param = options.data || {};
            var param2 = options.data2 || {};
            param2.kgName = options.kgName;
            param2.isTiming = options.isTiming;
            hieknjs.kgLoader({
                url: options.baseUrl + 'graph/init' + '?' + $.param(param),
                type: 1,
                dataFilter: options.dataFilter || function (data) {
                    return data;
                },
                params: param2,
                success: function (response) {
                    if (response && response.rsData && response.rsData.length) {
                        var data = response.rsData[0];
                        options.success(data);
                    } else {
                        options.failed();
                    }
                },
                error: function () {
                    options.failed();
                },
                that: options.that
            });
        };

        Service.prototype.timing = function (options, schema) {
            var self = this;
            return function ($self, callback, failed) {
                var param = options.data || {};
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.id = options.tgc2.startInfo.id;
                param2.isRelationMerge = true;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                if (options.tgc2TimeChart) {
                    var settings = options.tgc2TimeChart.getSettings();
                    delete settings.type;
                    $.extend(true, param2, settings);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'graph/timing' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.ids = ids;
                param2.isShortest = true;
                param2.connectsCompute = true;
                param2.statsCompute = true;
                param2.statsConfig = options.statsConfig;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'relation' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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
                var param2 = options.data2 || {};
                param2.kgName = options.kgName;
                param2.start = options.tgc2.startInfo.start.id;
                param2.end = options.tgc2.startInfo.end.id;
                param2.isShortest = true;
                param2.connectsCompute = true;
                param2.statsCompute = true;
                param2.statsConfig = options.statsConfig;
                if (options.tgc2Filter) {
                    var filters = options.tgc2Filter.getFilterOptions();
                    $.extend(true, param2, filters);
                }
                hieknjs.kgLoader({
                    url: options.baseUrl + 'path' + '?' + $.param(param),
                    type: 1,
                    dataFilter: options.dataFilter || function (data) {
                        return data;
                    },
                    params: param2,
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

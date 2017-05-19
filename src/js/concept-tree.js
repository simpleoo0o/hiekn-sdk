(function (window, $) {
    'use strict';

    window.HieknConceptTreeService = gentService();

    function gentService() {
        var Service = function (options) {
            var self = this;
            self.clickTimeout = null;
            self.isFirst = true;
            self.lastSelectedNode = null;
            self.startAsync = false;
            self.treeDbClick = false;
            var defaultSettings = {
                container: null,
                data: null,
                baseUrl: null,
                kgName: null,
                getAsyncUrl: function () {
                    var param = self.options.data || {};
                    param.kgName = self.options.kgName;
                    if (self.options.readAll) {
                        param.id = self.getLastSelectedNodeId() || 0;
                    } else {
                        param.id = self.getLastSelectedNodeId() || self.options.initId;
                    }
                    param.onlySubTree = self.isFirst ? 0 : 1;
                    return self.options.baseUrl + 'concept?' + $.param(param);
                },
                idKey: 'id',
                initId: 0,
                nameKey: 'name',
                onNodeClick: $.noop,
                onNodeHover: $.noop,
                pIdKey: 'parentId',
                readAll: false
            };
            self.options = $.extend(true, {}, defaultSettings, options);
            self.zTreeSettings = null;
            self.zTree = null;
            self.init();
        };

        Service.prototype.init = function () {
            var self = this;
            self.$container = $(self.options.container);
            self.$container.addClass('ztree hiekn-concept-tree');
            self.zTreeSettings = self.updateZTreeSettings();
            self.zTree = $.fn.zTree.init(self.$container, self.zTreeSettings);
        };

        Service.prototype.addHoverDom = function (treeId, treeNode) {
            var self = this;
            var sObj = self.select('#' + treeNode.tId + '_span');
            if (self.select('#button-container_' + treeNode.tId).length > 0) {
                return;
            }
            var $container = $('<span class="button-container" id="button-container_' + treeNode.tId + '" ></span>');
            sObj.after($container);
            if (self.options.onNodeHover) {
                self.options.onNodeHover($container, treeNode);
            }
        };

        Service.prototype.beforeAsync = function (treeId, treeNode) {
            var self = this;
            if (treeNode) {
                self.startAsync = true;
                self.lastSelectedNode = treeNode;
            }
            return true;
        };

        Service.prototype.dataFilter = function (treeId, parentNode, childNodes) {
            var self = this;
            if (childNodes.code == 200) {
                if (!childNodes.data || !childNodes.data.rsData) {
                    return null;
                }
                childNodes = childNodes.data.rsData;
                var len = childNodes.length;
                var result = [];
                for (var i = 0; i < len; i++) {
                    !self.options.readAll && (childNodes[i].isParent = true);
                    if (!parentNode || childNodes[i][self.options.idKey] != parentNode[self.options.idKey]) {
                        result.push(childNodes[i]);
                    }
                }
                if (result.length == 0) {
                    parentNode.isParent = false;
                } else {
                    return result;
                }
            } else {
                toastr.error(childNodes.msg);
            }
            return null;
        };

        Service.prototype.expandNodes = function (nodeId) {
            var self = this;
            var node = self.zTree.getNodeByParam(self.options.idKey, nodeId);
            if (node) {
                self.zTree.expandNode(node, true, false, true, false);
                var parentNode = node.getParentNode();
                parentNode && self.expandNodes(parentNode[self.options.idKey]);
            }
        };

        Service.prototype.getLastSelectedNodeId = function () {
            var self = this;
            return self.lastSelectedNode ? self.lastSelectedNode[self.options.idKey] : null;
        };

        Service.prototype.getAsyncUrl = function () {
            var self = this;
            return typeof self.options.getAsyncUrl == 'string' ? self.options.getAsyncUrl : self.options.getAsyncUrl(self);
        };

        Service.prototype.onAsyncSuccess = function (event, treeId, treeNode) {
            var self = this;
            var node = treeNode;
            if (node) {
                self.options.onNodeClick(node);
            }
            if (node && node.children.length == 0) {
                node.isParent = false;
                self.zTree.updateNode(node);
                toastr.info('当前概念没有子概念');
            } else if (!node) {
                self.expandNodes(self.getLastSelectedNodeId() || self.options.initId);
                if (!self.getLastSelectedNodeId()) {
                    node = self.zTree.getNodeByParam(self.options.idKey, self.options.initId);
                    self.zTree.selectNode(node);
                    self.options.onNodeClick(node);
                }
            }
            var root = self.zTree.getNodeByParam(self.options.idKey, 0);
            self.addHoverDom(treeId, root);
            self.isFirst = false;
            self.startAsync = false;
        };

        Service.prototype.onClick = function (event, treeId, treeNode) {
            var self = this;
            self.clickTimeout && clearTimeout(self.clickTimeout);
            self.clickTimeout = setTimeout(function () {
                self.lastSelectedNode = treeNode;
                self.options.onNodeClick(treeNode);
                self.treeDbClick = false;
            }, 500);
        };

        Service.prototype.onNodeButtonClick = function ($button, treeNode) {
            var self = this;
            self.select('.tree-button-active').removeClass('tree-button-active');
            self.zTree.selectNode(treeNode);
            $button.addClass('tree-button-active');
            self.lastSelectedNode = treeNode;
        };

        Service.prototype.removeHoverDom = function (treeId, treeNode) {
            var self = this;
            if (treeNode.level > 0) {
                var $container = self.select('#button-container_' + treeNode.tId);
                $container.children().off('click');
                $container.remove();
            }
        };

        Service.prototype.select = function (selector) {
            var self = this;
            return $(self.options.container).find(selector);
        };

        Service.prototype.updateZTreeSettings = function () {
            var self = this;
            return {
                async: {
                    enable: true,
                    url: function () {
                        return self.getAsyncUrl();
                    },
                    dataFilter: function (treeId, parentNode, childNodes) {
                        return self.dataFilter(treeId, parentNode, childNodes);
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
                        self.addHoverDom(treeId, treeNode);
                    },
                    removeHoverDom: function (treeId, treeNode) {
                        self.removeHoverDom(treeId, treeNode);
                    }
                },
                callback: {
                    beforeAsync: function (treeId, treeNode) {
                        return self.beforeAsync(treeId, treeNode);
                    },
                    onAsyncSuccess: function (event, treeId, treeNode) {
                        return self.onAsyncSuccess(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        return self.onClick(event, treeId, treeNode);
                    },
                    onDblClick: function () {
                        self.treeDbClick = true;
                    }
                },
                data: {
                    simpleData: {
                        enable: true,
                        pIdKey: self.options.pIdKey,
                        idKey: self.options.idKey
                    },
                    key: {
                        name: self.options.nameKey
                    }
                }
            };
        };

        return Service;
    }
})(window, jQuery);
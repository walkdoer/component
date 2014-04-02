/**
 * 显示类
 * @extend Component{base/Component}
 */
define([
    './base/lang',
    './base/node',
    './base/template'
],
function(_, Node, template) {
    'use strict';
    var slice = Array.prototype.slice,
        emptyFunc = function() {},
        eventSpliter = ':',
        DisplayComponent;
    //添加事件
    var BEFORE_RENDER_FIRST_COMPONENT = 'beforerender_first_com',
        BEFORE_RENDER = 'beforerender',
        AFTER_RENDER = 'afterrender',
        BEFORE_TMPL = 'beforetmpl';
    //获取MatchesSelector
    var div = document.createElement("div"),
        matchesSelector = ["moz", "webkit", "ms", "o"].filter(function(prefix) {
            return prefix + "MatchesSelector" in div;
        })[0] + "MatchesSelector";

    var returnTrue = function() {
            return true;
        },
        returnFalse = function() {
            return false;
        },
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        };

    /**
     * appendPxIfNeed
     * 为数字添加单位 'px'
     * @params {Number/String} value 数量
     * @return {String} 添加了单位的数量
     */
    function appendPxIfNeed(value) {
        return value += typeof value === 'number' ? 'px' : '';
    }


    /**
     * setCss
     * @params {Dom} el Dom节点
     * @params {Object} properties css属性对象
     */
    function setCss(el, properties) {
        el.style.cssText += ';' + getStyleText(properties);
    }

    /**
     * getStyleText
     * 根据object获取css定义文本
     * @example
     *   输入： { height: 300}
     *   输出： height:300px;
     * @params {Object} properties css属性对象
     * @return {String} css定义文本
     */
    function getStyleText(properties) {
        var css = '';
        for (var key in properties) {
            css += key + ':' + appendPxIfNeed(properties[key]) + ';';
        }
        return css;
    }


    //用于兼容用户HTML字符串不完整 例如 <tr></tr>
    var table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        };


    /**
     * createElement
     * 根据HTML文本创建Dom节点，兼容一些错误处理，参考Zepto
     * @Params {String} html html字符串
     * @return {Array} dom数组
     */
    function createElement(html) {
        var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            fragmentRE = /^\s*<(\w+|!)[^>]*>/,
            container,
            name,
            dom;
        // 对于单个标签的进行优化 例如<div></div>
        if (singleTagRE.test(html)) {
            dom = [document.createElement(RegExp.$1)];
        }
        //提取出标签名称
        if (name === undefined) {
            name = fragmentRE.test(html) && RegExp.$1;
        }
        //替换非法的半闭合标签，合法的有br hr img 等，详见tagExpanderRE
        if (html.replace) {
            html = html.replace(tagExpanderRE, "<$1></$2>");
        }
        if (!(name in containers)) {
            name = '*';
        }
        container = containers[name];
        container.innerHTML = '' + html;
        dom = container.childNodes;
        return dom;
    }


    function compatible(ev, source) {
        if (source || !ev.isDefaultPrevented) {
            source || (source = ev);

            _.each(eventMethods, function(name, predicate) {
                var sourceMethod = source[name];
                ev[name] = function() {
                    this[predicate] = returnTrue;
                    return sourceMethod && sourceMethod.apply(source, arguments);
                };
                ev[predicate] = returnFalse;
            });

            if (source.defaultPrevented !== undefined ?
                    source.defaultPrevented :
                    'returnValue' in source ?
                            source.returnValue === false :
                            source.getPreventDefault &&
                            source.getPreventDefault()) {
                    ev.isDefaultPrevented = returnTrue;
            }
        }
        return ev;
    }


    function createProxy(ev) {
        var key, proxy = {
                originalEvent: ev
            };
        for (key in ev) {
            if (!ignoreProperties.test(key) && ev[key] !== undefined) {
                proxy[key] = ev[key];
            }
        }
        return compatible(proxy, ev);
    }


    DisplayComponent = Node.extend({
        type: 'display',
        /*------- Status --------*/
        tplDowloading: false, //下载模板中
        rendered: false, //已渲染
        /*-------- Flag ---------*/
        display: true, //是否显示组件
        getState: function() {
            return null;
        },
        init: function(option, callback) {
            var self = this;
            self._super(option);
            self.state = {};
            self._notFinishListener = {};
            self.initVar([
                'tpl',
                'tplContent',
                'components',
                'parentNode',
                'parentEl',
                '*env*',
                'getState',
                'userUpdate:update',
                'className',
                'display',
                'el',
                'selector'
            ]);
            self._data = option.data;
            self.uiEvents = _.extend(self.uiEvents || {}, option.uiEvents);
            self._cpConstructors = self.components;
            self._initParent(self.parentNode);
            //初始化参数
            self.state = self.getState();
            //初始化组件HTML元素
            self._listen(self.listeners);
            self._listen(option.listeners);
            var el = self.el;
            if (!el) {
                self._initHTMLElement(function(el) {
                    self.el = el;
                    el.setAttribute('id', self.id);
                    self.className && el.setAttribute('class', self.className);
                    self.initialized = true;
                    if (typeof callback === 'function') {
                        callback();
                    }
                    //添加新建的子组件到组件中
                    self.appendChild(self._buildComponents());
                    //监听组件原生listener
                    //用户创建的Listener
                    self._bindUIEvent();
                    //之前被通知过render，模板准备好之后进行渲染
                    if (self.needToRender) {
                        self.render();
                    }
                });
            }
        },
        /**
         * 初始化Parent
         */
        _initParent: function() {
            var parentNode = this.parentNode;
            //指定了parentNode 没有指定parentEl
            if (parentNode && !this.parentEl) {
                this.parentEl = parentNode.el;
            }
        },
        /**
         * 渲染组件
         */
        render: function() {
            var self = this,
                originOption = self.originOption,
                // fragment = document.createDocumentFragment(),
                firstChild = self.firstChild,
                component = firstChild;
            //先渲染组件的子组件
            while (component) {
                if (!component.selector) {
                    component.parentEl.appendChild(component.render().el);
                } else {
                    component._finishRender();
                }
                component = component.nextNode;
            }
            // if (firstChild) {
            //     firstChild.parentEl.appendChild(fragment);
            // }
            //然后再渲染组件本身，这样子可以尽量减少浏览器的重绘
            //如果有selector则表明该元素已经在页面上了，不需要再渲染
            if (!self.selector || self.rendered) {
                if (self.initialized) {
                    self.trigger(BEFORE_RENDER, self);
                    if (self.isContinueRender !== false) {
                        self.isContinueRender = true;
                        setCss(self.el, {
                            width: originOption.width,
                            height: originOption.height
                        });
                        if (self.display === false) {
                            setCss(self.el, {'display': 'none'});
                        }
                        self._finishRender();
                    }
                } else {
                    //异步情况下，用户通知渲染时尚未初始化结束
                    self.needToRender = true;
                }
            }
            return self;
        },
        /**
         * 获取组件的数据
         * @return {Object}
         */
        getData: function() {
            return _.extend({}, this._data || {}, {
                _state_: this.state,
                _id_: this.id
            });
        },
        needUpdate: function() {
            return this._isStateChange(this.getState());
        },
        _changeEl: function(el) {
            this.el = el;
        },
        _changeParentEl: function(el) {
            this.parentEl = el;
        },
        /**
         * _rebuildDomTree
         * 重新构建组件Dom树
         * @params {Boolean} isRoot 标志是否为根节点
         */
        _rebuildDomTree: function(isRoot) {
            var component = this.firstChild;
            this._changeEl(this._tempEl);
            //非根节点需要更新ParentNode
            if (!isRoot) {
                this._changeParentEl(this.parentNode.el);
            }
            while (component) {
                component._rebuildDomTree(false);
                component = component.nextNode;
            }
            delete this._tempEl;
        },
        /**
         * 更新操作
         * 更新自身，及通知子组件进行更新
         * @return {Object} this
         */
        update: function() {
            //首先自我更新，保存到临时_tempEl中
            this.updating = true;
            var newState = this.getState(),
                tempEl,
                stateChange;
            if ((stateChange = this._isStateChange(newState))) {
                this.state = newState;
                this._tempEl = tempEl = createElement(this.tmpl())[0];
                tempEl.setAttribute('id', this.id);
                if (this.className) {
                    tempEl.setAttribute('class', this.className);
                }
            }
            var component = this.firstChild;
            //通知子组件更新
            while (component) {
                component.update();
                component = component.nextNode;
            }
            //如果为根节点Root
            if (this.parentNode == null) {
                if (tempEl) {
                    this.parentEl.replaceChild(this._tempEl, this.el);
                }
                this._rebuildDomTree(true);
            } else {
                var pNode = this.parentNode,
                    newEl = pNode._tempEl,
                    pEl = pNode.el;
                if (newEl) {
                    newEl.appendChild(tempEl);
                } else {
                    pEl.replaceChild(tempEl, this.el);
                    this._changeEl(tempEl);
                    delete this._tempEl;
                }
            }
            this.updating = false;
            return this;
        },
        /**
         * 添加组件
         * @param  {Array/DisplayComponent} comArray
         */
        appendChild: function(comArray) {
            var self = this;
            if (!comArray) {
                return;
            }
            _.isArray(comArray) || (comArray = [comArray]);
            var onBeforeRender = function(evt, component) {
                //组件还没有渲染
                if (!self._allowToRender(component)) {
                    component.isContinueRender = false;
                } else {
                    if (!component.prevNode) {
                        self.trigger(BEFORE_RENDER_FIRST_COMPONENT, self);
                    }
                    // isContinueRender 表示执行下面的Render
                    component.isContinueRender = true;
                }
            };
            var index = comArray.length - 1,
                evt,
                identity,
                com;
            while (index >= 0) {
                com = comArray[index--];
                com.parentNode = this;
                com._initParent();
                com._bindUIEvent();
                //绑定待监听事件，类似于延迟监听，
                //因为listener中所要监听的组件在那个时刻还没有存在
                identity = [com.type, com.id].join(eventSpliter);
                evt = this._notFinishListener[identity];
                if (evt) {
                    this.listenTo(com, evt);
                    delete this._notFinishListener[identity];
                }
                com.on(BEFORE_RENDER, onBeforeRender);
                com = com.nextNode;
            }
            this._super(comArray);
        },
        /**
         * 渲染模板
         * @params {String} tplContent 模板内容
         * @params {Object} data 渲染数据
         */
        tmpl: function(tplContent, data) {
            var self = this,
                html;
            tplContent = tplContent || self.tplContent;
            data = data || self.getData();
            this.trigger(BEFORE_TMPL, data);
            if (tplContent) {
                html = template.tmpl(tplContent, data, self.helper);
            } else {
                console.warn(['Has no template content for',
                    '[', self.getType() || '[unknow type]', ']',
                    '[', self.id || '[unknow name]', ']',
                    'please check your option',
                    '模板的内容为空，请检查模板文件是否存在,或者模板加载失败'
                ].join(' '));
            }
            return html || '';
        },
        /**
         * 添加到父亲节点
         */
        appendToParent: function() {
            if (this.parentEl) {
                this.parentEl.appendChild(this.el);
            }
            return this;
        },
        /**
         * 是否有模板内容
         * @return {Boolean}
         */
        hasTplContent: function() {
            return !!this.tplContent;
        },
        /**
         * 获取组件在层级关系中的位置
         * @return {String} 生成结果index/recommend/app12
         */
        getAbsPath: function() {
            var pathArray = [],
                node = this,
                statusArray,
                statusStr,
                state;
            while (node) {
                statusStr = '';
                state = node.state;
                if (state) {
                    statusArray = [];
                    for (var key in state) {
                        statusArray.push(state[key]);
                    }
                    //产生出 '(status1[,status2[,status3]...])' 的字符串
                    statusStr = ['(', statusArray.join(','), ')'].join('');
                }
                pathArray.push(node.id + statusStr);
                node = node.parentNode;
            }
            pathArray.push('');
            return pathArray.reverse().join('/');
        },
        /**
         * 是否允许渲染
         * 只有上一个节点渲染结束之后，当前节点才可渲染,或者单前节点就是第一个节点
         * 这样的规则是为了尽可能的减少浏览器重绘
         * @return {Boolean}
         */
        _allowToRender: function() {
            return !this.prevNode || this.prevNode.rendered;
        },
        /**
         * 初始化模板
         * tpl的取值: #a-tpl-id 或者 'tpl.file.name'
         * @param  {Function} callback 回调
         */
        _initTemplate: function(callback) {
            var self = this,
                tpl = self.tpl,
                html;
            callback = callback || emptyFunc;
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl && tpl.indexOf('#') === 0) {
                html = document.getElementById(tpl).innerHTML;
                if (html) {
                    self.tplContent = html;
                }
            }
            callback( !! self.tplContent);
        },
        /**
         * 初始化HTML元素
         * @param  {Function} callback 回调函数
         */
        _initHTMLElement: function(callback) {
            var self = this,
                selector = self.selector,
                el;
            callback = callback || emptyFunc;
            //配置了选择器，直接使用选择器查询
            if (selector) {
                el = self.parentEl.querySelector(selector);
                callback(el);
            //没有则初始化模板
            } else {
                self._initTemplate(function(success) {
                    if (success) {
                        //如果模板初始化成功则渲染模板
                        el = createElement(self.tmpl())[0];
                    } else {
                        //没有初始化成功, 需要初始化一个页面的Element
                        el = document.createElement('section');
                    }
                    callback(el);
                });
            }
        },
        /**
         * 监听事件
         * @param  {Object} listeners 事件配置
         */
        _listen: function(listeners) {
            function onListen(event, self) {
                return function() {
                    listeners[event].apply(self, slice.call(arguments, 0));
                };
            }
            if (!listeners) {
                return;
            }
            var evtArr = '',
                com,
                len;
            for (var evt in listeners) {
                if (listeners.hasOwnProperty(evt)) {
                    evtArr = evt.split(eventSpliter);
                    len = evtArr.length;
                    //TYPE:ID:Event
                    if (3 === len) {
                        com = this.getChildById(evtArr[1]);
                        if (!com) {
                            //假如这个时候组件还没有创建，则先记录下来，
                            //组件创建的时候再监听，详见:appendChild
                            this._deferListener(evtArr[0], evtArr[1], evtArr[2],
                                onListen(evt, this));
                        } else {
                            this.listenTo(com, evtArr[2], onListen(evt, this));
                        }
                        //Event
                    } else if (1 === len) {
                        //只有Event的时候表示监听自身
                        this.on(evt, onListen(evt, this));
                    } else {
                        throw new Error('Com:Wrong Event Formate[Type:ID:Event]: ' +
                            evt);
                    }
                }
            }
        },
        /**
         * 结束渲染
         */
        _finishRender: function() {
            this.rendered = true; //标志已经渲染完毕
            this.trigger(AFTER_RENDER, this);
        },
        /**
         * 绑定UI事件
         */
        _bindUIEvent: function() {
            if (!this.parentEl || this._uiEventBinded) {
                return this;
            }
            var evts = this.uiEvents,
                elementSelector,
                eventType,
                callback,
                evtConf;
            if (!evts) {
                return;
            }
            for (var evt in evts) {
                evtConf = evt.split(' ');
                if (evtConf.length > 1) {
                    elementSelector = evtConf.slice(1).join(' ');
                } else {
                    //如果没有配置托管的对象，则使用对象本身Id
                    //例如 {
                    //    'click': function() {}
                    //}
                    //等价于{
                    //    'click #elementId', function() {}
                    //}
                    elementSelector = '#' + this.id;
                }
                eventType = evtConf[0];
                callback = evts[evt];
                this._uiDelegate(eventType, elementSelector, callback);
            }
            this._uiEventBinded = true;
        },
        /**
         * _uiDelegate
         * 托管UI事件绑定
         * @params {String} eventName 事件名称
         * @params {String} selector 选择器
         * @params {Function} fn 事件回调函数
         */
        _uiDelegate: function(eventName, selector, fn) {
            var self = this;
            var delegator = function(ev) {
                var target = ev.target,
                    evProxy;
                //定位被托管节点
                while (target && target !== this &&
                        !target[matchesSelector](selector)) {
                    target = target.parentNode;
                }
                ev.target = target;
                if (target && target !== this) {
                    evProxy = _.extend(createProxy(ev), {currentTarget: target});
                    return fn.apply(target,
                            [evProxy, self].concat(slice.call(arguments, 1)));
                }

            };
            this.parentEl.addEventListener(eventName, delegator, false);
        },
        /**
         * _delegate
         * 托管事件绑定
         * @params {String} type 节点类型
         * @params {String} id   节点id
         * @params {String} eventType 事件类型
         * @params {Function} fn 事件回调函数
         */
        _deferListener: function(type, id, eventType, fn) {
            var eventObj,
                typeAndId = [type, id].join(eventSpliter);
            if (!(eventObj = this._notFinishListener[typeAndId])) {
                eventObj = this._notFinishListener[typeAndId] = {};
            }
            eventObj[eventType] = fn;
        },
        /**
         * 组件状态是否有改变
         * @param  {Object}  newParams 组件的新状态
         * @return {Boolean}
         */
        _isStateChange: function(state) {
            return !_.isEqual(state, this.state);
        },
        /**
         * 创建子组件
         */
        _buildComponents: function() {
            var self = this,
                comConstru = self._cpConstructors, //组件构造函数列表
                components = [],
                Component,
                cItm,
                cp = null;
            //构造子组件（sub Component）
            if (_.isArray(comConstru)) {
                var len = comConstru ? comConstru.length : 0;
                for (var i = 0; i < len; i++) {
                    cItm = comConstru[i];
                    //构造函数
                    if (typeof cItm === 'function') {
                        Component = cItm;
                        //构造函数以及组件详细配置
                    } else if (typeof cItm === 'object' && cItm._constructor_) {
                        Component = cItm._constructor_;
                        //已经创建好的组件实例
                    } else if (cItm instanceof Node) {
                        components.push(cItm);
                        continue;
                        //检查到错误，提示使用者
                    } else {
                        throw new Error('Component\'s component config is not right');
                    }
                    //创建组件
                    cp = new Component(_.extend({
                        parentNode: self,
                        env: this.env
                    }, cItm /*cItm为组件的配置*/ ));
                    components.push(cp);
                }
                return components;
            } else {
                //对于配置: components 'component/componentName'
                //表示所有的组件都是由该类型组件构成
                //todo 由于这里的应用场景有限，所以为了代码大小考虑，
                //为了保证功能尽可能简单，暂时不做这部分开发（考虑传入的
                //是构造函数和组件文件地址的情况）
                return null;
            }
            return null;
        }
    });
    //扩展方法 'show', 'hide', 'toggle', 'appendTo', 'append', 'empty'
    /*['show', 'hide', 'toggle', 'empty'].forEach(function(method) {
        DisplayComponent.prototype[method] = function() {
            var args = slice.call(arguments);
            this.$el[method].apply(this.$el, args);
            return this;
        };
    });*/
    return DisplayComponent;
});

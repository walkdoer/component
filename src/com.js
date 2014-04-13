/**
 * 显示类
 * @extend Component{base/Component}
 */
define([
    './base/lang',
    './base/util',
    './base/node',
    './base/template'
],
function(_, util, Node, template) {
    'use strict';
    var slice = Array.prototype.slice,
        enhancer = null,
        DisplayComponent;
    //添加事件
    var BEFORE_RENDER_FIRST_COMPONENT = 'beforerender_first_com',
        BEFORE_RENDER = 'beforerender',
        AFTER_RENDER = 'afterrender',
        BEFORE_TMPL = 'beforetmpl',
        STATE_CHANGE = 'statechange';
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


    /**
     * 创建事件代理
     * 由于事件机制中的Event变量是只读的，但是托管（delegate）的时候需要修改
     * currentTarget,所以只能创建事件代理，这个代理中又所有的event属性.
     */
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


    /**
     * 显示节点类
     *
     * 可以运行于浏览器中，可以根据需要来自定义自己的组件。通过组合和继承来创建出
     * 需要的web应用
     *
     * @extend Node
     */
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
        /**
         * 构造函数
         * @params {object} option 组件配置项
         * @example
         * {
         *    id: 'test-id'
         *    className: 'test-class',
         *    getState: function () {
         *        return {
         *            state: 'this is a state';
         *        }
         *    }
         * }
         *
         */
        init: function(option) {
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
                '*_data:data*',
                'getState',
                'userUpdate:update',
                'className',
                'display',
                'el',
                'selector'
            ]);
            self.uiEvents = _.extend(self.uiEvents || {}, option.uiEvents);
            self._cpConstructors = self.components;
            self._initParent(self.parentNode);
            //初始化参数
            self.state = self.getState();
            //初始化组件HTML元素
            var el = self.el;
            if (!el) {
                self._initTemplate();
                self.el = self._createHTMLElement(self.parentEl);
                enhancer && (self.$el = enhancer(self.el));
                //用户创建的Listener
                self._bindUIEvent();
                //添加新建的子组件到组件中
                self.appendChild(self._buildComponents());
            }
        },
        _setIdAndClass: function (el) {
            el.setAttribute('id', this.id);
            this.className && el.setAttribute('class', this.className);
        },
        /**
         * 初始化Parent
         * @private
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
                originOption = self.originOption;
            //trigger event beforerender
            self.trigger(BEFORE_RENDER, self);
            //先渲染组件的子组件,然后再渲染组件本身
            //这样子可以尽量减少浏览器的重绘
            self.firstChild && self._renderChildComponent();
            //有selector则表明该元素已经在页面上了，不需要再渲染
            //如果在before render的处理函数中将isContinueRender置为true
            //则停止后续执行,后续考虑使用AOP改造此方式
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
            return self;
        },
        /*
         * 渲染子组件
         * @private
         */
        _renderChildComponent: function () {
            var self = this,
                firstChild = self.firstChild,
                component = firstChild,
                fragment = document.createDocumentFragment(),
                parentElArr = [],
                fragmentArr = [],
                comParentEl,
                fragmentTmp,
                index;
            while (component) {
                component.render();
                comParentEl = component.parentEl;
                if (self.el !== comParentEl) {
                    //取出对应的DocumentFragment
                    index = parentElArr.indexOf(comParentEl);
                    fragmentTmp = index >= 0 ?
                        fragmentArr[index] :
                        document.createDocumentFragment();
                    fragmentTmp.appendChild(component.el);
                    if (index < 0) {
                        parentElArr.push(component.parentEl);
                        fragmentArr.push(fragmentTmp);
                    }
                } else {
                    fragment.appendChild(component.el);
                }
                component = component.nextNode;
            }
            this.el.appendChild(fragment);
            //将指定了特定parentEl的添加到对应的parent中
            for (var i = 0, k = parentElArr.length; i < k; i++) {
                parentElArr[i].appendChild(fragmentArr[i]);
            }
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
        /**
         * 查询组件是否需要更新
         * 如果组件的状态发生改变，则需要更新
         * @return {Boolean} true:需要 ,false:不需要
         */
        needUpdate: function() {
            return this._isStateChange(this.getState());
        },
        /**
         * 改变节点Dom元素
         * @private
         */
        _changeEl: function(el) {
            this.el = el;
        },
        /**
         * 改变节点父节点Dom元素
         * @private
         */
        _changeParentEl: function(el) {
            this.parentEl = el;
        },
        /**
         * 更新操作
         * 更新自身，及通知子组件进行更新
         * @return {Object} this
         */
        update: function() {
            //首先自我更新，保存到临时_tempEl中
            //this.updating = true;
            var newState = this.getState(),
                isRoot = !this.parentNode,
                tempEl,
                stateChange;
            if ((stateChange = this._isStateChange(newState))) {
                this.state = newState;
                this.trigger(STATE_CHANGE, newState);
            }
            var pEl = isRoot ? this.parentEl :
                this.parentNode._tempEl;
            tempEl = this._tempEl = this._createHTMLElement(pEl);
            var component = this.firstChild;
            //通知子组件更新
            while (component) {
                component.update();
                //节点有更新，在新Dom节点上添加子组件el 或者 tempEl
                //如果有了selector，表示组件的dom已经在父节点中了，不需要添加
                //详细参考selector的定义
                if(!component.selector) {
                    tempEl.appendChild(component._tempEl || component.el);
                }
                component._changeParentEl(tempEl);
                component._unbindUIEvent()._bindUIEvent();
                //更新子节点节点Dom
                component._changeEl(component._tempEl);
                delete component._tempEl;
                component = component.nextNode;
            }
            if (isRoot) {
                this.parentEl.replaceChild(tempEl, this.el);
            }
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
                    //如果渲染的是第一个组件，则触发 BEFORE_RENDER_FIRST_COMPONENT
                    //的消息
                    if (!component.prevNode) {
                        self.trigger(BEFORE_RENDER_FIRST_COMPONENT, self);
                    }
                    // isContinueRender 表示执行下面的Render
                    component.isContinueRender = true;
                }
            };
            var index = comArray.length - 1,
                com;
            while (index >= 0) {
                com = comArray[index--];
                com.parentNode = this;
                com._initParent();
                com._bindUIEvent();
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
                tplCompile = self._tplCompile,
                html;
            tplContent = tplContent || self.tplContent;
            data = data || self.getData();
            this.trigger(BEFORE_TMPL, data);
            if (tplContent) {
                if (!tplCompile) {
                    this._tplCompile = tplCompile = template.tmpl(tplContent);
                }
                html = tplCompile(data, self.helper);
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
         * @private
         * @param  {Function} callback 回调
         */
        _initTemplate: function() {
            var self = this,
                tpl = self.tpl,
                html;
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl && tpl.indexOf('#') === 0) {
                html = document.getElementById(tpl.slice(1)).innerHTML;
                if (html) {
                    //去除头尾换行
                    self.tplContent = html.replace(/^\n|\n$/g, '');
                }
            }
        },
        /**
         * 初始化HTML元素
         * @private
         * @params {DOM} 父亲Dom节点
         */
        _createHTMLElement: function(parentEl) {
            var self = this,
                selector = self.selector,
                el;
            //配置了选择器，直接使用选择器查询
            if (selector) {
                el = parentEl.querySelector(selector);
            //没有则初始化模板
            } else {
                //如果模板初始化成功则渲染模板
                if (self.tplContent) {
                    el = createElement(self.tmpl())[0];
                } else {
                    //没有初始化成功, 需要初始化一个页面的Element
                    el = document.createElement('section');
                }
            }
            self._setIdAndClass(el);
            return el;
        },
        /**
         * 结束渲染
         * @private
         */
        _finishRender: function() {
            this.rendered = true; //标志已经渲染完毕
            this.trigger(AFTER_RENDER, this);
        },
        /**
         * 绑定UI事件
         * @private
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
                if (typeof callback === 'string') {
                    callback = this.originOption[callback];
                }
                this._uiDelegate(eventType, elementSelector, callback);
            }
            this._uiEventBinded = true;
        },
        _unbindUIEvent: function () {
            this._uiEventBinded = false;
            return this;
        },
        /**
         * _uiDelegate
         * 托管UI事件绑定
         * @private
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
         * 组件状态是否有改变
         * @private
         * @param  {Object}  newParams 组件的新状态
         * @return {Boolean}
         */
        _isStateChange: function(state) {
            return !_.isEqual(state, this.state);
        },
        /**
         * 创建子组件
         * @private
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
                        throw util.error(null, 'option.components is not right');
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
        },
    });
    DisplayComponent.config = function (cfg) {
        enhancer = cfg.enhancer;
        if (enhancer) {
            //扩展方法 'show', 'hide', 'toggle', 'appendTo', 'append', 'empty'
            ['show', 'hide', 'toggle', 'empty'].forEach(function(method) {
                DisplayComponent.prototype[method] = function() {
                    var args = slice.call(arguments);
                    enhancer.fn[method].apply(this.$el, args);
                    return this;
                };
            });
        }
    };
    return DisplayComponent;
});

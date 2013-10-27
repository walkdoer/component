#Application文档
##**配置**
###id
***{非必要}*** ID编号，如果没有配置会自动生成一个唯一的ID
###className
***{非必要}*** 类名
###el
***{非必要}*** [DOM]组件的容器  
`一旦指定了容器，那么定义组件的属性 tplContent 和 tpl 两个配置项都会失效，因为用户指定的el优先级最高`
###parent
***{必要}*** 父亲元素
###components
***{非不要}*** 配置组件的子组件，具体参考使用例子
##api

##Method

####isPageCreated(pageName)
查询页面是否已经创建
*参数*

+ pageName [String] 页面名词，具有唯一性

*返回值*  

[Boolean] true/false

####changePage(pageName)
切换页面
*参数*

+ pageName [String] 页面名词，具有唯一性

*返回值*  

[Boolean] true/false


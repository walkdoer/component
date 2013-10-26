#Component文档
##**配置**
###id
***{非必要}*** ID编号，如果没有配置会自动生成一个唯一的ID
###className
***{非必要}*** 类名
###parent
***{必要}*** 父亲元素
###components
***{非不要}*** 配置组件的子组件，具体参考使用例子
##api
####nextNode
***[属性]*** 下一个节点
####prevNode
***[属性]*** 上一个节点
####childNodes
***[属性]*** 孩子节点
####parentNode
***[属性]*** 父亲节点

##Method

####getCmp(id)
获取
*参数*

+ id 组件ID

*返回值*  

[Component] id对于的组件

####getCmp()
*参数*

+ 无

*返回值*  

[String] 组件名词


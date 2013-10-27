#Display文档
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
####show(id)
显示

*返回值*  

[Display] this

####hide(id)
隐藏
*返回值*  

[Display] this
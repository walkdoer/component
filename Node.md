#Node文档
##**CONFIG**

####id 编号
***{非必要}*** 没有id配置，则使用自动生成的id

## API
####nextNode
***[property]*** 下一个节点

####prevNode
***[property]*** 上一个节点

####childNodes
***[property]*** 孩子节点

####parentNode

***[property]*** 孩子节点


##MEYHOD

#####init(option)

构造函数

***[参数]*** 

+ option [Object] 配置项
*返回值*  

无

####getChildById(id)

通过ID获取孩子节点

***[参数]*** 

+ id [String] 节点Id

*返回值*  

[Node] 节点


####appendChild(node)

删除节点

***[参数]*** 

+ node [Node] 待添加节点

*返回值*  

[Node] this


####removeChild(node)
***[参数]*** 

+ node [Node] 待删除节点

*返回值*  

[Node] this

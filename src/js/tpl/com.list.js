define(function (require, exports, module) {
    module.exports="<section id=\"main\">\n    <p class=\"meta\">一共有<%=data.totalCount%>个游记</p>\n    <ul class=\"list\">\n    <%\n    var list = data.data,\n        li;\n    for (var i = 0; i < list.length; i++) {\n        li = list[i];\n    %>\n    <li><p><%=li.title%></p><p><%=li.content%></p></li>\n    <% } %>\n    </ul>\n</section>";
});
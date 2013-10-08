define(function (require, exports, module) {
    module.exports="<ul>\n    <%\n    var list = data,\n        itm;\n    for (var i = 0; i < list.length; i++) {\n        itm = list[i];\n    %>\n        <li class=\"diary-rec\" data-url=\"<%=itm.url%>\"><%=itm.title%></li>\n    <% } %>\n</ul>";
});
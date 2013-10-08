<ul>
    <%
    var list = data,
        itm;
    for (var i = 0; i < list.length; i++) {
        itm = list[i];
    %>
        <li class="diary-rec" data-url="<%=itm.url%>"><%=itm.title%></li>
    <% } %>
</ul>
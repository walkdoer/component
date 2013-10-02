<section id="main">
    <p class="meta">一共有<%=data.totalCount%>个游记</p>
    <ul class="list">
    <%
    var list = data.data,
        li;
    for (var i = 0; i < list.length; i++) {
        li = list[i];
    %>
    <li><p><%=li.title%></p><p><%=li.content%></p></li>
    <% } %>
    </ul>
</section>
<section id="main" class="sec-list">
    <p class="meta">一共有<%=data.totalCount%>个游记</p>
    <ol class="list">
    <%
    var list = data.data,
        li;
    for (var i = 0; i < list.length; i++) {
        li = list[i];
    %>
    <li><p class="title"><%=li.title%></p><p class="content"><%=li.content%></p></li>
    <% } %>
    </ol>
</section>
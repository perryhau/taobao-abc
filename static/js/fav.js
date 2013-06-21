$(function() {
    /*
    load_typehead({
        user: $("#input-nick")
    })
    $(".close").click();

    $("#input-nick").val("{{nick}}");
    */

    //获取买家cookie
    if (getCookie("nick") !== null) {
        $("#input-nick").val(getCookie("nick"));
    }

    $("#btn-dig").click(function() {
    })

    $("#btn-query").click(function() {
        updateFavTable();
    })


    var tableFavBrand = new IBBDtable($("#table-brand"));
    
    function updateFavTable(){
        var askTableData = {
            nick: $("#input-nick").val(),
            page: 1,
            count: 50
        };

        tableFavBrand.reset();

        $.get("/ajax/fav/list", 
            askTableData,
            function(result){
                tableFavBrand.dataTable =  result.rows;
                tableFavBrand.drawTable();
                //创建分页对象
                var pPager = new IBBDpager($('#pager'), {               //IBBDpager
                    pageCount:result.maxPage,
                    pageSize:7,
                    allBtn: true,
                    clickPn:function(pn){                               //生成分页按钮click事件
                        askTableData.page = pn;
                        tableFavBrand.updateTable('/ajax/fav/list',askTableData);   //ajax更新表格数据
                    }
                });
             }, "json"
        );
    }

    //页面初始化自动触发查询
    if ($("#input-nick").val() !== "") {
        updateFavTable();
    }
});

//获取cookie函数
function getCookie(name) {
    var arr,
        reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");

    if(arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else { 
        return null;
    }
}
$(function() {
    /* datagrid */
    var StaticDataSource = function(options) {
        this._formatter = options.formatter;
        this._columns = options.columns;
        this._delay = options.delay || 0;
        this._data = options.data;
    };
    StaticDataSource.prototype = {
        columns: function() {
            return this._columns;
        },
        data: function(options, callback) {
            var self = this;
            options.ajax = true;
            if (options.ajax) {
                $.ajax({
                    url: options.url,
                    data: {
                        nick: $("#input-nick").val(),
                        page: options.pageIndex + 1,
                        count: options.pageSize
                    },
                    dataType: "json",
                    global: false,
                    type: "get",
                    success: function(result) {
                        self._data = result.rows;
                        options.count = result.totalCount;
                        return callBack(options, callback, self._data, self._formatter);
                    }
                });
                options.ajax = false;
            } else {
                return callBack(options, callback, self._data, self._formatter);
            }
        }
    };
    var tableFavBrand = new IBBDtable($("#table-brand"));
    var nick = {
        cur: getCookie("nick")
    }

    //获取买家cookie
    if (getCookie("nick") !== null) {
        $("#input-nick").val(getCookie("nick"));
    }

    //页面初始化自动触发查询
    if ($("#input-nick").val() !== "") {
        updateTradeGrid();
        updateFavTable();
    }

    $("#btn-dig").click(function() {});

    $("#btn-query").click(function() {
        nick.cur = $("#input-nick").val();
        console.log(nick)
        switch($(".nav-tabs .active a").attr("href")){
            case "#credits":
                updateTradeGrid();
                break;
            case "#favourite":
                updateFavTable();
                break;
            default:
                break;
        }
    });

    $(".nav-tabs").find("a").click(function(){
        var self = $(this);
        if(self.parent().hasClass("active")){
            return;
        }else{
            console.log(nick);
            switch(self.attr("href")){
                case "#credits":
                    updateTradeGrid();
                    break;
                case "#favourite":
                    updateFavTable();
                    break;
                default:
                    break;
            }
        }
    })


    /* 更新偏好表格 */

    function updateFavTable() {
        if(nick.cur !== nick.fav){
            var askTableData = {
                nick: $("#input-nick").val(),
                page: 1,
                count: 50
            };
            tableFavBrand.reset();
            $.get("/ajax/fav/list",
                askTableData, function(result) {
                tableFavBrand.dataTable = result.rows;
                tableFavBrand.drawTable();
                //创建分页对象
                var pPager = new IBBDpager($('#pager'), { //IBBDpager
                    pageCount: result.maxPage,
                    pageSize: 7,
                    allBtn: true,
                    clickPn: function(pn) { //生成分页按钮click事件
                        askTableData.page = pn;
                        tableFavBrand.updateTable('/ajax/fav/list', askTableData); //ajax更新表格数据
                    }
                });
            }, "json");
        }
        nick.fav = $("#input-nick").val();
    }

    function callBack(options, callback, datasource, formatter) {
        var data = $.extend(true, [], datasource);

        if (options.search) {
            data = _.filter(data, function(item) {
                for (var prop in item) {
                    if (!item.hasOwnProperty(prop)) continue;
                    if (~item[prop].toString().toLowerCase().indexOf(options.search.toLowerCase())) return true;
                }
                return false;
            });
        }

        var count = options.count;

        // PAGING
        var startIndex = options.pageIndex * options.pageSize;
        var endIndex = startIndex + options.pageSize;
        var end = (endIndex > count) ? count : endIndex;
        var pages = Math.ceil(count / options.pageSize);
        var page = options.pageIndex + 1;
        var start = startIndex + 1;

        /*data = data.slice(startIndex, endIndex);*/

        if (formatter) formatter(data);

        callback({
            data: data,
            start: start,
            end: end,
            count: count,
            pages: pages,
            page: page
        });
    }
    /* 更新交易表格 */
    function updateTradeGrid() {
        if(nick.credits !== nick.cur){
            var dataSourceSale = new StaticDataSource({
                columns: [{
                        property: 'buy_time',
                        label: '购买时间',
                        sortable: false
                    }, {
                        property: 'title',
                        label: '宝贝名称',
                        sortable: false
                    }, {
                        property: 'rate_level',
                        label: '评价',
                        sortable: false
                    }, {
                        property: 'rate_content',
                        label: '评论内容',
                        sortable: false
                    }, {
                        property: 'seller',
                        label: '卖家',
                        sortable: false
                    }
                ]
            });

            $('#table-buy-list').datagrid({
                dataSource: dataSourceSale,
                stretchHeight: true,
                dataOptions: {
                    pageIndex: 0,
                    pageSize: 10,
                    url: "/ajax/buylist/list"
                },
                loadingHTML: '<div class="progress progress-striped active" style="width:50%;margin:auto;"><div class="bar" style="width:100%;"></div></div>',
                itemsText: '宝贝',
                itemText: '宝贝'
            }).datagrid("reload");
        }
        nick.credits = $("#input-nick").val();
    }

    /*获取cookie函数*/

    function getCookie(name) {
        var arr,
            reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }
});
$(function() {
    /*
    load_typehead({
        user: $("#input-nick")
    })
    $(".close").click();
    $("#input-nick").val("{{nick}}");
    var tableCredit = new IBBDtable($("#table-credit"));
    var chartCredit = new IBBDchart($("#chart-credit"), {
        type: 'pie'
    })
    var chartFavShop = new IBBDchart($("#chart-shops"), {
        type: 'bar'
    })
    var chartFavItem = new IBBDchart($("#chart-items"), {
        type: 'bar'
    })
    */


    // $("#input-nick").keyup(function(e) {
    //     if (e.which == 13) {
    //         $("#btn-query").click();
    //     }
    // })

    /*
    $("#btn-dig").click(function() {
        var postData = {
            nick: $("#input-nick").val(),
            page: 12,
            amount: 50
        }
        $.post("/ajax/buylist/list", {
        }, function(result) {
            console.log(result);
            if(result.code==1){
                bootbox.alert("更新成功，请稍后刷新查看", function() {
                    window.location.href = window.location.href;
                });
            } else {
                bootbox.alert('此人** 有事烧纸..');
            }
        }, 'json');
    })

    $("#btn-query").click(function() {
        $.post('/ajax/query', {
            nick: $("#input-nick").val()
        }, function(result) {
            if (result.code == 1) {
                bootbox.alert("等待刷新，请稍后");
                setTimeout(function() {
                    window.location.href = window.location.href;
                }, 1500);
            } else {
                bootbox.alert('此人** 有事烧纸..');
            }
        }, 'json');
    })

*/
    //获取买家cookie
    if (getCookie("nick") !== null) {
        $("#input-nick").val(getCookie("nick"));
    }

    $("#btn-query").click(function() {
        $("#page").val("1");

        var query = {
            nick: $("#input-nick").val(),
            page: $("#page").val() || 1,
            amount: $("#page-size").text() || 0
        };

        loadRatelist();
        //demo(query);
        /*
        $.post("/ajax/buylist/list", query, function(result){
            loadRatelist(result);
        }, "json");
*/
    });

    // $("#btn-query").click();

    $(".dropdown-menu li a").each(function() {
        var self = $(this);
        self.click(function() {
            var query = {
                nick: $("#input-nick").val(),
                page: $("#page").val() || 1,
                amount: self.text()
            }
            //demo(query);
        });
    });

    $("#page").change(function() {
        var self = $(this);
        self.click(function() {
            var query = {
                nick: $("#input-nick").val(),
                page: self.val() || 1,
                amount: $("#page-size").text() || 0
            }
            //demo(query);
        });
    });


    /* 加载页面数据 */

    function loadPage() {

    }
    /*
    var StaticDataSource = function(options) {
        this._formatter = options.formatter;
        this._columns = options.columns;
        this._delay = options.delay || 0;
        this._data = options.data;
        this._total = options.total;
    };

    StaticDataSource.prototype = {
        columns: function() {
            return this._columns;
        },
        data: function(options, callback) {
            var self = this;

            setTimeout(function() {
                var data = $.extend(true, [], self._data);

                var count = self._total;

                // PAGING
                var startIndex = options.pageIndex * options.pageSize;
                var endIndex = startIndex + options.pageSize;
                var end = (endIndex > count) ? count : endIndex;
                var pages = Math.ceil(count / options.pageSize);
                var page = options.pageIndex + 1;
                var start = startIndex + 1;

                data = data.slice(startIndex, endIndex);
                // SEARCHING
                if (options.search) {
                    data = _.filter(data, function (item) {
                        for (var prop in item) {
                            if (!item.hasOwnProperty(prop)) continue;
                            if (~item[prop].toString().toLowerCase().indexOf(options.search.toLowerCase())) return true;
                        }
                        return false;
                    });
                }

                if (self._formatter) self._formatter(data);

                callback({
                    data: data,
                    start: start,
                    end: end,
                    count: count,
                    pages: pages,
                    page: page
                });

            }, this._delay)
        }
    };
*/

    var StaticDataSource = function (options) {
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
                        page: options.pageIndex,
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

    function loadRatelist() {
        var dataSourceSale = new StaticDataSource({
            columns: [{
                    property: 'buy_time',
                    label: '购买时间',
                    sortable: true
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
                    sortable: true
                }
            ]
        });

        $('#table-buy-list').datagrid({
            dataSource: dataSourceSale,
            stretchHeight: true,
            dataOptions: {
                pageIndex: 1,
                pageSize: 10,
                url: "/ajax/buylist/list"
            },
            loadingHTML: '<div class="progress progress-striped active" style="width:50%;margin:auto;"><div class="bar" style="width:100%;"></div></div>',
            itemsText: '宝贝',
            itemText: '宝贝'
        });
        //$("#table-buy-list").find("thead tr:eq(1) th").attr("colspan", "");
    }

    //页面初始化自动触发查询
    if ($("#input-nick").val() !== "") {
        $("#page").val("1");

        var query = {
            nick: $("#input-nick").val(),
            page: $("#page").val() || 1,
            amount: $("#page-size").text() || 0
        };

        loadRatelist();
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
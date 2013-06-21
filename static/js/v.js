$(function () {

    setup($("#value-chart"));

    loadItems($("#value-chart"), null);
});

function onTemplateRender(event, data) {
    switch (data.renderingMode) {
        case primitives.common.RenderingMode.Create:
            /* Initialize widgets here */
            break;
        case primitives.common.RenderingMode.Update:
            /* Update widgets here */
            break;
    }

    var itemConfig = data.context;

    if (data.templateName == "roofTemplate") {
       data.element.find("[name=title]").text(itemConfig.title);
       data.element.find("[name=count]").text(itemConfig.count);
    } else if (data.templateName == "itemTemplate") {
        data.element.find("[name=title]").text(itemConfig.title);
        data.element.find("[name=count]").text(itemConfig.count);

        itemConfig.description = "";

        if (itemConfig.where.length == 3) {

            if (itemConfig.where[2][0] == 0) {
                itemConfig.description = "消费<" + itemConfig.where[2][1] +
                                         "元";
            } else if (itemConfig.where[2][1] >= 2000) {
                itemConfig.description = "消费>" + itemConfig.where[2][0] +
                                         "元";
            } else {
                itemConfig.description = "消费在" + itemConfig.where[2][0] +
                                         "元与" + itemConfig.where[2][1] +
                                         "元之间";
            }
        } else if (itemConfig.where.length == 2) {

            if (itemConfig.where[1][0] == 0) {
                itemConfig.description = "最近一次购买时间<" +
                                         itemConfig.where[1][1] + "天";
            } else if (itemConfig.where[1][1] >= 180) {
                itemConfig.description = "最近一次购买时间>" +
                                         itemConfig.where[1][0] + "天";
            } else {
                itemConfig.description = "最近一次购买时间在" +
                                         itemConfig.where[1][0] + "天与" +
                                         itemConfig.where[1][1] + "天之间";
            }
        } else if (itemConfig.where.length == 1) {

            if (itemConfig.where[0][0] == 0) {
                itemConfig.description = "购买" + itemConfig.where[0][1] +
                                         "次及以下";
            } else if (itemConfig.where[0][1] >= 10) {
                itemConfig.description = "购买" + itemConfig.where[0][0] +
                                         "次及以上";
            } else {
                itemConfig.description = "购买次数在" + itemConfig.where[0][0] +
                                         "与" + itemConfig.where[0][1] +
                                         "之间";
            }
        }
        data.element.find("[name=description]").text(itemConfig.description);
    }
}

function getRoofTemplate() {
    var result = new primitives.orgdiagram.TemplateConfig();

    result.name              = "roofTemplate";
    result.itemSize          = new primitives.common.Size(200, 70);
    result.minimizedItemSize = new primitives.common.Size(3, 3);
    result.highlightPadding  = new primitives.common.Thickness(2, 2, 2, 2);

    //根节点模板样式
    var itemTemplate = $(
      '<div class="bp-item bp-corner-all bt-item-frame">'
        + '<div name="titleBackground" class="bp-item bp-corner-all bp-title-frame bp-roof-title-frame">'
            + '<div name="title" class="bp-item bp-title bp-roof-title">'
            + '</div>'
        + '</div>'
        + '<div name="count" class="bp-item bp-roof-num"></div>'
    + '</div>'
    ).css({
        width: result.itemSize.width + "px",
        height: result.itemSize.height + "px"
    }).addClass("bp-item bp-corner-all bt-item-frame");
    result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

    return result;
}

function getItemTemplate() {
    var result = new primitives.orgdiagram.TemplateConfig();

    result.name              = "itemTemplate";
    result.itemSize          = new primitives.common.Size(90, 90);
    result.minimizedItemSize = new primitives.common.Size(3, 3);
    result.highlightPadding  = new primitives.common.Thickness(2, 2, 2, 2);

    //节点模板样式
    var itemTemplate = $(
      '<div class="bp-item bp-corner-all bt-item-frame">'
        + '<div name="titleBackground" class="bp-item bp-corner-all bp-title-frame bp-item-title-frame">'
            + '<div name="title" class="bp-item bp-title bp-item-title">'
            + '</div>'
        + '</div>'
        + '<div name="count" class="bp-item bp-item-num"></div>'
        + '<div name="description" class="bp-item bp-item-desc"></div>'
    + '</div>'
    ).css({
        width: result.itemSize.width + "px",
        height: result.itemSize.height + "px"
    }).addClass("bp-item bp-corner-all bt-item-frame");

    result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

    return result;
}

function onCursorChanged(e, data) {
    var condition = "",
        client    = null;

    if (Object.prototype.toString.apply(data.context.where) === "[object Array]") {
        condition = array2String(data.context.where);
    } else {
        condition = "[]";
    }

    $.ajax({
        url: "/ajax/valuation/customer",
        type: "GET",
        dataType: "json",
        async: false,
        data: {
            where: condition
        },
        success: function (result) {
            client = result.rows;
        }
    });

    var $tbody = $(".client-list table").find("tbody").empty();

    if (Object.prototype.toString.apply(client) === "[object Array]" &&
            client.length > 0) {
        var $trHtml = "";

        for (var i = 0; i < client.length; i++) {
            $trHtml += "<tr>" +
                       "<td>" + (i + 1) + "</td>" +
                       "<td><a href=\"" + client[i].link + "\"" + 
                       "target=\"_blank\">" + client[i].name +
                       "</a></td>" + "<td><a href=\"#\">查看交易行为</a></td></tr>";
        }
    } else {
        var $trHtml = "<tr><td colspan=3 style=\"text-align:center;" +
                      "font-weight:bold\">" + "亲，暂时没有相关的客户喔！</td></tr>";
    }

    $tbody.append($trHtml).find("tr").each(function () {
        var nickname = $(this).find("td:eq(1) a").text();

        $(this).find("td:eq(2) a").on("click", function () {
            setCookie("nick", nickname, 0);
            window.location.href = "/customer";
        });
    });

    var btnBack = '<span id="btn-back" class="pull-right"><a class="btn btn-info btn-small" href="javascript:void(0);">返回</a></span>',
        description = data.context.description ? data.context.description : "";

    $("#list-content .content-title").empty()
                                     .append('<h3>' + data.context.title + '列表</h3>')
                                     .append('<span class="content-tips">' + description + '</span>' )
                                     .append(btnBack);
    $("#btn-back").on("click", function () {
        $("#value-chart").orgDiagram("option", {cursorItem : null});
        $("#value-chart").orgDiagram("update", primitives.orgdiagram.UpdateMode.Refresh);
        $(".main-content .inner").animate({marginLeft : "0"}, 500);
    });
    $(".main-content .inner").animate({marginLeft : "-100%"}, 500);
}

function setup(selector) {
    orgDiagram = selector.orgDiagram(getOrgDiagramConfig());
}

function update(selector, updateMode) {
    selector.orgDiagram("option", GetOrgDiagramConfig());
    selector.orgDiagram("update", updateMode);
}

function getOrgDiagramConfig() {
    return {
        hasSelectorCheckbox: primitives.common.Enabled.False,
        onCursorChanged: onCursorChanged,
        onItemRender: onTemplateRender,
        templates: [getRoofTemplate(), getItemTemplate()]
    }
}

function loadItems(selector, condition) {
    var requestType = "";

    if (condition === null) {
        requestType= "GET";
    } else {
        requestType= "POST";
    }

    $.ajax({
        url: "/ajax/valuation/classify",
        type: requestType,
        dataType: "json",
        data: {
            condition: condition
        },
        success: function (result) {
            var rootItem = getTreeItem(result);

            rootItem.templateName = "roofTemplate";

            selector.orgDiagram("option", {
                rootItem: rootItem
            });
            selector.orgDiagram("update");

            createSlider(result);
        }
    });
}

function getTreeItem(sourceItem) {
    var result = new primitives.orgdiagram.ItemConfig();

    result.title        = sourceItem.title;
    result.count        = sourceItem.count;
    result.templateName = "itemTemplate";

    if (Object.prototype.toString.apply(sourceItem.where) === "[object Array]") {
        result.where = sourceItem.where;   
    }
    
    if (sourceItem.nodes != null) {
        for (var index = 0; index < sourceItem.nodes.length; index++) {
            result.items.push(getTreeItem(sourceItem.nodes[index]));
        }
    }
    return result;
}

function array2String(array) {
    if (Object.prototype.toString.apply(array) === "[object Array]") {
        var arrayString = "[";

        for (var i in array) {

            if (Object.prototype.toString.apply(array[i]) === "[object Array]") {
                arrayString += array2String(array[i]);
            } else {
                arrayString += array[i].toString();
            }

            if (i < array.length - 1) {
                arrayString += ",";
            }
        }
        arrayString += "]";

        return arrayString;   
    }
}

function slideValue(target, num) {
    target.parent().find("p b").empty().text(num);
}

function createSlider(dataTree) {
    var initValue = [
                        dataTree.nodes[0].where[0][1],
                        dataTree.nodes[0].nodes[0].where[1][1],
                        dataTree.nodes[1].nodes[0].where[1][1],
                        dataTree.nodes[0].nodes[0].nodes[0].where[2][1],
                        dataTree.nodes[0].nodes[1].nodes[0].where[2][1],
                        dataTree.nodes[1].nodes[0].nodes[0].where[2][1],
                        dataTree.nodes[1].nodes[1].nodes[0].where[2][1]

    ];

    $("#buy-times-slider").slider({
        range: "min",
        value: initValue[0],
        min: 1,
        max: 10,
        step: 1,
        change: function (event, ui) {
            slideValue($(this), ui.value);
        },
        slide: function (event, ui) {
            slideValue($(this), ui.value);
        }
    });
    $("#buy-times").empty()
                   .text(initValue[0]);

    $("#new-latest-time-slider").slider({
        range: "min",
        value: initValue[1],
        min: 10,
        max: 180,
        step:10,
        change: function (event, ui) {
            slideValue($(this), ui.value);
        },
        slide: function (event, ui) {
            slideValue($(this), ui.value);
        }
    });
    $("#new-latest-time").empty()
                         .text(initValue[1]);

    $("#old-latest-time-slider").slider({
        range: "min",
        value: initValue[2],
        min: 10,
        max: 180,
        step:10,
        change: function (event, ui) {
            slideValue($(this), ui.value);
        },
        slide: function (event, ui) {
            slideValue($(this), ui.value);
        }
    });
    $("#old-latest-time").empty()
                         .text(initValue[2]);

    $("#new-active-consumption-slider").slider({
        range: "min",
        value: initValue[3],
        min: 100,
        max: 2000,
        step: 100,
        change: function (event, ui) {
            slideValue($(this), ui.value);
        },
        slide: function (event, ui) {
            slideValue($(this), ui.value);
        }
    });
    $("#new-active-consumption").empty()
                                .text(initValue[3]);

    $("#new-sleep-consumption-slider").slider({
        range: "min",
        value: initValue[4],
        min: 100,
        max: 2000,
        step: 100,
        change: function (event, ui) {
            slideValue($(this), ui.value);
        },
        slide: function (event, ui) {
            slideValue($(this), ui.value);
        }
    });
    $("#new-sleep-consumption").empty()
                               .text(initValue[4]);

    $("#old-active-consumption-slider").slider({
        range: "min",
        value: initValue[5],
        min: 100,
        max: 2000,
        step: 100,
        change: function (event, ui) {
            slideValue($(this), ui.value);
        },
        slide: function (event, ui) {
            slideValue($(this), ui.value);
        }
    });
    $("#old-active-consumption").empty()
                                .text(initValue[5]);

    $("#old-sleep-consumption-slider").slider({
        range: "min",
        value: initValue[6],
        min: 100,
        max: 2000,
        step: 100,
        change: function (event, ui) {
            slideValue($(this), ui.value);
        },
        slide: function (event, ui) {
            slideValue($(this), ui.value);
        }
    });
    $("#old-sleep-consumption").empty()
                               .text(initValue[6]);

    $("#update-condition").on("click", function () {
        var condition = {
            "全部顾客": $("#buy-times-slider").slider("value"),
            "新顾客": $("#new-latest-time-slider").slider("value"),
            "老顾客": $("#old-latest-time-slider").slider("value"),
            "活跃新顾客": $("#new-active-consumption-slider").slider("value"),
            "睡眠顾客": $("#new-sleep-consumption-slider").slider("value"),
            "活跃老顾客": $("#old-active-consumption-slider").slider("value"),
            "睡眠回头客": $("#old-sleep-consumption-slider").slider("value")
        };

        $("#update-form").modal('hide');

        loadItems($("#value-chart"), JSON.stringify(condition));

    });

    $("#reset-condition").on("click", function () {
        $("#buy-times-slider").slider("value", initValue[0]);
        $("#new-latest-time-slider").slider("value", initValue[1]);
        $("#old-latest-time-slider").slider("value", initValue[2]);
        $("#new-active-consumption-slider").slider("value", initValue[3]);
        $("#new-sleep-consumption-slider").slider("value", initValue[4]);
        $("#old-active-consumption-slider").slider("value", initValue[5]);
        $("#old-sleep-consumption-slider").slider("value", initValue[6]);
    });
}

function setCookie(name,value, day) {
    day = day || 0;  
    var expires = "";  
    if (day != 0 ) {  
        var date = new Date();  
        date.setTime(date.getTime()+(day * 24 * 60 * 60 * 1000));  
        expires = "; expires=" + date.toGMTString();  
    }  
    document.cookie = name + "=" + escape(value) + expires;
}
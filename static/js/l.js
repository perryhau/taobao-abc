$(document).ready(function() {

	/*加载页面*/
	loadPage();

	/*添加关键词*/
	$("#btn-add-keyword").click(function() {
		var addKeyword = {
			keyword: $("#input-keyword").val()
		};
		var t;
		if (/(^\u0020+$)|(^$)/.test(addKeyword.keyword)) {
			$("#input-keyword").val("");
			showAlert("输入不能为空");
		} else {
			$("#btn-add-keyword").addClass("disabled");
			$.post("/ajax/loyalty/keyword/add", addKeyword, function(result) {
				if (result.status === "ok") {
					var keywordSpan = $("<button>", {
						"class": "alert alert-info keyword-item"
					});
					keywordSpan.append($("<a class='close'>x</a>")).append($("<a class='keyword' href='#loyalty-tables'>" + addKeyword.keyword + "</a>")).appendTo($("#keyword-list"));
					$("#input-keyword").val("");
					detailTable();
				} else {
					showAlert(result.msg);
				}
				$("#btn-add-keyword").removeClass("disabled");
			}, "json");
		}

	});

	$("#input-keyword").keyup(function(e) {
		if (e.which == 13) {
			$("#btn-add-keyword").click();
		}
	})


	/* 提示信息 delay不为true时提示框会自动关闭 */

	function showAlert(msg, delay) {
		if ($("#alert").length > 0) {
			$("#alert").remove();
			clearTimeout(t);
		}
		var alert = $("<div>", {
			"id": "alert"
		});
		var alertInfo = $("<div>", {
			"class": "alert alert-error"
		});
		alertInfo.append($("<a class='close'>x</a>")).append($("<p class='alertMsg'>" + msg + "</p>")).appendTo(alert);
		alert.hide().prependTo($("body")).slideDown("normal");
		$("#alert .close").click(function() {
			$("#alert").slideUp("normal", function() {
				$(this).remove();
			});
		});
		if (delay !== true) {
			t = setTimeout(function() {
				$("#alert .close").click();
			}, 2500);
		}
	}

	/* 页面数据加载 */

	function loadPage() {
		$.get("/ajax/loyalty/overview", function(result) {
			if(result.status === "ok"){
				updateOverview(result.stst);
				updateKeywords(result.keywords);
			}else{
				showAlert(result.msg)
			}
		}, "json");
	}

	function updateOverview(data) {
		$("#loyal").html("");
		$("#disloyal").html("");
		$("#lose").html("");
		$("#loyal").html(formatTransfer(data.loyalty));
		$("#disloyal").html(formatTransfer(data.disloyal));
		$("#lose").html(formatTransfer(data.lose));
	}

	function updateKeywords(data) {
		$("#keyword-list").html("");
		for (var i = 0, len = data.length; i < len; i++) {
			var keywordSpan = $("<button>", {
				"class": "alert alert-info keyword-item"
			});
			keywordSpan.append($("<a class='close'>x</a>")).append($("<a class='keyword' href='#loyalty-tables'>" + data[i] + "</a>")).appendTo($("#keyword-list"));
		}

		$("#keyword-list .close").click(function() {
			var self = $(this);
			var rmKeyword = {
				keyword: $(this).siblings("a").text()
			};
			$.post("/ajax/loyalty/keyword/del", rmKeyword, function(result) {
				if (result.status === "ok") {
					self.parent("button").remove();
				} else {
					return;
				}
			}, "json");
		});
		detailTable();
	}



	function detailTable() {
		$(".keyword").click(function() {
			var query = {
				keyword: $(this).text()
			}
			$.get("/ajax/loyalty/keyword", query, function(result) {
				updateDetailTable(result)
			}, "json")
			$("body,html").animate({
				scrollTop: $("#loyalty-tables").offset().top
			}, 300);
		});
	}

	function updateDetailTable(data) {
		$(".detail-table").remove();
		var detailDiv = $("<div>", {
			"class": "detail-table",
		});
		var keyword = $("<h5>", {
			"class": "breadcrumb"
		});
		var detailTable = $("<table>", {
			"class": "table table-bordered"
		});
		var thead = $("<tr><th>我的顾客</th><th>竞品成交数量</th><th>成交数量</th><th>本店数量占比</th><th>竞品成交金额</th><th>本店成交金额</th><th>本店金额占比</th></tr>");
		keyword.text(data.keyword);
		detailTable.append(thead);
		for (var j in data["rows"]) {
			var tr = $("<tr>");
			var trVal = data["rows"][j];
			for (var k in trVal) {
				var td = $("<td>");
				if ($.isPlainObject(trVal[k])) {
					var tdHtml = $("<a href='" + trVal[k]["link"] + "'>" + trVal[k]["name"] + "</a>");
					td.append(tdHtml);
				} else {
					td.text(formatTransfer(trVal[k]));
				}
				tr.append(td);
			}
			detailTable.append(tr);
		}
		detailDiv.append(keyword).append(detailTable);
		$("#loyalty-tables").append(detailDiv);
	}

	function formatTransfer(sNum) {
		if (sNum === null || sNum === undefined) return " ";
		if (sNum > 1) {
			try {
				sNum = sNum.toString();
			} catch (e) {
				sNum = '0';
			}
			var sResult = sNum.replace(/(\d)(\d{3})$/, "$1,$2");
			var sResult = sResult.replace(/(\d)(\d{3})\./, "$1,$2.");
			for (var jj = 0; jj < Math.round(sNum.length / 3); jj++) {
				sResult = sResult.replace(/(\d)(\d{3}),/, "$1,$2,");
			}
		} else if (sNum < 1) {
			var sResult = (sNum * 100).toFixed(1) + "%";
		} else {
			return " ";
		}
		return sResult;
	}
})
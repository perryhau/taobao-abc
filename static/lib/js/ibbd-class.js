/* ===================================================
 *	IBBD CLASS
 * ===================================================
 *    IBBDchart
 *    IBBDmap
 *    IBBDtable
 *	  IBBDpager
 *    IBBDDatepicker
 *    IBBDtips
 *    IBBDtips2
 *    IBBDselectbox
 * ===================================================
 *	by IBBD dev-team
 * =================================================== */

/* IBBDchart PUBLIC CLASS DEFINITION
     * ==================================
    	作用:IBBD 画图类
    	参数:
    		container = $('div')	//图容器，jquery对象
			options = {
				type: 'line'    //图类型: line, bar, column, pie
				chartTitle : '' //图标题
			}
	 * ================================== */
var IBBDchart = function(container, options) {
	this.init(container, options);
}

/* 初始化 
 * ================================== */
IBBDchart.prototype.init = function(container, options) {
	this.container = container;
	this.options = options || {};
	this.chartSeries = new Array();
	this.Highcharts = {}; //返回Highchart对象，方便使用Highcharts原生方法
	switch (this.options.type) {
		case 'line':
			this.setOptions = $.extend(true, {}, this.getBaseOptions(), this.getLineOptions());
			break;
		case 'bar':
			this.setOptions = $.extend(true, {}, this.getBaseOptions(), this.getBarOptions());
			break;
		case 'column':
			this.setOptions = $.extend(true, {}, this.getBaseOptions(), this.getColumnOptions());
		default:
			this.setOptions = this.getBaseOptions(); //默认获取baseOptions
			this.setOptions.chart.type = this.options.type;
			//this.setOptions = $.extend(true,{}, this.getBaseOptions(), {chart:{type:this.options.type}});
			break;
	}
	Highcharts.setOptions({ //Highcharts全局设置
		lang: {
			loading: '载入中……',
			months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
			resetZoom: '缩放比例复位',
			resetZoomTitle: '缩放比例复位至1:1',
			weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
		}
	});
}

/* 设置图数据 
	 * ==================================
		参数
			chartData = {	//也可为数组 [{chartData1}, {chartData2}]
				data:  
				name:  //横坐标名
			},		
			action = 'update'（默认为更新）//可选值为：add（增加）, del（删除)
										   //删除时，可只存入chartData={name:}
		返回
			treu(设置成功)|false
	 * ================================== */
IBBDchart.prototype.setChartData = function(chartData, action) {
	var self = this

	this.container.empty();
	action = (action) ? action : 'update'; //默认为更新
	if (!$.isArray(chartData)) {
		chartData = [chartData];
	}
	if (action == 'update') {
		this.chartSeries = chartData;
		return true;
	}
	if (action == 'add') {
		this.chartSeries = this.chartSeries.concat(chartData); //将需要显示的数据添加到总的数据数组中
		return true;
	}
	if (action == 'del') { //支持删除多个
		for (var i in chartData) {
			for (var j in this.chartSeries) {
				if (this.chartSeries[j]['name'] == chartData[i].name) {
					this.chartSeries.splice(j, 1);
					break;
				}
			}
		}
		return true;
	}
	return false;
}

/* 画图
	 * ==================================
	 	参数
			options = { 	//Highcharts画图参数
				chartTitle: //例如,图标题
			}
	 * ================================== */
IBBDchart.prototype.drawChart = function(options) {
	if (this.container.length < 1) return false;
	var options_sum = this.options;
	$.extend(options_sum, options);

	this.setOptions.series = this.chartSeries;
	var self = this,
		setOptions = options_sum ? $.extend(true, {}, self.setOptions, options_sum) : self.setOptions //传入参数并覆盖

		//使用Highcharts类画图
		this.Highcharts = new Highcharts.Chart(setOptions);
}

/* 设置横坐标时间
	 * ==================================
	 	当图类型为 'line' 折线图且横坐标为 'datetime' 类型（默认）时，才需要设置时间
	 	参数
			start = '2012/8/14'  //折线图起始点时间
			end = '2012/8/16'   //折线图起终点时间
			tickInterval = 1 * 24 * 3600 * 1000 //横坐标间隔
	 * ================================== */
IBBDchart.prototype.setPeriod = function(start, end, tickInterval) {
	var self = this;
	this.options.dateStart = start;
	this.options.dateEnd = end;
	tickInterval = (tickInterval) ? tickInterval : 1 * 24 * 3600 * 1000;
	self.setOptions = $.extend(true, {}, self.setOptions, {
		tooltip: {
			xDateFormat: (self.options.dateStart !== self.options.dateEnd) ? '%Y/%m/%d' : '%H:%M',
			shared: true
		},
		plotOptions: {
			series: {
				pointStart: Date.parse(self.options.dateStart) + 8 * 3600000,
				pointInterval: self.options.dateStart !== self.options.dateEnd ? 86400000 : 3600000
			}
		},
		xAxis: {
			type: 'datetime',
			tickInterval: tickInterval,
			// tickWidth: 0,
			dateTimeLabelFormats: {
				day: '%b/%e',
				week: '%b/%e',
				month: '%b/%e'
			}
		}
	});
}

/* 清空图数据
 * ================================== */
IBBDchart.prototype.empty = function() {
	this.chartSeries.length = 0;
}

/* 获取 baseOptions
 * ================================== */
IBBDchart.prototype.getBaseOptions = function() {
	return {
		chart: {
			renderTo: this.container.attr('id')
			//width:this.options.width
		},
		credits: {
			enabled: false
		},
		exporting: {
			enabled: false
		},
		title: {
			text: this.options.chartTitle || ''
		},
		yAxis: {
			min: 0,
			title: null
		}
	}
}

/* 获取 lineOptions
 * ================================== */
IBBDchart.prototype.getLineOptions = function() {
	return {
		chart: {
			type: 'line'
		}
	}
}

/* 获取 barOptions
 * ================================== */
IBBDchart.prototype.getBarOptions = function() {
	return {
		chart: {
			type: 'bar'
		}
	}
}

/* 获取 columnOptions
 * ================================== */
IBBDchart.prototype.getColumnOptions = function() {
	return {
		chart: {
			type: 'column'
		}
	}
}

/* ========IBBDchart Class End==============
 * Update: 2012/8/16 TODO!
 * by weishai
 * ========================================================== */



/* IBBDmap PUBLIC CLASS DEFINITION
     * ================================== 
		作用:IBBD 地图类
    	参数:
    		container = $('div')	//图容器，jquery对象
       ================================== */
var IBBDmap = function(container) {
	this.init(container);
}

/* 初始化
 * ================================== */
IBBDmap.prototype.init = function(container) {
	this.container = container;
	this.dataMap = new Array(); //地图数据(可扩展为数据模型类)
	this.colorValues = {};
	this.setScaleColors = new Array();
}

/* 设置地图省份颜色
	 * ==================================
	 	地图数值越高的省份颜色越深
		参数
			lightColor = '#999' //浅色
			deepColor = '#333'  //深色
	   ================================== */
IBBDmap.prototype.setColors = function(lightColor, deepColor) {
	this.setScaleColors.length = 0;
	for (var index in this.dataMap) {
		this.colorValues[this.dataMap[index]['region']] = this.dataMap[index]['count'];
	}
	this.setScaleColors.push(lightColor, deepColor);
}

/* 画地图
	 * ================================== 
	 	参数
	 		//vectorMap参数,可选
	 		options = {}
	   ================================== */
IBBDmap.prototype.drawMap = function(options) {
	var setOptions = { //默认参数
		map: 'china_cn',
		values: this.colorValues,
		scaleColors: this.setScaleColors,
		color: '#AA8839',
		backgroundColor: '#FFF',
		hoverOpacity: 0.7,
		hoverColor: false
	}
	if (options) {
		setOptions = $.extend({}, setOptions, options); //传入参数并覆盖
	}
	this.container.empty();
	this.container.vectorMap(setOptions); //使用vetormap画图
}

IBBDmap.prototype.reset = function() {
	this.container.empty();
}

/* ========IBBDmap Class End==============
 * Update: 2012/8/17 TODO!
 * by weishai
 * ========================================================== */



/* IBBDtable PUBLIC CLASS DEFINITION
     * ==================================
		作用:IBBD 表格类
		参数:
			container = $('div') //表格容器，jquery对象
			options = {
				rankOptions:{}   //排序选项,参数参考插件tablesorter,可选
			}
       ================================== */
var IBBDtable = function(container, options) {
	this.init(container, options);
}

/* 初始化
 * ================================== */
IBBDtable.prototype.init = function(container, options) {
	this.container = container;
	this.options = options || {};
	this.dataTable = new Array(); //表格数据(可扩展为数据模型类)
	if (this.options.rankOptions) {
		// 初始化可排序表格,使用插件tablesorter
		this.initRank = true;
		this.container.addClass('tablesorter');
		// @author 	Cooper
		this.options.rankOptions.textExtraction = function(node) {
			var node_obj = $(node).html();
			if (node_obj.indexOf("￥") > -1) {
				node_obj = node_obj.replace('￥', '').replace(',', '');
			}
			return node_obj;
		}
	}
}

/* 设置表格列
 * header 列明数组
 * ================================== */
IBBDtable.prototype.setHeader = function(header) {
	// clear current thead
	this.container.find("thead").html("");
	var thead = $("<thead/>");
	$.each(header, function(i, val) {
		$("<th/>", {
			html: val
		}).appendTo(thead);
	});
	this.container.find("thead").html(thead.html());
}

/* 设置表格数据
 * ================================== */
IBBDtable.prototype.setTableData = function(tableData) {
	this.dataTable = tableData;
}

/* 重设表格
 * ================================== */
IBBDtable.prototype.reset = function() {
	this.container.find('tbody').empty();
}

/* 画表格
     * ==================================
		参数:
			customItem = {  //自定义单元格模板,可选
				img: function(data){
					return '<img src="'+data['img']+'" />';
				}
			}
			详细用法见前端文档
       ================================== */
IBBDtable.prototype.drawTable = function(customItem) {
	if ($.isEmptyObject(this.dataTable)) {
		return false;
	}
	var itemType = { //6种单元格基本类型
		icon: function() {
			return '<i class="icon-search"></i>';
		},
		img: function(tdData) {
			return '<img src="' + tdData['img'] + '">';
		},
		link: function(tdData) {
			return '<a href="' + tdData['link'] + '" target="_blank">' + tdData['name'] + '</a>';
		},
		progress: function(tdData) {
			return '<div class="progress progress-striped"><div class="bar" style="width: ' + tdData['progress'] + '%;"></div></div>';
		},
		checkbox: function() {
			return '<input class="manageCheckBox" type="checkbox">';
		},
		price: function(tdData) {
			return '￥' + fToScientificNotation(tdData['price']);
		},
		num: function(tdData) {
			return fToScientificNotation(tdData['num']);
		},
		percent: function(tdData) {
			return (tdData['persent'] * 100).toFixed(2) + '%';
		}
	}
	if (customItem) {
		this.options.customItem = customItem;
		$.extend(itemType, customItem);
	};
	this.container.children('tbody').empty();
	for (var i in this.dataTable) {
		this.container.children('tbody').append('<tr></tr>');
		var trItem = this.dataTable[i]
		for (var key in trItem) {
			var $tdHTML = $('<td></td>'),
				tdText = ''
			if ($.isPlainObject(trItem[key])) {
				for (var name in itemType) {
					if (trItem[key][name] != undefined) {
						tdText = itemType[name](trItem[key], $tdHTML);
						break;
					}
				}
			} else {
				tdText = trItem[key];
			}
			$tdHTML.append(tdText).appendTo(this.container.children('tbody').children('tr').last());
		}
	}
	if (this.initRank) {
		this.container.tablesorter(this.options.rankOptions);
		this.initRank = false;
	}
	if (this.options.rankOptions) {
		this.container.trigger('update');
	}
}

/* 更新表格
     * ==================================
     	参数
     		ajaxUrl = '' //ajax请求地址
     		askData = {} //请求参数
       ================================== */
IBBDtable.prototype.updateTable = function(ajaxUrl, askData, callback) {
	var self = this;
	self.reset();
	$.get(ajaxUrl, askData, function(result) {
		var tableData = result.data || result.rows; //兼容rows数据
		self.setTableData(tableData);
		self.drawTable(self.options.customItem);
		if(callback){
			callback();
		}
	}, 'json');
}

/* ========IBBDtable Class End==============
 * Update: 2012/8/17 TODO!
 * by weishai
 * ========================================================== */



/* IBBDpager PUBLIC CLASS DEFINITION
     * ==================================
		作用:IBBD分页类
		参数
			container = $('div') //分页容器,jquery对象
			options = {
				pageCount:, //总页数,必填
				pageSize:9, //页面(按钮)数量,默认9
				curPage:1,  //初始化时当前页,默认1
			}
       ================================== */
var IBBDpager = function(container, options) {
	this.init(container, options);
}

/* 初始化
 * ================================== */
IBBDpager.prototype.init = function(container, options) {
	this.container = container;
	var defaultOptions = {
		pageSize: 9,
		curPage: 1,
		allBtn: false
	}
	this.options = $.extend({}, defaultOptions, options);
	this.curPage = this.options.curPage;
	this.pageSize = this.options.pageSize;
	this.pageCount = this.options.pageCount || 0;
	if (this.pageCount >= 10) { //总页数大于10页，自动显示首尾页按钮
		this.options.allBtn = true;
	}
	this.update();
}

/* 构造分页HTML
 * ================================== */
IBBDpager.prototype.render = function() {
	if (this.pageCount < 1) return;
	var self = this,
		startPoint = 1,
		endPoint = this.pageSize,
		offset = Math.floor((endPoint - 1) / 2),
		$pagerHTML = $('<ul><li class="prev"><a href="#">上一页</a></li></ul>')
		if (this.curPage > offset) {
			startPoint = this.curPage - offset;
			endPoint = this.curPage + (endPoint - offset - 1);
		}
	if (endPoint > this.pageCount) {
		startPoint = this.pageCount - offset * 2;
		endPoint = this.pageCount;
	}
	if (startPoint < 1) {
		startPoint = 1;
	}
	for (var pn = startPoint; pn <= endPoint; pn++) {
		var $curBtn = $('<li class="pn"><a href="#">' + (pn) + '</a></li>');
		pn == this.curPage ? $curBtn.addClass('active').click(false) : (function(thisBtn, thisPn) {
			thisBtn.click(function() {
				self.curPage = thisPn;
				self.options.clickPn(thisPn);
				self.update();
				return false;
			});
		})($curBtn, pn);
		$curBtn.appendTo($pagerHTML);
	}
	$pagerHTML.append('<li class="next"><a href="#">下一页</a></li>');

	if (this.options.allBtn) {
		$pagerHTML.prepend('<li class="first-page"><a href="#">首页</a></li>').append('<li class="last-page"><a href="#">尾页</a></li>')
	}

	if (this.curPage <= 1) {
		$pagerHTML.children('.prev,.first-page').addClass('disabled').click(false);
	} else {
		$pagerHTML.children('.prev').click(function() {
			$pagerHTML.children('.active').prev().click();
			return false;
		})
			.parent().children('.first-page').click(function() {
			self.curPage = 1;
			self.options.clickPn(1);
			self.update();
			return false;
		})
	}

	if (this.curPage >= this.pageCount) {
		$pagerHTML.children('.next,.last-page').addClass('disabled').click(false);
	} else {
		$pagerHTML.children('.next').click(function() {
			$pagerHTML.children('.active').next().click();
			return false;
		})
			.parent().children('.last-page').click(function() {
			self.curPage = self.pageCount;
			self.options.clickPn(self.pageCount);
			self.update();
			return false;
		})
	}
	this.container.empty();
	this.container.append($pagerHTML);
}

/* 更新分页
 * ================================== */
IBBDpager.prototype.update = function() {
	this.render();
}

/* ========IBBDpager Class End==============
 * Update: 2012/8/17 TODO!
 * by weishai
 * ========================================================== */

/* 工具函数
 * ================================ */

// 格式化日期

	function formatDate(original_date) {
		var year = original_date.getFullYear();
		var month = original_date.getMonth() + 1;
		if (month < 10) {
			month = '0' + month;
		}
		var date = original_date.getDate();
		if (date < 10) {
			date = '0' + date;
		}
		return year + '/' + month + '/' + date;
	}


	/* 将数字转换为三位科学计数法，用逗号隔开（只支持整数和小数点后最多三位）
	 * by knowingluing 2012.08.22
	 */

	function fToScientificNotation(sNum) {
		if(sNum === null || sNum === undefined) return ' ';
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
		return sResult;
	}

	/* js小数乘法 */

	function accMul(arg1, arg2) {
		var m = 0,
			s1 = arg1.toString(),
			s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length
		} catch (e) {}
		try {
			m += s2.split(".")[1].length
		} catch (e) {}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
	}




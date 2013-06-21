/*
* jQuery pager plugin
* Version 1.0 (12/22/2008)
*下载提供 by caizhenbo
*修改by knowing 2012.07.24：修改后变为bootstrap的jquery分页插件，内部使用。
******使用说明******
引入文件：
    <link rel="stylesheet" href="bootstrap/css/bootstrap.css" />
    <script src="js/jquery-1.7.2.min.js"></script>  
    <script src="js/jquery.pager.js"></script>

HTML结构：
    <div id="pager" class="pagination"></div>

js代码：（需要在结构载入后调用，否则无响应）    
    <script>
        pageClick = function( pageclickednumber )       
        {         
             $("#pager").pager({ 
                pagenumber: pageclickednumber, 
                pagecount: 20,                   
                buttonClickCallback:pageClick 
             });   
        }       
        //加载ajax部分可以参照 http://blog.csdn.net/zhaili1978/article/details/4422391  by caizhenbo

        pageClick(1);//初始化页面序号为第一页
    </script>    

*/

(function($) {

    $.fn.pager = function(options) {

        var opts = $.extend({}, $.fn.pager.defaults, options);

        return this.each(function() {

        // empty out the destination element and then render out the pager with the supplied options
            $(this).empty().append(renderpager(parseInt(options.pagenumber), parseInt(options.pagecount), options.buttonClickCallback));
            
            // specify correct cursor activity
            $('.pages li').mouseover(function() { document.body.style.cursor = "pointer"; }).mouseout(function() { document.body.style.cursor = "auto"; });
        });
    };

    // render and return the pager with the supplied options
    function renderpager(pagenumber, pagecount, buttonClickCallback) {

        // setup $pager to hold render
        var $pager = $('<ul class="pages"></ul>');

        // add in the previous and next buttons
        $pager.append(renderButton('首页', pagenumber, pagecount, buttonClickCallback)).append(renderButton('上一页', pagenumber, pagecount, buttonClickCallback));

        // pager currently only handles 10 viewable pages ( could be easily parameterized, maybe in next version ) so handle edge cases
        var startPoint = 1;
        var endPoint = 9;

        if (pagenumber > 4) {
            startPoint = pagenumber - 4;
            endPoint = pagenumber + 4;
        }

        if (endPoint > pagecount) {
            startPoint = pagecount - 8;
            endPoint = pagecount;
        }

        if (startPoint < 1) {
            startPoint = 1;
        }

        // loop thru visible pages and render buttons
        for (var page = startPoint; page <= endPoint; page++) {

            var currentButton = $('<li><a>' + (page) + '</a></li>');

            page == pagenumber ? currentButton.addClass('active') : currentButton.click(function() { buttonClickCallback(this.firstChild.firstChild.data); });
            currentButton.appendTo($pager);
        }

        // render in the next and last buttons before returning the whole rendered control back.
        $pager.append(renderButton('下一页', pagenumber, pagecount, buttonClickCallback)).append(renderButton('尾页', pagenumber, pagecount, buttonClickCallback));

        return $pager;
    }

    // renders and returns a 'specialized' button, ie 'next', 'previous' etc. rather than a page number button
    function renderButton(buttonLabel, pagenumber, pagecount, buttonClickCallback) {

        var $Button = $('<li><a>' + buttonLabel + '</a></li>');

        var destPage = 1;

        // work out destination page for required button type
        switch (buttonLabel) {
            case "首页":
                destPage = 1;
                break;
            case "上一页":
                destPage = pagenumber - 1;
                break;
            case "下一页":
                destPage = pagenumber + 1;
                break;
            case "尾页":
                destPage = pagecount;
                break;
        }

        // disable and 'grey' out buttons if not needed.
        if (buttonLabel == "首页" || buttonLabel == "上一页") {
            pagenumber <= 1 ? $Button.addClass('disabled') : $Button.click(function() { buttonClickCallback(destPage); });
        }
        else {
            pagenumber >= pagecount ? $Button.addClass('disabled') : $Button.click(function() { buttonClickCallback(destPage); });
        }

        return $Button;
    }

    // pager defaults. hardly worth bothering with in this case but used as placeholder for expansion in the next version
    $.fn.pager.defaults = {
        pagenumber: 1,
        pagecount: 1
    };

})(jQuery);






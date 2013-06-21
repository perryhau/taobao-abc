var TAOBAOABC = {
	_get_last_path_without_hash: function() {
		//获取当前网页地址的末尾路径去hash
	
		var current_url = window.location.href;
		var last_path = current_url.substr(current_url.lastIndexOf('/') + 1);
		return last_path.split("#")[0];
	},
	
	set_active_nav_class: function(){
		var path = this._get_last_path_without_hash();
		$('.sidebar-nav a').each(function() {
			if($(this).attr('href') == path){
				$(this).addClass('active');
			}
  		});
	}
}

$(function(){
	CIM.set_active_nav_class();
}); 	

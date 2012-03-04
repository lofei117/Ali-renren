$(document).ready(
		function() {
			var myid = $.query.load($('#showProfileMenu').attr("href")).get("id");
			var myurl = "http://www.renren.com/" + myid;
			var isNotice = true;
			var removeAds = false;
			var notice_interval = 3;
			var refreshid;
			if (location.href != myurl
					&& location.href != "http://guide.renren.com/guide")
				return;
			chrome.extension.sendRequest({
				type : "getAnimatePara"
			}, function(response) {
				notice_interval = parseInt(response.notice_interval);
				if (response.isNotice != "checked") {
					isNotice = false;
				}
				if (response.removeAds == "checked") {
					removeAds = true;
				}

				if (response.isAnimate) {
					var param = $.param(response.data);
					setAnimation(param);
				}
				if (removeAds) {
					window.setInterval(function() {
						$("[id*='ad10000']").each(function() {
							$(this).remove();
						});
					}, 500);
				}
				if (isNotice) {
					refreshid = window.setInterval(function() {
						$.get("http://notify.renren.com/get.notify?u=" + myid
								+ "&view=0&reply=1", function(result) {
							chrome.extension.sendRequest({
								type : "sendNofitication",
								result : result
							});
						});
					}, 1000 * 60 * notice_interval);
				} else {
					clearInterval(refreshid);
				}
			});

		});

function setAnimation(parameter) {
	var _client_width = $(document).width();
	var _client_height = $(document).height();
	$("<div/>").css({
		"position" : "absolute",
		"width" : _client_width,
		"height" : _client_height,
		"zIndex" : 1000,
		"border" : "1px solid",
		"background-color" : "#000000",
		"filter" : "alpha(opacity = 80)",
		"-moz-opacity" : 0.8,
		"opacity" : 0.8
	}).attr('id', 'if_div').prependTo("body");
	$("<div/>").css({
		"position" : "absolute",
		"width" : _client_width,
		"height" : _client_height,
		"zIndex" : 1001,
		"border" : "1px solid",
		"background-color" : "#000000",
		"filter" : "alpha(opacity = 0)",
		"-moz-opacity" : 0,
		"opacity" : 0
	}).attr('id', 'if_div2').click(function() {
		$('#if_div').remove();
		$('#if_div2').remove();
	}).prependTo("body");
	var iframeURL = chrome.extension.getURL("index.html");
	iframeURL += "?" + parameter;
	$("<iframe/>").css({
		"width" : _client_width,
		"height" : 800
	}).attr({
		"src" : iframeURL,
		"frameborder" : 0,
		"scrooling" : "no"
	}).appendTo("#if_div");
}

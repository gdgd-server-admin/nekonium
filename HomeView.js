var deviceToast = require("deviceToast");

var Observable = require("FuseJS/Observable");
var FileSystem = require("FuseJS/FileSystem");
var Storage         = require("FuseJS/Storage");
var path = FileSystem.dataDirectory + "/" + "config.json";
var ROOT_URL = "api/v1/";
var camera = require("FuseJS/Camera");
var cameraRoll = require("FuseJS/CameraRoll");
var Uploader = require("Uploader");

var api = require("Assets/js/api");
var helper = require("Assets/js/helper");

var MediaIds = Observable();
var ImageUrl = Observable("");
var VideoUrl = Observable("");
var isCoolDown = Observable(false);
var Connected  = Observable();
var UserInfo = Observable();
var currentPage = Observable("HometimelinePage");

var isReconnecting = Observable(false);

var Share = require("FuseJS/Share");
var InterApp = require("FuseJS/InterApp");

var LocalNotify = require("FuseJS/LocalNotifications");

var VideoRotate = Observable(0);

var moment = require("Assets/js/moment-with-locales");
moment.locale("ja");

var Timer = require("FuseJS/Timer");

var _htl = Observable();
var _ntl = Observable();
var _ltl = Observable();
var _ptl = Observable();
var _ttl = Observable();

var _htlr = Observable(false);
var _ntlr = Observable(false);
var _ltlr = Observable(false);
var _ptlr = Observable(false);
var _ttlr = Observable(false);

var homeconnection = null;
var federateconnection = null;
var tagconnection = null;
var chatconnection = null;

var _chatlog = Observable();
var ChatText = Observable("");

var SearchQuery = Observable("");


function toggleVideoRotate(){

	switch(VideoRotate.value){

		case 0:
		VideoRotate.value = 90;
		break;
		case 90:
		VideoRotate.value = 180;
		break;
		case 180:
		VideoRotate.value = 270;
		break;
		case 270:
		VideoRotate.value = 0;
		break;
	}

}

function configClick(){

	if(isCoolDown.value){
		return;
	}

	camera.takePicture(1280, 960)
	.then(function(image) {

		if(FileSystem.existsSync(path)){
			var config = JSON.parse("{}");
			config =  FileSystem.readTextFromFileSync(path);
			config = JSON.parse(config);
			console.log("loadConfig");
			var url = encodeURI(config.base_url + ROOT_URL + "media");

			console.log("import Uploader");
			return Uploader.send(
				image.path,
				url,
				config.access_token
			);
		}
	})
	.then(function(res) {
		// Will be called if the image was successfully added to the camera roll.
		isCoolDown.value = true;
		setTimeout(function(){
			isCoolDown.value = false;
		},30000);

		localStorage.setItem("quickNekonium",res);
		router.push("PostPage");
	}, function(error) {
		// Will called if an error occurred.
		console.log("upload failed");
	});
}

function mediaClick(){

	if(isCoolDown.value){
		return;
	}

	cameraRoll.getImage()
	.then(function(image) {

		if(FileSystem.existsSync(path)){
			var config = JSON.parse("{}");
			config =  FileSystem.readTextFromFileSync(path);
			config = JSON.parse(config);
			console.log("loadConfig");
			var url = encodeURI(config.base_url + ROOT_URL + "media");

			console.log("import Uploader");
			return Uploader.send(
				image.path,
				url,
				config.access_token
			);
		}
	})
	.then(function(res) {
		// Will be called if the image was successfully added to the camera roll.
		isCoolDown.value = true;
		setTimeout(function(){
			isCoolDown.value = false;
		},30000);

		localStorage.setItem("quickNekonium",res);
		router.push("PostPage");
	}, function(error) {
		// Will called if an error occurred.
		console.log("upload failed");
	});
}

function pawClick(){

	if(isCoolDown.value){
		return;
	}



	if(FileSystem.existsSync(path)){
		var config = JSON.parse("{}");
		config =  FileSystem.readTextFromFileSync(path);
		config = JSON.parse(config);

		var url = encodeURI(config.base_url + ROOT_URL + "statuses");

		var nyaan = "にゃーん";
		if(localStorage.getItem("NyaanText") != undefined){
			nyaan = localStorage.getItem("NyaanText");
		}

		var auth = 'Bearer ' + config.access_token;
		options = {
			body: {
				status: nyaan,
				visibility: "public"
			},
			headers: { 'Authorization': auth }
		};

		options = Object.assign({}, options, {
			method: "POST",
			body: JSON.stringify(options.body),
			headers: Object.assign({}, options.headers, {
				"Content-Type": "application/json"
			})
		});


		fetch(url, options)
		.then(function(response) {
			console.log("にゃーん");
		});
	}

	isCoolDown.value = true;
	setTimeout(function(){
		isCoolDown.value = false;
	},30000);
}

function homeClick(){
	srouter.goto("HometimelinePage");
}
function notificationClick(){
	srouter.goto("NotificationPage");
}
function tagClick(){
	srouter.goto("TagPage");
}
function localtimelineClick(){
	srouter.goto("LocaltimelinePage");
}
function localchatClick(){
	srouter.goto("LocalchatPage");
}
function postClick(){
	router.push("PostPage");
}
function fedelatetimelineClick(){
	srouter.goto("FedelatetimelinePage");
}
function settingClick(){
	router.push("ConfigPage");
}
function videoClick(){
	router.push("VideoPage");
}

function drawClick(){
	router.push("PaintPage");
}

function gachaClick(){
	router.push("GachaPage");
}

var NotificationMessage = Observable("");
var NotificationDetail = Observable("");

function clearNotificationMessage(args){

	setTimeout(function(){
		NotificationMessage.value = "";
		NotificationDetail.value = "";
	},400);

}

function clearImageUrl(){
	localStorage.removeItem("ImageUrl");
	ImageUrl.value = "";
}
function clearVideoUrl(){
	localStorage.removeItem("VideoUrl");
	VideoUrl.value = "";
}

function followUser(args){

	var tmp = UserInfo.value;

	api.action_to_account(tmp,"follow")
	.then(function(){

	});
	UserInfo.value = "";
}
function unfollowUser(args){

	console.log("unfollow from userinfo");
	var tmp = UserInfo.value;
	console.log(tmp.id);

	api.action_to_account(tmp,"unfollow")
	.then(function(){
		console.log("finish unfollow");

	});
	UserInfo.value = "";
}
function muteUser(args){

	var tmp = UserInfo.value;

	api.action_to_account(tmp,"mute")
	.then(function(){

	});
	UserInfo.value = "";
}
function unmuteUser(args){

	var tmp = UserInfo.value;

	api.action_to_account(tmp,"unmute")
	.then(function(){
		console.log("finish unmute");

	});
	UserInfo.value = "";
}
function blockUser(args){

	var tmp = UserInfo.value;

	api.action_to_account(tmp,"block")
	.then(function(){

	});
	UserInfo.value = "";
}
function clearUserInfo(){
	UserInfo.value = "";
}

function setImageUrl(args){
	if(localStorage.getItem("ImageViewer") != undefined){
		if(args.data.type == "image"){
			ImageUrl.value = args.data.url;
		}else if(args.data.type == "video" || args.data.type == "gifv"){

			VideoUrl.value = args.data;
		}
	}else{
		InterApp.launchUri(args.data.url);
	}
}

function setUserInfo(args){

	var tmp = args.data;

	if(tmp.reblog == null){
		api.get_userinfo(tmp.account)
		.then((data) => {
			UserInfo.value = JSON.parse(data);
		});

	}else{
		api.get_userinfo(tmp.reblog.account)
		.then((data) => {
			UserInfo.value = JSON.parse(data);
		});

	}

}

function homeActivated(){

	if(_htl.length < 20){
		homeReload();
	}
}

function homeReload(){
	if(_htlr.value == false){
		_htlr.value = true;
		if(FileSystem.existsSync(path)){
			api.get_timeline("timelines/home")
			.then((data) => {

				_htl.replaceAll(data);
				_htlr.value = false;

			});
		}
	}
}

function localActivated(){
	if(_ltl.length < 20){
		localReload();
	}
}

function localReload(){
	if(_ltlr.value == false){
		_ltlr.value = true;
		if(FileSystem.existsSync(path)){
			api.get_timeline("timelines/public?local=true")
			.then((data) => {

				_ltl.replaceAll(data);
				_ltlr.value = false;

			});
		}
	}
}

function noticeActivated(){

	if(_ntl.length < 15){
		noticeReload();
	}
}

function noticeReload(){
	if(_ntlr.value == false){
		_ntlr.value = true;
		if(FileSystem.existsSync(path)){

			api.get_notification()
			.then((data) => {

				console.log("test");

				_ntl.replaceAll(data);
				_ntlr.value = false;

			});
		}
	}
}

function publicActivated(){

	if(_ptl.length < 40){
		publicReload();
	}
}

function publicReload(){
	if( _ptlr.value == false){
		_ptlr.value = true;
		if(FileSystem.existsSync(path)){
			api.get_timeline("timelines/public?limit=40")
			.then((data) => {

				_ptl.replaceAll(data);
				_ptlr.value = false;

			});
		}
	}
}

function tagActivated(){

	if(_ttl.length < 20){
		tagReload();
	}
}

function tagReload(){
	if(_ttlr.value == false){
		_ttlr.value = true;
		if(FileSystem.existsSync(path)){

			var tagname = "ねこにうむ";
			if(localStorage.getItem("TagText") != undefined){
				ttmp = localStorage.getItem("TagText");
				if(ttmp != ""){
					tagname = ttmp.replace("#","");
				}
			}

			api.get_timeline("timelines/tag/" + tagname)
			.then((data) => {

				_ttl.replaceAll(data);
				_ttlr.value = false;

			});
		}
	}
}

function tryReconnect(){

	if(isReconnecting.value == false){

		console.log(Connected.length);

		isReconnecting.value = true;
		if(homeconnection != null){
			homeconnection.close();
		}
		if(federateconnection != null){
			federateconnection.close();
		}

		if(tagconnection != null){
			tagconnection.close();
		}

		if(chatconnection != null){
			chatconnection.close();
		}

		Connected.clear();

		getStreamingdataA();
		getStreamingdataB();
		getStreamingdataC();
		chatWebSocket();



		setTimeout(function(){
			isReconnecting.value = false;
			console.log(Connected.length);
		},5000);
	}
}

function shareImageUrl(args){

	Share.shareText(ImageUrl.value,"さっき開いた画像のURL");

}

function openImageUrl(){

	InterApp.launchUri(ImageUrl.value.split("?")[0]);

}
function shareVideoUrl(){

	Share.shareText(VideoUrl.value.url,"さっき開いた動画のURL");

}

function openVideoUrl(){

	InterApp.launchUri(VideoUrl.value.url);

}

function getStreamingdataA(){
	if(FileSystem.existsSync(path)){
		isConnected = true;

		var streamconfig = JSON.parse("{}");
		streamconfig =  FileSystem.readTextFromFileSync(path);

		if(streamconfig == ""){
			return;
		}

		streamconfig = JSON.parse(streamconfig);

		if(streamconfig.access_token == undefined){
			return;
		}

		var burl = streamconfig.base_url;

		var streamingurl = burl.replace("http","ws") + 'api/v1/streaming?access_token=' + streamconfig.access_token + "&stream=user";

		homeconnection = new WebSocket(streamingurl);
		homeconnection.onopen = function () {
			console.log("home websocket open");
			Connected.add("HomeStreaming");
		};

		// Log errors
		homeconnection.onerror = function (error) {
			if(isConnected){
				isConnected = false;
				homeconnection.close();
				//setTimeout(getStreamingdata,5000);
				console.log("home websocket error");
				Connected.removeWhere(function(val){
					return val == "HomeStreaming";
				});
			}
		};

		// Log messages from the server
		homeconnection.onmessage = function (e) {
			var recvdata = JSON.parse(e.data);
			try{
				if(recvdata.event == "update"){

					var payload = JSON.parse(recvdata.payload);

					var tmppayload = api.normalize_status(payload);

					if(tmppayload.reblog != null){
						var tmpreblog = tmppayload.reblog;
						tmppayload.reblog = api.normalize_status(tmpreblog);
						tmppayload.reblogged = true;
					}

					_htl.insertAt(0,tmppayload);

				}
				if(recvdata.event == "notification"){

					var payload = JSON.parse(recvdata.payload);
					if(payload.account.display_name == ""){
						payload.account.display_name = payload.account.username;
					}
					if(payload.status != null){
						payload.status = api.normalize_status(payload.status);
					}
					try{
						payload.timestamp = helper.gmttime_to_localtime(payload.created_at);
					}catch(e){
						payload.timestamp = payload.created_at;
					}

					_ntl.insertAt(0,payload);

					//NotificationMessage.value = api.get_notification_message(payload);
					//NotificationDetail.value = api.get_notification_detail(payload);
					if(localStorage.getItem('LocalNotify') != undefined){
						console.log("send localnotify");
						LocalNotify.now("nekonium",api.get_notification_message(payload),api.get_notification_detail(payload),true);
					}

				}
				if(recvdata.event = "delete"){
					_htl.removeWhere(function(place){
						return place.id == recvdata.payload;
					});
					_ntl.removeWhere(function(place){
						return place.id == recvdata.payload;
					});
				}

				if(_htl.length > 20){
					_htl.removeRange(_htl.length - 1,1);
				}
				if(_ntl.length > 15){
					_ntl.removeRange(_ntl.length - 1,1);
				}
			}catch(e){}
		};

		homeconnection.onclose = function(){
			if(isConnected){
				isConnected = false;
				homeconnection.close();
				//setTimeout(getStreamingdata,5000);
				console.log("home websocket close");
				Connected.removeWhere(function(val){
					return val == "HomeStreaming";
				});
			}
		};
	}
}

function getStreamingdataB(){
	if(FileSystem.existsSync(path)){
		isConnected = true;

		var streamconfig = JSON.parse("{}");
		streamconfig =  FileSystem.readTextFromFileSync(path);

		if(streamconfig == ""){
			return;
		}

		streamconfig = JSON.parse(streamconfig);

		if(streamconfig.access_token == undefined){
			return;
		}

		var burl = streamconfig.base_url;

		var streamingurl = burl.replace("http","ws") + 'api/v1/streaming?access_token=' + streamconfig.access_token + "&stream=public";

		federateconnection = new WebSocket(streamingurl);
		federateconnection.onopen = function () {
			console.log("federate websocket open");
			Connected.add("FederateStreaming");
		};

		// Log errors
		federateconnection.onerror = function (error) {
			console.log(error.data);
			if(isConnected){
				isConnected = false;
				federateconnection.close();
				//setTimeout(getStreamingdata,5000);
				console.log("federate websocket error");

				Connected.removeWhere(function(val){
					return val == "FederateStreaming";
				});
			}
		};

		// Log messages from the server
		federateconnection.onmessage = function (e) {
			var recvdata = JSON.parse(e.data);
			try{
				if(recvdata.event == "update"){

					var payload = JSON.parse(recvdata.payload);
					_ptl.insertAt(0,api.normalize_status(payload));
					if(payload.account.username == payload.account.acct){
						_ltl.insertAt(0,api.normalize_status(payload));
					}
				}
				if(recvdata.event = "delete"){
					_ptl.removeWhere(function(place){
						return place.id == recvdata.payload;
					});
					_ltl.removeWhere(function(place){
						return place.id == recvdata.payload;
					});
				}

				if(_ptl.length > 40){
					_ptl.removeRange(_ptl.length - 1,1);
				}
				if(_ltl.length > 20 && payload.account.username == payload.account.acct){
					_ltl.removeRange(_ltl.length - 1,1);
				}

			}catch(e){}
		};
		federateconnection.onclose = function(){
			if(isConnected){
				isConnected = false;
				federateconnection.close();
				//setTimeout(getStreamingdata,5000);
				console.log("federate websocket close");
				Connected.removeWhere(function(val){
					return val == "FederateStreaming";
				});
			}
		};
	}
}
function getStreamingdataC(){
	if(FileSystem.existsSync(path)){
		isConnected = true;

		var tagname = "ねこにうむ";
		if(localStorage.getItem("TagText") != undefined){
			ttmp = localStorage.getItem("TagText");
			if(ttmp != ""){
				tagname = ttmp.replace("#","");
			}
		}

		var streamconfig = JSON.parse("{}");
		streamconfig =  FileSystem.readTextFromFileSync(path);

		if(streamconfig == ""){
			return;
		}

		streamconfig = JSON.parse(streamconfig);

		if(streamconfig.access_token == undefined){
			return;
		}

		var burl = streamconfig.base_url;

		var streamingurl = burl.replace("http","ws") + 'api/v1/streaming/?access_token=' + streamconfig.access_token + "&stream=hashtag&tag=" + encodeURIComponent(tagname);

		tagconnection = new WebSocket(streamingurl);
		tagconnection.onopen = function () {
			console.log("tag webscket open");
			Connected.add("TagStreaming");
		};

		// Log errors
		tagconnection.onerror = function (error) {
			if(isConnected){
				isConnected = false;
				tagconnection.close();
				//setTimeout(getStreamingdata,5000);
				console.log("tag websocket error");
				Connected.removeWhere(function(val){
					return val == "TagStreaming";
				});
			}
		};

		// Log messages from the server
		tagconnection.onmessage = function (e) {
			var recvdata = JSON.parse(e.data);
			try{
				if(recvdata.event == "update"){

					var payload = JSON.parse(recvdata.payload);
					_ttl.insertAt(0,api.normalize_status(payload));

				}
				if(recvdata.event = "delete"){

					_ttl.removeWhere(function(place){
						return place.id == recvdata.payload;
					});

				}

				if(_ttl.length > 20){
					_ttl.removeRange(_ttl.length - 1,1);
				}

			}catch(e){}
		};

		tagconnection.onclose = function(){
			if(isConnected){
				isConnected = false;
				tagconnection.close();
				//setTimeout(getStreamingdata,5000);
				console.log("tag websocket close");
				Connected.removeWhere(function(val){
					return val == "TagStreaming";
				});
			}
		};
	}
}

function replyTo(args){

	var tmp = args.data.reblog == null ? args.data : args.data.reblog;

	localStorage.setItem('ReplyTo', JSON.stringify(tmp));
	router.push("PostPage");
}

function boostItem(args){

	var tmp = args.data.reblog == null ? args.data : args.data.reblog;

	api.boost_status(tmp)
	.then(function(){
		console.log("boosted");
		_htl.forEach(function(toot,index){
			if( args.data.reblog == null){
				if(toot.id == tmp.id){
					console.log("これです！");
					toot.reblogged = !toot.reblogged;
					_htl.replaceAt(index,toot);
				}
			}else{
				if(toot.reblog != null){
					if(toot.reblog.id == tmp.id){
						console.log("これです！");
						toot.reblog.reblogged = !toot.reblog.reblogged;
						_htl.replaceAt(index,toot);
					}
				}
			}
		});
		_ntl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.reblogged = !toot.reblogged;
				_ntl.replaceAt(index,toot);
			}
		});
		_ltl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.reblogged = !toot.reblogged;
				_ltl.replaceAt(index,toot);
			}
		});
		_ptl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.reblogged = !toot.reblogged;
				_ptl.replaceAt(index,toot);
			}
		});
		_ttl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.reblogged = !toot.reblogged;
				_ttl.replaceAt(index,toot);
			}
		});
	});

}

function deleteItem(args){
	var tmp = args.data;
	api.delete_status(tmp)
}

function reportItem(args){
	//api.report_status(tmp);
	console.log(JSON.stringify(args));
	console.log(args.account_id);
	console.log(args.status_id);
	console.log(args.comment);
	api.report_status(args.account_id,args.status_id,args.comment);
}

function favouriteItem(args){

	var tmp = args.data.reblog == null ? args.data : args.data.reblog;

	api.favourite_status(tmp)
	.then(function(){
		console.log("favorited");
		_htl.forEach(function(toot,index){
			if( args.data.reblog == null){
				if(toot.id == tmp.id){
					console.log("これです！");
					toot.favourited = !toot.favourited;
					_htl.replaceAt(index,toot);
				}
			}else{
				if(toot.reblog != null){
					if(toot.reblog.id == tmp.id){
						console.log("これです！");
						toot.reblog.favourited = !toot.reblog.favourited;
						_htl.replaceAt(index,toot);
					}
				}
			}
		});
		_ntl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.favourited = !toot.favourited;
				_ntl.replaceAt(index,toot);
			}
		});
		_ltl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.favourited = !toot.favourited;
				_ltl.replaceAt(index,toot);
			}
		});
		_ptl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.favourited = !toot.favourited;
				_ptl.replaceAt(index,toot);
			}
		});
		_ttl.forEach(function(toot,index){
			if(toot.id == tmp.id){
				console.log("これです！");
				toot.favourited = !toot.favourited;
				_ttl.replaceAt(index,toot);
			}
		});
	});

}

function openExternLink(args){

	var tmp = args.data.reblog == null ? args.data : args.data.reblog;

	if(tmp.extenurl != null){

		InterApp.launchUri(tmp.extenurl);

	}
}

function homeReadmore(){

	//Promise使ったら？
	return new Promise(function(resolve,reject){
		var public_max_id = 0;

		_htl.forEach(function(i){
			if(i.id < public_max_id || public_max_id == 0){
				public_max_id = i.id;
			}
		});

		if(_htlr.value == false){
			_htlr.value = true;
			if(FileSystem.existsSync(path)){
				api.get_timeline("timelines/home?max_id=" + public_max_id)
				.then((data) => {

					_htl.addAll(data);
					_htlr.value = false;

				});
			}
		}
	});

}

function localReadmore(){
	var public_max_id = 0;

	_ltl.forEach(function(i){
		if(i.id < public_max_id || public_max_id == 0){
			public_max_id = i.id;
		}
	});

	if(_ltlr.value == false){
		_ltlr.value = true;
		if(FileSystem.existsSync(path)){
			api.get_timeline("timelines/public?local=true&max_id=" + public_max_id)
			.then((data) => {

				_ltl.addAll(data);
				_ltlr.value = false;

			});
		}
	}
}

function tagReadmore(){
	var public_max_id = 0;

	_ttl.forEach(function(i){
		if(i.id < public_max_id || public_max_id == 0){
			public_max_id = i.id;
		}
	});

	if(_ttlr.value == false){
		_ttlr.value = true;
		if(FileSystem.existsSync(path)){

			var tagname = "ねこにうむ";
			if(localStorage.getItem("TagText") != undefined){
				ttmp = localStorage.getItem("TagText");
				if(ttmp != ""){
					tagname = ttmp.replace("#","");
				}
			}

			api.get_timeline("timelines/tag/" + tagname + "?max_id=" + public_max_id)
			.then((data) => {

				_ttl.addAll(data);
				_ttlr.value = false;

			});
		}
	}
}

function publicReadmore(){
	var public_max_id = 0;

	_ptl.forEach(function(i){
		if(i.id < public_max_id || public_max_id == 0){
			public_max_id = i.id;
		}
	});

	if( _ptlr.value == false){
		_ptlr.value = true;
		if(FileSystem.existsSync(path)){
			api.get_timeline("timelines/public?limit=40&max_id=" + public_max_id)
			.then((data) => {

				_ptl.addAll(data);
				_ptlr.value = false;

			});
		}
	}

}

getStreamingdataA();
getStreamingdataB();
getStreamingdataC();

function gotoVtagPage(args){
	srouter.goto("VTagPage");
}
function resetSRouter(){
	srouter.getRoute(function(route){
		console.log(JSON.stringify(route));
		if(route[0] == "VTagPage"){
			if(localStorage.getItem("VTagText") == undefined || localStorage.getItem("VTagText") == ""){
				srouter.goto("FedelatetimelinePage");
			}
		}
	});
}

function chatWebSocket(){
	if(FileSystem.existsSync(path)){
		isConnected = true;

		var streamconfig = JSON.parse("{}");
		streamconfig =  FileSystem.readTextFromFileSync(path);

		if(streamconfig == ""){
			return;
		}

		streamconfig = JSON.parse(streamconfig);
		if(streamconfig.access_token == undefined){
			return;
		}

		//有効化されていなかったら接続しない（接続エラーになるだけなので。できればＰｌｅｒｏｍａかどうか判別したい）
		if(localStorage.getItem("ChatEnabled") == undefined){
			console.log("chat is not enabled");
			return;
		}

		var twittertoken = "";

		var certurl = encodeURI(streamconfig.base_url + "api/account/verify_credentials");

		var auth = 'Bearer ' + streamconfig.access_token;

		options = {
			method: "GET",
			headers: { 'Authorization': auth }
		};

		console.log(certurl);
		fetch(certurl, options)
		.then(function(response) {
			return response.json();
		})
		.then(function(jsondata) {
			console.log(jsondata.token);
			console.log("chat enabled");
			var burl = streamconfig.base_url;
			var streamingurl = burl.replace("http","ws") + 'socket/websocket?token=' + jsondata.token + "&vsn=2.0.0";
			console.log(streamingurl);
			try{
				chatconnection = new WebSocket(streamingurl);
			}catch(err){
				console.log(err);
			}

			chatconnection.onopen = function () {
				console.log("chat webscket open");
				Connected.add("ChatStreaming");
				chatconnection.send(JSON.stringify(["1","1","chat:public","phx_join",{}]));
				var iintervalid = setInterval(sendChatHeartBeat,30000);
			};
			chatconnection.onmessage = function (e) {
				var recvdata = JSON.parse(e.data);
				try{
					switch(recvdata[2]){
						case  "chat:public":
						switch(recvdata[3]){
							case "messages":
							//過去ログ
							_chatlog.clear();
							recvdata[4].messages.forEach(function(item){
								_chatlog.insertAt(0,item);
							});
							break;
							case "new_msg":
							//新規ログ
							_chatlog.insertAt(0,recvdata[4]);
							break;
							case "new_notice":
							console.log("おしらせを受信");
							break;
						}
						break;
						case "phoenix":
						switch(recvdata[3]){
							case "phx_reply":
							if(recvdata[4].status == "ok"){
								console.log("オッケーイ！");
							}else{
								if(isConnected){
									isConnected = false;
									chatconnection.close();
									//setTimeout(getStreamingdata,5000);
									console.log("chat websocket error");
									console.log(error);
									Connected.removeWhere(function(val){
										return val == "ChatStreaming";
									});
								}
							}
							break;
						}
						break;
					}

				}catch(e){}
				if(_chatlog.length > 20){
					_chatlog.removeRange(_chatlog.length - 1,1);
				}
			};
			chatconnection.onerror = function (error) {
				if(isConnected){
					isConnected = false;
					chatconnection.close();
					//setTimeout(getStreamingdata,5000);
					console.log("chat websocket error");
					console.log(error);
					Connected.removeWhere(function(val){
						return val == "ChatStreaming";
					});
				}
			};
			chatconnection.onclose = function(){
				if(isConnected){
					isConnected = false;
					chatconnection.close();
					//setTimeout(getStreamingdata,5000);
					console.log("chat websocket close");
					Connected.removeWhere(function(val){
						return val == "ChatStreaming";
					});
				}
			};
		});
	}
}

chatWebSocket();

function sendChatMessage(){
	if(ChatText.value != ""){

		chatconnection.send(JSON.stringify([null,null,"chat:public","new_msg",{"text":ChatText.value}]));
		ChatText.value = "";

	}
}

function sendChatHeartBeat(){
	chatconnection.send(JSON.stringify([null,null,"phoenix","heartbeat",{}]));
}

function fromNow(args){
	console.log(args.data);
	return moment(args.data.createdat).fromNow();
}

function doSearch(){
	if(SearchQuery.value != ""){
		console.log(SearchQuery.value);
		api.get_search_result(SearchQuery.value).then(function(res){
			router.push("PaintPage",{query: SearchQuery.value,result: res})
		});
	}
}

module.exports = {
	currentPage:currentPage,
	configClick: configClick,
	homeClick: homeClick,
	notificationClick: notificationClick,
	localtimelineClick: localtimelineClick,
	postClick: postClick,
	fedelatetimelineClick:fedelatetimelineClick,
	NotificationMessage:NotificationMessage,
	NotificationDetail:NotificationDetail,
	clearNotificationMessage:clearNotificationMessage,
	settingClick:settingClick,
	ImageUrl:ImageUrl,
	clearImageUrl:clearImageUrl,
	isCoolDown:isCoolDown,
	tagClick:tagClick,
	Connected:Connected,
	tryReconnect:tryReconnect,
	UserInfo:UserInfo,
	followUser:followUser,
	unfollowUser:unfollowUser,
	blockUser:blockUser,
	setUserInfo:setUserInfo,
	clearUserInfo:clearUserInfo,
	isReconnecting:isReconnecting,
	setImageUrl:setImageUrl,
	shareImageUrl:shareImageUrl,
	openImageUrl:openImageUrl,
	_htl:_htl,
	_ntl:_ntl,
	_ltl:_ltl,
	_ptl:_ptl,
	_ttl:_ttl,
	_htlr:_htlr,
	_ntlr:_ntlr,
	_ltlr:_ltlr,
	_ptlr:_ptlr,
	_ttlr:_ttlr,
	homeReload:homeReload,
	localReload:localReload,
	noticeReload:noticeReload,
	publicReload:publicReload,
	tagReload:tagReload,
	homeActivated:homeActivated,
	noticeActivated:noticeActivated,
	localActivated:localActivated,
	tagActivated:tagActivated,
	publicActivated:publicActivated,
	boostItem:boostItem,
	favouriteItem:favouriteItem,
	replyTo:replyTo,
	openExternLink:openExternLink,
	homeReadmore:homeReadmore,
	localReadmore:localReadmore,
	tagReadmore:tagReadmore,
	publicReadmore:publicReadmore,
	mediaClick:mediaClick,
	VideoUrl:VideoUrl,
	clearVideoUrl:clearVideoUrl,
	shareVideoUrl:shareVideoUrl,
	openVideoUrl:openVideoUrl,
	videoClick:videoClick,
	VideoRotate:VideoRotate,
	toggleVideoRotate:toggleVideoRotate,
	drawClick:drawClick,
	pawClick:pawClick,
	gachaClick:gachaClick,
	deleteItem:deleteItem,
	muteUser:muteUser,
	unmuteUser:unmuteUser,
	reportItem:reportItem,
	gotoVtagPage:gotoVtagPage,
	resetSRouter:resetSRouter,
	_chatlog:_chatlog,
	localchatClick:localchatClick,
	ChatText:ChatText,
	sendChatMessage:sendChatMessage,
	fromNow:fromNow,
	SearchQuery:SearchQuery,
	doSearch:doSearch,
}

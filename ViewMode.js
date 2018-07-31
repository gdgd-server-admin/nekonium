var Observable = require("FuseJS/Observable");
var api = require("Assets/js/api");

var NightModeEnabled = Observable(false);
var ImageViewerEnabled = Observable(false);
var LocalNotifyEnabled = Observable(false);
var ShiitakeX = Observable("80%");
var ShiitakeY = Observable("85%");
var MovableShiitakeEnabled = Observable(false);
var ShiitakeAlign = Observable("↑");
var MyUsername = Observable("");
var VTagText = Observable("");
var PleromaChatEnabled = Observable(false);

var _align =  Observable(
	{ id : "↑" 			, next: "→"			, prev: "←"			},
	{ id : "→" 			, next: "↓"			, prev: "↑"			},
	{ id : "↓" 			, next: "←"			, prev: "→"			},
	{ id : "←" 			, next: "↑"			, prev: "↓"			}
);
var _logged = false;

function toggleNightMode(){
	NightModeEnabled.value = !NightModeEnabled.value;
	var args = {
		"sender": "NightModeEnabled",
		"value": NightModeEnabled.value
	}
	saveViewMode(args);
}

function toggleLocalNotify(){
	LocalNotifyEnabled.value = !LocalNotifyEnabled.value;
	var args = {
		"sender": "LocalNotiEnabled",
		"value": LocalNotifyEnabled.value
	}
	saveViewMode(args);
}

function moveShiitake(args){
	if(MovableShiitakeEnabled.value){
		var _offsetx = 0;
		var _offsety = 0;
		ShiitakeX.value = args.x + _offsetx;
		ShiitakeY.value = args.y + _offsety;
		localStorage.setItem("ShiitakeX",ShiitakeX.value);
		localStorage.setItem("ShiitakeY",ShiitakeY.value);
	}
}


function toggleShiitakeLeft(){
	var _buf = "";
	_align.forEach(function(n){
		if(n.id == ShiitakeAlign.value){
			_buf = n.prev;
		}
	});
	ShiitakeAlign.value = _buf;

	saveViewMode();
}

function resetShiitake(){
	MovableShiitakeEnabled.value = false;
	ShiitakeX.value = "80%";
	ShiitakeY.value = "70%";
	ShiitakeAlign.value = "↑";

	localStorage.removeItem("ShiitakeX");
	localStorage.removeItem("ShiitakeY");
	localStorage.removeItem('MovableShiitakeEnabled');
	localStorage.removeItem('ShiitakeAlign');
}

function toggleShiitakeRight(){
	var _buf = "";
	_align.forEach(function(n){
		if(n.id == ShiitakeAlign.value){
			_buf = n.next;
		}
	});
	ShiitakeAlign.value = _buf;

	saveViewMode();
}

function saveViewMode(args){

	console.log("Turn " + args.sender + " " + args.value);

	// args.senderをlocalStorageのキーに
	// args.valueを設定内容に
	if(args.value){
		localStorage.setItem(args.sender, true);
	}else{
		localStorage.removeItem(args.sender);
	}

	// ShiitakeAlign
	// こいつはどうするかな
	localStorage.setItem('ShiitakeAlign', ShiitakeAlign.value);
}

function getInitialDataFromLocalStorage(){

	// localStorageに特定のキーの値がセットされているかどうかの確認

	NightModeEnabled.value = (localStorage.getItem("NightModeEnabled") != undefined);

	PleromaChatEnabled.value = (localStorage.getItem("PleromaChatEnabled") != undefined);

	LocalNotifyEnabled.value = (localStorage.getItem("LocalNotifyEnabled") != undefined);

	ImageViewerEnabled.value = (localStorage.getItem("ImageViewerEnabled") != undefined);

	MovableShiitakeEnabled.value = (localStorage.getItem("MovableShiitakeEnabled") != undefined);


	if(localStorage.getItem("ShiitakeX") != undefined){
		ShiitakeX.value = localStorage.getItem("ShiitakeX");
	}

	if(localStorage.getItem("ShiitakeY") != undefined){
		ShiitakeY.value = localStorage.getItem("ShiitakeY");
	}

	if(localStorage.getItem("ShiitakeAlign") != undefined){
		ShiitakeAlign.value = localStorage.getItem("ShiitakeAlign");
	}

	if(localStorage.getItem("MyUsername") != undefined){
		MyUsername.value = localStorage.getItem("MyUsername");
	}else{
		api.get_profile()
			.then((data) => {
				console.log(data);
				var res = JSON.parse(data);
				MyUsername.value = res.username;
				localStorage.setItem("MyUsername",res.username);
			});
	}

	if(localStorage.getItem("VTagText") != undefined){
		VTagText.value = localStorage.getItem("VTagText");
	}


}

module.exports = {
	getInitialDataFromLocalStorage:getInitialDataFromLocalStorage,
	saveViewMode:saveViewMode,
  NightModeEnabled:NightModeEnabled,
	toggleNightMode:toggleNightMode,
	ImageViewerEnabled:ImageViewerEnabled,
	LocalNotifyEnabled:LocalNotifyEnabled,
	toggleLocalNotify:toggleLocalNotify,
	ShiitakeX:ShiitakeX,
	ShiitakeY:ShiitakeY,
	moveShiitake:moveShiitake,
	MovableShiitakeEnabled:MovableShiitakeEnabled,
	ShiitakeAlign:ShiitakeAlign,
	toggleShiitakeLeft:toggleShiitakeLeft,
	toggleShiitakeRight:toggleShiitakeRight,
	resetShiitake:resetShiitake,
	MyUsername:MyUsername,
	VTagText:VTagText,
	PleromaChatEnabled:PleromaChatEnabled,
}

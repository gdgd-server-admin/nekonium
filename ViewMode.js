var Observable = require("FuseJS/Observable");
var api = require("Assets/js/api");

var NightMode = Observable(false);
var MoveLeft = Observable(false);
var MoveUp = Observable(false);
var ImageViewer = Observable(false);
var LocalNotify = Observable(false);
var AlignChange = Observable(false);
var ShiitakeX = Observable("80%");
var ShiitakeY = Observable("85%");
var MovableShiitake = Observable(false);
var ShiitakeAlign = Observable("↑");
var MyUsername = Observable("");
var VTagText = Observable("");
var ChatEnabled = Observable(false);

var _align =  Observable(
	{ id : "↑" 			, next: "→"			, prev: "←"			},
	{ id : "→" 			, next: "↓"			, prev: "↑"			},
	{ id : "↓" 			, next: "←"			, prev: "→"			},
	{ id : "←" 			, next: "↑"			, prev: "↓"			}
);
var _logged = false;

function toggleNightMode(){
	NightMode.value = !NightMode.value;
	saveViewMode();
}

function toggleLocalNotify(){
	LocalNotify.value = !LocalNotify.value;
	saveViewMode();
}

function moveShiitake(args){
	if(MovableShiitake.value){
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
	MovableShiitake.value = false;
	ShiitakeX.value = "80%";
	ShiitakeY.value = "70%";
	ShiitakeAlign.value = "↑";

	localStorage.removeItem("ShiitakeX");
	localStorage.removeItem("ShiitakeY");
	localStorage.removeItem('MovableShiitake');
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

function saveViewMode(){
	console.log("save viewmode");
	//NightMode
	if(NightMode.value){
		localStorage.setItem('NightMode', true);
	}else{
		localStorage.removeItem('NightMode');
	}

	//MoveLeft
	if(MoveLeft.value){
		localStorage.setItem("MoveLeft",true);
	}else{
		localStorage.removeItem("MoveLeft");
	}

	//MoveUp
	if(MoveUp.value){
		localStorage.setItem("MoveUp",true);
	}else{
		localStorage.removeItem("MoveUp");
	}

	//ImageViewer
	if(ImageViewer.value){
		localStorage.setItem('ImageViewer', true);
	}else{
		localStorage.removeItem('ImageViewer');
	}

	//LocalNotify
	if(LocalNotify.value){
		localStorage.setItem('LocalNotify', true);
	}else{
		localStorage.removeItem('LocalNotify');
	}

	//AlignChange
	if(AlignChange.value){
		localStorage.setItem('AlignChange', true);
	}else{
		localStorage.removeItem('AlignChange');
	}

	//MovableShiitake
	if(MovableShiitake.value){
		localStorage.setItem('MovableShiitake', true);
	}else{
		localStorage.removeItem('MovableShiitake');
	}

	//ShiitakeAlign
	localStorage.setItem('ShiitakeAlign', ShiitakeAlign.value);
}

function getInitialDataFromLocalStorage(){
	console.log("get viewmode");
	if(localStorage.getItem("NightMode") != undefined){
		NightMode.value = true;
	}else{
		NightMode.value = false;
	}

	if(localStorage.getItem("MoveLeft") != undefined){
		MoveLeft.value = true;
	}else{
		MoveLeft.value = false;
	}

	if(localStorage.getItem("MoveUp") != undefined){
		MoveUp.value = true;
	}else{
		MoveUp.value = false;
	}

	if(localStorage.getItem("ImageViewer") != undefined){
		ImageViewer.value = true;
	}else{
		ImageViewer.value = false;
	}

	if(localStorage.getItem("LocalNotify") != undefined){
		LocalNotify.value = true;
	}else{
		LocalNotify.value = false;
	}

	if(localStorage.getItem("AlignChange") != undefined){
		AlignChange.value = true;
	}else{
		AlignChange.value = false;
	}

	if(localStorage.getItem("ShiitakeX") != undefined){
		ShiitakeX.value = localStorage.getItem("ShiitakeX");
	}

	if(localStorage.getItem("ShiitakeY") != undefined){
		ShiitakeY.value = localStorage.getItem("ShiitakeY");
	}

	if(localStorage.getItem("MovableShiitake") != undefined){
		MovableShiitake.value = true;
	}else{
		MovableShiitake.value = false;
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

	if(localStorage.getItem("ChatEnabled") != undefined){
		ChatEnabled.value = true;
	}else{
		ChatEnabled.value = false;
	}
}

module.exports = {
	getInitialDataFromLocalStorage:getInitialDataFromLocalStorage,
	saveViewMode:saveViewMode,
    NightMode:NightMode,
	MoveLeft:MoveLeft,
	MoveUp:MoveUp,
	toggleNightMode:toggleNightMode,
	ImageViewer:ImageViewer,
	LocalNotify:LocalNotify,
	toggleLocalNotify:toggleLocalNotify,
	AlignChange:AlignChange,
	ShiitakeX:ShiitakeX,
	ShiitakeY:ShiitakeY,
	moveShiitake:moveShiitake,
	MovableShiitake:MovableShiitake,
	ShiitakeAlign:ShiitakeAlign,
	toggleShiitakeLeft:toggleShiitakeLeft,
	toggleShiitakeRight:toggleShiitakeRight,
	resetShiitake:resetShiitake,
	MyUsername:MyUsername,
	VTagText:VTagText,
	ChatEnabled:ChatEnabled,
}

var Observable = require("FuseJS/Observable");
var InterApp = require("FuseJS/InterApp");
var FileSystem = require("FuseJS/FileSystem");
var path = FileSystem.dataDirectory + "/" + "config.json";

var TagText = Observable("");
var VTagText = Observable("");
var NyaanText = Observable("にゃーん");

var ChatEnabled = Observable(false);

var _nyaan =  Observable(
	{ id : "にゃーん" 			, next: "わおーん"			, prev: "ω"				},
	{ id : "わおーん" 			, next: "ぱおーん"			, prev: "にゃーん"			},
	{ id : "ぱおーん" 			, next: "ひひーん"			, prev: "わおーん"			},
	{ id : "ひひーん" 			, next: "めぇぇー"			, prev: "ぱおーん"			},
	{ id : "めぇぇー" 			, next: "がるるー"			, prev: "ひひーん"			},
	{ id : "がるるー" 			, next: "ねこにうむ"		, prev: "めぇぇー"			},
	{ id : "ねこにうむ" 		, next: "ぽつねーん・・・"	, prev: "がるるー"			},
	{ id : "ぽつねーん・・・"	, next: "ω"				, prev: "ねこにうむ"		},
	{ id : "ω" 				, next: "にゃーん"			, prev: "ぽつねーん・・・"	}

);

function openInBrowser(){

	InterApp.launchUri("https://sns.gdgd.jp.net/");

}

function SaveTag(){

	localStorage.setItem("TagText",TagText.value);
	localStorage.setItem("NyaanText",NyaanText.value);
	localStorage.setItem("VTagText",VTagText.value);
}

function Logout(){

	FileSystem.writeTextToFile(path, "")
	.then(function(){
		console.log("#######################");
		console.log("ACCESS token deleted");
		console.log("#######################");
		localStorage.removeItem("MyUsername");
		localStorage.setItem("Logout",true);
		router.goto("SplashPage",null);
	});

}

function toggleNyaanLeft(){
	var _buf = "";
	_nyaan.forEach(function(n){
		if(n.id == NyaanText.value){
			_buf = n.prev;
		}
	});
	NyaanText.value = _buf;
	SaveTag();
}

function toggleNyaanRight(){
	var _buf = "";
	_nyaan.forEach(function(n){
		if(n.id == NyaanText.value){
			_buf = n.next;
		}
	});
	NyaanText.value = _buf;
	SaveTag();
}



if(localStorage.getItem("TagText") != undefined){
	TagText.value = localStorage.getItem("TagText");
}
if(localStorage.getItem("NyaanText") != undefined){
	NyaanText.value = localStorage.getItem("NyaanText");
}
if(localStorage.getItem("VTagText") != undefined){
	VTagText.value = localStorage.getItem("VTagText");
}
if(localStorage.getItem("ChatEnabled") != undefined){
	ChatEnabled.value = true;
}else{
	ChatEnabled.value = false;
}

function saveChatEnabled(){
	console.log("SaveChatEnabled");
	if(!ChatEnabled.value){
		localStorage.setItem("ChatEnabled", true);
		console.log("chatenabled is true");
	}else{
		localStorage.removeItem("ChatEnabled");
	}
}

module.exports = {
	openInBrowser:openInBrowser,
	SaveTag:SaveTag,
	TagText:TagText,
	Logout:Logout,
	NyaanText:NyaanText,
	toggleNyaanLeft:toggleNyaanLeft,
	toggleNyaanRight:toggleNyaanRight,
	VTagText:VTagText,
	ChatEnabled:ChatEnabled,
	saveChatEnabled:saveChatEnabled,
}

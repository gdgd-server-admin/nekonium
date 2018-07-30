var Observable = require("FuseJS/Observable");
var FileSystem = require("FuseJS/FileSystem");
var Storage         = require("FuseJS/Storage");
var cameraRoll = require("FuseJS/CameraRoll");
var camera = require("FuseJS/Camera");
var Base64 = require("FuseJS/Base64");
var Uploader = require("Uploader");

var path = FileSystem.dataDirectory + "/" + "config.json";
var ROOT_URL = "api/v1/";
var max_length = 500;

var PostText = Observable("");
var AppendText = Observable("");

var SpoilerText = Observable("");
var AvailCount = Observable(max_length);
var Visiblity = Observable("public");
var NSFW = Observable(false);
var MediaIds = Observable();
var PreviewURL = Observable("");
var IsPosting = Observable(false);
var IsUploading = Observable(false);
var replyToStatus = Observable();

function doPost(){

	//api.authenticate();

	if(PostText.value.length + AppendText.value.length > 0 && AvailCount.value >= 0){

		IsPosting.value = true;


		if(FileSystem.existsSync(path)){
			var config = JSON.parse("{}");
			config =  FileSystem.readTextFromFileSync(path);
			config = JSON.parse(config);

			var url = encodeURI(config.base_url + ROOT_URL + "statuses");

			var auth = 'Bearer ' + config.access_token;
			options = {
				body: {
					status: PostText.value + "\n" + AppendText.value,
					visibility: Visiblity.value
				},
				headers: { 'Authorization': auth }
			};
			if(SpoilerText.value != ""){
				options.body.spoiler_text = SpoilerText.value;
			}
			if(replyToStatus.length > 0){
				replyToStatus.forEach(function(item){
					options.body.in_reply_to_id = item.id;
				});
			}
			if(MediaIds.length > 0){
				var _ids = [];
				MediaIds.forEach(function(item){
					_ids.push(item.id);
				});
				options.body.media_ids = _ids;
				if(NSFW.value){
					options.body.sensitive = true;
				}
			}
			options = Object.assign({}, options, {
				method: "POST",
				body: JSON.stringify(options.body),
				headers: Object.assign({}, options.headers, {
					"Content-Type": "application/json"
				})
			});


			fetch(url, options)
			.then(function(response) {
				PostText.value = "";
				AppendText.value = "";
				AvailCount.value = max_length;
				SpoilerText.value = "";
				MediaIds.clear();
				PreviewURL.value = "";
				IsPosting.value = false;
				replyToStatus.clear();
				router.goBack();
			});
		}
	}
}

function countText(){
	AvailCount.value = max_length - PostText.value.length - AppendText.value.length - 1;
}

function changeVisiblity(){
	switch(Visiblity.value){
		case "public":
		Visiblity.value = "unlisted";
		break;
		case "unlisted":
		Visiblity.value = "private";
		break;
		case "private":
		Visiblity.value = "direct";
		break;
		case "direct":
		Visiblity.value = "public";
		break;
	}
}

function takePhoto(){

	camera.takePicture(1280, 960)
	.then(function(image) {
		IsUploading.value = true;

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
		MediaIds.forEach(function(item){
			if(MediaIds.length > 3){
				MediaIds.remove(item);
			}
		});
		MediaIds.add(JSON.parse(res));
		IsUploading.value = false;
	}, function(error) {
		// Will called if an error occurred.
	});
}
function choosePhoto(){

	cameraRoll.getImage()
	.then(function(image) {
		IsUploading.value = true;
		// Will be called if the user successfully selected an image.

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
	}, function(error) {
		// Will be called if the user aborted the selection or if an error occurred.
	})
	.then(function(res){
		MediaIds.forEach(function(item){
			if(MediaIds.length > 3){
				MediaIds.remove(item);
			}
		});
		MediaIds.add(JSON.parse(res));
		IsUploading.value = false;
	});
}

function changeNSFW(){

	if(NSFW.value){
		NSFW.value = false;
	}else{
		NSFW.value = true;
	}
}

function deleteMediaIds(){
	MediaIds.clear();
}

function onGained(){
	if(localStorage.getItem("ReplyTo") != undefined){

		replyToStatus.clear();
		var reply_to = JSON.parse(localStorage.getItem("ReplyTo"));

		PostText.value = "@" + reply_to.account.acct + " ";
		Visiblity.value = reply_to.visibility;
		replyToStatus.add(reply_to);
		localStorage.removeItem("ReplyTo");

	}
	if(localStorage.getItem("shareNezumiResult") != undefined){
		replyToStatus.clear();
		PostText.value = localStorage.getItem("shareNezumiResult");
		AppendText.value = "#ねずみはっしんガチャ";
		Visiblity.value = "public";
		localStorage.removeItem("shareNezumiResult");
	}

	if(localStorage.getItem("quickNekonium") != undefined){
		var tagname = "ねこにうむ";
		if(localStorage.getItem("TagText") != undefined){
			ttmp = localStorage.getItem("TagText");
			if(ttmp != ""){
				tagname = ttmp.replace("#","");
			}
		}
		MediaIds.add(JSON.parse(localStorage.getItem("quickNekonium")));
		AppendText.value = "#" + tagname;
		localStorage.removeItem("quickNekonium");
		countText();

	}
}

function removeReply(){

	replyToStatus.clear();
}

module.exports = {
	PostText: PostText,
	AvailCount: AvailCount,
	doPost: doPost,
	countText: countText,
	changeVisiblity:changeVisiblity,
	Visiblity:Visiblity,
	takePhoto:takePhoto,
	choosePhoto:choosePhoto,
	SpoilerText:SpoilerText,
	MediaIds:MediaIds,
	NSFW:NSFW,
	changeNSFW:changeNSFW,
	deleteMediaIds:deleteMediaIds,
	IsPosting:IsPosting,
	onGained:onGained,
	IsUploading:IsUploading,
	replyToStatus:replyToStatus,
	removeReply:removeReply,
	AppendText:AppendText
}

var api = require("Assets/js/api");
var Observable = require("FuseJS/Observable");
var cameraRoll = require("FuseJS/CameraRoll");
var FileSystem = require("FuseJS/FileSystem");
var Storage = require("FuseJS/Storage");
var Base64 = require("FuseJS/Base64");
var Uploader = require("Uploader");

var ROOT_URL = "api/v1/";
var path = FileSystem.dataDirectory + "/" + "config.json";

var DisplayName = Observable("");
var Note = Observable("");
var Avatar = Observable("");
var MyProf = Observable("");


function GetProf(){
	console.log("getProf");
	api.get_profile()
		.then((data) => {
			console.log(data);
			var res = JSON.parse(data);
			DisplayName.value = res.display_name;
			var buf = res.note.replace(/<\/p>/g,"");
			buf = buf.replace(/<p>/g,"");
			buf = buf.replace(/<br \/>/g,"\n")
			buf = buf.replace(/<br>/g,"\n");
			buf = buf.replace(/<a(?: .+?)?>/g,"");
			buf = buf.replace(/<\/a>/g,"");
			buf = buf.replace(/<span(?: .+?)?>/g,"");
			buf = buf.replace(/<\/span>/g,"");
			Note.value = buf;
			MyProf.value = res;
		});
	
}

function chooseAvater(){
	var options = {display_name: DisplayName.value, note: Note.value};
	
	api.update_profile(options)
		.then((data) => {
			cameraRoll.getImage()
		    .then(function(image) {
		    	//TODO Upload
		    	var config = JSON.parse("{}");
				config =  FileSystem.readTextFromFileSync(path);
				config = JSON.parse(config);
				console.log("loadConfig");

			    var url = encodeURI(config.base_url + ROOT_URL + "accounts/update_credentials");
		    	return Uploader.avatar(
					image.path,
					url,
					config.access_token
				);
		    	
		    }).then(function(result){
		    	console.log(result);
		    	GetProf();
		    });
		});
	

}

function chooseHeaderimg(){
	var options = {display_name: DisplayName.value, note: Note.value};
	
	api.update_profile(options)
		.then((data) => {
			cameraRoll.getImage()
		    .then(function(image) {
		    	//TODO Upload
		    	var config = JSON.parse("{}");
				config =  FileSystem.readTextFromFileSync(path);
				config = JSON.parse(config);
				console.log("loadConfig");

			    var url = encodeURI(config.base_url + ROOT_URL + "accounts/update_credentials");
		    	return Uploader.headerimg(
					image.path,
					url,
					config.access_token
				);
		    	
		    }).then(function(result){
		    	console.log(result);
		    	GetProf();
		    });
		});
	

}

function UpdateProf(){
	console.log("updateProf");
	console.log(DisplayName.value);
	console.log(Note.value);
	console.log(Avatar.value);
	
	var options = {display_name: DisplayName.value, note: Note.value};
	
	api.update_profile(options)
		.then((data) => {
			router.goBack();
		});
}

module.exports = {
	GetProf:GetProf,
	DisplayName:DisplayName,
	Note:Note,
	UpdateProf:UpdateProf,
	chooseAvater:chooseAvater,
	chooseHeaderimg:chooseHeaderimg,
	MyProf:MyProf,
}
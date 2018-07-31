var Observable = require('FuseJS/Observable');
var FileSystem = require("FuseJS/FileSystem");
var path = FileSystem.dataDirectory + "/" + "config.json";
var AccessToken = false;

function checkLogin(){
	if(FileSystem.existsSync(path)){
		var content =  FileSystem.readTextFromFileSync(path);
		if(content != ""){
			content = JSON.parse(content);
			AccessToken = content.auth_token;
			if ( AccessToken !== undefined && content.base_url != undefined){
				router.goto("HomeView");
				return;
			}	
		}
	}
	router.goto("LoginView");	
}
checkLogin();
module.exports = {
	checkLogin:checkLogin
}
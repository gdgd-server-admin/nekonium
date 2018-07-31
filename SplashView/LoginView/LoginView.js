var Observable = require('FuseJS/Observable');
var FileSystem = require("FuseJS/FileSystem");
var path = FileSystem.dataDirectory + "/" + "config.json";

var REDIRECT_URI = "nekonium://oauth.callback/";


var CLIENT_ID = Observable( '' );
var CLIENT_SECRET = Observable( '' );
var BASE_URL = Observable( 'https://pleroma.gdgd.jp.net/' );
var api = require("Assets/js/api");
isCallbackSet = false;

function buttonClicked( ) {

	var url = BASE_URL.value + "api/v1/apps";
	var options = {
		body:{
		client_name: "nekonium",
		redirect_uris: REDIRECT_URI,
		scopes: "write read follow"

		}
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
			return response.json();
		})
		.then(function(json){
			CLIENT_ID.value = json.client_id
			CLIENT_SECRET.value = json.client_secret;
			console.log(JSON.stringify(json));
			//InterApp.launchUri(oAuthUri.value);
			var config = JSON.parse("{}");
			//if(FileSystem.existsSync(path)){
			//	config =  FileSystem.readTextFromFileSync(path);
			//	config = JSON.parse(config);
			//}
			//config.base_url = BASE_URL.value;
			config.client_id = CLIENT_ID.value;
			config.client_secret = CLIENT_SECRET.value;
			//config.access_token = ?

			FileSystem.writeTextToFileSync(path, JSON.stringify(config));
			button2Clicked();
		});
}
function button2Clicked() {

	var authUri = BASE_URL.value + "oauth/authorize"
    + "?redirect_uri=" + encodeURIComponent(REDIRECT_URI)
    + "&client_id=" + CLIENT_ID.value
    + "&scope=read+write+follow"
    + "&response_type=code";

var InterApp = require("FuseJS/InterApp");

InterApp.on('receivedUri', function(uri) {

		    /*
		    var query = parseUriFragment(uri);
		    var accessToken = query.access_token;
			*/
			console.log(uri);
		    //
		    // Here, save the access token and use it for further requests.
		    //
		    var config = JSON.parse("{}");
			if(FileSystem.existsSync(path)){
				config =  FileSystem.readTextFromFileSync(path);
				config = JSON.parse(config);
			}
			config.auth_token = uri.replace('nekonium://oauth.callback/?code=',"").split('&')[0];
			console.log(uri.replace('nekonium://oauth.callback/?code=',"").split('&')[0]);



			console.log("getAccesstoken");

			var url = BASE_URL.value + "oauth/token";
			console.log(url);
			var options = {
				body:{
					client_id: config.client_id,
					client_secret: config.client_secret,
					redirect_uri: REDIRECT_URI,
					grant_type: 'authorization_code',
					code: config.auth_token
				}
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
				console.log("test");
				console.dir(response);
				return response.json();
			})
			.then(function(json){

				console.log(JSON.stringify(json));

				if(json.access_token != undefined){
					config.access_token = json.access_token;
					config.base_url = BASE_URL.value;
					FileSystem.writeTextToFile(path, JSON.stringify(config))
					.then(function(){
						console.log("#######################");
						console.log("ACCESS token saved");
						console.log("#######################");
						localStorage.removeItem("Logout");
						router.goto("HomeView",null);
					});

				}else{
					console.log("no access token");
					//router.goto("LoginView",null);
				}

			});



		});
	InterApp.launchUri(authUri);
}

module.exports = {
	buttonClicked: buttonClicked,
	button2Clicked:button2Clicked,
	BASE_URL:BASE_URL
}

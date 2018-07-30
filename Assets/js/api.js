var FileSystem = require("FuseJS/FileSystem");
var Storage = require("FuseJS/Storage");
var path = FileSystem.dataDirectory + "/" + "config.json";
var ROOT_URL = "api/v1/";

var helper = require("Assets/js/helper");
var emojione = require("Assets/js/emojione");
var he = require("Assets/js/he");
var Base64 = require("FuseJS/Base64");
var moment = require("Assets/js/moment-with-locales");
moment.locale("ja");

var deviceToast = require("deviceToast");


function get_userinfo(account){

	return new Promise( function( resolve, reject ) {


		var config = JSON.parse("{}");
		config =  FileSystem.readTextFromFileSync(path);
		config = JSON.parse(config);

		var url = encodeURI(config.base_url + ROOT_URL + "accounts/relationships?id=" + account.id);

		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "GET",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {

			return  response.json();

		}).then(function(json){

			var result = account;
			result.note = html_to_plain(result.note);
			result.relationship = json[0];
			console.log("####################################");
			console.log(result.relationship.following);
			console.log("####################################");
			if(JSON.stringify(result.relationship.following).toLowerCase().indexOf("true") >= 0){
				console.log("trueに変換する");
				result.relationship.following = true;
			}
			console.log("####################################");
			console.log(result.relationship.following);
			console.log("####################################");
			resolve(JSON.stringify(result));

		});
	});

}

function html_to_plain(html){
	/*
	var result = html;

	result = result.replace(/&lt;/gm,"<").replace(/&gt;/gm,">");
	result = result.replace(/&amp;/gm,"&");


	return result;
	*/
	var result = he.decode(html);
	result = he.unescape(result);
	try{
		result = emojione.shortnameToUnicode(result);
	}catch(e){
		console.log("emojione convert error");
	}
	result = result.replace(/<br \/>/gm,"\n").replace(/<(?:.|\n)*?>/gm, '');


	return result;
}

function normalize_json(json){
	var result = json;

	result.forEach(function(val){

		var tmp = normalize_status(val);
		if(val.reblog != null){
			tmp.reblog = normalize_status(val.reblog);
		}
		return tmp;
	});

	return result;
}

function check_extern_url(linktag){
	if(linktag.indexOf('class="mention hashtag"') == -1 &&
	linktag.indexOf('>#<') == -1 &&
	linktag.indexOf('class="mention"') == -1 &&
	linktag.indexOf('class="hashtag"') == -1 &&
	linktag.indexOf('>@<') == -1
){
	var tmpurl = linktag.replace("<a href=","").split("\"")[1].replace(/"/gm,"");
	return tmpurl;
}else{
	return null;
}
}

function normalize_status(status){

	var result = status;

	if(result.account.display_name == ""){
		result.account.display_name = result.account.username;
	}
	result.account.display_name = html_to_plain(result.account.display_name);

/*
	try{
		var urlintext = helper.getUrisFromText(result.content);
		if(urlintext != null){
			for(i=0;i<urlintext.length;i++){
				var tmpurl = check_extern_url(urlintext[i]);
				if(tmpurl != null){
					result.extenurl = tmpurl;
					break;
				}
			}
		}
	}catch (e){
		//console.log("content cant parse using helper");
	}
*/
	//result.contentb = html_to_object(result.content);
	result.content = html_to_plain(result.content);

	if(result.reblogged == null){
		result.reblogged = false;
	}
	if(result.favourited == null){
		result.favourited = false;
	}

	try{
		result.timestamp = moment(result.created_at).format('L LT');
	}catch(e){
		result.timestamp = result.created_at;
	}

	return result;
}

function get_timeline(uri) {

	// Fetch the resource and parse the response as JSON
	return new Promise( function( resolve, reject ) {


		var config = JSON.parse("{}");
		config =  FileSystem.readTextFromFileSync(path);
		config = JSON.parse(config);

		var url = encodeURI(config.base_url + ROOT_URL + uri);


		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "GET",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {

			return  response.json();

		}).then(function(json){

			resolve(normalize_json(json));

		});
	});
}

function get_notification() {

	// Fetch the resource and parse the response as JSON
	return new Promise( function( resolve, reject ) {


		var config = JSON.parse("{}");
		config =  FileSystem.readTextFromFileSync(path);
		config = JSON.parse(config);

		var url = encodeURI(config.base_url + ROOT_URL + "notifications");


		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "GET",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {

			return  response.json();

		}).then(function(json){

			var result = json;
			result.forEach(function(val){

				var tmp = val;

				if(val.account.display_name == ""){
					val.account.display_name = val.account.username;
				}

				if(val.status != null){
					val.status = normalize_status(val.status);
					if(val.status.reblog != null){
						val.status.reblog = normalize_status(val.status.reblog);
					}
				}

				try{
					val.timestamp = moment(val.created_at).format('L LT');
				}catch(e){
					val.timestamp = val.created_at;
				}

				return tmp;
			});

			resolve(result);

		});
	});
}

function boost_status(status){

	var config = JSON.parse("{}");
	config =  FileSystem.readTextFromFileSync(path);
	config = JSON.parse(config);
	// Fetch the resource and parse the response as JSON

	var url = encodeURI(config.base_url + ROOT_URL + "statuses/" + status.id + "/");
	if(status.reblogged){
		url = url + "unreblog";
	}else{
		url = url + "reblog";
	}

	return new Promise( function( resolve, reject ) {

		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "POST",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {
			return  response.json();
		}).then(function(json){

			if(status.reblogged){
				deviceToast.ToastIt("かくさんはなしでうｓ");
			}else{
				deviceToast.ToastIt("かっくさーん！");
			}

			resolve(0);

		});
	});

}

function favourite_status(status){


	var config = JSON.parse("{}");
	config =  FileSystem.readTextFromFileSync(path);
	config = JSON.parse(config);
	// Fetch the resource and parse the response as JSON
	var url = encodeURI(config.base_url + ROOT_URL + "statuses/" + status.id + "/");
	if(status.favourited){
		url = url + "unfavourite";
	}else{
		url = url + "favourite";
	}

	return new Promise( function( resolve, reject ) {

		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "POST",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {
			return  response.json();
		}).then(function(json){

			if(status.favourited){
				deviceToast.ToastIt("ふぁぼやめた");
			}else{
				deviceToast.ToastIt("ふぁぼった！");
			}

			resolve(0);

		});
	});

}

function delete_status(status){

	var config = JSON.parse("{}");
	config =  FileSystem.readTextFromFileSync(path);
	config = JSON.parse(config);
	// Fetch the resource and parse the response as JSON

	var url = encodeURI(config.base_url + ROOT_URL + "statuses/" + status.id);

	return new Promise( function( resolve, reject ) {

		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "DELETE",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {
			return  response.json();
		}).then(function(json){

			resolve(0);

		});
	});

}

function report_status(accountid,statusid,comment){

	var tmp = comment == "" ? "理由未入力" : comment;

	var config = JSON.parse("{}");
	config =  FileSystem.readTextFromFileSync(path);
	config = JSON.parse(config);
	// Fetch the resource and parse the response as JSON

	var url = encodeURI(config.base_url + ROOT_URL + "reports");

	return new Promise( function( resolve, reject ) {
		var auth = 'Bearer ' + config.access_token;

		body = {
			"account_id": accountid,
			"status_ids": statusid,
			"comment": tmp
		};
		options = {
			method: "POST",
			headers: {
				'Authorization': auth,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		};


		fetch(url, options)
		.then(function(response) {
			return  response.json();
		}).then(function(json){

			resolve(0);

		});
	});

}

function action_to_account(account,action){


	var config = JSON.parse("{}");
	config =  FileSystem.readTextFromFileSync(path);
	config = JSON.parse(config);
	// Fetch the resource and parse the response as JSON

	var url = encodeURI(config.base_url + ROOT_URL + "accounts/" + account.id + "/" + action);


	return new Promise( function( resolve, reject ) {

		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "POST",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {
			return  response.json();
		}).then(function(json){

			resolve(0);

		});
	});

}

function get_notification_message(notification){

	//One of: "mention", "reblog", "favourite", "follow"
	var display_name = notification.account.display_name;
	if(display_name == null || display_name == ""){
		display_name = notification.account.acct;
	}
	display_name = emojione.shortnameToUnicode(display_name);

	switch(notification.type){
		case "mention":
		return display_name + "からメンションが来た";
		break;
		case "reblog":
		return display_name + "がトゥートをブースト";
		break;
		case "favourite":
		return display_name + "がトゥートをお気に入り登録";
		break;
		case "follow":
		return display_name + "にフォローされた";
		break;
	}

	return "";
}

function get_notification_detail(notification){

	switch(notification.type){
		case "mention":
		var status = normalize_status(notification.status);
		//console.log(status.content);
		return status.content;
		break;
		case "reblog":
		var status = normalize_status(notification.status);
		return status.content;
		break;
		case "favourite":
		var status = normalize_status(notification.status);
		return status.content;
		break;
		case "follow":
		return "";
		break;
	}

	return "";

}

function get_profile(){

	return new Promise( function( resolve, reject ) {


		var config = JSON.parse("{}");
		config =  FileSystem.readTextFromFileSync(path);
		config = JSON.parse(config);

		var url = encodeURI(config.base_url + ROOT_URL + "accounts/verify_credentials");

		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "GET",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {
			//console.log("get_profile");
			return  response.json();

		}).then(function(json){

			resolve(JSON.stringify(json));

		});
	});

}
function update_profile(args){

	return new Promise( function( resolve, reject ) {


		var config = JSON.parse("{}");
		config =  FileSystem.readTextFromFileSync(path);
		config = JSON.parse(config);

		var url = encodeURI(config.base_url + ROOT_URL + "accounts/update_credentials");

		var auth = 'Bearer ' + config.access_token;

		var body = "display_name=" + args.display_name + "&note=" + args.note;
		if(args.avatar != undefined){
			body = body + "&avatar=" + args.avatar;
		}
		//console.log(body);
		options = {
			method: "PATCH",
			headers: { 'Authorization': auth,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: body
	};



	fetch(url, options)
	.then(function(response) {
		//console.log("update_profile");
		return  response.json();

	}).then(function(json){

		resolve(JSON.stringify(json));

	});
});

}

function get_search_result(query){

	return new Promise( function( resolve, reject ) {


		var config = JSON.parse("{}");
		config =  FileSystem.readTextFromFileSync(path);
		config = JSON.parse(config);

		var url = encodeURI(config.base_url + ROOT_URL + "search?resolve=true&q=" + query);

		var auth = 'Bearer ' + config.access_token;
		options = {
			method: "GET",
			headers: { 'Authorization': auth }
		};


		fetch(url, options)
		.then(function(response) {
			//console.log("get_profile");
			return  response.json();

		}).then(function(json){

			resolve(normalize_json(json.statuses));

		});
	});

}


module.exports = {
	// html_to_object:html_to_object,
	html_to_plain:html_to_plain,
	normalize_json:normalize_json,
	normalize_status:normalize_status,
	get_timeline:get_timeline,
	boost_status:boost_status,
	favourite_status:favourite_status,
	action_to_account:action_to_account,
	get_notification_message:get_notification_message,
	get_notification_detail:get_notification_detail,
	get_notification:get_notification,
	get_userinfo:get_userinfo,
	get_profile:get_profile,
	update_profile:update_profile,
	delete_status:delete_status,
	report_status:report_status,
	get_search_result:get_search_result,
}

/*
function html_to_object(shtml){
	var decordedhtml = he.decode(shtml);
	decordedhtml = he.unescape(decordedhtml);

	decordedhtml = decordedhtml.replace(/<\/p>/g,"<br>");
	decordedhtml = decordedhtml.replace(/<br \/>/g,"<br>");
	decordedhtml = decordedhtml.replace(/<br\/>/g,"<br>");
	var result = decordedhtml.split("<br>");
	var buf = [];
	result.forEach(function(row){

		try{
			var tmp = he.decode(row);
			var _t = {};
			tmp = he.unescape(tmp);

			tmp = emojione.shortnameToUnicode(tmp);

			tmp = tmp.replace(/<p>/g,"");
			var link = /<a(?: .+?)?>/g;
			tmp = tmp.replace(link,"");
			tmp = tmp.replace(/<\/a>/g,"");
			var span = /<span(?: .+?)?>/g;
			tmp = tmp.replace(span,"");
			tmp = tmp.replace(/<\/span>/g,"");
			//アンケート対応
			tmp = tmp.replace("├ 1.","1.");
			tmp = tmp.replace("├ 2.","2.");
			tmp = tmp.replace("├ 3.","3.");
			tmp = tmp.replace("├ 4.","4.");
			tmp = tmp.replace("└ 2.","2.");
			tmp = tmp.replace("└ 3.","3.");
			tmp = tmp.replace("└ 4.","4.");
			tmp = tmp.replace("└ 5.","5.");

			if(tmp.indexOf("｜ □□□□□ ") >= 0){
				tmp = tmp.replace("｜ □□□□□ ","");
				_t.percent = "0%";
				_t.percentstyle = "z";
			}
			else if(tmp.indexOf("｜ ■□□□□ ") >= 0){
				tmp = tmp.replace("｜ ■□□□□ ","");
				_t.percent = "20%";
				_t.percentstyle = "a";
			}
			else if(tmp.indexOf("｜ ■■□□□ ") >= 0){
				tmp = tmp.replace("｜ ■■□□□ ","");
				_t.percent = "40%";
				_t.percentstyle = "b";
			}
			else if(tmp.indexOf("｜ ■■■□□ ") >= 0){
				tmp = tmp.replace("｜ ■■■□□ ","");
				_t.percent = "60%";
				_t.percentstyle = "c";
			}
			else if(tmp.indexOf("｜ ■■■■□ ") >= 0){
				tmp = tmp.replace("｜ ■■■■□ ","");
				_t.percent = "80%";
				_t.percentstyle = "d";
			}
			else if(tmp.indexOf("｜ ■■■■■ ") >= 0){
				tmp = tmp.replace("｜ ■■■■■ ","");
				_t.percent = "100%";
				_t.percentstyle = "e";
			}
			else if(tmp.indexOf("　 □□□□□ ") >= 0){
				tmp = tmp.replace("　 □□□□□ ","");
				_t.percent = "0%";
			}
			else if(tmp.indexOf("　 ■□□□□ ") >= 0){
				tmp = tmp.replace("　 ■□□□□ ","");
				_t.percent = "20%";
				_t.percentstyle = "a";
			}
			else if(tmp.indexOf("　 ■■□□□ ") >= 0){
				tmp = tmp.replace("　 ■■□□□ ","");
				_t.percent = "40%";
				_t.percentstyle = "b";
			}
			else if(tmp.indexOf("　 ■■■□□ ") >= 0){
				tmp = tmp.replace("　 ■■■□□ ","");
				_t.percent = "60%";
				_t.percentstyle = "c";
			}
			else if(tmp.indexOf("　 ■■■■□ ") >= 0){
				tmp = tmp.replace("　 ■■■■□ ","");
				_t.percent = "80%";
				_t.percentstyle = "d";
			}
			else if(tmp.indexOf("　 ■■■■■ ") >= 0){
				tmp = tmp.replace("　 ■■■■■ ","");
				_t.percent = "100%";
				_t.percentstyle = "e";
			}
			else {
				_t.percent = "";
			}
			_t.value = tmp;
			buf.push(_t);
		}catch(e){
			console.log("emojione convert error");
		}

	});
	return buf;
}
*/

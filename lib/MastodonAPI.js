import ConfigFile from 'lib/ConfigFile';
import Helper from 'lib/Helper';

export default class MastodonAPI {
	constructor(){
		this.ConfigFile = new ConfigFile();
		this.Helper = new Helper();
	}

	getTimeLine(base_url,uri,access_token){
		return new Promise((resolve,reject) => {
			var url = base_url + uri;
			var options = this.Helper.makeFetchOption('GET',access_token);

			fetch(url,options)
				.then(response => {
					if(response.ok){
						return response.json();
					}else{
						reject(1);
					}
				})
				.then(json => {
					resolve(json);
				});
		});
	}

	login(base_url){
		return new Promise((resolve,reject) => {

			const REDIRECT_URI = 'nekonium://oauth.callback/';
			const InterApp = require('FuseJS/InterApp');

			// ClientIDを取得
			let url = base_url + 'api/v1/apps';
			let body = {
				client_name: 'nekonium',
				redirect_uris: REDIRECT_URI,
				scopes: 'write read follow'
			};
			let options = this.Helper.makeFetchOption('POST','','application/json',body);

			fetch(url, options)
				.then(response => {
					return response.json();
				})
				.then(json => {

					this.ConfigFile.loadConfigFromFile();
					this.ConfigFile.account.client_id = json.client_id;
					this.ConfigFile.account.client_secret = json.client_secret;
					this.ConfigFile.saveConfigToFile();

					let authUri = base_url + 'oauth/authorize'
          + '?redirect_uri=' + encodeURIComponent(REDIRECT_URI)
          + '&client_id=' + this.ConfigFile.account.client_id
          + '&scope=read+write+follow'
          + '&response_type=code';

					// InterAppにUriを受け取ったときに「1回だけ反応」してもらう。
					// on(EventName,func())だと多重で反応するようになる
					InterApp.once('receivedUri', uri => {

						this.ConfigFile.loadConfigFromFile();
						this.ConfigFile.account.auth_token = uri.replace('nekonium://oauth.callback/?code=','').split('&')[0];
						this.ConfigFile.saveConfigToFile();

						// アクセストークンを取得する
						let url = base_url + 'oauth/token';
						let body = {
							client_id: this.ConfigFile.account.client_id,
							client_secret: this.ConfigFile.account.client_secret,
							redirect_uri: REDIRECT_URI,
							grant_type: 'authorization_code',
							code: this.ConfigFile.account.auth_token
						};
						let options = this.Helper.makeFetchOption('POST','','application/json',body);
						fetch(url, options)
							.then(response => {
								return response.json();
							})
							.then(json => {
								if(json.access_token != undefined){
									// アクセストークンが取得できた
									this.ConfigFile.loadConfigFromFile();
									this.ConfigFile.account.access_token = json.access_token;
									this.ConfigFile.account.base_url = base_url;
									this.ConfigFile.saveConfigToFile();
									resolve(json.access_token);
								}else{
									reject('access_token not found');
								}
							});

					});
					// ブラウザを開いて認証する
					InterApp.launchUri(authUri);
				});

		});
	}

	favoriteStatus(base_url,access_token,id,favourited){

		return new Promise((resolve,reject) => {

			if(favourited){
				// unfavourite
				let url = encodeURI(base_url + 'api/v1/statuses/' + id + '/unfavourite');
				let options = this.Helper.makeFetchOption('POST',access_token);
				fetch(url,options)
					.then(result => {
						if(result.ok){
							resolve(0);
						}else{
							reject(1);
						}
					});
			}else{
				// favourite
				let url = encodeURI(base_url + 'api/v1/statuses/' + id + '/favourite');
				let options = this.Helper.makeFetchOption('POST',access_token);
				fetch(url,options)
					.then(result => {
						if(result.ok){
							resolve(0);
						}else{
							reject(1);
						}
					});
			}
		});
	}

	boostStatus(base_url,access_token,id,reblogged){
		return new Promise((resolve,reject) => {

			if(reblogged){
				// unreblog
				let url = encodeURI(base_url + 'api/v1/statuses/' + id + '/unreblog');
				let options = this.Helper.makeFetchOption('POST',access_token);
				fetch(url,options)
					.then(result => {
						if(result.ok){
							resolve(0);
						}else{
							reject(1);
						}
					});
			}else{
				// reblog
				let url = encodeURI(base_url + 'api/v1/statuses/' + id + '/reblog');
				let options = this.Helper.makeFetchOption('POST',access_token);
				fetch(url,options)
					.then(result => {
						if(result.ok){
							resolve(0);
						}else{
							reject(1);
						}
					});
			}
		});
	}

	postStatus(base_url,access_token,status,in_reply_to_id,media_ids,sensitive,spoiler_text,visiblity){

		return new Promise((resolve,reject) => {
			var body = {
				'status': status,
				'visiblity': visiblity
			};
			if(in_reply_to_id != ''){
				body.in_reply_to_id = in_reply_to_id;
			}
			if(media_ids.length > 0){
				body.media_ids = media_ids;
			}
			if(sensitive){
				body.sensitive = 'true';
			}
			if(spoiler_text != ''){
				body.spoiler_text = spoiler_text;
			}

			const url = encodeURI(base_url +'api/v1/statuses');
			const options = this.Helper.makeFetchOption('POST',access_token,'application/json',body);

			fetch(url, options)
				.then(result => {
					if(result.ok){
						resolve('投稿しました！');
					}else{
						reject('なんか失敗した');
					}
				});
		});
	}

	uploadFile(base_url,access_token,image_path){

		const Uploader = require('Uploader');
		const url = encodeURI(base_url +'api/v1/media');

		return Uploader.send(
			image_path,
			url,
			access_token
		);
	}

	getRelationship(base_url,access_token,id){
		return new Promise((resolve,reject) => {
			const url = encodeURI(base_url + 'api/v1/accounts/relationships?id=' + id);
			const options = this.Helper.makeFetchOption('GET',access_token);
			fetch(url,options)
				.then((response) => {
					if(response.ok){
						return response.json();
					}else{
						reject(1);
					}
				})
				.then((json) => {
					let result = json[0];
					resolve(result);
				});
		});
	}

	accountAction(base_url,access_token,id,action_name){
		return new Promise((resolve,reject) => {
			const url = encodeURI(base_url + 'api/v1/accounts/' + id + '/' + action_name);
			const options = this.Helper.makeFetchOption('POST',access_token);
			fetch(url,options)
				.then((response) => {
					if(response.ok){
						return response.json();
					}else{
						reject(1);
					}
				})
				.then((json) => {
					resolve(json);
				});
		});
	}

	verifyCredentials(base_url,access_token){
		return new Promise((resolve,reject) => {
			const url = encodeURI(base_url + 'api/v1/accounts/verify_credentials');
			const options = this.Helper.makeFetchOption('GET',access_token);
			fetch(url,options)
				.then((response) => {
					if(response.ok){
						return response.json();
					}else{
						reject(1);
					}
				})
				.then((json) => {
					resolve(json);
				});
		});
	}
}

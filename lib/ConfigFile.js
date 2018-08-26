import MastodonAPI from 'lib/MastodonAPI';

export default class ConfigFile {
	constructor(){
		this.account = { // アカウント情報
			'base_url': 'https://pleroma.gdgd.jp.net/',
			'access_token': '',
			'id': '',
		};

		this.settings = { // 各種設定
			'nightmode': false,
			'localnotify': false,
			'pleromachat': false,
			'default_tag': 'ねこにうむ',
			'shake': false,
			'shake_text': 'にゃーん',
		};

		this.settings.timeline = { // TLの表示・非表示
			'favorite' : true,
			'notification': true,
			'local': true,
			'public': true,
			'default_tag': true,
		};

		this.settings.toot = { // トゥートの表示方法
			'imageviewer': false,
			'simple' : false,
		};

	}

	loadConfigFromFile(){

		const FileSystem = require('FuseJS/FileSystem');
		let path = FileSystem.dataDirectory + '/' + 'config.json';
		if(FileSystem.existsSync(path)){
			let config =  FileSystem.readTextFromFileSync(path);

			let json = JSON.parse(config);

			if(json.account != undefined){
				this.account = json.account;
			}
			if(json.settings != undefined){
				this.settings = json.settings;
			}

		}
	}

	saveConfigToFile(){

		let conf = {};
		conf.account = this.account;
		conf.settings = this.settings;

		const FileSystem = require('FuseJS/FileSystem');
		let path = FileSystem.dataDirectory + '/' + 'config.json';
		let target = JSON.stringify(conf);

		FileSystem.writeTextToFileSync(path, target);
	}

	migrateConfig(){
		if(this.account.access_token != ''){
			if(this.account.id == undefined || this.account.id == ''){
				// 自分自身のＩＤを保存していないので保存する
				let mstdn = new MastodonAPI();
				mstdn.verifyCredentials(this.account.base_url,this.account.access_token)
					.then(result => {
						this.account.id = result.id;
					});
			}
			if(this.settings.timeline == undefined){
				this.settings.timeline = { // TLの表示・非表示
					'favorite' : true,
					'notification': true,
					'local': true,
					'public': true,
					'default_tag': true,
				};
			}
			if(this.settings.toot == undefined){
				this.settings.toot = { // トゥートの表示方法
					'imageviewer': false,
					'simple' : false,
				};
			}
			this.saveConfigToFile();
		}
	}
}

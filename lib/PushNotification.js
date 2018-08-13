import ConfigFile from 'lib/ConfigFile';

var LocalNotify = require('FuseJS/LocalNotifications');

export default class PushNotification {
	constructor(){

		const cfg = new ConfigFile();
		cfg.loadConfigFromFile();

		this.notify = null;

		if(cfg.account.access_token != '' && cfg.settings.localnotify){

			let streaminguri = 'api/v1/streaming/?stream=user&access_token=';
			let url = cfg.account.base_url.replace('http','ws') + streaminguri + cfg.account.access_token;
			this.notify = new WebSocket(url);
			this.notify.onopen = (() => {

			});
			this.notify.onerror = (() => {
				try {
					this.notify.close();
				} catch (e) {
					this.notify = null;
				}
			});
			this.notify.onmessage = ((e) => {
				var recvdata = JSON.parse(e.data);
				try {
					if(recvdata.event == 'notification'){

						var payload = JSON.parse(recvdata.payload);

						const helper = new Helper();

						payload.created_at = helper.formatTimestamp(payload.created_at);
						if(payload.status != undefined){
							payload.status.content = helper.convertHTMLToPlain(payload.status.content);
							payload.status.created_at = helper.formatTimestamp(payload.status.created_at);
						}

						var summary = '';
						var detail = '';
						switch(payload.type){
						case 'mention':
							summary = payload.account.display_name + 'からメンションが来た';
							detail = payload.status.content;
							break;
						case 'reblog':
							summary = payload.account.display_name + 'がトゥートをブースト';
							detail = payload.status.content;
							break;
						case 'favourite':
							summary = payload.account.display_name + 'がトゥートをお気に入り登録';
							detail = payload.status.content;
							break;
						case 'follow':
							summary = payload.account.display_name + 'にフォローされた';
							break;
						}

						LocalNotify.now('nekonium',summary,detail,true);

					}
				} catch (err) {
					recvdata = null;
				}
			});
		}
	}
}

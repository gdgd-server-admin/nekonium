import Helper from 'lib/Helper';
import ConfigFile from 'lib/ConfigFile';

export default class PleromaAPI{
	constructor(){
		this.Helper = new Helper();
		this.ConfigFile = new ConfigFile();

		this.chat = null; // チャット用のソケット

		this.chatlog = [];
		this.chat_text = '';
		this.chat_open = false;

	}
	sendChat(){
		if(this.chat != null){
			this.chat.send(JSON.stringify([null,null,'chat:public','new_msg',{'text':this.chat_text}]));
			this.chat_text = '';
		}
	}
	loginChat(base_url,access_token){
		return new Promise((resolve,reject) => {
			var url = base_url + 'api/account/verify_credentials';
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

	stopScrolling(){
		this.scrolling = false;
	}

	sendHeartBeat(){
		if(this.chat != null){
			this.chat.send(JSON.stringify([null,null,'phoenix','heartbeat',{}]));
			setTimeout(()=>{
				this.sendHeartBeat();
			},30000);
		}
	}

	showChatView(){
		this.ConfigFile.loadConfigFromFile();

		let cv = this.chat_open;
		this.chat_open = !cv;

		// ソケットクローズ
		try{
			this.chat.close();
		}catch(err){
			this.chat = null;
		}
		this.chat = null;

		if(this.chat_open){
			// ソケットオープン

			this.loginChat(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token)
				.then(result => {
					if(result.token != undefined){
						// ログイン成功
						try{
							let streamingurl = this.ConfigFile.account.base_url.replace('http','ws') + 'socket/websocket?token=' + result.token + '&vsn=2.0.0';
							this.chat = new WebSocket(streamingurl);
							this.chat.onopen = () => {
								this.chat.send(JSON.stringify(['1','1','chat:public','phx_join',{}]));
							};

							this.chat.onmessage = (e) => {
								var deviceToast = require('deviceToast');
								var recvdata = JSON.parse(e.data);
								try{
									switch(recvdata[2]){
									case  'chat:public':
										switch(recvdata[3]){
										case 'messages':
											//過去ログ
											this.chatlog = recvdata[4].messages;
											setTimeout(() => {
												this.sendHeartBeat();
												deviceToast.ToastIt('ログイン完了！');
											},3000);
											break;
										case 'new_msg':
											//新規ログ
											this.chatlog.push(recvdata[4]);
											break;
										// case 'new_notice':
										// 	console.log('おしらせを受信');
										// 	break;
										}
										break;
									case 'phoenix':
										switch(recvdata[3]){
										case 'phx_reply':
											if(recvdata[4].status != 'ok'){
												deviceToast.ToastIt('チャットサーバがおかしい！');
											}
											break;
										}
										break;
									}

								}catch(e){
									deviceToast.ToastIt('なんかやべぇエラーが発生した');
								}
							};


						}catch(err){
							let deviceToast = require('deviceToast');
							deviceToast.ToastIt('ソケットオープンできなかった');
						}

					}else{
						let deviceToast = require('deviceToast');
						deviceToast.ToastIt('チャットにログインできなかった');
					}
				});
		}
	}
}

import MastodonAPI from 'lib/MastodonAPI';
import Helper from 'lib/Helper';

export default class TimeLine {

	constructor(name,uri,streaminguri = ''){
		this.name = name;
		this.uri = uri;
		this.data = [];
		this.loaded = false;
		this.reloading = false;

		this.streaminguri = streaminguri;

		this.MastodonAPI = new MastodonAPI();
		this.Helper = new Helper();
	}

	appendToot(status){

		// ここで重複を排除する
		let dup_found = this.data.find(elm => {
			return elm.id == status.id;
		});
		if(dup_found == undefined){

			// 重複していないので追加して削除する
			this.data.unshift(status);
			setTimeout((()=>{
				this.data.pop();
			}),1000);
		}

	}

	loadTimeLine(base_url,access_token,reload = false){

		if(reload){
			this.reloading = true;
			this.loaded = false;
		}

		if(this.uri != '' && !this.loaded){

			this.MastodonAPI.getTimeLine(base_url,this.uri,access_token)
				.then(result => {

					// 取得した全Tootに対してHTML2PlainTextを施す
					result.forEach(toot => {

						toot.kind = this.Helper.makeKind(toot);

						toot.created_at = this.Helper.formatTimestamp(toot.created_at);
						toot.account.note = this.Helper.convertHTMLToPlain(toot.account.note);

						var tags = [];
						switch(toot.kind){
						case 'toot':
							toot.dist_content = this.Helper.makeDistContent(toot.content,toot.emojis);
							toot.content = this.Helper.convertHTMLToPlain(toot.content);
							tags = this.Helper.makeTagFromContent(base_url,toot.content);
							if(tags.length > 0 && toot.tags.length == 0){
								// tagsが実装されていないので補完する
								toot.tags = tags;
							}
							break;
						case 'reblogedtoot':
							toot.reblog.created_at = this.Helper.formatTimestamp(toot.reblog.created_at);
							toot.reblog.dist_content = this.Helper.makeDistContent(toot.reblog.content,toot.reblog.emojis);
							toot.reblog.content = this.Helper.convertHTMLToPlain(toot.reblog.content);
							toot.reblog.account.note = this.Helper.convertHTMLToPlain(toot.reblog.account.note);
							tags = this.Helper.makeTagFromContent(base_url,toot.reblog.content);
							if(tags.length > 0 && toot.reblog.tags.length == 0){
								// tagsが実装されていないので補完する
								toot.reblog.tags = tags;
							}
							break;
						case 'notification':
							toot.status.created_at = this.Helper.formatTimestamp(toot.status.created_at);
							toot.status.dist_content = this.Helper.makeDistContent(toot.status.content,toot.status.emojis);
							toot.status.content = this.Helper.convertHTMLToPlain(toot.status.content);
							toot.status.account.note = this.Helper.convertHTMLToPlain(toot.status.account.note);
							tags = this.Helper.makeTagFromContent(base_url,toot.status.content);
							if(tags.length > 0 && toot.status.tags.length == 0){
								// tagsが実装されていないので補完する
								toot.status.tags = tags;
							}
							break;
						}
					});

					this.data = result;
					this.loaded = true;

					if(reload){
						this.reloading = false;
					}
				});
		}
	}
}

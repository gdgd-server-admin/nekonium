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
						toot.created_at = this.Helper.formatTimestamp(toot.created_at);
						toot.account.note = this.Helper.convertHTMLToPlain(toot.account.note);

						if(toot.content != undefined){
							toot.content = this.Helper.convertHTMLToPlain(toot.content);
							let tags = this.Helper.makeTagFromContent(base_url,toot.content);
							if(tags.length > 0 && toot.tags.length == 0){
								// tagsが実装されていないので補完する
								toot.tags = tags;
							}
							toot.dist_content = this.Helper.makeDistContent(toot.content,toot.emojis);
						}


						if(toot.reblog != undefined){
							toot.reblog.created_at = this.Helper.formatTimestamp(toot.reblog.created_at);
							toot.reblog.content = this.Helper.convertHTMLToPlain(toot.reblog.content);
							toot.reblog.account.note = this.Helper.convertHTMLToPlain(toot.reblog.account.note);
							let tags = this.Helper.makeTagFromContent(base_url,toot.reblog.content);
							if(tags.length > 0 && toot.reblog.tags.length == 0){
								// tagsが実装されていないので補完する
								toot.reblog.tags = tags;
							}
							toot.reblog.dist_content = this.Helper.makeDistContent(toot.reblog.content,toot.reblog.emojis);
						}
						if(toot.status != undefined){
							toot.status.content = this.Helper.convertHTMLToPlain(toot.status.content);
							toot.status.created_at = this.Helper.formatTimestamp(toot.status.created_at);
							toot.status.account.note = this.Helper.convertHTMLToPlain(toot.status.account.note);
							let tags = this.Helper.makeTagFromContent(base_url,toot.status.content);
							if(tags.length > 0 && toot.status.tags.length == 0){
								// tagsが実装されていないので補完する
								toot.status.tags = tags;
							}
							toot.status.content = this.Helper.stripTagFromContent(toot.status.content,toot.status.tags);
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

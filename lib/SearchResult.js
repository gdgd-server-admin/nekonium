import MastodonAPI from 'lib/MastodonAPI';
import Helper from 'lib/Helper';

export default class SearchResult {

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
		this.data.unshift(status);
		setTimeout((()=>{
			this.data.pop();
		}),1000);
	}
 
	loadTimeLine(base_url,access_token,reload = false){

		if(reload){
			this.reloading = true;
			this.loaded = false;
		}

		if(this.uri != '' && !this.loaded){

			this.MastodonAPI.getTimeLine(base_url,this.uri,access_token)
				.then(response => {
					return response.statuses;
				})
				.then(result => {

					// 取得した全Tootに対してHTML2PlainTextを施す
					result.forEach(toot => {
						toot.created_at = this.Helper.formatTimestamp(toot.created_at);
						toot.account.note = this.Helper.convertHTMLToPlain(toot.account.note);

						if(toot.content != undefined){
							toot.content = this.Helper.convertHTMLToPlain(toot.content);
						}

						if(toot.reblog != undefined){
							toot.reblog.created_at = this.Helper.formatTimestamp(toot.reblog.created_at);
							toot.reblog.content = this.Helper.convertHTMLToPlain(toot.reblog.content);
							toot.reblog.account.note = this.Helper.convertHTMLToPlain(toot.reblog.account.note);
						}
						if(toot.status != undefined){
							toot.status.content = this.Helper.convertHTMLToPlain(toot.status.content);
							toot.status.created_at = this.Helper.formatTimestamp(toot.status.created_at);
							toot.status.account.note = this.Helper.convertHTMLToPlain(toot.status.account.note);
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

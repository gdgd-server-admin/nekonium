var moment = require('Bundles/moment-with-locales');
moment.locale('ja');

export default class Helper{
	constructor(){

	}

	convertHTMLToPlain(html){
		return html.replace(/<br \/>/gm,'\n')
			.replace(/<br>/gm,'\n')
			.replace(/<br\/>/gm,'\n')
			.replace(/<(?:.|\n)*?>/gm, '')
			.replace(/&gt;/gm,'>')
			.replace(/&lt;/gm,'<')
			.replace(/&apos;/gm,'\'')
			.replace(/&quot;/,'"')
			.replace(/&amp;/gm,'&');
	}

	makeFetchOption(request_method,access_token = '',content_type = '',body = undefined){

		var options = {
			method: request_method,
			headers: {}
		};
		if(access_token != ''){
			const auth = 'Bearer ' + access_token;
			options.headers['Authorization'] = auth;
		}
		if(content_type != ''){
			options.headers['Content-Type'] = content_type;
		}
		if(body != undefined){
			options.body = JSON.stringify(body);
		}

		return options;
	}

	formatTimestamp(stamp){
		return moment(stamp).format('L LT');
	}

	makeTagFromContent(base_url,content){
		try{
			let tags = [];
			let res = content.match(/#\S*/g);
			if(res != undefined){
				res.forEach(item => {
					tags.push({'name': item.replace('#',''),'url': base_url + 'api/v1/timelines/tag/' + item.replace('#','')});
				});
			}
			return tags;
		}catch(err){
			return [];
		}
	}
	stripTagFromContent(content,tags){
		var res = content;
		tags.forEach(item =>{
			res = res.replace('#' +item.name,'');
		});
		return res;
	}
}

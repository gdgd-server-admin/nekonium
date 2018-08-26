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

	makeKind(status){
		if(status.type != undefined){
			return 'notification';
		}
		if(status.reblog != undefined){
			return 'reblogedtoot';
		}
		return 'toot';
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
			switch(content_type){
			case 'application/x-www-form-urlencoded':
				options.body = body; // 文字列が渡されている
				break;
			case 'application/json':
				options.body = JSON.stringify(body); // JSONが渡されているので文字列にする
				break;
			}
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

	makeDistContent(content,emojis){

		let dist_content = [];
		const base_array = content
			.replace(/<br \/>/gm,'\n')
			.replace(/<br>/gm,'<br>\n ')
			.replace(/<br\/>/gm,'<br>\n ')
			.replace(/<(?:.|\n)*?>/gm, '')
			.replace(/&gt;/gm,'>')
			.replace(/&lt;/gm,'<')
			.replace(/&apos;/gm,'\'')
			.replace(/&quot;/,'"')
			.replace(/&amp;/gm,'&')
			.replace(/」/gm,'」 ')
			.replace(/「/gm,' 「')
			.replace(/http/gm,' http')
			.replace(/#/gm,' #')
			.split(/\s/gm);
		var buf = [];
		base_array.forEach(item => {

			if(item != ''){
				if(item.startsWith('http')){
					// これはたぶんＵＲＬ
					dist_content.push({type:'text',value: buf.join(' ').replace(/<br>/gm,'\n')});
					buf = [];
					dist_content.push({type:'url',href: item});
				}
				else if(item.startsWith('#')){
					// これはたぶんタグ
					dist_content.push({type:'text',value: buf.join(' ').replace(/<br>/gm,'\n')});
					buf = [];
					dist_content.push({type:'tag',name: item.replace('#','').replace(/ /gm,'').replace('\n','')});

				}
				else if(item.startsWith('@')){
					// これはリプライの気がする
					dist_content.push({type:'text',value: buf.join(' ').replace(/<br>/gm,'\n')});
					buf = [];
					dist_content.push({type:'reply',name: item});
				}
				else if(item.startsWith(':') && item.endsWith(':')){
					// :hoge:はたぶん絵文字
					dist_content.push({type:'text',value: buf.join(' ').replace(/<br>/gm,'\n')});
					buf = [];

					const emoji = emojis.find(emg => {
						return emg.shortcode == item.replace(/:/gm,'');
					});

					if(emoji == undefined){
						// 見つからない場合はテキスト
						dist_content.push({type:'text',value: item + ' '});
					}else{
						dist_content.push({type:'emoji',static_url: emoji.static_url});
					}
				}
				else{
					// これはテキストとみなす
					buf.push(item);
					if(item.endsWith('<br>')){
						dist_content.push({type:'text',value: buf.join(' ').replace(/<br>/gm,'\n')});
						buf = [];
					}
				}
			}
		});
		if(buf.length > 0){
			dist_content.push({type:'text',value: buf.join(' ').replace(/<br>/gm,'\n')});
			buf = [];
		}

		return dist_content;
	}
}

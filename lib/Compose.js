import ConfigFile from 'lib/ConfigFile';

export default class Compose {
	constructor(){
		this.status = '';
		this.in_reply_to_id = '';
		this.media_ids = [];
		this.sensitive = false;
		this.spoiler_text = '';
		this.visiblity = 'public';

		this.media_attachment = [];
		this.visiblity_label = {
			'public': '公開',
			'unlisted': '未収蔵',
			'private': '身内',
			'direct': '直通'
		};
	}

	toggleSensitive(){
		let s = this.sensitive;
		this.sensitive = !s;
	}

	toggleVisiblity(){
		switch(this.visiblity){
		case 'public':
			this.visiblity = 'unlisted';
			break;
		case 'unlisted':
			this.visiblity = 'private';
			break;
		case 'private':
			this.visiblity = 'direct';
			break;
		case 'direct':
			this.visiblity = 'public';
			break;

		}
	}

	removeFile(args){
		if(args.sender == 'firstMediaPanel'){
			this.media_attachment.splice(0,1);
		}
		if(args.sender == 'secondMediaPanel'){
			this.media_attachment.splice(1,1);
		}
		if(args.sender == 'thirdMediaPanel'){
			this.media_attachment.splice(2,1);
		}
		if(args.sender == 'fourthMediaPanel'){
			this.media_attachment.splice(3,1);
		}
	}

	addTagToCompose(){
		const cfg = new ConfigFile();
		cfg.loadConfigFromFile();

		if(this.status.indexOf('#' + cfg.settings.default_tag.replace('#','')) < 0){
			let bufs = this.status;
			if(bufs != ''){
				bufs = bufs + ' ';
			}
			this.status = bufs + '#' + cfg.settings.default_tag.replace('#','');
		}
	}

	clearReplyId(){
		this.in_reply_to_id = '';
	}
}

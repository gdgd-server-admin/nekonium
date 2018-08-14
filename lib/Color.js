export default class Color {
	constructor(){
		this.text_main = '#000';
		this.text_sub ='#DDD';
		this.text_link = '#FFF';
		this.bg_main = '#FFF';
		this.bg_sub = '#DDD';
		this.bg_bar = '#DDF';
		this.bg_link = '#00F';
		this.border = '#BBF';
	}

	toggleColor(flag){
		if(flag){
			// よるもーど
			this.text_main = '#999';
			this.text_sub ='#777';
			this.text_link = '#66F';
			this.bg_main = '#444';
			this.bg_sub = '#555';
			this.bg_bar = '#557';
			this.bg_link = '#BBB';
			this.border = '#77A';
		}else{
			// ひるもーど
			this.text_main = '#000';
			this.text_sub ='#DDD';
			this.text_link = '#FFF';
			this.bg_main = '#FFF';
			this.bg_sub = '#DDD';
			this.bg_bar = '#DDF';
			this.bg_link = '#00F';
			this.border = '#BBF';
		}
	}
}

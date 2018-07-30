function getUrisFromText( _text ) {

	var regex = /<[aA].*?\s+href=["']([^"']*)["'][^>]*>(?:<.*?>)*(.*?)(?:<.*?>)?<\/[aA]>/igm ;
	return _text.match( regex );

}

function utf8_to_utf16(str){

	var utf16str = decodeURIComponent(escape(str));

	return utf16str;
}

function gmttime_to_localtime(created_at){
	try{
		var d = new Date(created_at);
		return d.toLocaleString();
	}catch(e){
		return created_at;
	}
}

module.exports = {
	getUrisFromText: getUrisFromText,
	utf8_to_utf16:utf8_to_utf16,
	gmttime_to_localtime:gmttime_to_localtime
}
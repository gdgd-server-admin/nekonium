var Observable = require("FuseJS/Observable");

var rawtext =  Observable("");
var _this = this;
var src = this.Parameter.map(function(param){
		return param.sourcehtml;
	});
	
function onActivated(){
	
	rawtext.value = src;
}

module.exports = {
	rawtext:rawtext,
	onActivated:onActivated
}
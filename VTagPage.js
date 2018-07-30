var Observable = require("FuseJS/Observable");
var api = require("Assets/js/api");
var tagname = Observable("");
var _vtl = Observable();
var _vtlr = Observable(false);

function vtagActivated(args){
  if(localStorage.getItem("VTagText") != undefined){
    tagname.value = localStorage.getItem("VTagText");
  }
  vtagReload();
}

function vtagReload(){
	if(_vtlr.value == false){
		_vtlr.value = true;
    api.get_timeline("timelines/tag/" + tagname.value)
    .then((data) => {

      _vtl.replaceAll(data);
      _vtlr.value = false;

    });
	}
}

function vtagReadmore(){
	var public_max_id = 0;

	_ttl.forEach(function(i){
		if(i.id < public_max_id || public_max_id == 0){
			public_max_id = i.id;
		}
	});

	if(_vtlr.value == false){
		_vtlr.value = true;

    api.get_timeline("timelines/tag/" + tagname.value + "?max_id=" + public_max_id)
    .then((data) => {

      _vtl.addAll(data);
      _vtlr.value = false;

    });
	}
}

module.exports = {
  vtagActivated:vtagActivated,
  tagname:tagname,
  vtagReload:vtagReload,
  vtagReadmore:vtagReadmore,
  _vtl:_vtl,
  _vtlr:_vtlr,
}

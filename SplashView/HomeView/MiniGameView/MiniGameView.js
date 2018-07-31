var Observable = require("FuseJS/Observable");
var currentNyaan = Observable(0);
var NezumiMove =  Observable(100);
var NezumiMoving = Observable(false);
var HightScore = Observable(0);
var ResultMessage =  Observable("");


function useNyaan(){

	if( currentNyaan.value > 0 ){
		currentNyaan.value -= 1;
	}

	localStorage.setItem("Coin",currentNyaan.value);

	var _resultmove = NezumiMove.value * -1;

	if(_resultmove > HightScore.value){
		HightScore.value = _resultmove;
		ResultMessage.value = _resultmove + " ぽーんだった。すごい";
		localStorage.setItem("HightScore",_resultmove);
	}else{
		ResultMessage.value = _resultmove + " ぽーんだった";
	}
	setTimeout(function(){
		ResultMessage.value = "";
	},6000);
}

function getRandomInt(min, max) {
  return Math.floor( Math.random() * (max - min + 1) ) + min;
}

function GoNezumi(){
	NezumiMoving.value = true;

  // max(Y) = 999.9

  var _seed = getRandomInt(0,100);

	var _abox = getRandomInt(640,2000);
	var _bbox = getRandomInt(640,4000);
	var _cbox = getRandomInt(3000,7000);
	var _dbox = getRandomInt(5000,9999);

  console.log("#############");
  console.log(_seed);
	console.log(_abox);
	console.log(_bbox);
	console.log(_cbox);
	console.log(_dbox);
	console.log("#############");
	//var _sqrt = Math.sqrt(_seed);
	//var _base = Math.round(_sqrt * 20) / 10;
	var _base = 0;
	if(_seed > 99){
		_base = _dbox;
	} else if (_seed > 90) {
		_base = _cbox;
	} else if (_seed > 70) {
		_base = _bbox;
	} else {
		_base = _abox;
	}

	NezumiMove.value = _base / -10;
	setTimeout(function(){
		NezumiMoving.value = false;
		useNyaan();
	},5000);
}

function loadNyaan(){
	if(localStorage.getItem("Coin") != undefined){
		currentNyaan.value =  Number(localStorage.getItem("Coin"));
	}else{
		currentNyaan.value = 0;
	}
	if(localStorage.getItem("HightScore") != undefined){
		HightScore.value =  Number(localStorage.getItem("HightScore"));
	}else{
		HightScore.value = 0;
	}
}

function shareResult(){
	console.log(ResultMessage.value);
	localStorage.setItem("shareNezumiResult",ResultMessage.value);
	router.push("PostView");
}

module.exports = {
	currentNyaan:currentNyaan,
	loadNyaan:loadNyaan,
	useNyaan:useNyaan,
	GoNezumi:GoNezumi,
	NezumiMove:NezumiMove,
	NezumiMoving:NezumiMoving,
	HightScore:HightScore,
	ResultMessage:ResultMessage,
	shareResult:shareResult,
}

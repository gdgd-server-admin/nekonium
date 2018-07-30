var Observable = require('FuseJS/Observable');

var HomeTimeLine = new Observable();
var NoticeTimeLine = new Observable();
var LocalTimeLine = new Observable();
var PublicTimeLine = new Observable();

var SearchResult = Observable();

module.exports = {
	HomeTimeLine:HomeTimeLine,
	NoticeTimeLine:NoticeTimeLine,
	LocalTimeLine:LocalTimeLine,
	PublicTimeLine:PublicTimeLine,
	SearchResult:SearchResult,
}

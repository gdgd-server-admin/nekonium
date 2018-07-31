function replyTo(args){
	localStorage.setItem('ReplyTo', JSON.stringify(args.data.status));
	router.push("PostView");
}

module.exports = {
	replyTo:replyTo
}
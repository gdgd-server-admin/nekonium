function replyTo(args){
	localStorage.setItem('ReplyTo', JSON.stringify(args.data.status));
	router.push("PostPage");
}

module.exports = {
	replyTo:replyTo
}
// Production is iris.cleaning (iris.bonisoft3.com is staging, ../.say.cue); www keeps its links working there.
export default {
	fetch(request) {
		const { pathname, search } = new URL(request.url);
		return Response.redirect(`https://iris.cleaning${pathname}${search}`, 301);
	},
};

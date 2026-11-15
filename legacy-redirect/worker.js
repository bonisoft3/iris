// The app is served from iris.cleaning alone; its other addresses keep their links working there.
export default {
	fetch(request) {
		const { pathname, search } = new URL(request.url);
		return Response.redirect(`https://iris.cleaning${pathname}${search}`, 301);
	},
};

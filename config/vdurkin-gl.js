// Configuration for portal on `gravitas` (RM dev laptop)

// Change to "local", "test" or "" to switch all endpoints together
const cluster = 
	'test';
	//'local';
	//''; // if you want production!

const protocol = 'https';//(cluster === 'local') ? 'http' : 'https';


const ServerIOOverrides = {
	//APIBASE: `http://localportal.good-loop.com`,
	APIBASE: `${protocol}://${cluster}portal.good-loop.com`,
	AS_ENDPOINT: `${protocol}://${cluster}as.good-loop.com`,
	UNIT_ENDPOINT: `${protocol}://${cluster}as.good-loop.com`,
	//PORTAL_ENDPOINT: `http://localportal.good-loop.com`,
	PORTAL_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com`,//`https://portal.good-loop.com`,
	DEMO_ENDPOINT: `${protocol}://${cluster}demo.good-loop.com`,
	DATALOG_ENDPOINT: `${protocol}://${cluster}lg.good-loop.com/data`,
	//MEDIA_ENDPOINT: `${protocol}://${cluster}uploads.good-loop.com`,
	MEDIA_ENDPOINT: `https://uploads.good-loop.com`,
	ANIM_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com/_anim`,
	CHAT_ENDPOINT: `${protocol}://${cluster}chat.good-loop.com/reply`,
	//ENDPOINT_NGO: `https://app.sogive.org/charity`
	// DATALOG_DATASPACE: 'gl',
	ENDPOINT_NGO: 'https://test.sogive.org/charity',
	// JUICE_ENDPOINT: 'https://localjuice.good-loop.com',
	// ADRECORDER_ENDPOINT: 'http://localadrecorder.good-loop.com/record',
}

module.exports = { ServerIOOverrides };
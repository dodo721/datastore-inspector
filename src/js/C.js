import Enum from 'easy-enums';
import Roles from './base/Roles';
import C from './base/CBase';

export default C;

/**
 * app config
 */
C.app = {
	name: "Good-Loop DataStore Inspector",
	// id: "good-loop", 
	id: "datastore.good-loop.com", // TODO: Change id back to the old one for now. Need to test if this break anything in the future. 
	product: "datastore.good-loop.com",
	dataspace: "good-loop",
	service: "good-loop",
	//logo: "/img/gl-logo/LogoMark/logo.blue.svg",
	//facebookAppId: "320927325010346"
};

/**
 * Special ID for things which dont yet have an ID
 */
C.newId = 'new';

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Charity Variants Publisher NGO Advert LineItem Campaign Advertiser Agency Budget Bid User Money MonetaryAmount BotIP JournalEntry Task Video Global GreenTag ImpactCredit ImpactDebit BlogPost ScheduledContent");

C.NAV = new Enum('vertiser vert pub');

/**
 * url parameters for navigation -- these match types
 */
C.navParam4type = {
	'Advertiser': C.NAV.vertiser,
	'Advert': C.NAV.vert,
	'Publisher': C.NAV.pub
};
Object.keys(C.navParam4type).forEach(k => C.TYPES.has(k));

C.ROLES = new Enum("greenUser agency advertiser publisher ngo studio admin");
C.CAN = new Enum("copyAdvert editGreen editAdvert editAdvertiser editSite editImpact publish admin sudo");
// setup roles
Roles.defineRole(C.ROLES.greenUser, [C.CAN.editGreen])
Roles.defineRole(C.ROLES.advertiser, [C.CAN.publish, C.CAN.editAdvert]);
Roles.defineRole(C.ROLES.publisher, [C.CAN.publish, C.CAN.editSite]);
Roles.defineRole(C.ROLES.agency, [C.CAN.editGreen, C.CAN.editAdvertiser]);
Roles.defineRole(C.ROLES.studio, "copyAdvert editGreen editAdvert editAdvertiser editSite editImpact publish".split(" ")); // Good-Loop Studio
Roles.defineRole(C.ROLES.admin, C.CAN.values);

C.emailRegex = /(.+?@[\w-]+?\.[\w-]+?)/;

C.DEFAULT_AD_ID = 'default-advert';

/*
NOTE: We want to standardise on a-z names without punctuation.
E.g. "verticalbanner" not "vertical-banner"
TODO: And use this canonical form everywhere.
*/
C.ADSIZEINFO = {
	mediumrectangle: 'MPU aka Medium Rectangle (300x250)',
	leaderboard: 'Leaderboard (728x90)',
	billboard: 'Billboard (970x250)',
	// NB: Superheader is a bit different: 900x250
	stickyfooter: 'Large-Mobile-Banner aka Sticky-Footer (320x100)',
	mobilebanner: 'TODO Mobile-Banner (320x50)',
	mpu2: 'TODO Double-MPU aka Half-Page (300x600)',
	verticalbanner: 'Small Vertical Banner (120x240)'
};

C.defaultStartDateString = '2018-03-05T00:00:00Z';

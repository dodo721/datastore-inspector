// Insert bundle[-debug].js - but allow dynamic test/production build switch.
// Default to debug build on test and local servers.
// TODO reset after development
window.isDebug = true; //= window.location.hostname.match(/^local/) || window.location.hostname.match(/^test/) || window.location.hostname.match(/^stage/);

// Has the user specified debug/production build with a URL param?
/*var debugParam = window.location.search.match(/debug=(\w+)/i);
if (debugParam && debugParam[1]) {
// Require an exact match to change from default
if (debugParam[1] === 'false') window.isDebug = false;
else if (debugParam[1] === 'true') window.isDebug = true;
}*/

var filename = isDebug ? 'bundle-debug.js' : 'bundle.js';
document.write('<script src="build/js/' + filename + '"/><\/script>');



/*
 * agent -> **content-script.js** -> background.js -> dev tools
 */
window.addEventListener('message', function(event) {

    // Only accept messages from same frame
    if (event.source !== window) {
        return;
    }

    var message = event.data;

    // Only accept messages of correct format (our messages)
    if (typeof message !== 'object' || message === null ||
        message.source !== 'datastore-inspect-agent') {
        return;
    }

    browser.runtime.sendMessage(message);
});

/*
 * agent <- **content-script.js** <- background.js <- dev tools
 */
browser.runtime.onMessage.addListener(function(request) {
    request.source = 'datastore-inspect-tools';
    window.postMessage(request, '*');
});

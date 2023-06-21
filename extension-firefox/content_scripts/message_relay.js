
console.error("HELLO")

/*
 * agent -> **content-script.js** -> background.js -> dev tools
 */
window.addEventListener('message', function(event) {
    console.log("GOT MESSAGE", event);
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

    console.log("RELAYING MESSAGE", message);

    browser.runtime.sendMessage(message);
});

/*
 * agent <- **content-script.js** <- background.js <- dev tools
 */
browser.runtime.onMessage.addListener(function(request) {
    request.source = 'datastore-inspect-tools';
    browser.postMessage(request, '*');
});

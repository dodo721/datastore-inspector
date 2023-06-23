var connections = {};

/*
 * agent -> content-script.js -> **background.js** -> dev tools
 */
browser.runtime.onMessage.addListener(function(request, sender) {
  if (sender.tab) {
    var tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(request);
      console.log("Relayed msg from background:", request)
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});


/*
 * agent <- content-script.js <- **background.js** <- dev tools
 */
browser.runtime.onConnect.addListener(function(port) {

  console.log("Background picked up connection");

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(function(request) {
    console.log('incoming message from dev tools page', request);

    // Register initial connection
    if (request.name === 'init') {
      connections[request.tabId] = port;
        console.log("Got connection for ", request.tabId);
      port.onDisconnect.addListener(function() {
        delete connections[request.tabId];
      });

      return;
    }

    console.log("BG.JS > CONTENT SENDING ", request);

    // Otherwise, broadcast to agent
    browser.tabs.sendMessage(request.tabId, {
      name: request.name,
      data: request.data
    });
  });

});

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if (tabId in connections && changeInfo.status === 'complete') {
    // TODO: reload connection to page somehow...?
    connections[tabId].postMessage({
      name: 'reloaded'
    });
  }
});
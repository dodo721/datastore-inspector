/**
 * Injected script for interfacing with DataStore.
 * This is different to a content script, as it has access to the javascript environment of the page.
 * NB: This script is not compiled, so must be valid vanilla JS.
 */


window.__ext_datastore_agent_injected = true;

window.__ext_datastore_breakpointed_paths_set = [];
window.__ext_datastore_breakpointed_paths_get = [];

console.__ext_log = (msg, ...rest) => {
    console.log("%c[DataStoreInspector] " + "%c"+msg, "color:blue;font-weight:bold", "color:red", ...rest);
}

console.__ext_log("Injected!");

// Listen for messages from devtools (from content script)
window.addEventListener('message', function(event) {
    // Only accept messages from same frame
    if (event.source !== window) {
        return;
    }

    var message = event.data;

    // Only accept messages of correct format (our messages)
    if (typeof message !== 'object' || message === null ||
        message.source !== 'datastore-inspect-tools') {
        return;
    }

    __ext_handleMessage(message);
});

// Do stuff with messages
const __ext_handleMessage = message => {
    if (message.name === "DS_breakpoint_path_set") {
        const path = message.data.path;
        const pathStr = path.join("/");
        const op = message.data.op;
        if (op === "add") {
            if (!window.__ext_datastore_breakpointed_paths_set.includes(pathStr))
                window.__ext_datastore_breakpointed_paths_set.push(pathStr);
            console.__ext_log("Breakpoint (SET) added", path);
        } else if (op === "remove") {
            window.__ext_datastore_breakpointed_paths_set = window.__ext_datastore_breakpointed_paths_set.filter(p => p !== pathStr);
            console.__ext_log("Breakpoint (SET) removed", path);
        }
    } else if (message.name === "DS_breakpoint_path_get") {
        const path = message.data.path;
        const pathStr = path.join("/");
        const op = message.data.op;
        if (op === "add") {
            if (!window.__ext_datastore_breakpointed_paths_get.includes(pathStr))
                window.__ext_datastore_breakpointed_paths_get.push(pathStr);
            console.__ext_log("Breakpoint (GET) added", path);
        } else if (op === "remove") {
            window.__ext_datastore_breakpointed_paths_get = window.__ext_datastore_breakpointed_paths_get.filter(p => p !== pathStr);
            console.__ext_log("Breakpoint (GET) removed", path);
        }
    } else if (message.name === "DS_set_path_value") {
        const path = message.data.path;
        const value = message.data.value;
        __ext_DSsetValueNoBreakpoint(path, value);
    } else if (message.name === "SIO_set_overrides") {
        console.log("GOT OVERRIDESSSSSSSSS", message.data.overrides);
        const overrides = message.data.overrides;
        Object.keys(overrides).forEach(key => {
            //if (ServerIO[key] !== overrides[key])
                console.__ext_log("Changed SIO override:", key, overrides[key]);
            ServerIO[key] = overrides[key];
        });
    }
};

// Send messages back to devtools (via content script)
const __ext_sendMessage = function(name, data) {
    window.postMessage({
        source: 'datastore-inspect-agent',
        name, data:JSON.stringify(data)
    }, '*');
};

// Augment DataStore.setValue with our listeners
const __ext_ogDSsetValue = DataStore.setValue.bind(DataStore);
DataStore.setValue = (...params) => {
    const path = params[0];
    const value = params[1];
    const update = params[2];
    if (window.__ext_datastore_breakpointed_paths_set.includes(path.join("/"))) {
        console.__ext_log("Breakpoint triggered (SET)", path, value);
        debugger;
    }
    const ogValue = __ext_ogDSgetValue(path);
    __ext_ogDSsetValue(...params);
    if (ogValue !== value)
        __ext_sendMessage("DS_set_value", {path, value, update, dataStore:DataStore});
};
const __ext_DSsetValueNoBreakpoint = (...params) => {
    const path = params[0];
    const value = params[1];
    const update = params[2];
    __ext_ogDSsetValue(...params);
    console.
    //__ext_sendMessage("DS_set_value", {path, value, update, dataStore:DataStore}); No need to update with redundant info - just causes typing lag
}

// Augment DataStore.setValue with our listeners
const __ext_ogDSgetValue = DataStore.getValue.bind(DataStore);
DataStore.getValue = (...params) => {
    let path = params;
    if (path.length===1 && Array.isArray(path[0])) {
        path = path[0];
    }
    if (window.__ext_datastore_breakpointed_paths_get.includes(path.join("/"))) {
        console.__ext_log("Breakpoint triggered (GET)", path);
        debugger;
    }
    __ext_sendMessage("DS_get_value", {path});
    return __ext_ogDSgetValue(...params);
};

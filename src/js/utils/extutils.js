import { useState, useEffect } from 'react';
import PromiseValue from '../base/promise-value';
import DataStore, { useUpdate } from '../base/plumbing/DataStore';


const BROWSER_TARGET = process.env.BROWSER_TARGET;
// Often the only difference between chromium and firefox extension code is the API reference (`browser` vs `chrome`)
const api = process.env.BROWSER_API;
export const API_STR = process.env.BROWSER_API_STR;

const EVAL_PATH = ['transient', 'ext', 'eval'];
const WHITELIST_PATH = ['transient', 'ext', 'whitelist'];

/**
 * Evaluate a script in the inspected window.
 * N.B: this function is unsafe (see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools/inspectedWindow/eval)
 * @param {String} script 
 */
export const evalScript = (script) => {
    return DataStore.fetch(EVAL_PATH.concat(script).concat(new Date().getTime()), () => {
        const promise = api.devtools.inspectedWindow.eval(script);
        return promise;
    }, 1000);
}

/**
 * React hook to update any time the URL of the inspected window updates
 */
export const useInspectedURL = () => {
    const [url, setUrl] = useState(null);
    const updateURL = u => setUrl(new URL(u));

    useEffect(() => {
        api.devtools.network.onNavigated.addListener(updateURL);
        evalScript("window.location.href").promise.then(u => updateURL(u[0]));
        return () => api.devtools.network.onNavigated.removeListener(updateURL);
    }, []);

    return url;
}

/**
 * Check if the local storage whitelist contains a host string
 * @param {String} host 
 */
export const isHostWhitelisted = host => {
    if (!host) return null;
    return DataStore.fetch(WHITELIST_PATH.concat(host), async () => {
        const whitelist = await api.storage.local.get("whitelist");
        return !!whitelist[host];
    }, 1000);
}

/**
 * Whitelist a host
 * @param {String} host 
 * @param {Boolean} [val] 
 */
export const whitelistHost = (host, val=true) => {
    return (async () => {
        const whitelist = await api.storage.local.get("whitelist");
        whitelist[host] = val;
        return api.storage.local.set({whitelist});
    })();
}

/**
When the user clicks the 'jquery' button,
evaluate the jQuery script.

const checkjQuery = "typeof jQuery != 'undefined'";
document.getElementById("button_jquery").addEventListener("click", () => {
  browser.devtools.inspectedWindow.eval(checkjQuery)
    .then(handlejQueryResult);
});   */

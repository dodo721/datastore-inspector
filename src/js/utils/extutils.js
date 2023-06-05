import { useState, useEffect } from 'react';
import PromiseValue from '../base/promise-value';
import DataStore, { useUpdate } from '../base/plumbing/DataStore';

const EVAL_PATH = ['transient', 'ext', 'eval'];

export const evalScript = script => {
    return DataStore.fetch(EVAL_PATH.concat(script).concat(new Date().getTime()), () => {
        return browser.devtools.inspectedWindow.eval(script);
    });
}

export const useInspectedURL = () => {
    const [url, setUrl] = useState(null);
    const updateURL = u => setUrl(new URL(u));

    useEffect(() => {
        browser.devtools.network.onNavigated.addListener(updateURL);
        evalScript("window.location.href").promise.then(u => updateURL(u[0]));
        return () => browser.devtools.network.onNavigated.removeListener(updateURL);
    }, []);

    return url;
}

/**
When the user clicks the 'jquery' button,
evaluate the jQuery script.

const checkjQuery = "typeof jQuery != 'undefined'";
document.getElementById("button_jquery").addEventListener("click", () => {
  browser.devtools.inspectedWindow.eval(checkjQuery)
    .then(handlejQueryResult);
});   */

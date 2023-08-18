import { useEffect, useState } from 'react';
import { API_STR } from '../utils/extutils';
import DataStore from '../base/plumbing/DataStore';

const api = process.env.BROWSER_API;

export const useDataStoreHooks = (port, sendMessage, inspectedURL, safeToInject) => {

    useEffect(() => {
        if (!port) {
            console.log("No port, can't inject");
            return;
        }
        if (!safeToInject) return;

        var injectedGlobal = 'window.__ext_datastore_agent_injected';

        api.devtools.inspectedWindow.eval(injectedGlobal).then(result => {
            if (!result[0]) {
                // script hasn't been injected yet
                console.log("Injecting agent...", api.runtime.getURL('/agent.js'));
                var xhr = new XMLHttpRequest();
                xhr.open('GET', api.runtime.getURL('/agent.js'), false);
                xhr.send();
                var script = xhr.responseText;

                api.devtools.inspectedWindow.eval(script).then(res => {
                    console.log("Injected!");
                    sendMessage('connect');
                }).catch(err => {
                    console.error("Error on injecting", err);
                });
            } else {
                console.log("Already injected!");
                // we're already injected, so just connect
                sendMessage('connect');
            }
        });
        //${API_STR}.runtime.sendMessage({event:"DS_setValue", params});
        //port.onMessage.addListener(portListener);
    }, [port, inspectedURL, safeToInject]);
};

export const useServerIOOverrides = (inspectedURL, safeToInject) => {

    const [overrides, setOverrides] = useState({});
    
    useEffect(() => {
        api.devtools.inspectedWindow.eval('ServerIO').then(res => {
            const serverIO = res[0];
            if (!serverIO) {
                console.error("Cannot find ServerIO??");
                return;
            }
            setOverrides(findOverrides(serverIO));
        });
    }, [inspectedURL, safeToInject]);

    return overrides;
};

const findOverrides = (serverIO) => {
    const overrides = {};
    const urlRegex = /^https?:\/\/(\w*\.)?(good\-loop\.com|sogive\.org)\/?.*$/g;
    Object.keys(serverIO).forEach(key => {
        if (key.toUpperCase() !== key) return; // only all caps keys
        const val = serverIO[key];
        if (typeof val === "string" && val.match(urlRegex)) {
            overrides[key] = val;
        }
    });
    return overrides;
};

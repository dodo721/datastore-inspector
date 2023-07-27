import { useEffect, useState } from 'react';
import { API_STR, evalScript } from '../utils/extutils';
import DataStore from '../base/plumbing/DataStore';

const api = process.env.BROWSER_API;

export const useDataStoreHooks = (port, sendMessage, inspectedURL) => {

    useEffect(() => {
        if (!port) {
            console.log("No port, can't inject");
            return;
        }
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
    }, [port, inspectedURL]);
}

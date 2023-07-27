import { useEffect, useState } from 'react';

const api = process.env.BROWSER_API;

const createPort = () => {
    const port = api.runtime.connect({
        name: 'panel'
    });
    
    port.postMessage({
        name: 'init',
        tabId: api.devtools.inspectedWindow.tabId
    });
    
    return port;
};

export const sendMessage = function(port, name, data) {
  port.postMessage({
    name: name,
    tabId: api.devtools.inspectedWindow.tabId,
    data: data || {}
  });
};

export const useExtMessaging = () => {
    const [port, setPort] = useState();
    useEffect(() => {
        const port = createPort();
        setPort(port);
        console.log("DOIN A PORT!", port)
    }, []);
    const sendMsg = (name, msg) => sendMessage(port, name, msg);
    return [port, sendMsg];
};

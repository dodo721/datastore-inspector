import React, { useState, useEffect, Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import { space, ellipsize } from '../base/utils/miscutils';
import _ from 'lodash';
import { FoldoutSection } from './Components';

const SERVER_OPTIONS = {
    "": "Production",
    "test": "Test",
    "stage": "Stage",
    "local": "Local",
};

const OverrideEditor = ({port, inspectedURL, overrides, sendMessage}) => {

    const [interimOverrides, setInterimOverrides] = useState(overrides);
    const [ogOverrides, setOgOverrides] = useState(overrides);
    const [server, setServer] = useState(getServerType(inspectedURL?.host));
    const [lockedOverrides, setLockedOverrides] = useState([]);

    useEffect(() => {
        if (!port) return;
        // preserve locked overrides - set as soon as possible
        let newOverrides = _.cloneDeep(overrides);
        let moreOGs = _.cloneDeep(ogOverrides);
        Object.keys(newOverrides).forEach(key => {
            if (!moreOGs[key]) {
                moreOGs[key] = newOverrides[key];
            }
            if (lockedOverrides.includes(key)) {
                newOverrides[key] = interimOverrides[key];
            }
        });
        sendMessage('SIO_set_overrides', {overrides:newOverrides});
        setInterimOverrides(newOverrides);
        setOgOverrides(moreOGs);
    }, [overrides, port]);

    useEffect(() => {
        setServer(getServerType(inspectedURL?.host));
    }, [inspectedURL]);

    const onOverrideChange = (e, key) => {
        const newOverrides = _.cloneDeep(interimOverrides);
        newOverrides[key] = e.target.value;
        setInterimOverrides(newOverrides);
        sendMessage('SIO_set_overrides', {overrides:newOverrides});
    }

    const onServerToggle = (e) => {
        const newServer = e.target.value;
        setServer(newServer);
        const newOverrides = _.cloneDeep(interimOverrides);
        Object.keys(newOverrides).forEach(key => {
            const oldServer = getServerType(ogOverrides[key]);
            if (lockedOverrides.includes(key)) return;
            if (oldServer !== "") {
                if (newServer === "") newOverrides[key] = ogOverrides[key].replace(oldServer + ".", newServer);
                newOverrides[key] = ogOverrides[key].replace(oldServer, newServer);
            } else {
                const prevURL = ogOverrides[key];
                const startIdx = prevURL.indexOf("://");
                newOverrides[key] = prevURL.substring(0, startIdx+3).replace(/\.$/g) + newServer + prevURL.substring(startIdx + 3).replace(/^\./g, "");
            }
        });
        setInterimOverrides(newOverrides);
        sendMessage('SIO_set_overrides', {overrides:newOverrides});
    }

    const onLockToggleOverride = (key) => {
        let newLockedOverrides = _.cloneDeep(lockedOverrides);
        const index = newLockedOverrides.indexOf(key);
        if (index > -1) {
            newLockedOverrides.splice(index, 1);
        } else {
            newLockedOverrides.push(key);
        }
        setLockedOverrides(newLockedOverrides);
    }

    const onResetOverride = (key) => {
        if (lockedOverrides.includes(key)) return;
        const newOverrides = _.cloneDeep(interimOverrides);
        newOverrides[key] = ogOverrides[key];
        setInterimOverrides(newOverrides);
        sendMessage('SIO_set_overrides', {overrides:newOverrides});
    }

    return <div className='override-editor acn-bt'>
        <FoldoutSection title={<b>ServerIO Overrides</b>} extras={<small className='pr-2'>Warning: Experimental!</small>} indent>

            <div className='server-toggle px-3 mb-2'>
                <p>Server togggle all endpoints:</p>
                <select className='server-select' value={server} onChange={onServerToggle}>
                    {Object.keys(SERVER_OPTIONS).map(prefix => <option value={prefix}>{SERVER_OPTIONS[prefix]}</option>)}
                </select>
            </div>

            <small>Locked overrides will be reset on reloading, however it takes the extension a moment to load - so initial calls on a reload will be made to the original overrides most likely.</small>
            <br/>

            {Object.keys(interimOverrides).map(key => {
                const locked = lockedOverrides.includes(key);
                return <Row key={key} className={space('override acn-bt', locked && 'locked')}>
                    <Col className='key'>
                        <p className='key-label'>{key}</p>
                    </Col>
                    <Col className='value'>
                        <input type="text" value={interimOverrides[key]} onChange={e => onOverrideChange(e, key)} disabled={locked}/>
                    </Col>
                    <Col xs={2} className='lock'>
                        <a className='lock-toggle' onClick={() => onLockToggleOverride(key)}>
                            {locked ? "🔒" : "🔓"}
                        </a>
                        <a className='reset-btn ml-1' onClick={() => onResetOverride(key)}>
                            ↺
                        </a>
                    </Col>
                </Row>
            })}
        </FoldoutSection>
    </div>;
    //↺

};

const getServerType = (url) => {
    if (!url) return null;
    url = url.replace("https://", "");
    url = url.replace("http://", "");
    let server = null;
    Object.keys(SERVER_OPTIONS).forEach(prefix => {
        if (url.startsWith(prefix)) {
            server = prefix;
            return;
        }
    });
    return server;
};

export default OverrideEditor;

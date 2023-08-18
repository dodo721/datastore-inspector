import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'reactstrap';
import _ from 'lodash';
import { evalScript, useInspectedURL, $0 } from '../utils/extutils';
import { useExtMessaging } from '../plumbing/extmsg';
import { space, setObjectValueByPath, getObjectValueByPath } from '../base/utils/miscutils';
import Inspector from './Inspector';
import OverrideEditor from './OverrideEditor';
import { useDataStoreHooks, useServerIOOverrides } from '../plumbing/DataStoreExtHooks';

const MainDiv = () => {

	const [hasDS, setHasDS] = useState(false);
	const [inspectedDataStore, setInspectedDataStore] = useState(null);
	const [unsafeURLs, setUnsafeURLs] = useState(false);
	const [breakpointsGet, setBreakpointsGet] = useState([]);
	const [breakpointsSet, setBreakpointsSet] = useState([]);
	
	const inspectedURL = useInspectedURL();
	const urlValidators = [
		/^(\w*\.)?good-loop\.com+$/g,
		/^(\w*\.)?sogive\.org+$/g,
	];
	const validated = urlValidators.map(validator => inspectedURL?.host.match(validator)).reduce((prev, cur) => prev || cur);
	const validURL = !!(unsafeURLs || validated);

	const [port, sendMessage] = useExtMessaging();

	useDataStoreHooks(port, sendMessage, inspectedURL, validURL);
	const overrides = useServerIOOverrides(inspectedURL, validURL);

	useEffect(() => {
		if (!validURL) {
			setHasDS(false);
			setInspectedDataStore(null);
		} else {
			let pvTestDS = evalScript("typeof DataStore !== 'undefined'");
			pvTestDS.then (res => {
				setHasDS(res[0]);
				let pvDS = evalScript("DataStore");
				pvDS.then (res => {
					setInspectedDataStore(res[0]);
				});
			});
		}
		// Always reset this option on URL change
		setUnsafeURLs(false);
	}, [inspectedURL]);

	const debouncedSet = useCallback(_.debounce(ds => {
		setInspectedDataStore(ds);
	}, 100), []);

	const portListener = useCallback((message) => {
		const name = message.name;
		if (name === "DS_set_value") {
			const data = JSON.parse(message.data);
			const path = data.path;
			const value = data.value;
			const update = data.update;
			const dataStore = data.dataStore;
			//console.log("DS:", inspectedDataStore);
			//console.log("Updating value:", path, value);
			//const ds = _.cloneDeep(da);
			//setObjectValueByPath(ds, path, value);
			debouncedSet(dataStore);
		}
	}, [inspectedDataStore]);

	useEffect(() => {
		if (port) {
			port.onMessage.addListener(portListener);
			return () => port.onMessage.removeListener(portListener);
		}
	}, [port, portListener]);

	let status = "";
	if (!validURL) status = "For safety, can only inspect hosts matching one of:"
	else if (hasDS) status = "DataStore loaded";
	else status = "DataStore not found";

	const breakpointPathSet = (path, breakpoint) => {
		sendMessage("DS_breakpoint_path_set", {op:breakpoint ? "add" : "remove", path})
		if (breakpoint) {
			setBreakpointsSet(breakpointsSet.concat(path.join("/")));
		} else {
			setBreakpointsSet(breakpointsSet.filter(p => p !== path.join("/")));
		}
	}
	const breakpointPathGet = (path, breakpoint) => {
		sendMessage("DS_breakpoint_path_get", {op:breakpoint ? "add" : "remove", path})
		if (breakpoint) {
			setBreakpointsGet(breakpointsGet.concat(path.join("/")));
		} else {
			setBreakpointsGet(breakpointsGet.filter(p => p !== path.join("/")));
		}
	}

	const updatePathValue = (path, value) => {
		sendMessage("DS_set_path_value", {path, value});
	}

	return <div id="dev-panel">
		<p className='status acn-bb'>
			{status}
			{!validURL && <>
				<br/>
				<code>
					{urlValidators.map(validator => <>{validator.toString()}<br/></>)}
				</code>
				<Button color='danger' onClick={() => setUnsafeURLs(true)}>⚠️ Proceed anyway ⚠️</Button>
			</>}
		</p>
		<Inspector datastore={inspectedDataStore}
			setBreakpointSet={breakpointPathSet} setBreakpointGet={breakpointPathGet}
			breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet}
			updatePathValue={updatePathValue} />
		<OverrideEditor overrides={overrides} sendMessage={sendMessage} inspectedURL={inspectedURL} port={port}/>
	</div>;
	
}

export default MainDiv;
import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { evalScript, useInspectedURL, isHostWhitelisted, whitelistHost } from '../utils/extutils';
import { useExtMessaging } from '../plumbing/extmsg';
import { space } from '../base/utils/miscutils';
import Inspector from './Inspector';
import { setupHooks } from '../plumbing/DataStoreExtHooks';

const MainDiv = () => {

	const [hasDS, setHasDS] = useState(false);
	const [inspectedDataStore, setInspectedDataStore] = useState(null);
	const [unsafeURLs, setUnsafeURLs] = useState(false);
	
	const inspectedURL = useInspectedURL();
	const urlValidators = [
		/^(\w*\.)?good-loop\.com+$/g,
		/^(\w*\.)?sogive\.org+$/g,
	];
	const validated = urlValidators.map(validator => inspectedURL?.host.match(validator)).reduce((prev, cur) => prev || cur);
	const validURL = unsafeURLs || validated;

	const port = useExtMessaging();

	useEffect(() => {
		if (!validURL) {
			setHasDS(false);
			setInspectedDataStore(null);
		} else {
			let pvTestDS = evalScript("typeof DataStore !== 'undefined'");
			pvTestDS.promise.then (res => {
				setHasDS(res[0]);
				let pvDS = evalScript("DataStore");
				pvDS.promise.then (res => {
					setInspectedDataStore(res[0]);
				});
			});
		}
		// Always reset this option on URL change
		setUnsafeURLs(false);
		setupHooks(port);
	}, [inspectedURL]);

	let status = "";
	if (!validURL) status = "For safety, can only inspect hosts matching one of:"
	else if (hasDS) status = "DataStore loaded";
	else status = "DataStore not found";

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
		<Inspector datastore={inspectedDataStore} />
	</div>;
	
}

export default MainDiv;
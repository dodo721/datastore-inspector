import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { evalScript, useInspectedURL } from '../utils/extutils';
import { space } from '../base/utils/miscutils';
import Inspector from './Inspector';


const MainDiv = () => {

	const [hasDS, setHasDS] = useState(false);
	const [inspectedDataStore, setInspectedDataStore] = useState(null);
	
	const inspectedURL = useInspectedURL();
	const urlValidators = [
		/^(\w*\.)?good-loop\.com+$/g,
		/^(\w*\.)?sogive\.org+$/g,
	];
	const validURL = urlValidators.map(validator => inspectedURL?.host.match(validator)).reduce((prev, cur) => prev || cur);

	useEffect(() => {
		console.error(inspectedURL);
		if (!validURL) {
			setHasDS(false);
			setInspectedDataStore(null);
		} else {
			let pvTestDS = evalScript("typeof DataStore !== 'undefined'");
			pvTestDS.promise.then (res => {
				setHasDS(res[0]);
				let pvDS = evalScript("DataStore");
				pvDS.promise.then (res => {
					setInspectedDataStore(res);
				});
			});
		}
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
			</>}
		</p>
		<Inspector datastore={inspectedDataStore} />
	</div>;
	
}

export default MainDiv;
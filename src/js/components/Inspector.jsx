import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Tab, Tabs } from '../base/components/Tabs';
import { space } from '../base/utils/miscutils';
import _ from 'lodash';


const Inspector = ({datastore}) => {

	const [curTab, setCurTab] = useState("tab1");
	
    if (!datastore) return null;

	return <div className='inspector'>
		
		<JSONPreview obj={datastore} title="DataStore"/>

		{/*<InspectorSection title="AppState">
			<p>Test!</p>
			<InspectorSection title="Test2">
				<p>Wow</p>
				<InspectorSection title="Test3">
					<Button color='primary'>Oh No</Button>
				</InspectorSection>
				<p>Oes</p>
			</InspectorSection>
		</InspectorSection>*/}

		{/*<Tabs activeTabId={curTab} setActiveTabId={t => setCurTab(t)} >
            <Tab title="Tab 1" tabId="tab1">
                <h2>Tab 1 here</h2>
				<Button color="primary">Execute script</Button>
            </Tab>
            <Tab title={"Tab 2"} tabId="tab2">
                <h2>Wow! Tab 2!</h2>
            </Tab>
		</Tabs>*/}
	</div>;
}

const JSONPreview = ({obj, title}) => {

	let child = null;
	if (_.isArray(obj)) {
		child = obj.map((o, i) => <JSONPreview key={o} obj={o} title={i}/>)
	} else {
		let keys = Object.keys(obj);
		if (keys.length && typeof obj !== "string") {
			child = [];
			keys.forEach(key => {
				child.push(<JSONPreview key={key} obj={obj[key]} title={key}/>);
			})
		} else {
			child = <p className='leaf'><span className='type'>{typeof obj}</span> : <span className='value'>{obj.toString()}</span></p>;
		}
	}
	return <InspectorSection title={title}>
		{child}
	</InspectorSection>;
}

const InspectorSection = ({title, dfltOpen, children}) => {

	const [open, setOpen] = useState(dfltOpen);
	const arrow = open ? "▼" : "▶";

	return <div className={space('inspector-section', open&&"open")}>
		<p className='title' onClick={() => setOpen(!open)}>
			<span className='toggle'>{arrow}</span> {title}
		</p>
		{open && <div className='content acn-bl pl-3 py-1'>
			{children}
		</div>}
	</div>;

}


export default Inspector;
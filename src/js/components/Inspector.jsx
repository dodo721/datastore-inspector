import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Tab, Tabs } from '../base/components/Tabs';
import { space, ellipsize } from '../base/utils/miscutils';
import _ from 'lodash';


const Inspector = ({datastore}) => {

	const [curTab, setCurTab] = useState("tab1");
	
    if (!datastore) return null;

	return <div className='inspector'>
		
		<JSONPreview obj={datastore} title="DataStore"/>
	</div>;
}

const JSONPreview = ({obj, title}) => {
	
	let child = null;
	if (!obj) child = <p className='leaf'><span className='type'>{typeof obj}</span> : <span className='value'>{JSON.stringify(obj)}</span></p>;
	else if (_.isArray(obj)) {
		child = obj.map((o, i) => <JSONPreview key={o} obj={o} title={i}/>)
	} else {
		let keys = Object.keys(obj);
		if (keys.length && typeof obj !== "string") {
			child = [];
			keys.forEach(key => {
				const valPrev = ellipsize(JSON.stringify(obj[key]), 30);
				child.push(<JSONPreview key={key} obj={obj[key]} title={<>{key}: <span className='val-preview'>{valPrev}</span></>}/>);
			})
		} else {
			child = <p className='leaf'><span className='type'>{typeof obj}</span> : <span className='value'>{JSON.stringify(obj)}</span></p>;
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
import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Tab, Tabs } from '../base/components/Tabs';
import { space, ellipsize } from '../base/utils/miscutils';
import _ from 'lodash';


const Inspector = ({datastore, setBreakpointGet, setBreakpointSet, breakpointsGet, breakpointsSet}) => {

	const [curTab, setCurTab] = useState("tab1");
	
    if (!datastore) return null;

	return <div className='inspector'>
		<JSONPreview obj={datastore.appstate} title="DataStore AppState" path={[]} top
			noBreakpoint setBreakpointGet={setBreakpointGet} setBreakpointSet={setBreakpointSet}
			breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet}/>
	</div>;
}

const JSONPreview = ({obj, title, keyName, path, noBreakpoint, setBreakpointGet, setBreakpointSet, top, breakpointsGet, breakpointsSet}) => {

	let child = null;
	if (!obj) child = <p className='leaf'><span className='type'>{typeof obj}</span> : <span className='value'>{JSON.stringify(obj)}</span></p>;
	else if (_.isArray(obj)) {
		child = obj.map((o, i) => {
			const valPrev = ellipsize(JSON.stringify(o), 30);
			return <JSONPreview key={o} obj={o} keyName={i} path={path.concat(i)}
					setBreakpointGet={setBreakpointGet} setBreakpointSet={setBreakpointSet}
					breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet}
					title={<>{i}: <span className='val-preview'>{valPrev}</span></>}/>
		});
	} else {
		let keys = Object.keys(obj);
		if (keys.length && typeof obj !== "string") {
			child = [];
			keys.forEach(key => {
				const valPrev = ellipsize(JSON.stringify(obj[key]), 30);
				child.push(<JSONPreview key={key} obj={obj[key]} keyName={key} path={path.concat(key)}
							setBreakpointGet={setBreakpointGet} setBreakpointSet={setBreakpointSet}
							breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet}
							title={<>{key}: <span className='val-preview'>{valPrev}</span></>}/>);
			})
		} else {
			child = <p className='leaf'><span className='type'>{typeof obj}</span> : <span className='value'>{JSON.stringify(obj)}</span></p>;
		}
	}
	return <InspectorSection title={title} keyName={keyName} path={path} noBreakpoint={noBreakpoint} top={top}
				setBreakpointGet={setBreakpointGet} setBreakpointSet={setBreakpointSet}
				breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet}
			>
		{child}
	</InspectorSection>;
}

const InspectorSection = ({title, children, keyName, path, noBreakpoint, setBreakpointGet, setBreakpointSet, top, breakpointsGet, breakpointsSet}) => {

	const [open, setOpen] = useState(false);
	const arrow = open ? "▼" : "▶";
	
	const breakpointedGet = breakpointsGet.includes(path.join("/"));
	const breakpointedSet = breakpointsSet.includes(path.join("/"));

	// Is a parent breakpointed, and thus overriding us?
	/*let isSupersededGet = false;
	let isSupersededSet = false;

	if (!breakpointedGet) {
		breakpointsGet.forEach(pathStr => {
			let brPt = pathStr.split("/");
			// A parent can only be overriding us if they are above us
			if (brPt.length < path.length) {
				// if the nodes present in the shorter array match ours as far as they go, this is a parent
				if (pathStr === path.splice(0, brPt.length).join("/")) {
					isSupersededGet = true;
					return;
				}
			}
		});
	}

	if (!breakpointedSet) {
		breakpointsSet.forEach(pathStr => {
			let brPt = pathStr.split("/");
			// A parent can only be overriding us if they are above us
			if (brPt.length < path.length) {
				// if the nodes present in the shorter array match ours as far as they go, this is a parent
				if (pathStr === path.splice(0, brPt.length).join("/")) {
					isSupersededSet = true;
					return;
				}
			}
		});
	}*/

	const breakpointSet = e => {
		e.stopPropagation();
		setBreakpointSet(path, !breakpointedSet);
	}

	const breakpointGet = e => {
		e.stopPropagation();
		setBreakpointGet(path, !breakpointedGet);
	}

	//◈◆◇⟐
	let symbolGet = "◇";
	//if (isSupersededGet) symbolGet = "◈";
	if (breakpointedGet) symbolGet = "◆";

	let symbolSet = "◇";
	//if (isSupersededSet) symbolSet = "◈";
	if (breakpointedSet) symbolSet = "◆";

	return <div className={space('inspector-section', open&&"open")}>
		<div className='title d-flex flex-row justify-content-between align-items-center' onClick={() => setOpen(!open)}>
			<div><span className='toggle'>{arrow}</span> {title}</div>
			<div className='breakpoints'>
				{!noBreakpoint && <>
					<a className="breakpoint" onClick={e => breakpointGet(e)}>&nbsp;&nbsp;{symbolGet}</a>
					<a className="breakpoint" onClick={e => breakpointSet(e)}>{symbolSet}&nbsp;&nbsp;</a>
				</>}
				{top && <>
					<span className='breakpoint-title'>GET</span>
					<span className='breakpoint-title'>SET</span>
				</>}
			</div>
		</div>
		{open && <div className='content acn-bl pl-3 py-1'>
			{children}
		</div>}
	</div>;

}


export default Inspector;
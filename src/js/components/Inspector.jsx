import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { space, ellipsize } from '../base/utils/miscutils';
import _ from 'lodash';
import { FoldoutSection } from './Components';


const Inspector = ({datastore, setBreakpointGet, setBreakpointSet, breakpointsGet, breakpointsSet, updatePathValue}) => {
	
    if (!datastore) return null;

	return <div className='inspector'>
		<JSONPreview obj={datastore.appstate} title={<b>DataStore AppState</b>} path={[]} top
			noBreakpoint setBreakpointGet={setBreakpointGet} setBreakpointSet={setBreakpointSet}
			breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet} updatePathValue={updatePathValue}/>
	</div>;
}

const JSONPreview = ({obj, title, keyName, path, noBreakpoint, setBreakpointGet, setBreakpointSet, top, breakpointsGet, breakpointsSet, updatePathValue}) => {

	let child = null;
	if (!obj) child = <p className='leaf'><span className='type'>{typeof obj}</span> : <span className='value'>{JSON.stringify(obj)}</span></p>;
	else if (_.isArray(obj)) {
		child = obj.map((o, i) => {
			const valPrev = ellipsize(JSON.stringify(o), 30);
			return <JSONPreview key={o} obj={o} keyName={i} path={path.concat(i)}
					setBreakpointGet={setBreakpointGet} setBreakpointSet={setBreakpointSet}
					breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet}
					updatePathValue={updatePathValue}
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
							updatePathValue={updatePathValue}
							title={<>{key}: <span className='val-preview'>{valPrev}</span></>}/>);
			})
		} else {
			child = <LeafValueEditor value={obj} path={path} updatePathValue={updatePathValue}/>
		}
	}
	return <InspectorSection title={title} keyName={keyName} path={path} noBreakpoint={noBreakpoint} top={top}
				setBreakpointGet={setBreakpointGet} setBreakpointSet={setBreakpointSet}
				breakpointsGet={breakpointsGet} breakpointsSet={breakpointsSet}
			>
		{child}
	</InspectorSection>;
}


const LeafValueEditor = ({value, path, updatePathValue}) => {

	const [interimValue, setInterimValue] = useState(value);

	useEffect(() => {
		setInterimValue(value);
	}, [value]);

	const inputType = {
		"string": "text",
		"number": "number",
		"boolean": "checkbox"
	}[typeof value];

	const onValueChange = (e) => {
		const newVal = e.target.value;
		setInterimValue(newVal);
		updatePathValue(path, newVal);
	}

	return <div className='leaf d-flex flex-row justify-content-between'>
		<p className="type">{typeof value}</p>
		{inputType ? <input className='value' type={inputType} value={interimValue} onChange={onValueChange}/>
		: <p className='value'>{JSON.stringify(interimValue)}</p>}
	</div>
}


const InspectorSection = ({title, children, keyName, path, noBreakpoint, setBreakpointGet, setBreakpointSet, top, breakpointsGet, breakpointsSet}) => {

	const [open, setOpen] = useState(false);
	const arrow = open ? "▼" : "▶";
	
	const breakpointedGet = breakpointsGet.includes(path.join("/"));
	const breakpointedSet = breakpointsSet.includes(path.join("/"));

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

	return <FoldoutSection title={title} indent
		extras={
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
		}
	>
		{children}
	</FoldoutSection>;

}


export default Inspector;
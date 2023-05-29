import React from 'react';
import ReactDOM from 'react-dom';
// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';
import PropControls from './base/components/propcontrols/PropControls';
import PropControlCode from './base/components/propcontrols/PropControlCode';
import MainDiv from './components/MainDiv';

let dummy = PropControls && PropControlCode; // protect the unused PropControls import

ReactDOM.render(
	<MainDiv />,
	document.getElementById('mainDiv')
);

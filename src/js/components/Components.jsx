import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { space, ellipsize } from '../base/utils/miscutils';
import _ from 'lodash';

export const FoldoutSection = ({title, extras, children, className, indent}) => {

	const [open, setOpen] = useState(false);
	const arrow = open ? "▼" : "▶";

	return <div className={space('inspector-section', open&&"open", className)}>
		<div className='title d-flex flex-row justify-content-between align-items-center' onClick={() => setOpen(!open)}>
			<div><span className='toggle'>{arrow}</span> {title}</div>
            {extras}
		</div>
		{open && <div className={space('content acn-bl py-1', indent && 'pl-3')}>
			{children}
		</div>}
	</div>;

};


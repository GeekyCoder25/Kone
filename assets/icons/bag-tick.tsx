import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const BagTickIcon = (props: SvgProps) => (
	<Svg width={20} height={21} fill="none" {...props}>
		<Path
			fill={props.color || '#fff'}
			d="M16.633 7.967c-.558-.617-1.4-.975-2.566-1.1v-.634a4.06 4.06 0 0 0-1.334-3.008A4.04 4.04 0 0 0 9.6 2.183c-1.992.192-3.667 2.117-3.667 4.2v.484c-1.166.125-2.008.483-2.566 1.1-.809.9-.784 2.1-.692 2.933l.583 4.642c.175 1.625.834 3.291 4.417 3.291h4.65c3.583 0 4.242-1.666 4.417-3.283l.583-4.658c.092-.825.117-2.025-.692-2.925M9.717 3.342a2.9 2.9 0 0 1 3.191 2.891v.584H7.092v-.434c0-1.483 1.225-2.908 2.625-3.041M10 15.983a3.16 3.16 0 0 1-3.158-3.158A3.16 3.16 0 0 1 10 9.667a3.16 3.16 0 0 1 3.158 3.158A3.16 3.16 0 0 1 10 15.983"
		/>
		<Path
			fill={props.color || '#fff'}
			d="M9.525 14.367a.62.62 0 0 1-.442-.184l-.825-.825a.63.63 0 0 1 0-.883.63.63 0 0 1 .884 0l.4.4 1.333-1.233a.63.63 0 0 1 .883.033.63.63 0 0 1-.033.883L9.95 14.2a.65.65 0 0 1-.425.167"
		/>
	</Svg>
);
export default BagTickIcon;

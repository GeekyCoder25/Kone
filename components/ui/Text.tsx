import React from 'react';
import {Text as RNText, TextProps} from 'react-native';
import {twMerge} from 'tailwind-merge';

interface Props extends TextProps {}

export const Text = ({className, children, ...props}: Props) => {
	return (
		<RNText
			className={`${
				!className?.includes('poppins') ? 'font-poppins-medium' : ''
			} ${className}`}
			{...props}
		>
			{children}
		</RNText>
	);
};

export default Text;

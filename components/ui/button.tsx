import {ActivityIndicator, TouchableOpacity} from 'react-native';
import React from 'react';
import Text from './Text';

interface ButtonProps {
	title: string;
	onPress: (() => void) | ((param?: any) => Promise<void>);
	isLoading?: boolean;
	disabled?: boolean;
	className?: string;
	variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = props => {
	const getVariantClass = () => {
		switch (props.variant) {
			case 'secondary':
				return 'bg-gray-500';
			case 'outline':
				return 'bg-transparent border border-button';
			case 'primary':
			default:
				return props.disabled ? 'bg-[#a3d4a5]' : 'bg-button';
		}
	};

	return (
		<TouchableOpacity
			className={`${getVariantClass()} rounded-full p-6 w-full items-center justify-center ${
				props.className
			}`}
			onPress={props.onPress}
			disabled={props.isLoading || props.disabled || false}
		>
			{props.isLoading ? (
				<ActivityIndicator size={'small'} color={'#fff'} />
			) : (
				<Text
					className={`text-xl ${
						props.variant === 'outline' ? 'text-button' : 'text-white'
					}`}
				>
					{props.title}
				</Text>
			)}
		</TouchableOpacity>
	);
};

export default Button;

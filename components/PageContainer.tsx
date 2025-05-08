import {Colors} from '@/constants/Colors';
import {StatusBar} from 'expo-status-bar';
import React from 'react';
import {Keyboard, Platform, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	noPadding?: boolean;
}
const PageContainer = ({
	children,
	className,
	noPadding,
}: PageContainerProps) => {
	return (
		<>
			<StatusBar
				hidden={false}
				backgroundColor={Colors.primary}
				style={Platform.OS === 'android' ? 'light' : 'dark'}
			/>
			<SafeAreaView
				className={`flex-1 ${noPadding ? '' : 'p-4'} bg-white ${
					className || ''
				}`}
				edges={['top', 'left', 'right']}
			>
				{children}
			</SafeAreaView>
		</>
	);
};

export default PageContainer;

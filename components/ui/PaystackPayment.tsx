import React from 'react';
import {Modal, View} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';
import Back from './back';
import {SafeAreaView} from 'react-native-safe-area-context';

interface PaystackPaymentProps {
	isVisible: boolean;
	onClose: () => void;
	onSuccess: () => void;
	paymentUrl: string;
}

export const PaystackPayment = ({
	isVisible,
	onClose,
	onSuccess,
	paymentUrl,
}: PaystackPaymentProps) => {
	const handleNavigationStateChange = (state: WebViewNavigation) => {
		// Check if the URL is your success callback URL
		if (state.url.includes('google.com')) {
			onSuccess();
			onClose();
		}
	};

	return (
		<Modal
			visible={isVisible}
			animationType="none"
			transparent={false}
			onRequestClose={onClose}
		>
			<SafeAreaView
				className="flex-1 justify-center"
				edges={['top', 'bottom', 'right', 'left']}
			>
				<View className="px-4 py-10">
					<Back onPress={() => onClose()} />
				</View>
				<View className="flex-1">
					<WebView
						source={{uri: paymentUrl}}
						onNavigationStateChange={handleNavigationStateChange}
						startInLoadingState={true}
						javaScriptEnabled={true}
						domStorageEnabled={true}
					/>
				</View>
			</SafeAreaView>
		</Modal>
	);
};

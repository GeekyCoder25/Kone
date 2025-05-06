import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import {useEffect, useState} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../globals.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded] = useFonts({
		'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
		'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
		'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
		'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
		'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
		'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
		'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
		'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
		'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
	});

	const [queryClient] = useState(() => new QueryClient());

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<Stack screenOptions={{headerShown: false}} />
			<Toast />
		</QueryClientProvider>
	);
}

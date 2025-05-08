import {ACCESS_TOKEN_KEY, LAST_LOGIN} from '@/constants';
import {MemoryStorage} from '@/utils/storage';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect} from 'react';
import {ActivityIndicator, Image, Platform, View} from 'react-native';
import {getUserProfile} from '@/services/apis/user';
import {useGlobalStore} from '@/context/store';

const Splash = () => {
	const {setUser} = useGlobalStore();
	useEffect(() => {
		const checkIfLoggedIn = async () => {
			const storage = new MemoryStorage();
			const lastLogin = await storage.getItem(LAST_LOGIN);
			if (lastLogin === null) {
				return router.replace('/auth/get-started');
			} else {
				const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
				if (accessToken) {
					try {
						const response = await getUserProfile();
						const user = response.data;
						setUser(user.attributes);
						if (user.attributes.is_buyer) {
							return router.replace('/buyer/(tabs)');
						} else {
							return router.replace('/seller/(tabs)');
						}
					} catch (error) {
						console.error('Error fetching user profile:', error);
						await storage.removeItem(ACCESS_TOKEN_KEY);
						return router.replace('/auth/login');
					}
				} else {
					return router.replace('/auth/login');
				}
			}
		};
		checkIfLoggedIn();
	}, []);

	return (
		<View className="bg-primary flex-1 justify-center items-center">
			<StatusBar hidden style={Platform.OS === 'android' ? 'light' : 'dark'} />
			<View className="relative w-1/2 h-1/2 justify-center items-center">
				<Image
					source={require('@/assets/images/splash-icon.png')}
					resizeMode="contain"
					className="w-full h-full"
				/>
				<View className="absolute bottom-0">
					<ActivityIndicator size="large" color="#ffffff" />
				</View>
			</View>
		</View>
	);
};

export default Splash;

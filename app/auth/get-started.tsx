import {View, ImageBackground, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Button from '@/components/ui/button';
import Text from '@/components/ui/Text';
import {StatusBar} from 'expo-status-bar';
import {router} from 'expo-router';

const GetStarted = () => {
	return (
		<ImageBackground
			source={require('@/assets/images/get-started.png')}
			className="flex-1 justify-center items-center"
		>
			<StatusBar hidden />
			<SafeAreaView className="flex-1 p-4">
				<View className="justify-center items-center">
					<Image
						source={require('@/assets/images/splash-icon.png')}
						className="mb-4 w-[200px] h-[200px]"
						resizeMode="contain"
					/>

					<View>
						<Text className="text-6xl text-center text-white leading-tight">
							Your One-Stop
						</Text>
						<Text className="text-6xl text-center text-button leading-tight">
							Agro Marketplace
						</Text>
					</View>
				</View>
				<View className="flex-1 justify-end mt-4 mb-20">
					<Button
						title="Get started"
						onPress={() => router.push('/auth/account-type')}
						className="bg-primary"
					/>
					<View className="flex-row justify-center items-center gap-x-1 mt-6 text-center">
						<Text className="text-white text-sm">Already have an account?</Text>
						<TouchableOpacity onPress={() => router.push('/auth/login')}>
							<Text className="font-poppins-semibold text-button text-base">
								Sign in
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
};

export default GetStarted;

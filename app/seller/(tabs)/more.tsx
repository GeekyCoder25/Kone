import React, {useCallback, useState} from 'react';
import {Image, TouchableOpacity, View, Switch, Alert} from 'react-native';
import {Text} from '@/components/ui/Text';
import {MemoryStorage} from '@/utils/storage';
import {ACCESS_TOKEN_KEY} from '@/constants';
import PageContainer from '@/components/PageContainer';
import {router, useFocusEffect} from 'expo-router';
import {
	FontAwesome,
	FontAwesome6,
	Ionicons,
	MaterialIcons,
} from '@expo/vector-icons';
import {useGlobalStore} from '@/context/store';
import {ScrollView} from 'react-native';
import {Colors} from '@/constants/Colors';
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';
import {getUserProfile, switchMode} from '@/services/apis/user';

export default function MoreScreen() {
	const {user, setUser} = useGlobalStore();
	const queryClient = useQueryClient();
	const [isSellerMode, setIsSellerMode] = useState(user?.is_seller);

	const {data: profileData} = useQuery({
		queryKey: ['profile'],
		queryFn: getUserProfile,
		refetchOnWindowFocus: true,
	});

	// Use mutation for switching modes
	const switchModeMutation = useMutation({
		mutationFn: switchMode,
		onSuccess: data => {
			router.push('/');
			queryClient.invalidateQueries({queryKey: ['profile']});
		},
		onError: error => {
			console.error('Failed to switch mode:', error);
		},
	});

	// Toggle between seller and buyer mode
	const toggleMode = () => {
		switchModeMutation.mutate();
		setIsSellerMode(!isSellerMode);
	};

	useFocusEffect(
		useCallback(() => {
			queryClient.invalidateQueries({queryKey: ['profile']});
			if (profileData) {
				setUser(profileData.data.attributes);
				setIsSellerMode(profileData.data.attributes.is_seller);
			}
		}, [profileData])
	);

	const handleLogout = () => {
		Alert.alert('Log Out', 'Are you sure you want to log out?', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Log Out',
				onPress: () => {
					const storage = new MemoryStorage();
					storage.removeItem(ACCESS_TOKEN_KEY);
					setUser(null);
					router.replace('/auth/login');
				},
				style: 'destructive',
			},
		]);
	};

	const routes: {
		route:
			| '/profile'
			| '/buyer/wishlist'
			| '/support'
			| '/address'
			| '/change-password';
		title: string | undefined;
		sub: string | undefined;
		icon: React.JSX.Element;
	}[] = [
		{
			route: '/profile',
			title: user?.name,
			sub: user?.email,
			icon: user?.profile_photo ? (
				<Image
					source={{uri: user.profile_photo}}
					width={60}
					height={60}
					className="rounded-full"
				/>
			) : (
				<View className="w-16 h-16 rounded-full bg-[#e4f5e5] flex items-center justify-center">
					<MaterialIcons name="person" size={40} color={Colors.primary} />
				</View>
			),
		},
		// {
		// 	route: '/support',
		// 	title: 'Support',
		// 	sub: 'Report an issue',
		// 	icon: (
		// 		<View className="w-16 h-16 rounded-full bg-[#e4f5e5] flex items-center justify-center">
		// 			<MaterialIcons
		// 				name="contact-support"
		// 				size={40}
		// 				color={Colors.primary}
		// 			/>
		// 		</View>
		// 	),
		// },
		// {
		// 	route: '/address',
		// 	title: 'Address',
		// 	sub: 'Manage your addresses',
		// 	icon: (
		// 		<View className="w-16 h-16 rounded-full bg-[#e4f5e5] flex items-center justify-center">
		// 			<FontAwesome name="address-book" size={26} color={Colors.primary} />
		// 		</View>
		// 	),
		// },
		{
			route: '/change-password',
			title: 'Change password',
			sub: 'Update your password',
			icon: (
				<View className="w-16 h-16 rounded-full bg-[#e4f5e5] flex items-center justify-center">
					<MaterialIcons name="password" size={30} color={Colors.primary} />
				</View>
			),
		},
	];

	return (
		<PageContainer className="bg-[#fafafa]">
			<TouchableOpacity
				className="flex-row items-center gap-x-3 mb-3"
				onPress={router.back}
			>
				<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
				<Text className="text-[#353535] font-poppins-semibold text-lg">
					More
				</Text>
			</TouchableOpacity>

			{/* Mode Switch UI */}
			<View className="flex-row items-center justify-between py-4 px-3 bg-white rounded-lg mt-4 mb-2">
				<View>
					<Text className="font-poppins-semibold text-[#353535] text-lg">
						{isSellerMode ? 'Seller Mode' : 'Buyer Mode'}
					</Text>
					<Text className="text-sm text-[#666] mt-1">
						Switch between buyer and seller
					</Text>
				</View>
				<View className="flex-row items-center">
					<Text className="mr-2 text-[#353535]">
						{isSellerMode ? 'ON' : 'OFF'}
					</Text>
					<Switch
						trackColor={{false: '#d1d1d1', true: '#c5e3c6'}}
						thumbColor={isSellerMode ? Colors.primary : '#f4f3f4'}
						ios_backgroundColor="#d1d1d1"
						onValueChange={toggleMode}
						value={isSellerMode}
						disabled={switchModeMutation.isPending}
					/>
				</View>
			</View>

			{/* Loading state for mode switch */}
			{switchModeMutation.isPending && (
				<View className="bg-yellow-50 px-3 py-2 rounded mb-2">
					<Text className="text-yellow-700 text-sm">Switching mode...</Text>
				</View>
			)}

			{/* Error state for mode switch */}
			{switchModeMutation.isError && (
				<View className="bg-red-50 px-3 py-2 rounded mb-2">
					<Text className="text-red-700 text-sm">
						Failed to switch mode. Please try again.
					</Text>
				</View>
			)}

			<ScrollView className="my-4">
				{routes.map(route => (
					<TouchableOpacity
						onPress={() => router.push(route.route)}
						key={route.route}
						className="flex-row gap-x-4 items-center bg-white px-3 py-5 rounded-lg mb-5"
					>
						{route.icon}
						<View className="flex-1">
							<Text className="font-poppins-semibold text-[#353535] text-xl">
								{route.title}
							</Text>
							<Text className="text-sm text-[#222227] mt-1">{route.sub}</Text>
						</View>
						<FontAwesome6 name="chevron-right" size={16} color="#292D32" />
					</TouchableOpacity>
				))}

				{/* Logout Button */}
				<TouchableOpacity
					onPress={handleLogout}
					className="flex-row gap-x-4 items-center bg-white px-3 py-5 rounded-lg mb-5"
				>
					<View className="w-16 h-16 rounded-full bg-[#ffe5e5] flex items-center justify-center">
						<MaterialIcons name="logout" size={30} color="#FF4040" />
					</View>
					<View className="flex-1">
						<Text className="font-poppins-semibold text-[#353535] text-xl">
							Logout
						</Text>
						<Text className="text-sm text-[#222227] mt-1">
							Sign out from account
						</Text>
					</View>
					<FontAwesome6 name="chevron-right" size={16} color="#292D32" />
				</TouchableOpacity>
			</ScrollView>
		</PageContainer>
	);
}

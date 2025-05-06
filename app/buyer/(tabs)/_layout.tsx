import {Tabs} from 'expo-router';
import React from 'react';
import {Platform} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {Colors} from '@/constants/Colors';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: Colors.primary,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Explore',
					tabBarIcon: ({color, size}) => (
						<MaterialCommunityIcons name="compass" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="orders"
				options={{
					title: 'My orders',
					tabBarIcon: ({color, size}) => (
						<MaterialCommunityIcons name="shopping" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="store"
				options={{
					title: 'My cart',
					tabBarIcon: ({color, size}) => (
						<MaterialCommunityIcons name="cart" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="wishlist"
				options={{
					title: 'Wishlist',
					tabBarIcon: ({color, size}) => (
						<Ionicons name="heart" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: 'More',
					tabBarIcon: ({color, size}) => (
						<MaterialCommunityIcons
							name="view-grid"
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}

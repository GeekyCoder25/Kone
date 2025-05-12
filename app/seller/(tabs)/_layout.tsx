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
				tabBarStyle: Platform.select({
					ios: {
						position: 'absolute',
					},
					default: {},
				}),
				tabBarActiveTintColor: Colors.primary,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Dashboard',
					tabBarIcon: ({color, size}) => (
						<MaterialCommunityIcons
							name="view-dashboard"
							size={size}
							color={color}
						/>
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
					title: 'My store',
					tabBarIcon: ({color, size}) => (
						<MaterialCommunityIcons name="store" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="wallet"
				options={{
					title: 'Wallet',
					tabBarIcon: ({color, size}) => (
						<Ionicons name="wallet" size={size} color={color} />
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

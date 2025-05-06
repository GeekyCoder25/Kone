import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {router} from 'expo-router';

const Back = ({onPress}: {onPress?: () => void}) => {
	return (
		<View className="flex-row">
			<TouchableOpacity
				onPress={() => (onPress ? onPress() : router.back())}
				className="w-10 h-10 justify-center items-center rounded-full bg-[#cde3d6]"
			>
				<FontAwesome6 name="chevron-left" size={16} color="#6aab85" />
			</TouchableOpacity>
		</View>
	);
};

export default Back;

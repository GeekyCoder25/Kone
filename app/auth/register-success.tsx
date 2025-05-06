import {View, Image} from 'react-native';
import {router} from 'expo-router';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/button';
import SuccessIcon from '@/assets/icons/success';
import PageContainer from '@/components/PageContainer';

export default function RegisterSuccess() {
	return (
		<PageContainer>
			<View className="flex-1 bg-white px-4 py-10">
				<View className="flex-1 items-center space-y-6">
					<SuccessIcon />

					<View className="my-10">
						<Text className="text-3xl text-center text-[#353535] font-poppins-semibold">
							Account created successfully!
						</Text>
						<Text className="mt-1 text-base text-center text-[#848484]">
							Your account has been created successfully. Please login to
							continue.
						</Text>
					</View>
				</View>
				<Button
					title="Continue to Login"
					className="w-full mt-6"
					onPress={() => router.replace('/auth/login')}
				/>
			</View>
		</PageContainer>
	);
}

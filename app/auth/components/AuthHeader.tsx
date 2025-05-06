import {View} from 'react-native';
import React, {FC} from 'react';
import Back from '@/components/ui/back';
import LogoIcon from '@/assets/icons/logo';
import Text from '@/components/ui/Text';

const AuthHeader: FC<{title: string; sub: string}> = ({title, sub}) => {
	return (
		<View>
			<Back />
			<View className="gap-y-8 my-10 items-center justify-center">
				<LogoIcon />
				<View>
					<Text className="text-3xl text-center text-[#353535] font-poppins-semibold">
						{title}
					</Text>
					<Text className="mt-1 text-base text-center text-[#848484]">
						{sub}
					</Text>
				</View>
			</View>
		</View>
	);
};

export default AuthHeader;

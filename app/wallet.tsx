import {
	View,
	TouchableOpacity,
	FlatList,
	StatusBar,
	SafeAreaView,
	ActivityIndicator,
	Alert,
} from 'react-native';
import React, {useState} from 'react';
import {router} from 'expo-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';

import Text from '@/components/ui/Text';
import WithdrawalModal from '@/components/WithdrawalModal';
import {useGlobalStore} from '@/context/store';
import {amountFormat} from '@/utils';
import {MaterialIcons} from '@expo/vector-icons';
import PageContainer from '@/components/PageContainer';
import {listTransactions, TransactionItem} from '@/services/apis/user';
import {Colors} from '@/constants/Colors';
import {requestWithdrawal} from '@/services/apis/bank';

const Wallet: React.FC = () => {
	const queryClient = useQueryClient();
	const {user} = useGlobalStore();
	const [isWithdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
	const [withdrawalData, setWithdrawalData] = useState({
		amount: 0,
		accountNumber: '',
		bankName: '',
	});
	const {data: transactionData, isLoading} = useQuery({
		queryKey: ['wallet'],
		queryFn: listTransactions,
	});

	// Sample wallet data
	const walletData = {
		balance: user?.wallet_balance,
		transactions: transactionData?.data || [],
	};

	const {mutate: withdrawalMutation} = useMutation({
		mutationFn: requestWithdrawal,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['profile']});
			queryClient.invalidateQueries({queryKey: ['wallet']});
			Alert.alert(
				'Withdrawal Initiated',
				`Your withdrawal request of ₦${withdrawalData.amount} to ${withdrawalData.bankName} (${withdrawalData.accountNumber}) has been initiated and will be processed within 24 hours.`,
				[{text: 'OK'}]
			);
		},
		onError: (error: any) => {
			console.log(error.response?.data);
			Alert.alert(
				'Error',
				`Failed to request withdrawal: ${
					error.response?.data?.message || error.message
				}`
			);
		},
	});

	const handleWithdrawal = () => {
		setWithdrawalModalVisible(true);
	};

	const handleWithdrawalSubmit = (
		amount: number,
		bankDetails: {
			bankId: number;
			bankName: string;
			accountNumber: string;
			accountName: string;
		}
	) => {
		setWithdrawalData({
			amount,
			accountNumber: bankDetails.accountNumber,
			bankName: bankDetails.bankName,
		});
		withdrawalMutation({amount, bank_id: bankDetails.bankId});
	};

	const renderTransactionItem = ({item}: {item: TransactionItem}) => (
		<View className="flex-row items-center px-4 py-3 border-b border-gray-100">
			{/* Transaction type icon */}
			<View
				className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
					item.attributes.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
				}`}
			>
				<Feather
					name={
						item.attributes.type === 'credit'
							? 'arrow-down-left'
							: 'arrow-up-right'
					}
					size={18}
					color={item.attributes.type === 'credit' ? '#10B981' : '#EF4444'}
				/>
			</View>

			{/* Transaction details */}
			<View className="flex-1">
				<Text className="font-poppins-medium text-base">
					{item.attributes.type === 'credit' ? 'Received' : 'Withdrawal'}
				</Text>
				<Text className="text-gray-500 text-xs" numberOfLines={1}>
					{item.attributes.description}
				</Text>
				<Text className="text-gray-400 text-xs mt-1">
					{item.attributes.created_at}
				</Text>
			</View>

			{/* Amount */}
			<View className="items-end">
				<Text
					className={`font-poppins-semibold ${
						item.attributes.type === 'credit'
							? 'text-green-600'
							: 'text-red-500'
					}`}
				>
					{item.attributes.type === 'credit' ? '+' : '-'}₦
					{amountFormat(Number(item.attributes.amount))}
				</Text>
				<View className="bg-gray-100 rounded-full px-2 py-1 mt-1">
					<Text className="text-gray-600 text-xs capitalize">
						{item.attributes.status}
					</Text>
				</View>
			</View>
		</View>
	);

	// Empty state component
	const renderEmptyTransactions = () => (
		<View className="flex-1 justify-center items-center py-10">
			<View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
				<Feather name="credit-card" size={40} color="#9CA3AF" />
			</View>
			<Text className="font-poppins-semibold text-lg text-gray-800 mb-2">
				No transactions yet
			</Text>
			<Text className="text-gray-500 text-center px-10 mb-6">
				Your transactions will appear here once you start selling or making
				withdrawals
			</Text>
		</View>
	);

	return (
		<PageContainer noPadding>
			{/* Header */}
			<View className="flex-row items-center px-4 py-3 border-b border-gray-100">
				<TouchableOpacity onPress={() => router.back()} className="mr-4">
					<Feather name="chevron-left" size={24} color="#000" />
				</TouchableOpacity>
				<Text className="text-xl font-poppins-semibold">Wallet</Text>
				<View className="flex-1" />
				<TouchableOpacity onPress={() => router.push('/notifications')}>
					<MaterialIcons name="notifications-none" size={24} color="#333" />
				</TouchableOpacity>
			</View>

			{/* Wallet Balance Card */}
			<View className="mx-4 my-4 p-5 bg-green-600 rounded-xl">
				<Text className="text-white text-base mb-1">Wallet Balance</Text>
				<Text className="text-white text-3xl font-poppins-semibold mb-1">
					{amountFormat(walletData.balance || 0)}
				</Text>

				{/* Withdraw button */}
				<TouchableOpacity
					onPress={handleWithdrawal}
					className="bg-white py-3 rounded-lg mt-4 items-center"
				>
					<Text className="text-green-600 font-poppins-medium">
						Withdraw Funds
					</Text>
				</TouchableOpacity>
			</View>

			{/* Transaction History */}
			<View className="flex-1">
				<View className="flex-row justify-between items-center px-4 py-2 bg-gray-50">
					<Text className="font-poppins-medium text-gray-700">
						Transaction History
					</Text>
					<TouchableOpacity className="flex-row items-center">
						<Text className="text-green-600 text-sm mr-1">Filter</Text>
						<Feather name="filter" size={14} color="#10B981" />
					</TouchableOpacity>
				</View>

				{/* Transactions list or empty state */}
				{isLoading ? (
					<View className="flex-1 justify-center items-center">
						<ActivityIndicator size={'large'} color={Colors.primary} />
					</View>
				) : walletData.transactions.length > 0 ? (
					<FlatList
						data={walletData.transactions}
						renderItem={renderTransactionItem}
						keyExtractor={item => item.id.toString()}
					/>
				) : (
					renderEmptyTransactions()
				)}
			</View>

			{/* Withdrawal Modal */}
			<WithdrawalModal
				isVisible={isWithdrawalModalVisible}
				onClose={() => setWithdrawalModalVisible(false)}
				onSubmit={handleWithdrawalSubmit}
				currentBalance={`${walletData.balance}`}
			/>

			{/* Bottom Info */}
			<View className="px-4 py-3 border-t border-gray-100">
				<Text className="text-center text-gray-500 text-xs">
					For any issues with your wallet, please contact support
				</Text>
			</View>
		</PageContainer>
	);
};

export default Wallet;

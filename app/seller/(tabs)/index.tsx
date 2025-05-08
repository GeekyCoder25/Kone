import React, {useState, useEffect} from 'react';
import {
	View,
	ScrollView,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	Dimensions,
	ImageBackground,
} from 'react-native';
import {Text} from '@/components/ui/Text';
import {MaterialIcons} from '@expo/vector-icons';
import {amountFormat} from '@/utils';
import {useGlobalStore} from '@/context/store';
import {useQuery} from '@tanstack/react-query';
import PageContainer from '@/components/PageContainer';
import {router} from 'expo-router';
import {LineChart} from 'react-native-chart-kit';
import {
	getSalesData,
	getSellerStats,
	getRevenueStats,
} from '@/services/apis/sales';
import {Colors} from '@/constants/Colors';

export default function SellerDashboardScreen() {
	const {user} = useGlobalStore();
	const [revenueTimeFrame, setRevenueTimeFrame] = useState('This Month');
	const [timeFrame, setTimeFrame] = useState('This Week');

	const {data: salesData, isLoading: loadingSales} = useQuery({
		queryKey: ['salesData', timeFrame],
		queryFn: () => getSalesData(timeFrame),
	});

	const {data: statsData, isLoading: loadingStats} = useQuery({
		queryKey: ['sellerStats'],
		queryFn: getSellerStats,
	});

	const {data: revenueData, isLoading: loadingRevenue} = useQuery({
		queryKey: ['revenueStats', timeFrame],
		queryFn: () => getRevenueStats(timeFrame),
	});

	const statsInfo = statsData?.data || {
		completed_sales: 0,
		sales_in_progress: 0,
		total_earned: '0',
		earned_this_month: '0',
	};

	const chartConfig = {
		backgroundGradientFrom: '#fff',
		backgroundGradientTo: '#fff',
		color: (opacity = 1) => `rgba(106, 171, 133, ${opacity})`,
		strokeWidth: 2,
		barPercentage: 0.5,
		useShadowColorFromDataset: true,
		propsForDots: {
			r: '3',
			strokeWidth: '1',
			stroke: '#6AAB85',
		},
	};

	const screenWidth = Dimensions.get('window').width * 0.93;

	// Process revenue chart data
	const getChartLabels = () => {
		if (!revenueData?.data?.revenue_stats)
			return timeFrame === 'This Week'
				? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
				: [
						'Jan',
						'Feb',
						'Mar',
						'Apr',
						'May',
						'Jun',
						'Jul',
						'Aug',
						'Sep',
						'Oct',
						'Nov',
						'Dec',
				  ];

		return timeFrame === 'This Week'
			? revenueData.data.revenue_stats.byWeek.map(item =>
					item.label.substring(0, 3)
			  )
			: revenueData.data.revenue_stats.byMonth.map(item =>
					item.label.substring(0, 3)
			  );
	};

	const getRevenueValues = () => {
		if (!revenueData?.data?.revenue_stats) return [0, 3000, 2500, 3500, 3000];

		const dataSource =
			timeFrame === 'This Week'
				? revenueData.data.revenue_stats.byWeek
				: revenueData.data.revenue_stats.byMonth;

		return dataSource.map(item =>
			typeof item.value === 'string'
				? parseFloat(item.value || '0')
				: item.value || 0
		);
	};

	const revenueChartData = {
		labels: getChartLabels(),
		datasets: [
			{
				data: getRevenueValues(),
				color: (opacity = 1) => `rgba(106, 171, 133, ${opacity})`,
				strokeWidth: 2,
			},
		],
		legend: ['Revenue'],
	};

	const salesPerformanceData = {
		labels: getChartLabels(),
		datasets: [
			{
				data: salesData?.performance_chart || [],
				color: () => Colors.button,
				strokeWidth: 2,
			},
		],
		legend: ['Sales'],
	};

	const TimeFrameSelector = ({
		label,
		onPress,
	}: {
		label: string;
		onPress: () => void;
	}) => (
		<TouchableOpacity onPress={onPress}>
			<View className="flex-row items-center">
				<Text className="text-sm text-gray-600 mr-1">{label}</Text>
				<MaterialIcons name="keyboard-arrow-down" size={18} color="#666" />
			</View>
		</TouchableOpacity>
	);

	const StatCard = ({
		title,
		value,
		isCurrency,
	}: {
		title: string;
		value: string | number;
		isCurrency?: boolean;
	}) => (
		<ImageBackground
			source={require('../../../assets/images/card-bg.jpg')}
			className="flex-1 rounded-lg mr-3 p-4 w-[150px]"
		>
			<View className="flex-row items-center mb-1">
				<MaterialIcons name="check-circle-outline" size={16} color="#022711" />
				<Text className="text-xs text-gray-700 ml-1">{title}</Text>
			</View>
			<Text className="text-2xl font-poppins-semibold">
				{isCurrency && '₦'}
				{value}
			</Text>
		</ImageBackground>
	);

	if (loadingSales || loadingStats || loadingRevenue) {
		return (
			<PageContainer>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color="#6AAB85" />
				</View>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="flex-row justify-between items-center mt-3 mb-6">
					<View className="flex-row gap-x-3 items-center">
						<TouchableOpacity onPress={() => router.push('/profile')}>
							{user?.profile_photo ? (
								<Image
									source={{uri: user.profile_photo}}
									width={40}
									height={40}
									className="rounded-full"
								/>
							) : (
								<View className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
									<MaterialIcons name="person" size={24} color="#fff" />
								</View>
							)}
						</TouchableOpacity>
						<Text className="text-xl font-poppins-semibold">Welcome back</Text>
					</View>
					<TouchableOpacity onPress={() => router.push('/notifications')}>
						<MaterialIcons name="notifications-none" size={24} color="#333" />
					</TouchableOpacity>
				</View>

				{/* Stats Cards */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<StatCard
						title="Total completed sale"
						value={statsInfo.completed_sales.toLocaleString() || '0'}
					/>
					<StatCard
						title="In progress sale"
						value={statsInfo.sales_in_progress || '0'}
					/>
					<StatCard
						title="Total Money earned"
						value={amountFormat(Number(statsInfo.total_earned || '0'))}
						isCurrency
					/>
					<StatCard
						title={`Money earned in ${new Date().toLocaleString('default', {
							month: 'long',
						})}`}
						value={amountFormat(Number(statsInfo.earned_this_month || '0'))}
						isCurrency
					/>
				</ScrollView>

				{/* Revenue Chart */}
				<View className="bg-white rounded-lg py-4 mb-6">
					<View className="flex-row justify-between items-center mb-2">
						{revenueTimeFrame === 'All Time' ? (
							<View>
								<Text className="text-gray-500 text-sm">
									Your total revenue so far
								</Text>
								<Text className="text-2xl font-poppins-semibold">
									₦{amountFormat(parseFloat(statsInfo.total_earned) || 0)}
								</Text>
							</View>
						) : (
							<View>
								<Text className="text-gray-500 text-sm">
									Your total revenue this month
								</Text>
								<Text className="text-2xl font-poppins-semibold">
									₦
									{amountFormat(parseFloat(statsInfo.earned_this_month || '0'))}
								</Text>
							</View>
						)}
						<TimeFrameSelector
							label={revenueTimeFrame}
							onPress={() => {
								// Toggle between "This Week" and "This Month"
								setRevenueTimeFrame(prev =>
									prev === 'This Month' ? 'All Time' : 'This Month'
								);
							}}
						/>
					</View>

					{/* <LineChart
						data={revenueChartData}
						width={screenWidth}
						height={180}
						chartConfig={chartConfig}
						bezier
						withVerticalLines={false}
						withHorizontalLines={true}
						withVerticalLabels={true}
						withHorizontalLabels={true}
						fromZero={true}
						style={{
							marginVertical: 8,
							borderRadius: 16,
						}}
					/> */}
				</View>

				{/* Sales Performance */}
				<View className="bg-white rounded-lg py-4 mb-6">
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-lg font-poppins-semibold">
							Sales Performance
						</Text>
						<TimeFrameSelector
							label={timeFrame}
							onPress={() => {
								setTimeFrame(prev =>
									prev === 'This Week' ? 'This Month' : 'This Week'
								);
							}}
						/>
					</View>

					<LineChart
						data={salesPerformanceData}
						width={screenWidth}
						height={180}
						chartConfig={chartConfig}
						bezier
						withVerticalLines={false}
						withHorizontalLines={true}
						withVerticalLabels={true}
						withHorizontalLabels={true}
						fromZero={true}
						style={{
							marginVertical: 8,
							borderRadius: 16,
						}}
					/>

					{/* <Text className="text-sm text-green-600 mt-2">
						4500: Low sales in May
					</Text> */}
				</View>

				{/* Recent Orders Section */}
				<View className="mb-6">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-lg font-poppins-semibold">Recent Orders</Text>
						<TouchableOpacity onPress={() => router.push('/seller/orders')}>
							<Text className="text-primary text-sm">View all</Text>
						</TouchableOpacity>
					</View>

					{/* Render recent orders when available */}
					{salesData?.recent_orders && salesData.recent_orders.length > 0 ? (
						salesData.recent_orders.slice(0, 3).map(order => (
							<TouchableOpacity
								key={order.order.id}
								className="bg-white rounded-lg p-4 mb-3 border border-gray-100"
								onPress={() =>
									router.push(`/seller/order-details?id=${order.order.id}`)
								}
							>
								<View className="flex-row justify-between items-center">
									<View className="flex-row items-center">
										{order.buyer.attributes.profile_photo ? (
											<Image
												source={{uri: order.buyer.attributes.profile_photo}}
												style={{width: 40, height: 40, borderRadius: 20}}
												className="mr-3"
											/>
										) : (
											<View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
												<MaterialIcons name="person" size={20} color="#888" />
											</View>
										)}
										<View>
											<Text className="font-poppins-medium">
												{order.buyer?.attributes.name || 'Customer'}
											</Text>
											<Text className="text-xs text-gray-500">
												Order #{order.order.attributes.reference}
											</Text>
										</View>
									</View>
									<Text className="text-primary font-poppins-semibold">
										₦
										{amountFormat(
											parseFloat(order.order.attributes.total_amount)
										)}
									</Text>
								</View>
								<View className="mt-2 pt-2 border-t border-gray-100">
									<Text className="text-xs text-gray-500">
										Status:{' '}
										<Text className="text-primary capitalize">
											{order.order.attributes.status}
										</Text>
									</Text>
									<Text className="text-xs text-gray-500">
										Date:{' '}
										{new Date(
											order.order.attributes.created_at
										).toLocaleDateString()}{' '}
										-
										{new Date(
											order.order.attributes.created_at
										).toLocaleTimeString('en', {
											hour12: true,
											timeStyle: 'short',
										})}
									</Text>
								</View>
							</TouchableOpacity>
						))
					) : (
						<View className="bg-white rounded-lg p-4 items-center justify-center py-8">
							<MaterialIcons name="shopping-bag" size={40} color="#e0e0e0" />
							<Text className="text-gray-400 mt-2">No recent orders</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</PageContainer>
	);
}

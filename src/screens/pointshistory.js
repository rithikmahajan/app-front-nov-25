import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';

// Sample points history data
const POINTS_RECEIVED_DATA = [
  {
    id: '1',
    date: 'NOV 1ST 2021',
    transactions: [
      { orderId: 'Order #123456', type: 'Reward Points', points: '+24' },
      { orderId: 'Order #123455', type: 'Reward Points', points: '+16' },
    ]
  },
  {
    id: '2', 
    date: 'OCT 20TH 2021',
    transactions: [
      { orderId: 'Order #980', type: 'Reward Points', points: '+40' },
    ]
  },
  {
    id: '3',
    date: 'OCT 10TH 2021', 
    transactions: [
      { orderId: 'Order #123', type: 'Reward Points', points: '+24' },
      { orderId: 'Order #122', type: 'Reward Points', points: '+16' },
      { orderId: 'Order #121', type: 'Reward Points', points: '+16' },
    ]
  },
];

const POINTS_USED_DATA = [
  {
    id: '1',
    date: 'NOV 1ST 2021',
    transactions: [
      { orderId: 'Order #123456', type: 'Reward Points', points: '-24' },
      { orderId: 'Order #123455', type: 'Reward Points', points: '-16' },
    ]
  },
  {
    id: '2',
    date: 'OCT 20TH 2021',
    transactions: [
      { orderId: 'Order #980', type: 'Reward Points', points: '-8' },
    ]
  },
  {
    id: '3',
    date: 'OCT 10TH 2021',
    transactions: [
      { orderId: 'Order #123', type: 'Reward Points', points: '-30' },
      { orderId: 'Order #122', type: 'Reward Points', points: '-7' },
      { orderId: 'Order #121', type: 'Reward Points', points: '-40' },
    ]
  },
];

const PointsHistory = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('received');
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleTabChange = (tab) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    if (navigation && navigation.goBack) {
      // Pass the activeSubTab information back to maintain the correct sub-tab
      const previousScreen = route?.params?.previousScreen;
      const activeSubTab = route?.params?.activeSubTab;
      
      if (previousScreen && activeSubTab) {
        // Navigate back to the specific screen with sub-tab information
        navigation.navigate(previousScreen, { activeSubTab });
      } else {
        navigation.goBack();
      }
    }
  };

  const renderPointsCard = (transaction, index, isLast = false) => (
    <View key={transaction.orderId + index}>
      <View style={styles.transactionCard}>
        <View style={styles.transactionText}>
          <Text style={styles.orderId}>{transaction.orderId}</Text>
          <Text style={styles.transactionType}>{transaction.type}</Text>
        </View>
        <Text style={[
          styles.pointsValue,
          transaction.points.startsWith('+') ? styles.pointsPositive : styles.pointsNegative
        ]}>
          {transaction.points}
        </Text>
      </View>
      {!isLast && <View style={styles.divider} />}
    </View>
  );

  const renderHistorySection = (section) => (
    <View key={section.id} style={styles.historySection}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{section.date}</Text>
      </View>
      {section.transactions.map((transaction, index) => 
        renderPointsCard(transaction, index, index === section.transactions.length - 1)
      )}
    </View>
  );

  const currentData = activeTab === 'received' ? POINTS_RECEIVED_DATA : POINTS_USED_DATA;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton onPress={handleBack} style={styles.backButton} />
        <Text style={styles.headerTitle}>POINTS HISTORY</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabList}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => handleTabChange('received')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'received' ? styles.activeTabText : styles.inactiveTabText
            ]}>
              Points received
            </Text>
            {activeTab === 'received' && <View style={styles.activeTabLine} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'used' && styles.activeTab]}
            onPress={() => handleTabChange('used')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'used' ? styles.activeTabText : styles.inactiveTabText
            ]}>
              Points used
            </Text>
            {activeTab === 'used' && <View style={styles.activeTabLine} />}
          </TouchableOpacity>
        </View>
        <View style={styles.tabDivider} />
      </View>

      {/* Content with fade animation */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {currentData.map((section) => renderHistorySection(section))}
        </ScrollView>
      </Animated.View>

      {/* Home indicator */}
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 68,
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    color: '#0F0F0F',
    textAlign: 'center',
    letterSpacing: 0.65,
    textTransform: 'uppercase',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
  },
  tabList: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0F0F0F',
  },
  inactiveTabText: {
    color: '#6F6F6F',
  },
  activeTabLine: {
    height: 2,
    backgroundColor: '#000000',
    width: '100%',
  },
  tabDivider: {
    height: 1,
    backgroundColor: '#F3F3F3',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  historySection: {
    width: '100%',
  },
  dateHeader: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.65,
    textTransform: 'uppercase',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  transactionText: {
    flex: 1,
  },
  orderId: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
    color: '#0F0F0F',
    lineHeight: 24,
  },
  transactionType: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '400',
    color: '#6F6F6F',
    lineHeight: 20,
  },
  pointsValue: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
  },
  pointsPositive: {
    color: '#23BC60',
  },
  pointsNegative: {
    color: '#EB0D0D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F3F3',
    marginLeft: 16,
    width: 351,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -67.5,
    width: 135,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 100,
  },
});

export default PointsHistory;

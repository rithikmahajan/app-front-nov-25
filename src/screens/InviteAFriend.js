import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Svg, Path, G, Defs, ClipPath, Rect, Line } from 'react-native-svg';
import { GlobalBackButton } from '../components';
import yoraaAPI from '../services/yoraaAPI';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CopyIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <G clipPath="url(#clip0_11109_11436)">
      <Path
        d="M10.8333 4.875H5.95833C5.36002 4.875 4.875 5.36002 4.875 5.95833V10.8333C4.875 11.4316 5.36002 11.9167 5.95833 11.9167H10.8333C11.4316 11.9167 11.9167 11.4316 11.9167 10.8333V5.95833C11.9167 5.36002 11.4316 4.875 10.8333 4.875Z"
        stroke="#6C6C6C"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.70833 8.125H2.16667C1.87935 8.125 1.6038 8.01086 1.40063 7.8077C1.19747 7.60453 1.08333 7.32898 1.08333 7.04167V2.16667C1.08333 1.87935 1.19747 1.6038 1.40063 1.40063C1.6038 1.19747 1.87935 1.08333 2.16667 1.08333H7.04167C7.32898 1.08333 7.60453 1.19747 7.8077 1.40063C8.01086 1.6038 8.125 1.87935 8.125 2.16667V2.70833"
        stroke="#6C6C6C"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_11109_11436">
        <Rect width="13" height="13" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

const VoucherShape = ({ children }) => {
  const voucherWidth = isTablet ? SCREEN_WIDTH * 0.75 : SCREEN_WIDTH * 0.92;
  const voucherHeight = isTablet ? hp(22) : hp(22.5);
  
  return (
    <View style={[styles.voucherContainer, { width: voucherWidth, height: voucherHeight }]}>
      <Svg 
        width={voucherWidth} 
        height={voucherHeight} 
        viewBox="0 0 450 180" 
        style={styles.voucherSvg}
        preserveAspectRatio="none"
      >
        <Defs>
          <ClipPath id="voucher-clip">
            <Path d="M450 75C450 82 442.929 89.574 440.17 96.065C438.93 99 438.2 102.494 438.2 106C438.2 116 442.93 124 449 124.266V124.266C449.15 124.27 449.27 124.393 449.27 124.543V167C449.27 173.627 443.45 179 436.27 179H13.73C6.548 179 0.73 173.627 0.73 167V137C0.73 130 7.801 122.426 10.56 115.935C11.8 113 12.53 109.506 12.53 106C12.53 102.494 11.8 99 10.56 96.065C7.801 89.574 0.73 82 0.73 75V13C0.73 6.373 6.548 1 13.73 1H436.27C443.45 1 449.27 6.373 449.27 13V75Z" />
          </ClipPath>
        </Defs>
        <G clipPath="url(#voucher-clip)">
          <Rect width={450} height={180} fill="#F6F6F6" />
        </G>
        <Path 
          d="M450 75C450 82 442.929 89.574 440.17 96.065C438.93 99 438.2 102.494 438.2 106C438.2 116 442.93 124 449 124.266V124.266C449.15 124.27 449.27 124.393 449.27 124.543V167C449.27 173.627 443.45 179 436.27 179H13.73C6.548 179 0.73 173.627 0.73 167V137C0.73 130 7.801 122.426 10.56 115.935C11.8 113 12.53 109.506 12.53 106C12.53 102.494 11.8 99 10.56 96.065C7.801 89.574 0.73 82 0.73 75V13C0.73 6.373 6.548 1 13.73 1H436.27C443.45 1 449.27 6.373 449.27 13V75Z" 
          fill="#F6F6F6" 
          stroke="#000000" 
          strokeWidth={1}
          strokeDasharray="8 8"
          strokeLinecap="round"
        />
      </Svg>
      <View style={[styles.voucherContent, { width: voucherWidth, height: voucherHeight }]}>
        {children}
      </View>
    </View>
  );
};

const InviteAFriend = ({ navigation, route }) => {
  const [inviteCodes, setInviteCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const previousScreen = route?.params?.previousScreen || 'Profile';

  useEffect(() => {
    fetchInviteCodes();
  }, []);

  const fetchInviteCodes = async () => {
    try {
      setIsLoading(true);
      
      // Fetch invite-friend codes (marked with codeType: 'invite')
      const response = await yoraaAPI.getInviteFriendCodes();
      
      if (response && response.success && response.data && response.data.length > 0) {
        // Filter to ensure only invite codes are shown (additional safety check)
        const inviteOnlyCodes = response.data.filter(code => {
          const isInviteCode = code.codeType === 'invite' || 
                              code.type === 'invite' || 
                              code.isInviteCode === true;
          
          if (!isInviteCode) {
            console.log(`🚫 InviteAFriend: Excluding non-invite code: ${code.code}`);
          }
          
          return isInviteCode;
        });
        
        setInviteCodes(inviteOnlyCodes);
        console.log(`✅ InviteAFriend: Loaded ${inviteOnlyCodes.length} invite-friend codes only`);
      } else {
        setInviteCodes([]);
        console.log('⚠️ No invite codes available');
      }
    } catch (error) {
      console.error('Error fetching invite codes:', error);
      setInviteCodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate(previousScreen);
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleCopyCode = async (code) => {
    if (!code) {
      Alert.alert('Error', 'No invite code available');
      return;
    }
    
    try {
      Alert.alert(
        'Invite Code',
        `Your invite code: ${code}`,
        [
          { 
            text: 'Share', 
            onPress: () => handleInviteNow(code),
            style: 'default' 
          },
          { 
            text: 'OK', 
            style: 'cancel' 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  const handleInviteNow = async (code) => {
    if (!code) {
      Alert.alert('Error', 'No invite code available');
      return;
    }
    
    try {
      await Share.share({
        message: `Join me on YORAA! Use my invite code ${code} to get exclusive benefits. Download the app now!`,
        title: 'Join YORAA with my invite code',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invite code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GlobalBackButton onPress={handleGoBack} />
        <Text style={styles.headerTitle}>Invite a friend</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Invite a friend with a referral code
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading invite codes...</Text>
          </View>
        ) : inviteCodes.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <Path 
                d="M40 10C23.43 10 10 23.43 10 40C10 56.57 23.43 70 40 70C56.57 70 70 56.57 70 40C70 23.43 56.57 10 40 10ZM40 64C26.77 64 16 53.23 16 40C16 26.77 26.77 16 40 16C53.23 16 64 26.77 64 40C64 53.23 53.23 64 40 64Z" 
                fill="#CCCCCC"
              />
              <Path 
                d="M40 35C41.6569 35 43 33.6569 43 32C43 30.3431 41.6569 29 40 29C38.3431 29 37 30.3431 37 32C37 33.6569 38.3431 35 40 35Z" 
                fill="#CCCCCC"
              />
              <Path 
                d="M40 40C38.34 40 37 41.34 37 43V48C37 49.66 38.34 51 40 51C41.66 51 43 49.66 43 48V43C43 41.34 41.66 40 40 40Z" 
                fill="#CCCCCC"
              />
            </Svg>
            <Text style={styles.emptyStateTitle}>No Invite Codes Available</Text>
            <Text style={styles.emptyStateMessage}>
              Invite codes are not available at the moment.{'\n'}
              Please check back later or contact support.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchInviteCodes}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.myCodeLabel}>Available Codes</Text>

            {inviteCodes.map((code, index) => {
              const voucherWidth = isTablet ? SCREEN_WIDTH * 0.75 : SCREEN_WIDTH * 0.92;
              const dashedLineWidth = voucherWidth * 0.88;
              
              return (
              <View key={code.id || index} style={styles.voucherWrapper}>
                <VoucherShape>
                    <Text style={styles.codeName}>{code.code}</Text>
                    
                    <View style={styles.codeContainer}>
                      <Text style={styles.discountText}>
                        {code.discountType === 'percentage' 
                          ? `${code.discountValue}% OFF` 
                          : `₹${code.discountValue} OFF`
                        }
                      </Text>
                      <TouchableOpacity onPress={() => handleCopyCode(code.code)} style={styles.copyButton}>
                        <CopyIcon />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.dashedLineContainer}>
                      <Svg width={dashedLineWidth} height={1} viewBox="0 0 400 1" style={styles.dashedLineSvg} preserveAspectRatio="none">
                        <Line
                          x1="0.5"
                          y1="0.5"
                          x2="399.5"
                          y2="0.5"
                          stroke="#000000"
                          strokeWidth={1}
                          strokeDasharray="8 8"
                          strokeLinecap="round"
                        />
                      </Svg>
                    </View>
                    
                    <Text style={styles.benefitText}>
                      {code.description || 'Invite a friend and get exclusive benefits'}
                    </Text>
                    
                    {code.minOrderValue > 0 && (
                      <Text style={styles.minOrderText}>
                        Min order: ₹{code.minOrderValue}
                      </Text>
                    )}
                </VoucherShape>

                <TouchableOpacity 
                  style={styles.inviteButton} 
                  onPress={() => handleInviteNow(code.code)}
                >
                  <Text style={styles.inviteButtonText}>Share Code</Text>
                </TouchableOpacity>
              </View>
            )})}
          </ScrollView>
        )}
      </View>
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
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
    paddingTop: hp(isTablet ? 2.5 : 2),
    paddingBottom: hp(isTablet ? 1.8 : 1.5),
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: wp(isTablet ? 8 : 6.4),
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginTop: hp(isTablet ? 4.3 : 3.5),
    marginBottom: hp(isTablet ? 3.4 : 2.7),
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: fs(isTablet ? 26 : isSmallDevice ? 20 : 22),
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
  },
  myCodeLabel: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: hp(isTablet ? 3.1 : 2.5),
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: fs(isTablet ? 26 : isSmallDevice ? 20 : 22),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(isTablet ? 6.2 : 5),
  },
  voucherWrapper: {
    alignItems: 'center',
    marginBottom: hp(isTablet ? 5 : 4),
    paddingHorizontal: wp(isTablet ? 5.3 : 4.3),
  },
  codeName: {
    fontSize: fs(isTablet ? 26 : isSmallDevice ? 20 : 24),
    fontWeight: '600',
    color: '#3E3E3E',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'left',
    lineHeight: fs(isTablet ? 32 : isSmallDevice ? 24 : 28),
    position: 'absolute',
    left: wp(isTablet ? 8.5 : 8.5),
    top: hp(isTablet ? 2.5 : 2.5),
  },
  discountText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    marginRight: wp(isTablet ? 2.6 : 2.1),
    lineHeight: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
  },
  minOrderText: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    position: 'absolute',
    left: wp(isTablet ? 8.5 : 8.5),
    bottom: hp(isTablet ? 2.5 : 2.5),
  },
  voucherContainer: {
    position: 'relative',
  },
  voucherSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  voucherContent: {
    position: 'relative',
  },
  userName: {
    fontSize: fs(isTablet ? 26 : isSmallDevice ? 20 : 24),
    fontWeight: '600',
    color: '#3E3E3E',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'left',
    lineHeight: fs(isTablet ? 32 : isSmallDevice ? 24 : 28),
    position: 'absolute',
    left: wp(isTablet ? 8.5 : 8.5),
    top: hp(isTablet ? 2.5 : 2.5),
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: wp(isTablet ? 8.5 : 8.5),
    top: hp(isTablet ? 7.5 : 7.5),
  },
  referralCode: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 11 : 12),
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textTransform: 'uppercase',
    marginRight: wp(isTablet ? 2.6 : 2.1),
    lineHeight: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
  },
  copyButton: {
    padding: wp(isTablet ? 0.6 : 0.5),
    marginLeft: wp(isTablet ? 2.6 : 2.1),
  },
  dashedLineContainer: {
    position: 'absolute',
    height: 1,
    left: wp(isTablet ? 6.6 : 6.6),
    top: hp(isTablet ? 13.7 : 13.7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLineSvg: {
    transform: [{ rotate: '359.798deg' }],
  },
  benefitText: {
    fontSize: fs(isTablet ? 15 : isSmallDevice ? 12 : 13),
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    lineHeight: fs(isTablet ? 21 : isSmallDevice ? 16 : 18),
    position: 'absolute',
    left: wp(isTablet ? 8.5 : 8.5),
    top: hp(isTablet ? 15.6 : 15.6),
    width: '84%',
  },
  inviteButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: hp(isTablet ? 2.8 : 2.2),
    paddingHorizontal: wp(isTablet ? 20 : 16),
    marginHorizontal: wp(isTablet ? 6.6 : 5.3),
    marginTop: hp(isTablet ? 3.7 : 3),
    minWidth: wp(isTablet ? 66 : 53),
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    lineHeight: fs(isTablet ? 23 : isSmallDevice ? 17 : 19),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(isTablet ? 9.3 : 7.5),
  },
  loadingText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '400',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    marginTop: hp(isTablet ? 2.5 : 2),
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
    paddingVertical: hp(isTablet ? 6.2 : 5),
  },
  emptyStateTitle: {
    fontSize: fs(isTablet ? 20 : isSmallDevice ? 16 : 18),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: hp(isTablet ? 3.7 : 3),
    marginBottom: hp(isTablet ? 1.8 : 1.5),
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '400',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
    marginBottom: hp(isTablet ? 5 : 4),
  },
  retryButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: hp(isTablet ? 1.8 : 1.5),
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
    marginTop: hp(isTablet ? 1.2 : 1),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
});

export default InviteAFriend;

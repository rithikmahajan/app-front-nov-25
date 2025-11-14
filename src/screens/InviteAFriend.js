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
} from 'react-native';
import { Svg, Path, G, Defs, ClipPath, Rect, Line } from 'react-native-svg';
import { GlobalBackButton } from '../components';
import yoraaAPI from '../services/yoraaAPI';

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
  return (
    <View style={styles.voucherContainer}>
      <Svg 
        width={310} 
        height={137} 
        viewBox="0 0 310 137" 
        style={styles.voucherSvg}
      >
        <Defs>
          <ClipPath id="voucher-clip">
            <Path d="M310 59.8004C310 65.323 304.929 70.7402 302.67 75.7795C301.644 78.069 301.041 80.861 301.041 83.874C301.041 91.5257 304.928 97.751 309.77 97.9434V97.9434C309.898 97.9461 310 98.0507 310 98.1788V127C310 132.523 305.523 137 300 137H10C4.47716 137 0 132.523 0 127V107.948C0 102.425 5.07117 97.008 7.33064 91.9685C8.35715 89.679 8.95996 86.8871 8.95996 83.874C8.95995 80.861 8.35713 78.069 7.33063 75.7795C5.07116 70.74 0 65.3227 0 59.7998V10C0 4.47715 4.47715 0 10 0H300C305.523 0 310 4.47715 310 10V59.8004Z" />
          </ClipPath>
        </Defs>
        <G clipPath="url(#voucher-clip)">
          <Rect width={310} height={137} fill="#F6F6F6" />
        </G>
        <Path 
          d="M310 59.8004C310 65.323 304.929 70.7402 302.67 75.7795C301.644 78.069 301.041 80.861 301.041 83.874C301.041 91.5257 304.928 97.751 309.77 97.9434V97.9434C309.898 97.9461 310 98.0507 310 98.1788V127C310 132.523 305.523 137 300 137H10C4.47716 137 0 132.523 0 127V107.948C0 102.425 5.07117 97.008 7.33064 91.9685C8.35715 89.679 8.95996 86.8871 8.95996 83.874C8.95995 80.861 8.35713 78.069 7.33063 75.7795C5.07116 70.74 0 65.3227 0 59.7998V10C0 4.47715 4.47715 0 10 0H300C305.523 0 310 4.47715 310 10V59.8004Z" 
          fill="#F6F6F6" 
          stroke="#000000" 
          strokeWidth={1}
          strokeDasharray="8 8"
          strokeLinecap="round"
        />
      </Svg>
      {children}
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

            {inviteCodes.map((code, index) => (
              <View key={code.id || index} style={styles.voucherWrapper}>
                <VoucherShape>
                  <View style={styles.voucherContent}>
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
                      <Svg width={284} height={1} viewBox="0 0 284 1" style={styles.dashedLineSvg}>
                        <Line
                          x1="0.5"
                          y1="0.5"
                          x2="283.502"
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
                  </View>
                </VoucherShape>

                <TouchableOpacity 
                  style={styles.inviteButton} 
                  onPress={() => handleInviteNow(code.code)}
                >
                  <Text style={styles.inviteButtonText}>Share Code</Text>
                </TouchableOpacity>
              </View>
            ))}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginTop: 28, // top: 100px - header height
    marginBottom: 22,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  myCodeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  voucherWrapper: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  codeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3E3E3E',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'left',
    lineHeight: 24,
    position: 'absolute',
    left: 24,
    top: 14,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    marginRight: 8,
    lineHeight: 18,
  },
  minOrderText: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    position: 'absolute',
    left: 24,
    bottom: 10,
  },
  voucherContainer: {
    width: 310,
    height: 137,
    position: 'relative',
  },
  voucherSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  voucherContent: {
    width: 310,
    height: 137,
    position: 'relative',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3E3E3E', // neutral-800 equivalent
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'left',
    lineHeight: 24,
    position: 'absolute',
    left: 24,
    top: 14,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 24,
    top: 49,
  },
  referralCode: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textTransform: 'uppercase',
    marginRight: 8,
    lineHeight: 14,
  },
  copyButton: {
    padding: 2,
    marginLeft: 8,
  },
  dashedLineContainer: {
    position: 'absolute',
    width: 284,
    height: 1,
    left: 13,
    top: 85, // 50% + 17px offset as in Figma
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLineSvg: {
    transform: [{ rotate: '359.798deg' }], // matching Figma rotation
  },
  benefitText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    lineHeight: 16,
    position: 'absolute',
    left: 24,
    top: 94,
    width: 262,
  },
  inviteButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    marginHorizontal: 20,
    marginTop: 20,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    lineHeight: 19.2,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    marginTop: 16,
    textAlign: 'center',
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
});

export default InviteAFriend;

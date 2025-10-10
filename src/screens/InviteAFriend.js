import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Svg, Path, G, Defs, ClipPath, Rect, Line } from 'react-native-svg';
import { GlobalBackButton } from '../components';

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
  const [referralCode] = useState('RITHIK 27');
  const previousScreen = route?.params?.previousScreen || 'Profile';

  const handleGoBack = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate(previousScreen);
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleCopyCode = async () => {
    try {
      // For now, just show an alert since Clipboard API might need additional setup
      Alert.alert('Copy', `Your referral code: ${referralCode}`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', style: 'default' }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  const handleInviteNow = async () => {
    try {
      await Share.share({
        message: `Join me on YORAA! Use my referral code ${referralCode} to get exclusive benefits. Download the app now!`,
        title: 'Join YORAA with my referral code',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral code');
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

        <Text style={styles.myCodeLabel}>My code</Text>

        <View style={styles.voucherWrapper}>
          <VoucherShape>
            <View style={styles.voucherContent}>
              <Text style={styles.userName}>Rithik</Text>
              
              <View style={styles.codeContainer}>
                <Text style={styles.referralCode}>{referralCode}</Text>
                <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
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
                Invite a friend and get additional 10% off on your 1st purchase
              </Text>
            </View>
          </VoucherShape>
        </View>

        <TouchableOpacity style={styles.inviteButton} onPress={handleInviteNow}>
          <Text style={styles.inviteButtonText}>Invite Now</Text>
        </TouchableOpacity>
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
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left',
    marginLeft: 82,
    marginBottom: 32,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
    transform: [{ translateX: -50 }], // center the text like in figma
  },
  voucherWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
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
});

export default InviteAFriend;

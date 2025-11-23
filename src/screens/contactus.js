import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { PanResponder } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Linking,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import yoraaAPI from '../services/yoraaAPI';
import chatService from '../services/chatService';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
  wp,
  hp,
  fs,
  device,
  isTablet,
  isSmallDevice,
  getScreenDimensions,
} from '../utils/responsive';

// Back Arrow Icon Component
const BackArrowIcon = () => (
  <View style={styles.backArrowIcon}>
    <View style={styles.arrowPath}>
      <View style={styles.arrowLine1} />
      <View style={styles.arrowLine2} />
    </View>
  </View>
);



// Send Icon Component
const SendIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" 
      fill="#FFFFFF"
    />
  </Svg>
);

// Photo Icon Component
const PhotoIcon = () => (
  <View style={styles.photoIcon}>
    <View style={styles.photoFrame} />
    <View style={styles.photoLens} />
  </View>
);

// End Chat Icon Component
const EndChatIcon = () => (
  <View style={styles.endChatIcon}>
    <View style={styles.endChatLine1} />
    <View style={styles.endChatLine2} />
  </View>
);

// Location Pin Icon Component
const LocationIcon = () => (
  <View style={styles.locationIcon}>
    <View style={styles.locationPin}>
      <View style={styles.locationDot} />
    </View>
  </View>
);

// Star Rating Component
const StarIcon = ({ filled, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.starContainer}>
    <Text style={[styles.starText, filled && styles.filledStarText]}>
      ★
    </Text>
  </TouchableOpacity>
);

const ContactUsScreen = ({ navigation, visible = true }) => {
  // PanResponder for swipe down to dismiss
  const panY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dx) < 30;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 80) {
          handleClose();
          panY.setValue(0);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const chatSlideAnim = useRef(new Animated.Value(300)).current;
  const ratingModalAnim = useRef(new Animated.Value(0)).current;
  const thankYouModalAnim = useRef(new Animated.Value(0)).current;
  
  const [currentView, setCurrentView] = useState('modal'); // 'modal', 'chat', or 'rating'
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const [selectedRating, setSelectedRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isComposingEmail, setIsComposingEmail] = useState(false);

  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // ScrollView ref for auto-scrolling to bottom
  const messagesScrollRef = useRef(null);
  
  // Animation for send button
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const loadingDotAnim = useRef(new Animated.Value(0)).current;

  // Start loading animation when sending
  useEffect(() => {
    if (isSending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingDotAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(loadingDotAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingDotAnim.setValue(0);
    }
  }, [isSending, loadingDotAnim]);

  useEffect(() => {
    if (visible && currentView === 'modal') {
      // Animate in modal with 250ms ease in from bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [slideAnim, opacityAnim, visible, currentView]);

  // Setup chat service listeners
  useEffect(() => {
    const messageListener = (event, data) => {
      switch (event) {
        case 'message_sent':
        case 'message_received':
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.find(msg => msg.id === data.id);
            if (exists) return prev;
            return [...prev, data];
          });
          // Auto-scroll to bottom
          setTimeout(() => {
            messagesScrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
          break;
        case 'message_updated':
          setMessages(prev => prev.map(msg => msg.id === data.id ? data : msg));
          break;
      }
    };

    const sessionListener = (event, data) => {
      switch (event) {
        case 'session_started':
          setChatSession(data);
          setMessages(data.messages || []);
          setChatError(null);
          break;
        case 'session_ended_by_admin':
          setChatSession(data);
          handleChatEnded();
          break;
        case 'session_ended':
          setChatSession(data);
          break;
      }
    };

    const removeMessageListener = chatService.addMessageListener(messageListener);
    const removeSessionListener = chatService.addSessionListener(sessionListener);

    return () => {
      removeMessageListener();
      removeSessionListener();
    };
  }, []);

  // Check user authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = auth().currentUser;
      setIsUserAuthenticated(!!currentUser);
    };

    // Check initial auth state
    checkAuthStatus();

    // Listen for auth state changes
    const unsubscribe = auth().onAuthStateChanged(checkAuthStatus);

    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chatService.hasActiveSession()) {
        chatService.cleanup();
      }
    };
  }, [handleChatEnded]);

  const handleClose = useCallback(async () => {
    if (currentView === 'chat') {
      // If there's an active chat session, ask user before closing
      if (chatService.hasActiveSession()) {
        Alert.alert(
          'Close Chat',
          'Your chat session will remain active. You can return to continue the conversation.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Close', 
              style: 'default',
              onPress: () => {
                // Just close the chat interface, don't end the session
                Animated.timing(chatSlideAnim, {
                  toValue: 300,
                  duration: 300,
                  easing: Easing.in(Easing.ease),
                  useNativeDriver: true,
                }).start(() => {
                  setCurrentView('modal');
                  chatSlideAnim.setValue(300);
                  setMessages([]);
                  setChatSession(null);
                });
              }
            }
          ]
        );
      } else {
        // No active session, just go back
        Animated.timing(chatSlideAnim, {
          toValue: 300,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setCurrentView('modal');
          chatSlideAnim.setValue(300);
          setMessages([]);
          setChatSession(null);
        });
      }
    } else {
      // Animate modal out with 250ms ease out to bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start(() => {
        navigation.goBack();
      });
    }
  }, [currentView, chatSlideAnim, slideAnim, opacityAnim, navigation]);

  const handleBackdropPress = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleEmailPress = useCallback(async () => {
    try {
      setIsComposingEmail(true);
      
      const email = 'contact@yoraa.in';
      const subject = 'Contact Inquiry';
      let body = 'Hello Yoraa Team,\n\nI would like to inquire about...\n\n';
      
      // Get current Firebase user
      const currentUser = auth().currentUser;
      let userInfo = {
        name: 'Guest User',
        email: '',
        userId: '',
        isAuthenticated: false
      };

      if (currentUser) {
        console.log('📧 Getting user info for email composition');
        
        try {
          // Try to get detailed profile from backend API
          const profile = await yoraaAPI.getUserProfile();
          
          if (profile && profile.success && profile.data && !profile.data.fallback) {
            // Use backend profile data
            userInfo = {
              name: profile.data.name || profile.data.displayName || currentUser.displayName || 'User',
              email: profile.data.email || currentUser.email || '',
              userId: currentUser.uid,
              isAuthenticated: true,
              phone: profile.data.phone || profile.data.phoneNumber || currentUser.phoneNumber || ''
            };
          } else {
            // Use Firebase user data as fallback
            userInfo = {
              name: currentUser.displayName || 'User',
              email: currentUser.email || '',
              userId: currentUser.uid,
              isAuthenticated: true,
              phone: currentUser.phoneNumber || ''
            };
          }
        } catch (profileError) {
          console.warn('⚠️ Could not fetch user profile, using Firebase data:', profileError);
          // Use Firebase user data as fallback
          userInfo = {
            name: currentUser.displayName || 'User',
            email: currentUser.email || '',
            userId: currentUser.uid,
            isAuthenticated: true,
            phone: currentUser.phoneNumber || ''
          };
        }
      }

      // Personalize email body based on user info
      if (userInfo.isAuthenticated) {
        body = `Hello Yoraa Team,

I hope this email finds you well. I would like to inquire about...

My Account Details:
- Name: ${userInfo.name}
- Email: ${userInfo.email}
- User ID: ${userInfo.userId}`;

        if (userInfo.phone) {
          body += `\n- Phone: ${userInfo.phone}`;
        }

        body += `\n\nPlease let me know if you need any additional information.

Best regards,
${userInfo.name}`;
      } else {
        body = `Hello Yoraa Team,

I hope this email finds you well. I would like to inquire about...

I am currently browsing as a guest user. Please let me know if you need any additional information to assist me.

Best regards,
Guest User`;
      }
      
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      Linking.canOpenURL(mailtoUrl).then((supported) => {
        if (supported) {
          Linking.openURL(mailtoUrl);
          console.log('📧 Email client opened successfully with personalized content');
        } else {
          Alert.alert(
            'Email App Not Available',
            `Please send an email to contact@yoraa.in\n\nYour details:\nName: ${userInfo.name}\nEmail: ${userInfo.email}`,
            [{ text: 'OK' }]
          );
        }
      });
    } catch (error) {
      console.error('❌ Error composing email:', error);
      Alert.alert(
        'Error',
        'Failed to compose email. Please try again or contact us directly at contact@yoraa.in',
        [{ text: 'OK' }]
      );
    } finally {
      setIsComposingEmail(false);
    }
  }, []);

  const handleCustomerSupport = useCallback(async () => {
    try {
      setIsLoadingChat(true);
      setChatError(null);
      
      console.log('💬 Starting customer support chat session');
      
      // Start new chat session through chat service
      const session = await chatService.startChatSession();
      
      if (session) {
        setChatSession(session);
        setMessages(session.messages || []);
        
        // Navigate to chat screen with slide in from right animation
        setCurrentView('chat');
        chatSlideAnim.setValue(300);
        Animated.timing(chatSlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('❌ Error starting customer support chat:', error);
      
      // Handle authentication requirement specifically
      if (error.code === 'AUTHENTICATION_REQUIRED') {
        setChatError('Please log in to access chat support.');
        
        Alert.alert(
          'Login Required',
          'You need to be logged in to access chat support. Please sign in to your account.',
          [
            { 
              text: 'Sign In', 
              onPress: () => {
                // Navigate to login screen
                if (navigation && navigation.navigate) {
                  navigation.navigate('Login');
                } else if (navigation && navigation.goBack) {
                  navigation.goBack();
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        setChatError('Failed to start chat. Please try again.');
        
        Alert.alert(
          'Chat Error',
          'Unable to start chat session. Please try again or contact us via email.',
          [
            { text: 'Try Again', onPress: handleCustomerSupport },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      setIsLoadingChat(false);
    }
  }, [chatSlideAnim, navigation]);

  const handleSendMessage = useCallback(async () => {
    const messageToSend = messageText.trim();
    
    if (!messageToSend || !chatService.hasActiveSession() || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setMessageText(''); // Clear input immediately for better UX
      
      // Animate button press
      Animated.sequence([
        Animated.timing(sendButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Send message through chat service
      await chatService.sendMessage(messageToSend);
      
      setIsSending(false);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setIsSending(false);
      Alert.alert(
        'Send Error',
        'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
      // Restore message text if sending failed
      setMessageText(messageToSend);
    }
  }, [messageText, isSending, sendButtonScale]);

  const handlePhotoUpload = () => {
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => { /* Open Camera functionality */ } },
        { text: 'Gallery', onPress: () => { /* Open Gallery functionality */ } },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleUserEndChat = useCallback(() => {
    Alert.alert(
      'End Chat Session',
      'Are you sure you want to end this chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Chat', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await chatService.endChatSession();
              if (result !== null) {
                setShowRatingModal(true);
                // Animate rating modal
                Animated.timing(ratingModalAnim, {
                  toValue: 1,
                  duration: 250,
                  easing: Easing.in(Easing.ease),
                  useNativeDriver: true,
                }).start();
              } else {
                // No active session, just close the chat
                setCurrentView('modal');
                handleClose();
              }
            } catch (error) {
              console.error('Error ending chat session:', error);
              Alert.alert('Error', 'Failed to end chat session. Please try again.');
            }
          }
        }
      ]
    );
  }, [ratingModalAnim, handleClose]);

  // Handle chat ended by admin or manual end
  const handleChatEnded = useCallback(() => {
    console.log('💬 Chat session ended, showing rating modal');
    setShowRatingModal(true);
    // Animate rating modal in with dissolve ease in 250ms
    Animated.timing(ratingModalAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [ratingModalAnim]);

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating);
  };

  const handleRatingSubmit = useCallback(async () => {
    try {
      // Submit rating through chat service
      if (selectedRating > 0) {
        const result = await chatService.submitRating(selectedRating, '');
        if (result.success) {
          console.log('✅ Chat rating submitted successfully');
        }
      }
      
      // End the chat session
      await chatService.endChatSession(selectedRating);
      
    } catch (error) {
      // Silently handle duplicate rating or other errors
      if (error.message && error.message.includes('already submitted')) {
        console.log('⚠️ Rating already submitted, continuing...');
      } else {
        console.error('❌ Error submitting rating:', error);
      }
      // Continue with UI flow even if API call fails
    }

    // Animate rating modal out
    Animated.timing(ratingModalAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowRatingModal(false);
      setSelectedRating(0);
      
      // Show thank you modal with dissolve ease in 250ms
      setShowThankYouModal(true);
      Animated.timing(thankYouModalAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  }, [selectedRating, ratingModalAnim, thankYouModalAnim]);

  const handleContinueShopping = () => {
    // Animate thank you modal out
    Animated.timing(thankYouModalAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowThankYouModal(false);
      // Close the ContactUs modal and return to Profile
      if (navigation && navigation.goBack) {
        navigation.goBack();
      }
    });
  };



  const renderChatScreen = () => (
    <Animated.View 
      style={[
        styles.chatContainer,
        {
          transform: [{ translateX: chatSlideAnim }]
        }
      ]}
    >
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.chatHeaderTitle}>Customer Support</Text>
        <TouchableOpacity style={styles.endChatButton} onPress={handleUserEndChat}>
          <EndChatIcon />
          <Text style={styles.endChatText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={messagesScrollRef}
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          messagesScrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {messages.map((message) => (
          <View key={message.id} style={styles.messageGroup}>
            {message.time && (
              <Text style={styles.messageTime}>{message.time}</Text>
            )}
            <View style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : styles.supportMessage,
              message.status === 'sending' && styles.messageSending
            ]}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.supportMessageText,
                message.status === 'sending' && styles.messageTextSending
              ]}>
                {message.text}
              </Text>
              {message.status === 'failed' && (
                <Text style={styles.messageFailedText}>Failed to send</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Write your message..."
              placeholderTextColor="#999999"
              multiline
              onSubmitEditing={handleSendMessage}
            />
          </View>
          <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled,
                isSending && styles.sendButtonLoading,
                messageText.trim() && !isSending && styles.sendButtonActive
              ]} 
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
            >
              {isSending ? (
                <Animated.View style={[
                  styles.loadingDot,
                  {
                    opacity: loadingDotAnim,
                    transform: [{
                      scale: loadingDotAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1]
                      })
                    }]
                  }
                ]} />
              ) : (
                <SendIcon />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.bottomIndicator} />
      </KeyboardAvoidingView>
    </Animated.View>
  );

  if (currentView === 'chat') {
    return (
      <Modal
        visible={visible}
        transparent={false}
        animationType="none"
        onRequestClose={handleClose}
      >
        {renderChatScreen()}
        {/* Rating Modal Overlay */}
        {showRatingModal && (
          <Animated.View 
            style={[
              styles.ratingModalOverlay,
              {
                opacity: ratingModalAnim,
              }
            ]}
          >
            <View style={styles.ratingModal}>
              <Text style={styles.ratingTitle}>How would you rate the support?</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={star <= selectedRating}
                    onPress={() => handleRatingSelect(star)}
                  />
                ))}
              </View>
              <TouchableOpacity 
                style={styles.ratingSubmitButton}
                onPress={handleRatingSubmit}
              >
                <Text style={styles.ratingSubmitText}>Of course...</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        {/* Thank You Modal Overlay */}
        {showThankYouModal && (
          <Animated.View 
            style={[
              styles.thankYouModalOverlay,
              {
                opacity: thankYouModalAnim,
              }
            ]}
          >
            <View style={styles.thankYouModal}>
              <Text style={styles.thankYouTitle}>Thanks for contacting support !</Text>
              <Text style={styles.thankYouSubtitle}>
                It should take 1-2 days to review your submission.
              </Text>
              <TouchableOpacity 
                style={styles.continueShoppingButton}
                onPress={handleContinueShopping}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <Animated.View 
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim
            }
          ]}
        />
        <Animated.View 
          style={[ 
            styles.modalContainer,
            {
              transform: [
                { translateY: Animated.add(slideAnim, panY) }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            {/* Top Handle */}
            <View style={styles.handle} />

            {/* Location Icon */}
            <View style={styles.iconContainer}>
              <LocationIcon />
            </View>

            {/* Office Address */}
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Office address :</Text>
              <Text style={styles.addressText}>
                FORUM DLF CYBER CITY, PHASE 3 , SECTOR 24, DLF QE, 
                Dlf Qe, Gurgaon- 122002, Haryana
              </Text>
            </View>

            {/* Email */}
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Email: </Text>
              <TouchableOpacity onPress={handleEmailPress} disabled={isComposingEmail}>
                <Text style={[styles.emailLink, isComposingEmail && styles.emailLinkDisabled]}>
                  {isComposingEmail ? 'Composing email...' : 'contact@yoraa.in'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Support Hours */}
            <Text style={styles.supportHours}>
              We're here to help Monday to friday 10 AM - 4 PM IST
            </Text>

            {/* Contact Customer Support Button */}
            <TouchableOpacity 
              style={[
                styles.supportButton, 
                (isLoadingChat || !isUserAuthenticated) && styles.supportButtonDisabled
              ]}
              onPress={handleCustomerSupport}
              disabled={isLoadingChat || !isUserAuthenticated}
            >
              <Text style={[
                styles.supportButtonText,
                !isUserAuthenticated && styles.supportButtonTextDisabled
              ]}>
                {!isUserAuthenticated 
                  ? '🔒 Sign In Required for Chat' 
                  : isLoadingChat 
                    ? 'Starting Chat...' 
                    : 'Contact Customer Support'
                }
              </Text>
            </TouchableOpacity>
            
            {chatError && (
              <Text style={styles.errorText}>{chatError}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(12),
    paddingBottom: getResponsiveSpacing(40),
    minHeight: getResponsiveValue(320, 360, 400),
    alignItems: 'center',
  },
  handle: {
    width: getResponsiveValue(40, 45, 50),
    height: getResponsiveValue(4, 5, 6),
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: getResponsiveSpacing(20),
  },
  iconContainer: {
    marginBottom: getResponsiveSpacing(30),
  },
  locationIcon: {
    width: getResponsiveValue(60, 70, 80),
    height: getResponsiveValue(60, 70, 80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPin: {
    width: getResponsiveValue(40, 46, 52),
    height: getResponsiveValue(50, 58, 66),
    backgroundColor: '#000000',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  locationDot: {
    width: getResponsiveValue(12, 14, 16),
    height: getResponsiveValue(12, 14, 16),
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveValue(6, 7, 8),
    marginTop: getResponsiveSpacing(-5),
  },
  addressContainer: {
    marginBottom: getResponsiveSpacing(20),
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getResponsiveSpacing(8),
  },
  addressText: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    lineHeight: getResponsiveValue(20, 23, 26),
    maxWidth: getResponsiveValue(280, 320, 360),
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(16),
  },
  emailLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#000000',
  },
  emailLink: {
    fontSize: getResponsiveFontSize(16),
    color: '#000000',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  emailLinkDisabled: {
    color: '#999999',
    textDecorationLine: 'none',
    opacity: 0.6,
  },
  supportHours: {
    fontSize: getResponsiveFontSize(12),
    color: '#999999',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(30),
    maxWidth: getResponsiveValue(250, 280, 320),
  },
  supportButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: getResponsiveSpacing(16),
    paddingHorizontal: getResponsiveSpacing(40),
    minWidth: getResponsiveValue(280, 320, 360),
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
  },
  supportButtonDisabled: {
    backgroundColor: '#999999',
    opacity: 0.7,
  },
  errorText: {
    color: '#FF4444',
    fontSize: getResponsiveFontSize(14),
    marginTop: getResponsiveSpacing(10),
    textAlign: 'center',
    maxWidth: getResponsiveValue(280, 320, 360),
  },
  authNotice: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(20),
    borderWidth: 1,
    borderColor: '#E0E7FF',
    maxWidth: getResponsiveValue(300, 340, 380),
  },
  authNoticeText: {
    color: '#1E40AF',
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(6),
  },
  authNoticeSubText: {
    color: '#3B82F6',
    fontSize: getResponsiveFontSize(12),
    textAlign: 'center',
    lineHeight: getResponsiveValue(16, 18, 20),
  },
  supportButtonTextDisabled: {
    color: '#CCCCCC',
  },
  
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(16),
    paddingTop: getResponsiveSpacing(50),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: getResponsiveValue(24, 28, 32),
    height: getResponsiveValue(24, 28, 32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderTitle: {
    flex: 1,
    fontSize: getResponsiveFontSize(18),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: getResponsiveSpacing(24),
  },
  endChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(8),
    paddingVertical: getResponsiveSpacing(4),
    borderRadius: 12,
    backgroundColor: '#FF4444',
  },
  endChatText: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    marginLeft: getResponsiveSpacing(4),
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(20),
    backgroundColor: '#F8F8F8',
  },
  messageGroup: {
    marginBottom: getResponsiveSpacing(20),
  },
  messageTime: {
    fontSize: getResponsiveFontSize(12),
    color: '#999999',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(10),
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: 20,
    marginBottom: getResponsiveSpacing(5),
  },
  supportMessage: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#000000',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: getResponsiveFontSize(16),
    lineHeight: getResponsiveValue(20, 23, 26),
  },
  supportMessageText: {
    color: '#000000',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageSending: {
    opacity: 0.7,
  },
  messageTextSending: {
    fontStyle: 'italic',
  },
  messageFailedText: {
    fontSize: getResponsiveFontSize(12),
    color: '#FF4444',
    marginTop: getResponsiveSpacing(4),
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(15),
    paddingBottom: getResponsiveSpacing(30),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: getResponsiveSpacing(12),
    paddingBottom: getResponsiveSpacing(4),
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(8),
    minHeight: getResponsiveValue(40, 45, 50),
  },
  textInput: {
    flex: 1,
    fontSize: getResponsiveFontSize(16),
    color: '#000000',
    maxHeight: getResponsiveValue(100, 110, 120),
    paddingVertical: getResponsiveSpacing(8),
  },
  photoButton: {
    width: getResponsiveValue(24, 28, 32),
    height: getResponsiveValue(24, 28, 32),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getResponsiveSpacing(8),
  },
  micButton: {
    width: getResponsiveValue(44, 50, 56),
    height: getResponsiveValue(44, 50, 56),
    backgroundColor: '#000000',
    borderRadius: getResponsiveValue(22, 25, 28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#FF3333',
  },
  sendButton: {
    width: getResponsiveValue(44, 50, 56),
    height: getResponsiveValue(44, 50, 56),
    borderRadius: getResponsiveValue(22, 25, 28),
    backgroundColor: '#353535',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#353535',
    opacity: 0.6,
  },
  sendButtonLoading: {
    backgroundColor: '#353535',
    opacity: 1,
  },
  sendButtonActive: {
    backgroundColor: '#1FE8B7',
  },
  loadingDot: {
    width: getResponsiveValue(10, 11, 12),
    height: getResponsiveValue(10, 11, 12),
    borderRadius: getResponsiveValue(5, 5.5, 6),
    backgroundColor: '#FFFFFF',
  },
  bottomIndicator: {
    width: getResponsiveValue(134, 150, 166),
    height: getResponsiveValue(5, 6, 7),
    backgroundColor: '#000000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: getResponsiveSpacing(15),
  },
  
  backArrowIcon: {
    width: getResponsiveValue(16, 18, 20),
    height: getResponsiveValue(16, 18, 20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowPath: {
    position: 'relative',
  },
  arrowLine1: {
    position: 'absolute',
    width: getResponsiveValue(8, 9, 10),
    height: 1,
    backgroundColor: '#000000',
    transform: [{ rotate: '-45deg' }],
    top: getResponsiveSpacing(-2),
    right: getResponsiveSpacing(2),
  },
  arrowLine2: {
    position: 'absolute',
    width: getResponsiveValue(8, 9, 10),
    height: 1,
    backgroundColor: '#000000',
    transform: [{ rotate: '45deg' }],
    top: getResponsiveSpacing(2),
    right: getResponsiveSpacing(2),
  },
  phoneIcon: {
    width: getResponsiveValue(20, 23, 26),
    height: getResponsiveValue(20, 23, 26),
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneBody: {
    width: getResponsiveValue(16, 18, 20),
    height: getResponsiveValue(16, 18, 20),
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 3,
    transform: [{ rotate: '15deg' }],
  },
  phoneEarpiece: {
    position: 'absolute',
    width: getResponsiveValue(8, 9, 10),
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
    top: getResponsiveSpacing(2),
    left: getResponsiveSpacing(6),
    transform: [{ rotate: '15deg' }],
  },
  photoIcon: {
    width: getResponsiveValue(20, 23, 26),
    height: getResponsiveValue(20, 23, 26),
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFrame: {
    width: getResponsiveValue(18, 21, 24),
    height: getResponsiveValue(14, 16, 18),
    borderWidth: 1.5,
    borderColor: '#666666',
    borderRadius: 2,
  },
  photoLens: {
    position: 'absolute',
    width: getResponsiveValue(6, 7, 8),
    height: getResponsiveValue(6, 7, 8),
    backgroundColor: '#666666',
    borderRadius: getResponsiveValue(3, 3.5, 4),
    top: getResponsiveSpacing(4),
    left: getResponsiveSpacing(7),
  },
  microphoneIcon: {
    width: getResponsiveValue(20, 23, 26),
    height: getResponsiveValue(20, 23, 26),
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBody: {
    width: getResponsiveValue(8, 9, 10),
    height: getResponsiveValue(12, 14, 16),
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  micBase: {
    position: 'absolute',
    width: getResponsiveValue(12, 14, 16),
    height: getResponsiveValue(8, 9, 10),
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 6,
    top: getResponsiveSpacing(10),
  },
  micStand: {
    position: 'absolute',
    width: 1,
    height: getResponsiveValue(4, 5, 6),
    backgroundColor: '#FFFFFF',
    top: getResponsiveSpacing(16),
  },
  ratingModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: getResponsiveSpacing(24),
    paddingVertical: getResponsiveSpacing(32),
    marginHorizontal: getResponsiveSpacing(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  ratingTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(24),
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(32),
  },
  starContainer: {
    marginHorizontal: getResponsiveSpacing(4),
    padding: getResponsiveSpacing(4),
  },
  starText: {
    fontSize: getResponsiveFontSize(32),
    color: '#E0E0E0',
  },
  filledStarText: {
    color: '#FFD700',
  },
  ratingSubmitButton: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: getResponsiveSpacing(24),
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: 8,
  },
  ratingSubmitText: {
    fontSize: getResponsiveFontSize(16),
    color: '#666666',
    fontWeight: '500',
  },
  thankYouModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: getResponsiveSpacing(24),
    paddingVertical: getResponsiveSpacing(40),
    marginHorizontal: getResponsiveSpacing(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: getResponsiveValue(300, 340, 380),
  },
  thankYouTitle: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(16),
  },
  thankYouSubtitle: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    lineHeight: getResponsiveValue(20, 23, 26),
    marginBottom: getResponsiveSpacing(32),
  },
  continueShoppingButton: {
    backgroundColor: '#000000',
    paddingHorizontal: getResponsiveSpacing(32),
    paddingVertical: getResponsiveSpacing(16),
    borderRadius: 25,
    minWidth: getResponsiveValue(200, 230, 260),
  },
  continueShoppingText: {
    fontSize: getResponsiveFontSize(16),
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  endChatIcon: {
    width: getResponsiveValue(16, 18, 20),
    height: getResponsiveValue(16, 18, 20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  endChatLine1: {
    position: 'absolute',
    width: getResponsiveValue(12, 14, 16),
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  endChatLine2: {
    position: 'absolute',
    width: getResponsiveValue(12, 14, 16),
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
});

export default React.memo(ContactUsScreen);

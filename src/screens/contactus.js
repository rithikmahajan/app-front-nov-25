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
import auth from '@react-native-firebase/auth';
import yoraaAPI from '../services/yoraaAPI';
import chatService from '../services/chatService';

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
  <View style={styles.sendIcon}>
    <View style={styles.sendArrow} />
    <View style={styles.sendArrowHead1} />
    <View style={styles.sendArrowHead2} />
  </View>
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
  
  // ScrollView ref for auto-scrolling to bottom
  const messagesScrollRef = useRef(null);

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
    
    if (!messageToSend || !chatService.hasActiveSession()) {
      return;
    }

    try {
      setMessageText(''); // Clear input immediately for better UX
      
      // Send message through chat service
      await chatService.sendMessage(messageToSend);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert(
        'Send Error',
        'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
      // Restore message text if sending failed
      setMessageText(messageToSend);
    }
  }, [messageText]);

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
        await chatService.submitRating(selectedRating, '');
        console.log('✅ Chat rating submitted successfully');
      }
      
      // End the chat session
      await chatService.endChatSession(selectedRating);
      
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
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
            <TouchableOpacity style={styles.photoButton} onPress={handlePhotoUpload}>
              <PhotoIcon />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled
            ]} 
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <SendIcon />
          </TouchableOpacity>
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

            {/* Authentication Notice for Chat */}
            {!isUserAuthenticated && (
              <View style={styles.authNotice}>
                <Text style={styles.authNoticeText}>
                  💬 Live chat support is available for logged-in users only.
                </Text>
                <Text style={styles.authNoticeSubText}>
                  Please sign in to access instant chat support, or contact us via email below.
                </Text>
              </View>
            )}

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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 320,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  locationIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPin: {
    width: 40,
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  locationDot: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginTop: -5,
  },
  addressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  emailLink: {
    fontSize: 16,
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
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 250,
  },
  supportButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    minWidth: 280,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButtonDisabled: {
    backgroundColor: '#999999',
    opacity: 0.7,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 280,
  },
  authNotice: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    maxWidth: 300,
  },
  authNoticeText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  authNoticeSubText: {
    color: '#3B82F6',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  supportButtonTextDisabled: {
    color: '#CCCCCC',
  },
  
  // Chat Screen Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 24,
  },
  endChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FF4444',
  },
  endChatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#F8F8F8',
  },
  messageGroup: {
    marginBottom: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 5,
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
    fontSize: 16,
    lineHeight: 20,
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
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingBottom: 4,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
    paddingVertical: 8,
  },
  photoButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    backgroundColor: '#000000',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#FF3333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowColor: '#C7C7CC',
    shadowOpacity: 0.2,
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 15,
  },
  
  // Icon Styles
  backArrowIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowPath: {
    position: 'relative',
  },
  arrowLine1: {
    position: 'absolute',
    width: 8,
    height: 1,
    backgroundColor: '#000000',
    transform: [{ rotate: '-45deg' }],
    top: -2,
    right: 2,
  },
  arrowLine2: {
    position: 'absolute',
    width: 8,
    height: 1,
    backgroundColor: '#000000',
    transform: [{ rotate: '45deg' }],
    top: 2,
    right: 2,
  },
  phoneIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneBody: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 3,
    transform: [{ rotate: '15deg' }],
  },
  phoneEarpiece: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
    top: 2,
    left: 6,
    transform: [{ rotate: '15deg' }],
  },
  sendIcon: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: 1 }], // Slight offset to center visually
  },
  sendArrow: {
    width: 16,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  sendArrowHead1: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ rotate: '15deg' }],
    top: 6,
    right: 1,
  },
  sendArrowHead2: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ rotate: '75deg' }],
    top: 12,
    right: 1,
  },
  photoIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFrame: {
    width: 18,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#666666',
    borderRadius: 2,
  },
  photoLens: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#666666',
    borderRadius: 3,
    top: 4,
    left: 7,
  },
  microphoneIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBody: {
    width: 8,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  micBase: {
    position: 'absolute',
    width: 12,
    height: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 6,
    top: 10,
  },
  micStand: {
    position: 'absolute',
    width: 1,
    height: 4,
    backgroundColor: '#FFFFFF',
    top: 16,
  },
  // Rating Modal Styles
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 20,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  starContainer: {
    marginHorizontal: 4,
    padding: 4,
  },
  starText: {
    fontSize: 32,
    color: '#E0E0E0',
  },
  filledStarText: {
    color: '#FFD700', // Gold color for filled stars
  },
  ratingSubmitButton: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ratingSubmitText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  // Thank You Modal Styles
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 300,
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  thankYouSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  continueShoppingButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  continueShoppingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default React.memo(ContactUsScreen);

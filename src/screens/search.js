import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Voice from '@react-native-voice/voice';
import { Colors, FontWeights } from '../constants';
import { MicrophoneIcon, CameraIcon, ScanBarcodeIcon, SearchIcon } from '../assets/icons';
import { useAccessibility } from '../hooks/useAccessibility';
import yoraaAPI from '../services/yoraaBackendAPI';
import { apiService } from '../services/apiService';
import { formatPrice } from '../utils/currencyUtils';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

// Grid separator component
const GridSeparator = () => <View style={{ height: hp(2.4) }} />;

const SearchScreen = React.memo(({ navigation, onClose, route }) => {
  const [searchText, setSearchText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [voiceResults, setVoiceResults] = useState([]);
  const [isVoicePermissionGranted, setIsVoicePermissionGranted] = useState(false);
  
  // Use the singleton API client instance
  const apiClient = yoraaAPI;
  
  // Get the previous screen and params from route params
  const previousScreen = route?.params?.previousScreen;
  const previousParams = route?.params?.previousParams || {};
  
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const modalSlideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    // Animate screen entrance
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Initialize API client
  useEffect(() => {
    apiClient.initialize();
  }, [apiClient]);

  // Debounced search functionality
  useEffect(() => {
    // Clear error state when search text changes
    if (errorMessage) {
      setErrorMessage('');
      setShowRetryButton(false);
    }
    
    const searchTimeout = setTimeout(async () => {
      if (searchText.trim().length > 0) {
        await performSearch(searchText.trim());
      } else {
        setSearchSuggestions([]);
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchText, performSearch, errorMessage]);

  // Voice Recognition Setup
  useEffect(() => {
    const setupVoiceRecognition = () => {
      Voice.onSpeechStart = (e) => {
        console.log('🎤 Speech recognition started', e);
        setIsListening(true);
        
        // Clear previous search text when speech actually starts
        setSearchText('');
      };

      Voice.onSpeechRecognized = (e) => {
        console.log('🎤 Speech recognized:', e);
      };

      Voice.onSpeechEnd = (e) => {
        console.log('🎤 Speech recognition ended', e);
        setIsListening(false);
        setIsRecording(false);
      };

      Voice.onSpeechError = (e) => {
        // Better error logging - extract error details
        const errorCode = e?.error?.code || e?.code || 'unknown';
        const errorMsg = e?.error?.message || e?.message || 'Unknown error';
        
        console.error('🎤 Speech recognition error:', {
          code: errorCode,
          message: errorMsg,
          fullError: e
        });
        
        setIsListening(false);
        setIsRecording(false);
        
        // Handle specific error codes
        if (errorCode === '7' || errorCode === 7) {
          // No speech input detected
          console.log('🎤 No speech detected - user may not have spoken');
          return; // Don't show error for this
        }
        
        if (errorCode === '5' || errorCode === 5) {
          // Client side error
          console.log('🎤 Client error - possibly permissions');
          Alert.alert(
            'Microphone Access',
            'Please enable microphone access in Settings to use voice search.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
        
        // Show user-friendly error for other cases
        Alert.alert(
          'Voice Recognition',
          'Unable to recognize speech. Please try again or type your search.',
          [{ text: 'OK' }]
        );
      };

      Voice.onSpeechResults = async (e) => {
        console.log('🎤 Speech results received:', e);
        if (e.value && e.value.length > 0) {
          const recognizedText = e.value[0];
          console.log('🎤 Recognized text:', recognizedText);
          
          setVoiceResults(e.value);
          setSearchText(recognizedText);
          
          // Stop listening immediately after getting results (Amazon-like behavior)
          try {
            await Voice.stop();
          } catch (stopError) {
            console.log('🎤 Stop error (non-critical):', stopError);
          }
          
          // Automatically perform search with the recognized text
          if (recognizedText.trim().length > 0) {
            await performVoiceSearch(recognizedText.trim());
          }
        }
      };

      Voice.onSpeechPartialResults = (e) => {
        console.log('🎤 Partial speech results:', e);
        if (e.value && e.value.length > 0) {
          setVoiceResults(e.value);
          // Update search text with partial results for real-time feedback
          const partialText = e.value[0] || '';
          console.log('🎤 Partial text:', partialText);
          setSearchText(partialText);
        }
      };

      Voice.onSpeechVolumeChanged = (e) => {
        // Log volume to indicate listening is active
        console.log('🎤 Volume:', e?.value);
      };
    };

    setupVoiceRecognition();

    return () => {
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      }).catch(err => {
        console.log('🎤 Voice destroy error (non-critical):', err);
      });
    };
  }, [performVoiceSearch]);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  // Perform voice search - enhanced search with voice context
  const performVoiceSearch = useCallback(async (query) => {
    try {
      setIsLoadingSuggestions(true);
      setIsLoadingResults(true);

      console.log('🎤 Performing voice search for:', query);

      // Call the new voice search API endpoint
      const voiceSearchResponse = await apiClient.voiceSearchProducts(query);
      
      if (voiceSearchResponse.success) {
        const products = voiceSearchResponse.data || [];
        console.log(`🎤 Voice search results: ${voiceSearchResponse.resultsCount} products found`);
        
        // Set the search results
        setSearchResults(products);
        
        // Clear any previous errors
        setErrorMessage('');
        setShowRetryButton(false);
        
        // Show success message if results found
        if (voiceSearchResponse.resultsCount > 0) {
          console.log(`✅ Found ${voiceSearchResponse.resultsCount} products for "${voiceSearchResponse.query}"`);
        } else {
          // Handle no results case
          setErrorMessage(`No products found for "${voiceSearchResponse.query}". Try different keywords.`);
          if (voiceSearchResponse.suggestions && voiceSearchResponse.suggestions.length > 0) {
            console.log('💡 Suggestions available:', voiceSearchResponse.suggestions);
          }
        }
        
        // Set suggestions if available (for backward compatibility)
        setSearchSuggestions(products.slice(0, 5) || []);
        
      } else {
        // Handle API error response
        throw new Error(voiceSearchResponse.message || 'Voice search failed');
      }

    } catch (error) {
      console.error('❌ Voice Search API error:', error);
      
      // Enhanced error handling with voice-specific messages
      let userMessage = "Voice search failed. Please try again or type your search.";
      
      if (error.response?.status === 400) {
        userMessage = "Please speak clearly and try again.";
      } else if (error.message?.toLowerCase().includes('network') || error.code === 'NETWORK_ERROR') {
        userMessage = "Please check your internet connection and try voice search again";
      } else if (error.message?.toLowerCase().includes('timeout')) {        
        userMessage = "Voice search is taking too long, please try speaking again";
      } else if (error.status === 404 || error.response?.status === 404) {
        userMessage = "No products found for your voice search";
      } else if (error.status >= 500 || error.response?.status >= 500) {
        userMessage = "Our servers are busy, please try voice search again in a moment";
      }
      
      setErrorMessage(userMessage);
      setShowRetryButton(true);
      
      // Clear results on voice search error
      setSearchSuggestions([]);
      setSearchResults([]);
    } finally {
      setIsLoadingSuggestions(false);
      setIsLoadingResults(false);
    }
  }, [apiClient]);

  // Voice event handlers are now defined inline in the useEffect

  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to microphone for voice search functionality',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setIsVoicePermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // For iOS, we need both microphone AND speech recognition permissions
        try {
          // Check microphone permission
          const micStatus = await check(PERMISSIONS.IOS.MICROPHONE);
          console.log('🎤 Current microphone permission status:', micStatus);
          
          // Check speech recognition permission
          const speechStatus = await check(PERMISSIONS.IOS.SPEECH_RECOGNITION);
          console.log('🗣️ Current speech recognition permission status:', speechStatus);
          
          let micPermissionGranted = false;
          let speechPermissionGranted = false;
          
          // Handle microphone permission
          if (micStatus === RESULTS.GRANTED) {
            micPermissionGranted = true;
          } else if (micStatus === RESULTS.DENIED || micStatus === RESULTS.UNAVAILABLE) {
            const micResult = await request(PERMISSIONS.IOS.MICROPHONE);
            console.log('🎤 Microphone permission request result:', micResult);
            micPermissionGranted = micResult === RESULTS.GRANTED;
          }
          
          // Handle speech recognition permission
          if (speechStatus === RESULTS.GRANTED) {
            speechPermissionGranted = true;
          } else if (speechStatus === RESULTS.DENIED || speechStatus === RESULTS.UNAVAILABLE) {
            const speechResult = await request(PERMISSIONS.IOS.SPEECH_RECOGNITION);
            console.log('🗣️ Speech recognition permission request result:', speechResult);
            speechPermissionGranted = speechResult === RESULTS.GRANTED;
          }
          
          // Both permissions are required for voice search to work
          const bothPermissionsGranted = micPermissionGranted && speechPermissionGranted;
          setIsVoicePermissionGranted(bothPermissionsGranted);
          
          if (!bothPermissionsGranted) {
            Alert.alert(
              'Permissions Required',
              'Voice search requires both microphone and speech recognition permissions. Please enable them in Settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
              ]
            );
          }
          
        } catch (permissionError) {
          console.warn('🎤 react-native-permissions failed:', permissionError);
          // Show error to user
          Alert.alert(
            'Permission Error',
            'Unable to request permissions. Please enable microphone and speech recognition manually in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          setIsVoicePermissionGranted(false);
        }
      }
    } catch (error) {
      console.error('🎤 Permission check error:', error);
      Alert.alert(
        'Permission Error',
        'Unable to check permissions. Please enable microphone and speech recognition manually in Settings.',
        [{ text: 'OK' }]
      );
      setIsVoicePermissionGranted(false);
    }
  }, []);

  // Generate search suggestions based on products and categories - API ONLY
  const searchProductSuggestions = useCallback(async (query) => {
    try {
      // Get product-based suggestions from the API only
      const response = await apiClient.searchProducts(query);
      const products = response.data || response || [];
      
      // Extract unique product names and categories as suggestions
      const suggestions = products.reduce((acc, product) => {
        if (product.name && !acc.includes(product.name.toLowerCase())) {
          acc.push(product.name.toLowerCase());
        }
        if (product.category && !acc.includes(product.category.toLowerCase())) {
          acc.push(product.category.toLowerCase());
        }
        // Also include brand names if available
        if (product.brand && !acc.includes(product.brand.toLowerCase())) {
          acc.push(product.brand.toLowerCase());
        }
        return acc;
      }, []);

      return suggestions.slice(0, 7);
    } catch (error) {
      console.error('🔍 Search suggestions API error:', error);
      return []; // No fallbacks - return empty array
    }
  }, [apiClient]);

  // Perform search with API data ONLY - no fallbacks
  const performSearch = useCallback(async (query) => {
    try {
      setIsLoadingSuggestions(true);
      setIsLoadingResults(true);

      console.log('🔍 Performing API search for:', query);

      // Get suggestions from API only
      const apiSuggestions = await searchProductSuggestions(query);
      setSearchSuggestions(apiSuggestions);

      // Search for actual products from API only
      const productResults = await apiClient.searchProducts(query);
      const products = productResults.data || productResults || [];
      
      console.log('🔍 API search results:', products);
      setSearchResults(products);

    } catch (error) {
      console.error('❌ Search API error:', error);
      
      // Enhanced error handling with user-friendly messages
      let userMessage = "Something went wrong with your search";
      
      if (error.message?.toLowerCase().includes('network')) {
        userMessage = "Please check your internet connection";
      } else if (error.message?.toLowerCase().includes('timeout')) {
        userMessage = "Search is taking too long, please try again";
      } else if (error.status === 404) {
        userMessage = "No products found for your search";
      } else if (error.status >= 500) {
        userMessage = "Our servers are busy, please try again in a moment";
      }
      
      setErrorMessage(userMessage);
      setShowRetryButton(true);
      
      // No fallbacks - clear results and show error state
      setSearchSuggestions([]);
      setSearchResults([]);
    } finally {
      setIsLoadingSuggestions(false);
      setIsLoadingResults(false);
    }
  }, [apiClient, searchProductSuggestions]);

  // Add retry functionality for failed searches
  const handleRetrySearch = useCallback(async () => {
    setErrorMessage('');
    setShowRetryButton(false);
    if (searchText.trim().length > 0) {
      await performSearch(searchText.trim());
    }
  }, [searchText, performSearch]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (previousScreen && navigation && navigation.navigate) {
        navigation.navigate(previousScreen, previousParams);
      } else if (navigation && navigation.goBack) {
        navigation.goBack();
      } else if (onClose) {
        onClose();
      }
    });
  };

  const handleVoiceSearch = async () => {
    try {
      console.log('🎤 Voice search button pressed');
      
      // If currently listening, stop (Amazon-like behavior)
      if (isListening) {
        console.log('🎤 Stopping voice recognition');
        try {
          await Voice.stop();
          setIsListening(false);
          setIsRecording(false);
        } catch (stopError) {
          console.log('🎤 Stop error:', stopError);
        }
        return;
      }
      
      // Always recheck permissions first and wait for the result
      let permissionsGranted = false;
      
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to microphone for voice search functionality',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        permissionsGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For iOS, check both microphone and speech recognition permissions
        try {
          const micStatus = await check(PERMISSIONS.IOS.MICROPHONE);
          const speechStatus = await check(PERMISSIONS.IOS.SPEECH_RECOGNITION);
          
          console.log('🎤 Microphone status:', micStatus);
          console.log('🗣️ Speech recognition status:', speechStatus);
          
          let micGranted = micStatus === RESULTS.GRANTED;
          let speechGranted = speechStatus === RESULTS.GRANTED;
          
          // Request microphone permission if needed
          if (!micGranted) {
            const micResult = await request(PERMISSIONS.IOS.MICROPHONE);
            micGranted = micResult === RESULTS.GRANTED;
            console.log('🎤 Microphone permission request result:', micResult);
          }
          
          // Request speech recognition permission if needed
          if (!speechGranted) {
            const speechResult = await request(PERMISSIONS.IOS.SPEECH_RECOGNITION);
            speechGranted = speechResult === RESULTS.GRANTED;
            console.log('🗣️ Speech recognition permission request result:', speechResult);
          }
          
          permissionsGranted = micGranted && speechGranted;
          
          if (!permissionsGranted) {
            const missingPerms = [];
            if (!micGranted) missingPerms.push('Microphone');
            if (!speechGranted) missingPerms.push('Speech Recognition');
            
            Alert.alert(
              'Permissions Required',
              `Voice search requires ${missingPerms.join(' and ')} permission${missingPerms.length > 1 ? 's' : ''}. Please enable them in Settings.`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
              ]
            );
            return;
          }
        } catch (permError) {
          console.error('🎤 Permission error:', permError);
          Alert.alert(
            'Permission Error',
            'Unable to request permissions. Please enable microphone and speech recognition manually in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }
      
      // Update the permission state
      setIsVoicePermissionGranted(permissionsGranted);
      
      if (!permissionsGranted) {
        console.log('🎤 Permissions not granted, aborting voice search');
        return;
      }
      
      console.log('🎤 Permissions granted, starting voice recognition');

      // Start listening - Clear all previous search state for new voice search
      console.log('🎤 Starting voice recognition');
      setIsListening(true);
      setIsRecording(true);
      setVoiceResults([]);
      
      // Clear previous search results and state for new voice search
      setSearchResults([]);
      setSearchSuggestions([]);
      setErrorMessage('');
      setShowRetryButton(false);
      setIsLoadingSuggestions(false);
      setIsLoadingResults(false);
      
      // Clear search text to show fresh voice input
      setSearchText('');
      
      // Check if Voice is available first
      const available = await Voice.isAvailable();
      if (!available) {
        throw new Error('Voice recognition is not available on this device');
      }
      
      // Start with locale (Amazon uses locale-specific recognition)
      await Voice.start('en-US');
      console.log('🎤 Voice recognition started successfully');
      
    } catch (error) {
      console.error('🎤 Voice search error:', error);
      setIsListening(false);
      setIsRecording(false);
      
      // More specific error handling based on the error type
      let voiceErrorMessage = 'Unable to start voice recognition. Please try again or type your search.';
      let showSettingsButton = false;
      
      if (error.message?.includes('permissions') || error.message?.includes('authorization')) {
        voiceErrorMessage = 'Microphone or speech recognition permission denied. Please enable them in Settings.';
        showSettingsButton = true;
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        voiceErrorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('not available') || error.message?.includes('unavailable')) {
        voiceErrorMessage = 'Voice recognition is not available on this device.';
      } else if (error.message?.includes('busy')) {
        voiceErrorMessage = 'Voice recognition is busy. Please wait a moment and try again.';
      }
      
      Alert.alert(
        'Voice Search',
        voiceErrorMessage,
        [
          { text: 'OK' },
          ...(showSettingsButton ? 
            [{ text: 'Open Settings', onPress: () => Linking.openSettings() }] : 
            []
          )
        ]
      );
    }
  };

  const handleCameraPress = () => {
    setShowCameraModal(true);
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseCameraModal = () => {
    Animated.timing(modalSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowCameraModal(false);
    });
  };

  const handleScanBarcode = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ScanBarcode');
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchText(suggestion);
  };

  const handleProductPress = async (product) => {
    console.log('🔍 Product pressed from search:', product);
    
    if (!navigation || !navigation.navigate) {
      console.warn('⚠️ Navigation not available');
      return;
    }

    try {
      // Get the product/item ID
      const productId = product._id || product.id || product.itemId;
      
      if (!productId) {
        console.warn('⚠️ No product ID found, using product as-is');
        // Fallback to passing the product directly if no ID
        navigation.navigate('ProductDetailsMain', { product });
        return;
      }

      console.log('🔄 Fetching full product details for ID:', productId);
      
      // Fetch the complete item details from the API
      const response = await apiService.getItemById(productId);
      
      if (response && response.success && response.data) {
        const fullProduct = response.data;
        console.log('✅ Fetched full product details:', {
          name: fullProduct.productName,
          hasImages: !!fullProduct.images?.length,
          hasSizes: !!fullProduct.sizes?.length,
        });
        
        // Navigate with the complete product data
        navigation.navigate('ProductDetailsMain', { 
          product: fullProduct,
          previousScreen: 'Search'
        });
      } else {
        console.warn('⚠️ Failed to fetch full product details, using search result');
        // Fallback to the search result
        navigation.navigate('ProductDetailsMain', { 
          product,
          previousScreen: 'Search'
        });
      }
    } catch (error) {
      console.error('❌ Error fetching product details:', error);
      // On error, still navigate with whatever data we have
      navigation.navigate('ProductDetailsMain', { 
        product,
        previousScreen: 'Search'
      });
    }
  };

  const handleTakePhoto = async () => {
    console.log('handleTakePhoto called');
    
    try {
      // Request camera permission for both iOS and Android
      if (Platform.OS === 'ios') {
        const permission = await request(PERMISSIONS.IOS.CAMERA);
        console.log('iOS Camera permission result:', permission);
        
        if (permission !== RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos');
          return;
        }
      } else if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('Android Camera permission result:', permission);
        
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos');
          return;
        }
      }
      
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      console.log('Launching camera with options:', options);
      
      launchCamera(options, (response) => {
        console.log('Camera response:', response);
        if (response.didCancel) {
          console.log('User cancelled camera');
          Alert.alert('Info', 'Camera cancelled');
        } else if (response.errorMessage) {
          console.log('Camera error:', response.errorMessage);
          Alert.alert('Camera Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const imageUri = response.assets[0].uri;
          console.log('Photo taken:', imageUri);
          // You can handle the image here - upload to server, show preview, etc.
          Alert.alert('Photo Captured', 'Photo has been taken successfully!');
          handleCloseCameraModal();
        }
      });
    } catch (error) {
      console.log('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const handleChooseFromLibrary = async () => {
    console.log('handleChooseFromLibrary called');
    
    try {
      // Request photo library permission on iOS
      if (Platform.OS === 'ios') {
        const permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('iOS Photo Library permission result:', permission);
        
        if (permission !== RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Photo library permission is required to select photos');
          return;
        }
      }
      
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      console.log('Launching image library with options:', options);

      launchImageLibrary(options, (response) => {
        console.log('Image library response:', response);
        if (response.didCancel) {
          console.log('User cancelled photo library');
        } else if (response.errorMessage) {
          console.log('Library error:', response.errorMessage);
          Alert.alert('Library Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const imageUri = response.assets[0].uri;
          console.log('Photo selected:', imageUri);
          // You can handle the image here - upload to server, show preview, etc.
          Alert.alert('Photo Selected', 'Photo has been selected successfully!');
          handleCloseCameraModal();
        }
      });
    } catch (error) {
      console.log('Error requesting photo library permission:', error);
      Alert.alert('Error', 'Failed to request photo library permission');
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Search for ${item}`}
      accessibilityHint="Tap to search for this item"
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderVariantSelector = (product, productIndex) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.variantScrollContent}
      style={styles.variantContainer}
    >
      {product.variants.map((variant, index) => (
        <TouchableOpacity
          key={variant.id}
          style={[
            styles.variantItem,
            selectedProductIndex === productIndex && selectedVariantIndex === index && styles.selectedVariantItem
          ]}
          onPress={() => {
            setSelectedProductIndex(productIndex);
            setSelectedVariantIndex(index);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Select ${variant.color} color variant`}
          accessibilityState={{ 
            selected: selectedProductIndex === productIndex && selectedVariantIndex === index,
            disabled: !variant.inStock 
          }}
          accessibilityHint={variant.inStock ? "Tap to select this color variant" : "This variant is out of stock"}
        >
          <View
            style={[
              styles.variantColor,
              { backgroundColor: variant.color },
              variant.color === '#FFFFFF' && styles.whiteBorder,
              selectedProductIndex === productIndex && selectedVariantIndex === index && styles.selectedVariantColor,
              !variant.inStock && styles.outOfStockVariant
            ]}
          >
            {!variant.inStock && <View style={styles.strikeThrough} />}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProductItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.gridProductItem}
      onPress={() => handleProductPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatPrice(item.price || item.currentPrice)}`}
      accessibilityHint="Tap to view product details"
    >
      {/* Product Image - Grid Style */}
      <View style={styles.gridProductImageContainer}>
        <View style={styles.gridProductImage}>
          <Image
            source={{ 
              uri: item.image || item.images?.[0] || 'https://via.placeholder.com/184x184.png?text=No+Image'
            }}
            style={styles.gridProductImageComponent}
            resizeMode="cover"
            onError={(error) => {
              console.log('Image failed to load for product:', item.id, error);
            }}
          />
        </View>
      </View>

      {/* Product Info - Figma Style */}
      <View style={styles.gridProductInfo}>
        <Text style={styles.gridProductName} numberOfLines={1}>
          {item.name || item.title || 'Product Name'}
        </Text>
        <Text style={styles.gridProductPrice}>
          {formatPrice(item.price || item.currentPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResults = () => (
    <View style={styles.searchResultsContainer}>
      <Text style={styles.resultsHeader}>
        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchText}"
      </Text>
      
      {/* Error Handling UI */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          {showRetryButton && (
            <TouchableOpacity onPress={handleRetrySearch} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <FlatList
        data={searchResults}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridResultsList}
        columnWrapperStyle={styles.gridRow}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        initialNumToRender={6}
        windowSize={8}
        ItemSeparatorComponent={GridSeparator}
        getItemLayout={(data, index) => {
          // Calculate item height based on responsive width
          const itemWidth = (Dimensions.get('window').width - 24) / 2;
          const imageHeight = itemWidth; // Square aspect ratio
          const infoHeight = 60; // Approximate height for product info (text + padding)
          const marginBottom = 20; // Margin between rows
          const itemLength = imageHeight + infoHeight + marginBottom;
          
          const safeIndex = Math.max(0, index || 0);
          const rowIndex = Math.floor(safeIndex / 2); // Each row has 2 items
          
          return {
            length: itemLength,
            offset: itemLength * rowIndex,
            index: safeIndex,
          };
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View 
        style={[
          styles.searchContainer, 
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <View style={styles.searchInputRow}>
            <View style={styles.searchIcon}>
              <SearchIcon size={24} color="#000000" />
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search Product"
              placeholderTextColor="#767676"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
              returnKeyType="search"
              accessibilityRole="search"
              accessibilityLabel="Search products"
              accessibilityHint="Type to search for products"
            />
            
            {/* Microphone positioned inline with search elements */}
            <TouchableOpacity 
              style={styles.micButton}
              onPress={handleVoiceSearch}
              accessibilityRole="button"
              accessibilityLabel={isRecording ? "Stop voice recording" : "Start voice search"}
              accessibilityHint="Use voice to search for products"
            >
              <MicrophoneIcon 
                color={isRecording ? Colors.primary : "#000000"} 
                width={20}
                height={20}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel search"
              accessibilityHint="Close the search screen"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons - only show when no search text and no search results */}
        {!searchResults.length && searchText.trim().length === 0 && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cameraButton]} 
              onPress={handleCameraPress}
              accessibilityRole="button"
              accessibilityLabel="Search using camera"
              accessibilityHint="Take a photo to search for similar products"
            >
              <CameraIcon color="#000000" width={19} height={19} />
              <Text style={styles.actionButtonText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.scanBarcodeButton]} 
              onPress={handleScanBarcode}
              accessibilityRole="button"
              accessibilityLabel="Scan product barcode"
              accessibilityHint="Use camera to scan a product barcode for search"
            >
              <ScanBarcodeIcon color="#000000" width={19} height={19} />
              <Text style={styles.actionButtonText}> Scan Barcode</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && renderSearchResults()}

        {/* Loading indicator for suggestions */}
        {isLoadingSuggestions && searchText.trim().length > 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#767676" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Search Suggestions - only show when no search results */}
        {searchSuggestions.length > 0 && !searchResults.length && !isLoadingSuggestions && (
          <FlatList
            data={searchSuggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            initialNumToRender={8}
            windowSize={5}
          />
        )}

        {/* No suggestions found state */}
        {searchText.trim().length > 0 && searchSuggestions.length === 0 && !isLoadingSuggestions && !searchResults.length && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No suggestions found</Text>
            <Text style={styles.noResultsSubText}>Try different keywords</Text>
          </View>
        )}

        {/* Voice Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingRow}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                {isListening ? 'Listening... Speak now' : 'Starting microphone...'}
              </Text>
            </View>
            <Text style={styles.recordingSubText}>
              Tap microphone again to stop
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Camera Modal */}
      <Modal
        visible={showCameraModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseCameraModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Main Modal Content */}
            <Animated.View 
              style={[
                styles.cameraModal,
                { transform: [{ translateY: modalSlideAnim }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Search with an image</Text>
                <Text style={styles.modalDescription}>
                  By confirming the photo, you confirm that you own the photo and have the right to send it to us. You also consent that we may use this image as it may contain personal information
                </Text>
              </View>
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalButton} onPress={handleTakePhoto}>
                  <Text style={styles.modalButtonText}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonLast]} 
                  onPress={handleChooseFromLibrary}
                >
                  <Text style={styles.modalButtonSecondaryText}>
                    Choose From Library
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            {/* Cancel Button - Separate Container */}
            <Animated.View 
              style={[
                styles.modalCancelContainer,
                { transform: [{ translateY: modalSlideAnim }] }
              ]}
            >
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCloseCameraModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#CDCDCD',
    position: 'relative',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4.3),
    paddingBottom: hp(1.5),
    paddingTop: hp(2),
    gap: wp(5.6),
  },
  searchIcon: {
    width: wp(6.4),
    height: wp(6.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.4,
    lineHeight: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    minHeight: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
  },
  micButton: {
    width: wp(5.3),
    height: wp(5.3),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.2),
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.32,
    lineHeight: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(6.4),
    paddingTop: hp(1),
    gap: wp(3.2),
    justifyContent: 'center', // Always center for better appearance
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: wp(13.3),
    borderWidth: 1,
    borderColor: '#000000',
    height: hp(4.4),
  },
  cameraButton: {
    width: wp(34.1),
  },
  scanBarcodeButton: {
    width: wp(50.9),
  },
  actionButtonText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    color: '#000000',
    marginLeft: wp(2.1),
    lineHeight: isTablet ? fs(21.6) : isSmallDevice ? fs(16.8) : fs(19.2),
  },
  suggestionsList: {
    flex: 1,
    paddingHorizontal: wp(6.4), // 24px as per Figma
    paddingTop: hp(1), // 8px top padding as per Figma content
  },
  suggestionItem: {
    paddingVertical: hp(1.2),
    paddingHorizontal: 0,
    borderBottomWidth: 0,
    alignItems: 'flex-end', // Align to right as per Figma
  },
  suggestionText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    lineHeight: isTablet ? fs(21.6) : isSmallDevice ? fs(16.8) : fs(19.2), // 1.2 line height as per Figma
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2.4),
    paddingHorizontal: wp(6.4),
  },
  loadingText: {
    marginLeft: wp(2.1),
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(4.9),
    paddingHorizontal: wp(6.4),
  },
  noResultsText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  noResultsSubText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  recordingIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  recordingDot: {
    width: wp(2.1),
    height: wp(2.1),
    borderRadius: wp(1.1),
    backgroundColor: Colors.primary,
    marginRight: wp(2.1),
  },
  recordingText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: Colors.primary,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
  },
  recordingSubText: {
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(11),
    color: Colors.textSecondary,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  // Search Results Styles
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: wp(2.1), // Reduced padding to match gridResultsList
  },
  resultsHeader: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: hp(2),
    paddingVertical: hp(1.5),
  },
  resultsList: {
    paddingBottom: hp(2.9),
  },
  productItem: {
    backgroundColor: Colors.background,
    marginBottom: hp(2.4),
    borderRadius: wp(2.7),
    overflow: 'hidden',
  },
  productImageContainer: {
    height: hp(36.6),
    backgroundColor: '#F8F8F8',
  },
  productImageScroll: {
    flex: 1,
  },
  productImage: {
    width: wp(91.5),
    height: hp(36.6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    width: '100%',
    height: '100%',
  },
  imageText: {
    fontSize: isTablet ? fs(56) : isSmallDevice ? fs(42) : fs(48),
    color: '#888',
    fontWeight: 'bold',
  },
  videoIndicator: {
    position: 'absolute',
    top: hp(2),
    right: wp(4.3),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: wp(3.2),
    padding: wp(2.1),
  },
  videoText: {
    color: 'white',
    fontSize: isTablet ? fs(14) : isSmallDevice ? fs(10) : fs(12),
  },
  productInfo: {
    padding: wp(4.3),
  },
  productName: {
    fontSize: isTablet ? fs(20) : isSmallDevice ? fs(16) : fs(18),
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: hp(0.5),
  },
  productSubtitle: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: Colors.textSecondary,
    marginBottom: hp(1.5),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  currentPrice: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginRight: wp(2.1),
  },
  originalPrice: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: wp(2.1),
  },
  discountBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: wp(2.1),
    paddingVertical: hp(0.2),
    borderRadius: wp(1.1),
  },
  discountText: {
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(11),
    color: '#2E7D32',
    fontWeight: FontWeights.medium,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  stars: {
    flexDirection: 'row',
    marginRight: wp(2.1),
  },
  star: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#FFD700',
  },
  reviewCount: {
    fontSize: isTablet ? fs(13) : isSmallDevice ? fs(10) : fs(11),
    color: Colors.textSecondary,
  },
  variantContainer: {
    marginHorizontal: wp(4.3),
    marginBottom: hp(2),
  },
  variantScrollContent: {
    paddingVertical: hp(1),
    gap: wp(2.1),
  },
  variantItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantColor: {
    width: wp(8.5),
    height: wp(8.5),
    borderRadius: wp(4.3),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  whiteBorder: {
    borderColor: '#DDD',
    borderWidth: 1,
  },
  selectedVariantItem: {
    // Additional styling for selected variant container
  },
  selectedVariantColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  outOfStockVariant: {
    opacity: 0.5,
  },
  strikeThrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF0000',
    transform: [{ rotate: '45deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    paddingHorizontal: wp(3.2),
    paddingBottom: hp(4.1), // Safe area bottom
  },
  cameraModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: wp(3.7),
    marginBottom: hp(1),
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: wp(4.3),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(128, 128, 128, 0.55)',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(11) : fs(13),
    fontWeight: '600',
    color: '#3D3D3D',
    textAlign: 'center',
    letterSpacing: -0.08,
    lineHeight: isTablet ? fs(20) : isSmallDevice ? fs(16) : fs(18),
    marginBottom: hp(0.5),
  },
  modalDescription: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(11) : fs(13),
    fontWeight: '400',
    color: '#3D3D3D',
    textAlign: 'center',
    letterSpacing: -0.08,
    lineHeight: isTablet ? fs(20) : isSmallDevice ? fs(16) : fs(18),
  },
  modalButtonContainer: {
    overflow: 'hidden',
  },
  modalButton: {
    height: hp(6.8),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(128, 128, 128, 0.55)',
  },
  modalButtonLast: {
    borderBottomWidth: 0,
  },
  modalButtonText: {
    fontSize: isTablet ? fs(19) : isSmallDevice ? fs(15) : fs(17),
    fontWeight: '400',
    color: '#007AFF',
    letterSpacing: -0.43,
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(20) : fs(22),
  },
  modalButtonSecondaryText: {
    fontSize: isTablet ? fs(19) : isSmallDevice ? fs(15) : fs(17),
    fontWeight: '400',
    color: '#AEAEB2',
    letterSpacing: -0.43,
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(20) : fs(22),
  },
  modalButtonSeparator: {
    height: 0.33,
    backgroundColor: 'rgba(128, 128, 128, 0.55)',
  },
  modalCancelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: wp(3.7),
    height: hp(6.8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: isTablet ? fs(19) : isSmallDevice ? fs(15) : fs(17),
    fontWeight: '600',
    color: '#007AFF',
    letterSpacing: -0.43,
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(20) : fs(22),
  },
  // Grid Layout Styles (Figma Design)
  gridResultsList: {
    paddingHorizontal: wp(2.1), // Add padding for edge spacing
    paddingBottom: hp(2.4),
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    gap: wp(2.1), // Add gap between columns
  },
  gridProductItem: {
    width: '47.5%', // Responsive width: (full width - padding) / 2 columns
    marginBottom: hp(2.4),
    backgroundColor: '#FFFFFF',
  },
  gridProductImageContainer: {
    width: '100%',
    aspectRatio: 1, // Keep square aspect ratio (1:1)
    marginBottom: hp(1.7), // 14px gap as per Figma
  },
  gridProductImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(2.1),
  },
  gridProductImageComponent: {
    width: '100%',
    height: '100%',
    borderRadius: wp(2.1),
  },
  gridProductInfo: {
    paddingHorizontal: wp(2.1), // Responsive padding (reduced from 14px)
    gap: hp(0.6), // 5px gap between name and price
  },
  gridProductName: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    color: '#000000',
    lineHeight: isTablet ? fs(19.2) : isSmallDevice ? fs(14.4) : fs(16.8), // 14px * 1.2 line height
    letterSpacing: -0.14,
  },
  gridProductPrice: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    color: '#000000',
    lineHeight: isTablet ? fs(19.2) : isSmallDevice ? fs(14.4) : fs(16.8),
    letterSpacing: -0.14,
  },
  // Error handling styles
  errorContainer: {
    backgroundColor: '#FFE6E6',
    borderRadius: wp(2.1),
    padding: wp(4.3),
    marginVertical: hp(1.2),
    alignItems: 'center',
  },
  errorText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: 'Montserrat-Medium',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: wp(1.6),
    paddingHorizontal: wp(5.3),
    paddingVertical: hp(1),
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '600',
  },
});

export default SearchScreen;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const Inbox = ({ navigation }) => {
  // Handler for back button
  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  // Mock messages data
  const messages = [
    {
      id: 1,
      title: "Manage account and services linked to your Yoraa account",
      time: "10:50 pm"
    },
    {
      id: 2,
      title: "Manage account and services linked to your Yoraa account", 
      time: "10:50 pm"
    }
  ];

  const renderMessage = (message) => (
    <View key={message.id} style={styles.messageContainer}>
      <View style={styles.messageContent}>
        <Text style={styles.messageTitle}>{message.title}</Text>
        <View style={styles.profileImagePlaceholder} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSafeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inbox</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Messages */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.messagesContainer}>
            {messages.map(renderMessage)}
          </View>
        </ScrollView>
      </SafeAreaView>
      
      {/* Bottom Safe Area for home indicator */}
      <SafeAreaView style={styles.bottomSafeArea} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topSafeArea: {
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
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  placeholder: {
    width: 68,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    paddingHorizontal: 32.5,
    paddingTop: 20,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
    height: 76,
    width: 325,
    alignSelf: 'center',
  },
  messageContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 12,
    position: 'relative',
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 19.2,
    width: 296,
    fontFamily: 'Montserrat-Regular',
  },
  profileImagePlaceholder: {
    position: 'absolute',
    right: 15,
    top: 20,
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  bottomSafeArea: {
    backgroundColor: '#F5F5F5',
  },
});

export default Inbox;

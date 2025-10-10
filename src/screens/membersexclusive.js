import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import BackIcon from '../assets/icons/BackIcon';

const MembersExclusive = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon
            size={26}
            color={'black'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.membershipTitle}>
          Membership Exclusive
        </Text>
      </View>

      <View style={styles.unlockContainer}>
        <Text style={styles.unlockText}>
          UNLOCK
        </Text>
      </View>

      <View style={styles.rewardsContainer}>
        <Text style={styles.rewardsText}>
          Members - only rewards
        </Text>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>Get discounts and rewards when you sign in or create</Text>
        <Text style={styles.descriptionText}>an account. the more you shop the more you get</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.howItWorksContainer}>
        <Text style={styles.howItWorksTitle}>
          How it works
        </Text>
        <Text style={styles.howItWorksText}>
          As soon as you create an account. you're a member.
        </Text>
        <Text style={styles.howItWorksText}>
          The amount you spend defines your tier. Your loyalty year renews every
          12 months, but you can upgrade and enjoy rewards anytime.
        </Text>
        <Text style={styles.howItWorksText}>
          From Exclusive discounts and private member's sales, to free delivery
          and priority assist. Join YORAA today.
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressDot, styles.bronzeDot]} />
          <View style={[styles.progressDot, styles.silverDot]} />
          <View style={[styles.progressDot, styles.goldDot]} />
          <View style={[styles.progressDot, styles.platinumDot]} />
          <View style={[styles.progressDot, styles.blackDot]} />
        </View>
      </View>

      <Pressable style={styles.joinButton} onPress={() => navigation.navigate('RewardsScreen')}>
        <Text style={styles.joinButtonText}>Join Us</Text>
      </Pressable>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContainer}
        decelerationRate="fast"
        snapToInterval={320}
        snapToAlignment="start"
      >
        <HorizontalCard />
        <HorizontalCard />
        <HorizontalCard />
        <HorizontalCard />
      </ScrollView>
    </ScrollView>
  );
};

function HorizontalCard() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardWrapper}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Model Image</Text>
        </View>
        <View style={styles.overlay}>
          <Text style={styles.cardTitle}>Bronze</Text>
          <Text style={styles.cardSubtitle}>Join by creating an Account</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitTitle}>
            Welcome reward
          </Text>
          <Text style={styles.benefitDescription}>
            Enjoy a welcome reward to spend in your first month.
          </Text>
        </View>

        <View style={styles.benefitItem}>
          <Text style={styles.benefitTitle}>
            Birthday reward
          </Text>
          <Text style={styles.benefitDescription}>
            Celebrate your birthday month with a special discount.
          </Text>
        </View>

        <View style={styles.benefitItem}>
          <Text style={styles.benefitTitle}>
            Private members' sale
          </Text>
          <Text style={styles.benefitDescription}>
            Unlocked after your first order.
          </Text>
        </View>
      </View>
    </View>
  );
}

export default MembersExclusive;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingLeft: 20,
    paddingTop: 12,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  membershipTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 22,
  },
  unlockContainer: {
    marginTop: 24,
    marginLeft: 16,
  },
  unlockText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 42,
  },
  rewardsContainer: {
    alignItems: 'flex-end',
    marginRight: 15,
  },
  rewardsText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 22,
  },
  descriptionContainer: {
    marginLeft: 8,
    marginTop: 14,
    marginBottom: 25,
  },
  descriptionText: {
    fontFamily: 'Montserrat-Regular',
  },
  divider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
    marginHorizontal: 26,
  },
  howItWorksContainer: {
    marginHorizontal: 18,
    marginTop: 6,
  },
  howItWorksTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
  },
  howItWorksText: {
    marginBottom: 16,
    marginTop: 10,
  },
  progressBarContainer: {
    marginVertical: 30,
    marginHorizontal: 36,
  },
  progressBar: {
    borderBottomColor: 'lightgray',
    borderBottomWidth: 5,
    position: 'relative',
    justifyContent: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 30,
    position: 'absolute',
    bottom: -9,
  },
  bronzeDot: {
    backgroundColor: '#CD7F32',
    left: 0,
  },
  silverDot: {
    backgroundColor: '#D4AF37',
    left: '25%',
  },
  goldDot: {
    backgroundColor: 'gray',
    left: '50%',
  },
  platinumDot: {
    backgroundColor: '#B075A5',
    left: '75%',
  },
  blackDot: {
    backgroundColor: 'black',
    right: 0,
  },
  joinButton: {
    alignContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
    backgroundColor: 'black',
    marginHorizontal: 30,
    borderRadius: 32,
    paddingVertical: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
  },
  horizontalScrollContainer: {
    paddingHorizontal: 15,
  },
  cardContainer: {
    marginRight: 20,
    width: 300,
  },
  cardWrapper: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 18,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  cardTitle: {
    fontSize: 40,
    color: 'black',
    fontFamily: 'Montserrat-Bold',
  },
  cardSubtitle: {
    fontSize: 20,
    color: 'black',
    marginTop: 4,
    fontFamily: 'Montserrat-SemiBold',
  },
  cardContent: {
    paddingHorizontal: 16,
  },
  benefitItem: {
    marginBottom: 12,
  },
  benefitTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
  },
  benefitDescription: {
    fontFamily: 'Montserrat-SemiBold',
    color: 'gray',
    marginTop: 4,
  },
});

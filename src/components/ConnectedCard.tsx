import IMAGES from '@assets/images';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSelector } from 'react-redux';

const ConnectedCard = ({ isPaired, Unpair, pair_device }: any) => {
  const languageData = useSelector((state: any) => state?.data?.languageData);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.statusText}>
          {languageData?.connected_card_status_label || 'Status'}:{' '}
          <Text style={{ color: '#10B981' }}>
            {isPaired
              ? languageData?.connected_card_status_connected || 'Connected'
              : languageData?.connected_card_status_not_connected ||
                'Not Connected'}
          </Text>
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Body */}
      <View style={styles.body}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image
            source={IMAGES.daraDoll} // <-- your image path
            style={styles.avatar}
          />
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.connectedTo}>
            {languageData?.connected_card_connected_to || 'Connected to:'}
          </Text>

          <Text style={styles.name}>Amina Doll - 02</Text>

          <View style={styles.actions}>
            <Pressable onPress={pair_device} style={styles.pairedBadge}>
              <Text style={styles.pairedText}>
                {isPaired
                  ? languageData?.connected_card_action_paired || 'Paired'
                  : languageData?.connected_card_action_pair || 'Pair'}
              </Text>
            </Pressable>
            {isPaired && (
              <TouchableOpacity onPress={Unpair} style={styles.unpairBtn}>
                <Text style={styles.unpairText}>
                  {languageData?.connected_card_action_unpair || 'Unpair'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ConnectedCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3EFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#D8CCFF',
    marginVertical: 12,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    backgroundColor: '#D8CCFF',
    borderRadius: 50,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: 70,
    width: 70,
    resizeMode: 'contain',
  },
  infoSection: {
    marginLeft: 16,
    flex: 1,
  },
  connectedTo: {
    fontSize: 14,
    color: '#6B7280',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pairedBadge: {
    backgroundColor: '#7C5CFF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 10,
  },
  pairedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  unpairBtn: {
    borderWidth: 1,
    borderColor: '#7C5CFF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  unpairText: {
    color: '#7C5CFF',
    fontWeight: '600',
    fontSize: 12,
  },
});

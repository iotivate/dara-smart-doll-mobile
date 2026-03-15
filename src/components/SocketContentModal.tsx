import React, { useEffect } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { hideSocketContent } from '@redux/dataSlice';
import CartoonVideoScreen from 'childsScreen/CartoonVideoScreen';

const SocketContentModal = () => {
  const dispatch = useDispatch();

  const { showSocketModal, socketContentId } = useSelector(
    (state: any) => state.data,
  );

  // ⏱ auto dismiss
  useEffect(() => {
    if (showSocketModal) {
      const timer = setTimeout(() => {
        dispatch(hideSocketContent());
      }, 15000); // 15 sec

      return () => clearTimeout(timer);
    }
  }, [showSocketModal]);

  if (!showSocketModal || !socketContentId) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <CartoonVideoScreen
          route={{ params: { contentId: socketContentId } }}
        />
      </View>
    </Modal>
  );
};

export default SocketContentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'black',
  },
});

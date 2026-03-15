import FontFamily from '@assets/fonts/FontFamily';
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonComponentProps {
  title: string;
  onPress: () => void;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  title,
  onPress,
}) => {
  return (
    <View style={{}}>
      <TouchableOpacity
        activeOpacity={1}
        // onPressIn={handlePressIn}
        // onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={['#8A4DFF', '#6274FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: { borderRadius: '7%', overflow: 'hidden' },
  gradient: {
    paddingHorizontal: '10%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '7%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FontFamily.KhulaRegular,
  },
});

export default ButtonComponent;

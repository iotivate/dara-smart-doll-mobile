import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import FontFamily from '@assets/fonts/FontFamily';
// import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';

interface CountdownTimerProps {
  onStatusChange?: (isOver: boolean) => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ onStatusChange }) => {
  // const {  } = useTheme();
  const [timeLeft, setTimeLeft] = useState(40);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!isOver) {
            setIsOver(true);
            onStatusChange?.(true);
          }
          return 0;
        } else {
          if (isOver) {
            setIsOver(false);
            onStatusChange?.(false);
          }
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <Text
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        fontSize: moderateScale(12),
        fontFamily: FontFamily.KhulaLight,
        color: '#A3A3A3',
      }}
    >
      {formatTime(timeLeft)}{' '}
    </Text>
  );
};

export default React.memo(CountdownTimer);

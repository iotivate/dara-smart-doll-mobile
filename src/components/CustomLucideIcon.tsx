// CustomLucideIcon.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '@theme/themeContext';

interface CustomLucideIconProps {
  name: keyof typeof LucideIcons;
  size?: number;
  color?: string; // overrides theme color
  style?: ViewStyle;
  strokeWidth?: number;
  rotation?: number;
  [key: string]: any;
}

const CustomLucideIcon: React.FC<CustomLucideIconProps> = ({
  name,
  size = 24,
  color,
  style,
  strokeWidth = 2,
  rotation = 0,
  ...props
}) => {
  const { theme } = useTheme();
  const LucideIcon: any = LucideIcons[name];

  if (!LucideIcon) {
    console.warn(`Lucide icon "${name}" not found.`);
    return null;
  }
  // console.log(Object.keys(LucideIcons));
  return (
    <View style={[{ transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <LucideIcon
        size={size}
        color={color ?? theme.iconColor ?? theme.text}
        strokeWidth={strokeWidth}
        {...props}
      />
    </View>
  );
};

export default CustomLucideIcon;

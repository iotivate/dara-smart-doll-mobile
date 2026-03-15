import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme, CustomTheme } from './themeSetup';

type Theme = typeof LightTheme;
type ThemeType = 'light' | 'dark' | 'custom';

interface ThemeContextType {
  currentTheme: ThemeType;
  theme: Theme;
  setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('custom');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (
          savedTheme === 'dark' ||
          savedTheme === 'light' ||
          savedTheme === 'custom'
        ) {
          setCurrentTheme(savedTheme);
        }
      } catch (err: any) {
        // console.log('Error loading theme:',JSON.stringify(err));
      }
    };

    loadTheme();
  }, []);

  // Update automatically with system theme *only if* no saved preference
  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      async ({ colorScheme }) => {
        const saved = await AsyncStorage.getItem('appTheme');
        if (!saved || saved === 'system') {
          setCurrentTheme(colorScheme === 'dark' ? 'dark' : 'light');
        }
      },
    );
    return () => subscription.remove();
  }, []);

  const setTheme = async (type: ThemeType) => {
    try {
      setCurrentTheme(type);
      await AsyncStorage.setItem('appTheme', type);
    } catch (err) {
      console.warn('Error saving theme:', err);
    }
  };

  const theme =
    currentTheme === 'dark'
      ? DarkTheme
      : currentTheme === 'custom'
      ? CustomTheme
      : LightTheme;

  return (
    <ThemeContext.Provider value={{ currentTheme, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

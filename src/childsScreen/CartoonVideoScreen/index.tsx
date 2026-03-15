import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import CustomLucideIcon from '@components/CustomLucideIcon';
import IMAGES from '@assets/images';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import Sound from 'react-native-sound';

const { width, height } = Dimensions.get('window');

const CartoonVideoScreen = ({ route }: any) => {
  const { contentId }: any = route.params || {
    contentId: '',
  };
  console.log('contentId', contentId);

  const { theme } = useTheme();
  const styles = getStyles(theme);

  const soundRef = useRef<Sound | null>(null);
  // const [paused, setPaused] = useState(false);
  const [contentFromSession, setContentFromSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
        setIsPlaying(false);
      } else {
        soundRef.current.play(success => {
          if (success) {
            console.log('Audio finished playing');
            setIsPlaying(false);
          } else {
            console.log('Audio playback failed');
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
      }
    }
    // setPaused(prev => !prev);
  };

  // Initialize and play audio
  const initializeAudio = (audioUrl: string) => {
    if (!audioUrl) {
      console.log('No audio URL provided');
      return;
    }

    setIsSoundLoading(true);

    // Stop and release previous sound if exists
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }

    // Enable audio in silent mode
    Sound.setCategory('Playback');

    // Initialize the sound
    soundRef.current = new Sound(audioUrl, '', error => {
      setIsSoundLoading(false);
      if (error) {
        console.log('Failed to load the sound', error);
        Alert.alert('Error', 'Failed to load audio');
        return;
      }

      console.log('Audio loaded successfully');
      console.log('Duration in seconds:', soundRef.current?.getDuration());

      // Play the audio automatically
      if (soundRef.current) {
        soundRef.current.play(success => {
          if (success) {
            console.log('Audio finished playing');
            setIsPlaying(false);
          } else {
            console.log('Audio playback failed');
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
        // setPaused(false);
      }
    });
  };

  const View_Api_CALL = async (_id: string) => {
    setIsLoading(true);

    try {
      const res: any = await apiRequest(
        `${ApiURL.viewContentData}?_id=${_id}`,
        'GET',
        {},
        true,
      );

      if (!res.error && res.data) {
        console.log('res.data', res.data);
        setContentFromSession(res.data);

        // Initialize and play audio after data is loaded
        if (res.data.audioUrl) {
          initializeAudio(res.data.audioUrl);
        }
      } else {
        Alert.alert('Error', res.message || 'Failed to fetch content data');
      }
    } catch (error: any) {
      console.log('API error', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contentId) {
      View_Api_CALL(contentId);
    }

    // Cleanup function to release sound on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  // Get the thumbnail URL (use first thumbnail if available, otherwise fallback to category thumbnail)
  const getThumbnailUrl = () => {
    if (contentFromSession) {
      if (
        contentFromSession.thumbnailUrls &&
        contentFromSession.thumbnailUrls.length > 0
      ) {
        return contentFromSession.thumbnailUrls[0];
      }
      if (
        contentFromSession.categoryId &&
        contentFromSession.categoryId.thumbnailUrl
      ) {
        return contentFromSession.categoryId.thumbnailUrl;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.themeColor} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </SafeAreaView>
    );
  }

  if (!contentFromSession) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>No content found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => View_Api_CALL(contentId)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const thumbnailUrl = getThumbnailUrl();
  const title = contentFromSession.title || 'Untitled';
  const description =
    contentFromSession.description || 'No description available';
  const categoryName = contentFromSession.categoryId?.title || '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Thumbnail Image with Play Button Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePlayPause}
        style={styles.videoContainer}
      >
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <CustomLucideIcon name="Music" size={50} color={theme.white} />
            <Text style={styles.placeholderText}>No Thumbnail</Text>
          </View>
        )}

        {/* Audio Loading Indicator */}
        {isSoundLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.white} />
            <Text style={styles.loadingAudioText}>Loading audio...</Text>
          </View>
        )}

        {/* Play/Pause Button */}
        <View style={styles.playButton}>
          <CustomLucideIcon
            name={isPlaying ? 'Pause' : 'Play'}
            size={30}
            color={theme.white}
          />
        </View>
      </TouchableOpacity>

      {/* Top Audio Button */}
      <View style={styles.audioButton}>
        <Text style={styles.audioButtonText}>Audio</Text>
      </View>

      {/* Bottom Overlay */}
      <View style={styles.bottomOverlay}>
        {/* Avatar */}
        <Image
          source={thumbnailUrl ? { uri: thumbnailUrl } : IMAGES.doll1}
          style={styles.avatar}
        />

        {/* Title + Category + Description */}
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {categoryName ? (
            <Text style={styles.categoryText}>{categoryName}</Text>
          ) : null}
          <Text style={styles.descriptionText} numberOfLines={2}>
            {description}
          </Text>
        </View>

        {/* Favorite & Heart */}
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              contentFromSession.isFavorite && styles.favoriteButtonActive,
            ]}
          >
            <Text style={styles.favoriteText}>
              {contentFromSession.isFavorite ? 'FAVORITE' : 'FAVORITE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <CustomLucideIcon
              name={contentFromSession.isFavorite ? 'Heart' : 'Heart'}
              size={20}
              color={
                contentFromSession.isFavorite ? theme.themeRed : theme.white
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Audio Status Indicator */}
      <View style={styles.audioStatusContainer}>
        <CustomLucideIcon
          name={isPlaying ? 'Volume2' : 'VolumeX'}
          size={16}
          color={theme.white}
        />
        <Text style={styles.audioStatusText}>
          {isPlaying ? 'Playing' : 'Paused'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.black,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: moderateScale(20),
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.white,
    },
    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.white,
      marginBottom: moderateScale(20),
    },
    retryButton: {
      backgroundColor: theme.themeColor,
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(10),
      borderRadius: moderateScale(8),
    },
    retryButtonText: {
      color: theme.white,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaBold,
    },
    videoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnail: {
      width: width,
      height: height,
      position: 'absolute',
      top: 0,
      left: 0,
    },
    placeholderContainer: {
      width: width,
      height: height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.gray,
    },
    placeholderText: {
      color: theme.white,
      marginTop: moderateScale(10),
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaRegular,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    loadingAudioText: {
      color: theme.white,
      marginTop: moderateScale(10),
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
    },
    playButton: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: moderateScale(12),
      borderRadius: moderateScale(30),
      width: moderateScale(60),
      height: moderateScale(60),
      justifyContent: 'center',
      alignItems: 'center',
    },
    audioButton: {
      position: 'absolute',
      top: moderateScale(50),
      alignSelf: 'center',
      backgroundColor: 'rgba(255,255,255,0.8)',
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(12),
    },
    audioButtonText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
    },
    bottomOverlay: {
      position: 'absolute',
      bottom: moderateScale(20),
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(12),
    },
    avatar: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      marginRight: moderateScale(10),
    },
    textContainer: {
      flex: 1,
    },
    titleText: {
      fontSize: moderateScale(14),
      color: theme.white,
      fontFamily: FontFamily.KhulaBold,
    },
    categoryText: {
      fontSize: moderateScale(12),
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
      marginVertical: 2,
    },
    descriptionText: {
      fontSize: moderateScale(10),
      color: theme.white,
      fontFamily: FontFamily.KhulaRegular,
      opacity: 0.8,
    },
    rightContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: moderateScale(8),
    },
    favoriteButton: {
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(12),
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      marginBottom: 5,
    },
    favoriteButtonActive: {
      backgroundColor: theme.themeRed,
    },
    favoriteText: {
      color: theme.white,
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaBold,
    },
    audioStatusContainer: {
      position: 'absolute',
      top: moderateScale(90),
      right: moderateScale(20),
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(5),
      borderRadius: moderateScale(15),
    },
    audioStatusText: {
      color: theme.white,
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      marginLeft: moderateScale(5),
    },
  });

export default CartoonVideoScreen;

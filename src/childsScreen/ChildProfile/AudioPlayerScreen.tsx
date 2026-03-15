/* eslint-disable react-native/no-inline-styles */
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ImageBackground,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { moderateScale } from 'react-native-size-matters';
// import { useTheme } from '@theme/themeContext';
// import CustomLucideIcon from '@components/CustomLucideIcon';
// import { useBluetooth } from '@components/BluetoothContext';

// const AudioPlayerScreen = ({ route }: any) => {
//   const { theme } = useTheme();
//   // const { sendContentSyncCommand, sendPlaybackCommand, connectionStatus } =
//   // useBluetooth();
//   const {
//     sendContentSyncCommand,
//     sendPlaybackCommand,
//     connectionStatus,
//     downloadedContentIds,
//   }: any = useBluetooth();

//   const { thumbnail, title, description, audioId } = route.params;

//   console.log('route.params;route.params;', route.params);
//   const [isPlaying, setIsPlaying] = useState(false);

//   // 🔹 STEP 2: PLAY FROM SD
//   const play = () => {
//     // console.log('audioIdaudioId', audioId);
//     // if (!downloadedContentIds.includes(audioId)) {
//     //   Alert.alert('Please download content first');
//     //   return;
//     // }

//     sendPlaybackCommand('play', {
//       content_id: audioId,
//     });
//     setIsPlaying(true);
//   };

//   const pause = () => {
//     sendPlaybackCommand('pause');
//     setIsPlaying(false);
//   };

//   const stop = () => {
//     sendPlaybackCommand('stop');
//     setIsPlaying(false);
//   };
//   const downloadContent = async () => {
//     if (connectionStatus !== 'connected') {
//       Alert.alert('DARA Not Connected');
//       return;
//     }

//     await sendContentSyncCommand(audioId);

//     Alert.alert(
//       'Downloading',
//       'Content download started. You can play after it completes.',
//     );
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: theme.black }}>
//       <ImageBackground
//         source={{ uri: thumbnail }}
//         style={styles.background}
//         blurRadius={3}
//       >
//         <View style={styles.overlay} />

//         <View style={styles.content}>
//           <Text style={[styles.title, { color: theme.white }]}>{title}</Text>

//           <Text style={[styles.desc, { color: theme.white }]}>
//             {description}
//           </Text>

//           {/* DOWNLOAD */}
//           {/* <TouchableOpacity
//             style={styles.downloadBtn}
//             onPress={downloadContent}
//           >
//             <Text style={{ color: '#fff' }}>Download to Smart Dara Buddy</Text>
//           </TouchableOpacity> */}

//           {/* PLAY / PAUSE */}
//           <TouchableOpacity
//             style={styles.playButton}
//             onPress={isPlaying ? pause : play}
//           >
//             <CustomLucideIcon
//               name={isPlaying ? 'Pause' : 'Play'}
//               size={36}
//               color="#fff"
//             />
//           </TouchableOpacity>

//           {/* STOP */}
//           <TouchableOpacity style={styles.stopButton} onPress={stop}>
//             <Text style={{ color: '#fff' }}>Stop</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     </View>
//   );
// };

// export default AudioPlayerScreen;

// const styles = StyleSheet.create({
//   background: { flex: 1 },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//   },
//   content: {
//     alignItems: 'center',
//     paddingHorizontal: moderateScale(24),
//     marginTop: 100,
//   },
//   title: { fontSize: 20, fontWeight: '700' },
//   desc: { fontSize: 14, textAlign: 'center', marginTop: 6 },
//   downloadBtn: {
//     marginTop: 20,
//     padding: 12,
//     backgroundColor: '#4CAF50',
//     borderRadius: 8,
//   },
//   playButton: {
//     marginTop: 30,
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stopButton: {
//     marginTop: 16,
//     padding: 10,
//     backgroundColor: 'red',
//     borderRadius: 8,
//   },
// });
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '@theme/themeContext';
import CustomLucideIcon from '@components/CustomLucideIcon';
import { useBluetooth } from '@components/BluetoothContext';
import IMAGES from '@assets/images';
import CustomVectorIcons from '@components/CustomVectorIcons';

const { width } = Dimensions.get('window');

const AudioPlayerScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { sendPlaybackCommand, connectionStatus, sendContentSyncCommand }: any =
    useBluetooth();

  // console.log('connectionStatusconnectionStatus', connectionStatus);
  const {
    thumbnail,
    title,
    description,
    audioId,
    duration = 180,
  } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(25);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(intervalRef.current);
            return duration?.toFixed(0);
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const formatTime = (sec: number) => {
    const totalSeconds = Math.floor(sec); // remove decimals
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  /* ------------------ PLAY ------------------ */
  const play = () => {
    sendPlaybackCommand('play', { content_id: audioId });
    setIsPlaying(true);
  };

  /* ------------------ PAUSE ------------------ */
  const pause = () => {
    sendPlaybackCommand('pause');
    setIsPlaying(false);
  };

  /* ------------------ SEEK ------------------ */
  const seekTo = (time: number) => {
    setCurrentTime(time);
    sendPlaybackCommand('seek', { position: time });
  };

  /* ------------------ +/- 20 SEC ------------------ */
  const forward20 = () => {
    const newTime = Math.min(currentTime + 20, duration);
    seekTo(newTime);
  };

  const backward20 = () => {
    const newTime = Math.max(currentTime - 20, 0);
    seekTo(newTime);
  };

  /* ------------------ VOLUME ------------------ */
  // const changeVolume = (val: number) => {
  //   setVolume(val);
  //   const deviceVolume = Math.round(val);
  //   // console.log('deviceVolumedeviceVolume', deviceVolume);
  //   sendPlaybackCommand('volume', { volume: deviceVolume });
  // };
  // /* ------------------ NEXT ------------------ */
  const nextSong = () => {
    sendPlaybackCommand('next');
    setCurrentTime(0);
    setIsPlaying(true);
  };

  /* ------------------ PREVIOUS ------------------ */
  const previousSong = () => {
    sendPlaybackCommand('previous');
    setCurrentTime(0);
    setIsPlaying(true);
  };
  // const downloadContent = async () => {
  //   if (connectionStatus !== 'connected') {
  //     Alert.alert('DARA Not Connected');
  //     return;
  //   }

  //   await sendContentSyncCommand(audioId);

  //   // Alert.alert(
  //   //   'Downloading',
  //   //   'Content download started. You can play after it completes.',
  //   // );
  // };

  const syncContent = async () => {
    if (connectionStatus !== 'connected') {
      Alert.alert('Device not connected');
      return;
    }

    try {
      setIsSyncing(true);

      await sendContentSyncCommand(audioId);

      setIsSynced(true);
    } catch (e) {
      console.log('Sync Error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.black }}>
      <ImageBackground
        source={{ uri: thumbnail }}
        blurRadius={20}
        style={styles.bg}
      >
        <View style={styles.overlay} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 10,
            marginVertical: 20,
            marginTop: 40,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <CustomVectorIcons
              name="arrow-back"
              color="#fff"
              iconSet="Ionicons"
              size={30}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={syncContent}>
            <CustomLucideIcon
              name={
                isSynced
                  ? 'CheckCircle'
                  : isSyncing
                  ? 'Loader'
                  : 'DownloadCloud'
              }
              size={26}
              color={isSynced ? '#4CAF50' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          {/* ALBUM ART */}
          <Image source={{ uri: thumbnail }} style={styles.albumArt} />

          {/* TITLE */}
          <Text style={[styles.title, { color: theme.white }]}>{title}</Text>

          <Text style={[styles.subtitle, { color: theme.gray }]}>
            {description}
          </Text>

          {/* dsdsdsddsd */}

          {/* sdsd */}

          {/* PROGRESS */}
          <View style={styles.progressContainer}>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>

            <Slider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#777"
              thumbTintColor="#fff"
              onSlidingComplete={seekTo}
            />

            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>

          {/* CONTROLS */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={previousSong}
            >
              <CustomLucideIcon name="SkipBack" size={25} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={backward20}>
              <Image
                source={IMAGES.Previousbutton}
                style={{ height: 30, width: 30, tintColor: '#fff' }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playBtn}
              onPress={isPlaying ? pause : play}
            >
              <CustomLucideIcon
                name={isPlaying ? 'Pause' : 'Play'}
                size={30}
                color="#000"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={forward20}>
              <Image
                source={IMAGES.nextbutton}
                style={{ height: 30, width: 30, tintColor: '#fff' }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={nextSong}>
              <CustomLucideIcon name="SkipForward" size={25} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* VOLUME */}
          <View style={styles.volumeContainer}>
            <CustomLucideIcon name="Volume1" size={20} color="#fff" />
            <Slider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={50}
              value={volume}
              // onValueChange={changeVolume}
              onValueChange={val => {
                const deviceVolume = Math.round(val);
                setVolume(deviceVolume);
                // console.log('onValueChangeonValueChangeonValueChange', val);
              }}
              onSlidingComplete={val => {
                const deviceVolume = Math.round(val);
                console.log(
                  'onSlidingCompleteonSlidingCompleteonSlidingComplete',
                  deviceVolume,
                );
                sendPlaybackCommand('volume', { volume: deviceVolume });
              }}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#777"
              thumbTintColor="#fff"
            />
            <CustomLucideIcon name="Volume2" size={20} color="#fff" />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default AudioPlayerScreen;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  albumArt: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  time: {
    color: '#fff',
    width: 45,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    justifyContent: 'space-between',
    width: '60%',
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
});

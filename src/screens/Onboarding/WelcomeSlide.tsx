import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const DOTS = [0, 1, 2, 3, 4];

interface Props {
  onContinue: () => void;
  currentPage?: number;
}

function GradientTitle() {
  const title = 'StudyFlow';

  if (Platform.OS === 'web') {
    return (
      <Text
        style={[
          styles.titleMask,
          {
            color: '#E8E4FF',
            // @ts-expect-error web-only gradient text
            backgroundImage: 'linear-gradient(135deg, #FFFFFF, #A29BFE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
        ]}
      >
        {title}
      </Text>
    );
  }

  return (
    <MaskedView
      style={styles.titleMaskWrap}
      maskElement={<Text style={styles.titleMask}>{title}</Text>}
    >
      <LinearGradient
        colors={['#FFFFFF', '#A29BFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.titleMask, { opacity: 0 }]}>{title}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

export function WelcomeSlide({ onContinue, currentPage = 0 }: Props) {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [buttonOpacity, buttonTranslateY, glowOpacity, logoOpacity, logoScale, textOpacity, textTranslateY]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <Animated.View style={[styles.glowContainer, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={['rgba(108,92,231,0.18)', 'transparent']}
          style={styles.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safe}>
        <View style={styles.dotsRow}>
          {DOTS.map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentPage ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.centerContent}>
          <Animated.View
            style={[
              styles.logoWrap,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(108,92,231,0.25)', 'rgba(108,92,231,0.05)']}
              style={styles.logoGlowBg}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <View style={styles.bookStack}>
              <View style={[styles.book, styles.bookBack]} />
              <View style={[styles.book, styles.bookMid]} />
              <LinearGradient
                colors={['#6C5CE7', '#A29BFE']}
                style={[styles.book, styles.bookFront]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.bookSpine} />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.textBlock,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <GradientTitle />

            <View style={styles.taglinePill}>
              <Text style={styles.tagline}>Study smarter, not harder</Text>
            </View>

            <Text style={styles.description}>
              Your all-in-one student companion for time management,{'\n'}
              habits, and academic success.
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.buttonWrap,
            {
              opacity: buttonOpacity,
              transform: [
                { translateY: buttonTranslateY },
                { scale: buttonScale },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onContinue}
          >
            <LinearGradient
              colors={['#7C6FF0', '#6C5CE7']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.version}>v1.0.0</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    alignItems: 'center',
  },
  glow: {
    width: width * 0.9,
    height: '100%',
    borderRadius: width * 0.45,
    alignSelf: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  centerContent: {
    alignItems: 'center',
    gap: 36,
  },
  logoWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlowBg: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  bookStack: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  book: {
    position: 'absolute',
    width: 44,
    height: 56,
    borderRadius: 4,
  },
  bookBack: {
    backgroundColor: '#2ECC71',
    transform: [{ rotate: '-12deg' }, { translateX: -8 }, { translateY: 4 }],
  },
  bookMid: {
    backgroundColor: '#E84393',
    transform: [{ rotate: '-4deg' }, { translateX: -2 }, { translateY: 2 }],
  },
  bookFront: {
    transform: [{ rotate: '4deg' }, { translateX: 6 }],
  },
  bookSpine: {
    position: 'absolute',
    left: '38%',
    top: '10%',
    width: 2,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
    transform: [{ rotate: '4deg' }, { translateX: 6 }],
  },
  textBlock: {
    alignItems: 'center',
    gap: 14,
  },
  titleMaskWrap: {
    alignSelf: 'center',
  },
  titleMask: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  taglinePill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  buttonWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  button: {
    width: width - 48,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  version: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.18)',
    letterSpacing: 0.5,
  },
});

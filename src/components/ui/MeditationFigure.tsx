import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

const FLOAT_HALF_MS = 2000;
const WAVE_DURATION_MS = 3000;
const PARTICLE_DURATION_MS = 2500;
const sinEase = Easing.inOut(Easing.sin);

function createWavePulse(
  scale: Animated.Value,
  opacity: Animated.Value,
): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2.5,
          duration: WAVE_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: WAVE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
      ]),
    ]),
  );
}

function createParticlePulse(
  translateY: Animated.Value,
  opacity: Animated.Value,
): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: PARTICLE_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: PARTICLE_DURATION_MS / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: PARTICLE_DURATION_MS / 2,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ]),
  );
}

export function MeditationFigure() {
  const floatY = useRef(new Animated.Value(0)).current;
  const breatheScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  const waveScale0 = useRef(new Animated.Value(1)).current;
  const waveOpacity0 = useRef(new Animated.Value(0.5)).current;
  const waveScale1 = useRef(new Animated.Value(1)).current;
  const waveOpacity1 = useRef(new Animated.Value(0.5)).current;
  const waveScale2 = useRef(new Animated.Value(1)).current;
  const waveOpacity2 = useRef(new Animated.Value(0.5)).current;

  const particleY0 = useRef(new Animated.Value(0)).current;
  const particleOpacity0 = useRef(new Animated.Value(0)).current;
  const particleY1 = useRef(new Animated.Value(0)).current;
  const particleOpacity1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -12,
          duration: FLOAT_HALF_MS,
          easing: sinEase,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: FLOAT_HALF_MS,
          easing: sinEase,
          useNativeDriver: true,
        }),
      ]),
    );

    const breatheAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheScale, {
          toValue: 1.08,
          duration: FLOAT_HALF_MS,
          easing: sinEase,
          useNativeDriver: true,
        }),
        Animated.timing(breatheScale, {
          toValue: 1,
          duration: FLOAT_HALF_MS,
          easing: sinEase,
          useNativeDriver: true,
        }),
      ]),
    );

    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: FLOAT_HALF_MS,
            easing: sinEase,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1.15,
            duration: FLOAT_HALF_MS,
            easing: sinEase,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.15,
            duration: FLOAT_HALF_MS,
            easing: sinEase,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: FLOAT_HALF_MS,
            easing: sinEase,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const waveAnim0 = createWavePulse(waveScale0, waveOpacity0);
    const waveAnim1 = createWavePulse(waveScale1, waveOpacity1);
    const waveAnim2 = createWavePulse(waveScale2, waveOpacity2);

    const particleAnim0 = createParticlePulse(particleY0, particleOpacity0);
    const particleAnim1 = createParticlePulse(particleY1, particleOpacity1);

    floatAnim.start();
    breatheAnim.start();
    glowAnim.start();
    waveAnim0.start();

    const waveDelay1 = setTimeout(() => waveAnim1.start(), 1000);
    const waveDelay2 = setTimeout(() => waveAnim2.start(), 2000);

    particleAnim0.start();
    const particleDelay1 = setTimeout(() => particleAnim1.start(), 1200);

    return () => {
      floatAnim.stop();
      breatheAnim.stop();
      glowAnim.stop();
      waveAnim0.stop();
      waveAnim1.stop();
      waveAnim2.stop();
      particleAnim0.stop();
      particleAnim1.stop();
      clearTimeout(waveDelay1);
      clearTimeout(waveDelay2);
      clearTimeout(particleDelay1);
    };
  }, [
    floatY,
    breatheScale,
    glowOpacity,
    glowScale,
    waveScale0,
    waveOpacity0,
    waveScale1,
    waveOpacity1,
    waveScale2,
    waveOpacity2,
    particleY0,
    particleOpacity0,
    particleY1,
    particleOpacity1,
  ]);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: floatY }] }]}
    >
      <Animated.View
        style={[
          styles.waveRing,
          {
            opacity: waveOpacity0,
            transform: [{ scale: waveScale0 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.waveRing,
          {
            opacity: waveOpacity1,
            transform: [{ scale: waveScale1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.waveRing,
          {
            opacity: waveOpacity2,
            transform: [{ scale: waveScale2 }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.particle,
          styles.particleYellow,
          {
            left: 36,
            bottom: 28,
            opacity: particleOpacity0,
            transform: [{ translateY: particleY0 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particlePurple,
          {
            right: 36,
            bottom: 28,
            opacity: particleOpacity1,
            transform: [{ translateY: particleY1 }],
          },
        ]}
      />

      <Animated.Text
        style={[styles.emoji, { transform: [{ scale: breatheScale }] }]}
      >
        🧘
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  waveRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  glow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#7C3AED',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  particleYellow: {
    backgroundColor: '#FCD34D',
  },
  particlePurple: {
    backgroundColor: '#A78BFA',
  },
  emoji: {
    fontSize: 72,
  },
});

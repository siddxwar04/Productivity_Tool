import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const COLORS = ['#818CF8', '#34D399', '#FBBF24', '#F472B6', '#60A5FA', '#A78BFA'];
const PARTICLE_COUNT = 24;

interface ConfettiCelebrationProps {
  active: boolean;
}

export function ConfettiCelebration({ active }: ConfettiCelebrationProps) {
  const width = Dimensions.get('window').width;
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-20),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (!active) {
      return;
    }

    const animation = Animated.stagger(
      40,
      particles.map((particle) =>
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: 420 + Math.random() * 120,
            duration: 1800 + Math.random() * 800,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
            Animated.timing(particle.opacity, { toValue: 0, duration: 900, delay: 700, useNativeDriver: true }),
          ]),
          Animated.timing(particle.rotate, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [active, particles]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: COLORS[index % COLORS.length],
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${180 + index * 20}deg`],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 8,
    height: 12,
    borderRadius: 2,
  },
});

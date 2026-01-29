import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { tokens } from '../ui/tokens';

const { width } = Dimensions.get('window');

export const GradientBackground = () => (
    <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
            <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={tokens.colors.gradientStart} stopOpacity="1" />
                    <Stop offset="1" stopColor={tokens.colors.gradientEnd} stopOpacity="1" />
                </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        </Svg>
        {/* Ambient Glows */}
        <View style={styles.glowTopLeft} />
        <View style={styles.glowBottomRight} />
    </View>
);

const styles = StyleSheet.create({
    glowTopLeft: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width,
        backgroundColor: tokens.colors.accentSoft,
        opacity: 0.4,
        transform: [{ scale: 1.2 }],
    },
    glowBottomRight: {
        position: 'absolute',
        bottom: -100,
        right: -50,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width,
        backgroundColor: tokens.colors.distanceSoft,
        opacity: 0.3,
    },
});

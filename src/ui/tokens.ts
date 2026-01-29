import { Platform } from 'react-native';

export const tokens = {
  colors: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    border: '#F1F3F5',
    textPrimary: '#1A1A1A',
    textSecondary: '#495057',
    textMuted: '#868E96',
    accent: '#FF6B6B',
    accentSoft: '#FFF0F0',
    success: '#51CF66',
    info: '#339AF0',
    warning: '#FCC419',
    gradientTop: '#FFF8F8',
    
    // Metric specific colors (Premium palette)
    steps: '#FF922B',
    stepsSoft: 'rgba(255, 146, 43, 0.12)',
    calories: '#FF6B6B',
    caloriesSoft: 'rgba(255, 107, 107, 0.12)',
    distance: '#339AF0',
    distanceSoft: 'rgba(51, 154, 240, 0.12)',

    // Dribbble Transformation palette
    mesh1: '#FFF0F0', // Soft pink
    mesh2: '#F0F4FF', // Soft blue
    mesh3: '#FFF9F0', // Soft peach
    meshAccent: '#FF6B6B',
  },
  radius: {
    card: 32, // More rounded for Dribbble look
    full: 999,
    pill: 20,
    icon: 16,
    sm: 10,
    md: 14,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 32,
    xl: 48,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 4,
    },
    high: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.1,
      shadowRadius: 30,
      elevation: 10,
    },
    accent: {
      shadowColor: '#FF6B6B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    }
  },
  typography: {
    title: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      fontFamily: Platform.select({ ios: 'Times New Roman', android: 'serif' }),
    },
    heading: {
      fontSize: 22,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
      fontFamily: Platform.select({ ios: 'Times New Roman', android: 'serif' }),
    },
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
      fontFamily: Platform.select({ ios: 'AvenirNext-Medium', android: 'sans-serif-medium' }),
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: '#868E96',
    }
  }
};

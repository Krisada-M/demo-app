import { Platform } from 'react-native';

export const tokens = {
  colors: {
    // Foundation
    background: '#F8F9FA', // Soft gray-white instead of stark white
    card: '#FFFFFF',
    textPrimary: '#111827', // Darker cool gray for sharp text
    textSecondary: '#4B5563', // Medium cool gray
    textMuted: '#9CA3AF',
    border: '#E5E7EB',

    // Accents (Premium Wellness Palette)
    accent: '#F97316', // Vibrant Orange
    accentSoft: '#FFEDD5', // Soft Orange
    
    success: '#10B981', // Emerald
    info: '#3B82F6', // Blue
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red

    // Gradients & Mesh
    gradientStart: '#FDFBF7', // Warm off-white
    gradientEnd: '#E6EFFD',   // Cool faint blue
    overlay: 'rgba(255, 255, 255, 0.6)',

    // Metric specific (Vibrant but harmonious)
    steps: '#F97316', // Orange
    stepsSoft: 'rgba(249, 115, 22, 0.12)',
    calories: '#F43F5E', // Rose
    caloriesSoft: 'rgba(244, 63, 94, 0.12)',
    distance: '#0EA5E9', // Sky Blue
    distanceSoft: 'rgba(14, 165, 233, 0.12)',
  },
  glass: {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.8)',
      borderWidth: 1,
    }
  },
  radius: {
    card: 24,
    full: 999,
    pill: 20,
    icon: 16,
    sm: 8,
    md: 12,
    lg: 16,
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
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    medium: {
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    high: {
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 10,
    },
    // Colored glow for accents
    glow: {
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    }
  },
  typography: {
    title: {
      fontSize: 34,
      fontWeight: '800' as const,
      letterSpacing: -0.8,
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-black' }),
      color: '#111827',
    },
    heading: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
      color: '#1F2937',
    },
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
      color: '#374151',
      lineHeight: 24,
    },
    caption: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: '#6B7280',
    }
  }
};

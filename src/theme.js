export const theme = {
  colors: {
    // Primary brand colors
    primary: '#FF6B35',
    primaryLight: '#FF8A65',
    primaryDark: '#E64A19',
    
    // Background system
    background: '#0A0E1A',
    backgroundSecondary: '#1A1F2E',
    surface: '#252B3D',
    surfaceElevated: '#2D3548',
    
    // Text system
    textPrimary: '#FFFFFF',
    textSecondary: '#B8BCC8',
    textTertiary: '#6B7280',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Hazard colors (more vibrant and distinct)
    earthquake: '#DC2626',
    flood: '#2563EB',
    wildfire: '#EA580C',
    tornado: '#7C3AED',
    storm: '#0891B2',
    other: '#6B7280',
    
    // Accent colors
    accent: '#8B5CF6',
    accentLight: '#A78BFA',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    
    // Border colors
    border: '#374151',
    borderLight: '#4B5563',
  },
  
  gradients: {
    primary: ['#FF6B35', '#FF8A65'],
    background: ['#0A0E1A', '#1A1F2E'],
    surface: ['#252B3D', '#2D3548'],
    danger: ['#DC2626', '#EF4444'],
    warning: ['#F59E0B', '#FCD34D'],
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    // Display text
    displayLarge: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    displayMedium: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.25,
    },
    
    // Headings
    h1: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: -0.25,
    },
    h2: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: -0.15,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: -0.1,
    },
    
    // Body text
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.4,
    },
    
    // Labels
    labelLarge: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

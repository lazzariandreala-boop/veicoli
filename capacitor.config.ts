import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'it.veicoli.app',
  appName: 'Veicoli',
  webDir: '.output/public',
  backgroundColor: '#060818',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false,
      backgroundColor: '#060818',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    // Login Google nativo: il plugin restituisce solo il token, l'accesso a Firebase lo fa l'SDK web
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_veicoli',
      iconColor: '#7c5cff',
    },
  },
}

export default config

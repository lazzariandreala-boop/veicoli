/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'it.andrea.veicoliapp',
  appName: 'Veicoli',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0066FF',
      sound: 'beep.wav'
    }
  }
}

module.exports = config

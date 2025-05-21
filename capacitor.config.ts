import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.agroseguro.chatbot',
  appName: 'Agroseguro Chatbot',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    BackgroundMode: {
      enabled: true
    },
    CapacitorBrowser: {}
  }
};

export default config;

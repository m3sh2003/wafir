import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.wafir',
  appName: 'Wafir',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

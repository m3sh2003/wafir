import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.wafir',
  appName: 'Wafir',
  webDir: 'dist',
 # server: {
    // تم استخدام 10.0.2.2 ليعمل على محاكي الأندرويد ويصل لـ localhost الكمبيوتر
    url: 'http://10.0.2.2:5173',
    cleartext: true
  }
};

export default config;

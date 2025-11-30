import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'agendoo-front',
  webDir: 'www',
  server: {
    // Permite que o app Android acesse recursos HTTP
    cleartext: true,
    // Permite navegação para qualquer URL
    allowNavigation: ['*'],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    // Permite mixed content (HTTP em páginas HTTPS)
    allowMixedContent: true,
  },
};

export default config;

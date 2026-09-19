import { z } from 'zod';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const envSchema = z.object({
  environment: z.enum(['dev', 'prod']),
  apiUrl: z.string().url(),
});

const ENV_CATALOG = {
  dev: {
    apiUrl: 'http://localhost:5000',
  },
  prod: {
    apiUrl: 'https://notagest-0o2r.onrender.com',
  },
} as const;

export function resolveHostForPlatform(baseUrl: string): string {
  if (Platform.OS === 'web') {
    return baseUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && baseUrl.includes('localhost')) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }

  if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
    return 'http://10.0.2.2:5000';
  }

  return baseUrl;
}

const activeEnvironment = (process.env.EXPO_PUBLIC_APP_ENV === 'prod' ? 'prod' : 'dev') as 'dev' | 'prod';
const baseSelectedUrl = process.env.EXPO_PUBLIC_API_URL || ENV_CATALOG[activeEnvironment].apiUrl;
const rawApiUrl = resolveHostForPlatform(baseSelectedUrl);

export const env = envSchema.parse({
  environment: activeEnvironment,
  apiUrl: rawApiUrl,
});

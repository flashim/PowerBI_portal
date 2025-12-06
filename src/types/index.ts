export interface HarmonySession {
  tenantId: string;
  customerId: string;
  userId: string;
  userEmail: string;
  theme: 'light' | 'dark';
  sessionToken: string;
  expirationTime: number;
}

export interface HarmonyTheme {
  primaryColor: string;
  theme: 'light' | 'dark';
  brandName: string;
  logo: string;
}

export interface PowerBIEmbedConfig {
  embedToken: string;
  embedUrl: string;
  reportId: string;
  expirationTime: number;
}

export interface RLSContext {
  username: string;
  roles: string[];
  customData: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

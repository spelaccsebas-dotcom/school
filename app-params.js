import { getAccessToken } from '@base44/sdk/dist/utils/auth-utils';

const searchParams = new URLSearchParams(window.location.search);

// Public app configuration comes from the export's environment or launch URL.
// Access tokens must only come from the user's own authenticated session.
export const appParams = {
  appId: searchParams.get('app_id') || import.meta.env.VITE_BASE44_APP_ID || '',
  appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL || '',
  token: getAccessToken() || undefined,
  functionsVersion: searchParams.get('functions_version') || import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || undefined,
};

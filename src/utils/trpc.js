import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const TRPC_URL = import.meta.env.VITE_TRPC_URL || '/api/trpc';

function getAccessToken() {
  return localStorage.getItem('authToken');
}

export const trpc = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      headers() {
        const token = getAccessToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      fetch(url, options) {
        return fetch(url, { ...options, credentials: 'include' });
      },
    }),
  ],
});

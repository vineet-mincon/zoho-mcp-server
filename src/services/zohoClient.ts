import axios, { AxiosInstance, AxiosError } from "axios";
import {
  ZOHO_ACCOUNTS_URL,
  ZOHO_BOOKS_URL,
  ZOHO_INVENTORY_URL,
  ZOHO_LEARN_URL,
  TOKEN_REFRESH_BUFFER_MS,
} from "../constants.js";
import { ZohoTokenResponse, ZohoAuthState } from "../types.js";

// ─── Auth State ──────────────────────────────────────────────────────────────

let authState: ZohoAuthState | null = null;

export function getConfig() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const organizationId = process.env.ZOHO_ORGANIZATION_ID;

  if (!clientId || !clientSecret || !refreshToken || !organizationId) {
    throw new Error(
      "Missing required environment variables: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORGANIZATION_ID"
    );
  }

  return { clientId, clientSecret, refreshToken, organizationId };
}

async function refreshAccessToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = getConfig();

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await axios.post<ZohoTokenResponse>(
    `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const { access_token, expires_in } = response.data;
  authState = {
    accessToken: access_token,
    expiresAt: Date.now() + expires_in * 1000,
  };

  return access_token;
}

async function getAccessToken(): Promise<string> {
  if (
    authState &&
    Date.now() < authState.expiresAt - TOKEN_REFRESH_BUFFER_MS
  ) {
    return authState.accessToken;
  }
  return refreshAccessToken();
}

// ─── API Client Factory ──────────────────────────────────────────────────────

function createApiClient(baseURL: string, addOrgId = true): AxiosInstance {
  const client = axios.create({ baseURL });

  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    const { organizationId } = getConfig();
    config.headers["Authorization"] = `Zoho-oauthtoken ${token}`;
    config.headers["Content-Type"] = "application/json";
    if (addOrgId) {
      config.params = { ...config.params, organization_id: organizationId };
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Force token refresh on 401
        authState = null;
        const token = await getAccessToken();
        if (error.config) {
          error.config.headers["Authorization"] = `Zoho-oauthtoken ${token}`;
          return axios(error.config);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// ─── Exported Clients ────────────────────────────────────────────────────────

export const booksClient = createApiClient(ZOHO_BOOKS_URL);
export const inventoryClient = createApiClient(ZOHO_INVENTORY_URL);

export const learnClient = createApiClient(ZOHO_LEARN_URL, false);
learnClient.interceptors.request.use((config) => {
  const params = new URLSearchParams(config.params as Record<string, string>).toString();
  const url = `${config.baseURL}${config.url}${params ? "?" + params : ""}`;
  console.error(`[learnClient] ${config.method?.toUpperCase()} ${url}`);
  return config;
});

// ─── Error Handler ───────────────────────────────────────────────────────────

export function handleApiError(error: unknown, context: string): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message = data?.message ?? error.message;

    if (status === 401) {
      throw new Error(`Authentication failed for ${context}. Check your ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN.`);
    }
    if (status === 403) {
      throw new Error(`Permission denied for ${context}. Ensure your OAuth scope includes the required permissions.`);
    }
    if (status === 404) {
      throw new Error(`Resource not found in ${context}. Verify the ID is correct.`);
    }
    if (status === 429) {
      throw new Error(`Rate limit exceeded for ${context}. Zoho allows 2500-5000 requests/day. Try again later.`);
    }
    throw new Error(`Zoho API error in ${context} (HTTP ${status}): ${message}`);
  }
  throw new Error(`Unexpected error in ${context}: ${String(error)}`);
}

// ─── Response Formatter ──────────────────────────────────────────────────────

export function formatSuccess(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

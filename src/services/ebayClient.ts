import axios from "axios";

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;
  const refreshToken = process.env.EBAY_REFRESH_TOKEN;
  if (!appId || !certId || !refreshToken) {
    throw new Error("Missing EBAY_APP_ID, EBAY_CERT_ID, or EBAY_REFRESH_TOKEN");
  }
  const scope = process.env.EBAY_SCOPES ?? "https://api.ebay.com/oauth/api_scope";
  const basic = Buffer.from(`${appId}:${certId}`).toString("base64");
  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", refreshToken);
  params.set("scope", scope);
  const resp = await axios.post(
    "https://api.ebay.com/identity/v1/oauth2/token",
    params.toString(),
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const token = resp.data.access_token as string;
  const expiresIn = (resp.data.expires_in as number) ?? 7200;
  tokenCache = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
  return token;
}

export interface EbayProxyResult {
  status: number;
  data: unknown;
}

export async function callEbayApi(
  method: string,
  path: string,
  body?: unknown
): Promise<EbayProxyResult> {
  const token = await getAccessToken();
  const resp = await axios.request({
    method,
    url: `https://api.ebay.com${path}`,
    data: body,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    validateStatus: () => true,
  });
  return { status: resp.status, data: resp.data };
}

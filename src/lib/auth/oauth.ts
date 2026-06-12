import 'server-only';

export type OAuthProvider = 'kakao' | 'google';

interface OAuthConfig {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

export interface OAuthProfile {
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

const REDIRECT_BASE = process.env.APP_URL ?? 'http://localhost:3000';

export function getConfig(provider: OAuthProvider): OAuthConfig {
  if (provider === 'kakao') {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Kakao OAuth env vars not set');
    return {
      authorizeUrl: 'https://kauth.kakao.com/oauth/authorize',
      tokenUrl: 'https://kauth.kakao.com/oauth/token',
      userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
      clientId,
      clientSecret,
      scope: 'profile_nickname profile_image account_email',
    };
  }
  // google
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth env vars not set');
  return {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    clientId,
    clientSecret,
    scope: 'openid email profile',
  };
}

export function getRedirectUri(provider: OAuthProvider): string {
  return `${REDIRECT_BASE}/api/auth/callback/${provider}`;
}

export function buildAuthorizeUrl(provider: OAuthProvider, state: string): string {
  const cfg = getConfig(provider);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: getRedirectUri(provider),
    response_type: 'code',
    scope: cfg.scope,
    state,
  });
  return `${cfg.authorizeUrl}?${params}`;
}

export async function exchangeCode(provider: OAuthProvider, code: string): Promise<string> {
  const cfg = getConfig(provider);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(provider),
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });
  const res = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function fetchProfile(provider: OAuthProvider, accessToken: string): Promise<OAuthProfile> {
  const cfg = getConfig(provider);
  const res = await fetch(cfg.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  const data = await res.json();

  if (provider === 'kakao') {
    const account = data.kakao_account ?? {};
    const profile = account.profile ?? data.properties ?? {};
    return {
      providerId: String(data.id),
      email: account.email,
      name: profile.nickname,
      avatarUrl: profile.profile_image_url ?? profile.thumbnail_image_url,
    };
  }
  // google
  return {
    providerId: data.sub,
    email: data.email,
    name: data.name,
    avatarUrl: data.picture,
  };
}

import {
  parseSessionCookie,
  getUserInfo,
  refreshTokens,
} from "@/lib/auth";

const DEV_USER = {
  id: "dev-user-local",
  email: "dev@elixpo.local",
  displayName: "Dev User",
  isAdmin: true,
  provider: "local",
  emailVerified: true,
};

export async function getAuthenticatedUser(cookieHeader: string | null) {
  if (process.env.DEV_SKIP_AUTH === "true") {
    return DEV_USER;
  }

  const session = parseSessionCookie(cookieHeader);

  if (!session) {
    return null;
  }

  let user = await getUserInfo(session.accessToken);

  if (user) {
    return user;
  }

  const newTokens = await refreshTokens(session.refreshToken);

  if (!newTokens) {
    return null;
  }

  user = await getUserInfo(newTokens.access_token);

  return user;
}

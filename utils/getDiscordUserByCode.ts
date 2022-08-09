import env from "./env";
import fetch from "node-fetch";

export const getDiscordUserByCode = async (code: string) => {
  const params = new URLSearchParams({
    client_id: env("DC_CLIENT_ID"),
    client_secret: env("DC_CLIENT_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri: env("DC_REDIRECT_URL"),
  } as any);

  const response = await fetch(`https://discord.com/api/v10/oauth2/token`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    method: "post",
  });

  const tokens = await response.json();

  const meResponse = await fetch(`https://discordapp.com/api/users/@me`, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  const me = await meResponse.json();

  return me;
};

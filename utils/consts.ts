import env from "./env";

export const IS_DEV = () => {
  const env_var = env("NODE_ENV");
  return !env_var || env_var.includes("dev");
};

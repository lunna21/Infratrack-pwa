interface EnvConfig {
  BASE_URL: string;
  PROJECT_ID: string;
  PROJECT_COLOR: string;
}

export const ENV: EnvConfig = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  PROJECT_ID: import.meta.env.VITE_PROJECT_ID,
  PROJECT_COLOR: import.meta.env.VITE_PROJECT_COLOR,
};
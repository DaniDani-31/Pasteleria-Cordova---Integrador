const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const API = `${BACKEND_URL}/api`;

export const ML_API =
  process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

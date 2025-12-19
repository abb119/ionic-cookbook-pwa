const API_BASE = "/api";

function getToken(): string | null {
  const t = localStorage.getItem("token");
  if (!t || t === "undefined" || t === "null") return null;
  return t;
}

interface RequestOptions {
  method?: string;
  body?: any;
  params?: Record<string, any>;
  auth?: boolean;
}

async function request(method: string, path: string, options: RequestOptions = {}) {
  const { body, params, auth } = options;

  const url = new URL(API_BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {};

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      console.warn("API: Token required but not found in localStorage");
      throw new Error("Token requerido");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const contentType = resp.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (resp.status !== 204 && isJson) {
    data = await resp.json();
  }

  if (!resp.ok) {
    const msg = data?.error || data?.message || `Error ${resp.status}`;
    const err: any = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default {
  get(path: string, options: RequestOptions = {}) {
    return request("GET", path, options);
  },
  delete(path: string, options: RequestOptions = {}) {
    return request("DELETE", path, options);
  },
  post(path: string, body: any, options: RequestOptions = {}) {
    return request("POST", path, { ...options, body });
  },
  put(path: string, body: any, options: RequestOptions = {}) {
    return request("PUT", path, { ...options, body });
  },
};

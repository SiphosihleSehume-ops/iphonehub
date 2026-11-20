export class ApiError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

/** JSON fetch helper for the admin API. Sends you to the login page if the session ended. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new ApiError("Session ended. Please sign in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Something went wrong.", data.fieldErrors);
  return data as T;
}

/** Shrinks a photo in the browser so it stays small enough to store (max 560px, WebP). */
export async function imageToDataUrl(file: File): Promise<string> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
    throw new ApiError("Use a PNG, JPG or WebP photo.");
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 560 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ApiError("Your browser could not process that image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.86);
}

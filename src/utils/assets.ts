export function resolveAssetPath(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const result = `${cleanBase}${cleanUrl}`;
  if (result.startsWith('//')) {
    return result.replace(/^\/+/, '/');
  }
  return result;
}

export default function useBaseUrl(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

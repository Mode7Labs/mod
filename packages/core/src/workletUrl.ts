export const getWorkletUrl = (filename: string): string => {
  if (typeof document === 'undefined') {
    return filename;
  }
  return new URL(`worklets/${filename}`, document.baseURI || window.location.href).toString();
};


export function formatKB(bytes: number): string {
  return (bytes / 1024).toFixed(2);
}

export function calculateCompressionRatio(original: number, compressed: number): string {
  return ((1 - compressed / original) * 100).toFixed(2);
}

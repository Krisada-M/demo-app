export const formatBangkokTime = (utcMs?: number) => {
  if (!utcMs) return 'Never synced';
  const offsetMs = 7 * 60 * 60 * 1000;
  const date = new Date(utcMs + offsetMs);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const mins = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins} BKK`;
};

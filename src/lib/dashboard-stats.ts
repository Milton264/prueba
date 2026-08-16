import type { TrendPoint } from '@/components/dashboard/trend-chart';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Construye los últimos `n` meses (incluido el actual) como puntos de tendencia,
 * contando cuántas filas caen en cada mes según su campo de fecha.
 */
export function monthlyTrend(
  rows: { created_at?: string | null }[],
  n = 6,
): TrendPoint[] {
  const now = new Date();
  const buckets: { key: string; label: string; value: number }[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MESES[d.getMonth()], value: 0 });
  }

  for (const row of rows) {
    if (!row.created_at) continue;
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  }

  return buckets.map(({ label, value }) => ({ label, value }));
}

/** Cuenta filas por tipo de servicio (diésel / agua). */
export function countByType(rows: { service_type?: string | null }[]) {
  let diesel = 0;
  let agua = 0;
  for (const r of rows) {
    if (r.service_type === 'diesel') diesel += 1;
    else if (r.service_type === 'agua') agua += 1;
  }
  return { diesel, agua };
}

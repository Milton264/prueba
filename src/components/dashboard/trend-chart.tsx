'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface TrendPoint {
  label: string;
  value: number;
}

/**
 * Línea/área de tendencia mensual (p. ej. "Solicitudes por mes" o "Entregas").
 * Recibe los puntos ya agregados desde el servidor.
 */
export function TrendChart({
  data,
  color = '#E0A402',
  height = 200,
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
}) {
  const empty = data.every((d) => d.value === 0);

  if (data.length === 0 || empty) {
    return (
      <div
        className="flex items-center justify-center text-sm text-navy-400"
        style={{ height }}
      >
        Aún no hay datos suficientes para mostrar la tendencia.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#7690B8', fontFamily: 'var(--font-sans)' }}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#7690B8', fontFamily: 'var(--font-sans)' }}
          allowDecimals={false}
          width={40}
        />
        <Tooltip
          cursor={{ stroke: '#D6DEEB', strokeWidth: 1 }}
          contentStyle={{
            border: '1px solid #D6DEEB',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 8px 24px -12px rgba(4,11,29,0.25)',
          }}
          labelStyle={{ color: '#040B1D', fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#trendFill)"
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

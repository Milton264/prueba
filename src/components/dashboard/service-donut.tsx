'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

/**
 * Dona de "Solicitudes por tipo" (diésel vs agua), con la paleta de la marca.
 * Recibe los conteos ya calculados desde el servidor.
 */
export function ServiceDonut({ diesel, agua }: { diesel: number; agua: number }) {
  const total = diesel + agua;
  const data = [
    { name: 'Diésel', value: diesel, color: '#E0A402' },
    { name: 'Agua', value: agua, color: '#264873' },
  ];

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-navy-400">
        Aún no hay solicitudes registradas.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
      <div className="relative h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-2xl font-semibold text-navy-900">{total}</span>
          <span className="font-sans text-[9px] uppercase tracking-eyebrow text-navy-400">Total</span>
        </div>
      </div>

      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden />
            <span className="text-[13px] font-medium text-navy-700">{d.name}</span>
            <span className="font-sans text-[13px] font-semibold tabular-nums text-navy-900">
              {pct(d.value)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

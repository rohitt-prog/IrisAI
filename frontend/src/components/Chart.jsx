import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#818cf8', '#06b6d4', '#34d399', '#fbbf24', '#f472b6', '#f87171'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 22, 46, 0.95)',
        border: '1px solid var(--border-medium)',
        borderRadius: '0.75rem',
        padding: '0.625rem 0.875rem',
        boxShadow: 'var(--glow-sm)',
        backdropFilter: 'blur(20px)',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1rem' }}>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const Chart = ({ probabilities }) => {
  if (!probabilities || typeof probabilities !== 'object') return null;

  const data = Object.keys(probabilities).map(key => ({
    name: key,
    value: parseFloat((probabilities[key] * 100).toFixed(1)),
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <p className="section-label" style={{ marginBottom: '1rem' }}>Class Probabilities</p>
      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
            <Bar dataKey="value" radius={[0, 5, 5, 0]} background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 5, 5, 0] }}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={index === 0 ? 1 : 0.45} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;

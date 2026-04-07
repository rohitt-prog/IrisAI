import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';

// ── Color map per condition ────────────────────────────────────────────────
const conditionColors = {
  Normal: '#22c55e',
  Cataract: '#f59e0b',
  Glaucoma: '#ef4444',
  'Diabetic Retinopathy': '#dc2626',
  Uveitis: '#a855f7',
  Keratoconus: '#06b6d4',
};

// ── Custom tooltip for charts ──────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 22, 46, 0.95)',
        border: '1px solid rgba(96,165,250,0.22)',
        borderRadius: '0.75rem',
        padding: '0.625rem 0.875rem',
        backdropFilter: 'blur(20px)',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{label || payload[0].name}</p>
        <p style={{ color: payload[0].fill || '#60a5fa', fontWeight: 700, fontSize: '1rem' }}>
          {payload[0].value} case{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

// ── Confirm Delete Modal ───────────────────────────────────────────────────
const ConfirmModal = ({ reportId, onConfirm, onCancel, deleting }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 999,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }}>
    <div
      className="animate-fade-in-up glass-card-elevated"
      style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', textAlign: 'center' }}
    >
      {/* Icon */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.25rem',
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.75rem',
      }}>
        🗑️
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.625rem', fontFamily: 'Space Grotesk, sans-serif' }}>
        Delete Record?
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.5rem' }}>
        This will permanently delete report{' '}
        <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>
          #{reportId?.substring(0, 8).toUpperCase()}
        </code>
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '2rem' }}>
        This action cannot be undone.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onCancel}
          disabled={deleting}
          style={{
            flex: 1, padding: '0.875rem',
            borderRadius: '0.875rem',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          style={{
            flex: 1, padding: '0.875rem',
            borderRadius: '0.875rem',
            background: deleting ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#f87171',
            fontWeight: 700, fontSize: '0.9rem',
            cursor: deleting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => !deleting && Object.assign(e.currentTarget.style, { background: 'rgba(239,68,68,0.25)' })}
          onMouseLeave={e => !deleting && Object.assign(e.currentTarget.style, { background: 'rgba(239,68,68,0.15)' })}
        >
          {deleting ? (
            <>
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(248,113,113,0.4)', borderTopColor: '#f87171', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} />
              Deleting...
            </>
          ) : '🗑️ Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── TrashButton ──────────────────────────────────────────────────────────
const TrashButton = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Delete this record"
    style={{
      padding: '0.35rem 0.7rem',
      borderRadius: '0.5rem',
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      color: '#f87171',
      cursor: 'pointer',
      fontSize: '0.85rem',
      transition: 'all 0.18s',
      lineHeight: 1,
    }}
    onMouseEnter={e => Object.assign(e.currentTarget.style, {
      background: 'rgba(239,68,68,0.2)',
      border: '1px solid rgba(239,68,68,0.45)',
      transform: 'scale(1.08)',
    })}
    onMouseLeave={e => Object.assign(e.currentTarget.style, {
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      transform: 'scale(1)',
    })}
  >
    🗑
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────
const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const [deleteTarget, setDeleteTarget] = useState(null);   // report_id to delete
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const res = await axios.get(`${API_URL}/history/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchHistory(); }, [navigate]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/history/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from local state immediately — no full re-fetch needed
      setHistory(prev => prev.filter(r => r.report_id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--iris-500)', borderRadius: '50%', animation: 'spin-slow 0.9s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading patient history...</p>
      </div>
    );
  }

  // Build chart data from history
  const diseaseCounts = {};
  history.forEach(item => {
    diseaseCounts[item.prediction] = (diseaseCounts[item.prediction] || 0) + 1;
  });
  const chartData = Object.entries(diseaseCounts)
    .map(([name, value]) => ({ name, value, fill: conditionColors[name] || '#60a5fa' }))
    .sort((a, b) => b.value - a.value);

  const maxCount = chartData[0]?.value || 1;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          reportId={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div>
        <span className="badge badge-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>📋 Medical Records</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
          Patient History <span className="gradient-text">&amp; Analytics</span>
        </h1>
      </div>

      {history.length === 0 ? (
        <div className="glass-card-elevated" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '4rem' }}>📭</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>No Screenings Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            You haven't performed any eye health screenings yet. Start your first AI-powered analysis now.
          </p>
          <Link to="/upload" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            🔬 Start First Screening
          </Link>
        </div>
      ) : (
        <>
          {/* ── Top Stats Row ────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--iris-400)' }}>
                {history.length}
              </div>
              <div className="section-label" style={{ marginTop: '0.375rem' }}>Total Screenings</div>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: '#22c55e' }}>
                {chartData.find(d => d.name === 'Normal')?.value || 0}
              </div>
              <div className="section-label" style={{ marginTop: '0.375rem' }}>Normal Results</div>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: '#ef4444' }}>
                {history.length - (chartData.find(d => d.name === 'Normal')?.value || 0)}
              </div>
              <div className="section-label" style={{ marginTop: '0.375rem' }}>Conditions Found</div>
            </div>
          </div>

          {/* ── Analytics Chart ───────────────────────────────────────── */}
          <div className="glass-card-elevated" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem' }}>
                  📊 Disease Distribution Analytics
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Breakdown of all detected conditions
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['bar', 'pie'].map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '50rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid var(--border-medium)',
                      cursor: 'pointer',
                      background: chartType === type ? 'var(--gradient-primary)' : 'transparent',
                      color: chartType === type ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {type === 'bar' ? '📊 Bar' : '🥧 Pie'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            {chartType === 'bar' && (
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'Inter' }}
                      axisLine={false} tickLine={false} angle={-25} textAnchor="end"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie Chart */}
            {chartType === 'pie' && (
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%" cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: 'var(--text-muted)' }}
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Condition legend bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              {chartData.map(({ name, value, fill }) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
                    <span style={{
                      background: `${fill}20`, color: fill, border: `1px solid ${fill}40`,
                      borderRadius: '50rem', padding: '1px 10px', fontSize: '0.75rem', fontWeight: 700,
                    }}>{value} case{value !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '50rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(value / maxCount) * 100}%`, background: fill, borderRadius: '50rem', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── History Table ─────────────────────────────────────────── */}
          <div className="glass-card-elevated" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem' }}>Screening Records</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{history.length} records</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Click 🗑 to delete a record
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Report ID</th>
                    <th>Condition</th>
                    <th>Confidence</th>
                    <th style={{ textAlign: 'center' }}>PDF</th>
                    <th style={{ textAlign: 'center' }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => {
                    const pct = (item.confidence * 100).toFixed(1);
                    const isHigh = item.confidence > 0.8;
                    const isMed  = item.confidence > 0.6;
                    const badgeCls = isHigh ? 'badge-success' : isMed ? 'badge-warning' : 'badge-danger';
                    const color = conditionColors[item.prediction] || 'var(--text-primary)';
                    return (
                      <tr key={idx} style={{ transition: 'opacity 0.2s' }}>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>
                            #{item.report_id.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color }}>{item.prediction}</span>
                        </td>
                        <td>
                          <span className={`badge ${badgeCls}`}>{pct}%</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <a
                            href={`${API_URL}/report/download-report?id=${item.report_id}`}
                            className="btn-secondary"
                            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', gap: '4px' }}
                          >
                            📄 PDF
                          </a>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <TrashButton onClick={() => setDeleteTarget(item.report_id)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default History;

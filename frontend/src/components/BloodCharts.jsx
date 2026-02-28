import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const BLOOD_COLORS = {
  'O+': '#ef4444',
  'O-': '#f87171',
  'A+': '#22c55e',
  'A-': '#4ade80',
  'B+': '#3b82f6',
  'B-': '#60a5fa',
  'AB+': '#a855f7',
  'AB-': '#c084fc',
};

const getColor = (bloodType) => BLOOD_COLORS[bloodType] || '#64748b';

export const BloodTypeChart = ({ inventory }) => {
  const data = useMemo(() => {
    const byType = {};
    inventory.forEach((item) => {
      const t = item.blood_type || 'Unknown';
      byType[t] = (byType[t] || 0) + (item.quantity || 0);
    });
    return Object.entries(byType).map(([name, quantity]) => ({
      name,
      quantity,
      fill: getColor(name),
    }));
  }, [inventory]);

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        Add inventory to see blood type distribution.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis
          dataKey="name"
          stroke="#94a3b8"
          tick={{ fill: '#e5e7eb', fontSize: 12 }}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fill: '#e5e7eb', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid rgba(148,163,184,0.3)',
            borderRadius: '8px',
            color: '#e5e7eb',
          }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Bar dataKey="quantity" fill="#38bdf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RegionAvailabilityChart = ({ inventory }) => {
  const data = useMemo(() => {
    const byRegion = {};
    inventory.forEach((item) => {
      const region = item.region_name || item.location || 'Unknown';
      byRegion[region] = (byRegion[region] || 0) + (item.quantity || 0);
    });
    return Object.entries(byRegion)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  }, [inventory]);

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        Add inventory to see availability by region.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis
          type="number"
          stroke="#94a3b8"
          tick={{ fill: '#e5e7eb', fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={72}
          stroke="#94a3b8"
          tick={{ fill: '#e5e7eb', fontSize: 11 }}
          tickFormatter={(v) => (v?.length > 12 ? v.slice(0, 10) + '…' : v)}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid rgba(148,163,184,0.3)',
            borderRadius: '8px',
            color: '#e5e7eb',
          }}
        />
        <Bar dataKey="quantity" fill="#38bdf8" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const BloodTypePieChart = ({ inventory }) => {
  const data = useMemo(() => {
    const byType = {};
    inventory.forEach((item) => {
      const t = item.blood_type || 'Unknown';
      byType[t] = (byType[t] || 0) + (item.quantity || 0);
    });
    return Object.entries(byType).map(([name, value]) => ({
      name,
      value,
      fill: getColor(name),
    }));
  }, [inventory]);

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        Add inventory to see the pie chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={{ stroke: '#94a3b8' }}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid rgba(148,163,184,0.3)',
            borderRadius: '8px',
            color: '#e5e7eb',
          }}
          formatter={(value, name) => [`${value} units`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

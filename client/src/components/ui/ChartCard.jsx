import React from 'react';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import Card from './Card';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const PALETTE = ['#D98E68', '#8FAF98', '#38bdf8', '#F0B08E', '#818cf8', '#f59e0b'];

/** Shared Chart.js wrapper for dashboard and reporting charts. */
export const ChartCard = ({
  title,
  subtitle,
  data = [],
  type = 'bar',
  height = 220,
  action,
  horizontal = false,
  stacked = false,
  currency = false,
  valueSuffix = '',
  maxValue,
  xAxisTitle,
  datasetLabel,
  showLegend,
  bare = false,
}) => {
  const labels = Array.isArray(data) ? data.map((item) => item.label ?? item.name ?? '') : data.labels || [];
  const values = Array.isArray(data) ? data.map((item) => Number(item.value ?? item.amount ?? 0)) : [];
  const colors = Array.isArray(data) ? data.map((item, i) => item.color || PALETTE[i % PALETTE.length]) : PALETTE;
  const chartData = Array.isArray(data)
    ? { labels, datasets: [{ label: title || datasetLabel, data: values, backgroundColor: type === 'line' ? 'rgba(56, 189, 248, .18)' : colors, borderColor: type === 'line' ? '#38bdf8' : colors, borderWidth: type === 'line' ? 2 : 1, borderRadius: type === 'bar' ? 6 : 0, pointBackgroundColor: '#38bdf8', pointRadius: 3, fill: type === 'line', tension: 0.35 }] }
    : data;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: { display: showLegend ?? ['pie', 'doughnut'].includes(type), position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label ? `${context.dataset.label}: ` : ''}${currency ? '₹' : ''}${Number(horizontal ? context.parsed?.x : context.parsed?.y ?? context.parsed?.r ?? context.raw ?? 0).toLocaleString('en-IN')}${valueSuffix}` } },
    },
    scales: ['pie', 'doughnut'].includes(type) ? {} : {
      x: { beginAtZero: true, ...(maxValue !== undefined ? { max: maxValue } : {}), stacked, title: { display: Boolean(horizontal && xAxisTitle), text: horizontal ? xAxisTitle : undefined, color: '#64748B', font: { size: 11, weight: '600' } }, grid: { display: horizontal }, ticks: { color: '#64748B', maxRotation: 0, autoSkip: true, callback: (value) => currency && horizontal ? `₹${Number(value).toLocaleString('en-IN')}` : `${value}${valueSuffix}` } },
      y: horizontal
        ? { type: 'category', stacked, reverse: true, grid: { display: false }, ticks: { color: '#354962', autoSkip: false, callback: (value) => labels[value] ?? value } }
        : { beginAtZero: true, stacked, grid: { color: 'rgba(100, 116, 139, .12)' }, ticks: { color: '#64748B', callback: (value) => currency ? `₹${Number(value).toLocaleString('en-IN')}` : value } },
    },
  };

  const ChartComponent = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut }[type] || Bar;
  const chart = (
    <div style={{ height, minWidth: 0, position: 'relative' }}>
      {labels.length ? <ChartComponent data={chartData} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>No chart data available</div>}
    </div>
  );

  if (bare) return chart;

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title>{title}</Card.Title>
          {subtitle && <Card.Description>{subtitle}</Card.Description>}
        </div>
        {action && <div>{action}</div>}
      </Card.Header>
      <Card.Content>{chart}</Card.Content>
    </Card>
  );
};

export default ChartCard;

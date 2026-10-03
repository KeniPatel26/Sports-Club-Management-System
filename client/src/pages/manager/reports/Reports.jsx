import React, { useState, useEffect } from 'react';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  TrendingUp,
  Award,
  Calendar,
  ShoppingBag,
  Coffee,
  Users,
  BarChart3,
  PieChart,
  CheckCircle2,
  Download,
} from 'lucide-react';

export const Reports = () => {
  const { toastSuccess, toastError } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await managerService.getFullReport();
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (err) {
      toastError('Failed to fetch analytics reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const revenue = report?.revenueReport || {
    total: 335000,
    breakdown: [
      { name: 'Membership Plans', amount: 150000, percentage: 45, color: '#D98E68' },
      { name: 'Court Turf Bookings', amount: 80000, percentage: 24, color: '#8FAF98' },
      { name: 'Sports Pro-Shop', amount: 60000, percentage: 18, color: '#38bdf8' },
      { name: 'Canteen & Bar Cafe', amount: 45000, percentage: 13, color: '#F0B08E' },
    ],
  };

  const membership = report?.membershipReport || {
    totalMembers: 426,
    activeMembers: 398,
    retentionRate: '94.2%',
    tierDistribution: [
      { tier: 'Gold Tier (VIP)', count: 150, share: '35%' },
      { tier: 'Silver Tier (Standard)', count: 180, share: '42%' },
      { tier: 'Junior Tier (Youth)', count: 96, share: '23%' },
    ],
  };

  const court = report?.courtReport || {
    utilizationList: [
      { court: 'Center Court (Tennis)', utilization: 85, bookings: 42, revenue: 28000 },
      { court: 'Box Cricket Turf 1', utilization: 88, bookings: 44, revenue: 35200 },
      { court: 'Padel Glass Court A', utilization: 78, bookings: 39, revenue: 27300 },
      { court: 'Badminton Court 1', utilization: 60, bookings: 30, revenue: 15000 },
    ],
    peakHours: '06:00 PM - 09:00 PM',
  };

  const shop = report?.shopReport || {
    totalRevenue: 60000,
    topProducts: [
      { name: 'Yonex Astrox 88D Pro Racket', unitsSold: 14, revenue: 28000 },
      { name: 'Head Tour XT Tennis Balls (3-Can)', unitsSold: 42, revenue: 14700 },
      { name: 'Wilson Grip Tape (Pack of 3)', unitsSold: 35, revenue: 5250 },
    ],
  };

  const canteen = report?.canteenReport || {
    totalRevenue: 45000,
    averageOrderValue: 401,
    topItems: [
      { name: 'Cold Brew Espresso', orders: 68, revenue: 10200 },
      { name: 'Avocado Protein Toast', orders: 44, revenue: 9680 },
      { name: 'Whey Protein Shake (Choco)', orders: 52, revenue: 10400 },
    ],
  };

  const employee = report?.employeeReport || {
    totalStaff: 24,
    attendanceRate: '96.5%',
    departments: [
      { department: 'Front Desk', count: 8, payrollMonthly: 200000 },
      { department: 'Sports Pro-Shop', count: 6, payrollMonthly: 150000 },
      { department: 'Canteen & Cafe', count: 10, payrollMonthly: 230000 },
    ],
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Executive Analytics & Reports
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Consolidated operational performance across financial revenue, member retention, court usage, and staff efficiency.
          </p>
        </div>

        <button
          onClick={() => toastSuccess('Exporting Executive PDF Report...')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.15rem',
            backgroundColor: '#354962',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Download size={16} /> Export Consolidated Report
        </button>
      </div>

      {/* Grid: 6 Report Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* 1. Revenue Report */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #DDE2EC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#17263B' }}>
              Consolidated Revenue (₹{revenue.total?.toLocaleString('en-IN')})
            </h3>
            <TrendingUp size={18} color="#D98E68" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {revenue.breakdown?.map((b, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  <span style={{ color: '#354962' }}>{b.name} ({b.percentage}%)</span>
                  <span style={{ color: '#17263B' }}>₹{b.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F4F6FC', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${b.percentage}%`, backgroundColor: b.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Membership Retention Report */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #DDE2EC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#17263B' }}>
              Membership Tiers & Retention
            </h3>
            <Award size={18} color="#8FAF98" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, padding: '0.85rem', backgroundColor: '#F4F6FC', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#17263B' }}>{membership.totalMembers}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Members</div>
            </div>
            <div style={{ flex: 1, padding: '0.85rem', backgroundColor: '#F4F6FC', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8FAF98' }}>{membership.retentionRate}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Annual Retention</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            {membership.tierDistribution?.map((td, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ color: '#354962', fontWeight: 600 }}>{td.tier}</span>
                <strong>{td.count} athletes ({td.share})</strong>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Court Utilization Report */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #DDE2EC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#17263B' }}>
                Court Turf Utilization & Yield
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Peak time: {court.peakHours}</span>
            </div>
            <Calendar size={18} color="#38bdf8" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {court.utilizationList?.map((c, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <span style={{ color: '#354962' }}>{c.court}</span>
                  <span style={{ color: '#D98E68' }}>{c.utilization}%</span>
                </div>
                <div style={{ height: '7px', backgroundColor: '#F4F6FC', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.utilization}%`, backgroundColor: '#8FAF98', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Pro Shop Sales Report */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #DDE2EC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#17263B' }}>
              Top Selling Pro-Shop Merchandise
            </h3>
            <ShoppingBag size={18} color="#354962" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {shop.topProducts?.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F4F6FC', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#17263B' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.unitsSold} units sold this month</div>
                </div>
                <strong style={{ color: '#D98E68' }}>₹{p.revenue?.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Canteen Report */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #DDE2EC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#17263B' }}>
                Canteen & Bar Turnover
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Avg Order Value: ₹{canteen.averageOrderValue}</span>
            </div>
            <Coffee size={18} color="#D98E68" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {canteen.topItems?.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F4F6FC', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#17263B' }}>{it.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{it.orders} servings prepared</div>
                </div>
                <strong style={{ color: '#17263B' }}>₹{it.revenue?.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Employee Report */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #DDE2EC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#17263B' }}>
              Staff Operations & Payroll (₹5.8L)
            </h3>
            <Users size={18} color="#8FAF98" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {employee.departments?.map((dep, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F4F6FC', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#17263B' }}>{dep.department}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{dep.count} Staff Members</div>
                </div>
                <strong style={{ color: '#354962' }}>₹{dep.payrollMonthly?.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

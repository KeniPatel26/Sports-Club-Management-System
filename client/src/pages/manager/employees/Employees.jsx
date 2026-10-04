import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Building,
  UserCheck,
  X,
  Search,
  Filter,
  AlertTriangle,
  MoreVertical,
  Edit3,
  FileText,
  RotateCcw,
} from 'lucide-react';
import FilterDropdown from '../../../components/ui/FilterDropdown';

export const Employees = () => {
  const { toastSuccess, toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'staff';

  const [activeTab, setActiveTab] = useState(
    ['staff', 'shifts', 'attendance', 'leave', 'payroll'].includes(currentTab)
      ? currentTab
      : 'staff'
  );

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams(tabKey === 'staff' ? {} : { tab: tabKey });
  };

  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    kpis: { totalStaff: 18, present: 14, late: 2, onLeave: 2, absent: 0 },
    records: [],
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  // Attendance filter states
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attDept, setAttDept] = useState('ALL');
  const [attStatus, setAttStatus] = useState('ALL');
  const [attSearch, setAttSearch] = useState('');

  // Manager Correction Modal state
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState(null);
  const [editStatus, setEditStatus] = useState('PRESENT');
  const [editCheckIn, setEditCheckIn] = useState('09:00 AM');
  const [editCheckOut, setEditCheckOut] = useState('06:00 PM');
  const [editNotes, setEditNotes] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  // Add Employee Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'FRONT_DESK',
    designation: 'Front Desk Receptionist',
    salary: 25000,
    employmentType: 'FULL_TIME',
    shiftStartTime: '09:00 AM',
    shiftEndTime: '05:00 PM',
  });

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [empRes, shiftRes, attRes, leaveRes, payRes] = await Promise.allSettled([
        managerService.getEmployees(),
        managerService.getShifts(),
        managerService.getAttendance({
          date: attDate,
          department: attDept,
          status: attStatus,
          search: attSearch,
        }),
        managerService.getLeaveRequests(),
        managerService.getPayroll(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value.success) setStaff(empRes.value.data);
      if (shiftRes.status === 'fulfilled' && shiftRes.value.success) setShifts(shiftRes.value.data);
      if (attRes.status === 'fulfilled' && attRes.value.success) {
        setAttendanceData(attRes.value.data);
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value.success) setLeaveRequests(leaveRes.value.data);
      if (payRes.status === 'fulfilled' && payRes.value.success) setPayroll(payRes.value.data);
    } catch (err) {
      toastError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [attDate, attDept, attStatus]);

  // Attendance live search
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await managerService.getAttendance({
          date: attDate,
          department: attDept,
          status: attStatus,
          search: attSearch,
        });
        if (res.success) {
          setAttendanceData(res.data);
        }
      } catch (e) {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [attSearch]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createEmployee(newEmployee);
      if (res.success) {
        toastSuccess(`Staff member ${newEmployee.firstName} created for ${newEmployee.department}!`);
        setShowAddModal(false);
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: 'FRONT_DESK',
          designation: 'Front Desk Receptionist',
          salary: 25000,
          employmentType: 'FULL_TIME',
          shiftStartTime: '09:00 AM',
          shiftEndTime: '05:00 PM',
        });
        fetchStaffData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleOpenEditAttendance = (rec) => {
    setSelectedRecordForEdit(rec);
    setEditStatus(rec.status || 'PRESENT');
    setEditCheckIn(rec.checkIn && rec.checkIn !== '—' ? rec.checkIn : '09:00 AM');
    setEditCheckOut(rec.checkOut && rec.checkOut !== '—' ? rec.checkOut : '06:00 PM');
    setEditNotes(rec.notes || '');
  };

  const handleSaveAttendanceCorrection = async (e) => {
    e.preventDefault();
    if (!selectedRecordForEdit) return;

    setSubmittingCorrection(true);
    try {
      const res = await managerService.updateAttendanceRecord(selectedRecordForEdit.attendanceId || selectedRecordForEdit.id, {
        staffId: selectedRecordForEdit.employeeId,
        dateKey: attDate,
        status: editStatus,
        checkInTime: editCheckIn,
        checkOutTime: editCheckOut,
        notes: editNotes,
      });

      if (res.success) {
        toastSuccess(`Attendance record updated for ${selectedRecordForEdit.name}!`);
        setSelectedRecordForEdit(null);
        fetchStaffData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const handleLeaveDecision = async (id, status) => {
    try {
      const res = await managerService.updateLeaveStatus(id, status);
      if (res.success) {
        toastSuccess(`Leave request marked as ${status}`);
        fetchStaffData();
      }
    } catch (err) {
      toastError('Failed to update leave request');
    }
  };

  const handlePaySalary = async (record) => {
    try {
      const res = await managerService.markPayrollPaid({
        staffId: record.staffId,
        basicSalary: record.basicSalary,
        bonus: record.bonus,
        deduction: record.deduction,
      });
      if (res.success) {
        toastSuccess(`Salary of ₹${record.netSalary} marked as PAID for ${record.employeeName}`);
        fetchStaffData();
      }
    } catch (err) {
      toastError('Failed to process payroll payment');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Heading & Quick Add Staff CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-family-display)', margin: 0 }}>
            {activeTab === 'attendance' && 'Employee Attendance'}
            {activeTab === 'staff' && 'Employees & Staff Directory'}
            {activeTab === 'shifts' && 'Staff Shifts & Rosters'}
            {activeTab === 'leave' && 'Leave Requests'}
            {activeTab === 'payroll' && 'Payroll & Compensation'}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0 0', fontSize: '0.92rem' }}>
            {activeTab === 'attendance' && 'Monitor employee live attendance, shifts, working hours, and manual adjustments.'}
            {activeTab === 'staff' && 'All active club personnel across Front Desk, Sports Shop, and Canteen departments.'}
            {activeTab === 'shifts' && 'Scheduled rosters and operational duty hours.'}
            {activeTab === 'leave' && 'Review staff absence and vacation approval requests.'}
            {activeTab === 'payroll' && 'Monthly employee compensation, performance incentives, and payout ledger.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#D98E68',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(217, 142, 104, 0.3)',
            transition: 'var(--transition)',
          }}
        >
          <Plus size={17} />
          Add Employee
        </button>
      </div>

      {/* Modern Tabs Navigation with curated contrast */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
        {[
          { key: 'staff', label: 'All Staff Directory', icon: Users, count: staff.length },
          { key: 'attendance', label: 'Employee Attendance', icon: UserCheck, count: attendanceData.records?.length || 0 },
          { key: 'shifts', label: 'Work Shifts', icon: Calendar, count: shifts.length },
          { key: 'leave', label: 'Leave Requests', icon: Clock, count: leaveRequests.filter((l) => l.status === 'PENDING').length },
          { key: 'payroll', label: 'Monthly Payroll', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabSelect(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? '#354962' : '#E2E8F0',
                backgroundColor: isActive ? '#354962' : '#F4F6FC',
                color: isActive ? '#FFFFFF' : '#64748B',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYEE ATTENDANCE (Comprehensive Spec Implementation)            */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Staff</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#354962', marginTop: '0.25rem' }}>{attendanceData.kpis?.totalStaff || staff.length || 18}</div>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Active roster</span>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Present</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>{attendanceData.kpis?.present || 14}</div>
              <span style={{ fontSize: '0.78rem', color: '#16a34a' }}>On duty today</span>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Late Check-in</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>{attendanceData.kpis?.late || 2}</div>
              <span style={{ fontSize: '0.78rem', color: '#d97706' }}>&gt; 10m grace</span>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>On Leave</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb', marginTop: '0.25rem' }}>{attendanceData.kpis?.onLeave || 2}</div>
              <span style={{ fontSize: '0.78rem', color: '#2563eb' }}>Approved leave</span>
            </div>
          </div>

          {/* Operational Filters Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              {/* Date Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Date:</span>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#354962',
                    backgroundColor: '#F4F6FC',
                  }}
                />
              </div>

              <FilterDropdown label="Department" value={attDept} onChange={(e) => setAttDept(e.target.value)} options={[
                { value: 'ALL', label: 'All departments' },
                { value: 'FRONT_DESK', label: 'Front desk' },
                { value: 'SPORTS_SHOP', label: 'Sports shop' },
                { value: 'CANTEEN', label: 'Canteen & bar' },
              ]} />
              <FilterDropdown label="Status" value={attStatus} onChange={(e) => setAttStatus(e.target.value)} options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'PRESENT', label: 'Present' },
                { value: 'LATE', label: 'Late' },
                { value: 'LEAVE', label: 'On leave' },
                { value: 'ABSENT', label: 'Absent' },
              ]} />
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search employee..."
                value={attSearch}
                onChange={(e) => setAttSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.85rem',
                  backgroundColor: '#F4F6FC',
                }}
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Employee</th>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Department</th>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Shift</th>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Check In</th>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Check Out</th>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Hours</th>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Status</th>
                  <th style={{ padding: '0.9rem 1.15rem' }}>Source</th>
                  <th style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.records?.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                      No attendance records found for this date & filter selection.
                    </td>
                  </tr>
                ) : (
                  attendanceData.records.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #EEF2F6', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '0.9rem 1.15rem' }}>
                        <div style={{ fontWeight: 700, color: '#354962' }}>{r.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{r.staffCode || r.email}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#F4F6FC',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#354962',
                          }}
                        >
                          {r.department?.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem', color: '#354962', fontWeight: 600 }}>
                        {r.shift || '09:00 - 18:00'}
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem', color: '#17263B', fontWeight: 700 }}>
                        {r.checkIn || '—'}
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem', color: '#64748B' }}>
                        {r.checkOut || '—'}
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem', color: '#354962', fontWeight: 600 }}>
                        {r.workedHours || '—'}
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem' }}>
                        <span
                          style={{
                            backgroundColor:
                              r.status === 'PRESENT'
                                ? 'rgba(22, 163, 74, 0.12)'
                                : r.status === 'LATE'
                                ? 'rgba(217, 119, 6, 0.12)'
                                : r.status === 'LEAVE' || r.status === 'ON_LEAVE'
                                ? 'rgba(37, 99, 235, 0.12)'
                                : 'rgba(239, 68, 68, 0.12)',
                            color:
                              r.status === 'PRESENT'
                                ? '#16a34a'
                                : r.status === 'LATE'
                                ? '#d97706'
                                : r.status === 'LEAVE' || r.status === 'ON_LEAVE'
                                ? '#2563eb'
                                : '#dc2626',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            display: 'inline-block',
                          }}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: r.source === 'LOGIN' ? 'rgba(53, 73, 98, 0.08)' : '#F4F6FC',
                            color: r.source === 'LOGIN' ? '#354962' : '#64748B',
                          }}
                        >
                          {r.source || 'Login'}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenEditAttendance(r)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            backgroundColor: '#F4F6FC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            color: '#354962',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL STAFF DIRECTORY                                                */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.9rem 1.15rem' }}>Employee</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Department</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Designation</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Shift</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Monthly Salary</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id || s._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.9rem 1.15rem', fontWeight: 700, color: '#354962' }}>
                    {s.name}
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{s.email} • {s.phone}</div>
                  </td>
                  <td style={{ padding: '0.9rem 1.15rem' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F4F6FC', border: '1px solid #E2E8F0', fontSize: '0.78rem', fontWeight: 600, color: '#354962' }}>
                      {s.department?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.15rem', color: '#64748B' }}>{s.designation}</td>
                  <td style={{ padding: '0.9rem 1.15rem', color: '#354962', fontWeight: 600 }}>{s.shift}</td>
                  <td style={{ padding: '0.9rem 1.15rem', fontWeight: 700, color: '#D98E68' }}>₹{Number(s.salary).toLocaleString()}</td>
                  <td style={{ padding: '0.9rem 1.15rem' }}>
                    <span style={{ backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', fontWeight: 700, fontSize: '0.78rem', padding: '3px 8px', borderRadius: '999px' }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SHIFTS                                                             */}
      {/* ========================================================================= */}
      {activeTab === 'shifts' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.9rem 1.15rem' }}>Staff</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Department</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Roster Date</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Shift Hours</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.9rem 1.15rem', fontWeight: 700, color: '#354962' }}>
                    {s.staff?.firstName} {s.staff?.lastName}
                  </td>
                  <td style={{ padding: '0.9rem 1.15rem', color: '#64748B' }}>{s.department?.replace('_', ' ')}</td>
                  <td style={{ padding: '0.9rem 1.15rem', color: '#354962' }}>{new Date(s.date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.9rem 1.15rem', fontWeight: 700, color: '#D98E68' }}>{s.startTime} - {s.endTime}</td>
                  <td style={{ padding: '0.9rem 1.15rem' }}>
                    <span style={{ backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', fontWeight: 700, fontSize: '0.78rem', padding: '3px 8px', borderRadius: '999px' }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LEAVE REQUESTS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.9rem 1.15rem' }}>Staff Member</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Leave Dates</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Reason</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                    No pending leave requests.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((l) => (
                  <tr key={l._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                    <td style={{ padding: '0.9rem 1.15rem', fontWeight: 700, color: '#354962' }}>
                      {l.staff?.firstName} {l.staff?.lastName}
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{l.staff?.department}</div>
                    </td>
                    <td style={{ padding: '0.9rem 1.15rem', color: '#354962' }}>
                      {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.9rem 1.15rem', color: '#64748B' }}>{l.reason}</td>
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <span
                        style={{
                          backgroundColor: l.status === 'APPROVED' ? 'rgba(22, 163, 74, 0.12)' : l.status === 'PENDING' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: l.status === 'APPROVED' ? '#16a34a' : l.status === 'PENDING' ? '#d97706' : '#dc2626',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          padding: '3px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>
                      {l.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleLeaveDecision(l._id, 'APPROVED')}
                            style={{ padding: '0.35rem 0.75rem', backgroundColor: '#16a34a', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveDecision(l._id, 'REJECTED')}
                            style={{ padding: '0.35rem 0.75rem', backgroundColor: '#dc2626', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PAYROLL                                                            */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.9rem 1.15rem' }}>Employee</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Department</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Basic</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Bonus</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Net Payout</th>
                <th style={{ padding: '0.9rem 1.15rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.9rem 1.15rem', fontWeight: 700, color: '#354962' }}>
                    {p.employeeName}
                  </td>
                  <td style={{ padding: '0.9rem 1.15rem', color: '#64748B' }}>{p.department?.replace('_', ' ')}</td>
                  <td style={{ padding: '0.9rem 1.15rem', color: '#354962' }}>₹{Number(p.basicSalary).toLocaleString()}</td>
                  <td style={{ padding: '0.9rem 1.15rem', color: '#16a34a' }}>+₹{Number(p.bonus).toLocaleString()}</td>
                  <td style={{ padding: '0.9rem 1.15rem', fontWeight: 800, color: '#D98E68' }}>₹{Number(p.netSalary).toLocaleString()}</td>
                  <td style={{ padding: '0.9rem 1.15rem' }}>
                    <span style={{ backgroundColor: p.status === 'PAID' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(217, 119, 6, 0.12)', color: p.status === 'PAID' ? '#16a34a' : '#d97706', fontWeight: 700, fontSize: '0.78rem', padding: '3px 8px', borderRadius: '999px' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>
                    {p.status !== 'PAID' && (
                      <button
                        onClick={() => handlePaySalary(p)}
                        style={{ padding: '0.35rem 0.85rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Disburse Salary
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANAGER ATTENDANCE EDIT & CORRECTION MODAL                                */}
      {/* ========================================================================= */}
      {selectedRecordForEdit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(23, 38, 59, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#354962', margin: 0 }}>
                  Edit Employee Attendance
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {selectedRecordForEdit.name} ({selectedRecordForEdit.department})
                </span>
              </div>
              <button onClick={() => setSelectedRecordForEdit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>
                  Attendance Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late Check-in</option>
                  <option value="LEAVE">On Leave</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>
                    Check-in Time
                  </label>
                  <input
                    type="text"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    placeholder="09:00 AM"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>
                    Check-out Time
                  </label>
                  <input
                    type="text"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    placeholder="06:00 PM"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>
                  Admin Correction Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Reason for manual adjustment..."
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRecordForEdit(null)}
                  style={{ padding: '0.6rem 1.15rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F4F6FC', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#354962', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingCorrection ? 'Saving...' : 'Save Correction (Admin)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD EMPLOYEE MODAL                                                        */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(23, 38, 59, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#354962', margin: 0 }}>Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>First Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    placeholder="e.g. Rahul"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>Last Name</label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    placeholder="e.g. Shah"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="employee@championsclub.com"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="+91-9898000000"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>Department</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                  >
                    <option value="FRONT_DESK">Front Desk</option>
                    <option value="SPORTS_SHOP">Sports Shop</option>
                    <option value="CANTEEN">Canteen & Bar</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#354962', marginBottom: '0.35rem' }}>Designation</label>
                <input
                  type="text"
                  required
                  value={newEmployee.designation}
                  onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                  placeholder="e.g. Senior Receptionist"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.6rem 1.15rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F4F6FC', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#D98E68', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save & Provision Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

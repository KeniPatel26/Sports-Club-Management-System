import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const Employees = () => {
  const { toastSuccess, toastError } = useToast();
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'shifts' | 'attendance' | 'leave' | 'payroll'
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [empRes, shiftRes, attRes, leaveRes, payRes] = await Promise.all([
        managerService.getEmployees(),
        managerService.getShifts(),
        managerService.getTodayAttendance(),
        managerService.getLeaveRequests(),
        managerService.getPayroll(),
      ]);

      if (empRes.success) setStaff(empRes.data);
      if (shiftRes.success) setShifts(shiftRes.data);
      if (attRes.success) setAttendance(attRes.data);
      if (leaveRes.success) setLeaveRequests(leaveRes.data);
      if (payRes.success) setPayroll(payRes.data);
    } catch (err) {
      toastError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

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
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Employee & ERP Operations
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Staff management, department roles (Front Desk, Shop, Canteen), shift schedules, and payroll.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#D98E68',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(217, 142, 104, 0.25)',
          }}
        >
          <Plus size={16} /> + Add Employee
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #DDE2EC', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'staff', label: `Staff Directory (${staff.length})` },
          { id: 'attendance', label: `Today's Attendance (${attendance.length})` },
          { id: 'leave', label: `Leave Approvals (${leaveRequests.length})` },
          { id: 'payroll', label: `Payroll & Salaries (${payroll.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              background: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: activeTab === tab.id ? '#D98E68' : '#64748B',
              borderBottom: activeTab === tab.id ? '2px solid #D98E68' : 'none',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ALL STAFF */}
      {activeTab === 'staff' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Employee ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Designation</th>
                <th style={{ padding: '0.85rem 1rem' }}>Base Salary</th>
                <th style={{ padding: '0.85rem 1rem' }}>Shift</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    {e.name}
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>{e.email}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    <span style={{ backgroundColor: '#E8EAF4', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {e.employeeId}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        backgroundColor: e.department === 'FRONT_DESK'
                          ? 'rgba(56, 189, 248, 0.15)'
                          : e.department === 'SPORTS_SHOP'
                          ? 'rgba(143, 175, 152, 0.2)'
                          : 'rgba(217, 142, 104, 0.18)',
                        color: e.department === 'FRONT_DESK'
                          ? '#0284c7'
                          : e.department === 'SPORTS_SHOP'
                          ? '#8FAF98'
                          : '#D98E68',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        padding: '3px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {e.department?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962', fontWeight: 600 }}>
                    {e.designation}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    ₹{e.salary?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.82rem' }}>
                    {e.shift}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ backgroundColor: 'rgba(143, 175, 152, 0.2)', color: '#8FAF98', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '999px' }}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: TODAY'S ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Staff Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Shift Hours</th>
                <th style={{ padding: '0.85rem 1rem' }}>Check In</th>
                <th style={{ padding: '0.85rem 1rem' }}>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    {a.employeeName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 600, color: '#354962' }}>{a.department?.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{a.shift}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#17263B', fontWeight: 600 }}>{a.checkInTime}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        backgroundColor: a.status === 'PRESENT' ? 'rgba(143, 175, 152, 0.2)' : '#F6DEDE',
                        color: a.status === 'PRESENT' ? '#8FAF98' : '#D97979',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        padding: '3px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: LEAVE REQUESTS */}
      {activeTab === 'leave' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Staff Member</th>
                <th style={{ padding: '0.85rem 1rem' }}>Leave Dates</th>
                <th style={{ padding: '0.85rem 1rem' }}>Reason</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                    No pending leave requests.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((l) => (
                  <tr key={l._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                      {l.staff?.firstName} {l.staff?.lastName}
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{l.staff?.department}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>
                      {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{l.reason}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          backgroundColor: l.status === 'APPROVED' ? 'rgba(143, 175, 152, 0.2)' : l.status === 'PENDING' ? '#F7EBD4' : '#F6DEDE',
                          color: l.status === 'APPROVED' ? '#8FAF98' : l.status === 'PENDING' ? '#D9A65D' : '#D97979',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          padding: '3px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {l.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleLeaveDecision(l._id, 'APPROVED')}
                            style={{ padding: '0.35rem 0.75rem', backgroundColor: '#8FAF98', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveDecision(l._id, 'REJECTED')}
                            style={{ padding: '0.35rem 0.75rem', backgroundColor: '#F6DEDE', color: '#D97979', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
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

      {/* TAB 4: PAYROLL */}
      {activeTab === 'payroll' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Basic</th>
                <th style={{ padding: '0.85rem 1rem' }}>Bonus</th>
                <th style={{ padding: '0.85rem 1rem' }}>Deductions</th>
                <th style={{ padding: '0.85rem 1rem' }}>Net Salary</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Payout</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>{p.employeeName}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>{p.department?.replace('_', ' ')}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>₹{p.basicSalary?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#8FAF98' }}>+₹{p.bonus}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#D97979' }}>-₹{p.deduction}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#17263B' }}>₹{p.netSalary?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ backgroundColor: p.status === 'PAID' ? 'rgba(143, 175, 152, 0.2)' : '#F7EBD4', color: p.status === 'PAID' ? '#8FAF98' : '#D9A65D', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '999px' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {p.status !== 'PAID' ? (
                      <button
                        onClick={() => handlePaySalary(p)}
                        style={{ padding: '0.4rem 0.85rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Paid via Bank</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              padding: '1.75rem',
              border: '1px solid #DDE2EC',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#17263B' }}>
                Add New Club Employee
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    placeholder="e.g. Rahul"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Last Name</label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    placeholder="e.g. Shah"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="e.g. rahul@club.com"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Department *</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  >
                    <option value="FRONT_DESK">Front Desk Department</option>
                    <option value="SPORTS_SHOP">Sports Pro-Shop</option>
                    <option value="CANTEEN">Canteen & Bar Lounge</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Designation *</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                    placeholder="e.g. Receptionist / Sales / Chef"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Assigned Shift</label>
                  <select
                    value={newEmployee.shiftStartTime}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        shiftStartTime: e.target.value,
                        shiftEndTime: e.target.value === '09:00 AM' ? '05:00 PM' : '10:00 PM',
                      })
                    }
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  >
                    <option value="09:00 AM">Morning Shift (09:00 AM - 05:00 PM)</option>
                    <option value="02:00 PM">Evening Shift (02:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Employee
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

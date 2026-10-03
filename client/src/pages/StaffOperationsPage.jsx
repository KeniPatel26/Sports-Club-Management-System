import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Briefcase,
  Plus,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  UserCheck,
  Building,
  DollarSign,
  Coffee,
  ShoppingBag,
  Layers,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import staffService from '../services/staffService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';

export const StaffOperationsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'shifts' | 'leaves'
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [staffList, setStaffList] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false);

  // Forms
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    department: 'FRONT_DESK',
    designation: '',
    salary: '',
    employmentType: 'FULL_TIME',
  });

  const [shiftForm, setShiftForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00 AM',
    endTime: '04:00 PM',
    department: 'FRONT_DESK',
  });

  const [leaveForm, setLeaveForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const isOwner = user?.role === 'OWNER' || user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, shiftRes, leaveRes] = await Promise.allSettled([
        staffService.getStaff(departmentFilter !== 'ALL' ? { department: departmentFilter } : {}),
        staffService.getShifts(departmentFilter !== 'ALL' ? { department: departmentFilter } : {}),
        staffService.getLeaves(),
      ]);

      if (staffRes.status === 'fulfilled' && staffRes.value.success) {
        setStaffList(staffRes.value.data || []);
      }
      if (shiftRes.status === 'fulfilled' && shiftRes.value.success) {
        setShifts(shiftRes.value.data || []);
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value.success) {
        setLeaves(leaveRes.value.data || []);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to fetch staff management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [departmentFilter]);

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await staffService.createStaff({
        ...staffForm,
        salary: Number(staffForm.salary) || 0,
      });
      if (res.success) {
        showSuccess('New staff member onboarded successfully!');
        setIsAddStaffOpen(false);
        setStaffForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          department: 'FRONT_DESK',
          designation: '',
          salary: '',
          employmentType: 'FULL_TIME',
        });
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignShiftSubmit = async (e) => {
    e.preventDefault();
    if (!shiftForm.staffId) {
      showError('Please select an employee');
      return;
    }
    setActionLoading(true);
    try {
      const res = await staffService.createShift(shiftForm);
      if (res.success) {
        showSuccess('Shift scheduled successfully!');
        setIsAssignShiftOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to schedule shift');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestLeaveSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await staffService.requestLeave(leaveForm);
      if (res.success) {
        showSuccess('Leave request submitted for Owner approval!');
        setIsRequestLeaveOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveDecision = async (leaveId, decision) => {
    try {
      const res = await staffService.updateLeaveStatus(leaveId, decision);
      if (res.success) {
        showSuccess(`Leave request marked as ${decision}`);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const getDepartmentIcon = (dept) => {
    switch (dept) {
      case 'FRONT_DESK':
        return <UserCheck size={16} color="var(--primary)" />;
      case 'SPORTS_SHOP':
        return <ShoppingBag size={16} color="#10b981" />;
      case 'CANTEEN':
        return <Coffee size={16} color="#f59e0b" />;
      default:
        return <Building size={16} />;
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Briefcase size={28} color="var(--primary)" />
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>
              Staff & <span className="text-gradient">Operations Roster</span>
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Multi-department management: Front Desk (Courts), Pro Shop (Gear), and Canteen (Bar Lounge).
            Rosters, payroll duties, and leave approval pipeline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={FileText} onClick={() => setIsRequestLeaveOpen(true)}>
            Apply Leave
          </Button>
          {isOwner && (
            <>
              <Button variant="outline" icon={Clock} onClick={() => setIsAssignShiftOpen(true)}>
                Schedule Shift
              </Button>
              <Button variant="primary" icon={Plus} onClick={() => setIsAddStaffOpen(true)}>
                Onboard Employee
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs & Department Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'employees' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'employees' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={16} /> Employee Directory ({staffList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'shifts' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'shifts' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={16} /> Shift Roster ({shifts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaves')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'leaves' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'leaves' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={16} /> Leave Approvals ({leaves.filter((l) => l.status === 'PENDING').length} Pending)
          </button>
        </div>

        {/* Department Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Department:</span>
          {['ALL', 'FRONT_DESK', 'SPORTS_SHOP', 'CANTEEN'].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartmentFilter(dept)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: departmentFilter === dept ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: departmentFilter === dept ? 'var(--primary-light)' : 'var(--bg-card)',
                color: departmentFilter === dept ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {dept.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text="Syncing operational roster..." />
      ) : (
        <>
          {/* TAB 1: EMPLOYEES DIRECTORY */}
          {activeTab === 'employees' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {staffList.map((item) => {
                const staffUser = item.user;
                return (
                  <Card key={item._id} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                          }}
                        >
                          {staffUser?.firstName?.[0] || 'S'}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                            {staffUser?.firstName} {staffUser?.lastName}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {item.employeeId} • {staffUser?.email}
                          </span>
                        </div>
                      </div>

                      <Badge variant="info">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {getDepartmentIcon(item.department)}
                          {item.department?.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        fontSize: '0.85rem',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                          Designation
                        </span>
                        <strong>{item.designation}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                          Phone
                        </span>
                        <strong>{staffUser?.phone}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                          Employment
                        </span>
                        <strong>{item.employmentType}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                          Salary
                        </span>
                        <strong style={{ color: '#10b981' }}>₹{item.salary || 0} / mo</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Joined: {new Date(item.joiningDate).toLocaleDateString()}
                      </span>
                      <Badge variant={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* TAB 2: SHIFT ROSTER */}
          {activeTab === 'shifts' && (
            <Card title="Weekly Duty Roster (Front Desk, Pro Shop, Canteen)">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.75rem' }}>Employee</th>
                      <th style={{ padding: '0.75rem' }}>Department</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Shift Hours</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No scheduled shifts found. Click "Schedule Shift" to assign rosters.
                        </td>
                      </tr>
                    ) : (
                      shifts.map((s) => (
                        <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                            {s.staff?.firstName} {s.staff?.lastName}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <Badge variant="info">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {getDepartmentIcon(s.department)}
                                {s.department?.replace('_', ' ')}
                              </span>
                            </Badge>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            {new Date(s.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {s.startTime} – {s.endTime}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <Badge variant={s.status === 'SCHEDULED' ? 'primary' : 'success'}>
                              {s.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: LEAVE APPROVAL PIPELINE */}
          {activeTab === 'leaves' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {leaves.length === 0 ? (
                <Card>
                  <p style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)' }}>
                    No leave requests found.
                  </p>
                </Card>
              ) : (
                leaves.map((leave) => (
                  <Card key={leave._id}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.25rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                            {leave.staff?.firstName} {leave.staff?.lastName}
                          </h4>
                          <Badge
                            variant={
                              leave.status === 'APPROVED'
                                ? 'success'
                                : leave.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {leave.status}
                          </Badge>
                        </div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <strong>Duration:</strong> {new Date(leave.startDate).toLocaleDateString()} to{' '}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                          "{leave.reason}"
                        </p>
                      </div>

                      {/* Owner Action Buttons */}
                      {isOwner && leave.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleLeaveDecision(leave._id, 'APPROVED')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleLeaveDecision(leave._id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL 1: ADD EMPLOYEE */}
      <Modal isOpen={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)} title="Onboard New Employee">
        <form onSubmit={handleAddStaffSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="First Name"
                value={staffForm.firstName}
                onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={staffForm.lastName}
                onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Email"
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                required
              />
            </div>

            <Input
              label="Temporary Password"
              type="password"
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Select
                label="Department"
                value={staffForm.department}
                onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                options={[
                  { value: 'FRONT_DESK', label: 'Front Desk (Courts)' },
                  { value: 'SPORTS_SHOP', label: 'Pro Gear Shop' },
                  { value: 'CANTEEN', label: 'Bar & Canteen' },
                ]}
                required
              />
              <Input
                label="Designation"
                placeholder="e.g. Head Receptionist, Barista"
                value={staffForm.designation}
                onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Monthly Base Salary (₹)"
                type="number"
                value={staffForm.salary}
                onChange={(e) => setStaffForm({ ...staffForm, salary: e.target.value })}
                required
              />
              <Select
                label="Employment Type"
                value={staffForm.employmentType}
                onChange={(e) => setStaffForm({ ...staffForm, employmentType: e.target.value })}
                options={[
                  { value: 'FULL_TIME', label: 'Full Time' },
                  { value: 'PART_TIME', label: 'Part Time' },
                  { value: 'CONTRACT', label: 'Contract' },
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Onboard Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ASSIGN SHIFT */}
      <Modal isOpen={isAssignShiftOpen} onClose={() => setIsAssignShiftOpen(false)} title="Schedule Shift Roster">
        <form onSubmit={handleAssignShiftSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Select
              label="Select Employee"
              value={shiftForm.staffId}
              onChange={(e) => setShiftForm({ ...shiftForm, staffId: e.target.value })}
              options={[
                { value: '', label: '-- Choose Employee --' },
                ...staffList.map((s) => ({
                  value: s.user?._id,
                  label: `${s.user?.firstName} ${s.user?.lastName} (${s.department?.replace('_', ' ')})`,
                })),
              ]}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Date"
                type="date"
                value={shiftForm.date}
                onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                required
              />
              <Select
                label="Department"
                value={shiftForm.department}
                onChange={(e) => setShiftForm({ ...shiftForm, department: e.target.value })}
                options={[
                  { value: 'FRONT_DESK', label: 'Front Desk' },
                  { value: 'SPORTS_SHOP', label: 'Pro Shop' },
                  { value: 'CANTEEN', label: 'Bar & Canteen' },
                ]}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Start Time"
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                placeholder="e.g. 06:00 AM"
                required
              />
              <Input
                label="End Time"
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                placeholder="e.g. 02:00 PM"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsAssignShiftOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Schedule Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: REQUEST LEAVE */}
      <Modal isOpen={isRequestLeaveOpen} onClose={() => setIsRequestLeaveOpen(false)} title="Submit Leave Request">
        <form onSubmit={handleRequestLeaveSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Start Date"
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
              />
            </div>

            <Input
              label="Reason for Leave"
              placeholder="e.g. Family function, tournament participation"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsRequestLeaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffOperationsPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import FilterDropdown from '../components/ui/FilterDropdown';
import Card from '../components/ui/Card';
import projectService from '../services/projectService';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatDate';
import { PROJECT_STATUSES, PRIORITIES } from '../utils/constants';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    status: 'planning',
    priority: 'medium',
    budget: 0,
    progress: 0,
  });

  // Delete Confirm State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      });
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      // Fallback sample data if backend is offline
      setProjects([
        {
          _id: 'p1',
          title: 'AI-Powered Smart Analytics Platform',
          description: 'End-to-end intelligent predictive telemetry engine with live dashboard metrics.',
          category: 'Artificial Intelligence',
          status: 'in-progress',
          priority: 'urgent',
          budget: 45000,
          progress: 72,
          createdAt: new Date(),
        },
        {
          _id: 'p2',
          title: 'Universal Enterprise Cloud Portal',
          description: 'Multi-tenant enterprise access control system with role-based widgets.',
          category: 'Enterprise Cloud',
          status: 'in-progress',
          priority: 'high',
          budget: 32000,
          progress: 58,
          createdAt: new Date(),
        },
        {
          _id: 'p3',
          title: 'Real-time Supply Chain Tracker',
          description: 'Automated logistics verification system with geolocation mapping.',
          category: 'Logistics',
          status: 'planning',
          priority: 'medium',
          budget: 18000,
          progress: 25,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedStatus, selectedPriority]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      title: '',
      description: '',
      category: 'General',
      status: 'planning',
      priority: 'medium',
      budget: 0,
      progress: 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (project, e) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setCurrentId(project._id);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'General',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      budget: project.budget || 0,
      progress: project.progress || 0,
    });
    setModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toastError('Title and description are required');
      return;
    }

    try {
      setActionLoading(true);
      if (isEditing && currentId) {
        await projectService.updateProject(currentId, formData);
        toastSuccess('Project updated successfully!');
      } else {
        await projectService.createProject(formData);
        toastSuccess('Project created successfully!');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      await projectService.deleteProject(deleteId);
      toastSuccess('Project deleted successfully');
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchProjects();
    } catch (err) {
      toastError('Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Project Name',
      key: 'title',
      sortable: true,
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{val}</span>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {row.category || 'General'}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val) => {
        const variant =
          val === 'completed'
            ? 'success'
            : val === 'in-progress'
            ? 'primary'
            : val === 'review'
            ? 'warning'
            : 'info';
        return <Badge variant={variant}>{val}</Badge>;
      },
    },
    {
      header: 'Priority',
      key: 'priority',
      sortable: true,
      render: (val) => {
        const variant = val === 'urgent' ? 'danger' : val === 'high' ? 'warning' : 'secondary';
        return <Badge variant={variant}>{val}</Badge>;
      },
    },
    {
      header: 'Progress',
      key: 'progress',
      sortable: true,
      render: (val = 0) => (
        <div style={{ width: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
            <span>{val}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)' }}>
            <div
              style={{
                width: `${val}%`,
                height: '100%',
                background: val >= 100 ? 'var(--success)' : 'var(--primary)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Created',
      key: 'createdAt',
      sortable: true,
      render: (val) => <span style={{ fontSize: '0.85rem' }}>{formatDate(val)}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            title="View Details"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${row._id}`);
            }}
            style={{
              padding: '0.35rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            title="Edit"
            onClick={(e) => handleOpenEdit(row, e)}
            style={{
              padding: '0.35rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row._id);
              setDeleteDialogOpen(true);
            }}
            style={{
              padding: '0.35rem',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Projects & Entities Management"
        subtitle="Complete CRUD template with search, status filters, modal forms, and detailed records."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Projects' }]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '2px',
                border: '1px solid var(--border-color)',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
              Create Project
            </Button>
          </div>
        }
      />

      {/* Grid or Table Mode */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={projects}
          loading={loading}
          searchPlaceholder="Search projects by title, category..."
          onRowClick={(row) => navigate(`/projects/${row._id}`)}
          filterComponent={
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <FilterDropdown label="Status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} options={PROJECT_STATUSES} />
              <FilterDropdown label="Priority" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} options={PRIORITIES} />
            </div>
          }
        />
      ) : (
        <div className="grid-cols-3">
          {projects.map((proj) => (
            <Card
              key={proj._id}
              hoverable
              onClick={() => navigate(`/projects/${proj._id}`)}
            >
              <Card.Header>
                <div>
                  <Badge variant={proj.priority === 'urgent' ? 'danger' : 'primary'}>
                    {proj.priority}
                  </Badge>
                  <Card.Title style={{ marginTop: '0.5rem' }}>{proj.title}</Card.Title>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {proj.category}
                  </span>
                </div>
                <Badge variant={proj.status === 'completed' ? 'success' : 'info'}>
                  {proj.status}
                </Badge>
              </Card.Header>

              <Card.Content>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {proj.description}
                </p>

                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 700 }}>{proj.progress || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)' }}>
                    <div
                      style={{
                        width: `${proj.progress || 0}%`,
                        height: '100%',
                        background: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              </Card.Content>

              <Card.Footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleOpenEdit(proj, e)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(proj._id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Project' : 'Create New Project'}
        subtitle="Fill out the project details and sprint milestones."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProject} loading={actionLoading}>
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProject}>
          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. AI-Powered Smart Analytics Platform"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the deliverable and objectives..."
            rows={3}
            required
          />

          <div className="grid-cols-2">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={['General', 'Artificial Intelligence', 'Enterprise Cloud', 'Logistics', 'Healthcare', 'Fintech']}
              placeholder=""
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              placeholder=""
            />
          </div>

          <div className="grid-cols-2">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'planning', label: 'Planning' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'review', label: 'Under Review' },
                { value: 'completed', label: 'Completed' },
              ]}
              placeholder=""
            />

            <Input
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project?"
        message="Are you sure you want to permanently delete this project and its related tasks? This action cannot be undone."
        confirmText="Delete Project"
        danger
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default ProjectsPage;

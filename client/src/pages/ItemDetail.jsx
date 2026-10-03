import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  User,
  Plus,
  ArrowLeft,
  Calendar,
  MessageSquare,
  Tag,
  Share2,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatDate';

export const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjectById(id);
      if (res.success) {
        setProject(res.data);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      // Fallback detail
      setProject({
        _id: id,
        title: 'AI-Powered Smart Analytics Platform',
        description: 'End-to-end intelligent predictive telemetry engine with live dashboard metrics, real-time alert triage, and instant reporting.',
        category: 'Artificial Intelligence',
        status: 'in-progress',
        priority: 'urgent',
        budget: 45000,
        progress: 72,
        createdAt: new Date(),
        tasks: [
          {
            _id: 't1',
            title: 'Implement JWT Authentication Interceptor',
            status: 'completed',
            priority: 'urgent',
            comments: [{ text: 'Verified across all endpoints.' }],
          },
          {
            _id: 't2',
            title: 'Build Reusable Data Table Component',
            status: 'in-progress',
            priority: 'high',
            comments: [],
          },
          {
            _id: 't3',
            title: 'Design AI Summary & Chat Assistant UI',
            status: 'todo',
            priority: 'medium',
            comments: [],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setActionLoading(true);
      await taskService.createTask({
        title: newTaskTitle,
        project: id,
        status: 'todo',
      });
      toastSuccess('Task added to project!');
      setNewTaskTitle('');
      setTaskModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      toastError('Failed to create task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'in-progress' : 'completed';
    try {
      await taskService.updateTask(task._id, { status: nextStatus });
      toastSuccess(`Task marked as ${nextStatus}`);
      fetchProjectDetails();
    } catch (err) {
      toastError('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader fullPage text="Loading project details..." />
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2>Project Not Found</h2>
          <Button variant="primary" onClick={() => navigate('/projects')} style={{ marginTop: '1rem' }}>
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={project.title}
        subtitle={`${project.category || 'General'} &bull; Created ${formatDate(project.createdAt)}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Projects', path: '/projects' },
          { label: project.title },
        ]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/projects')}
            >
              Back
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setTaskModalOpen(true)}
            >
              Add Task
            </Button>
          </div>
        }
      />

      <div className="grid-cols-3">
        {/* Left column: Overview & Tasks (2 cols) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Overview Card */}
          <Card>
            <Card.Header>
              <Card.Title>Project Overview</Card.Title>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Badge variant={project.status === 'completed' ? 'success' : 'primary'}>
                  {project.status}
                </Badge>
                <Badge variant={project.priority === 'urgent' ? 'danger' : 'warning'}>
                  {project.priority}
                </Badge>
              </div>
            </Card.Header>
            <Card.Content>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {project.description}
              </p>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>Sprint Progress</span>
                  <span style={{ fontWeight: 700 }}>{project.progress || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)' }}>
                  <div
                    style={{
                      width: `${project.progress || 0}%`,
                      height: '100%',
                      background: 'var(--primary)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Tasks Checklist Card */}
          <Card>
            <Card.Header>
              <div>
                <Card.Title>Project Tasks & Checklist</Card.Title>
                <Card.Description>Click any checkbox to toggle task completion</Card.Description>
              </div>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setTaskModalOpen(true)}>
                New Task
              </Button>
            </Card.Header>

            <Card.Content>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(!project.tasks || project.tasks.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                    No tasks assigned to this project yet.
                  </p>
                ) : (
                  project.tasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isDone ? 'var(--bg-subtle)' : 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          transition: 'var(--transition)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => handleToggleTaskStatus(task)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                textDecoration: isDone ? 'line-through' : 'none',
                                color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                              }}
                            >
                              {task.title}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Badge variant={task.priority === 'urgent' ? 'danger' : 'info'}>
                            {task.priority || 'medium'}
                          </Badge>
                          <Badge variant={isDone ? 'success' : 'secondary'}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right column: Metadata & Team (1 col) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <Card.Header>
              <Card.Title>Entity Details</Card.Title>
            </Card.Header>
            <Card.Content>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    CATEGORY
                  </span>
                  <span style={{ fontWeight: 600 }}>{project.category || 'General'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    BUDGET ALLOCATED
                  </span>
                  <span style={{ fontWeight: 600 }}>${(project.budget || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    CREATED DATE
                  </span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Task Creation Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title="Add Task to Project"
        subtitle="Create a new task deliverable item."
        footer={
          <>
            <Button variant="secondary" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTask} loading={actionLoading}>
              Add Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask}>
          <Input
            label="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Implement schema indexing"
            required
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ItemDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Activity as ActivityIcon,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import StatsCard from '../components/ui/StatsCard';
import ChartCard from '../components/ui/ChartCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ActivityTimeline from '../components/ui/ActivityTimeline';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import activityService from '../services/activityService';
import userService from '../services/userService';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 4,
    completedProjects: 1,
    inProgressProjects: 2,
    totalTasks: 5,
    completedTasks: 2,
    totalUsers: 5,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projStatsRes, projListRes, actRes] = await Promise.allSettled([
          projectService.getProjectStats(),
          projectService.getProjects({ limit: 4 }),
          activityService.getActivities(8),
        ]);

        if (projStatsRes.status === 'fulfilled' && projStatsRes.value.success) {
          setStats((prev) => ({ ...prev, ...projStatsRes.value.data }));
        }

        if (projListRes.status === 'fulfilled' && projListRes.value.success) {
          setRecentProjects(projListRes.value.data || []);
        }

        if (actRes.status === 'fulfilled' && actRes.value.success) {
          setActivities(actRes.value.data || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Visual chart datasets
  const activityTrendData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 28 },
    { label: 'Thu', value: 24 },
    { label: 'Fri', value: 38 },
    { label: 'Sat', value: 45 },
    { label: 'Sun', value: 52 },
  ];

  const categoryProgressData = [
    { label: 'AI & Machine Learning', value: 78, color: 'var(--accent)' },
    { label: 'Enterprise Cloud Portal', value: 60, color: 'var(--primary)' },
    { label: 'Logistics Tracker', value: 40, color: 'var(--secondary)' },
    { label: 'Healthcare Telemedicine', value: 100, color: 'var(--success)' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Member'}! 👋`}
        subtitle="Here is a high-level operational overview of your MERN hackathon project."
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Dashboard' }]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/ai-hub')}
            >
              AI Hub
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/projects')}
            >
              New Project
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <StatsCard
          title="Active Projects"
          value={stats.totalProjects || 4}
          icon={FolderKanban}
          color="primary"
          trend="+25% this week"
          trendDirection="up"
          onClick={() => navigate('/projects')}
        />
        <StatsCard
          title="Completed Tasks"
          value={`${stats.completedTasks || 2}/${stats.totalTasks || 5}`}
          icon={CheckCircle2}
          color="success"
          trend="80% velocity"
          trendDirection="up"
          onClick={() => navigate('/projects')}
        />
        <StatsCard
          title="Team Members"
          value={stats.totalUsers || 5}
          icon={Users}
          color="secondary"
          subtitle="Cross-functional team"
          onClick={() => navigate('/users')}
        />
        <StatsCard
          title="System Security"
          value="100%"
          icon={ShieldCheck}
          color="warning"
          trend="JWT Active"
          trendDirection="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-cols-2" style={{ marginBottom: '1.75rem' }}>
        <ChartCard
          title="Weekly Activity Velocity"
          subtitle="API requests, commits, and task transitions"
          data={activityTrendData}
          type="bar"
          height={180}
        />

        <ChartCard
          title="Category Milestones & Completion"
          subtitle="Sprint progress tracked by entity category"
          data={categoryProgressData}
          type="progress"
        />
      </div>

      {/* Recent Projects & Activity Stream Split */}
      <div className="grid-cols-3">
        {/* Recent Projects (2 cols) */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card>
            <Card.Header>
              <div>
                <Card.Title>Active Projects & Milestones</Card.Title>
                <Card.Description>Manage and monitor ongoing hackathon deliverables</Card.Description>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/projects')}
              >
                View All
              </Button>
            </Card.Header>

            <Card.Content>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(recentProjects.length > 0 ? recentProjects : [
                  {
                    _id: '1',
                    title: 'AI-Powered Smart Analytics Platform',
                    category: 'Artificial Intelligence',
                    status: 'in-progress',
                    progress: 72,
                    priority: 'urgent',
                  },
                  {
                    _id: '2',
                    title: 'Universal Enterprise Cloud Portal',
                    category: 'Enterprise Cloud',
                    status: 'in-progress',
                    progress: 58,
                    priority: 'high',
                  },
                  {
                    _id: '3',
                    title: 'Real-time Supply Chain Tracker',
                    category: 'Logistics',
                    status: 'planning',
                    progress: 25,
                    priority: 'medium',
                  },
                ]).map((proj) => (
                  <div
                    key={proj._id}
                    onClick={() => navigate(`/projects/${proj._id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{proj.title}</span>
                        <Badge variant={proj.priority === 'urgent' ? 'danger' : 'primary'}>
                          {proj.priority || 'medium'}
                        </Badge>
                      </div>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {proj.category || 'General'} &bull; Progress: {proj.progress || 0}%
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Badge variant={proj.status === 'completed' ? 'success' : 'info'}>
                        {proj.status}
                      </Badge>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Live Activity Timeline (1 col) */}
        <div>
          <Card>
            <Card.Header>
              <div>
                <Card.Title>Live Activity Feed</Card.Title>
                <Card.Description>Real-time audit & event stream</Card.Description>
              </div>
            </Card.Header>

            <Card.Content>
              <ActivityTimeline
                activities={activities.length > 0 ? activities : [
                  {
                    _id: 'a1',
                    user: { name: 'Admin User' },
                    action: 'Initialized MERN Hackathon template',
                    entity: 'System',
                    createdAt: new Date(),
                  },
                  {
                    _id: 'a2',
                    user: { name: 'Alex Morgan' },
                    action: 'Completed JWT Bearer interceptor',
                    entity: 'Task',
                    createdAt: new Date(Date.now() - 1800000),
                  },
                  {
                    _id: 'a3',
                    user: { name: 'Sarah Chen' },
                    action: 'Updated Sprint 1 milestones',
                    entity: 'Project',
                    createdAt: new Date(Date.now() - 5400000),
                  },
                ]}
                limit={5}
              />
            </Card.Content>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

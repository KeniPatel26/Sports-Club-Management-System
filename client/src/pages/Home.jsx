import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Zap,
  ShieldCheck,
  Sparkles,
  Database,
  LayoutDashboard,
  CheckCircle2,
  FolderKanban,
  FileSpreadsheet,
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  Lock,
  Workflow,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const Home = () => {
  const { isAuthenticated, loginDemoAdmin, loginDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async (type) => {
    if (type === 'admin') {
      await loginDemoAdmin();
    } else {
      await loginDemoUser();
    }
    navigate('/dashboard');
  };

  const featureCards = [
    {
      icon: ShieldCheck,
      color: 'var(--primary)',
      title: 'JWT Auth & Protected Routing',
      desc: 'Complete token verification, pre-save password hashing, Axios Bearer interceptor, and Role-Based Guards.',
    },
    {
      icon: LayoutDashboard,
      color: 'var(--secondary)',
      title: 'Executive Dashboard & Analytics',
      desc: 'Pre-built KPI stats cards, multi-metric SVG bar charts, category progress distributions, and fast actions.',
    },
    {
      icon: FolderKanban,
      color: 'var(--success)',
      title: 'Full CRUD & Mongoose Models',
      desc: 'Production-ready schemas for Users, Projects, Tasks, Comments, and Attachments with relationship queries.',
    },
    {
      icon: Sparkles,
      color: 'var(--accent)',
      title: 'Smart AI Assistant Engine',
      desc: 'Text summarization, automated category classification, recommendation engine, and interactive assistant chat.',
    },
    {
      icon: FileSpreadsheet,
      color: 'var(--warning)',
      title: 'Hackathon UI Kit & Data Table',
      desc: 'Pre-styled Buttons, Modals, Badges, Search with Debounce, Skeletons, File Upload, and Paginated Tables.',
    },
    {
      icon: Workflow,
      color: '#ec4899',
      title: 'Activity Feed & Audit Logs',
      desc: 'Universal timeline feed for tracking every project event, along with enterprise audit compliance logging.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={16} />
          Day 0 Ready &bull; Built for MERN Hackathon Speed
        </div>

        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}
        >
          Build & Win Your Hackathon <br />
          <span className="text-gradient">In Hours, Not Days</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6,
          }}
        >
          Skip 3–4 hours of repetitive boilerplate setup. Jump straight to solving the actual problem statement with pre-built Authentication, Dashboards, Data Tables, AI Tools, and Reusable UI Components.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="lg"
              icon={LayoutDashboard}
              onClick={() => navigate('/dashboard')}
            >
              Go to Your Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => handleDemo('admin')}
              >
                Launch Demo (Admin)
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleDemo('user')}
              >
                Launch Demo (User)
              </Button>
            </>
          )}
        </div>

        {/* Demo Credentials Box */}
        <div
          style={{
            marginTop: '3rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            maxWidth: '620px',
            margin: '3rem auto 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: 'var(--shadow-md)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              👑 ADMIN DEMO
            </span>
            <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
              admin@demo.com &bull; Admin@123
            </p>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-hover)' }}>
              👤 USER DEMO
            </span>
            <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
              user@demo.com &bull; User@123
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        style={{
          padding: '4rem 1.5rem',
          backgroundColor: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>The 4-Layer Hackathon Starter Architecture</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Designed to solve any hackathon challenge with modular speed.
            </p>
          </div>

          <div className="grid-cols-3">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} hoverable>
                  <Card.Content>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-subtle)',
                        color: feat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <Card.Title style={{ fontSize: '1.1rem' }}>{feat.title}</Card.Title>
                    <Card.Description style={{ marginTop: '0.5rem', lineHeight: 1.5 }}>
                      {feat.desc}
                    </Card.Description>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Quick-Start Guide for Judges & Teams */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Ready-to-Use Screen Templates</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            5 standard screens covering 95% of hackathon requirements.
          </p>
        </div>

        <div className="grid-cols-2">
          <Card hoverable onClick={() => navigate('/dashboard')}>
            <Card.Content>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>TEMPLATE 1</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Demo &rarr;</span>
              </div>
              <h3 style={{ margin: '0.5rem 0 0.35rem 0' }}>Executive Dashboard</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                KPI statistics, real-time activity timeline, interactive SVG charts, and quick actions.
              </p>
            </Card.Content>
          </Card>

          <Card hoverable onClick={() => navigate('/projects')}>
            <Card.Content>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-text)' }}>TEMPLATE 2</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Demo &rarr;</span>
              </div>
              <h3 style={{ margin: '0.5rem 0 0.35rem 0' }}>CRUD & Entity Table</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Search, filter by status, sorting, create project modal, task assignments, and delete confirmation.
              </p>
            </Card.Content>
          </Card>

          <Card hoverable onClick={() => navigate('/ai-hub')}>
            <Card.Content>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>TEMPLATE 3</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Demo &rarr;</span>
              </div>
              <h3 style={{ margin: '0.5rem 0 0.35rem 0' }}>AI Assistant Hub</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Text summarization, automated category tagger, recommendation generator, and chat assistant.
              </p>
            </Card.Content>
          </Card>

          <Card hoverable onClick={() => navigate('/template/form')}>
            <Card.Content>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning-text)' }}>TEMPLATE 4</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Demo &rarr;</span>
              </div>
              <h3 style={{ margin: '0.5rem 0 0.35rem 0' }}>Comprehensive Form Template</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Multi-section form with validations, file uploader with drag & drop, and toast feedback.
              </p>
            </Card.Content>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

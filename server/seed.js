import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Project from './src/models/Project.js';
import Task from './src/models/Task.js';
import Activity from './src/models/Activity.js';
import Notification from './src/models/Notification.js';
import AuditLog from './src/models/AuditLog.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odoo_ldce_mern';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      User.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Activity.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
    ]);

    console.log('Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const userPasswordHash = await bcrypt.hash('User@123', salt);

    const users = await User.create([
      {
        name: 'Admin User',
        emailId: 'admin@demo.com',
        password: adminPasswordHash,
        role: 'admin',
        title: 'System Administrator & CTO',
        bio: 'Leading architecture and system scalability for hackathon solutions.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Alex Morgan',
        emailId: 'user@demo.com',
        password: userPasswordHash,
        role: 'user',
        title: 'Senior Fullstack Engineer',
        bio: 'Specialist in React, Node.js, and cloud backend microservices.',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sarah Chen',
        emailId: 'sarah.chen@demo.com',
        password: userPasswordHash,
        role: 'manager',
        title: 'Lead Product Manager',
        bio: 'Customer empathy and agile sprint execution.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'David Miller',
        emailId: 'david.miller@demo.com',
        password: userPasswordHash,
        role: 'user',
        title: 'UI/UX Design Lead',
        bio: 'Designing intuitive, high-converting digital product experiences.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Priya Sharma',
        emailId: 'priya.sharma@demo.com',
        password: userPasswordHash,
        role: 'user',
        title: 'AI/ML Research Specialist',
        bio: 'Deep learning models, NLP summarization, and predictive analytics.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
    ]);

    const admin = users[0];
    const user = users[1];
    const sarah = users[2];
    const david = users[3];
    const priya = users[4];

    console.log('Creating demo projects...');
    const projects = await Project.create([
      {
        title: 'AI-Powered Smart Analytics Platform',
        description: 'End-to-end intelligent predictive telemetry engine with live dashboard metrics and instant automated reporting.',
        category: 'Artificial Intelligence',
        status: 'in-progress',
        priority: 'urgent',
        budget: 45000,
        progress: 72,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        owner: admin._id,
        members: [admin._id, user._id, priya._id],
        tags: ['AI', 'Analytics', 'Telemetry', 'Python', 'React'],
      },
      {
        title: 'Universal Enterprise Cloud Portal',
        description: 'Multi-tenant enterprise access control system with role-based dashboard widgets and dynamic workflow builders.',
        category: 'Enterprise Cloud',
        status: 'in-progress',
        priority: 'high',
        budget: 32000,
        progress: 58,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        owner: sarah._id,
        members: [sarah._id, user._id, david._id],
        tags: ['Cloud', 'Enterprise', 'Multi-tenant', 'Security'],
      },
      {
        title: 'Real-time Supply Chain Tracker',
        description: 'Automated logistics verification system with geolocation mapping and automated smart dispatch alerts.',
        category: 'Logistics',
        status: 'planning',
        priority: 'medium',
        budget: 18000,
        progress: 25,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        owner: user._id,
        members: [user._id, admin._id],
        tags: ['Logistics', 'IoT', 'Tracking'],
      },
      {
        title: 'Healthcare Patient Portal & Telemedicine',
        description: 'HIPAA-compliant patient appointment scheduling, secure health records repository, and teleconsultation video hub.',
        category: 'Healthcare',
        status: 'completed',
        priority: 'high',
        budget: 50000,
        progress: 100,
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        owner: admin._id,
        members: [admin._id, sarah._id, david._id, priya._id],
        tags: ['Healthcare', 'Telemedicine', 'Compliance'],
      },
    ]);

    console.log('Creating demo tasks...');
    await Task.create([
      {
        title: 'Implement JWT Authentication Interceptor',
        description: 'Configure Axios Bearer token authorization header and token expiry refresh logic.',
        project: projects[0]._id,
        assignee: user._id,
        status: 'completed',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        tags: ['Backend', 'Security', 'Auth'],
        comments: [
          {
            user: admin._id,
            text: 'Ensure authorization bearer headers are automatically appended on all requests.',
          },
          {
            user: user._id,
            text: 'Completed and verified across both admin and user demo accounts!',
          },
        ],
      },
      {
        title: 'Build Reusable Data Table Component',
        description: 'Create customizable search, sorting by column, role filters, and pagination controls.',
        project: projects[0]._id,
        assignee: david._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        tags: ['Frontend', 'UI Kit', 'Components'],
        comments: [
          {
            user: sarah._id,
            text: 'Please ensure column visibility can be dynamically toggled.',
          },
        ],
      },
      {
        title: 'Design AI Summary & Chat Assistant UI',
        description: 'Interactive natural language assistant with quick prompt pills and classification badges.',
        project: projects[0]._id,
        assignee: priya._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        tags: ['AI', 'Frontend', 'NLP'],
      },
      {
        title: 'Setup MongoDB Indexing & Query Optimizations',
        description: 'Add compound indexes for user email and project status queries.',
        project: projects[1]._id,
        assignee: user._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        tags: ['Database', 'MongoDB', 'Performance'],
      },
      {
        title: 'Configure Multipart File Upload Endpoint',
        description: 'Multer disk storage pipeline for documents, spreadsheets, images, and attachments.',
        project: projects[1]._id,
        assignee: admin._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        tags: ['Uploads', 'Multer', 'API'],
      },
    ]);

    console.log('Creating demo activities...');
    await Activity.create([
      {
        user: admin._id,
        action: 'Deployed MERN Hackathon Universal Starter Kit',
        entity: 'System',
        metadata: { version: '1.0.0', status: 'ready' },
      },
      {
        user: user._id,
        action: 'Finished JWT authentication flow',
        entity: 'Task',
        metadata: { taskId: 'task-auth-01' },
      },
      {
        user: sarah._id,
        action: 'Updated project roadmap for Sprint 1',
        entity: 'Project',
        metadata: { sprint: 'Sprint 1' },
      },
      {
        user: priya._id,
        action: 'Integrated smart AI classification model',
        entity: 'AI Service',
        metadata: { accuracy: '96.8%' },
      },
      {
        user: david._id,
        action: 'Uploaded high-fidelity UI kit mockup designs',
        entity: 'File',
        metadata: { fileCount: 4 },
      },
    ]);

    console.log('Creating demo notifications...');
    await Notification.create([
      {
        recipient: admin._id,
        title: 'New Member Joined Team',
        message: 'Alex Morgan has successfully logged into the workspace.',
        type: 'info',
        read: false,
        link: '/users',
      },
      {
        recipient: admin._id,
        title: 'Sprint Milestone Completed',
        message: 'Healthcare Telemedicine portal marked 100% finished.',
        type: 'success',
        read: false,
        link: '/projects',
      },
      {
        recipient: user._id,
        title: 'Assigned to High-Priority Task',
        message: 'You have been assigned to "Implement JWT Authentication Interceptor".',
        type: 'warning',
        read: false,
        link: '/projects',
      },
      {
        recipient: user._id,
        title: 'System Starter Kit Ready',
        message: 'Welcome to your MERN Hackathon workspace. All pre-built modules are active!',
        type: 'info',
        read: true,
        link: '/dashboard',
      },
    ]);

    console.log('Creating demo audit logs...');
    await AuditLog.create([
      {
        user: admin._id,
        action: 'SYSTEM_INITIALIZATION',
        entity: 'Database',
        ipAddress: '127.0.0.1',
        userAgent: 'Node.js/SeedRunner',
        details: { seedVersion: '1.0.0', collectionsPopulated: 6 },
      },
      {
        user: admin._id,
        action: 'ROLE_PERMISSION_CHECK',
        entity: 'AuthMiddleware',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Chrome/122',
        details: { checkedRole: 'admin', granted: true },
      },
    ]);

    console.log('=======================================================');
    console.log('🎉 Seed Database populated successfully!');
    console.log('Demo Credentials:');
    console.log('🔑 Admin: email: admin@demo.com  |  password: Admin@123');
    console.log('🔑 User:  email: user@demo.com   |  password: User@123');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();

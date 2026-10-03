/**
 * Global Constants & Configurations
 */

export const APP_CONFIG = {
  appName: 'MERN Hackathon Starter',
  appVersion: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
};

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@demo.com',
    password: 'Admin@123',
    role: 'admin',
    name: 'Admin User',
  },
  user: {
    email: 'user@demo.com',
    password: 'User@123',
    role: 'user',
    name: 'Alex Morgan',
  },
};

export const PROJECT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning', color: 'info' },
  { value: 'in-progress', label: 'In Progress', color: 'primary' },
  { value: 'review', label: 'In Review', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'on-hold', label: 'On Hold', color: 'danger' },
];

export const TASK_STATUSES = [
  { value: 'all', label: 'All Tasks' },
  { value: 'todo', label: 'To Do', color: 'secondary' },
  { value: 'in-progress', label: 'In Progress', color: 'primary' },
  { value: 'review', label: 'Under Review', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
];

export const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'info' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'urgent', label: 'Urgent', color: 'danger' },
];

export const USER_ROLES = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin', color: 'purple' },
  { value: 'manager', label: 'Manager', color: 'info' },
  { value: 'user', label: 'Member', color: 'secondary' },
];

export default {
  APP_CONFIG,
  DEMO_CREDENTIALS,
  PROJECT_STATUSES,
  TASK_STATUSES,
  PRIORITIES,
  USER_ROLES,
};

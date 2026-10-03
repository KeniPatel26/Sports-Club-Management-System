import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

/**
 * @desc    Get all tasks or tasks for a specific project
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignee, search } = req.query;
    const query = {};

    if (project) query.project = project;
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('project', 'title status priority')
      .populate('assignee', 'name emailId avatar')
      .populate('comments.user', 'name emailId avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      message: 'Tasks fetched successfully',
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title status priority')
      .populate('assignee', 'name emailId avatar')
      .populate('comments.user', 'name emailId avatar');

    if (!task) {
      return sendError(res, { statusCode: 404, message: 'Task not found' });
    }

    return sendSuccess(res, {
      message: 'Task retrieved successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate, tags } = req.body;

    if (!title || !project) {
      return sendError(res, { statusCode: 400, message: 'Task title and project are required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      project,
      assignee: assignee || req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await logActivity({
      userId: req.user._id,
      action: `Created task "${task.title}"`,
      entity: 'Task',
      entityId: task._id,
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'title')
      .populate('assignee', 'name emailId avatar');

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Task created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task or task status
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return sendError(res, { statusCode: 404, message: 'Task not found' });
    }

    const { title, description, status, priority, assignee, dueDate, tags } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags) task.tags = tags;

    const updated = await task.save();

    await logActivity({
      userId: req.user._id,
      action: `Updated task "${task.title}" (Status: ${task.status})`,
      entity: 'Task',
      entityId: task._id,
    });

    const populated = await Task.findById(updated._id)
      .populate('project', 'title')
      .populate('assignee', 'name emailId avatar')
      .populate('comments.user', 'name emailId avatar');

    return sendSuccess(res, {
      message: 'Task updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to task
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
export const addTaskComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return sendError(res, { statusCode: 400, message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return sendError(res, { statusCode: 404, message: 'Task not found' });
    }

    task.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('comments.user', 'name emailId avatar');

    await logActivity({
      userId: req.user._id,
      action: `Commented on task "${task.title}"`,
      entity: 'Task',
      entityId: task._id,
    });

    return sendSuccess(res, {
      message: 'Comment added successfully',
      data: populated.comments[populated.comments.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return sendError(res, { statusCode: 404, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    await logActivity({
      userId: req.user._id,
      action: `Deleted task "${task.title}"`,
      entity: 'Task',
      entityId: task._id,
    });

    return sendSuccess(res, {
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  addTaskComment,
  deleteTask,
};

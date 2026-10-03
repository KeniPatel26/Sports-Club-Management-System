import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity, logAudit } from '../services/activityService.js';

/**
 * @desc    Get all projects with search, status/priority filter, sort, and pagination
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res, next) => {
  try {
    const { search = '', status = '', priority = '', page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'name emailId avatar title')
        .populate('members', 'name emailId avatar title')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Project.countDocuments(query),
    ]);

    return sendSuccess(res, {
      message: 'Projects fetched successfully',
      data: projects,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project statistics for dashboards
 * @route   GET /api/projects/stats
 * @access  Private
 */
export const getProjectStats = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const inProgressProjects = await Project.countDocuments({ status: 'in-progress' });
    const planningProjects = await Project.countDocuments({ status: 'planning' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });

    // Category distribution
    const categoryAgg = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, {
      message: 'Project metrics retrieved',
      data: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        planningProjects,
        totalTasks,
        completedTasks,
        completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        categories: categoryAgg.map((c) => ({ name: c._id || 'Uncategorized', value: c.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project with tasks
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name emailId avatar title bio')
      .populate('members', 'name emailId avatar title');

    if (!project) {
      return sendError(res, { statusCode: 404, message: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name emailId avatar')
      .populate('comments.user', 'name emailId avatar');

    return sendSuccess(res, {
      message: 'Project retrieved successfully',
      data: {
        ...project.toObject(),
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res, next) => {
  try {
    const { title, description, category, status, priority, budget, deadline, members, tags } = req.body;

    if (!title || !description) {
      return sendError(res, { statusCode: 400, message: 'Title and description are required' });
    }

    const project = await Project.create({
      title,
      description,
      category: category || 'General',
      status: status || 'planning',
      priority: priority || 'medium',
      budget: budget || 0,
      deadline: deadline || null,
      owner: req.user._id,
      members: members || [req.user._id],
      tags: tags || [],
    });

    await logActivity({
      userId: req.user._id,
      action: `Created project "${project.title}"`,
      entity: 'Project',
      entityId: project._id,
    });

    await logAudit({
      userId: req.user._id,
      action: 'CREATE_PROJECT',
      entity: 'Project',
      entityId: project._id.toString(),
      details: { title: project.title, status: project.status },
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name emailId avatar')
      .populate('members', 'name emailId avatar');

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendError(res, { statusCode: 404, message: 'Project not found' });
    }

    const { title, description, category, status, priority, budget, progress, deadline, members, tags } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (budget !== undefined) project.budget = budget;
    if (progress !== undefined) project.progress = progress;
    if (deadline !== undefined) project.deadline = deadline;
    if (members) project.members = members;
    if (tags) project.tags = tags;

    const updated = await project.save();

    await logActivity({
      userId: req.user._id,
      action: `Updated project "${project.title}"`,
      entity: 'Project',
      entityId: project._id,
    });

    const populated = await Project.findById(updated._id)
      .populate('owner', 'name emailId avatar')
      .populate('members', 'name emailId avatar');

    return sendSuccess(res, {
      message: 'Project updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendError(res, { statusCode: 404, message: 'Project not found' });
    }

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    await logActivity({
      userId: req.user._id,
      action: `Deleted project "${project.title}"`,
      entity: 'Project',
      entityId: project._id,
    });

    return sendSuccess(res, {
      message: 'Project and associated tasks deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProjects,
  getProjectStats,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

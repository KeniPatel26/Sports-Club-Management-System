import Lead from '../models/Lead.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Submit public visitor enquiry / trial booking request
 * @route   POST /api/leads
 * @access  Public
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, interestedSport, interestedPlan, message } = req.body;

    if (!name || !email || !phone) {
      return sendError(res, { statusCode: 400, message: 'Name, email, and phone are required' });
    }

    const lead = await Lead.create({
      name,
      email: email.toLowerCase(),
      phone,
      interestedSport: interestedSport || 'ALL_SPORTS',
      interestedPlan: interestedPlan || 'GOLD',
      message: message || '',
      status: 'NEW',
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Thank you for reaching out! A Champions Club concierge will contact you shortly.',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leads (Front Desk / Owner)
 * @route   GET /api/leads
 * @access  Private (Staff/Owner)
 */
export const getLeads = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, {
      message: 'Leads retrieved successfully',
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createLead,
  getLeads,
};

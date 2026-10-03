import Lead from '../../models/Lead.js';

/**
 * GET /api/manager/leads
 * List prospective member inquiries
 */
export const getLeads = async (req, res) => {
  try {
    const { status, search = '' } = req.query;

    const query = {};
    if (status && status !== 'ALL') query.status = status;

    let leads = await Lead.find(query).sort({ createdAt: -1 });

    // Seed default leads if empty
    if (leads.length === 0) {
      const defaultLeads = [
        {
          name: 'Karan Sharma',
          email: 'karan.sharma@gmail.com',
          phone: '9825012345',
          interestedSport: 'TENNIS',
          interestedPlan: 'GOLD',
          message: 'Interested in annual membership and weekend court coaching.',
          status: 'NEW',
        },
        {
          name: 'Neha Verma',
          email: 'neha.v@outlook.com',
          phone: '9898023456',
          interestedSport: 'PADEL',
          interestedPlan: 'SILVER',
          message: 'Would like to book a 1-day trial for Padel glass court.',
          status: 'CONTACTED',
        },
        {
          name: 'Amit Trivedi',
          email: 'amit.t@corporate.com',
          phone: '9909034567',
          interestedSport: 'CRICKET',
          interestedPlan: 'GOLD',
          message: 'Corporate weekend turf booking inquiry for 20 players.',
          status: 'TRIAL_BOOKED',
        },
      ];
      leads = await Lead.insertMany(defaultLeads);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/leads
 * Add new inquiry lead
 */
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, interestedSport, interestedPlan, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone number are required',
      });
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      interestedSport: interestedSport || 'ALL_SPORTS',
      interestedPlan: interestedPlan || 'GOLD',
      message: message || '',
      status: 'NEW',
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry lead created successfully',
      data: lead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/manager/leads/:id/status
 * Update lead progress status (NEW -> CONTACTED -> TRIAL_BOOKED -> CONVERTED_MEMBER -> ARCHIVED)
 */
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (status) lead.status = status;
    if (notes) lead.notes = notes;
    await lead.save();

    return res.status(200).json({
      success: true,
      message: `Lead status updated to ${status}`,
      data: lead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update lead status',
      error: error.message,
    });
  }
};

export default {
  getLeads,
  createLead,
  updateLeadStatus,
};

import ClubSetting from '../../models/ClubSetting.js';

/**
 * GET /api/manager/settings
 * Get club configuration parameters & rules
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await ClubSetting.findOne();
    if (!settings) {
      settings = await ClubSetting.create({
        clubName: 'Champions Sports Club & Complex',
        contactEmail: 'contact@championsclub.com',
        contactPhone: '+91 98765 43210',
        address: '100 Olympic Boulevard, Sports Complex, SG Highway, Ahmedabad',
        sessionDurationMinutes: 60,
        slotIntervalMinutes: 30,
        maxBookingsPerMemberPerDay: 2,
        membershipGracePeriodDays: 7,
        taxRatePercent: 18,
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch club settings',
      error: error.message,
    });
  }
};

/**
 * PUT /api/manager/settings
 * Update club rules and parameters
 */
export const updateSettings = async (req, res) => {
  try {
    let settings = await ClubSetting.findOne();
    if (!settings) {
      settings = new ClubSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Club settings updated successfully',
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};

export default {
  getSettings,
  updateSettings,
};

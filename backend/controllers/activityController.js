const ActivityLog = require('../models/ActivityLog');

const getLogs = async (req, res) => {
  try {
    const { orgId } = req.params;
    
    const logs = await ActivityLog.find({ organizationId: orgId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 actions for the org audit trail

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLogs
};

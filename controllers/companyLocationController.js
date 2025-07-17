const CompanyLocation = require('../models/CompanyLocation');

// Get the current company location
exports.getCompanyLocation = async (req, res) => {
  try {
    const location = await CompanyLocation.findOne().sort({ updatedAt: -1 });
    if (!location) {
      return res.status(404).json({ message: 'Company location not set.' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Set or update the company location
exports.setCompanyLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: 'Invalid latitude or longitude.' });
    }
    const updatedBy = req.user ? req.user._id : null; // assumes auth middleware sets req.user
    const location = new CompanyLocation({ latitude, longitude, updatedBy });
    await location.save();
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; 
import Consultation from '../models/Consultation.js';

export async function bookConsultation(req, res) {
  try {
    const { fullName, mobileNumber, email, preferredDate, preferredTime, healthIssues } = req.body;
    if (!fullName || !mobileNumber || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: "Full Name, Mobile, Date, and Time are required." });
    }

    const booking = await Consultation.create({
      fullName, mobileNumber,
      email: email || "",
      preferredDate, preferredTime,
      healthIssues: healthIssues || "General Siddha Health Consult.",
    });

    res.status(201).json({
      message: "Consultation booked successfully with Chief Siddha Physician! Confirmation SMS/WhatsApp has been queued.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to book consultation." });
  }
}

export async function getAdminConsultations(req, res) {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations." });
  }
}

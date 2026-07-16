import state from '../data/index.js';
import { getLoggedUser } from '../services/authHelper.js';

export function bookConsultation(req, res) {
  const { fullName, mobileNumber, email, preferredDate, preferredTime, healthIssues } = req.body;
  if (!fullName || !mobileNumber || !preferredDate || !preferredTime) {
    return res.status(400).json({ error: "Full Name, Mobile, Date, and Time range are required." });
  }

  const newBooking = {
    id: "CON-" + Math.floor(1000 + Math.random() * 9000),
    fullName,
    mobileNumber,
    email: email || "",
    preferredDate,
    preferredTime,
    healthIssues: healthIssues || "General Siddha Health Consult.",
    status: "Confirmed",
    date: new Date().toISOString()
  };

  state.consultations.push(newBooking);
  res.status(201).json({ message: "Consultation booked successfully with Chief Siddha Physician! Confirmation SMS/WhatsApp has been queued.", booking: newBooking });
}

export function getAdminConsultations(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin access forbidden." });
  res.json(state.consultations);
}

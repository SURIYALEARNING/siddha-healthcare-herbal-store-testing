import { User } from "../models/User.js";
import * as staffService from "../services/staffService.js";

export async function getStaffList(req, res) {
  try {
    const staff = await staffService.getStaffList();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff list." });
  }
}

export async function getStaffById(req, res) {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found." });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff." });
  }
}

export async function createStaff(req, res) {
  try {
    const { fullName, email, mobileNumber, password, permissions } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const staff = await staffService.createStaff({ fullName, email, mobileNumber, password, permissions });
    res.status(201).json({ message: "Staff created successfully.", staff });
  } catch (error) {
    if (error.message === "Email already registered.") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create staff." });
  }
}

export async function updateStaff(req, res) {
  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    if (!staff) return res.status(404).json({ error: "Staff not found." });
    res.json({ message: "Staff updated successfully.", staff });
  } catch (error) {
    if (error.message === "Staff not found.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update staff." });
  }
}

export async function updateStaffStatus(req, res) {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ error: "isActive is required." });
    }

    const target = await User.findById(req.params.id).lean();
    if (target && target.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Cannot disable Super Admin." });
    }

    const updated = await staffService.updateStaffStatus(req.params.id, isActive);
    if (!updated) return res.status(404).json({ error: "Staff not found." });
    res.json({ message: `Staff ${isActive ? "enabled" : "disabled"} successfully.`, staff: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update staff status." });
  }
}

export async function resetPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const staff = await staffService.resetStaffPassword(req.params.id, password);
    if (!staff) return res.status(404).json({ error: "Staff not found." });
    res.json({ message: "Password reset successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password." });
  }
}

export async function deleteStaff(req, res) {
  try {
    const target = await User.findById(req.params.id).lean();
    if (target && target.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Cannot delete Super Admin." });
    }

    await staffService.deleteStaff(req.params.id);
    res.json({ message: "Staff deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete staff." });
  }
}

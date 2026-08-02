import Reminder from "../models/Reminder.js";
import { getReminders, getTodayReminders, maybeCreateRemindersForOrder } from "../services/reminderService.js";

export async function createRemindersForOrder(req, res) {
  try {
    const { orderId } = req.params;
    const reminders = await maybeCreateRemindersForOrder(orderId);
    res.json({ success: true, count: reminders.length, reminders });
  } catch (error) {
    res.status(500).json({ error: "Failed to create reminders for order." });
  }
}

export async function getAdminReminders(req, res) {
  try {
    const { status, whatsappStatus, callStatus, productId, customerId,
      dateFrom, dateTo, period, search, sort, page, limit } = req.query;
    const result = await getReminders({
      status, whatsappStatus, callStatus, productId, customerId,
      dateFrom, dateTo, period, search, sort, page, limit,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminders." });
  }
}

export async function getReminderById(req, res) {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate("customerId", "fullName mobileNumber email")
      .populate("productId", "name images price discountPrice")
      .populate("orderId");
    if (!reminder) return res.status(404).json({ error: "Reminder not found." });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminder." });
  }
}

export async function getTodayRemindersEndpoint(req, res) {
  try {
    const reminders = await getTodayReminders();
    res.json({
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch today's reminders." });
  }
}

export async function updateWhatsappStatus(req, res) {
  try {
    const { status, whatsappStatus } = req.body;
    if (!status || !whatsappStatus) {
      return res.status(400).json({ error: "status and whatsappStatus are required." });
    }

    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          whatsappStatus,
          status: status === "SENT" ? "WHATSAPP_SENT" : "CALL_PENDING",
        },
      },
      { new: true }
    );

    if (!reminder) return res.status(404).json({ error: "Reminder not found." });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update WhatsApp status." });
  }
}

export async function completeCall(req, res) {
  try {
    const { callResult, callNotes } = req.body;
    if (!callResult) {
      return res.status(400).json({ error: "callResult is required." });
    }

    const validResults = [
      "PURCHASED_AGAIN", "NOT_INTERESTED", "NO_RESPONSE",
      "WRONG_NUMBER", "CALL_LATER", "OTHER",
    ];
    if (!validResults.includes(callResult)) {
      return res.status(400).json({ error: "Invalid call result." });
    }

    const updateData = {
      callStatus: callResult,
      callNotes: callNotes || "",
      status: "CALL_COMPLETED",
    };
    if (callResult === "PURCHASED_AGAIN") {
      updateData.status = "PURCHASED_AGAIN";
    }
    if (callResult === "CALL_LATER") {
      updateData.status = "CALL_PENDING";
    }

    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!reminder) return res.status(404).json({ error: "Reminder not found." });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: "Failed to complete call." });
  }
}

export async function getReminderStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [pendingCount, whatsappSentCount, callPendingCount] = await Promise.all([
      Reminder.countDocuments({
        status: "PENDING",
        reminderDate: { $gte: today, $lt: tomorrow },
      }),
      Reminder.countDocuments({
        status: "WHATSAPP_SENT",
        reminderDate: { $gte: today, $lt: tomorrow },
      }),
      Reminder.countDocuments({
        status: "CALL_PENDING",
        reminderDate: { $gte: today, $lt: tomorrow },
      }),
    ]);

    res.json({
      todayPending: pendingCount,
      todayWhatsappSent: whatsappSentCount,
      todayCallPending: callPendingCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminder stats." });
  }
}

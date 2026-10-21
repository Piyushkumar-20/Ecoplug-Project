import {
  getLatestComplaintId,
  getNewComplaintsAfterId,
} from "../models/complaint-notification.model.js";

import { createAndEmitNotification } from "./notification.service.js";

const POLL_INTERVAL_MS = 3000;
const BATCH_SIZE = 100;

let lastProcessedId = null;
let isPolling = false;
let pollingTimer = null;
let isStopping = false;

export const pollNewComplaints = async (io) => {
  if (isPolling || isStopping || !io) return;

  isPolling = true;

  try {
    // Capture the initial baseline; don't notify for old records.
    if (lastProcessedId === null) {
      lastProcessedId = await getLatestComplaintId();
      return;
    }

    const complaints = await getNewComplaintsAfterId(
      lastProcessedId,
      BATCH_SIZE,
    );

    for (const complaint of complaints) {
      if (isStopping) break;

      await createAndEmitNotification({
        io,
        companyId: Number(complaint.companyId),
        type: "NEW_COMPLAINT",
        title: "New Complaint Received",
        message: `New complaint received for ${
          complaint.chargerName || complaint.stationName || "a charging station"
        }.`,
        entityId: complaint.complaintId ?? complaint.id,
      });

      // Advance only after notification creation succeeds.
      lastProcessedId = Number(complaint.id);
    }
  } catch (error) {
    console.error("Complaint notification polling failed:", error.message);
  } finally {
    isPolling = false;
  }
};

export const startComplaintNotificationPolling = (io) => {
  if (pollingTimer || isStopping) return;

  pollingTimer = setInterval(() => {
    void pollNewComplaints(io);
  }, POLL_INTERVAL_MS);

  // Initialize the baseline immediately.
  void pollNewComplaints(io);
};

export const stopComplaintNotificationPolling = async () => {
  isStopping = true;

  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }

  // Wait for any current polling operation to finish.
  while (isPolling) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

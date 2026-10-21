import {
  getOrInitializeComplaintCheckpoint,
  getNewComplaintsAfterId,
  saveComplaintCheckpoint,
} from "../models/complaint-notification.model.js";

import { createAndEmitNotification } from "./notification.service.js";

const POLL_INTERVAL_MS = Math.max(
  1000,
  Number(process.env.COMPLAINT_NOTIFICATION_POLL_INTERVAL_MS) || 3000,
);
const BATCH_SIZE = 100;

let isPolling = false;
let pollingTimer = null;
let isStopping = false;

export const pollNewComplaints = async (io) => {
  if (isPolling || isStopping || !io) return;

  isPolling = true;

  try {
    let checkpoint = await getOrInitializeComplaintCheckpoint();

    while (!isStopping) {
      const complaints = await getNewComplaintsAfterId(checkpoint, BATCH_SIZE);
      if (!complaints.length) break;

      for (const complaint of complaints) {
        if (isStopping) break;

        const companyId = Number(complaint.companyId);
        if (!Number.isSafeInteger(companyId) || companyId <= 0) {
          throw new Error(`Invalid company ID for complaint ${complaint.id}`);
        }

        await createAndEmitNotification({
          io,
          companyId,
          type: "NEW_COMPLAINT",
          title: "New Complaint Received",
          message: `New complaint received for ${
            complaint.chargerName || complaint.stationName || "a charging station"
          }.`,
          entityId: complaint.complaintId ?? complaint.id,
          sourceKey: `complaint:${complaint.id}`,
        });

        // Persist progress after the idempotent notification insert.
        await saveComplaintCheckpoint(complaint.id);
        checkpoint = Number(complaint.id);
      }

      if (complaints.length < BATCH_SIZE) break;
    }
  } catch (error) {
    console.error("Complaint notification polling failed:", error.message);
  } finally {
    isPolling = false;
  }
};

export const startComplaintNotificationPolling = (io) => {
  if (pollingTimer || isStopping) return;

  // Initializes the checkpoint once; old complaints are not notified.
  void pollNewComplaints(io);

  pollingTimer = setInterval(() => {
    void pollNewComplaints(io);
  }, POLL_INTERVAL_MS);
};

export const stopComplaintNotificationPolling = async () => {
  isStopping = true;

  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }

  while (isPolling) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

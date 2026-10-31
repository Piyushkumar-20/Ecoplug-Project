import { generateMonthlyInvoices } from "./postpaid.service.js";

let timer = null;
let running = false;
const INDIA_OFFSET_MINUTES = 330;

const getIndiaDateParts = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
};

const previousMonth = (year, month) => {
  const date = new Date(Date.UTC(year, month - 2, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
};

const generatePreviousMonthInvoices = async () => {
  if (running) return;
  running = true;
  try {
    const today = getIndiaDateParts();
    const previous = previousMonth(today.year, today.month);
    const result = await generateMonthlyInvoices(previous);
    const generatedCount = result.results.filter((item) => item.generated).length;
    if (generatedCount > 0) {
      console.log(`[POSTPAID] Generated ${generatedCount} invoice(s) for ${previous.year}-${String(previous.month).padStart(2, "0")}`);
    }
  } catch (error) {
    console.error("[POSTPAID] Monthly invoice generation failed:", error.message);
  } finally {
    running = false;
  }
};

const getNextInvoiceRunDelay = () => {
  const now = new Date();
  const indiaNow = new Date(now.getTime() + INDIA_OFFSET_MINUTES * 60 * 1000);
  const nextMonthStartUtc = Date.UTC(
    indiaNow.getUTCFullYear(),
    indiaNow.getUTCMonth() + 1,
    1,
    0,
    5,
  );
  const nextRunUtc = nextMonthStartUtc - INDIA_OFFSET_MINUTES * 60 * 1000;
  return Math.max(1000, nextRunUtc - now.getTime());
};

const scheduleNextRun = () => {
  timer = setTimeout(async () => {
    await generatePreviousMonthInvoices();
    scheduleNextRun();
  }, getNextInvoiceRunDelay());
  timer.unref?.();
};

const startPostpaidInvoiceScheduler = () => {
  if (timer) return;
  // Startup catch-up covers a server restart after the 1st of the month.
  void generatePreviousMonthInvoices();
  scheduleNextRun();
  console.log("[POSTPAID] Monthly invoice generation scheduled for the 1st at 00:05 IST");
};

const stopPostpaidInvoiceScheduler = () => {
  if (timer) clearTimeout(timer);
  timer = null;
};

export { startPostpaidInvoiceScheduler, stopPostpaidInvoiceScheduler };

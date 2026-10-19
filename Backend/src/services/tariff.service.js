import { getAllTariffs } from "../models/tariffs.model.js";

const parseTariffElements = (elements) => {
  if (!elements) {
    throw new Error("Tariff elements are missing");
  }

  let parsedElements;

  try {
    parsedElements =
      typeof elements === "string" ? JSON.parse(elements) : elements;
  } catch {
    throw new Error("Invalid tariff elements JSON");
  }

  if (!Array.isArray(parsedElements) || parsedElements.length === 0) {
    throw new Error("Invalid tariff elements structure");
  }

  const element = parsedElements[0];

  if (!element || typeof element !== "object") {
    throw new Error("Invalid tariff element");
  }

  const restrictions = element.restrictions ?? {};
  const priceComponents = element.price_components ?? [];

  if (!Array.isArray(priceComponents)) {
    throw new Error("Invalid tariff price components");
  }

  return { restrictions, priceComponents };
};

const getValidityWindow = (tariff, restrictions) => {
  const label = tariff.validity_label?.trim();
  const start = restrictions.start_time;
  const end = restrictions.end_time;

  if (!label) {
    return start && end ? `${start} - ${end}` : "24x7";
  }

  const timeBasedLabels = ["Peak", "Off-Peak", "Late Night"];

  if (timeBasedLabels.includes(label) && start && end) {
    return `${label} (${start} - ${end})`;
  }

  return label;
};

const validateFilters = (filters) => {
  const allowedStatuses = ["Active", "Draft"];

  if (filters.status && !allowedStatuses.includes(filters.status)) {
    throw new Error("Invalid status. Use Active or Draft.");
  }

  for (const key of ["minRate", "maxRate"]) {
    if (
      filters[key] !== undefined &&
      filters[key] !== "" &&
      (!Number.isFinite(Number(filters[key])) || Number(filters[key]) < 0)
    ) {
      throw new Error(`${key} must be a non-negative number.`);
    }
  }

  if (
    filters.minRate !== undefined &&
    filters.minRate !== "" &&
    filters.maxRate !== undefined &&
    filters.maxRate !== "" &&
    Number(filters.minRate) > Number(filters.maxRate)
  ) {
    throw new Error("minRate cannot be greater than maxRate.");
  }

  const isValidDate = (value) =>
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value);

  for (const key of ["createdFrom", "createdTo"]) {
    if (!isValidDate(filters[key])) {
      throw new Error(`${key} must be a valid date in YYYY-MM-DD format.`);
    }
  }

  if (
    filters.createdFrom &&
    filters.createdTo &&
    filters.createdFrom > filters.createdTo
  ) {
    throw new Error("createdFrom cannot be later than createdTo");
  }
};

const getTariffs = async (companyId, filters = {}) => {
  if (companyId === undefined || companyId === null) {
    throw new Error("Company ID is required.");
  }

  validateFilters(filters);

  const tariffs = await getAllTariffs(companyId, filters);

  const mappedTariffs = tariffs.map((tariff) => {
    const { restrictions, priceComponents } = parseTariffElements(
      tariff.elements,
    );

    const energy = priceComponents.find(
      (component) => component?.type === "ENERGY",
    );

    const baseRate =
      energy?.price !== undefined && energy?.price !== null
        ? Number(energy.price)
        : null;

    return {
      tariffId: `#TRF-${String(Number(tariff.id) + 100).padStart(4, "0")}`,
      validityWindow: getValidityWindow(tariff, restrictions),
      baseRate,
      createdAt: tariff.created_at,
      status: tariff.status,
    };
  });

  const minRate =
    filters.minRate !== undefined && filters.minRate !== ""
      ? Number(filters.minRate)
      : null;

  const maxRate =
    filters.maxRate !== undefined && filters.maxRate !== ""
      ? Number(filters.maxRate)
      : null;

  return mappedTariffs.filter((tariff) => {
    if (
      minRate !== null &&
      (tariff.baseRate === null || tariff.baseRate < minRate)
    ) {
      return false;
    }

    if (
      maxRate !== null &&
      (tariff.baseRate === null || tariff.baseRate > maxRate)
    ) {
      return false;
    }

    return true;
  });
};

export { getTariffs };

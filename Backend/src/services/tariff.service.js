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

  return {
    restrictions,
    priceComponents,
  };
};

const getTariffs = async () => {
  const tariffs = await getAllTariffs();

  return tariffs.map((tariff) => {
    const { restrictions, priceComponents } = parseTariffElements(
      tariff.elements
    );

    const energy = priceComponents.find(
      (component) => component?.type === "ENERGY"
    );

    return {
      tariffId: `#TRF-${String(Number(tariff.id) + 100).padStart(4, "0")}`,


      validityWindow: `${restrictions.start_time ?? "00:00"} - ${
        restrictions.end_time ?? "23:59"
      }`,
      baseRate: energy?.price ?? null,
      createdAt: tariff.created_at,
      status: tariff.status,
    };
  });
};

export { getTariffs };

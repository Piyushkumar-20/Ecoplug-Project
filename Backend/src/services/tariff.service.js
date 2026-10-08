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

const getPriceComponent = (priceComponents, type) => {
  return priceComponents.find((component) => component?.type === type) ?? null;
};

const getTariffs = async () => {
  const tariffs = await getAllTariffs();

  return tariffs.map((tariff) => {
    const { restrictions, priceComponents } = parseTariffElements(
      tariff.elements,
    );

    const energy = getPriceComponent(priceComponents, "ENERGY");

    const parking = getPriceComponent(priceComponents, "PARKING_TIME");

    const flat = getPriceComponent(priceComponents, "FLAT");

    return {
      tariffId: tariff.tariff_id,
      partyId: tariff.party_id,
      type: tariff.type,
      currency: tariff.currency,

      validity: {
        startTime: restrictions.start_time ?? null,
        endTime: restrictions.end_time ?? null,
      },

      energy: energy
        ? {
            price: energy.price ?? null,
            stepSize: energy.step_size ?? null,
          }
        : null,

      parking: parking
        ? {
            price: parking.price ?? null,
            stepSize: parking.step_size ?? null,
          }
        : null,

      flat: flat
        ? {
            price: flat.price ?? null,
          }
        : null,

      createdAt: tariff.created_at,
    };
  });
};

export { getTariffs };

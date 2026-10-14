import { getChargers } from "../services/chargers.service.js";

const getChargerController = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const query = req.query;

    const filters = {};

    if (query.search?.trim()) {
      filters.search = query.search.trim();
    }

    if (query.emsp?.trim()) {
      filters.emsp = query.emsp.trim();
    }

    if (query.connectorType?.trim()) {
      filters.connectorType = query.connectorType.trim();
    }

    if (query.locationId?.trim()) {
      filters.locationId = query.locationId.trim();
    }

    if (query.status?.trim()) {
      filters.status = query.status.trim();
    }

    for (const key of ["minOutput", "maxOutput"]) {
      if (query[key] !== undefined && query[key] !== "") {
        const value = Number(query[key]);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: `${key} must be a non-negative number`,
          });
        }

        filters[key] = value;
      }
    }

    for (const key of ["lastActiveFrom", "lastActiveTo"]) {
      if (query[key]) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(query[key])) {
          return res.status(400).json({
            success: false,
            message: `${key} must use YYYY-MM-DD format`,
          });
        }

        filters[key] = query[key];
      }
    }

    if (query.lastActiveDays !== undefined) {
      filters.lastActiveDays = Number(query.lastActiveDays);
    }

    if (
      filters.minOutput !== undefined &&
      filters.maxOutput !== undefined &&
      filters.minOutput > filters.maxOutput
    ) {
      return res.status(400).json({
        success: false,
        message: "minOutput cannot exceed maxOutput",
      });
    }

    const chargers = await getChargers(companyId, filters);

    return res.status(200).json({
      success: true,
      count: chargers.length,
      data: chargers,
    });
  } catch (error) {
    next(error);
  }
};

export default getChargerController;

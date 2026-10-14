import { getTariffs } from "../services/tariff.service.js";

const getTariffsController = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const filter = {
      search: req.query.search,
      status: req.query.status,
      validityWindow: req.query.validityWindow ?? req.query.validity_label,
      createdFrom: req.query.createdFrom ?? req.query.created_from,
      createdTo: req.query.createdTo ?? req.query.created_to,
      minRate: req.query.minRate,
      maxRate: req.query.maxRate,
    };
    const tariffs = await getTariffs(companyId, filter);

    return res.status(200).json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    next(error);
  }
};

export { getTariffsController };

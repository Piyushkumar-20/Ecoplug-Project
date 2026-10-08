import { getTariffs } from "../services/tariff.service.js";

const getTariffsController = async (req, res, next) => {
  try {
    const tariffs = await getTariffs();

    return res.status(200).json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    next(error);
  }
};

export { getTariffsController };

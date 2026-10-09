import { getLocations } from "../services/location.service.js";

const getLocationsController = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const locations = await getLocations(companyId);

    return res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

export default getLocationsController;

import * as companyService from "../services/company.service.js";
import ApiError from "../utils/api-error.js";

const register = async (req, res) => {
  try {
    const {
      name,
      adminName,
      adminEmail,
      adminPassword,
      billingType,
    } = req.body;

    const result = await companyService.registerCompany({
      name: name.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      adminPassword,
      billingType,
    });

    res.status(201).json({
      success: true,
      message: "Company registered successfully. You can now login.",
      data: {
        companyId: result.companyId,
        adminUserId: result.adminUserId,
        adminEmail: adminEmail.trim().toLowerCase(),

      },
    });
  } catch (error) {
    console.error("Company registration error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      throw ApiError.conflict(
        "An account with this admin email already exists",
      );
    }
    throw ApiError.badRequest("Failed to register company");
  }
};

const getProfile = async (req, res, next) => { 
  try {
    const { userId, companyId } = req.user;

    const profile = await companyService.getProfile(userId, companyId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export { register, getProfile };

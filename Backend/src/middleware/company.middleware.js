import ApiError from "../utils/api-error.js";

const validateCompanyRegistration = (req, res, next) => {
  const { name, adminName, adminEmail, adminPassword, confirmPassword } =
    req.body;

  if (
    !name ||
    !adminName ||
    !adminEmail ||
    !adminPassword ||
    !confirmPassword
  ) {
    throw ApiError.badRequest(
      "company name, admin name, admin email, admin password and confirm password are required",
    );
  }

  if (adminPassword !== confirmPassword) {
    throw ApiError.badRequest("Admin passwords do not match");
  }

  if (adminPassword.length < 8) {
    throw ApiError.badRequest("Admin password must be at least 8 characters");
  }

  next();
};

export { validateCompanyRegistration };

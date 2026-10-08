const validateCompanyRegistration = (req, res, next) => {
  const { name, adminName, adminEmail, adminPassword, confirmPassword } =
    req.body;

  if (!name || !adminName || !adminEmail || !adminPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message:
        "company name, admin name, admin email, admin password and confirm password are required",
    });
  }

  if (adminPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Admin passwords do not match",
    });
  }

  if (adminPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Admin password must be at least 8 characters",
    });
  }

  next();
};

export { validateCompanyRegistration };

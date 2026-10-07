const validateCompany = (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Company name is required",
    });
  }

  next();
};

export { validateCompany };

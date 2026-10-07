const validateUser = (req, res, next) => {
    const { companyId, name, email, password } = req.body;
  
    if (!companyId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "companyId, name, email and password are required",
      });
    }
  
    next();
  };
  
  export { validateUser };
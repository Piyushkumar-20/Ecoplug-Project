import ApiError from "../utils/api-error.js";

const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw ApiError("Name, Email and Password are required");
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError("Email and Password are required");
  }
  next();
};

export { validateUser, validateLogin };

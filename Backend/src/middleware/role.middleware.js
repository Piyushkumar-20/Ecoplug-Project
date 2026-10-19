import ApiError from "../utils/api-error.js";

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden("Access Denied");
    }
    next();
  };
};
export default authorizeRoles;

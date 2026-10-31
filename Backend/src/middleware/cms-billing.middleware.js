import { timingSafeEqual } from "node:crypto";
import ApiError from "../utils/api-error.js";

const cmsBillingMiddleware = (req, res, next) => {
  const configuredKey = process.env.CMS_BILLING_API_KEY;
  const suppliedKey = req.get("x-cms-billing-key");

  if (!configuredKey) {
    return next(ApiError.internal("CMS billing integration key is not configured"));
  }

  if (typeof suppliedKey !== "string") {
    return next(ApiError.unauthorized("CMS billing authentication required"));
  }

  const expected = Buffer.from(configuredKey);
  const received = Buffer.from(suppliedKey);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return next(ApiError.unauthorized("Invalid CMS billing key"));
  }

  next();
};

export { cmsBillingMiddleware };

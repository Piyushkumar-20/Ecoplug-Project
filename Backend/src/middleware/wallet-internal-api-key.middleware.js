import { timingSafeEqual } from "node:crypto";
import ApiError from "../utils/api-error.js";

const walletInternalApiKeyMiddleware = (req, res, next) => {
  const configuredKey = process.env.WALLET_INTERNAL_API_KEY;
  const suppliedKey = req.get("x-internal-api-key");

  if (!configuredKey) {
    return next(ApiError.internal("Wallet internal API key is not configured"));
  }

  if (typeof suppliedKey !== "string") {
    return next(ApiError.unauthorized("Internal API authentication required"));
  }

  const expected = Buffer.from(configuredKey, "utf8");
  const received = Buffer.from(suppliedKey, "utf8");

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return next(ApiError.unauthorized("Invalid internal API key"));
  }

  return next();
};

export { walletInternalApiKeyMiddleware };

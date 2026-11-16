import ApiError from "../utils/api-error.js";

const errorMiddleware = (err, req, res, next) => {
  const isOperationalError = err instanceof ApiError;

  const status =
    isOperationalError &&
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status <= 599
      ? err.status
      : 500;

  const message = status >= 500 ? "Internal Server Error" : err.message;

  if (status >= 500) {
    console.error("Internal Server Error:", err);
  }

  return res.status(status).json({
    success: false,
    message,
    ...(isOperationalError && err.details ? { details: err.details } : {}),
  });
};

export { errorMiddleware };

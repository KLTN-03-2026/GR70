// middleware/errorHandler.js
const ApiErrorResponse = require("../utils/ApiErrorResponse");

function errorHandler(err, req, res, next) {
  console.error("Global Error:", JSON.stringify({
    message: err.message,
    type: err.type,
    status: err?.status,
    errors: err?.errors?.message
  }, null, 2));

  res.status(err.status || 500).json({
    success: false,
    type: err?.type,
    status: err?.status || 500,
    message: err?.message || "Internal Server Error",
    errors: err?.errors || []
  });
}

module.exports = errorHandler;

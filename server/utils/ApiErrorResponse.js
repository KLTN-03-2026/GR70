// utils/ApiErrorResponse.js
function ApiErrorResponse({ title, status, message, errors = [] }) {
    return {
        success: false,
        title,
        status,
        message,
        errors
    };
}

module.exports = ApiErrorResponse;

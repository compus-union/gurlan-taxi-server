const driverResponseStatus = {
  AUTH: {
    DRIVER_NOT_FOUND: "DRIVER_NOT_FOUND",
    HEADERS_NOT_FOUND: "HEADERS_NOT_FOUND",
    DRIVER_TOKEN_NOT_FOUND: "DRIVER_TOKEN_NOT_FOUND",
    DRIVER_TOKEN_NOT_VALID: "DRIVER_TOKEN_NOT_VALID",
    DRIVER_BANNED: "DRIVER_BANNED",
    DRIVER_SELF_ACCESS_NOT_VALID: "DRIVER_SELF_ACCESS_NOT_VALID",
    AUTH_WARNING: "AUTH_WARNING",
    VALIDATION_WAITING: "VALIDATION_WAITING",
    VALIDATION_DONE: "VALIDATION_DONE",
    VALIDATION_FAILED: "VALIDATION_FAILED",
    DRIVER_EXISTS: "DRIVER_EXISTS",
    IMAGES_SENT: "IMAGES_SENT",
    IMAGES_SENT_FAILED: "IMAGES_SENT_FAILED",
    REGISTRATION_DONE: "REGISTRATION_DONE",
    LOGIN_DONE: "LOGIN_DONE",
    LOGIN_FAILED: "LOGIN_FAILED",
    DRIVER_NOT_VALIDATED: "DRIVER_NOT_VALIDATED",
    SELF_DELETION_DONE: "DELETION_DONE"
  },
};

module.exports = { driverResponseStatus };

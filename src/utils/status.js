const status = {
  OK: { code: 200, message: "Success" },
  CREATED: { code: 201, message: "Created successfully" },
  BAD_REQUEST: { code: 400, message: "Bad request" },
  UNAUTHORIZED: { code: 401, message: "Unauthorized" },
  FORBIDDEN: { code: 403, message: "Forbidden" },
  NOT_FOUND: { code: 404, message: "Not found" },
  CONFLICT: { code: 409, message: "Conflict" },
  INTERNAL_ERROR: { code: 500, message: "Internal server error" },
  SERVICE_UNAVAILABLE: { code: 503, message: "Service unavailable" },
};

export default status;

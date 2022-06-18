const sendError = (err, req, res) => {
  return res
    .status(err.statusCode)
    .json({
      status: err.status,
      error: err,
      message: err.message,
    })
    .end();
};

const globalHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  sendError(err, req, res);
};

module.exports = globalHandler;

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function methodNotAllowed(res) {
  json(res, 405, { error: "Method Not Allowed" });
}

module.exports = { json, methodNotAllowed };


const { json, methodNotAllowed } = require("../_lib/http");
const { clearSessionCookie } = require("../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
};


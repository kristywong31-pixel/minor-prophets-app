const { json, methodNotAllowed } = require("../_lib/http.cjs");
const { clearSessionCookie } = require("../_lib/auth.cjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
};


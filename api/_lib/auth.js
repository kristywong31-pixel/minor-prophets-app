const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const COOKIE_NAME = "pcmp_session";

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }
  return process.env.JWT_SECRET;
}

function signSession(userId) {
  const secret = requireJwtSecret();
  return jwt.sign({ sub: userId }, secret, { expiresIn: "30d" });
}

function verifySessionToken(token) {
  const secret = requireJwtSecret();
  const payload = jwt.verify(token, secret);
  return payload?.sub || null;
}

function getCookies(req) {
  return cookie.parse(req.headers.cookie || "");
}

function getUserIdFromRequest(req) {
  const cookies = getCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30d
    })
  );
}

function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 0,
    })
  );
}

module.exports = {
  COOKIE_NAME,
  signSession,
  getUserIdFromRequest,
  setSessionCookie,
  clearSessionCookie,
};


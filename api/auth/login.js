const { getPool } = require("../../lib/db.cjs");
const { json, methodNotAllowed } = require("../../lib/http.cjs");
const { readJson } = require("../../lib/body.cjs");
const { signSession, setSessionCookie } = require("../../lib/auth.cjs");
const { signSession, setSessionCookie } = require("../_lib/auth.cjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);

  const body = await readJson(req);
  const name = (body?.name || "").trim();
  const password = body?.password || "";

  if (!name) return json(res, 400, { error: "請輸入真實姓名。" });
  if (!password || password.length < 6) return json(res, 400, { error: "姓名或密碼不正確。" });

  const pool = getPool();
  const { rows } = await pool.query(
    `select id, name, password_hash, note,
            avatar_color as "avatarColor",
            avatar_url as "avatarUrl"
     from app_users
     where name = $1
     limit 1`,
    [name]
  );

  const u = rows[0];
  if (!u) return json(res, 401, { error: "姓名或密碼不正確。" });

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return json(res, 401, { error: "姓名或密碼不正確。" });

  const token = signSession(u.id);
  setSessionCookie(res, token);

  const user = {
    id: u.id,
    name: u.name,
    note: u.note || "",
    avatarColor: u.avatarColor || null,
    avatarUrl: u.avatarUrl || null,
  };

  return json(res, 200, { user });
};


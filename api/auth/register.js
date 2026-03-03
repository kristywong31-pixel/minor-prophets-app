const bcrypt = require("bcryptjs");
const { getPool } = require("../_lib/db");
const { json, methodNotAllowed } = require("../_lib/http");
const { readJson } = require("../_lib/body");
const { signSession, setSessionCookie } = require("../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);

  const body = await readJson(req);
  const name = (body?.name || "").trim();
  const password = body?.password || "";

  if (!name) return json(res, 400, { error: "請輸入真實姓名。" });
  if (password.length < 6) return json(res, 400, { error: "註冊密碼需至少 6 個字元。" });

  const pool = getPool();
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const avatarColor = body?.avatarColor || null;
    const note = body?.note || "主恩滿溢";
    const avatarUrl = body?.avatarUrl || null;

    const { rows } = await pool.query(
      `insert into app_users (name, password_hash, note, avatar_color, avatar_url)
       values ($1, $2, $3, $4, $5)
       returning id, name, note, avatar_color as "avatarColor", avatar_url as "avatarUrl"`,
      [name, passwordHash, note, avatarColor, avatarUrl]
    );

    const user = rows[0];
    const token = signSession(user.id);
    setSessionCookie(res, token);

    return json(res, 201, { user });
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      return json(res, 409, { error: "此姓名已建立帳號，請改用登入或換一個稱呼。" });
    }
    return json(res, 500, { error: "註冊失敗，請稍後再試。" });
  }
};


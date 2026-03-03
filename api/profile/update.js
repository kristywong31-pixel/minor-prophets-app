const { getPool } = require("../_lib/db.cjs");
const { json, methodNotAllowed } = require("../_lib/http.cjs");
const { getUserIdFromRequest } = require("../_lib/auth.cjs");
const { readJson } = require("../_lib/body.cjs");

module.exports = async (req, res) => {
  if (req.method !== "PATCH") return methodNotAllowed(res);

  const userId = getUserIdFromRequest(req);
  if (!userId) return json(res, 401, { error: "未登入" });

  const body = (await readJson(req)) || {};
  const name = typeof body.name === "string" ? body.name.trim() : null;
  const note = typeof body.note === "string" ? body.note : null;
  const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : null;
  const avatarColor = typeof body.avatarColor === "string" ? body.avatarColor : null;

  const pool = getPool();

  // Update only provided fields.
  // Name is unique; if conflict, return 409.
  try {
    const { rows } = await pool.query(
      `update app_users set
         name = coalesce($2, name),
         note = coalesce($3, note),
         avatar_url = coalesce($4, avatar_url),
         avatar_color = coalesce($5, avatar_color),
         updated_at = now()
       where id = $1
       returning id, name, note,
                 avatar_color as "avatarColor",
                 avatar_url as "avatarUrl"`,
      [userId, name || null, note, avatarUrl, avatarColor]
    );

    return json(res, 200, { user: rows[0] });
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      return json(res, 409, { error: "此姓名已被使用。" });
    }
    return json(res, 500, { error: "更新失敗" });
  }
};


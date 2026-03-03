const { getPool } = require("./_lib/db.cjs");
const { json, methodNotAllowed } = require("./_lib/http.cjs");
const { getUserIdFromRequest } = require("./_lib/auth.cjs");

module.exports = async (req, res) => {
  if (req.method !== "GET") return methodNotAllowed(res);

  const userId = getUserIdFromRequest(req);
  if (!userId) return json(res, 401, { error: "未登入" });

  const pool = getPool();
  const { rows } = await pool.query(
    `select id, name, note,
            avatar_color as "avatarColor",
            avatar_url as "avatarUrl"
     from app_users
     where id = $1`,
    [userId]
  );

  const user = rows[0];
  if (!user) return json(res, 401, { error: "未登入" });

  return json(res, 200, { user });
};


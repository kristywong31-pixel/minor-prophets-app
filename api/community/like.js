const { getPool } = require("../_lib/db.cjs");
const { json, methodNotAllowed } = require("../_lib/http.cjs");
const { getUserIdFromRequest } = require("../_lib/auth.cjs");
const { readJson } = require("../_lib/body.cjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);

  const userId = getUserIdFromRequest(req);
  if (!userId) return json(res, 401, { error: "未登入" });

  const body = await readJson(req);
  const postId = body?.postId;
  if (!postId) return json(res, 400, { error: "postId 不正確" });

  const pool = getPool();

  const { rows } = await pool.query(
    `select 1 from post_likes where post_id = $1 and user_id = $2`,
    [postId, userId]
  );
  const exists = rows.length > 0;

  if (exists) {
    await pool.query(
      `delete from post_likes where post_id = $1 and user_id = $2`,
      [postId, userId]
    );
    return json(res, 200, { liked: false });
  }

  await pool.query(
    `insert into post_likes (post_id, user_id) values ($1, $2) on conflict do nothing`,
    [postId, userId]
  );
  return json(res, 200, { liked: true });
};


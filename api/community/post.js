const { getPool } = require("../_lib/db");
const { json, methodNotAllowed } = require("../_lib/http");
const { getUserIdFromRequest } = require("../_lib/auth");
const { readJson } = require("../_lib/body");

module.exports = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);

  const userId = getUserIdFromRequest(req);
  if (!userId) return json(res, 401, { error: "未登入" });

  const body = await readJson(req);
  const content = (body?.content || "").trim();
  if (!content) return json(res, 400, { error: "內容不可為空" });

  const pool = getPool();
  const { rows } = await pool.query(
    `insert into community_posts (user_id, content)
     values ($1, $2)
     returning id`,
    [userId, content]
  );

  return json(res, 201, { id: rows[0].id });
};


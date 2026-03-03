const { getPool } = require("../_lib/db.cjs");
const { json, methodNotAllowed } = require("../_lib/http.cjs");
const { getUserIdFromRequest } = require("../_lib/auth.cjs");

module.exports = async (req, res) => {
  if (req.method !== "GET") return methodNotAllowed(res);

  const userId = getUserIdFromRequest(req);
  if (!userId) return json(res, 401, { error: "未登入" });

  const pool = getPool();
  const { rows } = await pool.query(
    `select p.id,
            u.name as "userName",
            u.note as note,
            u.avatar_color as "avatarColor",
            u.avatar_url as "avatarUrl",
            c.title as badge,
            p.content as content,
            p.created_at as "createdAt",
            exists (
              select 1 from post_likes l
              where l.post_id = p.id and l.user_id = $1
            ) as "liked"
     from community_posts p
     join app_users u on u.id = p.user_id
     left join courses c on c.id = p.badge_course_id
     order by p.created_at desc
     limit 50`,
    [userId]
  );

  const posts = rows.map((r) => ({
    id: r.id,
    userName: r.userName,
    note: r.note || "",
    avatarColor: r.avatarColor || null,
    avatarUrl: r.avatarUrl || null,
    badge: r.badge || null,
    content: r.content || "",
    time: "剛剛", // 前端可再做相對時間
    liked: !!r.liked,
  }));

  return json(res, 200, { posts });
};


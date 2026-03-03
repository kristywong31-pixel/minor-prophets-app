const { getPool } = require("./_lib/db.cjs");
const { json, methodNotAllowed } = require("./_lib/http.cjs");

module.exports = async (req, res) => {
  if (req.method !== "GET") return methodNotAllowed(res);
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, title, speaker, chapters_count as "chapters", badge_key as "badgeKey",
            to_char(event_date, 'YYYY.MM.DD') as "date"
     from courses
     order by id asc`
  );
  return json(res, 200, { courses: rows });
};


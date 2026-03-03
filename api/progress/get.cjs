const { getPool } = require("../_lib/db.cjs");
const { json, methodNotAllowed } = require("../_lib/http.cjs");
const { getUserIdFromRequest } = require("../_lib/auth.cjs");

async function ensureProgressRows(pool, userId) {
  // Ensure there is a progress row for every course.
  await pool.query(
    `insert into user_course_progress (user_id, course_id)
     select $1, c.id
     from courses c
     where not exists (
       select 1 from user_course_progress p
       where p.user_id = $1 and p.course_id = c.id
     )`,
    [userId]
  );
}

module.exports = async (req, res) => {
  if (req.method !== "GET") return methodNotAllowed(res);

  const userId = getUserIdFromRequest(req);
  if (!userId) return json(res, 401, { error: "未登入" });

  const pool = getPool();
  await ensureProgressRows(pool, userId);

  const { rows } = await pool.query(
    `select course_id as "courseId",
            read_chapters as "chapters",
            quiz_score as "quizScore",
            attendance_type as "attendanceType",
            attendance_link as "attendanceLink"
     from user_course_progress
     where user_id = $1
     order by course_id asc`,
    [userId]
  );

  const progress = {};
  for (const r of rows) {
    progress[r.courseId] = {
      chapters: r.chapters || [],
      quizScore: r.quizScore === null ? undefined : r.quizScore,
      attendance: r.attendanceType
        ? { type: r.attendanceType, link: r.attendanceLink || "" }
        : {},
    };
  }

  return json(res, 200, { progress });
};


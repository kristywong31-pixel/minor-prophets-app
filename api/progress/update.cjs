const { getPool } = require("../_lib/db.cjs");
const { json, methodNotAllowed } = require("../_lib/http.cjs");
const { getUserIdFromRequest } = require("../_lib/auth.cjs");
const { readJson } = require("../_lib/body.cjs");

function computeBadgeUnlocked(course, progress) {
  const readingDone = (progress.chapters?.length || 0) === course.chapters;
  const quizDone = progress.quizScore !== undefined;
  const attendDone = progress.attendance?.type === "live" || progress.attendance?.type === "replay";
  return readingDone && quizDone && attendDone;
}

module.exports = async (req, res) => {
  if (req.method !== "PATCH") return methodNotAllowed(res);

  const userId = getUserIdFromRequest(req);
  if (!userId) return json(res, 401, { error: "未登入" });

  const body = await readJson(req);
  const courseId = Number(body?.courseId);
  if (!courseId || !Number.isFinite(courseId)) return json(res, 400, { error: "courseId 不正確" });

  const pool = getPool();

  const { rows: courseRows } = await pool.query(
    `select id, chapters_count as "chapters", title from courses where id = $1`,
    [courseId]
  );
  const course = courseRows[0];
  if (!course) return json(res, 404, { error: "課程不存在" });

  const chapters = Array.isArray(body?.chapters)
    ? body.chapters.map((n) => Number(n)).filter((n) => Number.isFinite(n))
    : null;
  const quizScore = body?.quizScore;
  const attendanceType = body?.attendance?.type || null;
  const attendanceLink = body?.attendance?.link || null;

  // Update only provided fields.
  // For simplicity: we expect full progress payload from client.
  const next = {
    chapters: chapters || [],
    quizScore: typeof quizScore === "number" ? quizScore : undefined,
    attendance: attendanceType ? { type: attendanceType, link: attendanceLink || "" } : {},
  };

  await pool.query(
    `insert into user_course_progress (user_id, course_id, read_chapters, quiz_score, attendance_type, attendance_link)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (user_id, course_id) do update set
       read_chapters = excluded.read_chapters,
       quiz_score = excluded.quiz_score,
       attendance_type = excluded.attendance_type,
       attendance_link = excluded.attendance_link,
       updated_at = now()`,
    [
      userId,
      courseId,
      next.chapters,
      next.quizScore === undefined ? null : next.quizScore,
      attendanceType,
      attendanceLink,
    ]
  );

  // If badge unlocked now, auto-create a community post once.
  const unlocked = computeBadgeUnlocked(course, next);
  if (unlocked) {
    // Prevent duplicate unlock posts: only if no prior post for this user+course.
    await pool.query(
      `insert into community_posts (user_id, content, badge_course_id)
       select $1, $2, $3
       where not exists (
         select 1 from community_posts
         where user_id = $1 and badge_course_id = $3
       )`,
      [userId, `剛剛完成《${course.title}》並解鎖徽章！`, courseId]
    );
  }

  return json(res, 200, { ok: true, badgeUnlocked: unlocked });
};


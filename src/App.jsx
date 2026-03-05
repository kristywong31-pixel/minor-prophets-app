import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen, CheckCircle2, Circle, Award, User, Users, Home,
  ChevronDown, ChevronUp, PlayCircle, Edit3, Plus, X, LogOut,
  MessageCircle, Lock, Heart, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────
const supabaseUrl  = "https://lscogljctrempxjwtwue.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzY29nbGpjdHJlbXB4and0d3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzY1OTQsImV4cCI6MjA4ODA1MjU5NH0.zisZlYu6UmbpA6tUNP6wBzxcFoVzpGFYn9gmIoZxzz8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Design tokens ─────────────────────────────────────────
const theme = {
  bg: "#FFFFFF", cardBg: "#F8F1E5", textMain: "#3A2E2A",
  accent: "#C47A2C", navBg: "#2F3E46", success: "#7A9E7E", gray: "#9CA3AF",
};
const AVATAR_COLORS = ["#F4C7A2","#F1B0AE","#E8CE97","#C9D8A7","#B4C8E0"];

// ── Course catalogue (static) ─────────────────────────────
const COURSES = [
  { id:1,  date:"2026.03.05", title:"何西阿書", speaker:"蕭楚剛牧師", chapters:14, badgeKey:"hosea",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSdjaoKXvSscCkUv8yQ-b4XsEAzyuQqtp3qoANB1TP4V9DKf3w/viewform?usp=send_form", youtubeLink:"https://youtu.be/UUorD_-WSBM" },
  { id:2,  date:"2026.04.02", title:"約珥書",   speaker:"梁浩威傳道", chapters:3,  badgeKey:"joel",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSeBMksdl9SIpXxFxHYiyD3Rsg9q_my42S9AeWzCSw1oS3F91Q/closedform", youtubeLink:"" },
  { id:3,  date:"2026.05.07", title:"阿摩斯書", speaker:"林凱倫傳道", chapters:9,  badgeKey:"amos",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSdwGSlCBhG1wzj7sMhfVz_NjXC5157bd7f3MTMVI_OnnVu-1g/closedform", youtubeLink:"" },
  { id:4,  date:"2026.06.04", title:"約拿書",   speaker:"林素華傳道", chapters:4,  badgeKey:"jonah",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSfmJ2HxVbtyG1C8gzKiNHx_sHuHPlH3xNHMI0DpDAd3R8oitw/closedform", youtubeLink:"" },
  { id:5,  date:"2026.07.02", title:"彌迦書",   speaker:"徐天睿弟兄", chapters:7,  badgeKey:"micah",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSdGtw2tbu7JtuKVe5kvWx4x-o1B7VOy0o8Xlwn5-S90GaboSQ/closedform", youtubeLink:"" },
  { id:6,  date:"2026.08.06", title:"那鴻書",   speaker:"冼浚瑋弟兄", chapters:3,  badgeKey:"nahum",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSeuDay0xYrMkrvQTbt71R2MnRmJV0EuANxy8FIPqG2yepBpDQ/closedform", youtubeLink:"" },
  { id:7,  date:"2026.09.03", title:"哈巴谷書", speaker:"梁浩威傳道", chapters:3,  badgeKey:"habakkuk",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSes72P2yUiuGLv88ER9Ihl_9WxFh2m07Kzq5fBJ7yL6eNv9OA/closedform", youtubeLink:"" },
  { id:8,  date:"2026.10.08", title:"西番亞書", speaker:"林凱倫傳道", chapters:3,  badgeKey:"zephaniah",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSdgeo78ClO7pRtT4uUtFD9G-_249DYKmsohzSJGvj4SnpIX6A/closedform", youtubeLink:"" },
  { id:9,  date:"2026.11.05", title:"哈該書",   speaker:"林素華傳道", chapters:2,  badgeKey:"haggai",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLSeifBUeVBjcQglcA1QUCn8p1dBffjJQ0palMGZmpuPDH0R20A/closedform", youtubeLink:"" },
  { id:10, date:"2026.12.03", title:"瑪拉基書", speaker:"蕭楚剛牧師", chapters:4,  badgeKey:"malachi",
    quizUrl:"https://docs.google.com/forms/d/e/1FAIpQLScPYHdSgxEJmrcCl2CdDod4nuaQ8tLfWwZ2HcYus9-G5xXZCQ/closedform", youtubeLink:"" },
];

const BADGE_IMAGE_PATHS = {
  hosea:"/badges/hosea.png", joel:"/badges/joel.png", amos:"/badges/amos.png",
  jonah:"/badges/jonah.png", micah:"/badges/micah.png", nahum:"/badges/nahum.png",
  habakkuk:"/badges/habakkuk.png", zephaniah:"/badges/zephaniah.png",
  haggai:"/badges/haggai.png", malachi:"/badges/malachi.png",
};

// ── Helpers ───────────────────────────────────────────────
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function toYouTubeEmbedUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (raw.includes("youtube.com/embed/") || raw.includes("youtube-nocookie.com/embed/")) return raw;
  const m = raw.match(/(?:youtu\.be\/|v=|\/shorts\/|\/live\/)([A-Za-z0-9_-]{6,})/);
  return m?.[1] ? `https://www.youtube-nocookie.com/embed/${m[1]}` : "";
}

function formatPostDate(input) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getFullYear()).slice(-2)}`;
}

function isCompleteCourse(courseId, progress) {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course || !progress) return false;
  const readingDone  = (progress.chapters?.length || 0) === course.chapters;
  const quizDone     = progress.quizScore != null;
  const attendDone   = progress.attendance?.type === "live" || progress.attendance?.type === "replay";
  return readingDone && quizDone && attendDone;
}

function normalizePosts(rows, likedIds = new Set()) {
  return (rows || []).map((r) => {
    const u = r.app_users || {};
    return {
      id: r.id,
      userId: u.id || null,
      author: u.name || "友",
      content: r.content || "",
      note: u.note || "",
      likes: r.likes_count ?? 0,
      isLiked: likedIds.has(r.id),
      time: formatPostDate(r.created_at),
      createdAt: r.created_at,
      avatarColor: u.avatar_color || "#F4C7A2",
      avatarUrl: u.avatar_url || null,
      badge: r.badge_course_id ? (COURSES.find((c) => c.id === r.badge_course_id)?.title || null) : null,
    };
  });
}

function compressImageToBlob(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("請選擇圖片檔案。"));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        try {
          const max = 300;
          let { width: w, height: h } = img;
          if (w > h) { if (w > max) { h = (h * max) / w; w = max; } }
          else       { if (h > max) { w = (w * max) / h; h = max; } }
          const c = document.createElement("canvas");
          c.width = Math.round(w); c.height = Math.round(h);
          const ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob((b) => (b ? resolve(b) : reject(new Error("壓縮失敗"))), "image/jpeg", 0.7);
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("圖片載入失敗"));
      img.src = String(ev.target?.result || "");
    };
    reader.onerror = () => reject(new Error("讀取失敗"));
    reader.readAsDataURL(file);
  });
}

// ── Profile fetch / self-heal ─────────────────────────────
async function fetchOrCreateProfile(authUser) {
  const { data: profile, error } = await supabase
    .from("app_users")
    .select("id, name, note, avatar_url, avatar_color")
    .eq("id", authUser.id)
    .single();

  if (!error && profile) {
    return {
      id: profile.id,
      name: profile.name || "學員",
      note: profile.note || "主恩滿溢(可修改)",
      avatarColor: profile.avatar_color || randomAvatarColor(),
      avatarUrl: profile.avatar_url || null,
    };
  }

  const { data: np, error: ce } = await supabase
    .from("app_users")
    .upsert(
      { id: authUser.id, name: authUser.user_metadata?.name || "學員", note: "主恩滿溢(可修改)", avatar_color: randomAvatarColor() },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (ce || !np) { console.error("Profile self-heal failed:", ce); return null; }
  return {
    id: np.id, name: np.name || "學員", note: np.note || "主恩滿溢(可修改)",
    avatarColor: np.avatar_color || randomAvatarColor(), avatarUrl: np.avatar_url || null,
  };
}

// ── Auth Screen ───────────────────────────────────────────
function AuthScreen({ onAuth, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [localErr, setLocalErr] = useState("");
  const [busy, setBusy]       = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLocalErr(""); setBusy(true);
    if (isRegister && !name.trim()) { setLocalErr("請輸入姓名。"); setBusy(false); return; }
    if (!email.trim() || !email.includes("@")) { setLocalErr("請輸入有效的電郵地址。"); setBusy(false); return; }
    if (!password || password.length < 6) { setLocalErr("密碼需至少 6 個字元。"); setBusy(false); return; }
    await onAuth({ mode: isRegister ? "register" : "login", payload: { name: name.trim(), email: email.trim(), password } });
    setBusy(false);
  };

  const err = localErr || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: theme.bg }}>
      <motion.div initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} className="w-full max-w-md">
        <div className="rounded-3xl shadow-md p-8" style={{ backgroundColor: theme.cardBg }}>
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-[0.2em]" style={{ color: theme.accent }}>2026 PROPHETIC COMMUNITY</p>
            <h1 className="mt-3 text-2xl font-bold" style={{ color: theme.textMain }}>小先知書速覽</h1>
            <p className="mt-1 text-xs opacity-70" style={{ color: theme.textMain }}>金巴崙長老會沙田堂</p>
          </div>

          <div className="flex mb-6 bg-white/60 rounded-2xl p-1">
            <button type="button" onClick={() => { setIsRegister(false); setLocalErr(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${!isRegister ? "bg-white shadow-md" : "opacity-60"}`}
              style={{ color: theme.textMain }}>已有帳號</button>
            <button type="button" onClick={() => { setIsRegister(true); setLocalErr(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${isRegister ? "bg-white shadow-md" : "opacity-60"}`}
              style={{ color: theme.textMain }}>建立新帳號</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold mb-1 ml-1" style={{ color: theme.textMain }}>真實姓名 (將顯示於個人檔案)</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1 ml-1" style={{ color: theme.textMain }}>電郵地址</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white" placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 ml-1" style={{ color: theme.textMain }}>密碼</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white" placeholder="至少 6 個字元" />
            </div>
            {err && (
              <div className="flex items-start gap-2 text-xs text-red-500 mt-1 ml-1 bg-red-50 p-2 rounded-lg border border-red-100">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /><span>{err}</span>
              </div>
            )}
            <button type="submit" disabled={busy}
              className="w-full mt-2 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
              style={{ backgroundColor: theme.accent }}>
              {busy ? "處理中..." : isRegister ? "建立帳戶並開始課程" : "登入課程"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────
function Badge({ title, unlocked, badgeKey }) {
  const src = badgeKey ? BADGE_IMAGE_PATHS[badgeKey] : null;
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-md overflow-hidden transition-all"
        style={{ backgroundColor: unlocked ? "#FEF3C7" : "#E5E7EB", borderColor: unlocked ? theme.accent : "#D1D5DB", opacity: unlocked ? 1 : 0.6 }}>
        {unlocked && src
          ? <img src={src} alt={title} className="w-14 h-14 object-contain" />
          : <Lock className="w-4 h-4" color={theme.gray} />}
      </div>
      <span className="mt-2 text-xs font-medium text-center" style={{ color: theme.textMain }}>{title}</span>
    </div>
  );
}

// ── CourseCard ─────────────────────────────────────────────
function CourseCard({ course, progress, isExpanded, onToggleExpand, onUpdateProgress, quizCompleted }) {
  const chaptersDone     = progress?.chapters?.length || 0;
  const readingProgress  = (chaptersDone / course.chapters) * 100;
  const isQuizDone       = !!quizCompleted;
  const isAttendanceDone = progress?.attendance?.type === "live" || progress?.attendance?.type === "replay";
  const isComplete       = readingProgress === 100 && isQuizDone && isAttendanceDone;
  const isStarted        = chaptersDone > 0 || isQuizDone || isAttendanceDone;
  const youtubeEmbedUrl  = toYouTubeEmbedUrl(course.youtubeLink);

  let statusColor = theme.gray;
  let statusIcon  = <Circle size={18} />;
  if (isComplete)     { statusColor = "#4ade80"; statusIcon = <CheckCircle2 size={18} className="text-green-400" />; }
  else if (isStarted) { statusColor = theme.accent; statusIcon = <div className="w-4 h-4 rounded-full border-[3px]" style={{ borderColor: theme.accent }} />; }

  const toggleChapter = (ch) => {
    const cur = progress?.chapters || [];
    const next = cur.includes(ch) ? cur.filter((v) => v !== ch) : [...cur, ch];
    onUpdateProgress(course.id, { ...progress, chapters: next });
  };

  const setAttendance = (type) => {
    onUpdateProgress(course.id, { ...progress, attendance: { type, link: progress?.attendance?.link || "" } });
  };

  const handleFinishQuiz = () => {
    if (isQuizDone) return;
    onUpdateProgress(course.id, { ...progress, quizScore: 100 });
  };

  return (
    <motion.div layout className="mb-4 rounded-2xl overflow-hidden shadow-md" style={{ backgroundColor: theme.cardBg }}>
      <button type="button" className="w-full p-4 flex items-center justify-between text-left" onClick={onToggleExpand}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0" style={{ color: statusColor }}>{statusIcon}</div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: theme.textMain }}>{course.title}</h3>
            <p className="text-[11px] opacity-70" style={{ color: theme.textMain }}>{course.date} · {course.speaker}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} color={theme.textMain} /> : <ChevronDown size={18} color={theme.textMain} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }} exit={{ height:0,opacity:0 }} className="border-t border-white/50">
            <div className="p-4 space-y-6" style={{ backgroundColor:"rgba(255,255,255,0.6)" }}>
              {/* 讀經打卡 */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor:"rgba(255,255,255,0.9)" }}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-semibold flex items-center gap-2" style={{ color:theme.textMain }}><BookOpen size={14} /> 讀經打卡</h4>
                  <span className="text-[11px] font-semibold" style={{ color:theme.accent }}>{Math.round(readingProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div className="h-full transition-all duration-500" style={{ width:`${readingProgress}%`, backgroundColor:theme.accent }} />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: course.chapters }).map((_, idx) => {
                    const ch = idx + 1; const checked = progress?.chapters?.includes(ch);
                    return (
                      <button key={ch} type="button" onClick={() => toggleChapter(ch)}
                        className={`text-[11px] py-1 rounded-xl border transition-colors ${checked ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200"}`}
                        style={{ backgroundColor: checked ? theme.success : "white" }}>
                        {ch}章
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 課前小測 */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor:"rgba(255,255,255,0.9)" }}>
                <h4 className="text-xs font-semibold flex items-center gap-2 mb-2" style={{ color:theme.textMain }}><Edit3 size={14} /> 課前小測</h4>
                {isQuizDone ? (
    <button type="button" disabled className="w-full h-9 rounded-full text-[12px] font-semibold border-none text-white cursor-default" style={{ backgroundColor:'#C4973B' }}>
      已完成小測
    </button>
) : (
                  <div className="space-y-3">
                    {course.quizUrl
                      ? <a href={course.quizUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-full h-9 rounded-full text-[12px] border bg-white transition-all"
                          style={{ borderColor:"#E5E7EB", color:theme.textMain }}>開始測驗</a>
                      : <p className="text-[11px] text-gray-400">小測連結尚未設定</p>}
                    <button type="button" onClick={handleFinishQuiz}
                      className="w-full h-9 rounded-full text-[12px] font-semibold border shadow-sm active:scale-95 transition-all"
                      style={{ backgroundColor:"white", borderColor:"#E5E7EB", color:theme.textMain }}>已完成小測</button>
                  </div>
                )}
              </div>

              {/* 出席紀錄 */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor:"rgba(255,255,255,0.9)" }}>
                <h4 className="text-xs font-semibold flex items-center gap-2 mb-2" style={{ color:theme.textMain }}><Users size={14} /> 出席紀錄</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {["live","replay"].map((t) => {
                      const active = progress?.attendance?.type === t;
                      return (
                        <button key={t} type="button" onClick={() => setAttendance(t)}
                          className="flex-1 py-2 rounded-xl text-xs border flex items-center justify-center gap-2 transition-all"
                          style={{ backgroundColor: active ? theme.accent : "white", borderColor: active ? theme.accent : "#E5E7EB", color: active ? "white" : theme.textMain }}>
                          {t === "live" ? <><Users size={14}/> 已參加Zoom</> : <><PlayCircle size={14}/> 已觀看錄影</>}
                        </button>
                      );
                    })}
                  </div>
                  {youtubeEmbedUrl ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-black/5">
                      <iframe className="w-full h-full" src={youtubeEmbedUrl} title={`${course.title} YouTube`} frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <span className="text-xs text-gray-400">YouTube 連結尚未上載</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════
// ██  Main App
// ══════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]                     = useState(null);
  const [authError, setAuthError]           = useState("");
  const [activeTab, setActiveTab]           = useState("courses");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [progressByUser, setProgressByUser] = useState({});
  const [quizCompletion, setQuizCompletion] = useState({});
  const [posts, setPosts]                   = useState([]);
  const [composerOpen, setComposerOpen]     = useState(false);
  const [composerText, setComposerText]     = useState("");
  const [composerError, setComposerError]   = useState("");
  const [composerBusy, setComposerBusy]     = useState(false);
  const [showBadgeAlert, setShowBadgeAlert] = useState(null);
  const [noteDraft, setNoteDraft]           = useState("");
  const [noteSaved, setNoteSaved]           = useState(false);

  // ── 1. Session restore ──────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { if (alive) setUser(null); return; }
      const p = await fetchOrCreateProfile(session.user);
      if (alive) setUser(p);
    })();
    return () => { alive = false; };
  }, []);

  // ── 2. Auth handler ─────────────────────────────────────
  const handleAuth = async ({ mode, payload }) => {
    setAuthError("");
    const { name, email, password } = payload;
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) {
          if (error.message.includes("already registered")) throw new Error("此電郵已被註冊，請直接登入。");
          throw error;
        }
        // If no session (email confirmation on), try sign in immediately
        let authUser = data.session ? data.user : null;
        if (!authUser) {
          const { data: si, error: siErr } = await supabase.auth.signInWithPassword({ email, password });
          if (siErr) throw new Error("註冊成功！如需驗證電郵，請先到信箱確認後再登入。");
          authUser = si.user;
        }
        const profile = await fetchOrCreateProfile(authUser);
        if (!profile) throw new Error("無法建立使用者資料，請聯繫管理員。");
        setUser(profile); setActiveTab("courses");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login credentials")) throw new Error("電郵或密碼錯誤。");
          if (error.message.includes("Email not confirmed"))       throw new Error("電郵尚未驗證，請先到信箱確認。");
          throw new Error("登入失敗：" + error.message);
        }
        const profile = await fetchOrCreateProfile(data.user);
        if (!profile) throw new Error("無法載入使用者資料，請聯繫管理員。");
        setUser(profile); setActiveTab("courses");
      }
    } catch (e) { setAuthError(e.message || "操作失敗"); }
  };

  // ── 3. Load progress ───────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from("user_course_progress").select("*").eq("user_id", user.id);
      if (!alive) return;
      if (error) { console.error("Progress load:", error); return; }
      const map = {}; const qc = {};
      (data || []).forEach((r) => {
        map[r.course_id] = {
          chapters: r.read_chapters || [],
          quizScore: r.quiz_score,
          attendance: { type: r.attendance_type || null, link: r.attendance_link || "" },
        };
        if (r.quiz_score != null) qc[r.course_id] = true;
      });
      setProgressByUser(map); setQuizCompletion(qc);
    })();
    return () => { alive = false; };
  }, [user]);

  // ── 4. Load posts + likes ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const [postsRes, likesRes] = await Promise.all([
        supabase.from("community_posts")
          .select("id, content, created_at, likes_count, badge_course_id, app_users(id, name, note, avatar_url, avatar_color)")
          .order("created_at", { ascending: false }),
        supabase.from("post_likes").select("post_id").eq("user_id", user.id),
      ]);
      if (!alive) return;
      if (postsRes.error) { console.error("Posts load:", postsRes.error); return; }
      const likedIds = new Set((likesRes.data || []).map((l) => l.post_id));
      setPosts(normalizePosts(postsRes.data || [], likedIds));
    })();
    return () => { alive = false; };
  }, [user]);

  // ── 5. Note draft sync ─────────────────────────────────
  useEffect(() => { if (user) { setNoteDraft(user.note || ""); setNoteSaved(false); } }, [user?.note]);

  const currentProgress = useMemo(() => progressByUser || {}, [progressByUser]);

  const totalStats = useMemo(() => {
    let c = 0;
    COURSES.forEach((co) => { if (currentProgress[co.id] && isCompleteCourse(co.id, currentProgress[co.id])) c++; });
    return { completedCourses: c, badges: c };
  }, [currentProgress]);

  // ── Update profile ─────────────────────────────────────
  const updateProfile = async (patch) => {
    if (!user) return;
    const prev = { ...user };
    const opt  = { ...user, ...patch };
    setUser(opt);
    try {
      const { data, error } = await supabase.from("app_users")
        .update({ name: opt.name, note: opt.note, avatar_url: opt.avatarUrl })
        .eq("id", user.id).select().single();
      if (error || !data) { console.error("Profile update:", error); setUser(prev); return; }
      const updated = { id: data.id, name: data.name, note: data.note || "主恩滿溢", avatarColor: data.avatar_color || user.avatarColor, avatarUrl: data.avatar_url || null };
      setUser(updated);
      setPosts((p) => p.map((po) => po.userId === user.id ? { ...po, author: updated.name, note: updated.note, avatarColor: updated.avatarColor, avatarUrl: updated.avatarUrl } : po));
    } catch (e) { console.error(e); setUser(prev); }
  };

  // ── Avatar upload ──────────────────────────────────────
  const handleAvatarUpload = async (file) => {
    if (!user || !file) return;
    try {
      const blob = await compressImageToBlob(file);
      const fname = `${user.id}-${Date.now()}.jpg`;
      const { data: up, error: ue } = await supabase.storage.from("avatars").upload(fname, blob, { contentType: "image/jpeg", upsert: true });
      if (ue) { console.error("Upload:", ue); return; }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(up.path);
      updateProfile({ avatarUrl: publicUrl });
    } catch (e) { console.error(e); }
  };

  // ── Update progress ────────────────────────────────────
  const updateProgress = async (courseId, prog) => {
    if (!user) return;
    setProgressByUser((p) => ({ ...p, [courseId]: prog }));
    if (prog.quizScore != null) setQuizCompletion((p) => ({ ...p, [courseId]: true }));

    const course = COURSES.find((c) => c.id === courseId);
    const wasComplete = progressByUser[courseId] && isCompleteCourse(courseId, progressByUser[courseId]);
    const nowComplete = isCompleteCourse(courseId, prog);

    if (course && nowComplete && !wasComplete) {
      setShowBadgeAlert(course.title);
      // Auto-post badge announcement
      try {
        const { data: bp } = await supabase.from("community_posts")
          .insert([{ user_id: user.id, content: `剛剛完成《${course.title}》並解鎖徽章！`, badge_course_id: course.id }])
          .select("id, content, created_at, likes_count, badge_course_id, app_users(id, name, note, avatar_url, avatar_color)")
          .single();
        if (bp) setPosts((p) => [normalizePosts([bp])[0], ...p]);
      } catch (e) { console.error("Badge post:", e); }
    }

    try {
      const { error } = await supabase.from("user_course_progress").upsert({
        user_id: user.id,
        course_id: courseId,
        read_chapters: prog.chapters || [],
        quiz_score: prog.quizScore ?? null,
        attendance_type: prog.attendance?.type || null,
        attendance_link: prog.attendance?.link || "",
        is_completed: nowComplete,
      }, { onConflict: "user_id,course_id" });
      if (error) console.error("Progress save:", error);
    } catch (e) { console.error(e); }
  };

  // ── Create post ────────────────────────────────────────
  const handleCreatePost = async () => {
    const content = composerText.trim();
    if (!content) { setComposerError("請輸入內容。"); return; }
    if (!user) return;
    setComposerBusy(true); setComposerError("");
    const tmp = {
      id: `tmp-${Date.now()}`, userId: user.id, author: user.name, content,
      note: user.note || "", likes: 0, isLiked: false, time: formatPostDate(new Date()),
      createdAt: new Date().toISOString(), avatarColor: user.avatarColor, avatarUrl: user.avatarUrl, badge: null,
    };
    setPosts((p) => [tmp, ...p]); setComposerOpen(false); setComposerText("");
    try {
      const { data, error } = await supabase.from("community_posts")
        .insert([{ user_id: user.id, content }])
        .select("id, content, created_at, likes_count, badge_course_id, app_users(id, name, note, avatar_url, avatar_color)")
        .single();
      if (error || !data) { setPosts((p) => p.filter((x) => x.id !== tmp.id)); return; }
      setPosts((p) => [normalizePosts([data])[0], ...p.filter((x) => x.id !== tmp.id)]);
    } catch (e) { console.error(e); setPosts((p) => p.filter((x) => x.id !== tmp.id)); }
    finally { setComposerBusy(false); }
  };

  // ── Toggle like ────────────────────────────────────────
  const handleToggleLike = async (postId) => {
    if (!user || String(postId).startsWith("tmp-")) return;
    setPosts((p) => p.map((po) => po.id !== postId ? po : { ...po, isLiked: !po.isLiked, likes: Math.max(0, po.likes + (po.isLiked ? -1 : 1)) }));
    try {
      const { data, error } = await supabase.rpc("toggle_like", { p_post_id: postId });
      if (error) {
        console.error("Like:", error);
        setPosts((p) => p.map((po) => po.id !== postId ? po : { ...po, isLiked: !po.isLiked, likes: Math.max(0, po.likes + (po.isLiked ? -1 : 1)) }));
        return;
      }
      if (data) setPosts((p) => p.map((po) => po.id !== postId ? po : { ...po, isLiked: data.is_liked, likes: data.likes_count }));
    } catch (e) { console.error(e); }
  };

  // ── Logout ─────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProgressByUser({}); setQuizCompletion({}); setPosts([]); setActiveTab("courses");
  };

  // ── Not logged in ──────────────────────────────────────
  if (!user) return (
    <>
      <style>{`html,body{overscroll-behavior-y:none;overflow-x:hidden}`}</style>
      <AuthScreen onAuth={handleAuth} error={authError} />
    </>
  );

  // ══════════════════════════════════════════════════════
  //  RENDER TABS
  // ══════════════════════════════════════════════════════

  const renderCoursesTab = () => (
    <div className="pb-24">
      <div className="bg-white rounded-b-3xl shadow-md px-6 pt-6 pb-5 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-orange-700 overflow-hidden"
            style={{ backgroundColor: user.avatarColor || "#F4C7A2" }}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.name || "學")[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: theme.textMain }}>平安，{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{user.note || "主恩滿溢"}</span>
              <button type="button" onClick={() => setActiveTab("profile")} className="text-gray-400 hover:text-gray-600"><Edit3 size={12} /></button>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium" style={{ color: theme.textMain }}>
            <span>總課程進度</span><span>{totalStats.completedCourses} / {COURSES.length} 堂</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-700" style={{ width: `${(totalStats.completedCourses / COURSES.length) * 100}%`, backgroundColor: theme.accent }} />
          </div>
        </div>
      </div>
      <div className="px-4">
        <h3 className="text-sm font-bold mb-3 ml-1" style={{ color: theme.textMain }}>我的課程</h3>
        {COURSES.map((c) => (
          <CourseCard key={c.id} course={c} progress={currentProgress[c.id] || {}} quizCompleted={!!quizCompletion[c.id]}
            isExpanded={expandedCourseId === c.id} onToggleExpand={() => setExpandedCourseId(expandedCourseId === c.id ? null : c.id)}
            onUpdateProgress={updateProgress} />
        ))}
      </div>
    </div>
  );

  const renderCommunityTab = () => (
    <div className="pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>Prophetic Community</h2>
        <button type="button" onClick={() => { setComposerOpen(true); setComposerText(""); setComposerError(""); }}
          className="h-9 px-3 rounded-full text-[12px] font-semibold text-white shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5"
          style={{ backgroundColor: theme.accent }}><Plus size={14} />發佈貼文</button>
      </div>
      <div className="space-y-4">
        {posts.map((post) => {
          const isSelf = post.userId === user.id;
          const author = isSelf ? user.name : post.author;
          const note   = isSelf ? user.note : post.note;
          const avCol  = isSelf ? user.avatarColor : post.avatarColor;
          const avUrl  = isSelf ? user.avatarUrl : post.avatarUrl;
          return (
            <div key={post.id} className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 overflow-hidden" style={{ backgroundColor: avCol || "#F4C7A2" }}>
                    {avUrl ? <img src={avUrl} alt="" className="w-full h-full object-cover" /> : (author || "友")[0]}
                  </div>
                  {!!note && <div className="absolute -top-3 -right-2 z-10 bg-white border border-gray-200 text-[9px] px-1 py-0.5 rounded-full shadow-sm max-w-[80px] truncate scale-90 origin-bottom-left">{note}</div>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold" style={{ color: theme.textMain }}>{author}</span>
                    <span className="text-[10px] text-gray-400">{post.time}</span>
                  </div>
                  {post.content && <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.textMain }}>{post.content}</p>}
                  {post.badge && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                      <Award size={14} className="text-orange-500" /><span className="text-[11px] text-orange-800">剛剛解鎖了「{post.badge}」徽章！</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" onClick={() => handleToggleLike(post.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                      <Heart size={16} className={post.isLiked ? "text-red-500 fill-red-500" : "text-gray-300"} />
                      <span className="text-[11px] text-gray-500">{post.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {posts.length === 0 && <p className="text-center text-xs text-gray-400 mt-6">發佈一則貼文/取得徽章後，可看到社群內容~</p>}
      </div>

      <AnimatePresence>
        {composerOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => { if (!composerBusy) setComposerOpen(false); }}>
            <motion.div initial={{ y:24,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:24,opacity:0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: theme.textMain }}>發佈貼文</h3>
                <button type="button" className="p-2 rounded-full hover:bg-gray-100" onClick={() => { if (!composerBusy) setComposerOpen(false); }}>
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <textarea rows={4} className="w-full px-3 py-2 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
                placeholder="想分享什麼？" value={composerText} onChange={(e) => { setComposerText(e.target.value); setComposerError(""); }} disabled={composerBusy} />
              {composerError && <p className="mt-2 text-xs text-red-500">{composerError}</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" className="flex-1 h-10 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  onClick={() => { if (!composerBusy) setComposerOpen(false); }}>取消</button>
                <button type="button" disabled={composerBusy}
                  className="flex-1 h-10 rounded-full text-sm font-semibold text-white shadow-md active:scale-95 transition-all disabled:opacity-60"
                  style={{ backgroundColor: theme.accent }} onClick={handleCreatePost}>發佈</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderProfileTab = () => (
    <div className="pb-24 px-4 pt-6">
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-orange-700 shadow-inner overflow-hidden"
          style={{ backgroundColor: user.avatarColor || "#F4C7A2" }}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.name || "學")[0]}
        </div>
        <h2 className="mt-4 text-2xl font-bold" style={{ color: theme.textMain }}>{user.name}</h2>
        <p className="text-xs text-gray-500">2026 先知性群體 · 小先知書速覽</p>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-4 mb-6">
        <h3 className="text-sm font-bold mb-3" style={{ color: theme.textMain }}>個人檔案</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.textMain }}>姓名</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
              value={user.name} onChange={(e) => updateProfile({ name: e.target.value })} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs" style={{ color: theme.textMain }}>個人便簽（會顯示在頭像旁小氣泡）</label>
              {noteSaved && <span className="text-[11px] text-green-600">已儲存</span>}
            </div>
            <textarea rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
              value={noteDraft} onChange={(e) => { setNoteDraft(e.target.value); setNoteSaved(false); }} />
            <button type="button" className="mt-2 px-3 py-1.5 rounded-full border border-gray-300 text-[11px] text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
              onClick={() => { updateProfile({ note: noteDraft.trim() }); setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000); }}>
              分享
            </button>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.textMain }}>個人頭像（上載相片）</label>
            <input type="file" accept="image/*" className="w-full text-[11px]"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: theme.textMain }}><Award size={18} /> 我的徽章牆</h3>
        <div className="grid grid-cols-3 gap-y-6">
          {COURSES.map((c) => {
            const p = currentProgress[c.id];
            return <Badge key={c.id} title={c.title} unlocked={!!p && isCompleteCourse(c.id, p)} badgeKey={c.badgeKey} />;
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl shadow-md p-6 border border-orange-200">
        <h3 className="text-sm font-bold mb-2 text-orange-900">學習獎勵</h3>
        <p className="text-xs text-orange-800 mb-4">集齊 10 個徽章，可獲神秘禮物一份（每月合堂將結算派發該月實體徽章）。</p>
        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-orange-500" style={{ width: `${Math.min((totalStats.badges / 10) * 100, 100)}%` }} />
        </div>
        <div className="text-right text-[11px] text-orange-700 font-bold">{totalStats.badges} / 10</div>
      </div>

      <button type="button" onClick={logout} className="w-full mt-8 py-3 text-sm font-medium text-red-400 flex items-center justify-center gap-2">
        <LogOut size={16} /> 登出帳戶
      </button>
    </div>
  );

  // ── Main layout ────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: theme.bg, color: theme.textMain }}>
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative">
        <header className="px-4 pt-6 pb-3 flex items-center justify-between bg-white sticky top-0 z-20 shadow-md">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-orange-500">金巴崙長老會沙田堂</p>
            <h1 className="mt-1 text-base font-bold" style={{ color: theme.textMain }}>2026 先知性群體 —— 小先知書速覽</h1>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-orange-700 overflow-hidden"
            style={{ backgroundColor: user.avatarColor || "#F4C7A2" }}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.name || "學")[0]}
          </div>
        </header>

        {activeTab === "courses"   && renderCoursesTab()}
        {activeTab === "community" && renderCommunityTab()}
        {activeTab === "profile"   && renderProfileTab()}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center py-3 px-2 rounded-t-2xl shadow-lg backdrop-blur-md bg-opacity-95" style={{ backgroundColor: theme.navBg }}>
            {[
              { key:"courses",   icon:<Home size={22} color="white"/>,           label:"課程" },
              { key:"community", icon:<MessageCircle size={22} color="white"/>,  label:"社群" },
              { key:"profile",   icon:<User size={22} color="white"/>,           label:"個人" },
            ].map((t) => (
              <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === t.key ? "opacity-100 scale-110" : "opacity-60"}`}>
                <div className={`p-1.5 rounded-xl transition-all ${activeTab === t.key ? "bg-white/20" : ""}`}>{t.icon}</div>
                <span className="text-[10px] text-white font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Badge alert */}
      <AnimatePresence>
        {showBadgeAlert && (
          <motion.div initial={{ opacity:0,scale:0.6,y:40 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.6,y:40 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowBadgeAlert(null)}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <motion.div animate={{ rotate:360 }} transition={{ duration:20,repeat:Infinity,ease:"linear" }}
                className="absolute -top-12 -left-12 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-60" />
              <div className="relative mb-4">
  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-50 to-orange-100 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-200 overflow-hidden">
    {(() => {
      const course = COURSES.find((c) => c.title === showBadgeAlert);
      const src = course ? BADGE_IMAGE_PATHS[course.badgeKey] : null;
      return src
        ? <img src={src} alt={showBadgeAlert} className="w-20 h-20 object-contain" />
        : <Award size={60} className="text-white" />;
    })()}
  </div>
</div>
              <h3 className="text-xl font-bold mb-2 text-orange-900">完成解鎖！</h3>
              <p className="text-sm text-gray-600 mb-6">您已完成《{showBadgeAlert}》的所有學習內容。</p>
              <button type="button" onClick={() => setShowBadgeAlert(null)}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: theme.accent }}>收下這枚徽章</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
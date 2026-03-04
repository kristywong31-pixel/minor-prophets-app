import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Award,
  User,
  Users,
  Home,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Edit3,
  Plus,
  X,
  LogOut,
  MessageCircle,
  Lock,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
// 注意：這裡假設你有 bcryptjs，如果沒有，請在 package.json 安裝或移除相關加密邏輯
// import bcrypt from "bcryptjs"; 
// 為了讓這段程式碼能直接運行，我會暫時模擬 hash 功能，實際專案請用 bcryptjs

// === 模擬 bcrypt (若專案中有 bcryptjs 請自行替換) ===
const bcrypt = {
  hash: async (s) => s, // 暫時直接回傳原字串 (開發用)
  compare: async (s, h) => s === h, // 暫時直接比對 (開發用)
};

// === Design System ===
const theme = {
  bg: "#FFFFFF",
  cardBg: "#F8F1E5",
  textMain: "#3A2E2A",
  accent: "#C47A2C",
  navBg: "#2F3E46",
  success: "#7A9E7E",
  gray: "#9CA3AF",
};

const AVATAR_COLORS = ["#F4C7A2", "#F1B0AE", "#E8CE97", "#C9D8A7", "#B4C8E0"];

// === 課程資料 ===
const COURSES = [
  {
    id: 1,
    date: "2026.03.05",
    title: "何西阿書",
    speaker: "蕭楚剛牧師",
    chapters: 14,
    badgeKey: "hosea",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdjaoKXvSscCkUv8yQ-b4XsEAzyuQqtp3qoANB1TP4V9DKf3w/viewform?usp=send_form",
    youtubeLink: "",
  },
  {
    id: 2,
    date: "2026.04.02",
    title: "約珥書",
    speaker: "梁浩威傳道",
    chapters: 3,
    badgeKey: "joel",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeBMksdl9SIpXxFxHYiyD3Rsg9q_my42S9AeWzCSw1oS3F91Q/closedform",
    youtubeLink: "",
  },
  {
    id: 3,
    date: "2026.05.07",
    title: "阿摩斯書",
    speaker: "林凱倫傳道",
    chapters: 9,
    badgeKey: "amos",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdwGSlCBhG1wzj7sMhfVz_NjXC5157bd7f3MTMVI_OnnVu-1g/closedform",
    youtubeLink: "",
  },
  {
    id: 4,
    date: "2026.06.04",
    title: "約拿書",
    speaker: "林素華傳道",
    chapters: 4,
    badgeKey: "jonah",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfmJ2HxVbtyG1C8gzKiNHx_sHuHPlH3xNHMI0DpDAd3R8oitw/closedform",
    youtubeLink: "",
  },
  {
    id: 5,
    date: "2026.07.02",
    title: "彌迦書",
    speaker: "徐天睿弟兄",
    chapters: 7,
    badgeKey: "micah",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdGtw2tbu7JtuKVe5kvWx4x-o1B7VOy0o8Xlwn5-S90GaboSQ/closedform",
    youtubeLink: "",
  },
  {
    id: 6,
    date: "2026.08.06",
    title: "那鴻書",
    speaker: "冼浚瑋弟兄",
    chapters: 3,
    badgeKey: "nahum",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeuDay0xYrMkrvQTbt71R2MnRmJV0EuANxy8FIPqG2yepBpDQ/closedform",
    youtubeLink: "",
  },
  {
    id: 7,
    date: "2026.09.03",
    title: "哈巴谷書",
    speaker: "梁浩威傳道",
    chapters: 3,
    badgeKey: "habakkuk",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSes72P2yUiuGLv88ER9Ihl_9WxFh2m07Kzq5fBJ7yL6eNv9OA/closedform",
    youtubeLink: "",
  },
  {
    id: 8,
    date: "2026.10.08",
    title: "西番亞書",
    speaker: "林凱倫傳道",
    chapters: 3,
    badgeKey: "zephaniah",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdgeo78ClO7pRtT4uUtFD9G-_249DYKmsohzSJGvj4SnpIX6A/closedform",
    youtubeLink: "",
  },
  {
    id: 9,
    date: "2026.11.05",
    title: "哈該書",
    speaker: "林素華傳道",
    chapters: 2,
    badgeKey: "haggai",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeifBUeVBjcQglcA1QUCn8p1dBffjJQ0palMGZmpuPDH0R20A/closedform",
    youtubeLink: "",
  },
  {
    id: 10,
    date: "2026.12.03",
    title: "瑪拉基書",
    speaker: "蕭楚剛牧師",
    chapters: 4,
    badgeKey: "malachi",
    quizUrl: "https://docs.google.com/forms/d/e/1FAIpQLScPYHdSgxEJmrcCl2CdDod4nuaQ8tLfWwZ2HcYus9-G5xXZCQ/closedform",
    youtubeLink: "",
  },
];

const BADGE_IMAGE_PATHS = {
  hosea: "/badges/hosea.png",
  joel: "/badges/joel.png",
  amos: "/badges/amos.png",
  jonah: "/badges/jonah.png",
  micah: "/badges/micah.png",
  nahum: "/badges/nahum.png",
  habakkuk: "/badges/habakkuk.png",
  zephaniah: "/badges/zephaniah.png",
  haggai: "/badges/haggai.png",
  malachi: "/badges/malachi.png",
};

// === Helpers ===
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function toYouTubeEmbedUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (raw.includes("youtube.com/embed/") || raw.includes("youtube-nocookie.com/embed/"))
    return raw;

  const m = raw.match(/(?:youtu\.be\/|v=|\/shorts\/|\/live\/)([A-Za-z0-9_-]{6,})/);
  const id = m?.[1];
  if (!id) return "";
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

function formatPostDate(input) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

// Supabase community_posts + app_users → 前端用的結構
function normalizeCommunityPosts(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r) => {
    const createdAt = r.created_at || r.createdAt || new Date().toISOString();
    // 這裡改為讀取 app_users 關聯
    const u = r.app_users || r.user || {};
    return {
      id: r.id,
      author: u.name || "友",
      content: r.content || "",
      note: u.note || "",
      likes: r.likes_count ?? 0,
      isLiked: !!r.is_liked,
      time: formatPostDate(createdAt),
      createdAt,
      avatarColor: u.avatar_color || null,
      avatarUrl: u.avatar_url || null,
      badge: null,
    };
  });
}

function isCompleteCourse(courseId, progress) {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return false;
  const readingDone = (progress.chapters?.length || 0) === course.chapters;
  const quizDone = progress.quizScore !== undefined && progress.quizScore !== null;
  const attendDone =
    progress.attendance &&
    (progress.attendance.type === "live" || progress.attendance.type === "replay");
  return readingDone && quizDone && attendDone;
}

// 將上載圖片壓縮成 300x300 以內、JPEG 70% 的 Blob
function compressImageToBlob(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("請選擇圖片檔案。"));
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxSize = 300;
          let { width, height } = img;
          if (!width || !height) {
            return reject(new Error("無法讀取圖片尺寸。"));
          }

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("瀏覽器不支援圖片壓縮。"));
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("圖片壓縮失敗。"));
              }
              if (blob.size > 4 * 1024 * 1024) {
                return reject(new Error("圖片仍然過大，請選擇較小的圖片。"));
              }
              resolve(blob);
            },
            "image/jpeg",
            0.7
          );
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("圖片載入失敗，請重試。"));
      img.src = String(ev.target?.result || "");
    };
    reader.onerror = () => reject(new Error("圖片讀取失敗，請重試。"));
    reader.readAsDataURL(file);
  });
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

// === Auth 畫面 ===
function AuthScreen({ onAuth, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!name.trim()) {
      setLocalError("請輸入真實姓名。");
      return;
    }

    if (!password || password.length < 6) {
      if (isRegister) {
        setLocalError("密碼需至少 6 個字元。");
      } else {
        setLocalError("請輸入正確的密碼（至少 6 個字元）。");
      }
      return;
    }

    onAuth({
      mode: isRegister ? "register" : "login",
      payload: { name: name.trim(), password },
    });
  };

  const mergedError = localError || error;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: theme.bg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-3xl shadow-md p-8"
          style={{ backgroundColor: theme.cardBg }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-[0.2em]" style={{ color: theme.accent }}>
              2026 PROPHETIC COMMUNITY
            </p>
            <h1
              className="mt-3 text-2xl font-bold"
              style={{ color: theme.textMain }}
            >
              小先知書速覽
            </h1>
            <p className="mt-1 text-xs opacity-70" style={{ color: theme.textMain }}>
              金巴崙長老會沙田堂
            </p>
          </div>

          {/* Auth Toggle */}
          <div className="flex mb-6 bg-white/60 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setLocalError("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                !isRegister ? "bg-white shadow-md" : "opacity-60"
              }`}
              style={{ color: theme.textMain }}
            >
              已有帳號
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setLocalError("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                isRegister ? "bg-white shadow-md" : "opacity-60"
              }`}
              style={{ color: theme.textMain }}
            >
              建立新帳號
            </button>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-1 ml-1"
                style={{ color: theme.textMain }}
              >
                真實姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1 ml-1"
                style={{ color: theme.textMain }}
              >
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                placeholder="至少 6 個字元"
              />
            </div>

            {mergedError && (
              <p className="text-xs text-red-500 mt-1 ml-1">{mergedError}</p>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              style={{ backgroundColor: theme.accent }}
            >
              {isRegister ? "建立帳戶並開始課程" : "登入課程"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// === UI 子元件 ===
function Badge({ title, unlocked, badgeKey }) {
  const src = badgeKey ? BADGE_IMAGE_PATHS[badgeKey] : null;
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-md overflow-hidden transition-all"
        style={{
          backgroundColor: unlocked ? "#FEF3C7" : "#E5E7EB",
          borderColor: unlocked ? theme.accent : "#D1D5DB",
          opacity: unlocked ? 1 : 0.6,
        }}
      >
        {unlocked && src ? (
          <img src={src} alt={title} className="w-14 h-14 object-contain" />
        ) : (
          <Lock className="w-4 h-4" color={theme.gray} />
        )}
      </div>
      <span
        className="mt-2 text-xs font-medium text-center"
        style={{ color: theme.textMain }}
      >
        {title}
      </span>
    </div>
  );
}

function CourseCard({
  course,
  progress,
  isExpanded,
  onToggleExpand,
  onUpdateProgress,
  quizCompleted,
}) {
  const chaptersDone = progress?.chapters?.length || 0;
  const readingProgress = (chaptersDone / course.chapters) * 100;
  const isQuizDone = !!quizCompleted;
  const isAttendanceDone =
    progress?.attendance &&
    (progress.attendance.type === "live" || progress.attendance.type === "replay");

  const isComplete = readingProgress === 100 && isQuizDone && isAttendanceDone;
  const isStarted = chaptersDone > 0 || isQuizDone || isAttendanceDone;
  const youtubeEmbedUrl = toYouTubeEmbedUrl(course.youtubeLink);

  let statusColor = theme.gray;
  let statusIcon = <Circle size={18} />;
  if (isComplete) {
    statusColor = "#4ade80";
    statusIcon = <CheckCircle2 size={18} className="text-green-400" />;
  } else if (isStarted) {
    statusColor = theme.accent;
    statusIcon = (
      <div
        className="w-4 h-4 rounded-full border-[3px]"
        style={{ borderColor: theme.accent }}
      />
    );
  }

  const toggleChapter = (ch) => {
    const current = progress?.chapters || [];
    const exists = current.includes(ch);
    const next = exists ? current.filter((v) => v !== ch) : [...current, ch];
    onUpdateProgress(course.id, { ...progress, chapters: next });
  };

  const setAttendance = (type, link) => {
    onUpdateProgress(course.id, { ...progress, attendance: { type, link } });
  };

  const handleFinishQuiz = () => {
    if (isQuizDone) return;
    const newProgress = { ...progress, quizScore: 100 };
    onUpdateProgress(course.id, newProgress);
    alert("小測已標記完成。");
  };

  return (
    <motion.div
      layout
      className="mb-4 rounded-2xl overflow-hidden shadow-md"
      style={{ backgroundColor: theme.cardBg }}
    >
      {/* 卡片抬頭 */}
      <button
        type="button"
        className="w-full p-4 flex items-center justify-between text-left"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 flex items-center justify-center" style={{ color: statusColor }}>
            {statusIcon}
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: theme.textMain }}>
              {course.title}
            </h3>
            <p className="text-[11px] opacity-70" style={{ color: theme.textMain }}>
              {course.date} · {course.speaker}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} color={theme.textMain} />
        ) : (
          <ChevronDown size={18} color={theme.textMain} />
        )}
      </button>

      {/* 展開內容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/50"
          >
            <div className="p-4 space-y-6" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
              {/* 讀經區塊 */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                <div className="flex justify-between items-center mb-2">
                  <h4
                    className="text-xs font-semibold flex items-center gap-2"
                    style={{ color: theme.textMain }}
                  >
                    <BookOpen size={14} /> 讀經打卡
                  </h4>
                  <span className="text-[11px] font-semibold" style={{ color: theme.accent }}>
                    {Math.round(readingProgress)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${readingProgress}%`, backgroundColor: theme.accent }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: course.chapters }).map((_, idx) => {
                    const ch = idx + 1;
                    const checked = progress?.chapters?.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChapter(ch)}
                        className={`text-[11px] py-1 rounded-xl border transition-colors ${
                          checked
                            ? "text-white border-transparent"
                            : "bg-white text-gray-500 border-gray-200"
                        }`}
                        style={{ backgroundColor: checked ? theme.success : "white" }}
                      >
                        {ch}章
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 小測區塊 */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                <h4
                  className="text-xs font-semibold flex items-center gap-2 mb-2"
                  style={{ color: theme.textMain }}
                >
                  <Edit3 size={14} /> 課前小測
                </h4>
                {isQuizDone ? (
                  <button
                    type="button"
                    disabled
                    className="w-full h-9 rounded-full text-[12px] font-normal border bg-white text-gray-500 cursor-default"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    已完成小測
                  </button>
                ) : (
                  <div className="space-y-3">
                    {course.quizUrl ? (
                      <a
                        href={course.quizUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-9 rounded-full text-[12px] border bg-white transition-all"
                        style={{ borderColor: "#E5E7EB", color: theme.textMain }}
                      >
                        開始測驗
                      </a>
                    ) : (
                      <p className="text-[11px] text-gray-400">小測連結尚未設定</p>
                    )}
                    <button
                      type="button"
                      onClick={handleFinishQuiz}
                      className="w-full h-9 rounded-full text-[12px] font-semibold border shadow-sm active:scale-95 transition-all"
                      style={{
                        backgroundColor: "white",
                        borderColor: "#E5E7EB",
                        color: theme.textMain,
                      }}
                    >
                      已完成小測
                    </button>
                  </div>
                )}
              </div>

              {/* 出席區塊 */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                <h4
                  className="text-xs font-semibold flex items-center gap-2 mb-2"
                  style={{ color: theme.textMain }}
                >
                  <Users size={14} /> 出席紀錄
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAttendance("live", progress?.attendance?.link || "")}
                      className={`flex-1 py-2 rounded-xl text-xs border flex items-center justify-center gap-2 transition-all ${
                        progress?.attendance?.type === "live" ? "text-white" : "bg-white"
                      }`}
                      style={{
                        backgroundColor:
                          progress?.attendance?.type === "live" ? theme.accent : "white",
                        borderColor:
                          progress?.attendance?.type === "live" ? theme.accent : "#E5E7EB",
                        color:
                          progress?.attendance?.type === "live" ? "white" : theme.textMain,
                      }}
                    >
                      <Users size={14} /> 已參加Zoom
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendance("replay", progress?.attendance?.link || "")}
                      className={`flex-1 py-2 rounded-xl text-xs border flex items-center justify-center gap-2 transition-all ${
                        progress?.attendance?.type === "replay" ? "text-white" : "bg-white"
                      }`}
                      style={{
                        backgroundColor:
                          progress?.attendance?.type === "replay" ? theme.accent : "white",
                        borderColor:
                          progress?.attendance?.type === "replay" ? theme.accent : "#E5E7EB",
                        color:
                          progress?.attendance?.type === "replay" ? "white" : theme.textMain,
                      }}
                    >
                      <PlayCircle size={14} /> 已觀看錄影
                    </button>
                  </div>
                  {youtubeEmbedUrl ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-black/5">
                      <iframe
                        className="w-full h-full"
                        src={youtubeEmbedUrl}
                        title={`${course.title} YouTube`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
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

// === 主 App ===
export default function App() {
  const [user, setUser] = useState(null); // { id, name, note, avatarColor, avatarUrl }
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("courses");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [progressByUser, setProgressByUser] = useState({});
  const [quizCompletion, setQuizCompletion] = useState({});
  const [posts, setPosts] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerError, setComposerError] = useState("");
  const [composerBusy, setComposerBusy] = useState(false);
  const [showBadgeAlert, setShowBadgeAlert] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  // === 1. 從 Supabase session 載入 user + app_users ===
  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!authUser) {
        setUser(null);
        return;
      }

      // 改為查詢 app_users
      const { data: profile, error } = await supabase
        .from("app_users")
        .select("id, name, note, avatar_url, avatar_color, password_hash")
        .eq("id", authUser.id)
        .single();

      if (error || !profile) {
        console.error("[app_users/get] error:", error);
        setUser(null);
        return;
      }

      setUser({
        id: profile.id,
        name: profile.name,
        note: profile.note || "主恩滿溢",
        avatarColor: profile.avatar_color || randomAvatarColor(),
        avatarUrl: profile.avatar_url || null,
      });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // === 2. Auth：註冊 / 登入 ===
  const handleAuth = async ({ mode, payload }) => {
    setAuthError("");
    const name = (payload.name || "").trim();
    const password = (payload.password || "").trim();

    try {
      if (mode === "register") {
        if (!name || password.length < 6) {
          throw new Error("註冊密碼需至少 6 個字元。");
        }

        // 檢查是否已有同名 (改為 app_users)
        const { data: exists, error: existsErr } = await supabase
          .from("app_users")
          .select("id")
          .eq("name", name)
          .maybeSingle();
        if (existsErr) {
          console.error(existsErr);
        }
        if (exists) {
          throw new Error("此姓名已建立帳號，請改用登入或換一個稱呼。");
        }

        const { data: signUpRes, error: signUpErr } = await supabase.auth.signUp({
          email: `${name}@fake.local`,
          password,
        });
        if (signUpErr || !signUpRes.user) {
          console.error(signUpErr);
          throw new Error("註冊失敗，請稍後再試。");
        }

        const passwordHash = await hashPassword(password);

        // 插入到 app_users
        const { data: profile, error: profileErr } = await supabase
          .from("app_users")
          .insert([
            {
              id: signUpRes.user.id,
              name,
              note: "主恩滿溢",
              avatar_url: null,
              avatar_color: randomAvatarColor(),
              password_hash: passwordHash,
            },
          ])
          .select("*")
          .single();

        if (profileErr || !profile) {
          console.error(profileErr);
          throw new Error("建立個人資料失敗。");
        }

        setUser({
          id: profile.id,
          name: profile.name,
          note: profile.note || "主恩滿溢",
          avatarColor: profile.avatar_color || randomAvatarColor(),
          avatarUrl: profile.avatar_url || null,
        });
        setActiveTab("courses");
      } else {
        // login
        if (!name || !password) throw new Error("請輸入姓名與密碼。");

        // 查詢 app_users
        const { data: profile, error: profileErr } = await supabase
          .from("app_users")
          .select("id, name, note, avatar_url, avatar_color, password_hash")
          .eq("name", name)
          .single();

        if (profileErr || !profile) {
          throw new Error("找不到此帳號，請先建立新帳號");
        }

        const ok = await verifyPassword(password, profile.password_hash);
        if (!ok) throw new Error("密碼不正確");

        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: `${name}@fake.local`,
          password,
        });
        if (signInErr) {
          console.error(signInErr);
          throw new Error("登入失敗，請稍後再試。");
        }

        setUser({
          id: profile.id,
          name: profile.name,
          note: profile.note || "主恩滿溢",
          avatarColor: profile.avatar_color || randomAvatarColor(),
          avatarUrl: profile.avatar_url || null,
        });
        setActiveTab("courses");
      }
    } catch (e) {
      setAuthError(e.message || "登入/註冊失敗");
    }
  };

  // === 3. 讀取課程進度 (改為 user_course_progress) ===
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", user.id);

      if (!mounted) return;
      if (error) {
        console.error("[user_course_progress/get] error:", error);
        return;
      }

      const map = {};
      (data || []).forEach((row) => {
        map[row.course_id] = {
          chapters: row.chapters || [],
          quizScore:
            row.quiz_score === undefined || row.quiz_score === null
              ? undefined
              : row.quiz_score,
          attendance: row.attendance || {},
        };
      });
      setProgressByUser(map);

      const qc = {};
      Object.keys(map).forEach((cid) => {
        const cp = map[cid];
        if (cp && cp.quizScore !== undefined && cp.quizScore !== null) {
          qc[cid] = true;
        }
      });
      setQuizCompletion(qc);
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  // === 4. 讀取社群貼文 (關聯 app_users) ===
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select(
          `
          id,
          content,
          created_at,
          likes_count,
          app_users (
            id,
            name,
            note,
            avatar_url,
            avatar_color
          )
        `
        )
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        console.error("[community_posts/get] error:", error);
        return;
      }

      setPosts(normalizeCommunityPosts(data || []));
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  // === 5. 便簽草稿同步 ===
  useEffect(() => {
    if (!user) return;
    setNoteDraft(user.note || "");
    setNoteSaved(false);
  }, [user?.note]);

  const currentProgress = useMemo(() => {
    if (!user) return {};
    return progressByUser || {};
  }, [user, progressByUser]);

  const totalStats = useMemo(() => {
    if (!user) return { completedCourses: 0, badges: 0 };
    let completedCourses = 0;
    let badges = 0;
    COURSES.forEach((c) => {
      const p = currentProgress[c.id];
      if (!p) return;
      const readingDone = (p.chapters?.length || 0) === c.chapters;
      const quizDone = !!quizCompletion[c.id];
      const attendDone =
        p.attendance && (p.attendance.type === "live" || p.attendance.type === "replay");
      if (readingDone && quizDone && attendDone) {
        completedCourses++;
        badges++;
      }
    });
    return { completedCourses, badges };
  }, [currentProgress, quizCompletion, user]);

  // === 更新 Profile（Supabase: app_users）===
  const updateProfile = async (patch) => {
    if (!user) return;

    const optimistic = { ...user, ...patch };
    setUser(optimistic);

    try {
      const { data, error } = await supabase
        .from("app_users")
        .update({
          name: patch.name ?? user.name,
          note: patch.note ?? user.note,
          avatar_url: patch.avatarUrl ?? user.avatarUrl,
        })
        .eq("id", user.id)
        .select("*")
        .single();

      if (error || !data) {
        console.error("[app_users/update] error:", error);
        setUser(user);
        return;
      }

      const updated = {
        id: data.id,
        name: data.name,
        note: data.note || "主恩滿溢",
        avatarColor: data.avatar_color || user.avatarColor || randomAvatarColor(),
        avatarUrl: data.avatar_url || null,
      };
      setUser(updated);

      // 即時同步自己貼文的頭像與便簽
      setPosts((prev) =>
        (prev || []).map((p) =>
          p.author === user.name
            ? {
                ...p,
                author: updated.name,
                note: updated.note,
                avatarColor: updated.avatarColor,
                avatarUrl: updated.avatarUrl,
              }
            : p
        )
      );
    } catch (e) {
      console.error(e);
      setUser(user);
    }
  };

  // === 頭像上載 → 壓縮 → Supabase Storage → app_users ===
  const handleAvatarUpload = async (file) => {
    if (!user || !file) return;
    try {
      const blob = await compressImageToBlob(file);
      const fileName = `${user.id}-${Date.now()}.jpg`;

      const { data: uploadRes, error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });

      if (uploadErr || !uploadRes) {
        console.error("[storage/upload] error:", uploadErr);
        alert("頭像上載失敗，請稍後再試。");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(uploadRes.path);

      const { data: profile, error: profileErr } = await supabase
        .from("app_users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)
        .select("*")
        .single();

      if (profileErr || !profile) {
        console.error("[app_users/update avatar] error:", profileErr);
        alert("頭像儲存失敗，請稍後再試。");
        return;
      }

      const updated = {
        id: profile.id,
        name: profile.name,
        note: profile.note || "主恩滿溢",
        avatarColor: profile.avatar_color || user.avatarColor || randomAvatarColor(),
        avatarUrl: profile.avatar_url || null,
      };
      setUser(updated);

      setPosts((prev) =>
        (prev || []).map((p) =>
          p.author === user.name
            ? {
                ...p,
                avatarColor: updated.avatarColor,
                avatarUrl: updated.avatarUrl,
              }
            : p
        )
      );
    } catch (e) {
      console.error("[handleAvatarUpload]", e);
      alert("頭像上載失敗，請稍後再試。");
    }
  };

  // === 課程進度更新（寫入 Supabase + 徽章彈窗）===
  const updateProgress = async (courseId, courseProgress) => {
    if (!user) return;

    // 先更新前端狀態
    setProgressByUser((prev) => ({ ...prev, [courseId]: courseProgress }));
    if (courseProgress.quizScore !== undefined && courseProgress.quizScore !== null) {
      setQuizCompletion((prev) => ({ ...prev, [courseId]: true }));
    }

    // 徽章解鎖檢查
    const course = COURSES.find((c) => c.id === courseId);
    if (course) {
      const completedNow = isCompleteCourse(courseId, courseProgress);
      const prevProgress = progressByUser[courseId];
      const wasCompleted = prevProgress && isCompleteCourse(courseId, prevProgress);
      if (completedNow && !wasCompleted) {
        setShowBadgeAlert(course.title);
        // 寫入 user_badges（若有此表，需確認表名，暫不更動）
        try {
          await supabase
            .from("user_badges")
            .upsert(
              {
                user_id: user.id,
                badge_id: course.badgeKey,
              },
              { onConflict: "user_id,badge_id" }
            );
        } catch (e) {
          console.error("[user_badges/upsert]", e);
        }
      }
    }

    // 寫入 user_course_progress
    try {
      const { error } = await supabase.from("user_course_progress").upsert(
        {
          user_id: user.id,
          course_id: String(courseId),
          chapters: courseProgress.chapters || [],
          quiz_score:
            courseProgress.quizScore === undefined || courseProgress.quizScore === null
              ? null
              : courseProgress.quizScore,
          attendance: courseProgress.attendance || {},
          is_completed: isCompleteCourse(courseId, courseProgress),
        },
        { onConflict: "user_id,course_id" }
      );
      if (error) {
        console.error("[user_course_progress/upsert] error:", error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // === 發佈社群貼文 ===
  const handleCreatePost = async () => {
    const content = composerText.trim();
    if (!content) {
      setComposerError("請輸入內容。");
      return;
    }
    if (!user) return;

    setComposerBusy(true);
    setComposerError("");

    // 修正：確保樂觀更新時使用當前 user 的最新頭像與顏色
    const optimistic = {
      id: `tmp-${Date.now()}`,
      author: user.name,
      content,
      note: user.note || "",
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      time: formatPostDate(new Date()),
      avatarColor: user.avatarColor || "#F4C7A2",
      avatarUrl: user.avatarUrl || null,
      badge: null,
    };
    setPosts((prev) => [optimistic, ...prev]);
    setComposerOpen(false);
    setComposerText("");

    try {
      // 這裡關聯 app_users
      const { data, error } = await supabase
        .from("community_posts")
        .insert([{ user_id: user.id, content }])
        .select(
          `
          id,
          content,
          created_at,
          likes_count,
          app_users (
            id,
            name,
            note,
            avatar_url,
            avatar_color
          )
        `
        )
        .single();

      if (error || !data) {
        console.error("[community_posts/insert] error:", error);
        alert("發佈失敗，請稍後再試。");
        setComposerBusy(false);
        // 失敗時移除 optimistic post
        setPosts((prev) => prev.filter((p) => p.id !== optimistic.id));
        return;
      }

      const normalized = normalizeCommunityPosts([data])[0];
      setPosts((prev) => [normalized, ...prev.filter((p) => p.id !== optimistic.id)]);
    } catch (e) {
      console.error(e);
      alert("發佈失敗，請稍後再試。");
      setPosts((prev) => prev.filter((p) => p.id !== optimistic.id));
    } finally {
      setComposerBusy(false);
    }
  };

  // === 登出 ===
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setProgressByUser({});
      setPosts([]);
      setActiveTab("courses");
    }
  };

  // === 未登入：顯示 Auth ===
  if (!user) {
    return (
      <>
        <style>{`
          html, body {
            overscroll-behavior-y: none;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
          }
        `}</style>
        <AuthScreen onAuth={handleAuth} error={authError} />
      </>
    );
  }

  // === 已登入：各頁 Tab ===
  const renderCoursesTab = () => (
    <div className="pb-24">
      {/* Dashboard Header */}
      <div className="bg-white rounded-b-3xl shadow-md px-6 pt-6 pb-5 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-orange-700 overflow-hidden"
            style={{ backgroundColor: user.avatarColor || "#F4C7A2" }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name[0]
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: theme.textMain }}>
              平安，{user.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                {user.note || "主恩滿溢"}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* 總進度條 */}
        <div>
          <div
            className="flex justify-between text-xs mb-1 font-medium"
            style={{ color: theme.textMain }}
          >
            <span>總課程進度</span>
            <span>
              {totalStats.completedCourses} / {COURSES.length} 堂
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${(totalStats.completedCourses / COURSES.length) * 100}%`,
                backgroundColor: theme.accent,
              }}
            />
          </div>
        </div>
      </div>

      {/* 課程列表 */}
      <div className="px-4">
        <h3
          className="text-sm font-bold mb-3 ml-1"
          style={{ color: theme.textMain }}
        >
          我的課程
        </h3>
        {COURSES.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            progress={currentProgress[course.id] || {}}
            quizCompleted={!!quizCompletion[course.id]}
            isExpanded={expandedCourseId === course.id}
            onToggleExpand={() =>
              setExpandedCourseId(expandedCourseId === course.id ? null : course.id)
            }
            onUpdateProgress={updateProgress}
          />
        ))}
      </div>
    </div>
  );

  const renderCommunityTab = () => (
    <div className="pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>
          Prophetic Community
        </h2>
        <button
          type="button"
          onClick={() => {
            setComposerOpen(true);
            setComposerText("");
            setComposerError("");
          }}
          className="h-9 px-3 rounded-full text-[12px] font-semibold text-white shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus size={14} />
          發佈貼文
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => {
          const isSelf = (post.author || "") === (user.name || "");
          const effectiveAuthor = isSelf ? user.name : post.author;
          const effectiveNote = isSelf ? (user.note || "") : (post.note || "");
          const effectiveAvatarColor = isSelf
            ? user.avatarColor || post.avatarColor || "#F4C7A2"
            : post.avatarColor || "#F4C7A2";
          const effectiveAvatarUrl = isSelf ? user.avatarUrl || post.avatarUrl : post.avatarUrl;

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-md p-4"
            >
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 overflow-hidden"
                    style={{ backgroundColor: effectiveAvatarColor }}
                  >
                    {effectiveAvatarUrl ? (
                      <img
                        src={effectiveAvatarUrl}
                        alt={effectiveAuthor}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (effectiveAuthor || "友")?.[0] || "友"
                    )}
                  </div>
                  {/* 修正：氣泡縮小 (scale-75) 並上移 (-top-3) */}
                  {!!effectiveNote && (
                    <div className="absolute -top-3 -right-2 z-10 bg-white border border-gray-200 text-[9px] px-1 py-0.5 rounded-full shadow-sm max-w-[80px] truncate scale-90 origin-bottom-left">
                      {effectiveNote}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: theme.textMain }}
                    >
                      {effectiveAuthor}
                    </span>
                    <span className="text-[10px] text-gray-400">{post.time}</span>
                  </div>

                  {post.content && (
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.textMain }}>
                      {post.content}
                    </p>
                  )}

                  {post.badge && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                      <Award size={14} className="text-orange-500" />
                      <span className="text-[11px] text-orange-800">
                        剛剛解鎖了「{post.badge}」徽章！
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // 前端本地 like toggle（不連動 DB）
                        setPosts((prev) =>
                          prev.map((p) => {
                            if (p.id !== post.id) return p;
                            const nextLiked = !p.isLiked;
                            return {
                              ...p,
                              isLiked: nextLiked,
                              likes: Math.max(0, (p.likes || 0) + (nextLiked ? 1 : -1)),
                            };
                          })
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        size={16}
                        className={post.isLiked ? "text-red-500 fill-red-500" : "text-gray-300"}
                      />
                      <span className="text-[11px] text-gray-500">{post.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {posts.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            還沒有動態~
          </p>
        )}
      </div>

      {/* 發文 Modal */}
      <AnimatePresence>
        {composerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => {
              if (composerBusy) return;
              setComposerOpen(false);
            }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: theme.textMain }}>
                  發佈貼文
                </h3>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => {
                    if (composerBusy) return;
                    setComposerOpen(false);
                  }}
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
                placeholder="想分享什麼？"
                value={composerText}
                onChange={(e) => {
                  setComposerText(e.target.value);
                  setComposerError("");
                }}
                disabled={composerBusy}
              />
              {composerError && <p className="mt-2 text-xs text-red-500">{composerError}</p>}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 h-10 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    if (composerBusy) return;
                    setComposerOpen(false);
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={composerBusy}
                  className="flex-1 h-10 rounded-full text-sm font-semibold text-white shadow-md active:scale-95 transition-all disabled:opacity-60"
                  style={{ backgroundColor: theme.accent }}
                  onClick={handleCreatePost}
                >
                  發佈
                </button>
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
        <div
          className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-orange-700 shadow-inner overflow-hidden"
          style={{ backgroundColor: user.avatarColor || "#F4C7A2" }}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name[0]
          )}
        </div>
        <h2
          className="mt-4 text-2xl font-bold"
          style={{ color: theme.textMain }}
        >
          {user.name}
        </h2>
        <p className="text-xs text-gray-500">
          2026 先知性群體 · 小先知書速覽
        </p>
      </div>

      {/* 個人檔案卡片 */}
      <div className="bg-white rounded-3xl shadow-md p-4 mb-6">
        <h3
          className="text-sm font-bold mb-3"
          style={{ color: theme.textMain }}
        >
          個人檔案
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.textMain }}>
              姓名
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
              value={user.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs" style={{ color: theme.textMain }}>
                個人便簽（會顯示在頭像旁小氣泡）
              </label>
            </div>
            <textarea
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
              value={noteDraft}
              onChange={(e) => {
                setNoteDraft(e.target.value);
                setNoteSaved(false);
              }}
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                className="px-3 py-1.5 rounded-full border border-gray-300 text-[11px] text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                onClick={() => {
                  const value = (noteDraft || "").trim();
                  updateProfile({ note: value });
                  setNoteDraft(value);
                  setNoteSaved(true);
                  setTimeout(() => setNoteSaved(false), 2000);
                }}
              >
                分享 / 儲存
              </button>
              {noteSaved && (
                <span className="text-[11px] text-green-600">已更新個人便簽</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.textMain }}>
              個人頭像（上載相片）
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-[11px]"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleAvatarUpload(file);
              }}
            />
          </div>
        </div>
      </div>

      {/* 徽章牆 */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <h3
          className="text-sm font-bold mb-4 flex items-center gap-2"
          style={{ color: theme.textMain }}
        >
          <Award size={18} /> 我的徽章牆
        </h3>
        <div className="grid grid-cols-3 gap-y-6">
          {COURSES.map((c) => {
            const p = currentProgress[c.id];
            const unlocked = p && isCompleteCourse(c.id, p);
            return (
              <Badge
                key={c.id}
                title={c.title}
                unlocked={!!unlocked}
                badgeKey={c.badgeKey}
              />
            );
          })}
        </div>
      </div>

      {/* 獎勵進度 */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl shadow-md p-6 border border-orange-200">
        <h3 className="text-sm font-bold mb-2 text-orange-900">
          學習獎勵
        </h3>
        <p className="text-xs text-orange-800 mb-4">
          集齊 10 個徽章，可獲得教會精美紀念品一份（請向牧者或同工查詢）。
        </p>
        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-orange-500"
            style={{ width: `${Math.min((totalStats.badges / 10) * 100, 100)}%` }}
          />
        </div>
        <div className="text-right text-[11px] text-orange-700 font-bold">
          {totalStats.badges} / 10
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full mt-8 py-3 text-sm font-medium text-red-400 flex items-center justify-center gap-2"
      >
        <LogOut size={16} /> 登出帳戶
      </button>
    </div>
  );

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: theme.bg, color: theme.textMain }}
    >
      <style>{`
        html, body {
          overscroll-behavior-y: none;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative">
        {/* 頂部教會資訊 */}
        <header className="px-4 pt-6 pb-3 flex items-center justify-between bg-white sticky top-0 z-20 shadow-md">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-orange-500">
              金巴崙長老會沙田堂
            </p>
            <h1
              className="mt-1 text-base font-bold"
              style={{ color: theme.textMain }}
            >
              2026 先知性群體 —— 小先知書速覽
            </h1>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-orange-700 overflow-hidden"
            style={{ backgroundColor: user.avatarColor || "#F4C7A2" }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name[0]
            )}
          </div>
        </header>

        {/* 內容區 */}
        {activeTab === "courses" && renderCoursesTab()}
        {activeTab === "community" && renderCommunityTab()}
        {activeTab === "profile" && renderProfileTab()}
      </div>

      {/* 底部導航 */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto">
          <div
            className="flex justify-around items-center py-3 px-2 rounded-t-2xl shadow-lg backdrop-blur-md bg-opacity-95"
            style={{ backgroundColor: theme.navBg }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === "courses" ? "opacity-100 scale-110" : "opacity-60"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === "courses" ? "bg-white/20" : ""
                }`}
              >
                <Home size={22} color="white" />
              </div>
              <span className="text-[10px] text-white font-medium">課程</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("community")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === "community" ? "opacity-100 scale-110" : "opacity-60"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === "community" ? "bg-white/20" : ""
                }`}
              >
                <MessageCircle size={22} color="white" />
              </div>
              <span className="text-[10px] text-white font-medium">社群</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === "profile" ? "opacity-100 scale-110" : "opacity-60"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === "profile" ? "bg-white/20" : ""
                }`}
              >
                <User size={22} color="white" />
              </div>
              <span className="text-[10px] text-white font-medium">個人</span>
            </button>
          </div>
        </div>
      </div>

      {/* 徽章解鎖彈窗 */}
      <AnimatePresence>
        {showBadgeAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 40 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBadgeAlert(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-12 -left-12 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-60"
              />
              <div className="relative mb-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-100">
                  <Award size={60} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-orange-900">完成解鎖！</h3>
              <p className="text-sm text-gray-600 mb-6">
                您已完成《{showBadgeAlert}》的所有學習內容。
              </p>
              <button
                type="button"
                onClick={() => setShowBadgeAlert(null)}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: theme.accent }}
              >
                收下這枚徽章
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle,
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

function toYouTubeEmbedUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (raw.includes("youtube.com/embed/") || raw.includes("youtube-nocookie.com/embed/")) return raw;

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

function normalizeCommunityPosts(rawPosts) {
  const list = Array.isArray(rawPosts) ? rawPosts : [];
  return list.map((p) => {
    const createdAt = p.createdAt || p.created_at || p.created_at || new Date().toISOString();
    return {
      id: p.id,
      author: p.author || p.userName || "友",
      content: p.content || "",
      note: p.note || "",
      likes: typeof p.likes === "number" ? p.likes : 0,
      isLiked: !!(p.isLiked ?? p.liked),
      time: formatPostDate(createdAt),
      createdAt,
      avatarColor: p.avatarColor || null,
      avatarUrl: p.avatarUrl || null,
      badge: p.badge || null,
    };
  });
}

const AVATAR_COLORS = ["#F4C7A2", "#F1B0AE", "#E8CE97", "#C9D8A7", "#B4C8E0"];

const STORAGE = {
  profile: "mp_user_profile",
  learning: "app_learning_data",
  community: "mp_community_posts",
};

// 將上載圖片壓縮成 300x300 以內、JPEG 70% 的 Base64
function compressImage(file) {
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

          const quality = 0.7;
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

          // 簡單大小檢查（約略 < 4MB）
          const approxBytes = (compressedDataUrl.length * 3) / 4;
          if (approxBytes > 4 * 1024 * 1024) {
            return reject(new Error("圖片仍然過大，請選擇較小的圖片。"));
          }

          resolve(compressedDataUrl);
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

function computeEarnedBadgesFromProgress(progressByCourse) {
  const badges = [];
  COURSES.forEach((c) => {
    const p = progressByCourse?.[c.id];
    if (!p) return;
    const readingDone = (p.chapters?.length || 0) === c.chapters;
    const quizDone = p.quizScore !== undefined && p.quizScore !== null;
    const attendDone =
      p.attendance && (p.attendance.type === "live" || p.attendance.type === "replay");
    if (readingDone && quizDone && attendDone) {
      badges.push(c.badgeKey);
    }
  });
  return badges;
}

async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const apiError = (msg, status = 400) => {
    const err = new Error(msg);
    err.status = status;
    return Promise.reject(err);
  };

  if (typeof window === "undefined" || !window.localStorage) {
    return apiError("Local storage is not available.", 500);
  }

  const ls = window.localStorage;

  // --- 初始化 Mock Database ---
  const ensureArrayKey = (key) => {
    if (!ls.getItem(key)) {
      ls.setItem(key, JSON.stringify([]));
    }
  };
  ensureArrayKey("app_users");
  ensureArrayKey("app_posts");
  ensureArrayKey("app_progress");

  const readArray = (key) => {
    try {
      const raw = ls.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeArray = (key, value) => {
    try {
      ls.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  };

  const getSessionUser = () => {
    try {
      const raw = ls.getItem("current_user_session");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const setSessionUser = (user) => {
    try {
      ls.setItem("current_user_session", JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const clearSession = () => {
    try {
      ls.removeItem("current_user_session");
    } catch {
      // ignore
    }
  };

  const parseBody = () => {
    if (!options.body) return {};
    try {
      return JSON.parse(options.body);
    } catch {
      return {};
    }
  };

  // === Auth & Profile ===

  if (path === "/api/me") {
    const sessionUser = getSessionUser();
    if (!sessionUser) return apiError("未登入", 401);
    return Promise.resolve({ user: sessionUser });
  }

  if (path === "/api/auth/register" && method === "POST") {
    const body = parseBody();
    const name = (body.name || "").trim();
    const password = body.password || "";
    if (!name) return apiError("請輸入真實姓名。", 400);
    if (password.length < 6) return apiError("註冊密碼需至少 6 個字元。", 400);

    const users = readArray("app_users");
    if (users.some((u) => u.name === name)) {
      return apiError("此姓名已建立帳號，請改用登入或換一個稱呼。", 409);
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name,
      password,
      note: body.note || "主恩滿溢",
      avatarColor: body.avatarColor || null,
      avatarUrl: body.avatarUrl || null,
    };
    users.push(newUser);
    writeArray("app_users", users);
    const { password: _p, ...safeUser } = newUser;
    setSessionUser(safeUser);
    return Promise.resolve({ user: safeUser });
  }

  if (path === "/api/auth/login" && method === "POST") {
    const body = parseBody();
    const name = (body.name || "").trim();
    const password = (body.password || "").trim();

    const users = readArray("app_users");
    // Debug logging：顯示目前資料庫與輸入（密碼改用長度顯示）
    console.log("[auth/login] users from localStorage:", users);
    console.log("[auth/login] input:", {
      name,
      passwordLength: password.length,
    });

    if (!name || !password) return apiError("姓名或密碼不正確。", 401);

    const user = users.find((u) => u.name === name);
    if (!user) {
      return apiError("找不到此帳號，請先建立新帳號", 401);
    }

    if ((user.password || "").trim() !== password) {
      return apiError("密碼不正確", 401);
    }

    const { password: _p, ...safeUser } = user;
    setSessionUser(safeUser);
    return Promise.resolve({ user: safeUser });
  }

  if (path === "/api/auth/logout") {
    clearSession();
    return Promise.resolve({ ok: true });
  }

  if (path === "/api/profile/update" && method === "PATCH") {
    const sessionUser = getSessionUser();
    if (!sessionUser) return apiError("未登入", 401);
    const body = parseBody();
    const users = readArray("app_users");
    const idx = users.findIndex((u) => u.id === sessionUser.id);
    if (idx === -1) return apiError("找不到使用者。", 404);
    const updated = {
      ...users[idx],
      ...body,
    };
    users[idx] = updated;
    writeArray("app_users", users);
    const { password: _p, ...safeUser } = updated;
    setSessionUser(safeUser);
    return Promise.resolve({ user: safeUser });
  }

  // === Community Posts ===

  if ((path === "/api/community/posts" || path === "/api/community/list") && method === "GET") {
    const sessionUser = getSessionUser();
    if (!sessionUser) return apiError("未登入", 401);
    const users = readArray("app_users");
    const posts = readArray("app_posts");

    const joined = posts
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
      .map((p) => {
        const u = users.find((x) => x.id === p.userId);
        return {
          id: p.id,
          userName: u?.name || "友",
          note: u?.note || "",
          avatarColor: u?.avatarColor || null,
          avatarUrl: u?.avatarUrl || null,
          badge: null,
          content: p.content || "",
          createdAt: p.createdAt || new Date().toISOString(),
          liked: false,
        };
      });

    return Promise.resolve({ posts: joined });
  }

  if (path === "/api/community/post" && method === "POST") {
    const sessionUser = getSessionUser();
    if (!sessionUser) return apiError("未登入", 401);
    const body = parseBody();
    const content = (body.content || "").trim();
    if (!content) return apiError("內容不可為空", 400);

    const posts = readArray("app_posts");
    const newPost = {
      id: `p_${Date.now()}`,
      userId: sessionUser.id,
      content,
      createdAt: new Date().toISOString(),
    };
    posts.push(newPost);
    writeArray("app_posts", posts);
    return Promise.resolve({ id: newPost.id, post: newPost });
  }

  // === Course Progress ===

  if (path === "/api/course/progress" || path === "/api/progress/update") {
    if (method !== "PATCH") {
      return apiError("Method Not Allowed", 405);
    }
    const sessionUser = getSessionUser();
    if (!sessionUser) return apiError("未登入", 401);
    const body = parseBody();
    const courseId = body.courseId;
    if (!courseId) return apiError("courseId 不正確", 400);

    const progress = readArray("app_progress");
    const idx = progress.findIndex(
      (r) => r.userId === sessionUser.id && r.courseId === courseId
    );
    const record = {
      userId: sessionUser.id,
      courseId,
      chapters: body.chapters || [],
      quizScore:
        body.quizScore === undefined || body.quizScore === null
          ? null
          : body.quizScore,
      attendance: body.attendance || {},
    };
    if (idx === -1) progress.push(record);
    else progress[idx] = record;
    writeArray("app_progress", progress);
    return Promise.resolve({ ok: true });
  }

  if (path === "/api/progress/get" && method === "GET") {
    const sessionUser = getSessionUser();
    if (!sessionUser) return apiError("未登入", 401);
    const progress = readArray("app_progress");
    const mine = progress.filter((r) => r.userId === sessionUser.id);
    const map = {};
    for (const r of mine) {
      map[r.courseId] = {
        chapters: r.chapters || [],
        quizScore:
          r.quizScore === undefined || r.quizScore === null ? undefined : r.quizScore,
        attendance: r.attendance || {},
      };
    }
    return Promise.resolve({ progress: map });
  }

  // 其他 API 請求：安全回傳空物件
  return Promise.resolve({});
}

// === 資料設定 ===
const COURSES = [
  {
    id: 1,
    date: "2026.03.05",
    title: "何西阿書",
    speaker: "蕭楚剛牧師",
    chapters: 14,
    badgeKey: "hosea",
    quizUrl: "https://forms.gle/pcEMSJonaJKZCudg7", // 更新為您提供的連結
    youtubeLink: "",
  },
  {
    id: 2,
    date: "2026.04.02",
    title: "約珥書",
    speaker: "梁浩威傳道",
    chapters: 3,
    badgeKey: "joel",
    quizUrl: "https://forms.gle/K5WdHcv3Ub6DgDKJ7",
    youtubeLink: "",
  },
  {
    id: 3,
    date: "2026.05.07",
    title: "阿摩斯書",
    speaker: "林凱倫傳道",
    chapters: 9,
    badgeKey: "amos",
    quizUrl: "https://forms.gle/pyPVwXHUzMjmHjsw9",
    youtubeLink: "",
  },
  {
    id: 4,
    date: "2026.06.04",
    title: "約拿書",
    speaker: "林素華傳道",
    chapters: 4,
    badgeKey: "jonah",
    quizUrl: "https://forms.gle/9eqvNNaxKFYEVkyZ6",
    youtubeLink: "",
  },
  {
    id: 5,
    date: "2026.07.02",
    title: "彌迦書",
    speaker: "徐天睿弟兄",
    chapters: 7,
    badgeKey: "micah",
    quizUrl: "https://forms.gle/mKQhQeNFZvbx1tSQA",
    youtubeLink: "",
  },
  {
    id: 6,
    date: "2026.08.06",
    title: "那鴻書",
    speaker: "冼浚瑋弟兄",
    chapters: 3,
    badgeKey: "nahum",
    quizUrl: "https://forms.gle/4P4fMkKNMHfP9o4j7",
    youtubeLink: "",
  },
  {
    id: 7,
    date: "2026.09.03",
    title: "哈巴谷書",
    speaker: "梁浩威傳道",
    chapters: 3,
    badgeKey: "habakkuk",
    quizUrl: "https://forms.gle/mmQP3po4oTHG6pPdA",
    youtubeLink: "",
  },
  {
    id: 8,
    date: "2026.10.08",
    title: "西番亞書",
    speaker: "林凱倫傳道",
    chapters: 3,
    badgeKey: "zephaniah",
    quizUrl: "https://forms.gle/8mFrAwmjRi2dx4vH7",
    youtubeLink: "",
  },
  {
    id: 9,
    date: "2026.11.05",
    title: "哈該書",
    speaker: "林素華傳道",
    chapters: 2,
    badgeKey: "haggai",
    quizUrl: "https://forms.gle/KX1yh4vTM6CT2YdH6",
    youtubeLink: "",
  },
  {
    id: 10,
    date: "2026.12.03",
    title: "瑪拉基書",
    speaker: "蕭楚剛牧師",
    chapters: 4,
    badgeKey: "malachi",
    quizUrl: "https://forms.gle/ey7hSCsm6SjeviZ2A",
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

// === 小工具 ===
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// === Auth 畫面：以「姓名 + 密碼」為主 ===
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
    statusColor = "#4ade80"; // Tailwind text-green-400 類似色
    statusIcon = <CheckCircle2 size={18} className="text-green-400" />;
  } else if (isStarted) {
    statusColor = theme.accent;
    statusIcon = <div className="w-4 h-4 rounded-full border-[3px]" style={{ borderColor: theme.accent }} />;
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
    const newProgress = { ...progress, quizScore: 100 }; // 固定視為完成
    const maybePromise = onUpdateProgress(course.id, newProgress);
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise
        .then(() => {
          alert("小測已標記完成。");
        })
        .catch(() => {
          alert("標記失敗，請稍後再試。");
        });
    } else {
      alert("小測已標記完成。");
    }
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
  const [progressByUser, setProgressByUser] = useState({}); // { [courseId]: progress }
  const [quizCompletion, setQuizCompletion] = useState({}); // { [courseId]: true }
  const [posts, setPosts] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerError, setComposerError] = useState("");
  const [composerBusy, setComposerBusy] = useState(false);
  const [likeBursts, setLikeBursts] = useState({}); // { [postId]: number }
  const [showBadgeAlert, setShowBadgeAlert] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  // 讀取登入狀態（HttpOnly cookie）
  useEffect(() => {
    let mounted = true;
    apiFetch("/api/me")
      .then((r) => {
        if (!mounted) return;
        setUser(r.user);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 讀取本地 Profile（localStorage）
  useEffect(() => {
    if (!user) return;
    try {
      const raw = window.localStorage.getItem(STORAGE.profile);
      if (!raw) return;
      const all = JSON.parse(raw);
      const saved = all?.[user.id];
      if (!saved) return;
      // 以本地為優先（使用者最後一次修改）
      setUser((prev) => ({ ...prev, ...saved }));
      setNoteDraft(saved.note || "");
    } catch {
      // ignore
    }
  }, [user?.id]);

  // 當後端或本地 user.note 變更時，同步到草稿，但不觸發自動儲存
  useEffect(() => {
    if (!user) return;
    setNoteDraft(user.note || "");
    setNoteSaved(false);
  }, [user?.note]);

  // 讀取本地進度（localStorage）
  useEffect(() => {
    if (!user) return;
    try {
      const raw = window.localStorage.getItem(STORAGE.learning);
      if (!raw) return;
      const all = JSON.parse(raw);
      const saved = all?.[user.id];
      if (!saved || !saved.courses) return;
      const coursesProgress = saved.courses || {};
      setProgressByUser(coursesProgress);
      const qc = {};
      Object.keys(coursesProgress).forEach((cid) => {
        const cp = coursesProgress[cid];
        if (cp && cp.quizScore !== undefined && cp.quizScore !== null) {
          qc[cid] = true;
        }
      });
      setQuizCompletion(qc);
    } catch {
      // 忽略 localStorage 解析錯誤
    }
  }, [user]);

  // 登入後載入進度與社群
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([apiFetch("/api/progress/get"), apiFetch("/api/community/posts")])
      .then(([p, c]) => {
        if (!mounted) return;
        const progress = p.progress || {};
        setProgressByUser(progress);
        const qc = {};
        Object.keys(progress).forEach((cid) => {
          const cp = progress[cid];
          if (cp && cp.quizScore !== undefined && cp.quizScore !== null) {
            qc[cid] = true;
          }
        });
        setQuizCompletion(qc);

        // 合併本地自訂貼文與後端貼文
        let remote = normalizeCommunityPosts(c.posts || []);
        try {
          const rawLocal = window.localStorage.getItem(STORAGE.community);
          if (rawLocal) {
            const localAll = JSON.parse(rawLocal);
            const localForUser = localAll?.[user.id] || [];
            const byId = new Map(remote.map((p) => [p.id, p]));
            for (const lp of localForUser) {
              if (!byId.has(lp.id)) byId.set(lp.id, lp);
            }
            remote = Array.from(byId.values());
          }
        } catch {
          // ignore
        }
        setPosts(remote);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [user]);

  // 將社群貼文寫入 localStorage（只存自己建立的）
  useEffect(() => {
    if (!user) return;
    try {
      const mine = (posts || []).filter((p) => (p.author || "") === (user.name || ""));
      const raw = window.localStorage.getItem(STORAGE.community);
      const all = raw ? JSON.parse(raw) : {};
      all[user.id] = mine;
      window.localStorage.setItem(STORAGE.community, JSON.stringify(all));
    } catch {
      // ignore
    }
  }, [user, posts]);

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

  // 將進度與徽章寫入 localStorage
  useEffect(() => {
    if (!user) return;
    try {
      const raw = window.localStorage.getItem(STORAGE.learning);
      const all = raw ? JSON.parse(raw) : {};
      const badges = computeEarnedBadgesFromProgress(progressByUser);
      all[user.id] = {
        ...(all?.[user.id] || {}),
        courses: progressByUser,
        badges,
      };
      window.localStorage.setItem(STORAGE.learning, JSON.stringify(all));
    } catch {
      // 忽略 localStorage 寫入錯誤
    }
  }, [user, progressByUser]);

  // === Auth 處理（以姓名 + 密碼）===
  const handleAuth = ({ mode, payload }) => {
    setAuthError("");
    const { name, password } = payload;

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        name,
        password,
        note: "主恩滿溢",
        avatarColor: randomAvatarColor(),
        avatarUrl: null,
      }),
    })
      .then((r) => {
        setUser(r.user);
        setActiveTab("courses");
      })
      .catch((e) => setAuthError(e.message || "登入/註冊失敗"));
  };

  const updateProfile = (patch) => {
    if (!user) return;
    const optimistic = { ...user, ...patch };
    setUser(optimistic);
    // 讓社群動態中的「自己的頭像氣泡」即時反映最新個人資料
    setPosts((prev) =>
      (prev || []).map((p) => {
        if ((p.author || "") !== (user.name || "")) return p;
        return {
          ...p,
          author: optimistic.name,
          note: optimistic.note || "",
          avatarColor: optimistic.avatarColor || p.avatarColor,
          avatarUrl: optimistic.avatarUrl || p.avatarUrl,
        };
      })
    );
    apiFetch("/api/profile/update", {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
      .then((r) => {
        setUser(r.user);
        // 寫入 localStorage：Profile
        try {
          const raw = window.localStorage.getItem(STORAGE.profile);
          const all = raw ? JSON.parse(raw) : {};
          all[r.user.id] = {
            ...(all?.[r.user.id] || {}),
            name: r.user.name,
            note: r.user.note || "",
            avatarColor: r.user.avatarColor || null,
            avatarUrl: r.user.avatarUrl || null,
          };
          window.localStorage.setItem(STORAGE.profile, JSON.stringify(all));
        } catch {
          // ignore
        }
        setPosts((prev) =>
          (prev || []).map((p) => {
            if ((p.author || "") !== (user.name || "")) return p;
            return {
              ...p,
              author: r.user?.name || p.author,
              note: r.user?.note || "",
              avatarColor: r.user?.avatarColor || p.avatarColor,
              avatarUrl: r.user?.avatarUrl || p.avatarUrl,
            };
          })
        );
      })
      .catch(() => setUser(optimistic));
  };

  const updateProgress = (courseId, courseProgress) => {
    if (!user) return Promise.resolve();
    setProgressByUser((prev) => ({ ...prev, [courseId]: courseProgress }));
    if (courseProgress.quizScore !== undefined && courseProgress.quizScore !== null) {
      setQuizCompletion((prev) => ({ ...prev, [courseId]: true }));
    }
    // 檢查是否首次完成整門書卷
    const course = COURSES.find((c) => c.id === courseId);
    if (course) {
      const readingDone =
        (courseProgress.chapters?.length || 0) === course.chapters;
      const quizDone =
        courseProgress.quizScore !== undefined && courseProgress.quizScore !== null;
      const attendDone =
        courseProgress.attendance &&
        (courseProgress.attendance.type === "live" ||
          courseProgress.attendance.type === "replay");
      const completedNow = readingDone && quizDone && attendDone;
      const prevProgress = progressByUser[courseId];
      const prevReadingDone =
        prevProgress && (prevProgress.chapters?.length || 0) === course.chapters;
      const prevQuizDone =
        prevProgress &&
        prevProgress.quizScore !== undefined &&
        prevProgress.quizScore !== null;
      const prevAttendDone =
        prevProgress &&
        prevProgress.attendance &&
        (prevProgress.attendance.type === "live" ||
          prevProgress.attendance.type === "replay");
      const wasCompleted = prevReadingDone && prevQuizDone && prevAttendDone;
      if (completedNow && !wasCompleted) {
        setShowBadgeAlert(course.title);
      }
    }
    return apiFetch("/api/progress/update", {
      method: "PATCH",
      body: JSON.stringify({
        courseId,
        chapters: courseProgress.chapters || [],
        quizScore: courseProgress.quizScore,
        attendance: courseProgress.attendance || {},
      }),
      })
      .then(() => null)
      .catch(() => {});
  };

  const logout = () => {
    apiFetch("/api/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        setUser(null);
        setProgressByUser({});
        setPosts([]);
        setActiveTab("courses");
      });
  };

  // === 未登入：顯示 Auth 畫面 ===
  if (!user) {
    return (
      <>
        {/* 全域 CSS 鎖定：防止下拉刷新導致登出 */}
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

  // === 已登入：主介面 ===
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

      {/* Threads 風格動態：卡片式排版 */}
      <div className="space-y-4">
        {posts.map((post) => {
          const isSelf = (post.author || "") === (user.name || "");
          const effectiveAuthor = isSelf ? user.name : post.author;
          const effectiveNote = isSelf ? (user.note || "") : (post.note || "");
          const effectiveAvatarColor = isSelf
            ? user.avatarColor || post.avatarColor || "#F4C7A2"
            : post.avatarColor || "#F4C7A2";

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-md p-4"
            >
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-gray-700"
                    style={{ backgroundColor: effectiveAvatarColor }}
                  >
                    {(effectiveAuthor || "友")?.[0] || "友"}
                  </div>
                  {!!effectiveNote && (
                    <div className="absolute -top-1 -right-1 z-10 bg-white border border-gray-200 text-[10px] px-1.5 py-0.5 rounded-full shadow-sm max-w-[90px] truncate">
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
                        let didLike = false;
                        setPosts((prev) =>
                          prev.map((p) => {
                            if (p.id !== post.id) return p;
                            const nextLiked = !p.isLiked;
                            didLike = nextLiked;
                            return {
                              ...p,
                              isLiked: nextLiked,
                              likes: Math.max(0, (p.likes || 0) + (nextLiked ? 1 : -1)),
                            };
                          })
                        );
                        if (didLike) {
                          setLikeBursts((prev) => ({
                            ...prev,
                            [post.id]: (prev[post.id] || 0) + 1,
                          }));
                        }
                        apiFetch("/api/community/like", {
                          method: "POST",
                          body: JSON.stringify({ postId: post.id }),
                        })
                          .then((r) => {
                            setPosts((prev) =>
                              prev.map((p) => {
                                if (p.id !== post.id) return p;
                                if (p.isLiked === !!r.liked) return p;
                                return {
                                  ...p,
                                  isLiked: !!r.liked,
                                  likes: Math.max(0, (p.likes || 0) + (r.liked ? 1 : -1)),
                                };
                              })
                            );
                          })
                          .catch(() => {});
                      }}
                      className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        size={16}
                        className={post.isLiked ? "text-red-500 fill-red-500" : "text-gray-300"}
                      />
                      <span className="text-[11px] text-gray-500">{post.likes || 0}</span>
                      {likeBursts[post.id] ? (
                        <motion.span
                          key={`${post.id}-${likeBursts[post.id]}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: [0, 1, 0], y: [6, -6, -14] }}
                          transition={{ duration: 0.8 }}
                          className="absolute -top-2 left-6 text-[10px] font-bold text-red-500 pointer-events-none"
                        >
                          +1
                        </motion.span>
                      ) : null}
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
                  onClick={() => {
                    const content = composerText.trim();
                    if (!content) {
                      setComposerError("請輸入內容。");
                      return;
                    }
                    setComposerBusy(true);
                    setComposerError("");

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

                    apiFetch("/api/community/post", {
                      method: "POST",
                      body: JSON.stringify({ content }),
                    })
                      .then(() => apiFetch("/api/community/posts"))
                      .then((c) => setPosts(normalizeCommunityPosts(c.posts || [])))
                      .catch(() => {
                        alert("發佈失敗，請稍後再試。");
                      })
                      .finally(() => setComposerBusy(false));
                  }}
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
                compressImage(file)
                  .then((dataUrl) => {
                    updateProfile({ avatarUrl: dataUrl });
                  })
                  .catch((err) => {
                    alert(err.message || "圖片壓縮失敗，請選擇較小的圖片重試。");
                  });
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
            const unlocked =
              p &&
              (p.chapters?.length || 0) === c.chapters &&
              p.quizScore !== undefined &&
              p.attendance &&
              (p.attendance.type === "live" || p.attendance.type === "replay");
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
          集齊 10 個徽章，可獲得神秘禮物一份！
          （每月合堂，同工派發該月實體徽章）
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
      {/* 全域 CSS 鎖定：防止下拉刷新導致登出 */}
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

      {/* 底部導航（深藍灰 + blur + 明顯選中狀態） */}
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
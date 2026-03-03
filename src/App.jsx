import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle,
  Circle,
  Award,
  User,
  Users,
  Home,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Video,
  Edit3,
  LogOut,
  MessageCircle,
  Lock,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QUIZ_BANK } from "./quizData";

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

const STORAGE = {
  users: "pcmp_users_v2_users",
  session: "pcmp_users_v2_session",
  progress: "pcmp_users_v2_progress",
  posts: "pcmp_users_v2_posts",
};

async function apiFetch(path, options) {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || "發生錯誤，請稍後再試。";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
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
    quizUrl: "https://forms.gle/ar2hQDh5xTYULqhS8",
  },
  {
    id: 2,
    date: "2026.04.02",
    title: "約珥書",
    speaker: "梁浩威傳道",
    chapters: 3,
    badgeKey: "joel",
    quizUrl: "https://docs.google.com/forms/d/placeholder-joel",
  },
  {
    id: 3,
    date: "2026.05.07",
    title: "阿摩斯書",
    speaker: "林凱倫傳道",
    chapters: 9,
    badgeKey: "amos",
    quizUrl: "https://docs.google.com/forms/d/placeholder-amos",
  },
  {
    id: 4,
    date: "2026.06.04",
    title: "約拿書",
    speaker: "林素華傳道",
    chapters: 4,
    badgeKey: "jonah",
    quizUrl: "https://docs.google.com/forms/d/placeholder-jonah",
  },
  {
    id: 5,
    date: "2026.07.02",
    title: "彌迦書",
    speaker: "徐天睿弟兄",
    chapters: 7,
    badgeKey: "micah",
    quizUrl: "https://docs.google.com/forms/d/placeholder-micah",
  },
  {
    id: 6,
    date: "2026.08.06",
    title: "那鴻書",
    speaker: "冼浚瑋弟兄",
    chapters: 3,
    badgeKey: "nahum",
    quizUrl: "https://docs.google.com/forms/d/placeholder-nahum",
  },
  {
    id: 7,
    date: "2026.09.03",
    title: "哈巴谷書",
    speaker: "梁浩威傳道",
    chapters: 3,
    badgeKey: "habakkuk",
    quizUrl: "https://docs.google.com/forms/d/placeholder-habakkuk",
  },
  {
    id: 8,
    date: "2026.10.08",
    title: "西番亞書",
    speaker: "林凱倫傳道",
    chapters: 3,
    badgeKey: "zephaniah",
    quizUrl: "https://docs.google.com/forms/d/placeholder-zephaniah",
  },
  {
    id: 9,
    date: "2026.11.05",
    title: "哈該書",
    speaker: "林素華傳道",
    chapters: 2,
    badgeKey: "haggai",
    quizUrl: "https://docs.google.com/forms/d/placeholder-haggai",
  },
  {
    id: 10,
    date: "2026.12.03",
    title: "瑪拉基書",
    speaker: "蕭楚剛牧師",
    chapters: 4,
    badgeKey: "malachi",
    quizUrl: "https://docs.google.com/forms/d/placeholder-malachi",
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

const INITIAL_POSTS = [
  {
    id: 101,
    userName: "Sarah",
    note: "期待復興！",
    badge: "何西阿書",
    time: "2 小時前",
    avatarColor: "#F4C7A2",
  },
  {
    id: 102,
    userName: "John",
    note: "主是信實的。",
    badge: "約珥書",
    time: "5 小時前",
    avatarColor: "#B4C8E0",
  },
];

// === 小工具 ===
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// === Auth 畫面：以「姓名 + 密碼」為主 ===
function AuthScreen({ onAuth, error }) {
  const [isRegister, setIsRegister] = useState(true);
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

  let statusColor = theme.gray;
  let statusIcon = <Circle size={18} />;
  if (isComplete) {
    statusColor = theme.success;
    statusIcon = <CheckCircle size={18} className="text-white fill-current" />;
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
                  <div className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
                    <span className="text-xs text-green-800">已完成小測</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.quizUrl ? (
                      <a
                        href={course.quizUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-9 rounded-full text-[12px] border bg-white border-gray-300 text-coffee hover:border-orange-300 transition-colors"
                      >
                        開始測驗
                      </a>
                    ) : (
                      <p className="text-[11px] text-gray-400">小測連結尚未設定</p>
                    )}
                    <button
                      type="button"
                      onClick={handleFinishQuiz}
                      className="w-full h-9 rounded-full bg-accent-bread text-white text-[12px] font-semibold shadow-md active:scale-95 transition-transform"
                    >
                      完成小測
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
                      <Users size={14} /> 參加直播
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
                      <PlayCircle size={14} /> 觀看錄影
                    </button>
                  </div>
                  <div className="relative">
                    <Video size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder=" YouTube 連結尚未上載"
                      className="w-full pl-10 p-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      value={progress?.attendance?.link || ""}
                      onChange={(e) =>
                        setAttendance(progress?.attendance?.type || "live", e.target.value)
                      }
                    />
                  </div>
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
  const [likedPosts, setLikedPosts] = useState({}); // { [postId]: true }
  const [showBadgeAlert, setShowBadgeAlert] = useState(null);

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

  // 登入後載入進度與社群
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([apiFetch("/api/progress/get"), apiFetch("/api/community/list")])
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
        setPosts(c.posts || []);
        const liked = {};
        for (const post of c.posts || []) liked[post.id] = !!post.liked;
        setLikedPosts(liked);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [user]);

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
    apiFetch("/api/profile/update", {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
      .then((r) => setUser(r.user))
      .catch(() => setUser(optimistic));
  };

  const updateProgress = (courseId, courseProgress) => {
    if (!user) return Promise.resolve();
    setProgressByUser((prev) => ({ ...prev, [courseId]: courseProgress }));
    if (courseProgress.quizScore !== undefined && courseProgress.quizScore !== null) {
      setQuizCompletion((prev) => ({ ...prev, [courseId]: true }));
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
      .then((r) => {
        if (r.badgeUnlocked) {
          const course = COURSES.find((c) => c.id === courseId);
          if (course) setShowBadgeAlert(course.title);
          return apiFetch("/api/community/list").then((c) => {
            setPosts(c.posts || []);
            const liked = {};
            for (const post of c.posts || []) liked[post.id] = !!post.liked;
            setLikedPosts(liked);
          });
        }
        return null;
      })
      .catch(() => {});
  };

  const logout = () => {
    apiFetch("/api/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        setUser(null);
        setProgressByUser({});
        setPosts([]);
        setLikedPosts({});
        setActiveTab("courses");
      });
  };

  // === 未登入：顯示 Auth 畫面 ===
  if (!user) {
    return <AuthScreen onAuth={handleAuth} error={authError} />;
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
      <h2
        className="text-xl font-bold mb-5"
        style={{ color: theme.textMain }}
      >
        先知性群體 · Threads
      </h2>

      {/* 自己的便簽輸入 */}
      <div
        className="bg-white rounded-2xl shadow-md p-4 flex gap-3 mb-6"
      >
        <div
          className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-orange-700 ${
            user.avatarColor || "bg-orange-100"
          }`}
        >
          {user.name[0]}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="分享今天的心情或領受…（會出現在你的頭像便簽）"
            className="w-full bg-transparent text-sm focus:outline-none"
            value={user.note || ""}
            onChange={(e) => updateProfile({ note: e.target.value })}
          />
        </div>
      </div>

      {/* Threads 風格動態 */}
      <div className="space-y-4">
        {posts.map((post) => {
          const liked = likedPosts[post.id];
          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-md p-4"
            >
              <div className="flex gap-3">
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-gray-700"
                    style={{ backgroundColor: post.avatarColor || "#F4C7A2" }}
                  >
                    {post.userName?.[0] || "友"}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-white border border-gray-200 text-[10px] px-1.5 py-0.5 rounded-full shadow-sm max-w-[90px] truncate">
                    {post.note}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: theme.textMain }}
                    >
                      {post.userName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{post.time}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLikedPosts((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }));
                          apiFetch("/api/community/like", {
                            method: "POST",
                            body: JSON.stringify({ postId: post.id }),
                          })
                            .then((r) =>
                              setLikedPosts((prev) => ({ ...prev, [post.id]: !!r.liked }))
                            )
                            .catch(() => {});
                        }}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Heart
                          size={14}
                          className={
                            liked ? "text-accent-bread fill-accent-bread" : "text-gray-300"
                          }
                        />
                      </button>
                    </div>
                  </div>
                  {post.badge && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                      <Award size={14} className="text-orange-500" />
                      <span className="text-[11px] text-orange-800">
                        剛剛解鎖了「{post.badge}」徽章！
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {posts.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            還沒有動態，完成一堂課來成為第一位分享的人吧！
          </p>
        )}
      </div>
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
              <button
                type="button"
                className="text-[11px] px-2 py-1 rounded-full border border-gray-300 text-gray-500 hover:border-orange-300 hover:text-orange-600 transition-colors"
                onClick={() => {
                  const content = (user.note || "").trim();
                  if (!content) return;
                  apiFetch("/api/community/post", {
                    method: "POST",
                    body: JSON.stringify({ content }),
                  })
                    .then(() => apiFetch("/api/community/list"))
                    .then((c) => {
                      setPosts(c.posts || []);
                      const liked = {};
                      for (const post of c.posts || []) liked[post.id] = !!post.liked;
                      setLikedPosts(liked);
                      setActiveTab("community");
                    })
                    .catch(() => {});
                }}
              >
                分享
              </button>
            </div>
            <textarea
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
              value={user.note || ""}
              onChange={(e) => updateProfile({ note: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.textMain }}>
              個人大頭照（上載相片）
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-[11px]"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const url = ev.target?.result;
                  if (typeof url === "string") {
                    updateProfile({ avatarUrl: url });
                  }
                };
                reader.readAsDataURL(file);
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
          集齊 10 個徽章，可獲得神秘禮物一份！（每月合堂，同工派發該月實體徽章）
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


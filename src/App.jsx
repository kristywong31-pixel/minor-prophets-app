import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BookOpen, CheckCircle, Lock, User, LogOut, ChevronRight, PlayCircle, FileText, Menu, X } from 'lucide-react';

// --- Supabase Client Setup ---
// ⚠️ 請確保你的 .env 檔案中有正確的變數，或者在這裡暫時填入你的 URL 和 Key 進行測試
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Constants ---
// 定義一個假的 Email 網域，用來將使用者的名字轉換成符合格式的 Email
const FAKE_EMAIL_DOMAIN = '@minor-prophets.local';

const BOOKS = [
  { id: 1, name: '何西阿書', chapter: 'Hosea', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_1', pdfUrl: '#' },
  { id: 2, name: '約珥書', chapter: 'Joel', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_2', pdfUrl: '#' },
  { id: 3, name: '阿摩司書', chapter: 'Amos', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_3', pdfUrl: '#' },
  { id: 4, name: '俄巴底亞書', chapter: 'Obadiah', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_4', pdfUrl: '#' },
  { id: 5, name: '約拿書', chapter: 'Jonah', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_5', pdfUrl: '#' },
  { id: 6, name: '彌迦書', chapter: 'Micah', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_6', pdfUrl: '#' },
  { id: 7, name: '那鴻書', chapter: 'Nahum', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_7', pdfUrl: '#' },
  { id: 8, name: '哈巴谷書', chapter: 'Habakkuk', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_8', pdfUrl: '#' },
  { id: 9, name: '西番雅書', chapter: 'Zephaniah', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_9', pdfUrl: '#' },
  { id: 10, name: '哈該書', chapter: 'Haggai', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_10', pdfUrl: '#' },
  { id: 11, name: '撒迦利亞書', chapter: 'Zechariah', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_11', pdfUrl: '#' },
  { id: 12, name: '瑪拉基書', chapter: 'Malachi', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_12', pdfUrl: '#' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('auth'); // 'auth', 'dashboard', 'course'
  const [currentBook, setCurrentBook] = useState(null);
  const [progress, setProgress] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 1. 初始化檢查登入狀態
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // 從 metadata 中讀取真實姓名
        const realName = session.user.user_metadata?.full_name || '學員';
        // 這裡可以選擇是否要將 name state 更新，或者只在 UI 顯示
        loadUserProgress(session.user.id);
        setView('dashboard');
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        loadUserProgress(session.user.id);
        setView('dashboard');
      } else {
        setUser(null);
        setView('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 載入進度
  const loadUserProgress = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('book_id, completed')
        .eq('user_id', userId);

      if (error) throw error;

      const progressMap = {};
      data.forEach(item => {
        progressMap[item.book_id] = item.completed;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // 3. 處理註冊/登入 (關鍵修改處)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // 簡單驗證
    if (!name.trim() || !password.trim()) {
      setAuthError('請輸入姓名和密碼');
      setAuthLoading(false);
      return;
    }

    // --- 關鍵邏輯：將中文名字轉換成 Email 格式 ---
    // 為了避免中文造成 Email 格式錯誤，我們可以進行編碼，或者簡單地拼接
    // 這裡直接拼接，但建議前端驗證一下名字不要包含特殊符號
    // 更好的做法是用 encodeURIComponent 或者 base64，但為了可讀性我們先直接拼
    // 注意：Supabase Email 允許 UTF-8 字符，所以 "黃紫晴@minor-prophets.local" 理論上是合法的
    // 但為了保險，我們只用它來做唯一識別符
    const fakeEmail = `${name}${FAKE_EMAIL_DOMAIN}`; 

    try {
      if (isLogin) {
        // --- 登入 ---
        const { error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: password,
        });
        if (error) throw error;
      } else {
        // --- 註冊 ---
        const { error } = await supabase.auth.signUp({
          email: fakeEmail,
          password: password,
          options: {
            data: {
              full_name: name, // 將真實姓名存在 metadata 中
            },
          },
        });
        if (error) throw error;
        
        // 註冊成功後自動登入 (Supabase 預設行為，除非開啟了 Email 確認)
        // 如果你的 Supabase 開啟了 "Confirm Email"，這裡會卡住。
        // 請務必去 Supabase Dashboard -> Authentication -> Providers -> Email -> 取消勾選 "Confirm email"
      }
    } catch (error) {
      console.error(error);
      if (error.message.includes('Invalid login credentials')) {
        setAuthError('名字或密碼錯誤');
      } else if (error.message.includes('User already registered')) {
        setAuthError('此名字已被註冊，請直接登入');
      } else if (error.message.includes('invalid format')) {
          setAuthError('名字格式不支援，請嘗試使用英文或數字');
      } else {
        setAuthError(error.message || '發生錯誤，請稍後再試');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('auth');
    setProgress({});
    setIsMenuOpen(false);
  };

  const updateProgress = async (bookId, isCompleted) => {
    if (!user) return;

    // Optimistic update
    setProgress(prev => ({ ...prev, [bookId]: isCompleted }));

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({ 
          user_id: user.id, 
          book_id: bookId, 
          completed: isCompleted,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, book_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating progress:', error);
      // Revert on error
      setProgress(prev => ({ ...prev, [bookId]: !isCompleted }));
    }
  };

  // --- Render Components ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B48248]"></div>
      </div>
    );
  }

  // 1. Auth View
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#F5F0E6] rounded-3xl shadow-xl p-8 border border-[#E6DCC8]">
          <div className="text-center mb-8">
            <h2 className="text-[#B48248] text-sm font-bold tracking-widest mb-2">2026 PROPHETIC COMMUNITY</h2>
            <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">小先知書速覽</h1>
            <p className="text-[#666] text-sm">金巴崙長老會沙田堂</p>
          </div>

          <div className="bg-white p-1 rounded-xl flex mb-8 shadow-inner">
            <button
              onClick={() => { setIsLogin(true); setAuthError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isLogin ? 'bg-white text-[#2C2C2C] shadow-md' : 'text-[#888] hover:bg-gray-50'
              }`}
            >
              已有帳號
            </button>
            <button
              onClick={() => { setIsLogin(false); setAuthError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                !isLogin ? 'bg-white text-[#2C2C2C] shadow-md' : 'text-[#888] hover:bg-gray-50'
              }`}
            >
              建立新帳號
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                真實姓名 (將作為登入帳號)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#B48248]" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-[#FEFCF5] text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B48248]/50 shadow-sm"
                  placeholder="例如：陳大文"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#B48248]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-[#FEFCF5] text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B48248]/50 shadow-sm"
                  placeholder="••••••"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start">
                <span className="mr-2">⚠️</span>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#B48248] hover:bg-[#9A6F3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B48248] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {authLoading ? '處理中...' : (isLogin ? '登入' : '建立帳戶並開始課程')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Main Dashboard & Course View
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / BOOKS.length) * 100);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C2C] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E6DCC8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView('dashboard')}>
              <BookOpen className="h-6 w-6 text-[#B48248] mr-2" />
              <span className="font-bold text-lg tracking-tight">小先知書速覽</span>
            </div>
            
            {/* Desktop User Info */}
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-[#666]">
                Hi, <span className="font-semibold text-[#B48248]">{user?.user_metadata?.full_name || name}</span>
              </span>
              <button onClick={handleLogout} className="text-[#666] hover:text-[#B48248] transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#2C2C2C] p-2">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-b border-[#E6DCC8] px-4 py-4 space-y-3 shadow-lg absolute w-full">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-[#666]">學員：{user?.user_metadata?.full_name || name}</span>
            </div>
            <button 
              onClick={() => { setView('dashboard'); setIsMenuOpen(false); }}
              className="block w-full text-left py-2 text-[#2C2C2C] font-medium"
            >
              課程首頁
            </button>
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-red-500 font-medium"
            >
              登出
            </button>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' ? (
          <div className="space-y-8">
            {/* Welcome & Progress */}
            <div className="bg-[#F5F0E6] rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E6DCC8]">
              <h2 className="text-2xl font-bold mb-2">歡迎回來，{user?.user_metadata?.full_name || name}</h2>
              <p className="text-[#666] mb-6">願神的話語成為你腳前的燈，路上的光。</p>
              
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-[#4A4A4A]">學習進度</span>
                  <span className="text-2xl font-bold text-[#B48248]">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-[#EFEFEF] rounded-full h-2.5">
                  <div 
                    className="bg-[#B48248] h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#888] mt-2 text-right">已完成 {completedCount} / {BOOKS.length} 卷書</p>
              </div>
            </div>

            {/* Course Grid */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-1 h-6 bg-[#B48248] rounded-full mr-3"></span>
                課程列表
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BOOKS.map((book) => {
                  const isCompleted = progress[book.id];
                  return (
                    <div 
                      key={book.id}
                      onClick={() => { setCurrentBook(book); setView('course'); }}
                      className={`group relative bg-white rounded-xl p-5 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        isCompleted ? 'border-[#B48248] bg-[#FDFBF7]' : 'border-gray-200 hover:border-[#D4C5A8]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-[#B48248] tracking-wider uppercase mb-1 block">
                            Chapter {book.id}
                          </span>
                          <h4 className="text-lg font-bold text-[#2C2C2C] group-hover:text-[#B48248] transition-colors">
                            {book.name}
                          </h4>
                          <span className="text-xs text-[#888]">{book.chapter}</span>
                        </div>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-[#B48248]" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-200 group-hover:border-[#B48248]"></div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center text-sm text-[#666] group-hover:text-[#B48248]">
                        <span>開始學習</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // Course Detail View
          <div className="space-y-6">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center text-sm text-[#666] hover:text-[#B48248] transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              返回課程列表
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E6DCC8] overflow-hidden">
              {/* Video Section */}
              <div className="aspect-video bg-black w-full">
                <iframe 
                  className="w-full h-full"
                  src={currentBook?.videoUrl}
                  title={currentBook?.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-[#2C2C2C] mb-1">{currentBook?.name}</h1>
                    <p className="text-[#666] text-sm">{currentBook?.chapter}</p>
                  </div>
                  
                  <button
                    onClick={() => updateProgress(currentBook.id, !progress[currentBook.id])}
                    className={`flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                      progress[currentBook.id]
                        ? 'bg-[#E6F4EA] text-[#1E7E34] hover:bg-[#DCEFE0]'
                        : 'bg-[#B48248] text-white hover:bg-[#9A6F3C] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {progress[currentBook.id] ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        已完成
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        標記為完成
                      </>
                    )}
                  </button>
                </div>

                <div className="prose prose-stone max-w-none">
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-3">課程資源</h3>
                  <div className="flex flex-col gap-3">
                     <a 
                      href={currentBook?.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-[#B48248] hover:bg-[#FDFBF7] transition-all group"
                    >
                      <div className="bg-[#F5F0E6] p-2 rounded-lg mr-4 group-hover:bg-[#E6DCC8] transition-colors">
                        <FileText className="h-6 w-6 text-[#B48248]" />
                      </div>
                      <div>
                        <span className="font-bold text-[#2C2C2C] block">下載講義 PDF</span>
                        <span className="text-xs text-[#666]">點擊下載本課研讀資料</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
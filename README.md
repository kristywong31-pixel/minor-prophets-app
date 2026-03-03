## 2026 先知性群體 · 小先知書速覽 Web App

這個專案是一個以 React + Tailwind CSS + Framer Motion 打造的行動優先 Web App，用來記錄
「2026 先知性群體 · 小先知書速覽」的閱讀、測驗與出席徽章。

### 1. 安裝與啟動

專案根目錄已建立：

- `package.json`
- `src/App.jsx`

你可以依照以下步驟啟動 (建議使用 Node 18+)：

```bash
npm install
npm run dev
```

這會啟動 Vite 開發伺服器，瀏覽器開啟顯示 App。

### 1.1 重要：正式版登入/資料不會遺失（Vercel + Postgres）

目前專案已加入後端 API（Vercel Serverless Functions）與 PostgreSQL schema，目標是：

- 用戶註冊後 **不怕清除瀏覽器資料 / 換裝置 / 換瀏覽器**（資料在資料庫）
- 後台更新前端/後端也 **不會令帳戶消失**（資料在資料庫）

你需要做一次部署與設定環境變數。

### 2. 建立資料庫（Neon 或 Supabase Postgres）

1. 建立一個 Postgres 專案，取得 `DATABASE_URL`
2. 用 SQL 工具執行 `db/schema.sql`（會建立表與寫入 10 堂課程）

### 3. 部署到 Vercel（取得真實可用 URL）

1. 把此專案放到 GitHub（或其他 Git provider）
2. Vercel → New Project → 選擇這個 repo
3. 設定（通常會自動偵測 Vite）：
   - Build Command：`npm run build`
   - Output Directory：`dist`
4. 在 Vercel Project → Settings → Environment Variables 加入：
   - `DATABASE_URL`
   - `JWT_SECRET`（請用長一點的隨機字串）
5. Deploy 後，Vercel 會給你一條正式網址（例如 `https://xxx.vercel.app`）

### 4. 本機跑「真實登入 + DB」

在本機專案根目錄建立 `.env`（可參考 `.env.example`），加入：

- `DATABASE_URL=...`
- `JWT_SECRET=...`

然後：

```bash
npm run dev
```

前端會自動改用 `/api/*` 來註冊/登入/載入進度與社群資料。

> 若你已有自己的 React 專案，也可以只把 `src/App.jsx` 貼進現有的 `App` 元件中使用。

### 2. 靜態資源擺放方式

#### 教會 Logo

1. 將你提供的 Logo 檔案：

   - 來源：`/Users/tc/.cursor/projects/Users-tc-Cursor/assets/__logo-b68acf92-ab08-4e4a-878f-cb70472c7f9d.png`

2. 複製到專案的：

   - `public/assets/scpc-logo.png`

3. `App.jsx` 會透過：

   - `src="/assets/scpc-logo.png"`

   自動載入顯示於畫面左上角。

#### 每卷小先知書個人徽章 PNG

請將 `/Users/tc/Downloads/小先知個人PNG` 資料夾中的 10 個 PNG 檔，依照課程順序與命名，放到：

- `public/badges`

對應命名如下：

- 何西阿書：`public/badges/hosea.png`
- 約珥書：`public/badges/joel.png`
- 阿摩斯書：`public/badges/amos.png`
- 約拿書：`public/badges/jonah.png`
- 彌迦書：`public/badges/micah.png`
- 那鴻書：`public/badges/nahum.png`
- 哈巴谷書：`public/badges/habakkuk.png`
- 西番亞書：`public/badges/zephaniah.png`
- 哈該書：`public/badges/haggai.png`
- 瑪拉基書：`public/badges/malachi.png`

前端程式會根據課程 id 自動載入對應檔案，條件：

- 課程徽章「尚未解鎖」時：顯示灰色鎖頭。
- 課程徽章「已解鎖」時：
  - 在首頁課程卡片右側顯示對應 PNG。
  - 在課程詳情頁的「本課程徽章」區顯示金色徽章。
  - 在「獎勵 / 徽章牆」中顯示每卷書的個人徽章 PNG。

### 3. 下一步建議

- 啟動後先在瀏覽器實際點擊：
  - 登入 → 首頁 → 任選一堂課程
  - 試著勾選章數、完成模擬測驗、勾選出席
  - 確認徽章會自動解鎖，Logo 與個人徽章有正確顯示
- 若有任何版面、文案、配色、動畫想調整，可以在 Cursor 中打開 `src/App.jsx`，標示你想改的區塊，我可以幫你微調。


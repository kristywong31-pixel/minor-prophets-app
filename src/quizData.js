/**
 * 小測題庫（你只需要編輯這個檔案）
 *
 * 結構：
 * QUIZ_BANK[courseId] = 10 題陣列
 * 每題：
 * - id: 1..10
 * - question: 題目文字
 * - options: 4 個選項（陣列長度必須是 4）
 * - correct: 正確答案 index（0..3）
 */

function makePlaceholderQuiz(bookTitle) {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    question: `【${bookTitle}】第 ${i + 1} 題：請在 src/quizData.js 填入真實題目。`,
    options: ["選項 A", "選項 B", "選項 C", "選項 D"],
    correct: 0,
  }));
}

export const QUIZ_BANK = {
  1: makePlaceholderQuiz("何西阿書"),
  2: makePlaceholderQuiz("約珥書"),
  3: makePlaceholderQuiz("阿摩司書"),
  4: makePlaceholderQuiz("約拿書"),
  5: makePlaceholderQuiz("彌迦書"),
  6: makePlaceholderQuiz("那鴻書"),
  7: makePlaceholderQuiz("哈巴谷書"),
  8: makePlaceholderQuiz("西番亞書"),
  9: makePlaceholderQuiz("哈該書"),
  10: makePlaceholderQuiz("瑪拉基書"),
};


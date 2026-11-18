export interface Question {
  q: string;
  /** first choice is the correct one; choices are shuffled at runtime (2 or 3 choices) */
  choices: string[];
  /** short explanation shown after answering */
  note: string;
}

export const QUIZ = {
  /** max questions per play (fewer if QUESTIONS has fewer) */
  perPlay: 5,
  secPerQuestion: 10,
  perCorrect: 40,
  /** speed bonus = remaining seconds × this (max secPerQuestion × this) */
  speedPerSec: 2,
  /** takenoko multiplier for the speed bonus */
  takeSpeedMul: 1.5,
  /** kinoko hints per play (remove one wrong choice; only on 3-choice questions) */
  kinoHints: 1,
};

/**
 * 産地クイズ：商品に使われている原料の産地。
 * 新しい商品を足すときは「どこの産地？」と「どっちの商品？」の2問を追加すると出題が増える。
 */
export const QUESTIONS: Question[] = [
  {
    q: '「マンゴーの山」に使われているマンゴーは、どこの国のもの？',
    choices: ['インド', 'タイ', 'メキシコ'],
    note: 'マンゴーの山には、インドのマンゴーが使われている。',
  },
  {
    q: '「ピスタチオの里」に使われているピスタチオは、どこの国のもの？',
    choices: ['イタリア', 'アメリカ', 'トルコ'],
    note: 'ピスタチオの里には、イタリアのピスタチオが使われている。',
  },
  {
    q: 'インドのマンゴーを使っているのは、どっち？',
    choices: ['マンゴーの山', 'ピスタチオの里'],
    note: 'インドのマンゴー → マンゴーの山。',
  },
  {
    q: 'イタリアのピスタチオを使っているのは、どっち？',
    choices: ['ピスタチオの里', 'マンゴーの山'],
    note: 'イタリアのピスタチオ → ピスタチオの里。',
  },
];

// 자재 행(shapeId, name)에서 퀴즈를 만든다(순수 함수). 런타임이라 Math.random 사용.
import type { INameQuestion, IPositionQuestion } from '../types';

export interface IQuizRow {
  shapeId: string;
  name: string;
}

const MAX_QUESTIONS = 10;
const MAX_CHOICES = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface IQuizSet {
  position: IPositionQuestion[];
  name: INameQuestion[];
}

export default function buildQuiz(rows: IQuizRow[]): IQuizSet {
  const allNames = Array.from(new Set(rows.map((r) => r.name)));

  // name → 그 이름을 가진 도형들
  const nameToShapes = new Map<string, Set<string>>();
  // shape → 그 도형의 자재 이름들
  const shapeToNames = new Map<string, Set<string>>();
  for (const r of rows) {
    (nameToShapes.get(r.name) ?? nameToShapes.set(r.name, new Set()).get(r.name)!).add(r.shapeId);
    (shapeToNames.get(r.shapeId) ?? shapeToNames.set(r.shapeId, new Set()).get(r.shapeId)!).add(r.name);
  }

  // 위치 맞히기 — 이름 단위
  const position: IPositionQuestion[] = shuffle(
    allNames.map((name) => ({
      name,
      correctShapeIds: Array.from(nameToShapes.get(name) ?? []),
    })),
  ).slice(0, MAX_QUESTIONS);

  // 이름 맞히기 — 자재 있는 도형 단위
  const name: INameQuestion[] = shuffle(
    Array.from(shapeToNames.entries()).map(([shapeId, names]) => {
      const correctNames = Array.from(names);
      const correct = correctNames[Math.floor(Math.random() * correctNames.length)];
      const distractors = shuffle(allNames.filter((n) => !names.has(n))).slice(0, MAX_CHOICES - 1);
      const choices = shuffle([correct, ...distractors]);
      return { shapeId, correctNames, choices };
    }),
  ).slice(0, MAX_QUESTIONS);

  return { position, name };
}

export type SM2State = { easiness: number; interval: number; repetition: number; dueAt: number }
export function initSM2(now = Date.now()): SM2State {
  return { easiness: 2.5, interval: 0, repetition: 0, dueAt: now }
}
export function reviewSM2(prev: SM2State, quality: 0|1|2|3|4|5, now = Date.now()): SM2State {
  let { easiness, interval, repetition } = prev
  if (quality < 3) {
    repetition = 0
    interval = 1
  } else {
    if (repetition === 0) interval = 1
    else if (repetition === 1) interval = 6
    else interval = Math.round(interval * easiness)
    repetition += 1
    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easiness < 1.3) easiness = 1.3
  }
  const dueAt = now + interval * 24 * 60 * 60 * 1000
  return { easiness, interval, repetition, dueAt }
}
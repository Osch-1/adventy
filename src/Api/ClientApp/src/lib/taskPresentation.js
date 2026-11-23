// API content stays intact. Decorative leading emoji are omitted only in the reading UI.
export function taskTitle(title) {
  return title.replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D\s]+/u, '')
}

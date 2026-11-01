export interface Memo {
  id: string;
  frame: number;
  text: string;
}
export const cleanText = (text: string) =>
  [...text.replace(/[\r\n]+/g, " ")].slice(0, 50).join("");
export const validText = (text: string) =>
  !!text.trim() && [...text].length <= 50 && !/[\r\n]/.test(text);
export const memoName = (name: string) =>
  name.replace(/\.[^.]+$/, "") + ".memo.vtt";
const stamp = (frame: number) => {
  const ms = Math.round((frame / 60) * 1000);
  return (
    String(Math.floor(ms / 3600000)).padStart(2, "0") +
    ":" +
    String(Math.floor(ms / 60000) % 60).padStart(2, "0") +
    ":" +
    String(Math.floor(ms / 1000) % 60).padStart(2, "0") +
    "." +
    String(ms % 1000).padStart(3, "0")
  );
};
export const toVtt = (memos: Memo[]) =>
  "WEBVTT\nX-FRAMESTEP: v1 fps=60\n\n" +
  [...memos]
    .sort((a, b) => a.frame - b.frame)
    .map(
      (m) =>
        "f" +
        m.frame +
        "\n" +
        stamp(m.frame) +
        " --> " +
        stamp(m.frame + 1) +
        "\n" +
        m.text
          .replace(/-->/g, "→")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;") +
        "\n",
    )
    .join("\n");
const seconds = (s: string) =>
  s
    .split(":")
    .map(Number)
    .reduce((a, b) => a * 60 + b, 0);
export function fromVtt(vtt: string): Memo[] {
  return vtt
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .flatMap((block) => {
      const lines = block.trim().split("\n"),
        i = lines.findIndex((l) =>
          /^((\d+:)?\d{2}:\d{2}\.\d{3})\s+-->\s+((\d+:)?\d{2}:\d{2}\.\d{3})(\s.*)?$/.test(
            l,
          ),
        );
      if (i < 0) return [];
      const [start, end] = lines[i].split(/\s+-->\s+/),
        frame =
          i > 0 && /^f\d+$/.test(lines[i - 1])
            ? Number(lines[i - 1].slice(1))
            : Math.round(seconds(start) * 60);
      const text = cleanText(
        lines
          .slice(i + 1)
          .join(" ")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&"),
      ).trim();
      return Number.isSafeInteger(frame) &&
        frame >= 0 &&
        seconds(end.split(" ")[0]) > seconds(start) &&
        text
        ? [{ id: crypto.randomUUID(), frame, text }]
        : [];
    })
    .sort((a, b) => a.frame - b.frame);
}

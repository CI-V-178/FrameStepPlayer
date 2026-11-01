import { useEffect, useRef, useState } from "react";
import { frameAt, formatTime } from "../shared/time";
import {
  cleanText,
  fromVtt,
  memoName,
  toVtt,
  type Memo,
} from "../features/memo/vtt";
import { SaveQueue } from "../features/memo/queue";
import { FrameController } from "../features/player/controller";
import { readVideoInfo, require60 } from "../features/fps/detect";
import { configured, pickVideo, seedToken } from "../features/drive/auth";
import {
  metadata,
  range,
  findMemo,
  readMemo,
  saveMemo,
  downloadVideo,
  type DriveFile,
} from "../features/drive/api";
import { prepareStream } from "../features/drive/stream";
import StepButton from "./StepButton";
import Icon from "./Icon";
import { SiteFooter, SiteLinks, SiteMenu } from "../shared/SiteFooter";
import { siteInfo } from "../shared/siteInfo";
import FileSelectionDialog, {
  type FileSelection,
} from "../features/selection/FileSelection";

type OpenVideo = { name: string; src: string; key?: string; drive?: DriveFile };
type Status = "saved" | "saving" | "error";
const playbackError =
  "この動画を再生できませんでした（形式が未対応の可能性があります）";
declare global {
  interface Window {
    __framestep?: {
      getFrame: () => number;
      openDrive: (options: { fileId: string; token: string }) => Promise<void>;
    };
  }
}
export default function App() {
  const video = useRef<HTMLVideoElement>(null),
    fileInput = useRef<HTMLInputElement>(null),
    vttInput = useRef<HTMLInputElement>(null),
    memoInput = useRef<HTMLInputElement>(null);
  const controller = useRef<FrameController | null>(null),
    queue = useRef<SaveQueue<Memo[]>>(),
    session = useRef(0),
    current = useRef<OpenVideo>(),
    objectUrls = useRef<string[]>([]),
    metadataTimer = useRef<ReturnType<typeof setTimeout>>(),
    fallbackBusy = useRef(false);
  const [selection, setSelection] = useState<FileSelection>();
  const [opened, setOpened] = useState<OpenVideo>(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(""),
    [duration, setDuration] = useState(0),
    [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [hold, setHold] = useState(0),
    [memos, setMemos] = useState<Memo[]>([]),
    [text, setText] = useState(""),
    [status, setStatus] = useState<Status>("saved"),
    [memoId, setMemoId] = useState<string>();
  const memosRef = useRef<Memo[]>([]);
  memosRef.current = memos;
  const url = (blob: Blob) => {
    const value = URL.createObjectURL(blob);
    objectUrls.current.push(value);
    return value;
  };
  useEffect(() => {
    if (!video.current || !opened || loading) return;
    const c = new FrameController(video.current, setFrame);
    controller.current = c;
    return () => {
      c.dispose();
      controller.current = null;
    };
  }, [opened?.src]);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (queue.current?.dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("beforeunload", unload);
      clearTimeout(metadataTimer.current);
      queue.current?.dispose();
      objectUrls.current.forEach(URL.revokeObjectURL);
    };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.matches("input,textarea,select") ||
        target.isContentEditable ||
        !opened ||
        loading ||
        selection
      )
        return;
      if ([",", ".", " ", "m", "M"].includes(e.key)) {
        e.preventDefault();
        if (e.key === ",") controller.current?.step(-1);
        else if (e.key === ".") controller.current?.step(1);
        else if (e.key === " ") toggle();
        else memoInput.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [opened, loading, selection]);
  async function begin() {
    if (queue.current?.dirty) {
      await queue.current.flush();
      if (queue.current.dirty)
        throw new Error("メモの保存に失敗しました（再試行できます）");
    }
    video.current?.pause();
    setError("");
    setLoading("動画を確認中…");
  }
  function install(item: OpenVideo, notes: Memo[], id?: string) {
    session.current++;
    const generation = session.current;
    queue.current?.dispose();
    setMemoId(id);
    let savedId = id;
    queue.current = new SaveQueue(
      async (value) => {
        if (item.drive) {
          savedId = await saveMemo(item.drive, savedId, toVtt(value));
          if (session.current === generation) setMemoId(savedId);
        } else if (item.key)
          localStorage.setItem(item.key, JSON.stringify(value));
      },
      (s) => {
        if (session.current === generation) {
          setStatus(s);
          if (s === "error")
            setError("メモの保存に失敗しました（再試行できます）");
        }
      },
    );
    clearTimeout(metadataTimer.current);
    current.current = item;
    setOpened(item);
    setMemos(notes);
    setFrame(0);
    setDuration(0);
    setPlaying(false);
    setHold(0);
    setText("");
    setStatus("saved");
    setLoading("");
  }
  async function openLocal(file: File) {
    try {
      await begin();
      await require60(file.size, (start, end) =>
        file.slice(start, end + 1).arrayBuffer(),
      );
      const key = "framestep:local:" + file.name + ":" + file.size;
      let notes: Memo[] = [];
      try {
        const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(value))
          notes = value.filter(
            (m): m is Memo =>
              typeof m?.id === "string" &&
              Number.isSafeInteger(m.frame) &&
              m.frame >= 0 &&
              typeof m.text === "string" &&
              !!m.text.trim() &&
              [...m.text].length <= 50 &&
              !/[\r\n]/.test(m.text),
          );
      } catch {}
      install({ name: file.name, src: url(file), key }, notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : playbackError);
      setLoading("");
    }
  }
  async function openDrive(fileId: string, selectedFile?: DriveFile) {
    try {
      await begin();
      const file = selectedFile ?? (await metadata(fileId));
      await require60(Number(file.size), (start, end) =>
        range(fileId, start, end),
      );
      const found = await findMemo(fileId),
        notes = found ? fromVtt(await readMemo(found.id)) : [];
      const streaming = await prepareStream();
      const src = streaming
        ? "/drive-stream/" + encodeURIComponent(fileId)
        : url(
            await downloadVideo(file, (n) =>
              setLoading("動画を読み込み中… " + n + "%"),
            ),
          );
      install({ name: file.name, src, drive: file }, notes, found?.id);
      if (streaming)
        metadataTimer.current = setTimeout(() => void fallback(), 10000);
    } catch (e) {
      setError(e instanceof Error ? e.message : playbackError);
      setLoading("");
    }
  }
  useEffect(() => {
    if (import.meta.env.VITE_E2E === "1")
      window.__framestep = {
        getFrame: () => controller.current?.frame || 0,
        openDrive: async ({ fileId, token }) => {
          seedToken(token);
          await selectDrive(fileId);
        },
      };
    return () => {
      delete window.__framestep;
    };
  }, []);
  async function fallback() {
    const item = current.current;
    if (
      !item?.drive ||
      !item.src.startsWith("/drive-stream/") ||
      fallbackBusy.current
    )
      return;
    clearTimeout(metadataTimer.current);
    fallbackBusy.current = true;
    try {
      const src = url(
        await downloadVideo(item.drive, (n) =>
          setLoading("動画を読み込み中… " + n + "%"),
        ),
      );
      if (current.current === item) {
        const next = { ...item, src };
        current.current = next;
        setOpened(next);
        setLoading("");
      }
    } catch {
      setError(playbackError);
      setLoading("");
    } finally {
      fallbackBusy.current = false;
    }
  }
  async function selectLocal(file: File) {
    video.current?.pause();
    setError("");
    setLoading("ファイル情報を取得中…");
    try {
      const info = await readVideoInfo(file.size, (start, end) =>
        file.slice(start, end + 1).arrayBuffer(),
      );
      setSelection({
        source: "local",
        file,
        name: file.name,
        duration: info.duration,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : playbackError);
    } finally {
      setLoading("");
    }
  }
  async function selectDrive(id: string) {
    video.current?.pause();
    setError("");
    setLoading("ファイル情報を取得中…");
    try {
      const file = await metadata(id);
      const millis = file.videoMediaMetadata?.durationMillis;
      const seconds = millis === undefined ? NaN : Number(millis) / 1000;
      const duration =
        Number.isFinite(seconds) && seconds > 0
          ? seconds
          : (
              await readVideoInfo(Number(file.size), (start, end) =>
                range(id, start, end),
              )
            ).duration;
      setSelection({
        source: "drive",
        file,
        name: file.name,
        duration,
        createdTime: file.createdTime,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : playbackError);
    } finally {
      setLoading("");
    }
  }
  function confirmSelection() {
    const candidate = selection;
    setSelection(undefined);
    if (!candidate) return;
    if (candidate.source === "local") void openLocal(candidate.file);
    else void openDrive(candidate.file.id, candidate.file);
  }
  async function chooseDrive() {
    try {
      const id = await pickVideo();
      if (id) await selectDrive(id);
    } catch {
      setError("Google ログインできませんでした");
    }
  }
  function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => setError(playbackError));
    else v.pause();
  }
  function update(notes: Memo[]) {
    const ordered = [...notes].sort((a, b) => a.frame - b.frame);
    setMemos(ordered);
    queue.current?.put(ordered);
  }
  function addMemo() {
    const value = cleanText(text).trim();
    if (!value) return;
    video.current?.pause();
    const f =
      controller.current?.frame ?? frameAt(video.current?.currentTime || 0);
    update([
      ...memosRef.current,
      { id: crypto.randomUUID(), frame: f, text: value },
    ]);
    setText("");
  }
  function exportVtt() {
    if (!opened) return;
    const a = document.createElement("a");
    const link = URL.createObjectURL(
      new Blob([toVtt(memos)], { type: "text/vtt" }),
    );
    a.href = link;
    a.download = memoName(opened.name);
    a.click();
    setTimeout(() => URL.revokeObjectURL(link), 1000);
  }
  const driveDisabled = !configured || !!loading;
  return (
    <div className="app">
      {selection && (
        <FileSelectionDialog
          file={selection}
          onOpen={confirmSelection}
          onCancel={() => setSelection(undefined)}
        />
      )}
      <input
        ref={fileInput}
        className="file-input"
        type="file"
        accept="video/mp4,video/quicktime"
        aria-label="動画ファイル"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void selectLocal(f);
          e.target.value = "";
        }}
      />
      <input
        ref={vttInput}
        className="file-input"
        type="file"
        accept=".vtt,text/vtt"
        aria-label="VTTファイル"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) update(fromVtt(await f.text()));
          e.target.value = "";
        }}
      />
      <header>
        <div className="brand">
          FRAMESTEP <span className="mobile-fps">· 60fps</span>
        </div>
        <div className="filename">
          {opened?.name || "動画のフレームを、ひとつずつ。"}
        </div>
        <span className="fps">60fps</span>
        <div className="header-actions">
          <button
            disabled={driveDisabled}
            onClick={() => void chooseDrive()}
            aria-label="Drive から開く"
          >
            <Icon kind="folder" />
            <span>Drive から開く</span>
          </button>
          <button
            disabled={!!loading}
            className="local-open"
            onClick={() => fileInput.current?.click()}
          >
            端末から開く
          </button>
          {opened && <SiteMenu />}
        </div>
      </header>
      {error && (
        <div role="alert" className="error">
          {error}
          <button aria-label="エラーを閉じる" onClick={() => setError("")}>
            <Icon kind="close" />
          </button>
        </div>
      )}
      {!configured && (
        <div className="config-note">Google 連携が未設定です</div>
      )}
      {loading && (
        <div role="status" className="loading">
          {loading}
        </div>
      )}
      {!opened ? (
        <>
          <main className="welcome">
            <div className="welcome-icon">
              <Icon kind="film" />
            </div>
            <p className="eyebrow">ひとつのフレームに、ひとつの発見。</p>
            <h1>{siteInfo.appName}</h1>
            <p>
              Google Drive の 60fps 動画を
              <br className="mobile-break" /> 1 フレームずつ確認できます
            </p>
            <div className="welcome-actions">
              <button
                className="primary"
                disabled={driveDisabled}
                onClick={() => void chooseDrive()}
              >
                <Icon kind="folder" />
                Google でログインして Drive から開く
              </button>
              <button
                disabled={!!loading}
                onClick={() => fileInput.current?.click()}
              >
                端末から開く
              </button>
            </div>
            <p className="welcome-hint">60fps の MP4・MOV に対応</p>
          </main>
          <SiteFooter />
        </>
      ) : (
        <main className="workspace">
          <section className="player" aria-label="動画プレーヤー">
            <div className="video-wrap">
              <video
                ref={video}
                src={opened.src}
                playsInline
                preload="metadata"
                onLoadedMetadata={() => {
                  clearTimeout(metadataTimer.current);
                  setDuration(video.current?.duration || 0);
                  controller.current?.sync();
                }}
                onTimeUpdate={() => controller.current?.sync()}
                onPlay={() => {
                  setPlaying(true);
                  controller.current?.sync();
                }}
                onPause={() => {
                  setPlaying(false);
                  controller.current?.sync();
                }}
                onSeeked={() => {
                  if (!controller.current?.seeking) controller.current?.sync();
                }}
                onError={() => {
                  if (current.current?.src.startsWith("/drive-stream/"))
                    void fallback();
                  else setError(playbackError);
                }}
              />
              {hold !== 0 && (
                <span className="hold-badge">
                  {hold > 0 ? "連続 ▶▶" : "◀◀ 連続"}
                </span>
              )}
            </div>
            <div className="seek-row">
              <time>{formatTime(frame / 60)}</time>
              <div className="seek-track">
                <div className="markers">
                  {memos.map((m) => (
                    <i
                      key={m.id}
                      style={{
                        left:
                          Math.min(
                            100,
                            (m.frame / 60 / (duration || 1)) * 100,
                          ) + "%",
                      }}
                    />
                  ))}
                </div>
                <input
                  aria-label="再生位置"
                  type="range"
                  min="0"
                  max={duration || 0}
                  step={1 / 60}
                  value={Math.min(duration, frame / 60)}
                  disabled={!duration}
                  onChange={(e) =>
                    controller.current?.jump(frameAt(Number(e.target.value)))
                  }
                />
              </div>
              <time>{formatTime(duration)}</time>
            </div>
            <div className="controls">
              <StepButton
                d={-1}
                controller={controller}
                hold={setHold}
                disabled={!duration || !!loading}
              />
              <button
                className="play primary"
                aria-label={playing ? "一時停止" : "再生"}
                disabled={!duration || !!loading}
                onClick={toggle}
              >
                <Icon kind={playing ? "pause" : "play"} />
              </button>
              <StepButton
                d={1}
                controller={controller}
                hold={setHold}
                disabled={!duration || !!loading}
              />
            </div>
            <p className="control-hint">タップで 1f ／ 長押しで連続移動</p>
          </section>
          <aside>
            <section className="memo-panel">
              <div className="memo-heading">
                <h2>
                  メモ <time>{formatTime(frame / 60)}</time>
                </h2>
                <span className={"save-state " + status} role="status">
                  {status === "saving" ? (
                    "保存中…"
                  ) : status === "error" ? (
                    <button onClick={() => void queue.current?.flush()}>
                      保存に失敗しました［再試行］
                    </button>
                  ) : opened.drive ? (
                    "Drive に保存済み"
                  ) : (
                    "端末に保存済み"
                  )}
                </span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addMemo();
                }}
              >
                <div className="memo-entry">
                  <input
                    ref={memoInput}
                    aria-label="メモ本文"
                    placeholder="この瞬間にメモを残す"
                    value={text}
                    onChange={(e) => setText(cleanText(e.target.value))}
                  />
                  <button
                    className="primary"
                    disabled={!text.trim() || !duration}
                    type="submit"
                  >
                    追加
                  </button>
                </div>
                <div className="count">{[...text].length}/50</div>
              </form>
              <div className="memo-list">
                {memos.length ? (
                  memos.map((m) => (
                    <div className="memo-row" key={m.id}>
                      <button
                        className="memo-jump"
                        onClick={() => controller.current?.jump(m.frame)}
                      >
                        <time>[{formatTime(m.frame / 60)}]</time>
                        <span>{m.text}</span>
                      </button>
                      <button
                        className="delete"
                        aria-label={"メモを削除：" + m.text}
                        onClick={() =>
                          update(memos.filter((x) => x.id !== m.id))
                        }
                      >
                        <Icon kind="close" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-memos">
                    気づいた瞬間を、メモに。
                    <br />
                    一時停止した位置に追加できます。
                  </p>
                )}
              </div>
              <div className="memo-files">
                {opened.drive ? (
                  <a
                    href={
                      memoId
                        ? "https://drive.google.com/file/d/" + memoId + "/view"
                        : undefined
                    }
                    aria-disabled={!memoId}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    メモファイルを Drive で開く ↗
                  </a>
                ) : (
                  <>
                    <button onClick={exportVtt}>.vtt を書き出す</button>
                    <button onClick={() => vttInput.current?.click()}>
                      .vtt を読み込む
                    </button>
                  </>
                )}
              </div>
            </section>
            <section className="shortcuts">
              <h2>キー操作</h2>
              <p>
                <kbd>,</kbd>
                <kbd>.</kbd>
                <span>1f 戻る / 進む</span>
              </p>
              <p>
                <kbd>Space</kbd>
                <span>再生 / 一時停止</span>
              </p>
              <p>
                <kbd>M</kbd>
                <span>メモ入力へ</span>
              </p>
            </section>
            <SiteLinks className="site-panel-links" />
          </aside>
        </main>
      )}
    </div>
  );
}

import { useEffect, useRef } from "react";
import { formatTime } from "../../shared/time";
import type { DriveFile } from "../drive/api";

export type FileSelection =
  | { source: "local"; file: File; name: string; duration: number }
  | {
      source: "drive";
      file: DriveFile;
      name: string;
      duration?: number;
      createdTime?: string;
    };

export default function FileSelectionDialog({
  file,
  onOpen,
  onCancel,
}: {
  file: FileSelection;
  onOpen: () => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  const createdTime =
    file.source === "drive" && file.createdTime
      ? new Date(file.createdTime)
      : undefined;
  const createdLabel =
    createdTime && Number.isFinite(createdTime.getTime())
      ? new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(createdTime)
      : "取得不可";

  return (
    <dialog
      ref={dialog}
      className="file-selection"
      aria-labelledby="file-selection-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="file-selection-title">動画を選択</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">ファイル名</th>
            <th scope="col">長さ</th>
            <th scope="col">作成日時</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{file.name}</td>
            <td>
              {file.duration !== undefined && Number.isFinite(file.duration)
                ? formatTime(file.duration)
                : "取得不可"}
            </td>
            <td>{createdLabel}</td>
          </tr>
        </tbody>
      </table>
      {file.source === "local" && (
        <p className="selection-note">
          端末ファイルの作成日時はブラウザから取得できません。
        </p>
      )}
      <div className="selection-actions">
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
        <button type="button" className="primary" onClick={onOpen}>
          この動画を開く
        </button>
      </div>
    </dialog>
  );
}

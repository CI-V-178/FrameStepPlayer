import { useRef, useEffect, type RefObject } from "react";
import { FrameController } from "../features/player/controller";
import { lastFrame } from "../shared/time";
export default function StepButton({
  d,
  controller,
  hold,
  disabled,
}: {
  d: number;
  controller: RefObject<FrameController>;
  hold: (d: number) => void;
  disabled: boolean;
}) {
  const delay = useRef<ReturnType<typeof setTimeout>>(),
    loop = useRef<ReturnType<typeof setInterval>>();
  const stop = () => {
    clearTimeout(delay.current);
    clearInterval(loop.current);
    hold(0);
  };
  useEffect(
    () => () => {
      clearTimeout(delay.current);
      clearInterval(loop.current);
    },
    [],
  );
  return (
    <button
      className="step"
      disabled={disabled}
      aria-label={d < 0 ? "1フレーム戻る" : "1フレーム進む"}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        controller.current?.step(d);
        delay.current = setTimeout(() => {
          hold(d);
          loop.current = setInterval(() => {
            const c = controller.current,
              v = document.querySelector("video");
            if (!c || !v) return;
            if (d < 0 ? c.frame <= 0 : c.frame >= lastFrame(v.duration)) {
              stop();
              return;
            }
            if (!c.seeking) c.step(d);
          }, 1000 / 30);
        }, 400);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onClick={(e) => {
        if (e.detail === 0) controller.current?.step(d);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d={d < 0 ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
      </svg>
      {d < 0 ? "−1f" : "+1f"}
    </button>
  );
}

import { cn } from "../../lib/utils";
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { useProviders } from "../../lib/providers-context";
import type { MediaSession } from "zebar";
import { Music, SkipBack, Play, Pause, SkipForward } from "lucide-solid";

function isMainMediaSession(s: MediaSession | null | undefined): boolean {
  if (!s) return false;
  const title = s.title?.trim();
  const artist = s.artist?.trim();
  if (!title && !artist) return false;

  // Filter out short video hover previews (e.g. YouTube thumbnail previews <= 10 seconds)
  if (s.endTime > 0 && s.endTime <= 10) return false;

  return true;
}

function Media() {
  const { media } = useProviders();
  const [mediaSig, setMediaSig] = createSignal(media());
  createEffect(() => setMediaSig(media()));

  // Sticky session locking
  const [lockedSessionId, setLockedSessionId] = createSignal<string | null>(null);
  // Remember last known session so even if media provider drops the session on stop/pause, it remains visible
  const [lastKnownSession, setLastKnownSession] = createSignal<MediaSession | null>(null);

  const activeSession = createMemo(() => {
    const m = mediaSig();
    if (!m) return null;

    const all = m.allSessions || [];
    const validSessions = all.filter(isMainMediaSession);

    const currentLockedId = lockedSessionId();
    if (currentLockedId) {
      const lockedMatch = validSessions.find((s) => s.sessionId === currentLockedId);
      if (lockedMatch) {
        const anotherPlaying = validSessions.find(
          (s) => s.sessionId !== currentLockedId && s.isPlaying
        );
        if (!anotherPlaying || lockedMatch.isPlaying) {
          return lockedMatch;
        }
      }
    }

    if (m.currentSession && isMainMediaSession(m.currentSession)) {
      setLockedSessionId(m.currentSession.sessionId);
      return m.currentSession;
    }

    const playing = validSessions.find((s) => s.isPlaying);
    if (playing) {
      setLockedSessionId(playing.sessionId);
      return playing;
    }

    const fallback = validSessions[0] || null;
    if (fallback) {
      setLockedSessionId(fallback.sessionId);
    }

    return fallback;
  });

  createEffect(() => {
    const s = activeSession();
    if (s) {
      setLastKnownSession(s);
    }
  });

  const session = createMemo(() => activeSession() || lastKnownSession());

  // Position interpolation for background tabs
  const [localPos, setLocalPos] = createSignal(0);
  let lastFetchTime = Date.now();
  let basePosition = 0;

  createEffect(() => {
    const s = session();
    if (s) {
      basePosition = s.position;
      lastFetchTime = Date.now();
      setLocalPos(s.position);
    }
  });

  onMount(() => {
    const timer = setInterval(() => {
      const s = activeSession();
      if (s && s.isPlaying) {
        const elapsed = (Date.now() - lastFetchTime) / 1000;
        const currentPos = basePosition + elapsed;
        setLocalPos(currentPos);
      }
    }, 500);

    onCleanup(() => clearInterval(timer));
  });

  const isPlaying = () => Boolean(activeSession()?.isPlaying);

  const getTitle = () => {
    const t = session()?.title?.trim();
    if (!t) return "Unknown Title";
    return t.length > 24 ? `${t.slice(0, 22)}...` : t;
  };

  const getArtist = () => {
    const a = session()?.artist?.trim() || "";
    return a.length > 18 ? `${a.slice(0, 16)}...` : a;
  };

  const getProgressPercent = () => {
    const s = session();
    if (!s || !s.endTime || s.endTime <= 0) return 0;
    const pos = localPos();
    const pct = (pos / s.endTime) * 100;
    if (isNaN(pct) || !isFinite(pct)) return 0;
    return Math.min(100, Math.max(0, pct));
  };

  const togglePlayPause = (e: MouseEvent) => {
    e.stopPropagation();
    const m = mediaSig();
    const s = session();
    if (!m || !s) return;
    m.togglePlayPause({ sessionId: s.sessionId });
  };

  const playPrevious = (e: MouseEvent) => {
    e.stopPropagation();
    const m = mediaSig();
    const s = session();
    if (!m || !s) return;
    m.previous({ sessionId: s.sessionId });
  };

  const playNext = (e: MouseEvent) => {
    e.stopPropagation();
    const m = mediaSig();
    const s = session();
    if (!m || !s) return;
    m.next({ sessionId: s.sessionId });
  };

  return (
    <Show
      when={session()}
      fallback={
        <div
          class={cn(
            "h-6 flex items-center justify-center gap-1.5 text-[#ec4899]/70 bg-[#ec4899]/10 border border-[#ec4899]/20 rounded-md px-2 select-none text-xs font-medium"
          )}
          title="No Media Active"
        >
          <Music size={13} class="shrink-0" />
          <span>No Media</span>
        </div>
      }
    >
      <div
        class={cn(
          "h-6 flex group items-center justify-center overflow-hidden gap-1.5 text-[#ec4899] bg-[#ec4899]/15 border border-[#ec4899]/30 rounded-md px-2 relative cursor-pointer select-none transition-all duration-200"
        )}
      >
        <Music size={13} class={cn("shrink-0", isPlaying() && "animate-pulse")} />

        <div class="flex items-center gap-1.5 group-hover:translate-y-6 group-hover:opacity-0 transition-all duration-200">
          <div class="flex items-center gap-1 text-xs">
            <Show when={getArtist()}>
              <span class="text-[#d4d4d8] font-medium">{getArtist()}</span>
              <span class="text-zinc-500">-</span>
            </Show>
            <span class="text-[#f4f4f5] font-semibold">{getTitle()}</span>
          </div>

          <div class="w-8 h-1 bg-[#ec4899]/20 rounded-full relative overflow-hidden">
            <div
              class="h-full bg-[#ec4899] rounded-full transition-all duration-300"
              style={{
                width: `${getProgressPercent()}%`,
              }}
            />
          </div>
        </div>

        <div class="transition-all -translate-y-6 duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 absolute inset-0 flex items-center justify-center bg-[rgba(18,17,26,0.95)] px-2">
          <div class="flex items-center gap-1 justify-center w-full">
            <button
              onClick={playPrevious}
              class="p-1 hover:text-[#f4f4f5] rounded-sm transition-colors"
              title="Previous Track"
            >
              <SkipBack size={13} />
            </button>
            <button
              onClick={togglePlayPause}
              class="p-1 hover:text-[#f4f4f5] rounded-sm transition-colors"
              title={isPlaying() ? "Pause" : "Play"}
            >
              <Show when={isPlaying()} fallback={<Play size={13} />}>
                <Pause size={13} />
              </Show>
            </button>
            <button
              onClick={playNext}
              class="p-1 hover:text-[#f4f4f5] rounded-sm transition-colors"
              title="Next Track"
            >
              <SkipForward size={13} />
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}

export default Media;

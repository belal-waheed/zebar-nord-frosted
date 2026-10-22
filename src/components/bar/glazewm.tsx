import { cn } from "../../lib/utils";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { useProviders } from "../../lib/providers-context";
import * as zebar from "zebar";
import { AppWindow } from "lucide-solid";

function hasOpenWindows(workspace: any, allWindows?: any[]): boolean {
  if (Array.isArray(workspace.displayedWindows) && workspace.displayedWindows.length > 0) {
    return true;
  }
  if (Array.isArray(workspace.children) && workspace.children.length > 0) {
    return true;
  }
  if (allWindows && Array.isArray(allWindows)) {
    return allWindows.some(
      (w) => w.parentId === workspace.id || (w as any).workspaceId === workspace.id
    );
  }
  return false;
}

function Glazewm() {
  const [glazewmSig, setGlazewmSig] = createSignal<
    zebar.GlazeWmOutput | undefined
  >(undefined);
  const { glazewm } = useProviders();

  createEffect(() => {
    setGlazewmSig(glazewm());
  });

  const visibleWorkspaces = createMemo(() => {
    const g = glazewmSig();
    if (!g || !g.currentWorkspaces) return [];

    const filtered = g.currentWorkspaces.filter(
      (ws) => ws.hasFocus || hasOpenWindows(ws, g.allWindows)
    );

    if (filtered.length === 0) {
      const focused = g.currentWorkspaces.find((ws) => ws.hasFocus) || g.currentWorkspaces[0];
      return focused ? [focused] : [];
    }
    return filtered;
  });

  const activeWindowTitle = createMemo(() => {
    const g = glazewmSig();
    if (!g) return null;

    const fc = g.focusedContainer as any;
    if (fc && fc.type === "window") {
      return (fc.title || fc.processName || "").trim();
    }

    const focusedWindow = g.allWindows?.find((w) => w.hasFocus);
    if (focusedWindow) {
      return (focusedWindow.title || focusedWindow.processName || "").trim();
    }

    return null;
  });

  return (
    <Show when={glazewmSig()}>
      <div class="flex items-center gap-1.5 select-none min-w-0">
        <div class="flex items-center gap-1 shrink-0">
          <For each={visibleWorkspaces()}>
            {(workspace) => (
              <button
                onClick={() =>
                  glazewmSig()!.runCommand(`focus --workspace ${workspace.name}`)
                }
                title={`Workspace ${workspace.displayName ?? workspace.name}`}
                class={cn(
                  "h-6 min-w-6 px-2 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-150",
                  workspace.hasFocus
                    ? "bg-[#8b5cf6] text-white font-bold shadow-[0_0_8px_rgba(139,92,246,0.5)] cursor-default"
                    : "bg-white/5 border border-white/10 text-[#d4d4d8] hover:bg-white/15 hover:text-white"
                )}
              >
                {workspace.displayName ?? workspace.name}
              </button>
            )}
          </For>
        </div>

        <Show when={activeWindowTitle()}>
          <div class="flex items-center gap-1.5 pl-1 min-w-0 overflow-hidden">
            <span class="text-zinc-600 text-xs font-semibold select-none shrink-0">/</span>
            <AppWindow size={13} class="text-[#8b5cf6] shrink-0" />
            <span
              class="text-xs text-[#f4f4f5] font-medium truncate whitespace-nowrap"
              title={activeWindowTitle() || ""}
            >
              {activeWindowTitle()}
            </span>
          </div>
        </Show>
      </div>
    </Show>
  );
}

export default Glazewm;

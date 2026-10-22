import { cn, openTaskManager } from "../../lib/utils";
import { Show, createEffect, createSignal } from "solid-js";
import { useProviders } from "../../lib/providers-context";
import { MemoryStick } from "lucide-solid";

function Memory() {
  const { memory, glazewm } = useProviders();
  const [memorySig, setMemorySig] = createSignal(memory());
  createEffect(() => setMemorySig(memory()));

  const memoryStats = () => {
    const mem = memorySig();
    if (!mem || !mem.totalMemory) return { percent: 0, usedGb: "0.0", totalGb: "0" };
    const percent = Math.round((mem.usedMemory / mem.totalMemory) * 100);
    const usedGb = (mem.usedMemory / 1073741824).toFixed(1);
    const totalGb = (mem.totalMemory / 1073741824).toFixed(0);
    return { percent, usedGb, totalGb };
  };

  return (
    <Show when={memorySig()}>
      <div
        class={cn(
          "h-6 px-2 rounded-md flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer text-xs select-none transition-colors duration-150 group"
        )}
        onClick={() => openTaskManager(glazewm())}
        title={`RAM Usage: ${memoryStats().usedGb} GB / ${memoryStats().totalGb} GB (${memoryStats().percent}%) (Click to open Task Manager)`}
      >
        <MemoryStick size={13} class="shrink-0 text-[#f472b6]" />
        <div class="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#f472b6] rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, memoryStats().percent))}%` }}
          />
        </div>
        <span class="text-[#f4f4f5] font-medium text-[11px] min-w-[28px]">
          {memoryStats().usedGb}G
        </span>
      </div>
    </Show>
  );
}

export default Memory;

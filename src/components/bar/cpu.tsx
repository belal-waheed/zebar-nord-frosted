import { cn, openTaskManager } from "../../lib/utils";
import { Show, createEffect, createSignal } from "solid-js";
import { useProviders } from "../../lib/providers-context";
import { Cpu as CpuIcon } from "lucide-solid";

function Cpu() {
  const { cpu, glazewm } = useProviders();
  const [cpuSig, setCpuSig] = createSignal(cpu());
  createEffect(() => setCpuSig(cpu()));

  const usage = () => Math.round(cpuSig()?.usage ?? 0);

  const usageColor = () => {
    const u = usage();
    if (u >= 80) return "text-[#f87171]";
    if (u >= 50) return "text-[#fbbf24]";
    return "text-[#a78bfa]";
  };

  const barColor = () => {
    const u = usage();
    if (u >= 80) return "bg-[#f87171]";
    if (u >= 50) return "bg-[#fbbf24]";
    return "bg-[#a78bfa]";
  };

  return (
    <Show when={cpuSig()}>
      <div
        class={cn(
          "h-6 px-2 rounded-md flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer text-xs select-none transition-colors duration-150 group"
        )}
        onClick={() => openTaskManager(glazewm())}
        title={`CPU Usage: ${usage()}% (Click to open Task Manager)`}
      >
        <CpuIcon size={13} class={cn("shrink-0", usageColor())} />
        <div class="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class={cn("h-full rounded-full transition-all duration-300", barColor())}
            style={{ width: `${Math.min(100, Math.max(0, usage()))}%` }}
          />
        </div>
        <span class="text-[#f4f4f5] font-semibold text-xs min-w-[28px] tracking-tight">
          {usage()}%
        </span>
      </div>
    </Show>
  );
}

export default Cpu;

import { cn } from "../../lib/utils";
import { Match, Show, Switch } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import { useProviders } from "../../lib/providers-context";
import {
  Battery as BatteryIcon,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
} from "lucide-solid";

function Battery() {
  const { battery } = useProviders();
  const [batterySig, setBatterySig] = createSignal(battery());
  createEffect(() => setBatterySig(battery()));

  const charge = () => Math.round(batterySig()?.chargePercent ?? 0);
  const isCharging = () => Boolean(batterySig()?.isCharging);

  const statusColor = () => {
    if (isCharging()) return "text-[#c084fc]";
    const c = charge();
    if (c > 40) return "text-[#4ade80]";
    if (c >= 20) return "text-[#fbbf24]";
    return "text-[#f87171]";
  };

  const barColor = () => {
    if (isCharging()) return "bg-[#c084fc]";
    const c = charge();
    if (c > 40) return "bg-[#4ade80]";
    if (c >= 20) return "bg-[#fbbf24]";
    return "bg-[#f87171]";
  };

  return (
    <Show when={batterySig()}>
      <div
        class={cn(
          "h-6 px-2 rounded-md flex items-center justify-center gap-1.5 bg-white/5 border border-white/5 text-xs select-none transition-colors duration-150",
          charge() < 20 && !isCharging() && "animate-pulse"
        )}
        title={`Battery: ${charge()}%${isCharging() ? " (Charging)" : ""}`}
      >
        <div class={cn("shrink-0", statusColor())}>
          <Switch>
            <Match when={isCharging()}>
              <BatteryCharging size={13} class="animate-pulse" />
            </Match>
            <Match when={charge() >= 80}>
              <BatteryFull size={13} />
            </Match>
            <Match when={charge() > 40}>
              <BatteryMedium size={13} />
            </Match>
            <Match when={charge() >= 20}>
              <BatteryLow size={13} />
            </Match>
            <Match when={charge() < 20}>
              <BatteryWarning size={13} />
            </Match>
          </Switch>
        </div>

        <div class="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class={cn("h-full rounded-full transition-all duration-300", barColor())}
            style={{ width: `${Math.min(100, Math.max(0, charge()))}%` }}
          />
        </div>

        <span class="text-[#f4f4f5] font-medium text-[11px] min-w-[24px]">
          {charge()}%
        </span>
      </div>
    </Show>
  );
}

export default Battery;

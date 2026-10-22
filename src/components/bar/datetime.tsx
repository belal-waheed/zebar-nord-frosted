import { cn } from "../../lib/utils";
import { createSignal, createEffect, onCleanup } from "solid-js";
import { Clock } from "lucide-solid";

function Datetime(props: { noIcon?: boolean }) {
  const [now, setNow] = createSignal(new Date());

  createEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    onCleanup(() => clearInterval(interval));
  });

  // Format: 'Thu Oct 22 • 9:35 PM'
  function formattedDateTime() {
    const date = now();
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${weekday} ${month} ${day} • ${hours}:${minutes} ${ampm}`;
  }

  return (
    <div
      class={cn(
        "h-6 px-2.5 rounded-md flex items-center justify-center gap-1.5 bg-white/5 border border-white/5 text-xs text-[#f4f4f5] font-medium select-none"
      )}
    >
      {!props.noIcon && <Clock size={13} class="text-[#8b5cf6] shrink-0" />}
      <span class="tracking-tight whitespace-nowrap">{formattedDateTime()}</span>
    </div>
  );
}

export default Datetime;

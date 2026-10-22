import { cn } from "../../lib/utils";
import { Match, Show, Switch } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import { useProviders } from "../../lib/providers-context";
import { Network as NetworkIcon, Wifi, WifiLow, WifiZero, WifiOff } from "lucide-solid";

function Network() {
  const { network } = useProviders();
  const [networkSig, setNetworkSig] = createSignal(network());
  createEffect(() => setNetworkSig(network()));

  const signalStrength = () => networkSig()?.defaultGateway?.signalStrength ?? 0;

  const networkType = () => {
    const net = networkSig();
    if (!net) return "disconnected";

    if (
      net.defaultInterface?.type === "ethernet" ||
      (net.interfaces.length > 0 &&
        net.interfaces[0].type === "ethernet" &&
        net.defaultInterface?.type !== "wifi")
    ) {
      return "ethernet";
    } else if (
      net.defaultInterface?.type === "wifi" ||
      (net.interfaces.length > 0 && net.interfaces[0].type === "wifi")
    ) {
      return "wifi";
    }
    return "disconnected";
  };

  const ssid = () => {
    const s = networkSig()?.defaultGateway?.ssid?.trim();
    if (!s) return "Wi-Fi";
    return s.length > 14 ? `${s.slice(0, 12)}...` : s;
  };

  return (
    <Show when={networkSig()}>
      <div
        class={cn(
          "h-6 px-2 rounded-md flex items-center justify-center gap-1.5 bg-white/5 border border-white/5 text-xs text-[#f4f4f5] select-none transition-colors duration-150"
        )}
        title={
          networkType() === "wifi"
            ? `Wi-Fi: ${networkSig()?.defaultGateway?.ssid || "Connected"} (${signalStrength()}%)`
            : networkType() === "ethernet"
            ? "Ethernet Connected"
            : "Network Disconnected"
        }
      >
        <div class="shrink-0 text-[#c084fc]">
          <Switch>
            <Match when={networkType() === "ethernet"}>
              <NetworkIcon size={13} />
            </Match>
            <Match when={networkType() === "wifi"}>
              <Switch>
                <Match when={signalStrength() >= 60}>
                  <Wifi size={13} />
                </Match>
                <Match when={signalStrength() >= 30}>
                  <WifiLow size={13} />
                </Match>
                <Match when={signalStrength() > 0}>
                  <WifiZero size={13} />
                </Match>
                <Match when={signalStrength() === 0}>
                  <Wifi size={13} />
                </Match>
              </Switch>
            </Match>
            <Match when={networkType() === "disconnected"}>
              <WifiOff size={13} class="text-zinc-600" />
            </Match>
          </Switch>
        </div>

        <Show when={networkType() === "wifi"}>
          <span class="text-[#f4f4f5] font-medium text-[11px] truncate max-w-[80px]">
            {ssid()}
          </span>
        </Show>

        <Show when={networkType() === "ethernet"}>
          <span class="text-[#f4f4f5] font-medium text-[11px]">Eth</span>
        </Show>
      </div>
    </Show>
  );
}

export default Network;

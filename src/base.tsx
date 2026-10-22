import Background from "./components/bar/background";
import Direction from "./components/bar/direction";
import Memory from "./components/bar/memory";
import Cpu from "./components/bar/cpu";
import Battery from "./components/bar/battery";
import Media from "./components/bar/media";
import Network from "./components/bar/network";
import Datetime from "./components/bar/datetime";
import Glazewm from "./components/bar/glazewm";
import { Index, Match, onCleanup, onMount, Switch } from "solid-js";
import Komorebi from "./components/bar/komorebi";
import { cn } from "./lib/utils";
import { ProvidersProvider } from "./lib/providers-context";
import Rss from "./components/bar/rss";
import Vpn from "./components/bar/vpn";

export interface Layout {
  topMargin: number;
  xMargin: number;
  columns: {
    align: "left" | "right" | "center";
    rounded?: ("top-left" | "top-right" | "bottom-left" | "bottom-right")[];
    width?: "auto" | number;
    components: {
      type:
        | "direction"
        | "memory"
        | "cpu"
        | "battery"
        | "media"
        | "network"
        | "vpn"
        | "datetime"
        | "rss"
        | "wm"
        | "systray";
      options?: { [key: string]: any };
    }[];
  }[];
}

export type Type = "glazewm" | "komorebi" | "vanilla";

const Base = (props: {
  wm: Type;
  layout: Layout;
  setLayout: (layout: Layout) => void;
}) => {
  const onDoubleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("config", "1");
      window.open(
        url.toString(),
        "_blank",
        "location=yes,height=570,width=520,scrollbars=yes,status=yes"
      );
    } catch {}
  };

  onMount(() => {
    document.addEventListener("dblclick", onDoubleClick);
  });

  onCleanup(() => {
    document.removeEventListener("dblclick", onDoubleClick);
  });

  return (
    <ProvidersProvider>
      <div
        class="w-full h-[34px] px-2 relative flex items-center justify-between select-none bg-transparent"
        style={{
          "margin-top": `${props.layout.topMargin ?? 0}px`,
          "margin-left": `${props.layout.xMargin ?? 0}px`,
          "margin-right": `${props.layout.xMargin ?? 0}px`,
          height: `34px`,
        }}
      >
        <Index each={props.layout.columns}>
          {(column) => (
            <div
              class={cn(
                "h-full flex items-center",
                column().align === "left" &&
                  "justify-start max-w-[calc(50vw-140px)] min-w-0",
                column().align === "center" &&
                  "absolute left-1/2 -translate-x-1/2 justify-center pointer-events-auto",
                column().align === "right" &&
                  "justify-end max-w-[calc(50vw-140px)] ml-auto"
              )}
            >
              <Background align={column().align} corners={column().rounded}>
                <Index each={column().components}>
                  {(component) => (
                    <Switch>
                      <Match
                        when={
                          component().type === "wm" && props.wm === "glazewm"
                        }
                      >
                        <Glazewm />
                      </Match>
                      <Match
                        when={
                          component().type === "wm" && props.wm === "komorebi"
                        }
                      >
                        <Komorebi />
                      </Match>
                      <Match when={component().type === "direction"}>
                        <Direction />
                      </Match>
                      <Match when={component().type === "memory"}>
                        <Memory />
                      </Match>
                      <Match when={component().type === "cpu"}>
                        <Cpu />
                      </Match>
                      <Match when={component().type === "battery"}>
                        <Battery />
                      </Match>
                      <Match when={component().type === "media"}>
                        <Media />
                      </Match>
                      <Match when={component().type === "network"}>
                        <Network />
                      </Match>
                      <Match when={component().type === "vpn"}>
                        <Vpn />
                      </Match>
                      <Match when={component().type === "datetime"}>
                        <Datetime />
                      </Match>
                      <Match when={component().type === "rss"}>
                        <Rss options={component().options} />
                      </Match>
                    </Switch>
                  )}
                </Index>
              </Background>
            </div>
          )}
        </Index>
      </div>
    </ProvidersProvider>
  );
};

export default Base;

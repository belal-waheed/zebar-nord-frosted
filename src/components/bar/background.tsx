import { cn } from "../../lib/utils";
import { JSX } from "solid-js";

interface BackgroundProps {
  children: JSX.Element;
  align?: "left" | "center" | "right";
  corners?: ("top-left" | "top-right" | "bottom-left" | "bottom-right")[];
}

const Background = (props: BackgroundProps) => {
  return (
    <div
      class={cn(
        "obsidian-island px-3 py-1 flex items-center h-[30px] rounded-lg gap-2",
        {
          "justify-start": props.align === "left",
          "justify-center": props.align === "center",
          "justify-end": props.align === "right",
        }
      )}
    >
      {props.children}
    </div>
  );
};

export default Background;

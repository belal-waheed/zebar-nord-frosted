/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import Base, { Layout } from "./base";
import ConfigMenu from "./components/config-menu";
import RssWindow from "./components/rss-window";
import { createSignal, Show } from "solid-js";

const defaultLayout: Layout = {
  topMargin: 0,
  xMargin: 0,
  columns: [
    {
      align: "left",
      width: "auto",
      components: [
        {
          type: "wm",
        },
      ],
    },
    {
      align: "center",
      width: "auto",
      components: [
        {
          type: "media",
        },
      ],
    },
    {
      align: "right",
      width: "auto",
      components: [
        {
          type: "cpu",
        },
        {
          type: "memory",
        },
        {
          type: "datetime",
        },
      ],
    },
  ],
};

render(() => <App />, document.getElementById("root")!);

function App() {
  const persistKey = "nord:layout:vanilla:v4";
  let initial = defaultLayout;
  try {
    const saved = localStorage.getItem(persistKey);
    if (saved) initial = JSON.parse(saved) as Layout;
  } catch {}

  const [layout, setLayout] = createSignal<Layout>(initial);
  const searchParams = new URLSearchParams(window.location.search);
  const [configOpen, setConfigOpen] = createSignal(searchParams.has("config"));
  const [rssOpen, setRssOpen] = createSignal(searchParams.has("rss"));

  return (
    <>
      <Show when={rssOpen()}>
        <RssWindow wm="vanilla" />
      </Show>
      <Show when={!configOpen() && !rssOpen()}>
        <Base wm="vanilla" layout={layout()} setLayout={setLayout} />
      </Show>
      <ConfigMenu
        layout={layout()}
        onChange={setLayout}
        persistKey={persistKey}
        initialOpen={configOpen()}
        onOpenChange={setConfigOpen}
      />
    </>
  );
}

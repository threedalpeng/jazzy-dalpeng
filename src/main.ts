import "./app.css";
import "uno.css";
// import "virtual:unocss-devtools";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app"),
});

export default app;

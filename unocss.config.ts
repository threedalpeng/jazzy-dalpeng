import { defineConfig, presetUno } from "unocss";
import { presetForms } from "@julr/unocss-preset-forms";

export default defineConfig({
  presets: [presetUno(), presetForms()],
  theme: {
    fontFamily: {
      jazz: "FinaleJazz",
      chord: "FinaleJazzChord",
    },
    colors: {
      primary: {},
    },
  },
});

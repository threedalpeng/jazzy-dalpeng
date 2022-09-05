<script lang="ts">
  import { Route, Router, navigate } from "svelte-routing";
  import ReloadPrompt from "./components/ReloadPrompt.svelte";
  import { getAudioContext, getInstrument } from "./components/utils/audio";
  import PracticePage from "./page/Practice/PracticePage.svelte";

  navigate("/jazz/practice/01-pitch-name-on-finger-board");
</script>

<main class="h-screen select-none overflow-hidden">
  <Router basepath="jazz">
    <Route path="practice/*">
      <PracticePage />
    </Route>
  </Router>
  <ReloadPrompt />
</main>

<style>
</style>

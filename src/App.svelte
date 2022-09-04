<script lang="ts">
  import { Route, Router, navigate } from "svelte-routing";
  import ReloadPrompt from "./lib/ReloadPrompt.svelte";
  import PracticePage from "./page/Practice/PracticePage.svelte";

  navigate("/practice/01-pitch-name-on-finger-board");
</script>

<main class="h-screen select-none">
  <Router>
    <Route path="practice/*">
      <PracticePage />
    </Route>
  </Router>
  <ReloadPrompt />
</main>

<style>
</style>

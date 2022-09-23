<script lang="ts">
  import { Route, Router, navigate } from "svelte-routing";
  import ReloadPrompt from "./components/ReloadPrompt.svelte";
  import PracticePage from "./page/Practice/PracticePage.svelte";
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

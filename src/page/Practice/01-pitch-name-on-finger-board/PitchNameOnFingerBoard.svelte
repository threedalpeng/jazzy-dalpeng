<script lang="ts">
  import FingerBoard from "@lib/FingerBoard.svelte";

  export let pitch;
  export let fingers;
  export let isFingerboardHidden = false;
</script>

<div class="block leading-1.2em h-fit font-jazz text-80px mb-0.5em select-none">
  {pitch}
</div>
{#if !isFingerboardHidden}
  <FingerBoard {fingers} />
{/if}

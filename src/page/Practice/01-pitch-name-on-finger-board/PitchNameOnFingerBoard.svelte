<script lang="ts">
  import FingerBoard from "@components/FingerBoard.svelte";

  export let pitch;
  export let fingers;
  export let isFingerboardHidden = false;
</script>

<div
  class="leading-1.2em font-jazz text-80px mb-0.5em block h-fit select-none text-center"
>
  {pitch}
</div>
{#if !isFingerboardHidden}
  <FingerBoard {fingers} />
{/if}

<script lang="ts">
  export let beat = 4;
  export let beatCount = 0;
</script>

<div
  class="gap-40px top-60px relative flex w-screen flex-row items-center justify-center"
>
  {#each new Array(beat) as i, j}
    {#if j === 0}
      {#if j === beatCount - 1}
        <div class="w-30px h-30px rounded-full bg-indigo-500" />
      {:else}
        <div class="w-30px h-30px rounded-full bg-indigo-900" />
      {/if}
    {:else if j === beatCount - 1}
      <div class="w-20px h-20px rounded-full bg-indigo-500" />
    {:else}
      <div class="w-20px h-20px rounded-full bg-indigo-900" />
    {/if}
  {/each}
</div>

<script lang="ts">
  import Line from "./Line.svelte";

  const lineProp = {
    points: [
      { x: 10, y: 20 },
      { x: 50, y: 60 },
    ],
  };
</script>

<Line {...lineProp} />

<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import MetronomeOptions from '$/lib/device/metronome/MetronomeOptions.svelte';
	import MetronomePlayButton from '$/lib/device/metronome/MetronomePlayButton.svelte';
</script>

<div class="h-full w-screen">
	<div class="relative h-full">
		<div class="absolute right-0 z-10 flex h-[60px] w-screen flex-row items-center justify-between">
			<div class="ml-4 flex h-full flex-row items-start justify-between gap-4">
				<MetronomeOptions />
			</div>
		</div>
		<div class="relative flex h-full flex-col items-center justify-center">
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>

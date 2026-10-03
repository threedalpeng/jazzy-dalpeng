<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { parseRecord, RECORD_KEY, KEYS, type LearningRecord } from '#lib/learning/major-scale.ts';
	let record = $state<LearningRecord | null>(null);
	const stages = ['지판 탐색', '도수 찾기', '반복 연주', '트라이어드 구성'];
	onMount(() => {
		try {
			record = parseRecord(localStorage.getItem(RECORD_KEY));
		} catch {
			/* Learning remains available without storage. */
		}
	});
</script>

<svelte:head
	><title>JazzyDalpeng · 재즈 기타 학습과 연습</title><meta
		name="description"
		content="메이저 스케일부터 코드까지, 지판과 소리로 이해하고 기타로 익히는 재즈 기타 연습 도구."
	/></svelte:head
>
<div class="home">
	<header>
		<span class="font-jazz">JazzyDalpeng / Jazz Guitar Practice</span><a href={resolve('/tools')}
			>도구</a
		>
	</header>
	<main>
		<p class="eyebrow">오늘의 연습</p>
		<h1>이해한 음악을,<br class="mobile" /> 지판에서 익혀요.</h1>
		<p class="intro">스케일의 관계를 찾고, 연주하고, 코드로 연결해 보세요.</p>
		<section class="lesson">
			<div>
				<span class="course-name font-jazz">Major Scale → Triad</span>
				<h2>메이저 스케일에서 트라이어드까지</h2>
				<p>6현 지판 탐색 · 도수 찾기 · 반복 연주 · 코드 구성</p>
				{#if record}<p class="saved">
						{KEYS[record.key].name} 메이저 · {stages[record.stage]}{record.complete ? ' 완료' : ''} ·
						{record.bpm} BPM
					</p>{/if}
			</div>
			<a class="btn btn-primary" href={resolve('/learn/major-scale')}
				>{record ? (record.complete ? '학습 결과와 복습' : '이어서 연습') : '학습 시작하기'} →</a
			>
		</section>
		<div class="sections">
			<section class="roadmap">
				<h2>학습의 연결</h2>
				<ol>
					<li class="available">
						<span>01</span>
						<div>지판과 메이저 스케일<small>현재 과정에서 시작</small></div>
					</li>
					<li class="available">
						<span>02</span>
						<div>트라이어드 구성<small>스케일의 1·3·5도로 연결</small></div>
					</li>
					<li>
						<span>03</span>
						<div>전위와 코드 연결<small>후속 학습 계획</small></div>
					</li>
					<li>
						<span>04</span>
						<div>블록코드와 모드<small>후속 학습 계획</small></div>
					</li>
				</ol>
			</section>
			<section class="tools">
				<h2>자유롭게 탐색하기</h2>
				<a href={resolve('/tools/chord-finder')}
					><span class="font-jazz">Chord Finder</span><small
						>지판에서 코드를 구성하고 확인하기 →</small
					></a
				><a href={resolve('/tools/metronome')}
					><span class="font-jazz">Metronome</span><small>박을 듣고 일정한 속도로 연습하기 →</small
					></a
				><a
					class="legacy"
					href={resolve('/practice/(practice)/[category]/[slug]', {
						category: 'core',
						slug: 'major-scale'
					})}>기존 스케일 연습 열기 →</a
				>
			</section>
		</div>
		<p class="privacy">
			학습 진도는 현재 브라우저에 저장됩니다. 기타 연주 결과는 스스로 평가합니다.
		</p>
	</main>
</div>

<style>
	.home {
		min-height: 100dvh;
		background: oklch(var(--b1));
		color: oklch(var(--bc));
	}
	header {
		max-width: 1080px;
		margin: auto;
		padding: 18px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid oklch(var(--b3));
	}
	header > span {
		font-size: 25px;
	}
	header a {
		color: oklch(var(--p));
		font-size: 12px;
	}
	main {
		max-width: 1040px;
		margin: auto;
		padding: 30px 24px;
	}
	.eyebrow {
		font-size: 12px;
		color: oklch(var(--p));
		font-weight: 700;
		margin-bottom: 8px;
	}
	h1 {
		font-size: 32px;
		line-height: 1.4;
		font-weight: 700;
	}
	.intro {
		font-size: 13px;
		color: #6b7280;
		margin-top: 10px;
	}
	.mobile {
		display: none;
	}
	.lesson {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		margin: 24px 0;
		padding: 24px;
		border: 1px solid oklch(var(--primary-light));
		border-radius: 12px;
		background: oklch(var(--primary-light) / 0.15);
	}
	.course-name {
		font-size: 28px;
		color: oklch(var(--p));
	}
	h2 {
		font-size: 16px;
		font-weight: 700;
	}
	.lesson h2 {
		margin-top: 8px;
	}
	.lesson p {
		font-size: 12px;
		color: #6b7280;
		margin-top: 6px;
	}
	.lesson .saved {
		color: oklch(var(--p));
	}
	.sections {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 32px;
	}
	.sections h2 {
		margin-bottom: 12px;
	}
	.roadmap ol {
		display: grid;
		gap: 12px;
	}
	.roadmap li {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 13px;
		color: #6b7280;
	}
	.roadmap li > span {
		font-family: FinaleJazz;
		font-size: 24px;
	}
	.roadmap .available {
		color: oklch(var(--bc));
	}
	.roadmap small {
		display: block;
		font-size: 10px;
		color: #6b7280;
	}
	.tools > a {
		display: block;
		padding: 12px 0;
		border-bottom: 1px solid oklch(var(--b3));
	}
	.tools .font-jazz {
		font-size: 26px;
		color: oklch(var(--p));
	}
	.tools small {
		display: block;
		font-size: 11px;
		color: #6b7280;
		margin-top: 3px;
	}
	.tools .legacy {
		font-size: 11px;
		color: oklch(var(--p));
	}
	.privacy {
		font-size: 10px;
		color: #6b7280;
		margin-top: 24px;
	}
	a:focus-visible {
		outline: 3px solid oklch(var(--p));
		outline-offset: 3px;
	}
	@media (max-width: 760px) {
		header {
			padding: 12px;
		}
		header > span {
			font-size: 19px;
		}
		main {
			padding: 18px 14px;
		}
		h1 {
			font-size: 25px;
		}
		.intro {
			font-size: 12px;
		}
		.lesson {
			padding: 16px;
			margin: 18px 0;
			flex-wrap: wrap;
			gap: 12px;
		}
		.course-name {
			font-size: 24px;
		}
		.lesson h2 {
			font-size: 14px;
		}
		.lesson p {
			font-size: 10px;
		}
		.lesson .btn {
			width: 100%;
			min-height: 44px;
			height: 44px;
			font-size: 12px;
		}
		.sections {
			gap: 20px;
		}
		.sections h2 {
			font-size: 13px;
		}
		.roadmap li {
			font-size: 11px;
			gap: 7px;
		}
		.roadmap small {
			font-size: 9px;
		}
		.tools .font-jazz {
			font-size: 22px;
		}
		.tools small {
			font-size: 10px;
		}
		.privacy {
			margin-top: 16px;
			font-size: 9px;
		}
	}
	@media (max-height: 740px) {
		main {
			padding-top: 12px;
			padding-bottom: 12px;
		}
		.lesson {
			margin: 12px 0;
			padding: 12px;
		}
		.intro {
			margin-top: 4px;
		}
		.roadmap ol {
			gap: 8px;
		}
		.tools > a {
			padding: 8px 0;
		}
		.privacy {
			margin-top: 12px;
		}
	}
</style>

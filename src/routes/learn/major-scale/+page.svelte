<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import FingerBoard, {
		type FingerInfo,
		type FingerPosition
	} from '#lib/guitar/finger-board/FingerBoard.svelte';
	import ChordNotation from '#lib/notation/ChordNotation.svelte';
	import { stringifyFinaleJazzChordSigns } from '#src/utils/music/font.ts';
	import {
		KEYS,
		RECORD_KEY,
		midiAt,
		scalePositions,
		scaleSequence,
		parseRecord,
		type ScalePosition
	} from '#lib/learning/major-scale.ts';
	import { LearningPlayer } from '#lib/learning/player.ts';

	const stages = ['탐색', '도수 찾기', '반복 연주', '코드 만들기'];
	const targets = [2, 3, 5];
	const ranges = [
		{ start: 0, title: '1–5 프렛' },
		{ start: 4, title: '5–9 프렛' },
		{ start: 8, title: '9–13 프렛' },
		{ start: 12, title: '13–17 프렛' }
	];
	let keyIndex = $state(0);
	let range = $state(4);
	let bpm = $state(72);
	let stage = $state(0);
	let answers = $state<number[]>([]);
	let assisted = $state(false);
	let assessment = $state('');
	let triad = $state<number[]>([]);
	let complete = $state(false);
	let loaded = $state(false);
	let storageError = $state('');
	let selected = $state<FingerPosition | null>(null);
	let accessiblePosition = $state('');
	let labelMode = $state<'degrees' | 'notes'>('degrees');
	let markers = $state(true);
	let direction = $state<'up' | 'down' | 'both'>('both');
	let repeat = $state(true);
	let countIn = $state(true);
	let playing = $state(false);
	let count = $state<number | null>(null);
	let active = $state<number | null>(null);
	let activeSequence = $state<ScalePosition[]>([]);
	let playingChord = $state(false);
	let audioError = $state('');
	let feedback = $state('');
	let player: LearningPlayer | undefined;
	let guideDialog = $state<HTMLDialogElement>();
	let selectionDialog = $state<HTMLDialogElement>();
	let settingsDialog = $state<HTMLDialogElement>();
	const key = $derived(KEYS[keyIndex]);
	const positions = $derived(scalePositions(keyIndex, range, range + 5));
	const sequence = $derived(scaleSequence(positions, direction));
	const target = $derived(targets[answers.length] ?? 5);
	const canAdvance = $derived(
		stage === 0 ||
			(stage === 1 && answers.length === 3) ||
			(stage === 2 && !!assessment) ||
			(stage === 3 && triad.length === 3)
	);
	const descriptions = [
		'음을 눌러 듣고, 음 이름과 도수를 비교해 보세요.',
		'같은 도수의 음을 여러 줄에서 찾아보세요.',
		'한 옥타브를 듣고 따라 연주한 뒤, 안내를 줄여보세요.',
		'메이저 스케일에서 1·3·5도를 골라 화음을 만드세요.'
	];
	const headings = $derived([
		'지판 탐색',
		answers.length === 3 ? '도수 찾기 완료' : `${target}도 찾기`,
		'한 옥타브 연주',
		'1·3·5도 구성'
	]);
	const glyph = (note: string) =>
		stringifyFinaleJazzChordSigns([
			note[0] as 'C',
			...(note.endsWith('#') ? ['Sharp' as const] : note.endsWith('b') ? ['Flat' as const] : [])
		]);
	const fingers = $derived.by((): FingerInfo[] => {
		const current = activeSequence[active ?? -1];
		return positions.map((p) => {
			const picked = selected?.line === p.position.line && selected?.fret === p.position.fret;
			const sounding = playing && (playingChord ? triad.includes(p.degree) : current?.id === p.id);
			const chordTone = stage === 3 && triad.includes(p.degree);
			const show = markers || picked || sounding || chordTone || p.degree === 1;
			return {
				position: p.position,
				text: show
					? labelMode === 'degrees'
						? p.degree === 1
							? 'R'
							: String(p.degree)
						: glyph(p.note)
					: '',
				textFont: labelMode === 'degrees' ? 'FinaleJazz' : 'FinaleJazzChord',
				style: {
					scale: show ? 1.75 : 0.65,
					color: sounding || picked || p.degree === 1 ? '#fff' : '#4338ca',
					background: sounding
						? '#312e81'
						: picked || p.degree === 1
							? '#4338ca'
							: chordTone
								? '#c7d2fe'
								: '#eef2ff'
				}
			};
		});
	});
	onMount(() => {
		player = new LearningPlayer(
			(index) => (active = index),
			(running, remaining) => {
				playing = running;
				count = remaining;
			}
		);
		try {
			const record = parseRecord(localStorage.getItem(RECORD_KEY));
			if (record) {
				keyIndex = record.key;
				range = record.range;
				bpm = record.bpm;
				direction = record.direction ?? 'both';
				repeat = record.repeat ?? true;
				countIn = record.countIn ?? true;
				stage = record.stage;
				answers = record.answers;
				assisted = record.assisted;
				assessment = record.assessment;
				triad = record.triad;
				complete = record.complete;
				markers = stage !== 1;
			}
		} catch {
			storageError = '진도를 저장할 수 없는 환경입니다. 현재 화면에서는 계속 연습할 수 있어요.';
		}
		loaded = true;
		const visibility = () => {
			if (document.hidden) player?.stop();
		};
		document.addEventListener('visibilitychange', visibility);
		return () => {
			document.removeEventListener('visibilitychange', visibility);
			player?.destroy();
		};
	});
	$effect(() => {
		if (!loaded) return;
		const record = {
			version: 1,
			key: keyIndex,
			range,
			bpm,
			direction,
			repeat,
			countIn,
			stage,
			answers: [...answers],
			assisted,
			assessment,
			triad: [...triad],
			complete,
			updated: new Date().toISOString()
		};
		try {
			localStorage.setItem(RECORD_KEY, JSON.stringify(record));
		} catch {
			storageError = '진도를 저장하지 못했어요. 이 화면을 닫으면 변경 내용이 사라질 수 있습니다.';
		}
	});
	$effect(() => {
		void keyIndex;
		void range;
		void bpm;
		void direction;
		void repeat;
		void countIn;
		if (loaded) untrack(() => player?.stop());
	});
	function changeKey(value: number) {
		player?.stop();
		keyIndex = value;
		stage = 0;
		complete = false;
		markers = true;
		accessiblePosition = '';
		selected = null;
		answers = [];
		triad = [];
		assessment = '';
		feedback = '';
		assisted = false;
	}
	function changeRange(value: number) {
		player?.stop();
		range = value;
		assessment = '';
		selected = null;
		accessiblePosition = '';
		feedback = '';
	}
	async function playNotes(notes: ScalePosition[], loop = false, intro = false, chord = false) {
		audioError = '';
		activeSequence = notes;
		playingChord = chord;
		try {
			await player?.play(
				notes.map((p) => p.midi),
				bpm,
				loop,
				intro,
				chord
			);
		} catch {
			audioError = '소리를 시작하지 못했어요. 다시 재생하거나 지판으로 계속 연습해 주세요.';
		}
	}
	function choose(position: FingerPosition) {
		if (position.fret === 'mute') return;
		if (position.fret === 'open' || position.fret === 0) {
			feedback = '표시 범위 밖';
			player?.stop();
			return;
		}
		selected = position;
		const pitch = midiAt(position);
		const info = positions.find(
			(p) => p.position.line === position.line && p.position.fret === position.fret
		);
		if (!info) {
			feedback = '스케일 밖의 음';
			player?.stop();
			return;
		}
		accessiblePosition = info.id;
		if (stage === 1) {
			if (answers.length === 3) feedback = `${info.note} · ${info.degree}도`;
			else if (info.degree === target) {
				answers = [...answers, target];
				feedback = `✓ ${info.note} · ${info.degree}도`;
			} else feedback = `${info.note} · ${info.degree}도`;
		} else if (stage === 3) {
			if ([1, 3, 5].includes(info.degree)) {
				triad = triad.includes(info.degree)
					? triad.filter((d) => d !== info.degree)
					: [...triad, info.degree].sort();
				feedback = `${info.note} · ${info.degree}도 ${triad.includes(info.degree) ? '추가' : '제외'}`;
			} else feedback = `${info.note} · ${info.degree}도`;
		} else feedback = `${info.note} · ${info.degree}도`;
		if (pitch !== null) void playNotes([info]);
	}
	function chordNotes() {
		return [1, 3, 5].flatMap((degree) => {
			const p = positions.filter((p) => p.degree === degree).sort((a, b) => a.midi - b.midi)[0];
			return p ? [p] : [];
		});
	}
	function advance() {
		player?.stop();
		selected = null;
		feedback = '';
		if (stage === 3) {
			complete = true;
			return;
		}
		stage++;
		markers = stage !== 1;
	}
	function restart() {
		player?.stop();
		stage = 0;
		answers = [];
		triad = [];
		assessment = '';
		assisted = false;
		complete = false;
		selected = null;
		markers = true;
		feedback = '';
	}
	function showHelp() {
		assisted ||= stage === 1;
		guideDialog?.showModal();
	}
	function toggleMarkers() {
		markers = !markers;
		if (stage === 1 && markers) assisted = true;
	}
</script>

<svelte:head
	><title>스케일에서 코드로 · JazzyDalpeng</title><meta
		name="description"
		content="6현 지판에서 메이저 스케일의 관계를 찾고, 반복 연주하며 트라이어드로 연결하는 기타 학습."
	/></svelte:head
>
<div class="learning" data-theme="dalpeng">
	<header>
		<a href={resolve('/')} class="brand font-jazz">JazzyDalpeng <span>Jazz Guitar Practice</span></a
		><button class="text-button" onclick={() => settingsDialog?.showModal()}>설정 · 진도</button>
	</header>
	<main>
		<div class="title-row">
			<div>
				<h1>스케일에서 코드로</h1>
			</div>
			<span class="key font-jazz">{key.name} major</span>
		</div>
		<ol class="steps" aria-label="학습 단계">
			{#each stages as name, index (name)}<li
					class:current={stage === index && !complete}
					class:done={stage > index || complete}
					aria-current={stage === index && !complete ? 'step' : undefined}
				>
					<span>{stage > index || complete ? '✓' : index + 1}</span>{name}
				</li>{/each}
		</ol>
		{#if complete}
			<section class="summary">
				<p class="eyebrow">학습을 마쳤어요</p>
				<h2>완료</h2>
				<div class="chord-result" aria-label={`${key.name} 메이저 코드`}>
					<ChordNotation root={key.name} />
				</div>
				<p>{key.notes[0]} · {key.notes[2]} · {key.notes[4]}</p>
				<dl>
					<div>
						<dt>이해 과제</dt>
						<dd>2·3·5도 찾기와 트라이어드 구성{assisted ? ' · 도움 사용' : ' · 도수 안내 없이'}</dd>
					</div>
					<div>
						<dt>연주 자기 평가</dt>
						<dd>{assessment} · {bpm} BPM · {range + 1}–{range + 5}프렛</dd>
					</div>
				</dl>
				<div class="summary-actions">
					<button class="primary" onclick={restart}>다시 연습하기</button><a
						class="secondary"
						href={resolve('/')}>학습 홈</a
					>
				</div>
			</section>
		{:else}
			<section class="exercise" aria-labelledby="task-title">
				<div class="task">
					<h2 id="task-title">{headings[stage]}</h2>
					<button class="text-button" onclick={showHelp}>가이드</button>
				</div>

				<div class="board-toolbar">
					<label
						>근음 <select
							aria-label="근음"
							value={keyIndex}
							onchange={(e) => changeKey(Number(e.currentTarget.value))}
							>{#each KEYS as option, index (option.name)}<option value={index}
									>{option.name}</option
								>{/each}</select
						></label
					>
					<label
						>범위 <select
							aria-label="프렛 범위"
							value={range}
							onchange={(e) => changeRange(Number(e.currentTarget.value))}
							>{#each ranges as option (option.start)}<option value={option.start}
									>{option.title}</option
								>{/each}</select
						></label
					>
					<div class="label-options">
						<button
							aria-pressed={labelMode === 'notes'}
							class:chosen={labelMode === 'notes'}
							onclick={() => (labelMode = 'notes')}>음 이름</button
						><button
							aria-pressed={labelMode === 'degrees'}
							class:chosen={labelMode === 'degrees'}
							onclick={() => {
								labelMode = 'degrees';
								if (stage === 1 && markers) assisted = true;
							}}>도수</button
						><button aria-pressed={markers} class:chosen={markers} onclick={toggleMarkers}
							>{markers ? '안내 켜짐' : '안내 꺼짐'}</button
						>
					</div>
				</div>
				<div class="fretboard" data-active-note={active} data-playing={playing}>
					<FingerBoard
						class="board"
						{fingers}
						fretRange={{ start: range, end: range + 5, visibility: 'all' }}
						onclick={choose}
						role="img"
						aria-label={`${key.name} 메이저의 6현 지판. 아래 음 선택 목록으로도 조작할 수 있습니다.`}
					/>
				</div>
				<div class="selection-row">
					<button class="text-button" onclick={() => selectionDialog?.showModal()}>음 선택</button
					><span class="selection-result" role="status">{feedback}</span>
				</div>
				{#if stage === 3}<div class="chord-strip" aria-label="트라이어드 구성">
						{#each [1, 3, 5] as degree (degree)}<span class:filled={triad.includes(degree)}
								>{degree}도
								<span class="font-chord"
									>{triad.includes(degree) ? glyph(key.notes[degree - 1]) : '·'}</span
								></span
							>{/each}<button
							class="text-button"
							disabled={triad.length !== 3}
							onclick={() => void playNotes(chordNotes(), false, false, true)}>화음 듣기</button
						>
					</div>{/if}

				{#if stage === 2}<fieldset>
						<legend>연주 평가</legend
						>{#each ['아직 어려움', '천천히 가능', '편하게 가능'] as option (option)}<label
								><input
									type="radio"
									name="assessment"
									value={option}
									bind:group={assessment}
								/>{option}</label
							>{/each}
					</fieldset>{/if}
				<div class="transport">
					<button
						class="primary"
						disabled={!sequence.length && !playing}
						onclick={() =>
							playing
								? player?.stop()
								: void playNotes(
										stage === 3 && triad.length === 3 ? chordNotes() : sequence,
										stage === 2 && repeat,
										stage === 2 && countIn,
										stage === 3 && triad.length === 3
									)}
						>{playing
							? '■ 재생 정지'
							: stage === 2
								? '▶ 연습 시작'
								: stage === 3 && triad.length === 3
									? '▶ 화음 듣기'
									: '▶ 스케일 듣기'}</button
					><label
						>템포 <input
							aria-label="템포"
							type="range"
							min="40"
							max="160"
							step="4"
							bind:value={bpm}
							oninput={() => (assessment = '')}
						/><span>{bpm} BPM</span></label
					>
				</div>
				{#if count !== null || audioError || storageError || !sequence.length}<p
						class="status"
						role="status"
					>
						{count !== null
							? `준비 · ${count}박`
							: audioError || storageError || '프렛 범위를 변경해 주세요.'}
					</p>{/if}
			</section>
			<footer>
				<button
					class="text-button"
					disabled={stage === 0}
					onclick={() => {
						player?.stop();
						stage--;
						selected = null;
						feedback = '';
						markers = stage !== 1;
					}}>← 이전</button
				><span class="lesson-progress"
					>{stage === 1
						? `${answers.length} / 3 확인`
						: stage === 3
							? `${triad.length} / 3 구성`
							: stage === 2
								? assessment
								: ''}</span
				><button class="primary" disabled={!canAdvance} onclick={advance}
					>{stage === 3
						? '학습 마치기'
						: stage === 0
							? '도수 찾기 →'
							: stage === 1
								? '반복 연주 →'
								: '코드 만들기 →'}</button
				>
			</footer>
		{/if}
	</main>
	<dialog class="panel" bind:this={selectionDialog} aria-label="지판 음 선택">
		<button class="close" onclick={() => selectionDialog?.close()}>닫기 ✕</button>
		<h2>음 선택</h2>
		<div class="selection-row">
			<span class="board-legend"
				>위: 1번 줄 · 아래: 6번 줄 · <span class="root-dot">R</span> 근음</span
			><label class="accessible"
				>음 선택 <select aria-label="지판 음 선택" bind:value={accessiblePosition}
					><option value="">줄과 프렛 선택</option>{#each positions as p (p.id)}<option value={p.id}
							>{p.position.line}번 줄 {p.position.fret}프렛 · {labelMode === 'notes'
								? p.note
								: '스케일 음'}</option
						>{/each}</select
				></label
			><button
				class="secondary compact"
				disabled={!accessiblePosition}
				onclick={() => {
					const p = positions.find((p) => p.id === accessiblePosition);
					if (p) choose(p.position);
					selectionDialog?.close();
				}}>선택 확인</button
			>
		</div>
	</dialog>
	<dialog class="panel" bind:this={guideDialog} aria-label="학습 가이드">
		<button class="close" onclick={() => guideDialog?.close()}>닫기 ✕</button>
		<p class="eyebrow">학습 가이드 · {stages[stage]}</p>
		<p>{descriptions[stage]}</p>
		<p>
			지판의 위는 1번 줄, 아래는 6번 줄입니다. R은 근음이고 숫자는 도수입니다. 음을 눌러 듣거나 음
			선택 목록을 이용하세요.
		</p>
		<h2>
			{stage === 3
				? '스케일의 1·3·5도가 트라이어드예요'
				: stage === 2
					? '반복 연주와 자기 평가'
					: '도수는 근음에서의 역할이에요'}
		</h2>
		<p>
			{stage === 2
				? '연습 시작을 누르면 현재 범위의 한 옥타브를 재생합니다. 설정에서 연주 방향, 반복, 시작 전 4박 준비를 선택할 수 있어요. 기타로 따라 연주한 뒤 자신의 연주 느낌을 선택하면 다음 단계로 이동합니다. 템포나 범위를 바꾸면 재생이 멈추고 평가를 다시 선택하게 됩니다.'
				: stage === 3
					? `${key.name} 메이저에서 ${key.notes[0]}, ${key.notes[2]}, ${key.notes[4]}를 선택해요. 한 도수를 고르면 지판의 같은 역할을 가진 음들이 함께 표시됩니다. 화음 듣기는 낮은 위치의 세 코드톤을 사용합니다.`
					: `${key.name} 메이저의 근음은 ${key.notes[0]}예요. 2도는 2반음, 3도는 4반음, 5도는 7반음 위에 있습니다. 줄과 위치가 달라도 같은 도수의 관계는 유지돼요.`}
		</p>
		<div class="relationships">
			{#each [1, 2, 3, 5] as degree (degree)}<span
					><span class="font-chord">{glyph(key.notes[degree - 1])}</span><small>{degree}도</small
					></span
				>{/each}
		</div>
		<button
			class="secondary"
			onclick={() => {
				markers = true;
				labelMode = 'degrees';
				assisted ||= stage === 1;
				guideDialog?.close();
			}}>지판에 도수 안내 켜기</button
		>
		<p class="muted">기준음은 음높이 확인용이며 기타 연주는 스스로 평가합니다.</p>
		<p class="muted">
			안내를 보며 이해한 뒤, 표시를 숨기고 다른 키에서도 확인해 보세요. 학습 기록에는 도움 사용
			여부가 남습니다.
		</p>
	</dialog>
	<dialog class="panel" bind:this={settingsDialog}>
		<button class="close" onclick={() => settingsDialog?.close()}>닫기 ✕</button>
		<h2>연습 설정과 진도</h2>
		<label class="setting"
			>연주 방향 <select bind:value={direction}
				><option value="both">올라갔다 내려오기</option><option value="up">올라가기</option><option
					value="down">내려오기</option
				></select
			></label
		><label class="setting"
			><span>반복 연주</span><input type="checkbox" bind:checked={repeat} /></label
		><label class="setting"
			><span>시작 전 4박 준비</span><input type="checkbox" bind:checked={countIn} /></label
		>
		<p>
			현재 단계: {stages[stage]}{complete ? ' · 완료' : ''}<br />{key.name} 메이저 · {range +
				1}–{range + 5}프렛 · {bpm} BPM
		</p>
		<p class="muted">
			근음을 변경하면 새 키의 과정을 탐색부터 시작합니다. 진도는 이 브라우저에 저장됩니다. 기기 간
			동기화는 제공하지 않습니다. 자동 연주 판정은 하지 않습니다.
		</p>
		<button
			class="secondary"
			onclick={() => {
				if (window.confirm('이 과정의 학습 진도를 초기화할까요?')) {
					restart();
					settingsDialog?.close();
				}
			}}>학습 진도 초기화</button
		>{#if storageError}<p role="alert">{storageError}</p>{/if}
	</dialog>
</div>

<style>
	.learning {
		min-height: 100dvh;
		background: oklch(var(--b1));
		color: oklch(var(--bc));
	}
	header {
		max-width: 1120px;
		margin: auto;
		padding: 12px 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid oklch(var(--b3));
	}
	.brand {
		font-size: 26px;
	}
	.brand span {
		font-size: 20px;
	}
	main {
		max-width: 1080px;
		margin: auto;
		padding: 18px 22px;
	}
	.title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.eyebrow {
		font-size: 11px;
		color: oklch(var(--p));
		margin-bottom: 4px;
		font-weight: 700;
	}
	h1 {
		font-size: 24px;
		font-weight: 700;
		line-height: 1.3;
	}
	.key {
		font-size: 24px;
		color: oklch(var(--p));
	}
	.steps {
		display: flex;
		gap: 24px;
		margin: 16px 0;
		list-style: none;
		padding: 0;
	}
	.steps li {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 12px;
		color: #6b7280;
	}
	.steps li span {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border: 1px solid oklch(var(--b3));
		border-radius: 50%;
	}
	.steps li.current {
		color: oklch(var(--p));
		font-weight: 700;
	}
	.steps li.current span,
	.steps li.done span {
		background: oklch(var(--p));
		color: oklch(var(--pc));
		border-color: oklch(var(--p));
	}
	.exercise,
	.summary {
		border: 1px solid oklch(var(--b3));
		border-radius: 12px;
		padding: 18px 22px;
	}
	.task {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	h2 {
		font-size: 20px;
		font-weight: 700;
		line-height: 1.4;
	}
	.text-button {
		color: oklch(var(--p));
		padding: 8px 4px;
		font-size: 12px;
		white-space: nowrap;
		min-height: 36px;
	}
	.text-button:disabled {
		color: #9ca3af;
	}
	.board-toolbar {
		display: flex;
		align-items: center;
		gap: 18px;
		font-size: 11px;
	}
	.board-toolbar label,
	.accessible {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	select {
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		border-bottom: 2px solid oklch(var(--b3));
		padding: 5px 2px;
		max-width: 100%;
		font-size: 12px;
		border-radius: 0;
	}
	.label-options {
		margin-left: auto;
		display: flex;
		gap: 4px;
	}
	.label-options button {
		padding: 6px 10px;
		font-size: 11px;
		border-radius: 6px;
		min-height: 36px;
	}
	.label-options .chosen {
		background: oklch(var(--primary-light) / 0.4);
		color: oklch(var(--p));
	}
	.fretboard {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 210px;
		margin: 8px 0;
	}
	.fretboard :global(canvas) {
		display: block;
		width: auto;
		height: 100%;
		max-width: 100%;
		object-fit: fill;
	}
	.selection-row {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 11px;
	}
	.accessible select {
		max-width: 210px;
	}
	.secondary,
	.primary {
		min-height: 44px;
		border-radius: 8px;
		padding: 10px 16px;
		font-size: 12px;
		font-weight: 700;
	}
	.primary {
		background: oklch(var(--p));
		color: oklch(var(--pc));
	}
	.secondary {
		border: 1px solid oklch(var(--primary-light));
		color: oklch(var(--p));
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.compact {
		min-height: 36px;
		padding: 6px 10px;
		font-size: 11px;
	}
	button:disabled {
		background: oklch(var(--b2));
		color: #9ca3af;
		cursor: not-allowed;
	}
	.transport {
		display: flex;
		align-items: center;
		gap: 16px;
		justify-content: space-between;
	}
	.transport label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
	}
	.transport input {
		width: 110px;
		accent-color: oklch(var(--p));
	}
	.transport label span {
		white-space: nowrap;
	}
	.status,
	.muted {
		font-size: 10px;
		line-height: 1.6;
		color: #6b7280;
		margin-top: 6px;
	}
	fieldset {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px 16px;
		margin: 8px 0;
	}
	legend {
		font-size: 12px;
		font-weight: 700;
		margin-bottom: 4px;
	}
	fieldset label {
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
		font-size: 12px;
	}
	input {
		accent-color: oklch(var(--p));
	}
	footer {
		display: flex;
		align-items: center;
		gap: 12px;
		justify-content: space-between;
		margin-top: 12px;
	}
	.lesson-progress {
		font-size: 11px;
		color: #6b7280;
	}
	.chord-strip {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 8px;
	}
	.chord-strip > span {
		padding: 6px 10px;
		border: 1px solid oklch(var(--b3));
		border-radius: 6px;
		font-size: 11px;
	}
	.chord-strip .filled {
		border-color: oklch(var(--p));
		background: oklch(var(--primary-light) / 0.3);
	}
	.chord-strip .font-chord {
		font-size: 20px;
	}
	.panel {
		width: min(440px, calc(100vw - 32px));
		max-height: calc(100dvh - 32px);
		overflow: auto;
		margin: auto;
		padding: 24px;
		border-radius: 14px;
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		border: 1px solid oklch(var(--primary-light));
	}
	.panel::backdrop {
		background: #1e1b4b55;
	}
	.close {
		display: block;
		margin-left: auto;
		padding: 8px;
		font-size: 12px;
		color: oklch(var(--p));
	}
	.panel p {
		font-size: 13px;
		line-height: 1.8;
		margin: 12px 0;
	}
	.panel .muted {
		font-size: 11px;
	}
	.relationships {
		display: flex;
		justify-content: space-around;
		gap: 12px;
		margin: 18px 0;
	}
	.relationships .font-chord {
		font-size: 30px;
		color: oklch(var(--p));
	}
	.relationships small {
		display: block;
		font-size: 11px;
		text-align: center;
	}
	.setting {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		margin: 18px 0;
		font-size: 13px;
	}
	.summary {
		max-width: 760px;
		margin: auto;
	}
	.chord-result {
		font-size: 64px;
		line-height: 1.3;
		color: oklch(var(--p));
		margin: 14px 0;
	}
	.summary > p {
		font-size: 13px;
		line-height: 1.7;
	}
	.summary dl {
		display: grid;
		gap: 12px;
		background: oklch(var(--primary-light) / 0.2);
		padding: 16px;
		border-radius: 8px;
		margin: 18px 0;
	}
	.summary dt {
		font-size: 11px;
		color: #6b7280;
	}
	.summary dd {
		font-size: 13px;
		margin-top: 4px;
	}
	.summary-actions {
		display: flex;
		gap: 10px;
		margin-top: 18px;
	}
	button:focus-visible,
	a:focus-visible,
	input:focus-visible,
	select:focus-visible {
		outline: 3px solid oklch(var(--p));
		outline-offset: 3px;
	}
	@media (max-width: 760px) {
		header {
			padding: 8px 12px;
		}
		.brand {
			font-size: 23px;
		}
		.brand span {
			display: none;
		}
		main {
			padding: 10px 12px;
		}
		h1 {
			font-size: 20px;
		}
		.eyebrow {
			font-size: 10px;
		}
		.key {
			font-size: 20px;
		}
		.steps {
			gap: 12px;
			margin: 10px 0;
		}
		.steps li {
			font-size: 10px;
			gap: 4px;
		}
		.steps li span {
			width: 21px;
			height: 21px;
		}
		.exercise,
		.summary {
			padding: 12px;
		}
		h2 {
			font-size: 17px;
		}
		.task .text-button {
			font-size: 10px;
		}
		.board-toolbar {
			flex-wrap: wrap;
			gap: 6px 12px;
		}
		.board-toolbar label {
			font-size: 10px;
		}
		.label-options {
			width: 100%;
			justify-content: flex-end;
		}
		.label-options button {
			padding: 5px 9px;
			min-height: 30px;
		}
		.fretboard {
			height: 185px;
			margin: 4px 0;
		}
		.selection-row {
			flex-wrap: wrap;
			gap: 6px;
		}
		.accessible {
			flex: 1;
			min-width: 0;
			font-size: 10px;
		}
		.accessible select {
			min-width: 0;
			max-width: 175px;
			font-size: 11px;
		}
		.transport {
			gap: 6px;
			flex-wrap: wrap;
		}
		.transport input {
			width: 70px;
		}
		.transport label {
			font-size: 10px;
			gap: 5px;
		}
		.primary,
		.secondary {
			padding: 10px 12px;
			font-size: 11px;
		}
		fieldset {
			gap: 0 12px;
			margin: 6px 0;
		}
		fieldset label {
			font-size: 11px;
			min-height: 32px;
		}
		footer {
			margin-top: 8px;
			gap: 5px;
		}
		.lesson-progress {
			font-size: 10px;
		}
		.chord-strip {
			gap: 5px;
		}
		.chord-strip > span {
			padding: 4px 7px;
		}
		.chord-strip .text-button {
			font-size: 10px;
		}
		.status {
			font-size: 9px;
		}
	}
	@media (max-height: 800px) {
		main {
			padding-top: 8px;
			padding-bottom: 8px;
		}
		.steps {
			margin: 8px 0;
		}
		.fretboard {
			height: 170px;
		}
		.exercise {
			padding-top: 10px;
			padding-bottom: 10px;
		}
		.status {
			margin-top: 3px;
		}
		footer {
			margin-top: 6px;
		}
	}
	@media (max-width: 760px) and (max-height: 740px) {
		.fretboard {
			height: 148px;
		}
		.label-options {
			width: auto;
			margin-left: auto;
			gap: 0;
		}
		.label-options button {
			font-size: 10px;
			padding: 4px 6px;
		}
		.board-toolbar {
			gap: 4px 8px;
		}
		.board-toolbar label {
			gap: 3px;
		}
		.board-toolbar select {
			font-size: 10px;
		}
		fieldset legend {
			font-size: 11px;
		}
		.steps {
			gap: 10px;
		}
	}

	.lesson-progress {
		min-width: 0;
	}
	footer > .primary {
		white-space: nowrap;
		flex-shrink: 0;
	}
	@media (max-width: 760px) {
		.compact {
			min-height: 36px;
			padding: 6px 10px;
		}
	}
	@media (max-width: 760px) and (max-height: 740px) {
		.fretboard {
			height: 140px;
		}
		.exercise {
			padding-left: 10px;
			padding-right: 10px;
		}
	}

	.selection-result {
		margin-left: auto;
		font-size: 12px;
		color: oklch(var(--p));
		text-align: right;
	}
	.panel .selection-row {
		margin-top: 20px;
		flex-wrap: wrap;
	}
	.panel .accessible {
		width: 100%;
		flex: none;
	}
	.panel .accessible select {
		max-width: none;
		flex: 1;
	}
	.panel .compact {
		margin-left: auto;
	}
	.board-toolbar {
		margin-top: 14px;
	}
	.fretboard {
		height: 280px;
	}
	@media (max-width: 760px) {
		.fretboard {
			height: 240px;
		}
		.selection-result {
			font-size: 11px;
		}
	}
	@media (max-height: 800px) {
		.fretboard {
			height: 210px;
		}
	}
	@media (max-width: 760px) and (max-height: 740px) {
		.fretboard {
			height: 200px;
		}
	}
</style>

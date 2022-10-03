class BoxOffice<Type extends Function> {
  #map = new Map<number, Type>();
  #nextId = 0;
  #incrementId() {
    return this.#nextId++;
  }

  pickup(ticket: number) {
    return this.#map.get(ticket);
  }

  reserve() {
    return this.#incrementId();
  }

  purchase(value: Type) {
    let ticket = this.#incrementId();
    this.#map.set(ticket, value);
    return ticket;
  }

  show(data: any) {
    this.#map.forEach((cb) => {
      cb(data);
    });
  }
}

interface MetronomeOption {
  beatCount?: number;
  beatNote?: number;
  bpm?: number;
}
interface MetronomeState {
  beatCount: number;
  beatNote: number;
  bpm: number;
  currentBeat: number;
  barPassed: number;
}
type OnBeatCallback = (state: MetronomeState) => any;
type OnBarCallback = (state: MetronomeState) => any;

// beat per minute == beat/minute == beat/(second * 60) === beat/(ms * 60 * 1000)
const MILLISECOND_PER_MINUTE = 60000;
class Metronome {
  #beatCount = 4;
  #beatNote = 4;
  get beatCount() {
    return this.#beatCount;
  }
  set beatCount(value: number) {
    this.#beatCount = value;
  }
  get beatNote() {
    return this.#beatNote;
  }
  set beatNote(value: number) {
    this.#beatNote = value;
    this.#timeout = MILLISECOND_PER_MINUTE / (this.#bpm * this.#beatNote);
  }

  #bpm = 120;
  #timeout = MILLISECOND_PER_MINUTE / (this.#bpm * this.#beatNote);
  get bpm() {
    return this.#bpm;
  }
  set bpm(value: number) {
    this.#bpm = value;
    this.#timeout = MILLISECOND_PER_MINUTE / (this.#bpm * this.#beatNote);
  }

  get state() {
    return {
      beatCount: this.#beatCount,
      beatNote: this.#beatNote,
      bpm: this.#bpm,
      currentBeat: this.#currentBeat,
      barPassed: this.#barPassed,
    };
  }

  static create(option: MetronomeOption = {}) {
    const { beatCount = 4, beatNote = 4, bpm = 120 } = option;
    const newMetronome = new Metronome();
    newMetronome.beatCount = beatCount;
    newMetronome.beatNote = beatNote;
    newMetronome.bpm = bpm;
    return newMetronome;
  }

  #isRunning = false;
  #currentBeat = 0;
  #barPassed = 0;
  #timerId: number;
  run() {
    if (!this.#isRunning) {
      this.#isRunning = true;
      this.#timerId = window.setInterval(() => {
        this.#onBeatStore.show(this.state);
        if (this.#currentBeat === 0) {
          this.#onBarStore.show(this.state);
        }

        this.#currentBeat++;
        if (this.#currentBeat > this.#beatCount) {
          this.#barPassed++;
          this.#currentBeat = 0;
        }
      }, this.#timeout);
    }
  }

  stop() {
    if (this.#isRunning) {
      window.clearInterval(this.#timerId);
      this.#isRunning = false;
      this.#currentBeat = 0;
      this.#barPassed = 0;
    }
  }

  #onBeatStore = new BoxOffice<OnBeatCallback>();
  onBeat(cb: OnBeatCallback) {
    this.#onBeatStore.purchase(cb);
  }

  #onBarStore = new BoxOffice<OnBeatCallback>();
  onBar(cb: OnBarCallback) {
    this.#onBarStore.purchase(cb);
  }
}

export default Metronome;

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

  close() {
    this.#map.clear();
  }
}

export interface MetronomeOption {
  beatPerBar?: number;
  beatUnit?: number;
  bpm?: number;
}
export interface MetronomeState {
  beatPerBar: number;
  beatUnit: number;
  bpm: number;
  currentBeat: number;
  barPassed: number;
}
type OnBeatCallback = (state: MetronomeState) => any;
type OnBarCallback = (state: MetronomeState) => any;

// beat per minute == beat/minute == beat/(second * 60) === beat/(ms * 60 * 1000)
const MILLISECOND_PER_MINUTE = 60000;
class Metronome {
  #beatPerBar = 4;
  get beatPerBar() {
    return this.#beatPerBar;
  }
  set beatPerBar(value: number) {
    this.#beatPerBar = value;
  }
  #beatUnit = 4;
  get beatUnit() {
    return this.#beatUnit;
  }
  set beatUnit(value: number) {
    this.#beatUnit = value;
    this.#timeout = MILLISECOND_PER_MINUTE / (this.#bpm * this.#beatUnit);
  }

  #bpm = 120;
  #timeout = MILLISECOND_PER_MINUTE / (this.#bpm * this.#beatUnit);
  get bpm() {
    return this.#bpm;
  }
  set bpm(value: number) {
    this.#bpm = value;
    this.#timeout = MILLISECOND_PER_MINUTE / (this.#bpm * this.#beatUnit);
  }

  get state() {
    return {
      beatPerBar: this.#beatPerBar,
      beatUnit: this.#beatUnit,
      bpm: this.#bpm,
      currentBeat: this.#currentBeat,
      barPassed: this.#barPassed,
    };
  }

  static create(option: MetronomeOption = {}) {
    const { beatPerBar = 4, beatUnit = 4, bpm = 120 } = option;
    const newMetronome = new Metronome();
    newMetronome.beatPerBar = beatPerBar;
    newMetronome.beatUnit = beatUnit;
    newMetronome.bpm = bpm;
    return newMetronome;
  }

  #isRunning = false;
  get isRunning() {
    return this.#isRunning;
  }
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
        if (this.#currentBeat > this.#beatPerBar) {
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

  toggle() {
    if (this.#isRunning) {
      this.stop();
    } else {
      this.run();
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

  destroy() {
    this.stop();
    this.#onBeatStore.close();
    this.#onBarStore.close();
  }
}

export default Metronome;

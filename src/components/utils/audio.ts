import Soundfont from "soundfont-player";

let audioCtx: AudioContext = null;
const instruments = new Map<Soundfont.InstrumentName, Soundfont.Player>();

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  audioCtx.resume();
  return audioCtx;
}

export async function getInstrument(instrument: Soundfont.InstrumentName) {
  if (instruments.has(instrument)) {
    return instruments.get(instrument);
  } else {
    const inst = await Soundfont.instrument(audioCtx, instrument);
    instruments.set(instrument, inst);
    return inst;
  }
}

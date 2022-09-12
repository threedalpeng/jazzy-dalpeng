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
  if (!audioCtx) {
    getAudioContext();
  }
  if (instruments.has(instrument)) {
    return instruments.get(instrument);
  } else {
    const inst = await Soundfont.instrument(
      audioCtx,
      `/jazz/soundfonts/MusyngKite/${instrument}-mp3.js` as Soundfont.InstrumentName,
      {
        decay: 0.1,
        sustain: 0.2,
      }
    );
    instruments.set(instrument, inst);
    return inst;
  }
}

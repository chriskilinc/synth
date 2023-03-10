import { useState } from 'react'
import './App.less'

function App() {
  const [audioContext, setAudioContext] = useState(new AudioContext());
  let oscillators: any = [];

  const requestMidi = () => {
    navigator.requestMIDIAccess().then((midiAccess) => {
      console.log(midiAccess)
      const inputs = Array.from(midiAccess.inputs);
      const outputs = Array.from(midiAccess.outputs);
      console.log("inputs", inputs);
      console.log("outputs", outputs);

      midiAccess.addEventListener("statechange", onMidiStateChange);

      inputs.forEach(inputGroup => {
        console.log("inputGroup", inputGroup);
        inputGroup.forEach(input => {
          if (typeof input === "string" || input instanceof String) {
            return;
          }

          console.log("input:", input);
          (input as WebMidi.MIDIInput).addEventListener("midimessage", onMidiMessage)
        })
      });

      audioContext || setAudioContext(new AudioContext());
      console.log(audioContext)

    }, onRejectedAccess)
  }

  const onRejectedAccess = (reason: any) => {
    console.log("Could not connect MIDI", reason)
  }

  const onMidiStateChange = (event: WebMidi.MIDIConnectionEvent) => {
    console.log(event.port.name, event.port.manufacturer, event.port.state);
  }

  const onMidiMessage = (input: WebMidi.MIDIMessageEvent) => {
    console.log(input)
    const command = input.data[0];  // if command 128, note is off
    const note = input.data[1];
    const velocity = input.data[2];
    console.log(command, note, velocity);

    switch (command) {
      case 144:
        if (velocity > 0) {
          noteOn(note, velocity);
        } else {
          noteOff(note);
        }
        break;
      case 128:
        noteOff(note);
        break;
      default:
        break;
    }
  }

  const noteOn = (note: number, velocity: number) => {
    const oscillator = audioContext.createOscillator();
    const oscillatorGain = audioContext.createGain();
    const velocityGain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = midiToFrequency(note);
    oscillatorGain.gain.value = 0.33;

    const velocityGainAmount = (1 / 127) * velocity;
    velocityGain.gain.value = velocityGainAmount;

    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(velocityGain);
    velocityGain.connect(audioContext.destination);

    (oscillator as any).gain = oscillatorGain;
    oscillators[note.toString()] = oscillator;
    oscillator.start();
  }

  const noteOff = (note: number) => {
    const oscillator = oscillators[note.toString()];
    const oscillatorGain = oscillator.gain;

    (oscillatorGain as GainNode).gain.setValueAtTime(oscillatorGain.gain.value, audioContext.currentTime);
    (oscillatorGain as GainNode).gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.03);

    setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect();
    }, 30);

    delete oscillators[note.toString()];
  }

  const midiToFrequency = (midiNumber: number) => {
    const a = 440;  // hz
    return (a / 32) * (2 ** ((midiNumber - 9) / 12));
  }

  return (
    <div className="App">
      <header className="header">
        <button onClick={requestMidi}>requestMidi</button>
      </header>
      <section className="container">
      </section>
    </div>
  )
}

export default App
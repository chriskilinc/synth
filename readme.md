# MIDI SYNTH (Proof of Concept)
Simple MIDI synth using react on vite POC

Made using AKAI MPK mini. 
Because midi keyboards executes MIDI differently, this might not work on your device.

```
Flow:

Request MIDI access -> Wire up midi inputs -> Act on midi On/Off

noteOn: oscillator -> Gain -> Velocity -> AudioContext.destination
noteOff: Ramp Gain -> Stop -> Disconnect
```

I will most likely not continue on this proof of concept and instead use a framework that handles this for me.

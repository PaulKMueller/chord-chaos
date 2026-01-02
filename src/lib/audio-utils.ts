export class MetronomeAudio {
  private audioContext: AudioContext | null = null;

  playTick(isDownbeat: boolean) {
    if (!this.audioContext) this.audioContext = new AudioContext();

    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    // High pitch for beat 1, lower for 2, 3, 4
    osc.frequency.value = isDownbeat ? 880 : 440;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(
      0.00001,
      this.audioContext.currentTime + 0.1
    );

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }
}

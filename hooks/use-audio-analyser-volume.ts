import { useEffect, useState } from "react";

function readAnalyserVolume(analyser: AnalyserNode): number {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum / (data.length * 255);
}

export function useAnalyserVolume(analyser: AnalyserNode | null): number {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!analyser) {
      setVolume(0);
      return;
    }

    let raf = 0;
    const tick = () => {
      setVolume(readAnalyserVolume(analyser));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return volume;
}

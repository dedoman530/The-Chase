const audioState = {
  context: null,
  buffers: new Map(),
  bufferPromises: new Map(),
  loops: new Map(),
};

function getContext() {
  if (audioState.context) return audioState.context;
  const AudioContextRef = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextRef) return null;
  audioState.context = new AudioContextRef({ latencyHint: "interactive" });
  return audioState.context;
}

export function unlockAudio() {
  const context = getContext();
  if (!context) return Promise.resolve();
  if (context.state === "suspended") {
    return context.resume().catch(() => {});
  }
  return Promise.resolve();
}

async function ensureBuffer(key, url) {
  if (!url) return null;
  if (audioState.buffers.has(key)) return audioState.buffers.get(key);
  if (audioState.bufferPromises.has(key)) {
    return audioState.bufferPromises.get(key);
  }

  const context = getContext();
  if (!context) return null;

  const loadPromise = fetch(url)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      audioState.buffers.set(key, buffer);
      audioState.bufferPromises.delete(key);
      return buffer;
    })
    .catch(() => {
      audioState.bufferPromises.delete(key);
      return null;
    });

  audioState.bufferPromises.set(key, loadPromise);
  return loadPromise;
}

export function preloadSounds(entries) {
  if (!entries || entries.length === 0) return Promise.resolve();
  return Promise.all(
    entries.map((entry) => ensureBuffer(entry.key, entry.url))
  ).then(() => {});
}

export async function playSfx(key, url, { volume = 1 } = {}) {
  const context = getContext();
  if (!context) return null;
  await unlockAudio();
  const buffer = await ensureBuffer(key, url);
  if (!buffer) return null;
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start(0);
  return { source, gain };
}

export async function playLoop(key, url, { volume = 1 } = {}) {
  const context = getContext();
  if (!context) return null;
  await unlockAudio();
  const buffer = await ensureBuffer(key, url);
  if (!buffer) return null;
  const existing = audioState.loops.get(key);
  if (existing) {
    existing.gain.gain.value = volume;
    return existing;
  }
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.loop = true;
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start(0);
  audioState.loops.set(key, { source, gain });
  return { source, gain };
}

export function stopLoop(key) {
  const entry = audioState.loops.get(key);
  if (!entry) return;
  try {
    entry.source.stop(0);
  } catch {
    // Ignore invalid state errors when stopping.
  }
  audioState.loops.delete(key);
}

export function stopSource(source) {
  if (!source) return;
  try {
    source.stop(0);
  } catch {
    // Ignore invalid state errors when stopping.
  }
}

const u = [
  { key: "A", accidental: "#", relativeMinor: "F#" },
  { key: "A#", accidental: "#", relativeMinor: "G" },
  { key: "Bb", accidental: "b", relativeMinor: "G" },
  { key: "B", accidental: "#", relativeMinor: "G#" },
  { key: "C", accidental: "b", relativeMinor: "A" },
  { key: "C#", accidental: "#", relativeMinor: "A#" },
  { key: "Db", accidental: "b", relativeMinor: "Bb" },
  { key: "D", accidental: "#", relativeMinor: "B" },
  { key: "D#", accidental: "#", relativeMinor: "C" },
  { key: "Eb", accidental: "b", relativeMinor: "C" },
  { key: "E", accidental: "#", relativeMinor: "C#" },
  { key: "F", accidental: "b", relativeMinor: "D" },
  { key: "F#", accidental: "#", relativeMinor: "D#" },
  { key: "Gb", accidental: "b", relativeMinor: "Eb" },
  { key: "G", accidental: "#", relativeMinor: "E" },
  { key: "G#", accidental: "#", relativeMinor: "F" },
  { key: "Ab", accidental: "b", relativeMinor: "F" }
], c = [
  ["A"],
  ["A#", "Bb"],
  ["B"],
  ["C"],
  ["C#", "Db"],
  ["D"],
  ["D#", "Eb"],
  ["E"],
  ["F"],
  ["F#", "Gb"],
  ["G"],
  ["G#", "Ab"]
], b = [
  { variant: "maj", tones: [0, 4, 7] },
  { variant: "m", tones: [0, 3, 7] },
  { variant: "min", tones: [0, 3, 7] },
  { variant: "dim", tones: [0, 3, 6] },
  { variant: "aug", tones: [0, 4, 8] },
  { variant: "7", tones: [0, 4, 7, 10] },
  { variant: "m7", tones: [0, 3, 7, 10] },
  { variant: "maj7", tones: [0, 4, 7, 11] },
  { variant: "aug7", tones: [0, 4, 8, 10] },
  { variant: "dim7", tones: [0, 3, 6, 9] },
  { variant: "m7b5", tones: [0, 3, 6, 10] },
  { variant: "mMaj7", tones: [0, 3, 7, 11] },
  { variant: "sus2", tones: [0, 2, 7] },
  { variant: "sus4", tones: [0, 5, 7] },
  { variant: "7sus2", tones: [0, 2, 7, 10] },
  { variant: "7sus4", tones: [0, 5, 7, 10] },
  { variant: "9", tones: [0, 4, 7, 10, 14] },
  { variant: "m9", tones: [0, 3, 7, 10, 14] },
  { variant: "maj9", tones: [0, 4, 7, 11, 14] },
  { variant: "11", tones: [0, 4, 7, 10, 14, 17] },
  { variant: "m11", tones: [0, 3, 7, 10, 14, 17] },
  { variant: "13", tones: [0, 4, 7, 10, 14, 17, 21] },
  { variant: "m13", tones: [0, 3, 7, 10, 14, 17, 21] },
  { variant: "5", tones: [0, 7] },
  { variant: "6", tones: [0, 4, 7, 9] },
  { variant: "m6", tones: [0, 3, 7, 9] },
  { variant: "add9", tones: [0, 4, 7, 14] },
  { variant: "mAdd9", tones: [0, 3, 7, 14] }
], g = [
  { variant: "major", tones: [0, 2, 4, 5, 7, 9, 11] },
  { variant: "minor", tones: [0, 2, 3, 5, 7, 8, 10] },
  { variant: "major pentatonic", tones: [0, 2, 4, 7, 9] },
  { variant: "minor pentatonic", tones: [0, 3, 5, 7, 10] },
  { variant: "blues", tones: [0, 3, 5, 6, 7, 10] }
], A = [
  { variant: "major", chords: ["maj", "min", "min", "maj", "maj", "min", "dim"] },
  { variant: "minor", chords: ["min", "dim", "maj", "min", "min", "maj", "maj"] }
], k = [
  { id: "ukulele", name: "Standard Ukulele", strings: ["G", "C", "E", "A"], frets: 19 },
  { id: "baritone-ukulele", name: "Baritone Ukulele", strings: ["D", "G", "B", "E"], frets: 19 },
  { id: "ukulele-5ths", name: "5ths tuned Ukulele", strings: ["C", "G", "D", "A"], frets: 19 },
  { id: "guitar", name: "Standard Guitar", strings: ["E", "A", "D", "G", "B", "E"], frets: 15 },
  { id: "guitar-drop-d", name: "Drop-D Guitar", strings: ["D", "A", "D", "G", "B", "E"], frets: 15 },
  { id: "mandolin", name: "Standard Mandolin", strings: ["G", "D", "A", "E"], frets: 20 }
], y = (e) => k.find((n) => n.id === e), j = (e, n) => {
  if (y(e))
    throw new Error(`Instrument with id "${e}" is already registered.`);
  const t = { id: e, ...n };
  return k.push(t), t;
}, M = /\[([A-Ga-g](?:#|b)?)(m|min|maj|aug|dim|7|m7|maj7|aug7|dim7|m7b5|mMaj7|sus2|sus4|7sus2|7sus4|9|m9|maj9|11|m11|13|m13|5|6|m6|add9|mAdd9)?(-[a-zA-Z0-9]*)?\]/gm, f = (e) => {
  const n = /* @__PURE__ */ new Map();
  return [...e.matchAll(M)].forEach(([, t, a, r]) => {
    n.set(`${t}${a || ""}${r || ""}`, { key: t, chord: a, alt: r });
  }), n;
}, G = (e) => (n) => {
  if (!e || !n) return;
  const { strings: t } = e;
  return [...t].reverse().map((a, r) => {
    let s = 0, i = l(a), d = c[i];
    for (; d.every((o) => {
      var m;
      return !((m = n == null ? void 0 : n.notes) != null && m.includes(o));
    }); )
      ++s, d = c[(s + i) % c.length];
    return [r + 1, s];
  });
}, l = (e) => c.findIndex((n) => n.includes(e)), D = (e) => {
  var d;
  const n = Array.from(f(`[${e}]`));
  if (!n || !n.length) return { name: "", notes: [] };
  const [, { key: t, chord: a, alt: r }] = n[0], { accidental: s } = u.find(
    (o) => o.key === t
  ) ?? { accidental: "" }, i = l(t);
  return {
    name: `${t}${a || ""}${r || ""}`,
    notes: (d = b.find((o) => a ? o.variant === a : o.variant === "maj")) == null ? void 0 : d.tones.map(
      (o) => c[(o + i) % c.length].find((m, h, v) => v.length > 1 && s ? m.endsWith(s) : v[0])
    )
  };
}, E = (e, n) => {
  var s;
  const t = l(e), { accidental: a } = u.find(
    (i) => i.key === e
  ) ?? { accidental: "" };
  return (s = g.find(({ variant: i }) => i === n)) == null ? void 0 : s.tones.map(
    (i) => c[(i + t) % c.length].find((d, o, m) => m.length > 1 && a ? d.endsWith(a) : m[0])
  );
};
export {
  G as chordOnInstrument,
  D as chordToNotes,
  b as chords,
  A as chordsPerScale,
  l as findBase,
  y as getInstrument,
  k as instruments,
  u as keys,
  c as notes,
  f as parseChords,
  j as registerInstrument,
  E as scaleTones,
  g as scales
};

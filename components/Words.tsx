"use client";

/**
 * Splits a string into reveal-ready word spans. Pair with a ScrollTrigger that
 * animates `.reveal-word > span` from translateY(110%) to 0.
 */
export default function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span className="reveal-word" key={i}>
          <span>{word}&nbsp;</span>
        </span>
      ))}
    </>
  );
}

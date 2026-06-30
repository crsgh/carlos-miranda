"use client";

export default function Marquee({
  items,
  duration = 26,
}: {
  items: string[];
  duration?: number;
}) {
  const Track = ({ hidden = false }: { hidden?: boolean }) => (
    <div className="marquee__track" aria-hidden={hidden}>
      {items.map((item, i) => (
        <span className="marquee__item" key={i}>
          {item}
          {/* U+FE0E forces text (not emoji) rendering on iOS/Android */}
          <span>{"✳︎"}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="marquee"
      style={{ ["--marquee-dur" as string]: `${duration}s` }}
    >
      <Track />
      <Track hidden />
    </div>
  );
}

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: "default" | "large";
};

export function Avatar({ name, src, size = "default" }: AvatarProps) {
  const initial = (name ?? "HerFlower").slice(0, 1).toUpperCase();
  const sizeClass = size === "large" ? " avatar-large" : "";

  return (
    <div className={`avatar${sizeClass}`}>
      {src ? <img src={src} alt={`${name ?? "HerFlower member"} avatar`} /> : initial}
    </div>
  );
}

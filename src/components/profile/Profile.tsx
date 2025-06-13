import { profile } from "@/config.ts";

import { Link } from "@/deps.ts";

export function Profile() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <img
        className="size-14 md:size-14 object-cover bg-muted-foreground rounded-full border-2 border-secondary shadow-sm"
        src={profile.avatar}
        alt="Avatar"
        loading="lazy"
      />

      <div className="flex flex-col">
        <h3 className="text-lg font-bold leading-[1.25]">{profile.name}</h3>
        <p className="text-sm text-muted-foreground">@{profile.handle}</p>
      </div>
    </Link>
  );
}

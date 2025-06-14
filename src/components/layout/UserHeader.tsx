import { profile } from "@/config.ts";
import { nl2br } from "@/lib/utils.ts";

type Props = {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export function UserHeader({ leading, trailing }: Props) {
  return (
    <div className="p-4 md:p-6 pb-0 md:pb-0">
      <div className="relative container aspect-[3/1] md:aspect-[4/1]">
        {profile.banner && (
          <img
            src={profile.banner}
            alt="Banner"
            className="w-full h-full object-cover rounded-xl bg-muted-foreground border"
            loading="lazy"
          />
        )}

        <div className="absolute top-0 left-0 p-3 md:p-4 w-full">
          <div className="flex justify-between items-center w-full">
            <div>{leading}</div>
            <div>{trailing}</div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full translate-y-1/2">
          <div className="content px-3 md:px-6">
            <img
              className="block size-20 md:size-32 object-cover bg-muted-foreground rounded-full border-3 border-secondary shadow"
              src={profile.avatar}
              alt="Avatar"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div className="h-10 md:h-16" />

      <div className="content mt-2 md:mt-3">
        <h1 className="text-3xl md:text-3xl font-bold">{profile.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">@{profile.handle}</p>
        <p
          className="mt-2 text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: nl2br(profile.description || ""),
          }}
        />
      </div>
    </div>
  );
}

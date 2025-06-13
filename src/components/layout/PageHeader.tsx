import { profile } from "@/config.ts";

type Props = {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export function PageHeader({ leading, trailing }: Props) {
  return (
    <div className="p-4 md:p-6 pb-0 md:pb-0">
      <div className="relative w-full aspect-[3/1] md:aspect-[4/1]">
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
      </div>
    </div>
  );
}

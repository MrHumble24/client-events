import { useTelegram } from "@/providers/TelegramProvider";

export function Header() {
  const { initData } = useTelegram();
  const user = initData?.user;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.first_name?.charAt(0) ?? "E"}
            </span>
          </div>
          <div>
            <h1 className="text-sm font-semibold">Events</h1>
            {user && (
              <p className="text-xs text-muted-foreground">
                Hi, {user.first_name}!
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

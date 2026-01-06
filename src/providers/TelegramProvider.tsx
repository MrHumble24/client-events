import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  init,
  miniApp,
  themeParams,
  viewport,
  backButton,
  mainButton,
  initData,
  type InitData,
} from "@telegram-apps/sdk-react";
import { setInitData, userApi } from "../lib/api";
import { useAppStore } from "../store/useAppStore";

// ============================================
// TELEGRAM CONTEXT
// ============================================

interface TelegramContextValue {
  isReady: boolean;
  isTelegramApp: boolean;
  initDataRaw: string | null;
  initData: InitData | null;
  colorScheme: "light" | "dark";
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  isTelegramApp: false,
  initDataRaw: null,
  initData: null,
  colorScheme: "light",
});

export const useTelegram = () => useContext(TelegramContext);

// ============================================
// TELEGRAM PROVIDER
// ============================================

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [initDataRaw, setInitDataRawState] = useState<string | null>(null);
  const [parsedInitData, setParsedInitData] = useState<InitData | null>(null);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const { setLoading, setUser } = useAppStore();

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Check if running in Telegram
        const isTg = typeof window !== "undefined" && window.Telegram?.WebApp;

        if (!isTg) {
          console.log("Not running in Telegram WebApp, using development mode");
          setIsTelegramApp(false);
          setIsReady(true);
          setLoading(false);
          return;
        }

        // Initialize Telegram SDK
        init();

        // Mount components
        if (miniApp.mount.isAvailable()) {
          miniApp.mount();
          miniApp.ready();
        }

        if (themeParams.mount.isAvailable()) {
          themeParams.mount();
        }

        if (viewport.mount.isAvailable()) {
          viewport.mount();
          viewport.expand();
        }

        if (backButton.mount.isAvailable()) {
          backButton.mount();
        }

        if (mainButton.mount.isAvailable()) {
          mainButton.mount();
        }

        // Get init data
        const rawData = initData.raw();
        const data = initData.state();

        if (rawData) {
          setInitDataRawState(rawData);
          setInitData(rawData); // Set for API calls
          setParsedInitData(data ?? null);

          // Fetch user from backend (this creates user if not exists)
          try {
            const user = await userApi.getMe();
            setUser(user);
          } catch (error) {
            console.error("Failed to fetch user:", error);
          }
        }

        // Get color scheme
        const scheme = miniApp.isDark?.() ? "dark" : "light";
        setColorScheme(scheme);

        // Apply theme to document
        if (scheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

        setIsTelegramApp(true);
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize Telegram SDK:", error);
        setIsTelegramApp(false);
        setIsReady(true);
      } finally {
        setLoading(false);
      }
    };

    initTelegram();
  }, [setLoading, setUser]);

  return (
    <TelegramContext.Provider
      value={{
        isReady,
        isTelegramApp,
        initDataRaw,
        initData: parsedInitData,
        colorScheme,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

// ============================================
// TELEGRAM HOOKS
// ============================================

/**
 * Hook to control the back button
 */
export const useBackButton = (onClick?: () => void, visible = true) => {
  useEffect(() => {
    if (!backButton.isMounted()) return;

    if (visible && onClick) {
      backButton.show();
      backButton.onClick(onClick);
    } else {
      backButton.hide();
    }

    return () => {
      if (onClick) {
        backButton.offClick(onClick);
      }
    };
  }, [onClick, visible]);
};

/**
 * Hook to control the main button
 */
export const useMainButton = (
  text: string,
  onClick: () => void,
  options?: {
    visible?: boolean;
    disabled?: boolean;
    loading?: boolean;
  }
) => {
  const { visible = true, disabled = false, loading = false } = options ?? {};

  useEffect(() => {
    if (!mainButton.isMounted()) return;

    mainButton.setParams({
      text,
      isEnabled: !disabled && !loading,
      isLoaderVisible: loading,
      isVisible: visible,
    });

    if (visible && !disabled && !loading) {
      mainButton.onClick(onClick);
    }

    return () => {
      mainButton.offClick(onClick);
      mainButton.setParams({ isVisible: false });
    };
  }, [text, onClick, visible, disabled, loading]);
};

// Extend Window interface for Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: unknown;
    };
  }
}

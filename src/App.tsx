import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  House,
  ArrowLeftRight,
  Plus,
  ChartNoAxesColumn,
  Wallet as WalletIcon,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Wallets from "./pages/Wallets";
import Savings from "./pages/Savings";
import Budgets from "./pages/Budgets";
import SettingsPage from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

import QuickAddSheet from "./components/transactions/QuickAddSheet";

import { useAuthContext } from "./contexts/AuthContext";
import { useWallets } from "./hooks/useWallets";

import { saveMovement } from "./services/transactionService";

type Page =
  | "dashboard"
  | "transactions"
  | "reports"
  | "wallets"
  | "savings"
  | "budgets"
  | "settings";

const paths: Record<Page, string> = {
  dashboard: "/",
  transactions: "/transactions",
  reports: "/reports",
  wallets: "/wallets",
  savings: "/savings",
  budgets: "/budgets",
  settings: "/settings",
};

function pageFromPath(pathname: string): Page {
  const entry = (
    Object.entries(paths) as [Page, string][]
  ).find(([, path]) => path === pathname);

  return entry?.[0] ?? "dashboard";
}

function BottomNav({
  activePage,
  onNavigate,
  onAdd,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onAdd: () => void;
}) {
  const items = [
    {
      page: "dashboard" as const,
      label: "Inicio",
      Icon: House,
    },
    {
      page: "transactions" as const,
      label: "Movimientos",
      Icon: ArrowLeftRight,
    },
    {
      page: "reports" as const,
      label: "Reportes",
      Icon: ChartNoAxesColumn,
    },
    {
      page: "wallets" as const,
      label: "Billeteras",
      Icon: WalletIcon,
    },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-[470px] -translate-x-1/2"
    >
      <div className="pointer-events-auto relative flex items-center justify-around rounded-[26px] border border-white/[0.11] bg-[#11151E]/95 px-2 py-2 shadow-[0_14px_45px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {items.slice(0, 2).map(({ page, label, Icon }) => (
          <button
            key={page}
            type="button"
            onClick={() => onNavigate(page)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-colors ${
              activePage === page
                ? "text-[#80A7FF]"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={21} />
            <span className="text-[9px] font-medium">
              {label}
            </span>
          </button>
        ))}

        <motion.button
          type="button"
          aria-label="Nuevo movimiento"
          onClick={onAdd}
          whileTap={{ scale: 0.91 }}
          whileHover={{ y: -2 }}
          className="relative mx-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-blue-300/30 bg-gradient-to-br from-[#5685F4] to-[#285DDC] text-white shadow-[0_6px_24px_rgba(57,116,255,0.24)]"
        >
          <Plus size={28} strokeWidth={2.1} />
        </motion.button>

        {items.slice(2).map(({ page, label, Icon }) => (
          <button
            key={page}
            type="button"
            onClick={() => onNavigate(page)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-colors ${
              activePage === page
                ? "text-[#80A7FF]"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={21} />
            <span className="text-[9px] font-medium">
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const { user, loading } = useAuthContext();
  const { wallets } = useWallets();

  const [activePage, setActivePage] = useState<Page>(() =>
    pageFromPath(window.location.pathname)
  );

  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const [authPath, setAuthPath] = useState(
    window.location.pathname
  );

  useEffect(() => {
    function syncLocation() {
      setActivePage(
        pageFromPath(window.location.pathname)
      );

      setAuthPath(window.location.pathname);
    }

    window.addEventListener("popstate", syncLocation);

    return () => {
      window.removeEventListener(
        "popstate",
        syncLocation
      );
    };
  }, []);

  function navigate(page: Page) {
    window.history.pushState({}, "", paths[page]);
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSaveMovement(movement: {
    type: "expense" | "income" | "transfer";
    amount: number;
    category: string;
    description: string;
    walletId: string;
    toWalletId?: string;
  }) {
    if (!user) {
      throw new Error(
        "Debes iniciar sesión para guardar movimientos."
      );
    }

    await saveMovement(user.uid, {
      type: movement.type,
      amount: movement.amount,
      walletId: movement.walletId,
      destinationWalletId: movement.toWalletId,
      category: movement.category,
      description: movement.description,
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080A0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#729FFF]" />
      </div>
    );
  }

  if (!user) {
    if (authPath === "/register") {
      return <Register />;
    }

    return <Login />;
  }

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            onNavigate={(page) => {
              if (page in paths) {
                navigate(page as Page);
              }
            }}
          />
        );

      case "transactions":
        return <Transactions />;

      case "reports":
        return <Reports />;

      case "wallets":
        return <Wallets />;

      case "savings":
        return <Savings />;

      case "budgets":
        return <Budgets />;

      case "settings":
        return <SettingsPage />;

      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="min-h-dvh bg-[#080A0E] text-white">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -7 }}
          transition={{
            duration: 0.22,
            ease: "easeOut",
          }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      <BottomNav
        activePage={activePage}
        onNavigate={navigate}
        onAdd={() => setShowQuickAdd(true)}
      />

      <QuickAddSheet
        open={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        wallets={wallets}
        onSave={handleSaveMovement}
      />
    </div>
  );
}

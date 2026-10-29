
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function AppLayout({
  children,
  className = "",
}: Props) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#080A0E] text-white">
      <div className="pointer-events-none fixed left-1/2 top-[-260px] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#3974FF]/[0.045] blur-[110px]" />

      <div
        className={`relative mx-auto w-full max-w-[520px] pb-28 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

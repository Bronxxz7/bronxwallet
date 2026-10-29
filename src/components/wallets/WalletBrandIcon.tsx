
import { useState } from "react";
import { Banknote, Wallet } from "lucide-react";

type WalletBrandIconProps = {
  name: string;
  size?: number;
  className?: string;
};

const walletLogos: Record<string, string> = {
  yape: "/wallets/yape.png",
  bcp: "/wallets/bcp.png",
  prexpe: "/wallets/prexpe.png",
  prex: "/wallets/prexpe.png",
  lemon: "/wallets/lemon-cash.png",
  binance: "/wallets/binance.png",
  paypal: "/wallets/paypal.png",
  efectivo: "/wallets/efectivo.png",
};

function getWalletLogo(name: string): string | null {
  const normalized = name.toLowerCase().trim();

  const key = Object.keys(walletLogos).find((item) =>
    normalized.includes(item)
  );

  return key ? walletLogos[key] : null;
}

export default function WalletBrandIcon({
  name,
  size = 42,
  className = "",
}: WalletBrandIconProps) {
  const image = getWalletLogo(name);
  const [failedImage, setFailedImage] = useState<string | null>(
    null
  );

  const isCash = name.toLowerCase().includes("efectivo");
  const canShowImage = image !== null && failedImage !== image;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-white/10 bg-[#171D28] shadow-[0_5px_16px_rgba(0,0,0,0.25)] ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {canShowImage ? (
        <img
          src={image}
          alt={`Logo de ${name}`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailedImage(image)}
        />
      ) : isCash ? (
        <Banknote
          size={size * 0.55}
          className="text-amber-400"
        />
      ) : (
        <Wallet
          size={size * 0.5}
          className="text-blue-400"
        />
      )}
    </div>
  );
}

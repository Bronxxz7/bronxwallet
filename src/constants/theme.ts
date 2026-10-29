
export const BRONX_THEME = {
  background: "#080A0E",
  surface: "#11151E",
  surfaceElevated: "#171E2B",
  border: "rgba(255,255,255,0.09)",
  primary: "#3974FF",
  primarySoft: "#80A7FF",
  success: "#25C58B",
  danger: "#FB6575",
  muted: "#8A99B0",
} as const;

export const APP_NAME = "BRONXWALLET";

export const formatMoney = (cents: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(cents / 100);

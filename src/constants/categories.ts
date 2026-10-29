
export const EXPENSE_CATEGORIES = [
  "Comida",
  "Transporte",
  "Compras",
  "Entretenimiento",
  "Servicios",
  "Educación",
  "Salud",
  "Otros",
] as const;

export const INCOME_CATEGORIES = [
  "Sueldo",
  "Negocio",
  "Freelance",
  "Regalo",
  "Otros",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Comida: "#FB6575",
  Transporte: "#3974FF",
  Compras: "#9665F5",
  Entretenimiento: "#EABF54",
  Servicios: "#25C58B",
  Educación: "#36B9E8",
  Salud: "#E879A6",
  Otros: "#8290A8",
};

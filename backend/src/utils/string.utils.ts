export function capitalize(str: string | undefined): string {
  if (str === undefined) {
    return "";
  }
  return str.trim().toUpperCase();
}

export function capitalizeFirst(str: string | undefined): string {
  if (str === undefined) {
    return "";
  }
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
}

export function minimize(str: string | undefined): string {
  if (str === undefined) {
    return "";
  }
  return str.trim().toLowerCase();
}

export function keepOnlyLetters(str : string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
}
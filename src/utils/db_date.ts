export type DbDate = `${string}-${string}-${string}`;

export function dbDate(date: Date): DbDate {
  function datePartString(number: number, { zeroIndexed = false }: { zeroIndexed?: boolean } = {}) {
    const datePart = zeroIndexed ? number + 1 : number;
  
    if (datePart < 10) {
      return `0${datePart}`;
    } else {
      return `${datePart}`;
    }
  }

  return `${date.getFullYear()}-${datePartString(date.getMonth(), { zeroIndexed: true })}-${datePartString(date.getDate())}`;
}

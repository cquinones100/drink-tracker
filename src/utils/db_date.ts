export function dbDate(date: Date) {
  function datePartString(number: number, { zeroIndexed = false }: { zeroIndexed?: boolean } = {}) {
    const datePart = zeroIndexed ? number + 1 : number;
  
    if (datePart < 10) {
      return `0${datePart}`;
    } else {
      return `${datePart}`;
    }
  }

  return `${datePartString(date.getMonth(), { zeroIndexed: true })}-${datePartString(date.getDate())}-${date.getFullYear()}`
}

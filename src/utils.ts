export function isAlphaNumeric(str: string): boolean {
  for (let i = 0, len = str.length, code = 0; i < len; ++i) {
    code = str.charCodeAt(i);
    if (
      (code > 47 && code < 58) || // numeric (0-9)
      (code > 64 && code < 91) || // upper alpha (A-Z)
      (code > 96 && code < 123) // lower alpha (a-z)
    )
      continue;

    return false;
  }
  return true;
}

export function isSymbol(char: string): boolean {
  return ['+', '-', '/', '*', '%'].includes(char) || isAlphaNumeric(char);
}

export function isNumeric(number: string): boolean {
  return !isNaN(parseFloat(number)) && !isNaN(+number);
}

import { InterpreterLocation, Symbols } from './types';

export class Cursor {
  private readonly file: string;
  private readonly length: number;
  private lineBreaks: number[] = [0];

  constructor(file: string) {
    this.file = file;
    this.length = file.length;
    this.constructLineBreaks(file);
  }

  constructLineBreaks(str: string): void {
    for (let charIndex = 0; charIndex < str.length; ) {
      switch (str[charIndex]) {
        case Symbols.LF: {
          charIndex += 2;
          this.lineBreaks.push(charIndex);
          break;
        }
        case Symbols.CR: {
          charIndex += 2;
          if (str[charIndex] === Symbols.LF) {
            charIndex += 2;
          }
          this.lineBreaks.push(charIndex);
          break;
        }
        default: {
          charIndex++;
          break;
        }
      }
    }
  }

  getFileChunk(position: InterpreterLocation, offsetStart = 10, offsetEnd = 20) {
    const { line, column } = position;
    const { lineBreaks, length } = this;

    const index = lineBreaks[line] + column;
    if (index > length) return null;

    const start = Math.max(index - offsetStart, 0);
    const end = index + Math.min(lineBreaks[line + 1] ?? Infinity, offsetEnd);

    return this.file.substring(start, end);
  }
}

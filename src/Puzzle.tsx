import React, { useCallback, useEffect, useState } from "react";
import data from "./data";
import GameRow from "./GameRow";
import valid from "./valid";

type Props = {
  activePuzzleIndex: number;
  guess: string[];
  setGuess: (a: string[]) => void;
  cursorIndex: number;
  setCursorIndex: (a: number) => void;
};

export function handleKeyInput(
  key: string,
  activePuzzleIndex: number,
  guess: string[],
  setGuess: (a: string[]) => void,
  cursorIndex: number,
  setCursorIndex: (a: number) => void,
) {
  if (key.match(/^[a-zA-Z]$/)) {
    setGuess([
      ...guess.slice(0, cursorIndex),
      key.toUpperCase(),
      ...guess.slice(cursorIndex + 1, data[activePuzzleIndex].words.length * 5),
    ]);
    const rowStartIndex = cursorIndex - (cursorIndex % 5);
    const rowEndIndex = rowStartIndex + 5;
    const activeRowWord = [
      ...guess.slice(rowStartIndex, cursorIndex),
      key.toUpperCase(),
      ...guess.slice(cursorIndex + 1, rowEndIndex),
    ]
      .join("")
      .toLowerCase();
    if (
      cursorIndex !== guess.length - 1 &&
      !(cursorIndex % 5 === 4 && !valid.includes(activeRowWord))
    ) {
      setCursorIndex(cursorIndex + 1);
    }
  }
  if (key === "Backspace") {
    const onEmptySquare = guess[cursorIndex] === " ";
    if (onEmptySquare && cursorIndex > 0) {
      setCursorIndex(cursorIndex - 1);
    }
    const toDelete = onEmptySquare ? cursorIndex - 1 : cursorIndex;
    setGuess([
      ...guess.slice(0, toDelete),
      " ",
      ...guess.slice(toDelete + 1, data[activePuzzleIndex].words.length * 5),
    ]);
  }
  if (key === "ArrowRight") {
    if (cursorIndex % 5 !== 4) setCursorIndex(cursorIndex + 1);
  }
}

export default function Puzzle({
  activePuzzleIndex,
  guess,
  setGuess,
  cursorIndex,
  setCursorIndex,
}: Props) {
  const handleKeydownEvent = useCallback(
    (event: KeyboardEvent) =>
      handleKeyInput(
        event.key,
        activePuzzleIndex,
        guess,
        setGuess,
        cursorIndex,
        setCursorIndex,
      ),
    [guess, cursorIndex],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydownEvent);
    return () => {
      window.removeEventListener("keydown", handleKeydownEvent);
    };
  }, [handleKeydownEvent]);

  const source = data[activePuzzleIndex].words.slice();

  return (
    <div>
      {source.map((sourceWord, sourceWordIndex) => {
        return (
          <GameRow
            byg={computeByg(sourceWord, source[source.length - 1])}
            letters={guess.slice(
              5 * sourceWordIndex,
              5 * (sourceWordIndex + 1),
            )}
            cursorIndex={
              5 * sourceWordIndex <= cursorIndex &&
              cursorIndex < 5 * (sourceWordIndex + 1)
                ? cursorIndex % 5
                : undefined
            }
            setCursorIndex={setCursorIndex}
            rowIndex={sourceWordIndex}
            redHighlights={computeRedHighlightsForRow(
              guess,
              source,
              sourceWordIndex,
            )}
          />
        );
      })}
    </div>
  );
}

export function computeByg(guess: string, target: string) {
  let result = new Array(5).fill("gray");
  let remainingLettersInTarget = target.slice().split("");
  guess
    .toLowerCase()
    .split("")
    .forEach((letter, index) => {
      if (letter === remainingLettersInTarget[index]) {
        result[index] = "green";
        remainingLettersInTarget[index] = "_";
      }
    });
  let findingYellows = true;
  let letter;
  while (findingYellows) {
    for (let index = 0; index < 5; index++) {
      letter = guess[index];
      const alreadyMarked = ["green", "yellow"].includes(result[index]);
      if (!alreadyMarked) {
        if (remainingLettersInTarget.includes(letter)) {
          result[index] = "yellow";
          remainingLettersInTarget[remainingLettersInTarget.indexOf(letter)] =
            "_";
          break;
        }
      }
      if (index === 4) findingYellows = false;
    }
  }
  return result;
}

function computeRedHighlightsForRow(
  guess: string[],
  target: string[],
  index: number,
) {
  if (
    index === target.length - 1 ||
    guess.slice(5 * index, 5 * (index + 1)).includes(" ") ||
    guess.slice(5 * (index + 1), 5 * (index + 2)).includes(" ")
  ) {
    return [false, false, false, false, false];
  }
  const sourceGuessRow = guess.slice(5 * index, 5 * (index + 1));
  const nextGuessRow = guess.slice(5 * (index + 1), 5 * (index + 2));
  const rowByg = computeByg(target[index], target[target.length - 1]);
  let result = [false, false, false, false, false];
  let updatedGuess = nextGuessRow.slice();

  for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
    if (
      rowByg[letterIndex] === "green" &&
      sourceGuessRow[letterIndex] !== updatedGuess[letterIndex]
    ) {
      result[letterIndex] = true;
      updatedGuess[letterIndex] = "_";
    }
  }
  for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
    if (rowByg[letterIndex] === "yellow") {
      if (!updatedGuess.includes(sourceGuessRow[letterIndex])) {
        result[letterIndex] = true;
      }
      updatedGuess[updatedGuess.indexOf(sourceGuessRow[letterIndex])] = "_";
    }
  }
  return result;
}

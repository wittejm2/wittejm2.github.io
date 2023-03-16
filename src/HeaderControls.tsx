import React from "react";
import data from "./data";
import { computeByg } from "./Puzzle";

type Props = {
  activePuzzleIndex: number;
  changePuzzle: (arg0: number) => void;
};

function HeaderControls({ activePuzzleIndex, changePuzzle }: Props) {
  return (
    <div className="headerBlock">
      <NavButton text="<<" onClick={() => changePuzzle(data.length - 1)} />
      <NavButton
        text="<"
        onClick={() =>
          changePuzzle(
            activePuzzleIndex === data.length - 1
              ? data.length - 1
              : activePuzzleIndex + 1,
          )
        }
      />
      <div style={{ margin: "0 1em" }}>
        <h1>
          {data[activePuzzleIndex].puzzleNumber}
          {obeysSuperHardMode(activePuzzleIndex) ? "" : "!"}
        </h1>
      </div>
      <NavButton
        text=">"
        onClick={() =>
          changePuzzle(activePuzzleIndex === 0 ? 0 : activePuzzleIndex - 1)
        }
      />
      <NavButton text=">>" onClick={() => changePuzzle(0)} />
    </div>
  );
}

type NavButtonProps = {
  text: string;
  onClick: () => void;
};
function NavButton({ text, onClick }: NavButtonProps) {
  return (
    <button className="navButton" onClick={onClick}>
      {text}
    </button>
  );
}
export default HeaderControls;

function obeysSuperHardMode(activePuzzleIndex: number) {
  // for each word: for each blank, check that subsequent words do not contain that letter. UNLESS there's yellow shit going on.

  const sourceWords = data[activePuzzleIndex].words;
  const trueWord = sourceWords[sourceWords.length - 1];
  let foundRepeat = sourceWords.some((previousWord, previousIndex) =>
    sourceWords.slice(previousIndex + 1).some((subsequentWord) => {
      const byg = computeByg(previousWord, trueWord);
      return byg.some((c, ind) => {
        const indicesInPreviousWordOfThisLetter = previousWord
          .split("")
          .reduce((soFar, current, currInd) => {
            if (current === previousWord[ind]) soFar.push(currInd);
            return soFar;
          }, [] as number[]);

        const numYellowOrGreenOfThisLetterInPreviousWord =
          indicesInPreviousWordOfThisLetter.filter(
            (ind) => byg[ind] === "yellow" || byg[ind] === "green",
          ).length;
        const foundARepeat =
          (c === "yellow" && previousWord[ind] === subsequentWord[ind]) ||
          (c === "gray" &&
            (numYellowOrGreenOfThisLetterInPreviousWord <
              (subsequentWord.match(new RegExp(previousWord[ind], "g")) || [])
                .length ||
              previousWord[ind] === subsequentWord[ind]));
        return foundARepeat;
      });
    }),
  );
  return !foundRepeat;
}

import React, { useState } from "react";
import "./App.css";
import data from "./data";
import HeaderControls from "./HeaderControls";
import Keyboard from "./Keyboard";
import Puzzle from "./Puzzle";
import Submissions from "./Submissions";

function submitGuess(
  guess: string[],
  setGuess: (a: string[]) => void,
  submissions: string[][],
  setSubmissions: any,
  activePuzzleIndex: number,
) {
  const newSubmissions = [guess, ...submissions];
  saveGuesses(activePuzzleIndex, newSubmissions);
  setSubmissions(newSubmissions);
  const correctLetters = getCorrectLettersFromGuess(guess, activePuzzleIndex);
  setGuess(correctLetters);
}

function App() {
  const [activePuzzleIndex, setActivePuzzleIndex] = useState(0);
  const [guess, setGuess] = useState<string[]>(
    Array(5 * data[activePuzzleIndex].words.length).fill(" "),
  );
  const [cursorIndex, setCursorIndex] = useState(0);
  const [submissions, setSubmissions] = useState<string[][]>([]);

  const changePuzzle = (puzzleIndex: number) => {
    setActivePuzzleIndex(puzzleIndex);
    const priorSubmissions = getProgressFromStorage(puzzleIndex);
    setSubmissions(priorSubmissions);
    if (priorSubmissions.length > 0) {
      const correctLetters = getCorrectLettersFromGuess(
        priorSubmissions[0],
        puzzleIndex,
      );
      setGuess(correctLetters);
    } else {
      setGuess(Array(5 * data[puzzleIndex].words.length).fill(" "));
    }
  };
  return (
    <div className="DetediaPage">
      <HeaderControls
        activePuzzleIndex={activePuzzleIndex}
        changePuzzle={changePuzzle}
      />
      <Puzzle
        activePuzzleIndex={activePuzzleIndex}
        guess={guess}
        setGuess={setGuess}
        cursorIndex={cursorIndex}
        setCursorIndex={setCursorIndex}
      />

      <Keyboard
        activePuzzleIndex={activePuzzleIndex}
        guess={guess}
        setGuess={setGuess}
        cursorIndex={cursorIndex}
        setCursorIndex={setCursorIndex}
        usageAllLetters={getUsageFromSubmissions(
          activePuzzleIndex,
          submissions,
        )}
      />
      <button
        onClick={() =>
          submitGuess(
            guess.slice(),
            setGuess,
            submissions,
            setSubmissions,
            activePuzzleIndex,
          )
        }
      >
        SUBMIT
      </button>
      <Submissions
        submissions={submissions}
        activePuzzleIndex={activePuzzleIndex}
      />
      <button
        onClick={() => {
          clearGuesses(activePuzzleIndex);
          setSubmissions([]);
        }}
      >
        CLEAR HISTORY
      </button>
    </div>
  );
}

export default App;

function getProgressFromStorage(activePuzzleIndex: number) {
  const allSubmissionsString = window.localStorage.getItem(
    `submittedGuesses-${data[activePuzzleIndex].puzzleNumber}`,
  );
  const res =
    allSubmissionsString &&
    allSubmissionsString.split(":").map((guessSets) => guessSets.split(""));
  return res || [];
}

function saveGuesses(activePuzzleIndex: number, allSubmissions: string[][]) {
  const allSubmissionsString = allSubmissions
    .map((guessSet) => guessSet.join(""))
    .join(":");
  window.localStorage.setItem(
    `submittedGuesses-${data[activePuzzleIndex].puzzleNumber}`,
    allSubmissionsString,
  );
}
function clearGuesses(activePuzzleIndex: number) {
  window.localStorage.setItem(
    `submittedGuesses-${data[activePuzzleIndex].puzzleNumber}`,
    "",
  );
  getProgressFromStorage(activePuzzleIndex);
}

function getUsageFromSubmissions(
  activePuzzleIndex: number,
  submissions: string[][],
) {
  const letters = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const res = letters
    .split("")
    .reduce(
      (acc: any, curr) => (
        (acc[curr] = new Array(data[activePuzzleIndex].words.length)
          .fill("white")
          .map((_, wordIndex) =>
            getKeyColorFromSubmissions(
              curr,
              activePuzzleIndex,
              submissions,
              wordIndex,
            ),
          )),
        acc
      ),
      {},
    );
  return res;
}

function getKeyColorFromSubmissions(
  letter: string,
  activePuzzleIndex: number,
  submissions: string[][],
  wordIndex: number,
) {
  let color = "white";
  const sourceWord = data[activePuzzleIndex].words[wordIndex].toUpperCase();
  submissions.forEach((submission) => {
    const guessWord = submission.slice(5 * wordIndex, 5 * (wordIndex + 1));
    [0, 1, 2, 3, 4].forEach((letterIndex) => {
      if (guessWord[letterIndex] === letter) {
        if (sourceWord[letterIndex] === guessWord[letterIndex]) {
          color = "green";
        } else if (
          sourceWord.includes(guessWord[letterIndex]) &&
          color !== "green"
        ) {
          color = "yellow";
        } else if (color != "green" && color !== "yellow") color = "blank";
      }
    });
  });
  return color;
}

function getCorrectLettersFromGuess(
  guess: string[],
  activePuzzleIndex: number,
) {
  return guess.map((letter, index) => {
    const wordIndex = Math.floor(index / 5);
    const sourceLetter = data[activePuzzleIndex].words[wordIndex][index % 5];
    if (sourceLetter !== letter.toLowerCase()) return " ";
    return letter;
  });
}

# Vesta Hunt

A guessing game on a board that looks like a [Vestaboard](https://www.vestaboard.com/) — the split-flap displays you see in cafés and offices.

Twelve squares are hidden at random. Your job is to find them all.

## How to play

1. Look at the board. Columns are labeled **A–U** across the top. Rows are labeled **1–5** down the side.
2. Type a coordinate: a letter, then a number. Examples: `C3`, `A1`, `U5`.
3. Press **Submit**.
4. The square you guessed lights up:
   - **Green** — you found one of the hidden squares.
   - **Red** — that square was empty.
5. Keep going until you’ve found all 12. The line under the title shows your progress (for example, `3/12`).
6. When you find the last one, the board shows a heart. A new hunt starts a few seconds later.

## Tips

- Guess each square only once. Trying the same coordinate again makes the input shake.
- The letter always comes first, then the number.
- Any square on the board is fair game — there is no pattern to where the hidden ones sit.

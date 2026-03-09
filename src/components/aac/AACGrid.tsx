"use client";

import { AACButton } from "./AACButton";
import { DEFAULT_BUTTONS, AACButtonEntry } from "@/data/aacButtons";

const ROWS = 7; // rows 2-8 (row 1 is nav)
const COLS = 12;

interface AACGridProps {
  onButtonPress?: (button: AACButtonEntry) => void;
}

export function AACGrid({ onButtonPress }: AACGridProps) {
  const buttonMap = new Map(
    DEFAULT_BUTTONS.map((b) => [`${b.row}:${b.col}`, b])
  );

  return (
    <div
      className="grid flex-1 gap-1 p-1"
      style={{
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        height: "calc(100vh - var(--nav-height))",
      }}
    >
      {Array.from({ length: ROWS }, (_, rowIdx) =>
        Array.from({ length: COLS }, (_, colIdx) => {
          const row = rowIdx + 2; // rows 2-8
          const col = colIdx + 1;
          const key = `${row}:${col}`;
          const data = buttonMap.get(key);

          return (
            <AACButton
              key={key}
              row={row}
              col={col}
              label={data?.label ?? `B${row}:${col}`}
              iconName={data?.iconName}
              color={data?.color}
              onClick={() => data && onButtonPress?.(data)}
            />
          );
        })
      )}
    </div>
  );
}

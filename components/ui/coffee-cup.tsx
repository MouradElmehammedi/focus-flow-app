"use client";

import styles from "./coffee-cup.module.css";

interface CoffeeCupProps {
  isActive?: boolean;
  fillPercent?: number;
}

export function CoffeeCup({ isActive = false, fillPercent = 50 }: CoffeeCupProps) {
  // Calculate background position Y based on fill percent
  // Range derived from original CSS animation:
  // 100% full (start) -> -70px
  // 0% full (end) -> 130px
  const yPos = 130 - (fillPercent / 100) * 200;

  return (
    <div className={!isActive ? styles.paused : ""}>
      <div className={styles.cup} style={{ backgroundPositionY: `${yPos}px` }}>
        {isActive && (
          <>
            <span className={styles.steam}></span>
            <span className={styles.steam}></span>
            <span className={styles.steam}></span>
          </>
        )}
        <div className={styles.cupHandle}></div>
      </div>
    </div>
  );
}

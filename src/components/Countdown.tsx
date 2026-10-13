"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
  title: string;
  completedTitle: string;
  completedMessage: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({
  targetDate,
  title,
  completedTitle,
  completedMessage,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const updateCountdown = () => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        if (!isComplete) {
          setIsComplete(true);
          // Enable the ticket button when countdown completes
          const button = document.getElementById('ticket-button');
          if (button) {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.style.pointerEvents = 'auto';
            button.title = 'Jetzt Karten kaufen!';
          }
        }
      }
    };

    // Initial calculation
    updateCountdown();

    // Update every second
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isComplete]);

  if (isComplete) {
    return (
      <div className="cd-card">
        <span className="n-eyebrow">{completedTitle}</span>
        {completedMessage && <p className="cd-live-text">{completedMessage}</p>}
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Tage" },
    { value: timeLeft.hours, label: "Stunden" },
    { value: timeLeft.minutes, label: "Minuten" },
    { value: timeLeft.seconds, label: "Sekunden" },
  ];

  return (
    <div className="cd-card" role="timer" aria-label={title}>
      <span className="n-eyebrow">{title}</span>
      <div className="cd-grid">
        {units.map((unit) => (
          <div key={unit.label} className="cd-unit">
            <span className="cd-value">{pad(unit.value)}</span>
            <span className="cd-unit-label">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

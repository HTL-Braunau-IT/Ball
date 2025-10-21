"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ targetDate }: CountdownProps) {
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
            button.title = 'Jetzt Tickets kaufen!';
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
      <div className="text-center">
        <h2 className="text-4xl font-bold gradient-text mb-4">
          Ticketverkauf gestartet!
        </h2>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Jetzt können Sie Ihre Tickets kaufen
        </p>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <div className="countdown-box">
        <div className="countdown-title">Countdown bis zum Ticketverkauf</div>
        <div className="countdown-grid">
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.days}</div>
            <div className="countdown-label">Tage</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.hours}</div>
            <div className="countdown-label">Stunden</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.minutes}</div>
            <div className="countdown-label">Minuten</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.seconds}</div>
            <div className="countdown-label">Sekunden</div>
          </div>
        </div>
      </div>
    </div>
  );
}

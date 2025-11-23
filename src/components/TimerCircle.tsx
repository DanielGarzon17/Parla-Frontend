import { useEffect, useState, useRef } from "react";

interface TimerCircleProps {
  initialSeconds: number;
  onComplete?: () => void;
}

const TimerCircle = ({ initialSeconds, onComplete }: TimerCircleProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isCounting, setIsCounting] = useState(false);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          // When reaching 0, call onComplete once and start counting up
          if (!hasCalledComplete.current) {
            onComplete?.();
            hasCalledComplete.current = true;
            setIsCounting(true);
          }
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${
      isCounting ? 'border-destructive' : 'border-timer-ring'
    } bg-background shadow-lg transition-colors`}>
      <div className={`text-4xl font-bold ${isCounting ? 'text-destructive' : 'text-foreground'}`}>
        {seconds}
      </div>
      <div className={`text-sm font-semibold ${isCounting ? 'text-destructive' : 'text-foreground'}`}>
        SEC
      </div>
    </div>
  );
};

export default TimerCircle;

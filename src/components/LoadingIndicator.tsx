import React, { useState, useEffect } from "react";
import { LOADING_MESSAGES } from "../constants";
import Logo from "./Logo";

interface LoadingIndicatorProps {
    step: string;
    progress: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    step,
    progress,
}) => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage((prevMessage) => {
                const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                return LOADING_MESSAGES[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="text-center flex flex-col items-center gap-8 w-full max-w-lg animate-fade-in">
            <Logo className="w-20 h-20 animate-pulse-slow" />
            <div className="w-full flex flex-col items-center gap-3">
                <p className="text-xl font-semibold text-text-primary">
                    {step}
                </p>

                <div
                    className="w-full bg-surface rounded-full h-2 mt-2"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="bg-gradient-to-r from-primary-accent to-secondary-accent h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-sm font-mono text-text-secondary self-end">
                    {Math.round(progress)}%
                </p>

                <p className="text-text-secondary/80 transition-opacity duration-500 mt-2 h-5">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingIndicator;

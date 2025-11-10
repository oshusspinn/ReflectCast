import React, { useRef, useEffect } from "react";
import { PERSONAS } from "../constants";

interface ChallengeInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    isLoading: boolean;
    selectedPersonas: string[];
    onPersonaChange: (id: string) => void;
}

const ChallengeInput: React.FC<ChallengeInputProps> = ({
    value,
    onChange,
    onSubmit,
    isLoading,
    selectedPersonas,
    onPersonaChange,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // Reset height to recalculate
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
        }
    }, [value]); // Rerun when the text value changes

    const isSubmitDisabled =
        isLoading ||
        !value.trim() ||
        selectedPersonas.length < 2 ||
        selectedPersonas.length > 3;
    const isMaxPersonasSelected = selectedPersonas.length >= 3;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (!isSubmitDisabled) {
                onSubmit();
            }
        }
    };

    const getTooltipText = () => {
        if (isLoading) return "Generating your reflection...";
        if (!value.trim()) return "Please describe your challenge to begin.";
        if (selectedPersonas.length < 2 || selectedPersonas.length > 3)
            return "Please select between 2 and 3 personas.";
        return "Generate Reflection (Ctrl + Enter)";
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 animate-slide-in-up">
            <div className="w-full text-left bg-surface/50 p-6 rounded-4xl border border-white/5">
                <h2 className="text-2xl font-display font-semibold mb-4 text-text-primary">
                    1. Choose Your Panel{" "}
                    <span
                        className={`font-sans font-normal text-sm ${
                            selectedPersonas.length < 2 ||
                            selectedPersonas.length > 3
                                ? "text-error"
                                : "text-text-secondary"
                        }`}
                    >
                        ({selectedPersonas.length} selected, 2-3 required)
                    </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {PERSONAS.map((persona) => {
                        const isChecked = selectedPersonas.includes(persona.id);
                        const isDisabled =
                            isLoading || (isMaxPersonasSelected && !isChecked);

                        return (
                            <div key={persona.id}>
                                <input
                                    type="checkbox"
                                    id={`persona-${persona.id}`}
                                    checked={isChecked}
                                    onChange={() => onPersonaChange(persona.id)}
                                    className="hidden peer"
                                    disabled={isDisabled}
                                />
                                <label
                                    htmlFor={`persona-${persona.id}`}
                                    className={`flex flex-col h-full p-4 text-left rounded-3xl border-2 border-white/10 transition-all duration-300 peer-checked:border-primary-accent peer-checked:bg-primary-accent/10 peer-checked:shadow-glow-primary ${
                                        isDisabled
                                            ? "cursor-not-allowed opacity-50"
                                            : "cursor-pointer hover:bg-white/5"
                                    }`}
                                >
                                    <span className="font-bold text-text-primary">
                                        {persona.name}
                                    </span>
                                    <span className="text-sm text-text-secondary mt-1 leading-snug">
                                        {persona.description}
                                    </span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full">
                <h2 className="text-2xl font-display font-semibold mb-3 text-text-primary">
                    2. Describe Your Challenge
                </h2>
                <div className="relative w-full">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onKeyDown={handleKeyDown}
                        placeholder={"Enter what’s on your mind…"}
                        className={`w-full min-h-[10rem] max-h-64 p-5 bg-surface border-2 rounded-2xl focus:ring-2 focus:ring-primary-accent focus:border-primary-accent focus:outline-none transition-all duration-300 resize-none placeholder-placeholder text-base leading-relaxed custom-scrollbar overflow-y-auto pb-5 border-white/10`}
                        disabled={isLoading}
                        rows={4}
                    />
                </div>
                <p className="text-xs text-text-secondary/60 mt-2 text-right">
                    Press{" "}
                    <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-text-secondary/80 bg-surface border border-white/10 rounded-md">
                        Ctrl
                    </kbd>{" "}
                    +{" "}
                    <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-text-secondary/80 bg-surface border border-white/10 rounded-md">
                        Enter
                    </kbd>{" "}
                    to submit.
                </p>
            </div>

            <div data-tooltip={getTooltipText()}>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                    className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-accent to-secondary-accent text-white font-bold rounded-2xl shadow-lg hover:shadow-glow-primary transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none active:brightness-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    <span>Generate Reflection</span>
                </button>
            </div>
        </div>
    );
};

export default ChallengeInput;

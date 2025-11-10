import React, { useState, useCallback, useRef, useEffect } from "react";
import { PodcastData } from "../types";
import Logo from "./Logo";
import {
    RepeatIcon,
    UsersRoundIcon,
    QuoteIcon,
    DownloadIcon,
    CopyIcon,
    PlayIcon,
    PauseIcon,
    Volume2Icon,
    Volume1Icon,
    VolumeXIcon,
    CheckIcon,
    SpeakerWaveIcon,
} from "./icons";

interface PodcastPlayerProps {
    podcast: PodcastData;
    onReset: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({ podcast, onReset }) => {
    const [isCopied, setIsCopied] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [lastVolume, setLastVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds) || timeInSeconds === 0) return "0:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted || volume === 0) {
                const newVolume = lastVolume > 0.1 ? lastVolume : 1;
                audioRef.current.volume = newVolume;
                setVolume(newVolume);
                setIsMuted(false);
            } else {
                setLastVolume(volume);
                audioRef.current.volume = 0;
                setVolume(0);
                setIsMuted(true);
            }
        }
    };

    const handleSpeedChange = () => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
        setPlaybackRate(PLAYBACK_SPEEDS[nextIndex]);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => {
            const time = audio.currentTime;
            setCurrentTime(time);

            if (podcast.timedScript) {
                const activeLineIdx = podcast.timedScript.findIndex(
                    (line) => time >= line.startTime && time < line.endTime
                );

                if (activeLineIdx !== -1) {
                    setActiveLineIndex(activeLineIdx);
                    setCurrentSpeaker(
                        podcast.timedScript[activeLineIdx].speaker
                    );
                } else {
                    setActiveLineIndex(null);
                    setCurrentSpeaker(null);
                }
            }
        };

        audio.addEventListener("loadedmetadata", setAudioData);
        audio.addEventListener("timeupdate", setAudioTime);
        audio.addEventListener("play", () => setIsPlaying(true));
        audio.addEventListener("pause", () => setIsPlaying(false));
        audio.addEventListener("ended", () => {
            setIsPlaying(false);
            setActiveLineIndex(null);
            setCurrentSpeaker(null);
        });

        return () => {
            audio.removeEventListener("loadedmetadata", setAudioData);
            audio.removeEventListener("timeupdate", setAudioTime);
            audio.removeEventListener("play", () => setIsPlaying(true));
            audio.removeEventListener("pause", () => setIsPlaying(false));
            audio.removeEventListener("ended", () => {
                setIsPlaying(false);
                setActiveLineIndex(null);
                setCurrentSpeaker(null);
            });
        };
    }, [podcast.timedScript]);

    useEffect(() => {
        if (activeLineIndex !== null && transcriptContainerRef.current) {
            const activeLineElement = lineRefs.current[activeLineIndex];
            const containerElement = transcriptContainerRef.current;

            if (activeLineElement && containerElement) {
                const lineTop = activeLineElement.offsetTop;

                const containerScrollTop = containerElement.scrollTop;
                const containerHeight = containerElement.clientHeight;

                const targetScroll =
                    lineTop -
                    containerHeight / 2 +
                    activeLineElement.offsetHeight / 2;

                containerElement.scrollTo({
                    top: targetScroll,
                    behavior: "smooth",
                });
            }
        }
    }, [activeLineIndex]);

    const handleCopyTranscript = useCallback(() => {
        const transcriptText = podcast.script
            .map((line) => `${line.speaker}: ${line.line}`)
            .join("\n\n");

        navigator.clipboard
            .writeText(transcriptText)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy transcript: ", err);
            });
    }, [podcast.script]);

    const handleDownloadAudio = useCallback(() => {
        const sanitizedTitle = podcast.title
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
        const filename = `${sanitizedTitle || "reflectcast_episode"}.wav`;

        const link = document.createElement("a");
        link.href = podcast.audioUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [podcast.audioUrl, podcast.title]);

    const VolumeIcon =
        isMuted || volume === 0
            ? VolumeXIcon
            : volume < 0.5
            ? Volume1Icon
            : Volume2Icon;
    const seekProgressPercentage =
        duration > 0 ? (currentTime / duration) * 100 : 0;
    const volumeProgressPercentage = (isMuted ? 0 : volume) * 100;

    return (
        <div className="w-full bg-surface/50 border border-white/5 rounded-4xl shadow-2xl p-6 sm:p-8 animate-slide-in-up flex flex-col gap-8">
            <audio ref={audioRef} src={podcast.audioUrl} preload="metadata" />

            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                <div className="w-48 h-48 bg-surface rounded-4xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                    {podcast.imageUrl ? (
                        <img
                            src={podcast.imageUrl}
                            alt={`${podcast.title} cover art`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Logo className="w-24 h-24 opacity-50" />
                    )}
                </div>
                <div className="flex-grow">
                    <h3 className="text-sm text-primary-accent font-semibold">
                        Your ReflectCast Episode
                    </h3>
                    <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary mt-1">
                        {podcast.title}
                    </h2>
                    <p className="text-text-secondary mt-2">
                        A personalized reflection session with your chosen
                        panel.
                    </p>
                </div>
            </div>

            <div className="w-full">
                <div className="relative range-container group h-6 flex items-center">
                    <div className="absolute top-1/2 left-0 h-1.5 w-full bg-white/10 rounded-full -translate-y-1/2"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-primary-accent to-secondary-accent rounded-full -translate-y-1/2"
                        style={{ width: `${seekProgressPercentage}%` }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="themed-slider relative w-full"
                        aria-label="Seek slider"
                    />
                </div>
                <div className="flex justify-between text-xs text-text-secondary/80 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center justify-start gap-2">
                        <button
                            onClick={handleSpeedChange}
                            data-tooltip="Playback Speed"
                            className="text-text-secondary hover:text-text-primary transition-colors w-14 text-sm font-semibold bg-surface rounded-lg py-1.5 px-2 hover:bg-white/5"
                            aria-label={`Change playback speed. Current speed: ${playbackRate}x`}
                        >
                            {playbackRate}x
                        </button>
                        <button
                            onClick={handleDownloadAudio}
                            data-tooltip="Download Audio"
                            className="p-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                            aria-label="Download audio"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={handlePlayPause}
                        data-tooltip={isPlaying ? "Pause" : "Play"}
                        className="text-text-primary bg-gradient-to-r from-primary-accent to-secondary-accent rounded-full p-4 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-glow-primary"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <PauseIcon className="w-7 h-7" />
                        ) : (
                            <PlayIcon className="w-7 h-7" />
                        )}
                    </button>

                    <div className="flex items-center gap-2 w-1/3 max-w-[140px]">
                        <button
                            onClick={toggleMute}
                            data-tooltip={isMuted ? "Unmute" : "Mute"}
                            className="p-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                            aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                            <VolumeIcon className="w-5 h-5" />
                        </button>
                        <div className="relative range-container group h-6 flex items-center w-full">
                            <div className="absolute top-1/2 left-0 h-1.5 w-full bg-white/10 rounded-full -translate-y-1/2"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-primary-accent to-secondary-accent rounded-full -translate-y-1/2"
                                style={{
                                    width: `${volumeProgressPercentage}%`,
                                }}
                            ></div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="themed-slider relative w-full"
                                aria-label="Volume slider"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-2xl font-display font-semibold mb-4 text-text-primary flex items-center gap-2.5">
                        <UsersRoundIcon className="w-6 h-6 text-secondary-accent" />
                        Your Panel
                    </h3>
                    <div className="flex flex-col gap-3">
                        {podcast.personas.map((persona) => (
                            <div
                                key={persona.name}
                                className={`p-4 rounded-3xl transition-all duration-300 border-2 ${
                                    currentSpeaker === persona.name
                                        ? "bg-primary-accent/10 border-primary-accent"
                                        : "bg-surface border-transparent"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-text-primary">
                                        {persona.name}
                                    </p>
                                    {currentSpeaker === persona.name && (
                                        <SpeakerWaveIcon className="w-5 h-5 text-secondary-accent animate-pulse-speaker" />
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary">
                                    {persona.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-display font-semibold text-text-primary flex items-center gap-2.5">
                            <QuoteIcon className="w-6 h-6 text-secondary-accent" />
                            Transcript
                        </h3>
                        <button
                            onClick={handleCopyTranscript}
                            data-tooltip={
                                isCopied ? "Copied!" : "Copy Transcript"
                            }
                            className="p-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                            aria-label="Copy transcript"
                        >
                            {isCopied ? (
                                <CheckIcon className="w-5 h-5 text-success" />
                            ) : (
                                <CopyIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <div
                        ref={transcriptContainerRef}
                        className="max-h-80 overflow-y-auto p-4 bg-surface rounded-3xl custom-scrollbar relative"
                    >
                        <div className="space-y-4 text-text-secondary">
                            {podcast.script.map((line, index) => (
                                <div
                                    ref={(el) => {
                                        lineRefs.current[index] = el;
                                    }}
                                    key={index}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                        index === activeLineIndex
                                            ? "bg-primary-accent/10"
                                            : ""
                                    }`}
                                >
                                    <p
                                        className={`font-bold transition-colors ${
                                            index === activeLineIndex
                                                ? "text-secondary-accent"
                                                : "text-text-primary/90"
                                        }`}
                                    >
                                        {line.speaker}:
                                    </p>
                                    <p
                                        className={`pl-4 ${
                                            index === activeLineIndex
                                                ? "text-text-primary"
                                                : ""
                                        }`}
                                    >
                                        "{line.line}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onReset}
                className="btn-secondary mt-4 flex items-center justify-center gap-2.5 w-full sm:w-auto mx-auto px-8 py-2.5 text-text-primary font-semibold rounded-2xl bg-surface hover:bg-white/5 transition-colors"
            >
                <RepeatIcon className="w-5 h-5" />
                <span>Reflect on a New Challenge</span>
            </button>
        </div>
    );
};

export default PodcastPlayer;

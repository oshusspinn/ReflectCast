import React, { useState, useCallback } from 'react';
import { Buffer } from 'buffer';
import ChallengeInput from './components/ChallengeInput';
import PodcastPlayer from './components/PodcastPlayer';
import LoadingIndicator from './components/LoadingIndicator';
import { PodcastData } from './types';
import Logo from './components/Logo';
import { PERSONAS } from './constants';

const App: React.FC = () => {
  const [challenge, setChallenge] = useState<string>('');
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePersonaChange = (id: string) => {
    setSelectedPersonas(prev =>
      prev.includes(id)
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!challenge.trim()) {
      setError('Please enter a challenge to reflect upon.');
      return;
    }
    if (selectedPersonas.length < 2 || selectedPersonas.length > 3) {
        setError('Please select between 2 and 3 personas for your panel.');
        return;
    }
    
    setIsLoading(true);
    setPodcast(null);
    setProgress(0);

    try {
      setLoadingStep("Crafting your script...");
      setProgress(5);

      // This URL is handled by Render's rewrite rules in production.
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

      const response = await fetch(`${backendUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: challenge,
          personas: PERSONAS.filter(p => selectedPersonas.includes(p.id))
        }),
      });

      // Animate progress bar during the backend processing
      const progressInterval = setInterval(() => {
          setProgress(p => Math.min(p + 5, 90));
      }, 800);

      if (!response.ok) {
        clearInterval(progressInterval);
        const err = await response.json();
        throw new Error(err.error || 'The server responded with an unknown error.');
      }

      const { scriptData, imageUrl, audioBase64 } = await response.json();
      clearInterval(progressInterval);
      
      setLoadingStep("Finalizing your episode...");
      setProgress(95);

      // Convert the received base64 audio into a playable Blob URL
      const audioBytes = Buffer.from(audioBase64, 'base64');
      const audioBlob = new Blob([audioBytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // The timedScript is now part of the scriptData object from the backend
      setPodcast({ ...scriptData, audioUrl, imageUrl });
      setProgress(100);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please try again.';
      setError(`Failed to generate your reflection. ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [challenge, selectedPersonas]);

  const handleReset = () => {
    setPodcast(null);
    setChallenge('');
    setSelectedPersonas([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-primary-background text-text-primary font-sans flex flex-col items-center p-6 md:p-8">
      <header className="w-full max-w-4xl text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
            <Logo className="w-9 h-9" />
            <h1 className="text-4xl sm:text-5xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary tracking-wide">
              ReflectCast
            </h1>
        </div>
        <p className="text-text-secondary text-lg">
          Turn your challenges into conversations of clarity.
        </p>
      </header>
      
      <main className="w-full max-w-2xl flex-grow flex flex-col justify-center items-center">
        {error && (
          <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-2xl relative mb-6 animate-fade-in" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {isLoading ? (
          <LoadingIndicator step={loadingStep} progress={progress} />
        ) : podcast ? (
          <PodcastPlayer podcast={podcast} onReset={handleReset} />
        ) : (
          <ChallengeInput 
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            selectedPersonas={selectedPersonas}
            onPersonaChange={handlePersonaChange}
          />
        )}
      </main>

       <footer className="w-full text-center mt-16 text-text-secondary/50 text-sm animate-fade-in">
        <p>Powered by Gemini. Designed for clarity.</p>
      </footer>
    </div>
  );
};

export default App;
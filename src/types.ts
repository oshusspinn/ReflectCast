// Represents a single line in the podcast script.
export interface ScriptLine {
    speaker: string;
    line: string;
}

// Extends ScriptLine with timing information for transcript highlighting.
export interface TimedScriptLine extends ScriptLine {
    startTime: number;
    endTime: number;
}

// Details of a persona used in the podcast.
export interface Persona {
    name: string;
    description: string;
}

// The complete data structure for a generated podcast script.
export interface PodcastScript {
    title: string;
    personas: Persona[];
    script: ScriptLine[];
}

// The final, complete data structure for a playable podcast episode.
export interface PodcastData extends PodcastScript {
    audioUrl: string;
    imageUrl: string;
    timedScript: TimedScriptLine[];
}

// The detailed persona information, including the system prompt for the backend.
export interface PersonaDetails extends Persona {
    id: string;
    systemPrompt: string;
}

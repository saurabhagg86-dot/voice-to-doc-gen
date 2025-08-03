import { useState } from "react";
import { Header } from "./Header";
import { VoiceRecorder } from "./VoiceRecorder";
import { ResultSection } from "./ResultSection";

interface DashboardProps {
  userEmail: string;
  openaiKey: string;
  webhookUrl: string;
}

export const Dashboard = ({ userEmail, openaiKey, webhookUrl }: DashboardProps) => {
  const [transcript, setTranscript] = useState("");

  const handleTranscriptReady = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handleReset = () => {
    setTranscript("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Header userEmail={userEmail} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
          {/* Left Section - Voice Recorder */}
          <div className="order-1 lg:order-1">
            <VoiceRecorder 
              onTranscriptReady={handleTranscriptReady}
              openaiKey={openaiKey}
            />
          </div>
          
          {/* Right Section - Result */}
          <div className="order-2 lg:order-2">
            {transcript ? (
              <ResultSection 
                transcript={transcript}
                webhookUrl={webhookUrl}
                onReset={handleReset}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Result</p>
                  <p>Record your requirements to see the processing result here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
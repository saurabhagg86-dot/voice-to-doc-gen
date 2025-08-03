import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string) => void;
  openaiKey: string;
}

export const VoiceRecorder = ({ onTranscriptReady, openaiKey }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      toast({
        title: "Processing Audio",
        description: "Converting speech to text...",
      });
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Convert webm to wav for better compatibility
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.text) {
        onTranscriptReady(data.text);
        toast({
          title: "Transcription Complete",
          description: "Your speech has been converted to text successfully",
        });
      } else {
        throw new Error('No transcript received from OpenAI');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Error",
        description: "Failed to convert speech to text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">
          Kindly record your need here and we would prepare a document for you
        </CardTitle>
        <CardDescription>
          Click the microphone to start recording your requirements. Speak clearly and describe what type of document you need.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className={`rounded-full p-6 ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary/10'}`}>
            {isProcessing ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            ) : (
              <Mic className={`h-12 w-12 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isRecording ? "Recording in progress..." : isProcessing ? "Processing audio..." : "Ready to record"}
            </p>
            
            {!isRecording && !isProcessing ? (
              <Button 
                onClick={startRecording}
                className="font-medium px-8"
                size="lg"
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            ) : isRecording ? (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="font-medium px-8"
                size="lg"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            ) : (
              <Button disabled className="font-medium px-8" size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Tips for best results:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Mention the type of document you need (BRD, FSD, etc.)</li>
            <li>• Include key requirements and objectives</li>
            <li>• Ensure you're in a quiet environment</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
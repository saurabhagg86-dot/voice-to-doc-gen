import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, RefreshCw } from "lucide-react";

interface ResultSectionProps {
  transcript: string;
  webhookUrl: string;
  onReset: () => void;
}

export const ResultSection = ({ transcript, webhookUrl, onReset }: ResultSectionProps) => {
  const [status, setStatus] = useState<'sending' | 'success' | 'error'>('sending');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (transcript) {
      sendToWebhook();
    }
  }, [transcript]);

  const sendToWebhook = async () => {
    try {
      setStatus('sending');
      
      const payload = {
        transcript: transcript,
        timestamp: new Date().toISOString(),
        requestType: 'document_generation'
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
      }

      setStatus('success');
      setMessage('The document has been successfully prepared and sent to your official email-id.');
      
      toast({
        title: "Document Processing Complete",
        description: "Your document has been generated and sent to your email",
      });
    } catch (error) {
      console.error('Webhook error:', error);
      setStatus('error');
      setMessage('Failed to process your request. Please try recording again.');
      
      toast({
        title: "Processing Error",
        description: "Failed to send your request for processing",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <RefreshCw className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Processing your request...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error occurred';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">
          Result
        </CardTitle>
        <CardDescription>
          Processing status and result of your document generation request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center space-y-3">
            {getStatusIcon()}
            <p className="text-lg font-medium">{getStatusText()}</p>
          </div>
          
          {message && (
            <div className={`p-4 rounded-lg text-center ${
              status === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : status === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <p className="font-medium">{message}</p>
            </div>
          )}

          {transcript && (
            <div className="w-full">
              <h4 className="font-medium mb-2">Your Transcript:</h4>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p>{transcript}</p>
              </div>
            </div>
          )}
          
          {(status === 'success' || status === 'error') && (
            <Button 
              onClick={onReset}
              variant="outline"
              className="font-medium"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Create New Document
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
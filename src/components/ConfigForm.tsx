import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ConfigFormProps {
  onConfigSave: (config: { openaiKey: string; webhookUrl: string }) => void;
}

export const ConfigForm = ({ onConfigSave }: ConfigFormProps) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openaiKey.trim() || !webhookUrl.trim()) {
      toast({
        title: "Missing Configuration",
        description: "Please provide both OpenAI API Key and Webhook URL",
        variant: "destructive",
      });
      return;
    }

    // Basic validation for OpenAI key format
    if (!openaiKey.startsWith("sk-")) {
      toast({
        title: "Invalid OpenAI API Key",
        description: "OpenAI API Key should start with 'sk-'",
        variant: "destructive",
      });
      return;
    }

    // Basic validation for webhook URL format
    try {
      new URL(webhookUrl);
    } catch {
      toast({
        title: "Invalid Webhook URL",
        description: "Please provide a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    onConfigSave({ openaiKey, webhookUrl });
    toast({
      title: "Configuration Saved",
      description: "Your settings have been saved successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-primary">
            Initial Setup
          </CardTitle>
          <CardDescription>
            Please provide your API credentials to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-sm font-medium">
                OpenAI API Key
              </Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Your OpenAI API key for speech transcription
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-sm font-medium">
                N8N Webhook URL
              </Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your N8N webhook endpoint for document processing
              </p>
            </div>

            <Button type="submit" className="w-full font-medium">
              Save Configuration & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
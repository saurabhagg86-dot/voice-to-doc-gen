import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/AuthForm";
import { ConfigForm } from "@/components/ConfigForm";
import { Dashboard } from "@/components/Dashboard";

interface Config {
  openaiKey: string;
  webhookUrl: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('document-generator-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error parsing saved config:', error);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleConfigSave = (newConfig: Config) => {
    setConfig(newConfig);
    localStorage.setItem('document-generator-config', JSON.stringify(newConfig));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return <AuthForm />;
  }

  // Show config form if configuration is not set
  if (!config) {
    return <ConfigForm onConfigSave={handleConfigSave} />;
  }

  // Show dashboard if user is authenticated and config is set
  return (
    <Dashboard 
      userEmail={user.email || ""} 
      openaiKey={config.openaiKey}
      webhookUrl={config.webhookUrl}
    />
  );
};

export default Index;

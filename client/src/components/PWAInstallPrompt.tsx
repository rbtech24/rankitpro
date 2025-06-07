import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      return; // App is already installed
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check for iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    
    if (isIOS && !isInStandaloneMode) {
      // Show iOS install prompt after a delay
      setTimeout(() => {
        setShowIOSPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleIOSInstallClick = () => {
    setShowIOSPrompt(false);
  };

  const IOSInstallPrompt = () => (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Install Rank It Pro</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIOSPrompt(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Install this app for the best mobile experience. Perfect for technicians in the field!
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <Share className="h-4 w-4 text-primary" />
            <span>Tap the share button in Safari</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Plus className="h-4 w-4 text-primary" />
            <span>Select "Add to Home Screen"</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Download className="h-4 w-4 text-primary" />
            <span>Tap "Add" to install</span>
          </div>
        </div>

        <Button onClick={handleIOSInstallClick} className="w-full">
          Got it!
        </Button>
      </CardContent>
    </Card>
  );

  const AndroidInstallPrompt = () => (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Install Rank It Pro</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPrompt(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Install this app for offline access and a native mobile experience.
        </p>
        
        <div className="flex space-x-2">
          <Button onClick={handleInstallClick} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowPrompt(false)}
            className="flex-1"
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (showIOSPrompt) {
    return <IOSInstallPrompt />;
  }

  if (showPrompt && deferredPrompt) {
    return <AndroidInstallPrompt />;
  }

  return null;
};

export default PWAInstallPrompt;
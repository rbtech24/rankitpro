import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Share, Plus } from 'lucide-react';
import { detectLanguage, getPWATranslations } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [language] = useState(() => detectLanguage());
  const t = getPWATranslations(language);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      return; // App is already installed
    }

    // Only show PWA prompts on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android.*Tablet|Windows.*Touch/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen size as additional mobile indicator
    const isSmallScreen = window.innerWidth <= 768;
    
    // Only proceed if it's a mobile device or small touch screen
    if (!isMobile && !isTablet && !(isTouchDevice && isSmallScreen)) {
      return; // Don't show PWA prompts on desktop
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
          <CardTitle className="text-lg">{t.title}</CardTitle>
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
          {t.iosDescription}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <Share className="h-4 w-4 text-primary" />
            <span>{t.iosSteps.share}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Plus className="h-4 w-4 text-primary" />
            <span>{t.iosSteps.addToHome}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Download className="h-4 w-4 text-primary" />
            <span>{t.iosSteps.install}</span>
          </div>
        </div>

        <Button onClick={handleIOSInstallClick} className="w-full">
          {t.buttons.gotIt}
        </Button>
      </CardContent>
    </Card>
  );

  const AndroidInstallPrompt = () => (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t.title}</CardTitle>
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
          {t.androidDescription}
        </p>
        
        <div className="flex space-x-2">
          <Button onClick={handleInstallClick} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t.buttons.install}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowPrompt(false)}
            className="flex-1"
          >
            {t.buttons.maybeLater}
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
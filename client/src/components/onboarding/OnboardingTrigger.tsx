import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  HelpCircle, 
  Play, 
  BookOpen, 
  Lightbulb, 
  CheckCircle,
  Clock,
  Users,
  Star,
  Target
} from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';

interface OnboardingTriggerProps {
  variant?: 'button' | 'card' | 'banner' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showProgress?: boolean;
}

export function OnboardingTrigger({ 
  variant = 'button', 
  size = 'md', 
  className = '',
  showProgress = false 
}: OnboardingTriggerProps) {
  const { startWalkthrough, hasSeenWalkthrough } = useOnboarding();

  const handleClick = () => {
    startWalkthrough();
  };

  if (variant === 'button') {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        size={size}
        className={`flex items-center ${className}`}
      >
        <Play className="w-4 h-4 mr-2" />
        {hasSeenWalkthrough ? 'Review Walkthrough' : 'Start Walkthrough'}
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${className}`} onClick={handleClick}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
              <BookOpen className="w-5 h-5" />
            </div>
            {hasSeenWalkthrough ? 'Review Platform Tour' : 'Take Platform Tour'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {hasSeenWalkthrough 
              ? 'Refresh your knowledge with our interactive walkthrough'
              : 'Get familiar with all the features in just 5 minutes'
            }
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              5-10 min
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              All roles
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Interactive
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {hasSeenWalkthrough ? 'Need a Refresher?' : 'Welcome to Rank It Pro!'}
              </h3>
              <p className="text-blue-100">
                {hasSeenWalkthrough 
                  ? 'Review our interactive walkthrough to maximize your results'
                  : 'Take our quick tour to unlock the full potential of your platform'
                }
              </p>
            </div>
          </div>
          <Button
            onClick={handleClick}
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Play className="w-4 h-4 mr-2" />
            {hasSeenWalkthrough ? 'Review Tour' : 'Start Tour'}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={handleClick}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <HelpCircle className="w-5 h-5 mr-2" />
          {hasSeenWalkthrough ? 'Help' : 'Tour'}
        </Button>
      </div>
    );
  }

  return null;
}

// Quick access component for help menus
export function OnboardingMenuItem() {
  const { startWalkthrough, hasSeenWalkthrough } = useOnboarding();

  return (
    <button
      onClick={startWalkthrough}
      className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Play className="w-4 h-4 mr-3" />
      {hasSeenWalkthrough ? 'Review Walkthrough' : 'Platform Walkthrough'}
    </button>
  );
}

// Progress indicator for partially completed walkthroughs
export function OnboardingProgress({ progress }: { progress: number }) {
  const { startWalkthrough } = useOnboarding();

  if (progress >= 100) {
    return (
      <div className="flex items-center text-green-600 text-sm">
        <CheckCircle className="w-4 h-4 mr-2" />
        Walkthrough Complete
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Walkthrough Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <Button
        onClick={startWalkthrough}
        variant="outline"
        size="sm"
      >
        Continue
      </Button>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Users, 
  BarChart3, 
  FileText, 
  Star,
  Camera,
  Globe,
  Zap,
  Target,
  BookOpen,
  Video,
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  required?: boolean;
  actionButtons?: {
    label: string;
    action: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }[];
  videoUrl?: string;
  tips?: string[];
  nextStepCondition?: () => boolean;
}

interface OnboardingData {
  completedSteps: string[];
  currentStep: string;
  hasSeenWalkthrough: boolean;
  skippedSteps: string[];
  lastActiveDate: string;
}

interface OnboardingWalkthroughProps {
  userRole: 'super_admin' | 'company_admin' | 'technician' | 'sales_staff';
  businessType: 'field_service' | 'marketing_focused';
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  autoStart?: boolean;
}

export function OnboardingWalkthrough({ 
  userRole, 
  businessType, 
  isOpen, 
  onClose, 
  onComplete, 
  autoStart = false 
}: OnboardingWalkthroughProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const [expandedTips, setExpandedTips] = useState<string[]>([]);
  const [walkthoughMode, setWalkthroughMode] = useState<'guided' | 'interactive' | 'overview'>('guided');

  // Load onboarding progress
  const { data: onboardingData, isLoading } = useQuery<OnboardingData>({
    queryKey: ['/api/onboarding/progress'],
    enabled: isOpen,
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: (data: Partial<OnboardingData>) => 
      apiRequest('/api/onboarding/progress', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/progress'] });
    },
  });

  // Define steps based on user role and business type
  const getOnboardingSteps = (): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Rank It Pro',
        description: 'Your comprehensive business management platform',
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome aboard!</h3>
              <p className="text-gray-600 mb-4">
                We'll walk you through everything you need to know to get the most out of Rank It Pro.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="pt-4">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Analytics</h4>
                  <p className="text-sm text-gray-600">Track your business performance</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium">Team Management</h4>
                  <p className="text-sm text-gray-600">Manage staff and submissions</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-medium">Reviews</h4>
                  <p className="text-sm text-gray-600">Automate review collection</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ),
        required: true,
        tips: [
          'This walkthrough will take about 5-10 minutes',
          'You can pause or exit at any time',
          'All features shown are included in your plan'
        ]
      }
    ];

    // Add role-specific steps
    if (userRole === 'company_admin') {
      baseSteps.push(
        {
          id: 'dashboard-overview',
          title: 'Your Dashboard',
          description: 'Overview of your business metrics and quick actions',
          content: (
            <div className="space-y-4">
              <p>Your dashboard provides a real-time view of your business performance.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Key Metrics</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Monthly submissions</li>
                    <li>• Revenue growth</li>
                    <li>• Customer satisfaction</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Quick Actions</h4>
                  <ul className="text-sm text-green-800 mt-2 space-y-1">
                    <li>• Add new staff</li>
                    <li>• Generate content</li>
                    <li>• View reports</li>
                  </ul>
                </div>
              </div>
            </div>
          ),
          targetElement: '[data-onboarding="dashboard"]',
          position: 'bottom',
          tips: [
            'Your dashboard updates in real-time',
            'Click any metric to see detailed analytics',
            'Use the date filter to view different periods'
          ]
        },
        {
          id: 'team-management',
          title: 'Manage Your Team',
          description: 'Add and manage staff members',
          content: (
            <div className="space-y-4">
              <p>Easily add and manage your team members from the staff section.</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Staff Roles Available:</h4>
                <div className="space-y-2">
                  {businessType === 'field_service' && (
                    <Badge variant="outline" className="mr-2">Field Technician</Badge>
                  )}
                  <Badge variant="outline" className="mr-2">Sales Staff</Badge>
                  <Badge variant="outline">Company Admin</Badge>
                </div>
              </div>
            </div>
          ),
          targetElement: '[data-onboarding="team-management"]',
          position: 'right',
          actionButtons: [
            {
              label: 'Add Staff Member',
              action: () => {
                // Navigate to staff management
                window.location.href = '/staff-management';
              },
              variant: 'default'
            }
          ],
          tips: [
            'Each staff member gets their own login',
            'You can set different permissions per role',
            'Mobile access is included for all staff'
          ]
        }
      );

      // Add business type specific steps
      if (businessType === 'field_service') {
        baseSteps.push({
          id: 'field-submissions',
          title: 'Field Submissions',
          description: 'How your technicians submit job completions',
          content: (
            <div className="space-y-4">
              <p>Your technicians can submit job completions directly from their mobile devices.</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Submission Process:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Technician completes job</li>
                  <li>Takes before/after photos</li>
                  <li>Enters customer details</li>
                  <li>Describes work performed</li>
                  <li>Submits for AI content generation</li>
                </ol>
              </div>
            </div>
          ),
          targetElement: '[data-onboarding="submissions"]',
          position: 'left',
          tips: [
            'GPS location is automatically captured',
            'Photos are required for quality assurance',
            'AI generates SEO content from submissions'
          ]
        });
      }

      baseSteps.push({
        id: 'content-generation',
        title: 'AI Content Generation',
        description: 'Automatically generate SEO content from submissions',
        content: (
          <div className="space-y-4">
            <p>Our AI automatically creates SEO-optimized content from your submissions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">What We Generate:</h4>
                <ul className="text-sm text-purple-800 mt-2 space-y-1">
                  <li>• Blog posts</li>
                  <li>• Social media content</li>
                  <li>• Customer testimonials</li>
                  <li>• Local SEO descriptions</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">SEO Benefits:</h4>
                <ul className="text-sm text-green-800 mt-2 space-y-1">
                  <li>• Improved Google rankings</li>
                  <li>• More organic traffic</li>
                  <li>• Local search visibility</li>
                  <li>• Customer trust building</li>
                </ul>
              </div>
            </div>
          </div>
        ),
        targetElement: '[data-onboarding="content-generation"]',
        position: 'top',
        tips: [
          'Content is automatically optimized for your local market',
          'You can edit generated content before publishing',
          'Fresh content improves your Google rankings'
        ]
      });
    }

    if (userRole === 'technician') {
      baseSteps.push(
        {
          id: 'mobile-app',
          title: 'Mobile Field App',
          description: 'Your mobile interface for job submissions',
          content: (
            <div className="space-y-4">
              <p>The mobile app is designed specifically for field work.</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Key Features:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm">Photo capture</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">GPS tracking</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm">Job notes</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm">Instant sync</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          targetElement: '[data-onboarding="mobile-app"]',
          position: 'bottom',
          tips: [
            'Works offline - syncs when connected',
            'All submissions are automatically backed up',
            'GPS location helps with scheduling'
          ]
        },
        {
          id: 'submission-process',
          title: 'Submitting Jobs',
          description: 'Step-by-step job submission process',
          content: (
            <div className="space-y-4">
              <p>Follow these simple steps to submit completed jobs:</p>
              <div className="space-y-3">
                {[
                  { step: 1, title: 'Take Photos', desc: 'Before and after shots' },
                  { step: 2, title: 'Enter Details', desc: 'Customer name and job info' },
                  { step: 3, title: 'Add Notes', desc: 'Describe work performed' },
                  { step: 4, title: 'Submit', desc: 'Send to your company' }
                ].map(item => (
                  <div key={item.step} className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          targetElement: '[data-onboarding="submission-form"]',
          position: 'right',
          tips: [
            'Photos are required for quality assurance',
            'Be specific in your job descriptions',
            'Customer names help with review requests'
          ]
        }
      );
    }

    // Add completion step
    baseSteps.push({
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Ready to start using Rank It Pro',
      content: (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Congratulations!</h3>
          <p className="text-gray-600">
            You've completed the onboarding walkthrough. You're now ready to start using Rank It Pro to grow your business.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Start using your dashboard</li>
              <li>• Add your team members</li>
              <li>• Begin submitting jobs</li>
              <li>• Watch your SEO rankings improve</li>
            </ul>
          </div>
        </div>
      ),
      required: true,
      actionButtons: [
        {
          label: 'Start Using Rank It Pro',
          action: () => {
            // Immediately set localStorage to prevent reappearance
            localStorage.setItem('rankitpro_walkthrough_completed', 'true');
            onComplete();
            toast({
              title: 'Welcome to Rank It Pro!',
              description: 'You\'re ready to start growing your business.',
            });
          },
          variant: 'default'
        }
      ],
      tips: [
        'You can revisit this walkthrough anytime from the help menu',
        'Our support team is available if you need assistance',
        'Check out our knowledge base for advanced features'
      ]
    });

    return baseSteps;
  };

  const steps = getOnboardingSteps();
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Initialize with saved progress
  useEffect(() => {
    if (onboardingData) {
      setCompletedSteps(onboardingData.completedSteps || []);
      const savedStepIndex = steps.findIndex(step => step.id === onboardingData.currentStep);
      if (savedStepIndex !== -1) {
        setCurrentStepIndex(savedStepIndex);
      }
    }
  }, [onboardingData]);

  // Save progress when step changes
  useEffect(() => {
    if (currentStep && !isLoading) {
      saveProgressMutation.mutate({
        currentStep: currentStep.id,
        completedSteps,
        lastActiveDate: new Date().toISOString(),
      });
    }
  }, [currentStepIndex, completedSteps]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      // Mark current step as completed
      setCompletedSteps(prev => [...prev, currentStep.id]);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    saveProgressMutation.mutate({
      hasSeenWalkthrough: true,
      skippedSteps: [...(onboardingData?.skippedSteps || []), currentStep.id],
    });
    onClose();
  };

  const handleComplete = () => {
    // Immediately set localStorage to prevent reappearance
    localStorage.setItem('rankitpro_walkthrough_completed', 'true');
    
    setCompletedSteps(prev => [...prev, currentStep.id]);
    saveProgressMutation.mutate({
      hasSeenWalkthrough: true,
      completedSteps: [...completedSteps, currentStep.id],
    });
    onComplete();
  };

  const toggleTip = (stepId: string) => {
    setExpandedTips(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {currentStep?.title || 'Onboarding Walkthrough'}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="ml-1">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  // Immediately set localStorage to prevent reappearance
                  localStorage.setItem('rankitpro_walkthrough_completed', 'true');
                  // Ensure completion is saved when closing
                  onComplete();
                }}
                title="Close and mark as completed"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Mode Selector */}
          <Tabs value={walkthoughMode} onValueChange={setWalkthroughMode as any}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guided">Guided</TabsTrigger>
              <TabsTrigger value="interactive">Interactive</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="guided" className="space-y-4">
              {/* Main Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {currentStepIndex + 1}
                    </div>
                    {currentStep?.title}
                  </CardTitle>
                  <p className="text-gray-600">{currentStep?.description}</p>
                </CardHeader>
                <CardContent>
                  {currentStep?.content}
                </CardContent>
              </Card>

              {/* Tips Section */}
              {currentStep?.tips && (
                <Card>
                  <CardHeader>
                    <Button
                      variant="ghost"
                      onClick={() => toggleTip(currentStep.id)}
                      className="flex items-center justify-between w-full p-0 h-auto"
                    >
                      <div className="flex items-center">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="font-medium">Tips & Best Practices</span>
                      </div>
                      {expandedTips.includes(currentStep.id) ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </Button>
                  </CardHeader>
                  {expandedTips.includes(currentStep.id) && (
                    <CardContent>
                      <ul className="space-y-2">
                        {currentStep.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              )}
            </TabsContent>

            <TabsContent value="interactive" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Interactive Mode</h3>
                    <p className="text-gray-600 mb-4">
                      Try the actual features as we guide you through them.
                    </p>
                    <Button>
                      Start Interactive Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          index === currentStepIndex
                            ? 'border-blue-500 bg-blue-50'
                            : completedSteps.includes(step.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentStepIndex(index)}
                      >
                        <div className="flex items-start">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                            completedSteps.includes(step.id)
                              ? 'bg-green-600 text-white'
                              : index === currentStepIndex
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {completedSteps.includes(step.id) ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{step.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  // Immediately set localStorage to prevent reappearance
                  localStorage.setItem('rankitpro_walkthrough_completed', 'true');
                  // Mark as completed when skipped
                  onComplete();
                }}
              >
                Skip Walkthrough
              </Button>
            </div>

            <div className="flex space-x-2">
              {/* Custom action buttons */}
              {currentStep?.actionButtons?.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || 'outline'}
                  onClick={button.action}
                >
                  {button.label}
                </Button>
              ))}

              {/* Next/Complete button */}
              {currentStepIndex === steps.length - 1 ? (
                <Button onClick={handleComplete}>
                  Complete Walkthrough
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Wrench, 
  MapPin, 
  Camera, 
  Smartphone,
  Store,
  MessageSquare,
  Star,
  Share2,
  Bot,
  Globe
} from 'lucide-react';

interface BusinessTypeSelectorProps {
  onSelect: (businessType: 'service_business' | 'non_service_business') => void;
  selectedType?: 'service_business' | 'non_service_business';
}

export function BusinessTypeSelector({ onSelect, selectedType }: BusinessTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const businessTypes = [
    {
      id: 'service_business',
      title: 'Service Business',
      subtitle: 'For businesses with field staff and on-site services',
      description: 'Perfect for service technicians, home services, and field workers. Get ALL features including check-ins, reviews, content generation, and more.',
      examples: ['HVAC Repair', 'Plumbing', 'Electrical', 'Landscaping', 'Appliance Repair'],
      features: [
        { icon: <MapPin className="w-4 h-4" />, text: 'GPS Check-ins & Job Tracking' },
        { icon: <Camera className="w-4 h-4" />, text: 'Photo/Audio Uploads' },
        { icon: <Star className="w-4 h-4" />, text: 'Review Management' },
        { icon: <MessageSquare className="w-4 h-4" />, text: 'AI Content Generation' },
        { icon: <Smartphone className="w-4 h-4" />, text: 'Mobile App Access' },
        { icon: <Share2 className="w-4 h-4" />, text: 'Social Media Integration' }
      ],
      pricing: 'All features based on plan',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'non_service_business',
      title: 'Non-Service Business',
      subtitle: 'For location-based businesses without field staff',
      description: 'Ideal for restaurants, dentists, retailers, and office-based businesses. Get ALL features except check-ins - perfect for boosting online presence.',
      examples: ['Restaurants', 'Dental Offices', 'Retail Stores', 'Salons', 'Professional Services'],
      features: [
        { icon: <Star className="w-4 h-4" />, text: 'Review Management' },
        { icon: <MessageSquare className="w-4 h-4" />, text: 'AI Content Generation' },
        { icon: <Share2 className="w-4 h-4" />, text: 'Social Media Integration' },
        { icon: <Globe className="w-4 h-4" />, text: 'Website Integration' },
        { icon: <Bot className="w-4 h-4" />, text: 'SEO Optimization' },
        { icon: <Store className="w-4 h-4" />, text: 'Business Analytics' }
      ],
      pricing: 'Starting at $97/month',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Business Type</h2>
        <p className="text-gray-600">Select the edition that best fits your business needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {businessTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all duration-200 ${type.color} ${
              selectedType === type.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelect(type.id as 'service_business' | 'non_service_business')}
            onMouseEnter={() => setHoveredType(type.id)}
            onMouseLeave={() => setHoveredType(null)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{type.title}</CardTitle>
                {selectedType === type.id && (
                  <Badge variant="default" className="bg-blue-500">Selected</Badge>
                )}
              </div>
              <CardDescription className="text-sm font-medium text-gray-700">
                {type.subtitle}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{type.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Perfect For:
                </p>
                <div className="flex flex-wrap gap-1">
                  {type.examples.map((example) => (
                    <Badge key={example} variant="secondary" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Key Features:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                      {feature.icon}
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{type.pricing}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Both editions include AI-powered content generation and automated review requests
        </p>
      </div>
    </div>
  );
}
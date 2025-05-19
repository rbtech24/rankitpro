import React from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function Careers() {
  return (
    <InfoPageLayout 
      title="Careers" 
      description="Join our team and help transform the home service industry"
    >
      <div className="max-w-5xl mx-auto">
        {/* Why Work With Us */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Why Work With Us</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Join Our Mission</h3>
                <p className="text-slate-600 mb-4">
                  At CheckIn Pro, we're building technology that transforms how home service businesses operate and market themselves. 
                  Our platform bridges the gap between field operations and marketing, making both more efficient and effective.
                </p>
                <p className="text-slate-600 mb-4">
                  We're a team of technologists with deep industry experience, committed to solving real problems for real businesses. 
                  If you're passionate about creating practical solutions that make a meaningful difference, you'll fit right in.
                </p>
                <p className="text-slate-600">
                  We value innovation, craftsmanship, and a customer-first mindset. Our team works collaboratively, celebrates diversity, 
                  and embraces continuous learning and improvement.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start">
                      <div className="mr-2 mt-1 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{benefit.title}</h4>
                        <p className="text-xs text-slate-500">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="grid grid-cols-1 gap-6">
            {openPositions.map((position, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{position.title}</h3>
                    <p className="text-primary">{position.department}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <span className="px-3 py-1 text-xs rounded-full bg-slate-100">{position.location}</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-slate-100">{position.type}</span>
                  </div>
                </div>
                <p className="text-slate-600 mb-4">{position.description}</p>
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Responsibilities:</h4>
                  <ul className="list-disc pl-5 text-slate-600 text-sm space-y-1">
                    {position.responsibilities.map((resp, j) => (
                      <li key={j}>{resp}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="list-disc pl-5 text-slate-600 text-sm space-y-1">
                    {position.requirements.map((req, j) => (
                      <li key={j}>{req}</li>
                    ))}
                  </ul>
                </div>
                <a href="#" className="inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="bg-primary/5 p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <span className="text-2xl">{value.emoji}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-slate-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Hiring Process</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="relative">
              {hiringProcess.map((step, i) => (
                <div key={i} className="mb-8 last:mb-0">
                  <div className="flex items-start">
                    <div className="mr-4 relative">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold z-10 relative">
                        {i + 1}
                      </div>
                      {i < hiringProcess.length - 1 && (
                        <div className="absolute top-8 left-4 w-px h-full bg-slate-200 -translate-x-1/2"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-slate-600 mb-2">{step.description}</p>
                      {step.tips && (
                        <div className="bg-slate-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm mb-1">Tips:</h4>
                          <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1">
                            {step.tips.map((tip, j) => (
                              <li key={j}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-primary text-white rounded-xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Don't See a Position That Fits?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our team. Send us your resume and tell us how you can contribute to our mission.
          </p>
          <a href="#" className="inline-block px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-slate-100 transition-colors">
            Send Open Application
          </a>
        </section>
      </div>
    </InfoPageLayout>
  );
}

const benefits = [
  {
    title: "Flexible Remote Work",
    description: "Work from anywhere with flexible hours"
  },
  {
    title: "Competitive Salary",
    description: "Compensation packages that recognize your value"
  },
  {
    title: "Health Benefits",
    description: "Comprehensive health, dental, and vision coverage"
  },
  {
    title: "401(k) Matching",
    description: "Plan for your future with our matching program"
  },
  {
    title: "Professional Development",
    description: "Budget for conferences, courses, and learning"
  },
  {
    title: "Team Retreats",
    description: "Regular in-person meetings to connect and collaborate"
  }
];

const openPositions = [
  {
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description: "We're looking for a Full Stack Developer to help build and enhance our platform. You'll work on both frontend and backend components, collaborating with our product and design teams to create a seamless user experience.",
    responsibilities: [
      "Develop and maintain features across the frontend and backend of our platform",
      "Write clean, maintainable, and well-tested code",
      "Collaborate with designers to implement responsive, user-friendly interfaces",
      "Optimize application performance and scalability",
      "Participate in code reviews and contribute to technical design decisions"
    ],
    requirements: [
      "3+ years of experience in full stack development",
      "Proficiency in React, Node.js, and TypeScript",
      "Experience with database design and ORM frameworks",
      "Familiarity with cloud services (AWS, GCP, or Azure)",
      "Strong problem-solving skills and attention to detail",
      "Experience with mobile-responsive design and development"
    ]
  },
  {
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description: "As an AI/ML Engineer at CheckIn Pro, you'll work on our content generation systems that transform field data into marketing content. You'll collaborate with our engineering and product teams to enhance and expand our AI capabilities.",
    responsibilities: [
      "Design, develop, and improve our AI-powered content generation systems",
      "Train and fine-tune models for specific use cases in the home service industry",
      "Implement and optimize NLP algorithms for text generation and analysis",
      "Work with product and design teams to create intuitive AI-powered features",
      "Monitor and improve model performance and efficiency"
    ],
    requirements: [
      "3+ years of experience in AI/ML engineering",
      "Strong knowledge of NLP and generative AI techniques",
      "Experience with OpenAI API, Claude API, or similar LLM frameworks",
      "Proficiency in Python and related ML frameworks (TensorFlow, PyTorch)",
      "Understanding of prompt engineering and model fine-tuning",
      "Experience deploying ML models in production environments"
    ]
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote (US)",
    type: "Full-time",
    description: "We're seeking a Customer Success Manager to ensure our customers achieve their goals using our platform. You'll be the primary point of contact for a portfolio of customers, providing guidance, training, and support throughout their journey.",
    responsibilities: [
      "Onboard new customers and ensure successful implementation of our platform",
      "Develop strong relationships with key stakeholders at customer companies",
      "Conduct regular check-ins and reviews to ensure customer satisfaction",
      "Identify opportunities for customers to maximize value from our platform",
      "Work with product and engineering teams to address customer needs",
      "Monitor customer health metrics and develop retention strategies"
    ],
    requirements: [
      "3+ years of experience in customer success or account management",
      "Experience working with SaaS products, ideally in B2B settings",
      "Strong communication and presentation skills",
      "Problem-solving mindset and ability to manage multiple priorities",
      "Experience with CRM systems and customer success tools",
      "Understanding of the home service industry is a plus"
    ]
  }
];

const values = [
  {
    title: "Customer Impact",
    emoji: "🎯",
    description: "We measure our success by the success of our customers. Every decision we make is guided by how it will help the businesses we serve."
  },
  {
    title: "Practical Innovation",
    emoji: "💡",
    description: "We push technological boundaries while staying grounded in practical, real-world solutions that deliver immediate value."
  },
  {
    title: "Continuous Growth",
    emoji: "🌱",
    description: "We're committed to learning and improving every day, both as individuals and as a company."
  }
];

const hiringProcess = [
  {
    title: "Application Review",
    description: "We review your resume, cover letter, and any samples of your work to evaluate your qualifications and fit for the role.",
    tips: [
      "Tailor your resume to highlight relevant experience and skills",
      "Include specific achievements with measurable results",
      "In your cover letter, explain why you're interested in our mission"
    ]
  },
  {
    title: "Initial Interview",
    description: "A 30-minute video call with a hiring manager to discuss your background, skills, and interest in the position.",
    tips: [
      "Research our company and be ready to explain why you want to join us",
      "Prepare examples of your past work relevant to the position",
      "Come with thoughtful questions about the role and company"
    ]
  },
  {
    title: "Technical Assessment",
    description: "Depending on the role, you may complete a take-home project or technical interview to demonstrate your skills.",
    tips: [
      "Focus on demonstrating your problem-solving approach",
      "Don't hesitate to ask clarifying questions",
      "Comment your code or explain your thinking process"
    ]
  },
  {
    title: "Team Interviews",
    description: "Meet with potential teammates and stakeholders to discuss collaboration, technical approaches, and cultural fit.",
    tips: [
      "Be ready to discuss how you work with others and handle challenges",
      "Show curiosity about our technology and business challenges",
      "Be authentic and ask questions that help you evaluate if we're right for you"
    ]
  },
  {
    title: "Offer & Onboarding",
    description: "If selected, you'll receive an offer and our team will guide you through the onboarding process.",
    tips: [
      "Don't hesitate to ask about any aspects of the offer that are unclear",
      "Prepare for a comprehensive onboarding process to get you up to speed quickly",
      "Get ready to meet your new teammates and make an impact!"
    ]
  }
];
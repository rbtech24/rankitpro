import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatWidget from "../../components/chat/chat-widget";
import { OnboardingWalkthrough } from "../onboarding/OnboardingWalkthrough";
import { useOnboarding } from "../onboarding/OnboardingProvider";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  companyId?: number;
}

interface AuthData {
  user: User;
  company: any;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data: auth } = useQuery<AuthData>({
    queryKey: ["/api/auth/me"]
  });

  const { showWalkthrough, setShowWalkthrough } = useOnboarding();

  return (
    <>
      {children}
      {auth?.user && auth.user.role !== 'super_admin' && (
        <ChatWidget user={auth.user} />
      )}
      {auth?.user && auth.user.role !== 'super_admin' && auth.company && (
        <OnboardingWalkthrough
          userRole={auth.user.role as 'company_admin' | 'technician' | 'sales_staff'}
          businessType={auth.company.businessType || 'field_service'}
          isOpen={showWalkthrough}
          onClose={() => setShowWalkthrough(false)}
          onComplete={() => setShowWalkthrough(false)}
        />
      )}
    </>
  );
}
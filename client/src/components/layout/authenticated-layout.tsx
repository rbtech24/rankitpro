import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatWidget from "@/components/chat/chat-widget";

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

  return (
    <>
      {children}
      {auth?.user && auth.user.role !== 'super_admin' && (
        <ChatWidget user={auth.user} />
      )}
    </>
  );
}
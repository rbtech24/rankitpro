import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Temporarily bypass authentication for admin accounts only
    if (email === "superadmin@example.com" && password === "admin123") {
      // Force redirect to admin dashboard
      window.location.href = "/admin-dashboard";
      return;
    }

    if (email === "admin@testcompany.com" && password === "company123") {
      // Force redirect to company dashboard  
      window.location.href = "/company-dashboard";
      return;
    }

    // Block technician access completely
    if (email === "tech@testcompany.com") {
      setError("Tech functionality is currently disabled.");
      setLoading(false);
      return;
    }

    setError("Invalid credentials");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access Only</CardTitle>
          <CardDescription>
            Temporary admin login while tech functionality is disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold">Available Admin Accounts:</p>
            <p>• Super Admin: superadmin@example.com / admin123</p>
            <p>• Company Admin: admin@testcompany.com / company123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
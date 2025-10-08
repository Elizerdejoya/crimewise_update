import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import { API_BASE_URL } from "@/lib/config";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        // Redirect based on role
        if (data.role === "super_admin") navigate("/admin/organizations");
        else if (data.role === "admin") navigate("/admin");
        else if (data.role === "instructor") navigate("/instructor");
        else if (data.role === "student") navigate("/student");
        else navigate("/");
      } else {
        toast({
          title: "Invalid credentials",
          description:
            data.error || "Please check your email, password, and role.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Server error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-6">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-2" />
        <h1 className="text-2xl font-bold text-center">
          Online Forensic Examination System
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          LSPU - CCJE Department
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select role</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            {/* <a href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </a> */}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-primary"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;

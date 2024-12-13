import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white animate-fadeIn">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input type="email" placeholder="Email address" className="w-full" />
            <Input type="password" placeholder="Password" className="w-full" />
          </div>

          <div>
            <Link to="/">
              <Button className="w-full bg-primary hover:bg-primary-dark">
                Sign in
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <Apple className="mr-2 h-4 w-4" />
              Apple
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:text-primary-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
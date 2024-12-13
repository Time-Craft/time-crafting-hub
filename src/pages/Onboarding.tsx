import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Onboarding = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-light to-white animate-fadeIn">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-full inline-block shadow-lg">
            <Clock size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">TimeCraft</h1>
          <p className="text-lg text-gray-600 max-w-sm mx-auto">
            Exchange your time for services. Join our community of Time-Crafters today.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/login">
            <Button className="w-full bg-primary hover:bg-primary-dark text-white">
              Get Started
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-dark">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
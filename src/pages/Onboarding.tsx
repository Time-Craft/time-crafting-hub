import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  services: z.string().min(10, "Please describe your services in at least 10 characters"),
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const username = localStorage.getItem('username') || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      services: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    localStorage.setItem('userServices', values.services);
    toast({
      title: "Welcome to TimeCraft!",
      description: "Your services have been saved successfully.",
    });
    navigate('/profile');
  };

  if (!username) {
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
            <Link to="/signup">
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
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-light to-white animate-fadeIn">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-full inline-block shadow-lg">
            <Clock size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {username}!</h1>
          <p className="text-lg text-gray-600">
            Tell us about the services you'd like to offer
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What services can you provide?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., I can offer gardening services, tutoring in mathematics..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary-dark">
              Complete Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Onboarding;
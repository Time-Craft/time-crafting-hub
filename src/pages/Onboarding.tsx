import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  services: z.string().min(10, "Please describe your services in at least 10 characters"),
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      services: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    // Store the services in localStorage for now
    localStorage.setItem('userServices', values.services);
    
    toast({
      title: "Welcome to TimeCraft!",
      description: "Your services have been saved successfully.",
      duration: 2000,
    });
    
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-light to-white animate-fadeIn">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-full inline-block shadow-lg">
            <Clock size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome to TimeCraft!</h1>
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
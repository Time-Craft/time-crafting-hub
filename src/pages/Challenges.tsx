import { Trophy, Target, HandsClapping } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Challenges = () => {
  const challenges = [
    {
      id: 1,
      title: "Community Helper",
      description: "Complete 5 services this week",
      progress: 60,
      icon: HandsClapping,
      reward: "3 bonus hours",
    },
    {
      id: 2,
      title: "Diverse Skills",
      description: "Try 3 different service categories",
      progress: 33,
      icon: Target,
      reward: "2 bonus hours",
    },
  ];

  return (
    <div className="min-h-screen pb-20 p-4 bg-secondary/30">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Trophy className="text-primary" />
            Challenges
          </h1>
          <div className="text-sm text-gray-600">
            Your Points: 120
          </div>
        </div>

        {challenges.map((challenge) => (
          <Card key={challenge.id} className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <challenge.icon className="text-primary" />
                  {challenge.title}
                </div>
                <span className="text-sm text-primary-dark font-normal">
                  {challenge.reward}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{challenge.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{challenge.progress}%</span>
                </div>
                <Progress value={challenge.progress} className="h-2" />
              </div>
              <Button variant="secondary" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default Challenges;
import { Clock, Calendar, ArrowUpRight, ArrowDownRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      navigate('/login');
      return;
    }
    setUsername(storedUsername);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <header className="bg-primary/5 p-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {username}</h1>
          <p className="text-gray-600 mt-1">Current Status: Available</p>
        </div>
      </header>

      {/* Time Balance Section */}
      <section className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary-light">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="text-primary" />
                  <span className="text-sm text-gray-600">Time Earned</span>
                </div>
                <p className="text-2xl font-semibold mt-2">12.5 hrs</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="text-primary" />
                  <span className="text-sm text-gray-600">Time Spent</span>
                </div>
                <p className="text-2xl font-semibold mt-2">8.0 hrs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="p-6 pt-0">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary" />
                    <span>Active Services</span>
                  </div>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary" />
                    <span>Upcoming Sessions</span>
                  </div>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-primary" />
                    <span>Completed Exchanges</span>
                  </div>
                  <span className="font-semibold">15</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="p-6 pt-0">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "earned",
                    service: "Guitar Lessons",
                    time: "2 hrs",
                    date: "Today",
                  },
                  {
                    type: "spent",
                    service: "Garden Maintenance",
                    time: "1.5 hrs",
                    date: "Yesterday",
                  },
                  {
                    type: "earned",
                    service: "Math Tutoring",
                    time: "1 hr",
                    date: "2 days ago",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{activity.service}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.type === "earned" ? (
                        <ArrowUpRight className="text-green-500" />
                      ) : (
                        <ArrowDownRight className="text-primary" />
                      )}
                      <span className={activity.type === "earned" ? "text-green-500" : "text-primary"}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default Home;
import { Calendar, Clock, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionStats } from "@/hooks/useTransactionStats";

export const QuickStats = () => {
  const { data: stats } = useTransactionStats();

  return (
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
                <span className="font-semibold">{stats?.activeServices || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" />
                  <span>Upcoming Sessions</span>
                </div>
                <span className="font-semibold">{stats?.upcomingSessions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="text-primary" />
                  <span>Completed Exchanges</span>
                </div>
                <span className="font-semibold">{stats?.completedExchanges || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
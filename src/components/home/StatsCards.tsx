import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactionStats } from "@/hooks/useTransactionStats";

export const StatsCards = () => {
  const { data: stats } = useTransactionStats();

  return (
    <section className="p-6">
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary-light">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="text-primary" />
                <span className="text-sm text-gray-600">Time Earned</span>
              </div>
              <p className="text-2xl font-semibold mt-2">{stats?.earnedHours || 0} hrs</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="text-primary" />
                <span className="text-sm text-gray-600">Time Spent</span>
              </div>
              <p className="text-2xl font-semibold mt-2">{stats?.spentHours || 0} hrs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { CheckInCalendar } from "@/components/CheckInCalendar";
import { ThemeToggle } from "@/components/ThemeToggle";

const Calendar = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bebas">Calendário</h1>
          <ThemeToggle />
        </div>

        {/* Calendar Component */}
        <CheckInCalendar />
      </div>

      <BottomNav />
    </div>
  );
};

export default Calendar;

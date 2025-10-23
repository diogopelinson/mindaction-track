import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyUpdate {
  id: string;
  week_number: number;
  weight: number;
  photo_url?: string;
  created_at: string;
  waist_circumference?: number;
  neck_circumference?: number;
}

export const CheckInCalendar = () => {
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const update = updates.find(u => u.created_at.split('T')[0] === dateStr);
    
    if (!update) return null;
    
    // Check if complete (has weight + measurements + photo)
    const isComplete = update.photo_url && update.waist_circumference && update.neck_circumference;
    return isComplete ? 'complete' : 'partial';
  };

  const modifiers = {
    complete: (date: Date) => getDateStatus(date) === 'complete',
    partial: (date: Date) => getDateStatus(date) === 'partial',
  };

  const modifiersStyles = {
    complete: {
      backgroundColor: 'hsl(var(--success))',
      color: 'white',
      fontWeight: 'bold',
    },
    partial: {
      backgroundColor: 'hsl(var(--warning))',
      color: 'white',
      fontWeight: 'bold',
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendário de Check-ins
        </CardTitle>
        <CardDescription>
          Visualize seu histórico de consistência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span>Check-in Completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning" />
              <span>Check-in Parcial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2" />
              <span>Sem Check-in</span>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Total de Check-ins</p>
              <p className="text-2xl font-bold text-primary">{updates.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Última Semana</p>
              <p className="text-2xl font-bold">
                {updates[0] ? `#${updates[0].week_number}` : '-'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

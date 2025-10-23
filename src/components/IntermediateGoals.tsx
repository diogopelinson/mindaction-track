import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Check, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Skeleton } from "@/components/ui/skeleton";

interface IntermediateGoal {
  id: string;
  target_weight: number;
  target_date: string | null;
  achieved: boolean;
  achieved_at: string | null;
}

export const IntermediateGoals = () => {
  const [goals, setGoals] = useState<IntermediateGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('intermediate_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('target_weight', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoalWeight) {
      toast({
        title: "Peso obrigatório",
        description: "Por favor, informe o peso alvo.",
        variant: "destructive",
      });
      return;
    }

    if (goals.filter(g => !g.achieved).length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você pode ter no máximo 5 metas ativas.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('intermediate_goals')
        .insert({
          user_id: user.id,
          target_weight: parseFloat(newGoalWeight),
          target_date: newGoalDate || null,
        });

      if (error) throw error;

      toast({
        title: "Meta adicionada!",
        description: "Sua nova meta intermediária foi criada.",
      });

      setNewGoalWeight("");
      setNewGoalDate("");
      setShowForm(false);
      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar meta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsAchieved = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('intermediate_goals')
        .update({ achieved: true, achieved_at: new Date().toISOString() })
        .eq('id', goalId);

      if (error) throw error;

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      toast({
        title: "🎉 Meta Conquistada!",
        description: "Parabéns por alcançar sua meta intermediária!",
      });

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('intermediate_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta removida",
        description: "A meta foi excluída com sucesso.",
      });

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao remover meta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goals.filter(g => !g.achieved);
  const achievedGoals = goals.filter(g => g.achieved);

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Metas Intermediárias
              </CardTitle>
              <CardDescription>
                Divida seu objetivo em pequenos passos
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {achievedGoals.length}/{goals.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showForm && activeGoals.length < 5 && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Meta
            </Button>
          )}

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg space-y-3 bg-muted/50"
            >
              <div className="space-y-2">
                <Label htmlFor="weight">Peso Alvo (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={newGoalWeight}
                  onChange={(e) => setNewGoalWeight(e.target.value)}
                  placeholder="Ex: 75.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data Alvo (opcional)</Label>
                <Input
                  id="date"
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addGoal} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Meta
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {activeGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{goal.target_weight} kg</p>
                        {goal.target_date && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(goal.target_date), "dd MMM yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsAchieved(goal.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Atingi
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {achievedGoals.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                  Metas Conquistadas
                </h4>
                <div className="space-y-2">
                  {achievedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3 border rounded-lg bg-success/5 border-success/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span className="font-medium">{goal.target_weight} kg</span>
                        </div>
                        {goal.achieved_at && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(goal.achieved_at), "dd MMM yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {goals.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma meta criada ainda. Comece adicionando sua primeira!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

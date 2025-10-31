import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateCPF, formatCPF } from "@/lib/cpfValidator";
import GoalTypeSelector from "@/components/admin/GoalTypeSelector";
import ZoneExplainer from "@/components/admin/ZoneExplainer";

const CreateMentee = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cpfValue, setCpfValue] = useState("");
  const [goalType, setGoalType] = useState("perda_peso_padrao");
  const [initialWeight, setInitialWeight] = useState<number>(70);

  // Calcular peso meta automaticamente baseado no objetivo
  const calculateTargetWeight = (initial: number, goal: string): number => {
    if (goal === 'ganho_massa') return initial * 1.10; // +10%
    if (goal === 'perda_peso_moderada') return initial * 0.95; // -5%
    return initial * 0.90; // -10% (perda_peso_padrao)
  };

  const targetWeight = calculateTargetWeight(initialWeight, goalType);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const temporaryPassword = formData.get('temporaryPassword') as string;
    const fullName = formData.get('fullName') as string;
    const cpf = formData.get('cpf') as string;
    const phone = formData.get('phone') as string;
    const sex = formData.get('sex') as string;
    const age = parseInt(formData.get('age') as string);
    const height = parseFloat(formData.get('height') as string);
    const initialWeightValue = parseFloat(formData.get('initialWeight') as string);
    const targetWeightValue = calculateTargetWeight(initialWeightValue, goalType);

    // Validate CPF
    if (!validateCPF(cpf)) {
      toast({
        variant: "destructive",
        title: "CPF Inválido",
        description: "Por favor, insira um CPF válido.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Parse goal type and subtype
      let goalTypeValue: 'perda_peso' | 'ganho_massa' = 'perda_peso';
      let goalSubtype: 'padrao' | 'moderada' | 'standard' = 'padrao';

      if (goalType === 'ganho_massa') {
        goalTypeValue = 'ganho_massa';
        goalSubtype = 'standard';
      } else if (goalType === 'perda_peso_moderada') {
        goalTypeValue = 'perda_peso';
        goalSubtype = 'moderada';
      } else {
        goalTypeValue = 'perda_peso';
        goalSubtype = 'padrao';
      }

      // Chamar edge function para criar mentorado
      const { data, error: invokeError } = await supabase.functions.invoke('create-mentee', {
        body: {
          email,
          password: temporaryPassword,
          full_name: fullName,
          cpf,
          phone,
          sex,
          age,
          height,
          initial_weight: initialWeightValue,
          target_weight: targetWeightValue,
          goal_type: goalTypeValue,
          goal_subtype: goalSubtype,
        }
      });

      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      if (!data?.user) throw new Error('Failed to create user');

      if (data.user) {

        toast({
          title: "Mentorado criado com sucesso!",
          description: `${fullName} foi adicionado ao sistema. Senha temporária: ${temporaryPassword}`,
          duration: 10000,
        });

        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Error creating mentee:', error);
      toast({
        title: "Erro ao criar mentorado",
        description: error.message || "Não foi possível criar o perfil do mentorado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Parse goal type for ZoneExplainer
  const getGoalTypeForExplainer = (): 'perda_peso' | 'ganho_massa' => {
    return goalType === 'ganho_massa' ? 'ganho_massa' : 'perda_peso';
  };

  const getGoalSubtypeForExplainer = (): 'padrao' | 'moderada' | 'standard' => {
    if (goalType === 'ganho_massa') return 'standard';
    if (goalType === 'perda_peso_moderada') return 'moderada';
    return 'padrao';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bebas">Criar Novo Mentorado</h1>
            <p className="text-muted-foreground">Preencha os dados do novo mentorado</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informações básicas do mentorado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpfValue}
                    onChange={(e) => setCpfValue(formatCPF(e.target.value))}
                    maxLength={14}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="25"
                    min="18"
                    max="120"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm) *</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="170"
                    min="100"
                    max="250"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-full">
                  <Label>Sexo *</Label>
                  <RadioGroup name="sex" defaultValue="male" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">
                        Feminino
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temporaryPassword">Senha Temporária *</Label>
                  <Input
                    id="temporaryPassword"
                    name="temporaryPassword"
                    type="text"
                    placeholder="Senha inicial do mentorado"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    O mentorado usará essa senha no primeiro acesso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objetivo e Metas</CardTitle>
              <CardDescription>Defina o tipo de objetivo e pesos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <GoalTypeSelector value={goalType} onChange={setGoalType} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialWeight">Peso Inicial (kg) *</Label>
                  <Input
                    id="initialWeight"
                    name="initialWeight"
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    min="30"
                    max="300"
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(parseFloat(e.target.value) || 70)}
                    required
                  />
                </div>
              </div>

              {initialWeight > 0 && (
                <ZoneExplainer
                  goalType={getGoalTypeForExplainer()}
                  goalSubtype={getGoalSubtypeForExplainer()}
                  initialWeight={initialWeight}
                  targetWeight={targetWeight}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-bronze shadow-bronze"
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              {isLoading ? "Criando..." : "Criar Mentorado"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMentee;

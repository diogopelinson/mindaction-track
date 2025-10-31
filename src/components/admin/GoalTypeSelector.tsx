import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface GoalTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const GoalTypeSelector = ({ value, onChange }: GoalTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Selecione o tipo de objetivo do mentorado. Cada tipo possui zonas de progresso específicas calculadas sobre o <strong>peso inicial</strong>.
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange}>
        <Card className={`p-4 cursor-pointer transition-all ${value === 'perda_peso_padrao' ? 'border-primary border-2 bg-primary/5' : 'hover:border-primary/50'}`}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="perda_peso_padrao" id="perda_padrao" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="perda_padrao" className="cursor-pointer">
                <div className="font-semibold text-base mb-1">Perda de Peso - Padrão</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Ideal para quem quer perder peso de forma acelerada</p>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      <span className="text-xs">Verde: 0,50% - 0,75%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      <span className="text-xs">Amarela: 0,25% - 0,50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-danger"></div>
                      <span className="text-xs">Vermelha: &lt;0,25% ou &gt;0,75%</span>
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </Card>

        <Card className={`p-4 cursor-pointer transition-all ${value === 'perda_peso_moderada' ? 'border-primary border-2 bg-primary/5' : 'hover:border-primary/50'}`}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="perda_peso_moderada" id="perda_moderada" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="perda_moderada" className="cursor-pointer">
                <div className="font-semibold text-base mb-1">Perda de Peso - Moderada</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Ideal para perda de peso mais controlada e sustentável</p>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      <span className="text-xs">Verde: 0,35% - 0,50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      <span className="text-xs">Amarela: 0,25% - 0,35%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-danger"></div>
                      <span className="text-xs">Vermelha: &lt;0,25% ou &gt;0,50%</span>
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </Card>

        <Card className={`p-4 cursor-pointer transition-all ${value === 'ganho_massa' ? 'border-primary border-2 bg-primary/5' : 'hover:border-primary/50'}`}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="ganho_massa" id="ganho_massa" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="ganho_massa" className="cursor-pointer">
                <div className="font-semibold text-base mb-1">Ganho de Massa Muscular</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Ideal para hipertrofia e ganho de peso magro</p>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      <span className="text-xs">Verde: 0,35% - 0,50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      <span className="text-xs">Amarela: 0,25% - 0,35%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-danger"></div>
                      <span className="text-xs">Vermelha: &lt;0,25% ou &gt;0,50%</span>
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </Card>
      </RadioGroup>
    </div>
  );
};

export default GoalTypeSelector;

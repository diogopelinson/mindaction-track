import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export const BodyFatGuide = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary">
          <HelpCircle className="h-4 w-4 mr-2" />
          Como medir corretamente?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guia de Medições Corporais - Método Navy</DialogTitle>
          <DialogDescription>
            Para resultados precisos, siga estas orientações
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Pescoço */}
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Circunferência do Pescoço</h4>
            <ul className="text-sm space-y-2 text-muted-foreground ml-4">
              <li>• Meça logo abaixo do pomo de Adão (homens)</li>
              <li>• No ponto mais estreito do pescoço</li>
              <li>• Fita na horizontal, sem apertar</li>
              <li>• Relaxe os ombros</li>
              <li>• Valores típicos: 30-45 cm</li>
            </ul>
          </div>
          
          {/* Cintura */}
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Circunferência da Cintura</h4>
            <ul className="text-sm space-y-2 text-muted-foreground ml-4">
              <li>• Na altura do umbigo (homens)</li>
              <li>• No ponto mais estreito (mulheres)</li>
              <li>• Expire normalmente antes de medir</li>
              <li>• Barriga relaxada, sem prender</li>
              <li>• Mantenha a fita paralela ao chão</li>
              <li>• Valores típicos: 60-120 cm</li>
            </ul>
          </div>
          
          {/* Quadril (apenas mulheres) */}
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Circunferência do Quadril (Mulheres)</h4>
            <ul className="text-sm space-y-2 text-muted-foreground ml-4">
              <li>• No ponto mais largo do quadril</li>
              <li>• Geralmente na altura dos glúteos</li>
              <li>• Fita paralela ao chão</li>
              <li>• Pés juntos</li>
              <li>• O quadril deve ser maior que a cintura</li>
              <li>• Valores típicos: 80-130 cm</li>
            </ul>
          </div>

          {/* Dicas importantes */}
          <div className="bg-primary/10 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">⚠️ Dicas Importantes</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Use sempre a mesma fita métrica</li>
              <li>• Peça ajuda de alguém se possível</li>
              <li>• Tire 2-3 medidas e use a média</li>
              <li>• A cintura SEMPRE deve ser maior que o pescoço</li>
              <li>• Para mulheres: o quadril geralmente é maior que a cintura</li>
            </ul>
          </div>

          {/* Validações */}
          <div className="bg-warning/10 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">🔍 O Sistema Irá Validar</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Pescoço: entre 25-60 cm</li>
              <li>• Cintura: entre 50-150 cm</li>
              <li>• Quadril: entre 50-170 cm</li>
              <li>• Cintura maior que pescoço</li>
              <li>• Quadril maior que cintura (mulheres)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Se suas medidas estiverem fora desses valores, o sistema irá alertá-lo para verificar.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
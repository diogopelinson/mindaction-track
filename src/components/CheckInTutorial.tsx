import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, Clock, Ruler, Camera, Sparkles } from "lucide-react";

interface CheckInTutorialProps {
  onComplete: () => void;
}

export const CheckInTutorial = ({ onComplete }: CheckInTutorialProps) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Bem-vindo ao seu primeiro check-in! 🎉",
      description: "Vamos te guiar passo a passo para registrar suas medidas corretamente.",
      icon: <Trophy className="h-12 w-12 text-primary" />,
    },
    {
      title: "Prepare-se 📏",
      description: "Você vai precisar de:\n• Balança\n• Fita métrica\n• Celular para fotos\n• 5 minutos",
      icon: <CheckCircle2 className="h-12 w-12 text-success" />,
    },
    {
      title: "Melhor horário ⏰",
      description: "Para resultados consistentes:\n• Meça sempre no mesmo horário\n• De preferência pela manhã, em jejum\n• Após usar o banheiro\n• Sem roupas pesadas",
      icon: <Clock className="h-12 w-12 text-warning" />,
    },
    {
      title: "Medidas corporais 📐",
      description: "Vamos ensinar como medir corretamente cada parte do corpo para calcular seu percentual de gordura com precisão.",
      icon: <Ruler className="h-12 w-12 text-accent" />,
    },
    {
      title: "Fotos de progresso 📸",
      description: "Tire 3 fotos:\n• Frente: braços relaxados ao lado do corpo\n• Lateral: perfil direito ou esquerdo\n• Costas: mostre suas costas\n\nDica: use o mesmo local e iluminação sempre!",
      icon: <Camera className="h-12 w-12 text-primary" />,
    },
    {
      title: "Pronto para começar! 🚀",
      description: "Você está preparado! Lembre-se: consistência é mais importante que perfeição.",
      icon: <Sparkles className="h-12 w-12 text-success" />,
    },
  ];
  
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bebas text-center">
            {steps[step].title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="bg-primary/10 p-6 rounded-full">
            {steps[step].icon}
          </div>
          
          <p className="text-center text-muted-foreground whitespace-pre-line leading-relaxed">
            {steps[step].description}
          </p>
          
          {/* Progress dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === step 
                    ? 'bg-primary w-8' 
                    : i < step 
                    ? 'bg-success' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          <Button 
            className="flex-1"
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                onComplete();
              }
            }}
          >
            {step < steps.length - 1 ? 'Próximo' : 'Começar Check-in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
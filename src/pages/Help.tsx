import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Video, Camera, TrendingUp, HelpCircle } from "lucide-react";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bebas">Central de Ajuda</h1>
            <p className="text-sm text-muted-foreground">Aprenda a usar o app e tire suas dúvidas</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="h-6 w-6 text-primary" />
                <CardTitle className="font-bebas">Como Usar o App</CardTitle>
              </div>
              <CardDescription>Vídeo tutorial completo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Vídeo tutorial em breve</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-primary" />
                <CardTitle className="font-bebas">Como Tirar as Fotos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">📸 Frente</h3>
                <p className="text-sm text-muted-foreground">
                  De frente para o espelho, braços relaxados ao lado do corpo, pés afastados na largura dos ombros.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📸 Lateral</h3>
                <p className="text-sm text-muted-foreground">
                  De lado, braços relaxados, postura natural. Use um espelho ou peça ajuda.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📸 Costas</h3>
                <p className="text-sm text-muted-foreground">
                  De costas para o espelho, braços relaxados, postura ereta.
                </p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                <p className="text-sm">
                  💡 <strong>Dica:</strong> Tire sempre as fotos no mesmo local, com a mesma iluminação e roupa similar 
                  para melhor comparação.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <CardTitle className="font-bebas">Como Fazer as Medições</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">📏 Circunferência do Pescoço</h3>
                <p className="text-sm text-muted-foreground">
                  Meça na altura da laringe (pomo de adão), mantendo a fita métrica na horizontal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📏 Circunferência da Cintura</h3>
                <p className="text-sm text-muted-foreground">
                  Meça na altura do umbigo, mantendo a fita métrica na horizontal, sem comprimir.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📏 Circunferência do Quadril (mulheres)</h3>
                <p className="text-sm text-muted-foreground">
                  Meça na parte mais larga dos quadris, mantendo a fita métrica na horizontal.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                <CardTitle className="font-bebas">Perguntas Frequentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como funciona o mapa de zonas?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      O mapa de zonas mostra seu progresso semanal em relação à meta esperada:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>🟢 <strong>Verde:</strong> Você está no ritmo ideal!</li>
                      <li>🟡 <strong>Amarelo:</strong> Atenção, ajuste pode ser necessário</li>
                      <li>🔴 <strong>Vermelho:</strong> Fora da meta, revise seu plano</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Quando fazer o check-in?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      O check-in está disponível apenas às segundas-feiras. Isso garante consistência nas medições
                      e permite que você acompanhe sua evolução semanal de forma precisa.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Como é calculado o percentual de gordura?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Usamos o Método Navy (US Navy Body Fat Calculator), que é preciso e validado cientificamente.
                      Ele utiliza suas medidas corporais (pescoço, cintura, quadril para mulheres) e altura para
                      estimar o percentual de gordura corporal.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Posso editar um check-in antigo?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Não é possível editar check-ins anteriores para manter a integridade dos dados históricos.
                      Se cometeu um erro, entre em contato com seu mentor.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-bebas text-lg mb-2">💪 Dica Motivacional</h3>
              <p className="text-sm text-muted-foreground">
                Lembre-se: a jornada de transformação é feita de pequenos passos consistentes. Cada check-in é uma
                vitória, cada dado registrado é um passo em direção ao seu objetivo. Continue firme!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bronze opacity-10" />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <img src={logo} alt="MindAction Club" className="w-48 h-48 mb-8" />
            
            <h1 className="text-6xl md:text-7xl font-bebas tracking-wider text-foreground mb-4">
              MindAction Club
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 font-raleway">
              Transforme seu corpo com acompanhamento personalizado e mentoria profissional
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                size="lg" 
                className="gradient-bronze shadow-bronze text-lg px-8"
                onClick={() => navigate('/auth')}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 border-2"
                onClick={() => navigate('/auth')}
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
          <Card className="p-8 shadow-card hover:shadow-bronze transition-all duration-300">
            <div className="w-14 h-14 rounded-full gradient-bronze flex items-center justify-center mb-6">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bebas tracking-wide mb-3">Acompanhamento Semanal</h3>
            <p className="text-muted-foreground">
              Registre seu progresso com fotos, peso e medidas corporais toda semana
            </p>
          </Card>

          <Card className="p-8 shadow-card hover:shadow-bronze transition-all duration-300">
            <div className="w-14 h-14 rounded-full gradient-bronze flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bebas tracking-wide mb-3">Trilha Personalizada</h3>
            <p className="text-muted-foreground">
              Visualize suas metas com zonas de progresso e alcance seus objetivos
            </p>
          </Card>

          <Card className="p-8 shadow-card hover:shadow-bronze transition-all duration-300">
            <div className="w-14 h-14 rounded-full gradient-bronze flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bebas tracking-wide mb-3">Mentoria Profissional</h3>
            <p className="text-muted-foreground">
              Tenha o acompanhamento direto de profissionais experientes
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-5xl font-bebas tracking-wider text-primary-foreground mb-6">
            Pronto para Transformar Seu Corpo?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Junte-se ao MindAction Club e comece sua jornada de transformação hoje mesmo
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-10"
            onClick={() => navigate('/auth')}
          >
            Entrar no Clube
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

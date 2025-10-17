import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Target, Users, CheckCircle2, Dumbbell, Calendar, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-bronze opacity-20 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Logo with float animation */}
            <img 
              src={logo} 
              alt="MindAction Club" 
              className="w-56 h-56 mb-8 animate-float" 
            />
            
            {/* Title with gradient text */}
            <h1 className="text-7xl md:text-8xl font-bebas tracking-wider mb-4 animate-fade-in-up">
              <span className="gradient-text">MindAction</span> Club
            </h1>
            
            {/* Subtitle with staggered animation */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-4 font-inter animate-fade-in-up animate-delay-100">
              Transforme seu corpo com acompanhamento personalizado
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 font-inter animate-fade-in-up animate-delay-200">
              Mentoria profissional • Resultados reais • Suporte contínuo
            </p>
            
            {/* CTA Buttons with hover effects */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 animate-scale-in animate-delay-300">
              <Button 
                size="lg" 
                className="gradient-bronze shadow-bronze text-lg px-10 py-6 hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-6 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bebas tracking-wider mb-4">
            Por que escolher o MindAction?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A plataforma completa para sua transformação física
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 shadow-card hover-lift border-2 border-transparent hover:border-primary/30 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full gradient-bronze flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-3xl font-bebas tracking-wide mb-4">Acompanhamento Semanal</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Registre seu progresso com fotos, peso e medidas corporais toda semana. 
              Visualize sua evolução de forma clara e motivadora.
            </p>
          </Card>

          <Card className="p-8 shadow-card hover-lift border-2 border-transparent hover:border-primary/30 animate-fade-in-up animate-delay-100">
            <div className="w-16 h-16 rounded-full gradient-bronze flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
              <Target className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-3xl font-bebas tracking-wide mb-4">Trilha Personalizada</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Visualize suas metas com zonas de progresso personalizadas. 
              Alcance seus objetivos de forma estruturada e eficiente.
            </p>
          </Card>

          <Card className="p-8 shadow-card hover-lift border-2 border-transparent hover:border-primary/30 animate-fade-in-up animate-delay-200">
            <div className="w-16 h-16 rounded-full gradient-bronze flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-3xl font-bebas tracking-wide mb-4">Mentoria Profissional</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Tenha o acompanhamento direto de profissionais experientes. 
              Suporte personalizado para suas necessidades específicas.
            </p>
          </Card>
        </div>
      </section>

      {/* How it works Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bebas tracking-wider mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-muted-foreground">
              Transformação simplificada em 3 passos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-primary">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <div className="text-6xl font-bebas text-primary mb-4">01</div>
              <h3 className="text-2xl font-bebas mb-3">Cadastro Rápido</h3>
              <p className="text-muted-foreground">
                Crie sua conta em minutos e defina seus objetivos personalizados
              </p>
            </div>

            <div className="text-center animate-fade-in-up animate-delay-100">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-primary">
                <Dumbbell className="h-10 w-10 text-primary" />
              </div>
              <div className="text-6xl font-bebas text-primary mb-4">02</div>
              <h3 className="text-2xl font-bebas mb-3">Check-ins Semanais</h3>
              <p className="text-muted-foreground">
                Registre seu progresso toda semana com fotos e medidas
              </p>
            </div>

            <div className="text-center animate-fade-in-up animate-delay-200">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-primary">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <div className="text-6xl font-bebas text-primary mb-4">03</div>
              <h3 className="text-2xl font-bebas mb-3">Conquiste Resultados</h3>
              <p className="text-muted-foreground">
                Acompanhe sua evolução e alcance suas metas com suporte profissional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bebas tracking-wider mb-4">
              Seus Benefícios
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Acompanhamento profissional constante",
              "Análise detalhada da composição corporal",
              "Histórico completo de evolução",
              "Suporte para alcançar suas metas",
              "Plataforma intuitiva e fácil de usar",
              "Comunidade motivadora e engajada"
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-6xl md:text-7xl font-bebas tracking-wider text-primary-foreground mb-6 animate-scale-in">
            Pronto para Transformar Seu Corpo?
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-100">
            Junte-se ao MindAction Club e comece sua jornada de transformação hoje mesmo. 
            Milhares de pessoas já estão alcançando seus objetivos.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-xl px-12 py-7 hover:scale-105 transition-all duration-300 shadow-2xl animate-fade-in-up animate-delay-200"
            onClick={() => navigate('/auth')}
          >
            Entrar no Clube
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

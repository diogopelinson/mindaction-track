import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import BottomNav from "@/components/BottomNav";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AICoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu coach fitness inteligente. Posso responder dúvidas sobre seu treino, dieta, medições e progresso. Como posso ajudar você hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profileData || profileError) {
        await supabase.auth.signOut();
        toast({
          title: "Sessão inválida",
          description: "Sua conta não foi encontrada. Por favor, cadastre-se novamente.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/auth');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-chat', {
        body: { 
          messages: [...messages, userMessage],
          profile 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-3 rounded-full">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="font-bebas text-3xl">Coach IA</CardTitle>
                <p className="text-muted-foreground">Seu assistente fitness inteligente</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="bg-primary/10 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-accent/10 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-primary/10 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            "Como calcular minha % de gordura?",
            "Dicas para perder peso",
            "Quando fazer check-in?",
            "Como interpretar as zonas?"
          ].map((suggestion, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => setInput(suggestion)}
              disabled={isLoading}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AICoach;

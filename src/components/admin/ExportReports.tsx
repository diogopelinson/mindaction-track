import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText } from "lucide-react";
import { MenteeData, MenteeStatus, calculateProgressPercentage } from "@/lib/adminUtils";
import { getZoneLabel } from "@/lib/progressUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportReportsProps {
  mentees: Array<{ mentee: MenteeData; status: MenteeStatus }>;
}

export const ExportReports = ({ mentees }: ExportReportsProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    const headers = [
      'Nome',
      'Email',
      'Objetivo',
      'Peso Inicial',
      'Peso Atual',
      'Meta',
      'Progresso %',
      'Última Atualização',
      'Zona Atual',
      'Status',
      'Check-ins'
    ];
    
    const rows = mentees.map(({ mentee, status }) => {
      const currentWeight = mentee.updates && mentee.updates.length > 0
        ? [...mentee.updates].sort((a, b) => b.week_number - a.week_number)[0].weight
        : mentee.initial_weight;
      
      const progress = calculateProgressPercentage(
        currentWeight,
        mentee.initial_weight,
        mentee.target_weight,
        mentee.goal_type
      );
      
      return [
        mentee.full_name,
        mentee.email,
        mentee.goal_type === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa',
        mentee.initial_weight,
        currentWeight,
        mentee.target_weight,
        progress.toFixed(1),
        status.lastUpdateDaysAgo + ' dias atrás',
        getZoneLabel(status.currentZone),
        status.needsAttention ? 'Atenção' : 'OK',
        mentee.updates?.length || 0
      ];
    });
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-mentorados-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado!",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
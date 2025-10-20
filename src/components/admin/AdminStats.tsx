import { Users, TrendingUp, TrendingDown, AlertTriangle, Activity, Target } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { GlobalStats } from "@/lib/adminUtils";

interface AdminStatsProps {
  stats: GlobalStats;
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard
        title="Total de Mentorados"
        value={stats.totalMentees}
        icon={Users}
        description={`${stats.activeMentees} ativos, ${stats.inactiveMentees} inativos`}
      />

      <StatsCard
        title="Zona Verde"
        value={stats.greenZone}
        icon={TrendingUp}
        description="Progresso excelente"
      />

      <StatsCard
        title="Zona Amarela"
        value={stats.yellowZone}
        icon={Activity}
        description="Atenção necessária"
      />

      <StatsCard
        title="Zona Vermelha"
        value={stats.redZone}
        icon={TrendingDown}
        description="Fora da meta"
      />

      <StatsCard
        title="Precisa de Atenção"
        value={stats.needsAttention}
        icon={AlertTriangle}
        description="Requer intervenção"
      />

      <StatsCard
        title="Progresso Médio"
        value={`${stats.averageProgress.toFixed(1)}%`}
        icon={Target}
        description={`${stats.perdaPesoCount} perda, ${stats.ganhoMassaCount} ganho`}
      />
    </div>
  );
};

export default AdminStats;

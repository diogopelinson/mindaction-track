import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MenteeData, MenteeStatus, calculateProgressPercentage } from "@/lib/adminUtils";
import { getZoneColor, getZoneLabel } from "@/lib/progressUtils";
import { Search, ArrowUpDown, Eye } from "lucide-react";
import { ExportReports } from "./ExportReports";

interface MenteeTableProps {
  mentees: Array<{ mentee: MenteeData; status: MenteeStatus }>;
  onSelectMentee: (menteeId: string) => void;
}

type SortField = 'name' | 'progress' | 'lastUpdate';
type SortOrder = 'asc' | 'desc';
type FilterZone = 'all' | 'green' | 'yellow' | 'red';
type FilterGoal = 'all' | 'perda_peso' | 'ganho_massa';
type FilterStatus = 'all' | 'active' | 'needs_attention' | 'inactive';

const MenteeTable = ({ mentees, onSelectMentee }: MenteeTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterZone, setFilterZone] = useState<FilterZone>('all');
  const [filterGoal, setFilterGoal] = useState<FilterGoal>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedMentees = useMemo(() => {
    let result = [...mentees];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        ({ mentee }) =>
          mentee.full_name.toLowerCase().includes(term) ||
          mentee.email.toLowerCase().includes(term)
      );
    }

    // Zone filter
    if (filterZone !== 'all') {
      result = result.filter(({ status }) => status.currentZone === filterZone);
    }

    // Goal filter
    if (filterGoal !== 'all') {
      result = result.filter(({ mentee }) => mentee.goal_type === filterGoal);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(({ status }) => {
        if (filterStatus === 'active') return status.lastUpdateDaysAgo <= 14;
        if (filterStatus === 'inactive') return status.lastUpdateDaysAgo > 14;
        if (filterStatus === 'needs_attention') return status.needsAttention;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let compareValue = 0;

      if (sortField === 'name') {
        compareValue = a.mentee.full_name.localeCompare(b.mentee.full_name);
      } else if (sortField === 'progress') {
        const progressA = calculateProgressPercentage(
          a.mentee.updates?.[a.mentee.updates.length - 1]?.weight || a.mentee.initial_weight,
          a.mentee.initial_weight,
          a.mentee.target_weight,
          a.mentee.goal_type
        );
        const progressB = calculateProgressPercentage(
          b.mentee.updates?.[b.mentee.updates.length - 1]?.weight || b.mentee.initial_weight,
          b.mentee.initial_weight,
          b.mentee.target_weight,
          b.mentee.goal_type
        );
        compareValue = progressA - progressB;
      } else if (sortField === 'lastUpdate') {
        compareValue = a.status.lastUpdateDaysAgo - b.status.lastUpdateDaysAgo;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [mentees, searchTerm, sortField, sortOrder, filterZone, filterGoal, filterStatus]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Todos os Mentorados</CardTitle>
            <CardDescription>
              {filteredAndSortedMentees.length} de {mentees.length} mentorados
            </CardDescription>
          </div>
          <ExportReports mentees={mentees} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterZone} onValueChange={(value) => setFilterZone(value as FilterZone)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as zonas</SelectItem>
              <SelectItem value="green">Verde</SelectItem>
              <SelectItem value="yellow">Amarela</SelectItem>
              <SelectItem value="red">Vermelha</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterGoal} onValueChange={(value) => setFilterGoal(value as FilterGoal)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="perda_peso">Perda de Peso</SelectItem>
              <SelectItem value="ganho_massa">Ganho de Massa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="needs_attention">Precisa Atenção</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('name')} className="h-8 p-0">
                    Nome
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('progress')} className="h-8 p-0">
                    Progresso
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('lastUpdate')} className="h-8 p-0">
                    Última Atualização
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Zona</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedMentees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum mentorado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedMentees.map(({ mentee, status }) => {
                  const currentWeight = mentee.updates && mentee.updates.length > 0
                    ? [...mentee.updates].sort((a, b) => b.week_number - a.week_number)[0].weight
                    : mentee.initial_weight;

                  const progressPercentage = calculateProgressPercentage(
                    currentWeight,
                    mentee.initial_weight,
                    mentee.target_weight,
                    mentee.goal_type
                  );

                  return (
                    <TableRow key={mentee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{mentee.full_name}</p>
                          <p className="text-xs text-muted-foreground">{mentee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {mentee.goal_type === 'perda_peso' ? 'Perda' : 'Ganho'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{currentWeight.toFixed(1)}</span>
                          <span className="text-muted-foreground"> / {mentee.target_weight} kg</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.min(100, progressPercentage)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{progressPercentage.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {status.lastUpdateDaysAgo === 0 ? 'Hoje' : `há ${status.lastUpdateDaysAgo}d`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getZoneColor(status.currentZone)} variant="outline">
                          {getZoneLabel(status.currentZone)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectMentee(mentee.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenteeTable;

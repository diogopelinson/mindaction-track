import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Tag } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MenteeTag {
  id: string;
  tag_name: string;
  tag_color: string;
}

interface TagsManagerProps {
  menteeId: string;
  onTagsChange?: () => void;
}

const PRESET_TAGS = [
  { name: "Atenção Extra", color: "#ef4444" },
  { name: "Progresso Excelente", color: "#22c55e" },
  { name: "Retornar Contato", color: "#f59e0b" },
  { name: "Férias", color: "#3b82f6" },
  { name: "Lesão", color: "#a855f7" },
];

export const TagsManager = ({ menteeId, onTagsChange }: TagsManagerProps) => {
  const [tags, setTags] = useState<MenteeTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, [menteeId]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('mentee_tags')
        .select('*')
        .eq('mentee_id', menteeId);

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const addTag = async (tagName: string, tagColor: string) => {
    if (!tagName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mentee_tags')
        .insert({
          mentee_id: menteeId,
          tag_name: tagName.trim(),
          tag_color: tagColor,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Tag já existe",
            description: "Esta tag já foi adicionada a este mentorado.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Tag adicionada",
        description: "A tag foi adicionada com sucesso.",
      });

      setNewTagName("");
      fetchTags();
      onTagsChange?.();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar tag",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('mentee_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast({
        title: "Tag removida",
        description: "A tag foi removida com sucesso.",
      });

      fetchTags();
      onTagsChange?.();
    } catch (error: any) {
      toast({
        title: "Erro ao remover tag",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.tag_color }}
            className="text-white"
          >
            {tag.tag_name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-2 hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6">
              <Plus className="h-3 w-3 mr-1" />
              Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tags Predefinidas</h4>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((preset) => (
                    <Button
                      key={preset.name}
                      size="sm"
                      variant="outline"
                      onClick={() => addTag(preset.name, preset.color)}
                      disabled={loading || tags.some(t => t.tag_name === preset.name)}
                      className="h-7 text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tag Personalizada</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag(newTagName, '#6366f1');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addTag(newTagName, '#6366f1')}
                    disabled={!newTagName.trim() || loading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

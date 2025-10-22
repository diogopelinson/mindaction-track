import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
  | 'profile.view'
  | 'profile.update'
  | 'checkin.create'
  | 'checkin.update'
  | 'checkin.delete'
  | 'photo.upload'
  | 'photo.view'
  | 'admin.view_mentee'
  | 'admin.update_request'
  | 'goal.update';

export interface AuditLogEntry {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Registra uma ação de auditoria no banco de dados
 * Útil para rastrear operações sensíveis em dados de saúde
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Cannot log audit: user not authenticated');
      return;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        details: entry.details,
        ip_address: entry.ipAddress,
      });

    if (error) {
      console.error('Failed to log audit entry:', error);
    }
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}

/**
 * Hook para facilitar logging de auditoria em componentes
 */
export function useAuditLogger() {
  return { logAudit };
}

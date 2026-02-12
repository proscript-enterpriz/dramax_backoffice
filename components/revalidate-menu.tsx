'use client';

import { useState } from 'react';
import { ListRestart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { revalidateClientFull, revalidateLocal } from '@/services/api/actions';

export default function RevalidateMenu() {
  const [loading, setLoading] = useState(false);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Revalidation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Refresh filmora.mn and dashboard data"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                Promise.allSettled([revalidateLocal(), revalidateClientFull()])
                  .then(() => toast.success('Дахин шинэчлэлт амжилттай боллоо'))
                  .finally(() => setLoading(false));
              }}
            >
              {loading ? <Loader2 className="animate-spin" /> : <ListRestart />}
              Revalidate
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

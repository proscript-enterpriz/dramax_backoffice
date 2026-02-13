'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { getSettings, updateSettings } from '@/services/settings';

/**
 * @deprecated AppStore,Playstore deer app bairshnii daraa ustgana
 * **/
export default function PaymentSwitch() {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    getSettings().then((c) => setEnabled(!!c?.data?.payments_enabled));
  }, []);

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    startTransition(async () => {
      try {
        await updateSettings({
          payments_enabled: checked,
        });
      } catch (error) {
        console.error('Failed to update payment settings:', error);
        setEnabled(!checked);
      }
    });
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Hide payment method related features until we implement them">
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <TriangleAlert />
              )}
              <span className="flex-1">Activate payment</span>
              <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={isPending}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

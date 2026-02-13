'use client';

import { TriangleAlert } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';

/**
 * @deprecated AppStore,Playstore deer app bairshnii daraa ustgana
 * **/
export default function PaymentSwitch() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Hide payment method related features until we implement them">
              <TriangleAlert />
              <span className="flex-1">Activate payment</span>
              <Switch />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

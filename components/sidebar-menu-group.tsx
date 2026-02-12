import { Fragment } from 'react';
import { ChevronDown } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import { SubMenuItemType } from './constants/menu';
import { Link } from './custom/link';

export function SidebarMenuGroup({
  items,
  label,
}: {
  label?: string;
  items: SubMenuItemType[];
}) {
  if (!items.length) return null;

  return (
    <SidebarGroup>
      {!!label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        {items.map((item, idx) => {
          if (item.subRoutes && item.children) {
            return (
              <SidebarMenu key={idx}>
                <Collapsible defaultOpen={false} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>

                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {!!item.children?.length && (
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  href={child.url}
                                  withChildRoutes={
                                    child.url !== '/' &&
                                    (child.url.split('/').length > 1 ||
                                      child.subRoutes)
                                  }
                                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                                >
                                  {child.icon && <child.icon />}
                                  {child.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            );
          }
          return (
            <Fragment key={idx}>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <Link
                      href={item.url}
                      withChildRoutes={
                        item.url !== '/' &&
                        (item.url.split('/').length > 1 || item.subRoutes)
                      }
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      {item.icon && <item.icon />}
                      <span className="w-full">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {!!item.children?.length && (
                  <SidebarMenuSub>
                    {item.children.map((child) => (
                      <SidebarMenuSubItem key={child.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href={child.url}
                            withChildRoutes={
                              child.url !== '/' &&
                              (child.url.split('/').length > 1 ||
                                child.subRoutes)
                            }
                            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                          >
                            {child.icon && <child.icon />}
                            {child.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenu>
            </Fragment>
          );
        })}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

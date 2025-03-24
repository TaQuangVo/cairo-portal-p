"use client"

import { type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavSection({
  items,
  title,
  actionButton
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[],
  title?: string
  actionButton?: {
    mainButton: {
        title: string
        icon?: LucideIcon
        onClick: () => void
    }
    secondaryButton?: {
        title: string
        icon?: LucideIcon
        onClick: () => void
    }
  }
}) {
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarGroupContent className="flex flex-col gap-2">
        {
            actionButton && (
                <SidebarMenu>
                <SidebarMenuItem className="flex items-center gap-2">
                  <SidebarMenuButton
                    tooltip="Quick Create"
                    className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                    onClick={actionButton.mainButton.onClick}
                  >
                    {actionButton.mainButton.icon && <actionButton.mainButton.icon/>}
                    <span>{actionButton.mainButton.title}</span>
                  </SidebarMenuButton>
                  {
                    actionButton.secondaryButton && (
                        <Button
                        size="icon"
                        className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
                        variant="outline"
                        onClick={actionButton.secondaryButton.onClick}
                      >
                        {actionButton.secondaryButton.icon && <actionButton.secondaryButton.icon/>}
                        <span className="sr-only">{actionButton.secondaryButton.title}</span>
                      </Button>
                    )
                  }
                </SidebarMenuItem>
              </SidebarMenu>
            )
        }
        <SidebarMenu>
          {items.map((item) => (
            <Link href={item.url} key={item.title}>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

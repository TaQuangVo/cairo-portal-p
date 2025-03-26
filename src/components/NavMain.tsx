"use client"

import { useState } from "react"
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
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
    mainButtonOptions: {
      title: string
      icon?: LucideIcon
      onClick: () => void
      value: string
    }[]
    secondaryButton?: {
      title: string
      icon?: LucideIcon
      onClick: () => void,
      onChange: (val:string) => void}
    }
  }
) {
  const [selectedMainButton, setSelectedMainButton] = useState(
    actionButton?.mainButtonOptions[0] || null
  )

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarGroupContent className="flex flex-col gap-2">
        {actionButton && selectedMainButton && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              {/* Main Button */}
              <SidebarMenuButton
                tooltip={selectedMainButton.title}
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                onClick={selectedMainButton.onClick}
              >
                {selectedMainButton.icon && <selectedMainButton.icon />}
                <span>{selectedMainButton.title}</span>
              </SidebarMenuButton>

              {/* Secondary Button with Dropdown */}
              {actionButton.secondaryButton && (
                <Select
                  defaultValue={selectedMainButton.value}
                  onValueChange={(val) => {
                    const newMainButton = actionButton.mainButtonOptions.find((btn) => btn.value === val)
                    if (newMainButton) setSelectedMainButton(newMainButton)
                  }}
                >
                  <SelectTrigger showDropdownIcons={false} className="">
                    {actionButton.secondaryButton.icon && <actionButton.secondaryButton.icon />}
                  </SelectTrigger>
                  <SelectContent align="end">
                    {actionButton.mainButtonOptions.map((btn) => (
                      <SelectItem key={btn.value} value={btn.value}>
                        {btn.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        )}

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

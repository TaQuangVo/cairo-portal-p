"use client"

import * as React from "react"
import {
  BarChartIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon,
  Bug,
  MailIcon,
  PlusCircleIcon,
  Boxes,
  EllipsisVertical,
  RectangleEllipsis,
  Ellipsis, 
  FilePenLine
} from "lucide-react"

import { NavSection } from "@/components/NavMain"
import { NavSecondary } from "@/components/NaveSecondary"
import { NavUser } from "@/components/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter } from 'next/navigation'


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    mainActionButton:{
      mainButtonOptions: [{
          title: 'New Portfolio',
          icon: PlusCircleIcon,
          onClick: () => {router.push('/dashboard/portfolios')},
          value: 'Quick Create'
      },{
        title: 'Update Portfolio',
        icon: FilePenLine,
        onClick: () => {console.log('hello main action')},
        value: 'Update Portfolio'
    }],
      secondaryButton: {
          title: '',
          icon: Ellipsis,
          onClick: () => {console.log('hello secondary button')},
          onChange: (val:string) => {console.log('hello secondary button')}
      }
    },
    navMain: [
      {
        title: "My Submittions",
        url: "/dashboard/submittions",
        icon: ListIcon,
      },
    ],
    admin: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: UsersIcon,
      },
    ],
    navSecondary: [
      {
        title: "Get Help",
        url: "#",
        icon: HelpCircleIcon,
      },
      {
        title: "Report",
        url: "#",
        icon: Bug,
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Boxes className="h-5 w-5"/>
                <span className="text-base font-semibold">Integration.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection items={data.navMain} actionButton={data.mainActionButton}/>
        <NavSection items={data.admin}  title="Admin"/>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

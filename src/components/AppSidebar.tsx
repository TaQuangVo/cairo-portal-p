"use client"

import * as React from "react"
import {
  HelpCircleIcon,
  ListIcon,
  UsersIcon,
  Bug,
  PlusCircleIcon,
  Boxes,
  Ellipsis, 
  FilePenLine,
  House
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
import { useSession } from "next-auth/react"
import { Session } from "next-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { data: session } = useSession()

  const [ sessionData, setSessionData ] = React.useState<Session | null>(null)
  React.useEffect(() => {
    setSessionData(session) // prevent hidration error
  }, [sessionData])


  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    mainActionButton:{
      mainButtonOptions: [{
          title: 'New Portfolio.',
          icon: PlusCircleIcon,
          onClick: () => {router.push('/dashboard/portfolios')},
          value: 'Quick Create'
      },{
        title: 'Update Portfolio.',
        icon: FilePenLine,
        onClick: () => {router.push('/dashboard/not-implemented?titleParam=Update Portfolio')},
        value: 'Update Portfolio'
    }],
      secondaryButton: {
          icon: Ellipsis,
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
        url: "/dashboard/not-implemented?titleParam=Get Help",
        icon: HelpCircleIcon,
      },
      {
        title: "Report",
        url: "/dashboard/not-implemented?titleParam=Report",
        icon: Bug,
      },
      {
        title: "Landing page",
        url: "/",
        icon: House,
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
        {
          sessionData?.user.role && sessionData?.user.role === 'admin' && <NavSection items={data.admin}  title="Admin"/>
        }
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

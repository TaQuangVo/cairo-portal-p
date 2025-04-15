'use client'
import { useAutoRefreshSession } from "@/hooks/useAutoRefreshSession"
import { ReactNode, useEffect, useState } from "react"
import Countdown from 'react-countdown';
import { Monoton } from "next/font/google";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { signOut } from "next-auth/react";

const monoton = Monoton({
    variable: "--font-geist-sans",
    weight: "400",
    subsets: ["latin"],
});

export const SessionRefresher = ({children}:{ children: ReactNode}) => { 
    const {signOutWarning, resetActivity} = useAutoRefreshSession()

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
      setHasMounted(true); // ensures this runs only on client
    }, []);

    const renderer = ({ hours, minutes, seconds, completed }:any) => {
          return <span className={`${monoton.className} antialiased font-mono text-4xl text-center py-12`}>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>;
    };

    const onDialogClose = (open:boolean) => {
        if(!open) {
            resetActivity();
        }
    }

    return (
        <>
            {children}
            <Dialog open={signOutWarning !== null} onOpenChange={onDialogClose}>
                <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Are you still there</DialogTitle>
                        <DialogDescription>
                            You will be logged out soon.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {hasMounted && signOutWarning !== null && <Countdown date={signOutWarning} renderer={renderer}/>}
                    </div>
                    <DialogFooter>
                    <Button variant='outline' type="button" onClick={() => signOut({ callbackUrl: "/login" })}>Loggout</Button>
                    <Button type="button" onClick={() => onDialogClose(false)}>Keep working</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )

}
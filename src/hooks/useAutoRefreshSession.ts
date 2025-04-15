import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const REFRESH_MARGIN = 1 * 60 * 1000; // 1 minute before expiry
const ACTIVITY_TIMEOUT = 50 * 60 * 1000; // 50 minute of inactivity
const ACTIVITY_WARNING = 5 * 60 * 1000; // 3 minutes of inactivity

export function useAutoRefreshSession() {
  const { data: session, update } = useSession();
  const lastActivity = useRef<number | null>(null);
  const [signOutWarning, setSignOutWarning] = useState<number|null>(null);
  

  const resetActivity = () => {
    lastActivity.current = Date.now();
    setSignOutWarning(null);
  }

  // ✅ Activity detection
  useEffect(() => {
    const activityEvents = ["mousemove"];

    const markActivity = () => {
      lastActivity.current = Date.now();
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, markActivity)
    );

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, markActivity)
      );
    };
  }, []);


  // ✅ Refresh token
  useEffect(() => {
    if (!session || ! session.user.accessTokenExpiry) return;

    const milisBeforeExpiry = session.user.accessTokenExpiry - Date.now()

    const refreshTime = milisBeforeExpiry - REFRESH_MARGIN - ACTIVITY_TIMEOUT
    if(refreshTime < 0) {
        fetch("/api/auth/refresh").then(res => {
            if (res.ok)
                update();
            else 
                signOut({ callbackUrl: "/login" });
            });
        return
    }

    // Show warning before sign out
    const warningTimeout = setTimeout(() => {
      if(lastActivity.current && Date.now() - lastActivity.current < ACTIVITY_TIMEOUT) {
        const signOutAt = session.user.accessTokenExpiry - REFRESH_MARGIN
        setSignOutWarning(signOutAt);
      }
    }, milisBeforeExpiry - REFRESH_MARGIN - ACTIVITY_WARNING); 

    // Sign out if no activity
    const timeout = setTimeout(() => {
        setSignOutWarning(null)
        if (!lastActivity.current || Date.now() - lastActivity.current > ACTIVITY_TIMEOUT) {
            signOut({ callbackUrl: "/login" });
            return;
        }

        fetch("/api/auth/refresh").then(res => {
          if (res.ok){
              update();
          } 
          else {
              signOut({ callbackUrl: "/login" });
          }});
    }, milisBeforeExpiry - REFRESH_MARGIN);

    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
    }
  }, [session]);

  return {signOutWarning, resetActivity}
}

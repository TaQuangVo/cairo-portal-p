import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobileWebClient() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const isUserAgentMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    console.log('client agent: ' + navigator.userAgent)

    const checkIsMobile = () => {
      const isNarrowScreen = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(isNarrowScreen || isUserAgentMobile)
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkIsMobile)

    checkIsMobile()

    return () => mql.removeEventListener("change", checkIsMobile)
  }, [])

  return !!isMobile
}

import * as React from "react";
import { AppSidebar } from "@/shared/components/navigation/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Container,
} from "@/shared/ui"
import { Link, useMatches } from 'react-router-dom'
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Loader from "@/shared/ui/loader";
import NavigationLoader from '@/shared/ui/navigation-loader'
import { useTranslation } from 'react-i18next'

export default function DashboardLayout() {
  const { t } = useTranslation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 px-2 md:px-6 transition-all duration-300 ease-in-out shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 hover:bg-accent/50 transition-colors duration-200 rounded-md p-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList className="gap-1">
                {
                  // Build breadcrumb items from route matches. Each route can define `handle.crumb` as a string or function.
                  useMatches()
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((m): m is (typeof m & { handle: unknown }) => !!(m.handle as any) && !!((m.handle as any).crumb))
                    .map((m, idx, arr) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const handle = m.handle as unknown as { crumb: string | ((match: any) => React.ReactNode) | React.ReactElement }
                      let crumb = typeof handle.crumb === 'function' ? handle.crumb(m) : handle.crumb
                      const isLast = idx === arr.length - 1

                      // If crumb is a React element (like BreadcrumbLabel), render it as is
                      // If crumb is a string, translate it
                      if (typeof crumb === 'string') {
                        const translation = t(`navigation.${crumb}`)
                        crumb = translation === `navigation.${crumb}` ? crumb : translation
                      }

                      // If last, render page text. Otherwise render link.
                      return (
                        <React.Fragment key={m.id}>
                          <BreadcrumbItem>
                            {!isLast ? (
                              <BreadcrumbLink asChild>
                                <Link
                                  to={m.pathname ?? '#'}
                                  className="hover:text-primary transition-colors duration-200 hover:scale-105 transform"
                                >
                                  {crumb}
                                </Link>
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage className="font-semibold text-foreground/90">
                                {crumb}
                              </BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator className="text-muted-foreground/60" />}
                        </React.Fragment>
                      )
                    })
                }
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 pt-4 md:pt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <Container className="max-w-full">
            <NavigationLoader />
            <Suspense fallback={<Loader />}>
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <Outlet />
              </div>
            </Suspense>
          </Container>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

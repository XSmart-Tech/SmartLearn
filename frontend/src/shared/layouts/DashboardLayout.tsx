import * as React from "react";
import { AppSidebar } from "@/shared/components";
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
      <SidebarInset className="h-screen overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-card/40 px-2 md:px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
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
                                <Link to={m.pathname ?? '#'}>{crumb}</Link>
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                      )
                    })
                }
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-2 md:gap-4 p-3 md:p-6 pt-2 md:pt-4 overflow-y-auto">
          <Container>
            <NavigationLoader />
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </Container>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

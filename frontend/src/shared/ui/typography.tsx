import * as React from "react"

import { cn } from "@/shared/lib/utils"

export function H1({ className, children, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
        className
      )}
      {...props}
    >
      {children ?? "Taxing Laughter: The Joke Tax Chronicles"}
    </h1>
  )
}

export function H2({ className, children, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    >
      {children ?? "The People of the Kingdom"}
    </h2>
  )
}

export function H3({ className, children, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)} {...props}>
      {children ?? "The Joke Tax"}
    </h3>
  )
}

export function H4({ className, children, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props}>
      {children ?? "People stopped telling jokes"}
    </h4>
  )
}

export function P({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}>
      {children ?? (
        <>The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax.</>
      )}
    </p>
  )
}

export function Blockquote({ className, children, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props}>
      {children ?? (
        <>
          &quot;After all,&quot; he said, &quot;everyone enjoys a good joke, so
          it&apos;s only fair that they should pay for the privilege.&quot;
        </>
      )}
    </blockquote>
  )
}

export function List({ className, children, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>
      {children ?? (
        <>
          <li>1st level of puns: 5 gold coins</li>
          <li>2nd level of jokes: 10 gold coins</li>
          <li>3rd level of one-liners : 20 gold coins</li>
        </>
      )}
    </ul>
  )
}

export function InlineCode({ className, children, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children ?? "@radix-ui/react-alert-dialog"}
    </code>
  )
}

export function Lead({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xl", className)} {...props}>
      {children ?? (
        <>A modal dialog that interrupts the user with important content and expects a response.</>
      )}
    </p>
  )
}

export function Large({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-lg font-semibold", className)} {...props}>
      {children ?? "Are you absolutely sure?"}
    </div>
  )
}

export function Small({ className, children, ...props }: React.ComponentProps<"small">) {
  return (
    <small className={cn("text-sm leading-none font-medium", className)} {...props}>
      {children ?? "Email address"}
    </small>
  )
}

export function Muted({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children ?? "Enter your email address."}
    </p>
  )
}

export default {
  H1,
  H2,
  H3,
  H4,
  P,
  Blockquote,
  List,
  InlineCode,
  Lead,
  Large,
  Small,
  Muted,
}

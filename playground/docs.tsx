import {
  AccessibilityIcon,
  ArrowRightIcon,
  BoxesIcon,
  FeatherIcon,
  LanguagesIcon,
} from "lucide-react"

import {
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/index"
import { CodeBlock } from "./code-block"

const REPO = "https://github.com/getdokan/flycommerce-ui"
const NPM = "https://www.npmjs.com/package/@flycommerce/ui"

function ExternalLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary-ink underline-offset-4 hover:underline"
    >
      {children}
    </a>
  )
}

const FEATURES = [
  {
    icon: BoxesIcon,
    title: "90+ components",
    text: "The full shadcn/ui set plus commerce patterns: data tables with filters, media library, category picker, rich-text editor.",
  },
  {
    icon: AccessibilityIcon,
    title: "Accessible",
    text: "Keyboard support, labelled controls and WCAG AA contrast in light and dark, checked with axe on every change.",
  },
  {
    icon: LanguagesIcon,
    title: "Every market",
    text: "Right-to-left layouts, and every user-visible string can be translated through props.",
  },
  {
    icon: FeatherIcon,
    title: "Lightweight",
    text: "Tree-shakeable ESM with types. A Button adds about 14 KB gzipped; heavy extras like charts are opt-in.",
  },
]

export function WelcomeDoc() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" dot>
            v{__UI_VERSION__}
          </Badge>
          <Badge variant="secondary">MIT</Badge>
          <Badge variant="secondary">React 19</Badge>
          <Badge variant="secondary">Tailwind CSS 4</Badge>
        </div>
        <h1 className="font-heading text-3xl leading-tight font-bold tracking-tight text-foreground sm:text-4xl">
          FlyCommerce UI
        </h1>
        <p className="max-w-2xl text-base text-foreground-secondary sm:text-lg">
          The design system behind FlyCommerce: accessible React components,
          design tokens and commerce patterns that give the dashboard, the hub
          and third-party apps the same look and behaviour. Built on shadcn/ui,
          Radix and Tailwind CSS.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href="#installation">
              Get started <ArrowRightIcon data-icon="inline-end" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={NPM} target="_blank" rel="noopener noreferrer">
              npm package
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={REPO} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href="#button">Browse components</a>
          </Button>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map(({ icon: FeatureIcon, title, text }) => (
          <li
            key={title}
            className="flex gap-3 rounded-lg border border-border-subtle bg-card-header p-4"
          >
            <FeatureIcon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-primary-ink"
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 text-sm text-foreground-secondary">
        <h2 className="font-semibold text-foreground">Using this gallery</h2>
        <ul className="flex list-disc flex-col gap-1 ps-5">
          <li>
            Every component section has a <strong>Preview</strong> and a{" "}
            <strong>Code</strong> tab. The code is ready to paste into your app.
          </li>
          <li>
            The badge next to each title shows where its design comes from: the
            FlyCommerce prototype, the Figma file, a composite pattern, or
            shadcn&apos;s default where there&apos;s no FlyCommerce design yet.
          </li>
          <li>
            Press <kbd className="rounded border px-1 text-xs">/</kbd> to
            search. The header switches dark mode and right-to-left layout.
          </li>
          <li>
            What changed in each version: the{" "}
            <ExternalLink href={`${REPO}/blob/main/CHANGELOG.md`}>
              changelog
            </ExternalLink>{" "}
            and <ExternalLink href={`${REPO}/releases`}>releases</ExternalLink>.
          </li>
        </ul>
      </div>
    </div>
  )
}

const INSTALL = {
  pnpm: "pnpm add @flycommerce/ui",
  npm: "npm install @flycommerce/ui",
  yarn: "yarn add @flycommerce/ui",
}

const TAILWIND_CSS = `@import "tailwindcss";
@import "@flycommerce/ui/tailwind.css";
@import "@flycommerce/ui/fonts.css"; /* Inter, if your app doesn't load it already */`

const PLAIN_CSS = `import "@flycommerce/ui/styles.css"
import "@flycommerce/ui/fonts.css"`

const PROVIDERS = `import { Toaster, TooltipProvider } from "@flycommerce/ui"

export function Root({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  )
}`

const FIRST_SCREEN = `import { Button, Field, FieldLabel, Input, toast } from "@flycommerce/ui"

export function StoreName() {
  return (
    <Field>
      <FieldLabel htmlFor="store-name" required>
        Store name
      </FieldLabel>
      <Input id="store-name" defaultValue="Trendy Store" />
      <Button onClick={() => toast.success("Saved")}>Save changes</Button>
    </Field>
  )
}`

const CLAUDE = `/plugin marketplace add getdokan/flycommerce-ui
/plugin install flycommerce-ui@flycommerce-ui`

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary-ink"
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h3 className="pt-0.5 text-base font-semibold text-foreground">
          {title}
        </h3>
        {children}
      </div>
    </li>
  )
}

export function InstallationDoc() {
  return (
    <ol className="flex w-full flex-col gap-8">
      <Step n={1} title="Install the package">
        <Tabs defaultValue="pnpm" className="min-w-0 gap-3">
          <TabsList aria-label="Package manager">
            {Object.keys(INSTALL).map((pm) => (
              <TabsTrigger key={pm} value={pm} className="px-3 py-1 text-xs">
                {pm}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(INSTALL).map(([pm, command]) => (
            <TabsContent key={pm} value={pm}>
              <CodeBlock code={command} copyLabel="Copy install command" />
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-sm text-muted-foreground">
          Needs React 19. Published on{" "}
          <ExternalLink href={NPM}>npm</ExternalLink> with provenance, so you
          can verify every version was built from{" "}
          <ExternalLink href={REPO}>the GitHub repository</ExternalLink>.
        </p>
      </Step>

      <Step n={2} title="Add the styles">
        <Tabs defaultValue="tailwind" className="min-w-0 gap-3">
          <TabsList aria-label="Styling setup">
            <TabsTrigger value="tailwind" className="px-3 py-1 text-xs">
              With Tailwind CSS 4
            </TabsTrigger>
            <TabsTrigger value="plain" className="px-3 py-1 text-xs">
              Without Tailwind
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tailwind" className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              In your main stylesheet, after Tailwind. It registers the design
              tokens and tells Tailwind to scan the library&apos;s components.
            </p>
            <CodeBlock code={TAILWIND_CSS} />
          </TabsContent>
          <TabsContent value="plain" className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Once at the app root. The precompiled stylesheet has no CSS reset,
              so it won&apos;t restyle the rest of your page.
            </p>
            <CodeBlock code={PLAIN_CSS} />
          </TabsContent>
        </Tabs>
      </Step>

      <Step n={3} title="Wrap your app once">
        <CodeBlock code={PROVIDERS} />
      </Step>

      <Step n={4} title="Dark mode and right-to-left">
        <ul className="flex list-disc flex-col gap-1 ps-5 text-sm text-foreground-secondary">
          <li>
            Dark mode: set <code>data-theme=&quot;dark&quot;</code> (or the{" "}
            <code>dark</code> class) on <code>&lt;html&gt;</code>.
          </li>
          <li>
            Right-to-left: set <code>dir=&quot;rtl&quot;</code> on{" "}
            <code>&lt;html&gt;</code> and wrap the app in{" "}
            <code>&lt;DirectionProvider dir=&quot;rtl&quot;&gt;</code>.
          </li>
        </ul>
      </Step>

      <Step n={5} title="Build your first screen">
        <CodeBlock code={FIRST_SCREEN} />
        <p className="text-sm text-muted-foreground">
          From here, pick components from the sidebar and copy from their{" "}
          <strong>Code</strong> tab. Charts are opt-in: install{" "}
          <code>recharts</code> and import from{" "}
          <code>@flycommerce/ui/chart</code>.
        </p>
      </Step>

      <Step n={6} title="Optional: build with Claude Code">
        <p className="text-sm text-muted-foreground">
          The <code>flycommerce-ui</code> plugin teaches Claude which component
          to use, the design tokens, icon names and screen recipes.
        </p>
        <CodeBlock code={CLAUDE} copyLabel="Copy plugin commands" />
      </Step>
    </ol>
  )
}

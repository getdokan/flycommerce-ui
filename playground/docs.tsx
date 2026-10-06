import {
  FiArrowRight as ArrowRightIcon,
  FiFeather as FeatherIcon,
} from "react-icons/fi"
import {
  LuAccessibility as AccessibilityIcon,
  LuBoxes as BoxesIcon,
  LuLanguages as LanguagesIcon,
} from "react-icons/lu"

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
            <p className="text-sm text-muted-foreground">
              Adopting the library page by page? Import{" "}
              <code>@flycommerce/ui/tailwind-core.css</code> instead of{" "}
              <code>tailwind.css</code>. It leaves out the global base layer
              (page background, border and outline colours, font), so pages you
              haven&apos;t migrated keep their look.
            </p>
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
          to use, the design tokens, icon names and screen recipes.{" "}
          <a
            href="#claude-code"
            className="font-medium text-primary-ink underline-offset-4 hover:underline"
          >
            Read the Claude Code guide
          </a>
          .
        </p>
        <CodeBlock code={CLAUDE} copyLabel="Copy plugin commands" />
      </Step>
    </ol>
  )
}

const TEAM_SETTINGS = `{
  "extraKnownMarketplaces": {
    "flycommerce-ui": {
      "source": { "source": "github", "repo": "getdokan/flycommerce-ui" }
    }
  },
  "enabledPlugins": {
    "flycommerce-ui@flycommerce-ui": true
  }
}`

const KNOWS = [
  [
    "Which component to use",
    "A table of needs → components, e.g. a hierarchy picker is TreeSelect, a list page is DataTable with TableFilters.",
  ],
  [
    "Design tokens",
    "Colours, radii, shadows and type through tokens only: no hex values, no one-off styling.",
  ],
  ["Icons", "The 150 semantic <Icon name> meanings, never raw icon imports."],
  [
    "Screen recipes",
    "List, form and settings pages assembled the FlyCommerce way.",
  ],
  [
    "Translation and accessibility",
    "Every label passed through props, icon buttons named, inputs labelled.",
  ],
  [
    "Migrating old screens",
    "A map from @getdokan/dokan-ui, Headless UI and react-select to @flycommerce/ui.",
  ],
] as const

const PROMPTS = [
  "Build the vendor payouts page: search, status tabs, a date range filter and pagination.",
  "Implement this Figma frame as a settings page: <paste the Figma link>",
  "Migrate src/pages/orders/index.tsx from @getdokan/dokan-ui to @flycommerce/ui.",
  "Add a category image picker to the category form, uploading with our uploadMediaFile.",
  "Which component should I use for choosing a parent category?",
]

export function ClaudeCodeDoc() {
  return (
    <div className="flex w-full flex-col gap-8 text-sm text-foreground-secondary">
      <p className="max-w-2xl text-base">
        The <code>flycommerce-ui</code> plugin gives Claude Code the rules of
        this design system, so the screens it builds use the right components,
        tokens and icons the first time. It lives in the{" "}
        <ExternalLink href={`${REPO}/tree/main/plugin`}>
          same repository
        </ExternalLink>{" "}
        as the library and is updated with it.
      </p>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">1. Install</h3>
        <Tabs defaultValue="me" className="min-w-0 gap-3">
          <TabsList aria-label="Install scope">
            <TabsTrigger value="me" className="px-3 py-1 text-xs">
              Just for me
            </TabsTrigger>
            <TabsTrigger value="team" className="px-3 py-1 text-xs">
              For everyone in a repo
            </TabsTrigger>
          </TabsList>
          <TabsContent value="me" className="flex flex-col gap-2">
            <p>Run these two commands inside Claude Code:</p>
            <CodeBlock code={CLAUDE} copyLabel="Copy plugin commands" />
          </TabsContent>
          <TabsContent value="team" className="flex flex-col gap-2">
            <p>
              Add this to the repository&apos;s checked-in{" "}
              <code>.claude/settings.json</code> (for example in{" "}
              <code>dashboard</code>). Claude Code then offers the plugin to
              everyone who opens the repository.
            </p>
            <CodeBlock code={TEAM_SETTINGS} copyLabel="Copy settings" />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">
          2. Just ask. It switches on by itself
        </h3>
        <p className="max-w-2xl">
          There&apos;s no command to run. Claude loads the plugin whenever you
          create or edit FlyCommerce UI: a screen, form, table, modal or
          settings page, a Figma frame to implement, or code still using
          dokan-ui, Headless UI or react-select. It then knows:
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {KNOWS.map(([title, text]) => (
            <li
              key={title}
              className="rounded-lg border border-border-subtle bg-card-header p-4"
            >
              <h4 className="font-semibold text-foreground">{title}</h4>
              <p className="mt-1 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
        <p className="max-w-2xl">
          It also tells Claude to finish with a check: type-check, look at the
          screen at desktop and phone width in light and dark, and search its
          changes for raw colours and old UI libraries.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">
          3. Example prompts
        </h3>
        <ul className="flex flex-col gap-2">
          {PROMPTS.map((prompt) => (
            <li
              key={prompt}
              className="rounded-lg border border-border-subtle bg-page px-4 py-2.5 font-mono text-[12.5px] text-foreground"
            >
              {prompt}
            </li>
          ))}
        </ul>
        <p className="max-w-2xl">
          Every component section in this gallery also has a{" "}
          <strong>Code</strong> tab. Pasting one into your prompt (&quot;make it
          like this&quot;) gives Claude an exact starting point.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">
          4. Keeping it up to date
        </h3>
        <p className="max-w-2xl">
          The plugin&apos;s component list, tokens and icons are generated from
          the library source, and CI fails if they fall behind, so the plugin
          always matches the latest release. Refresh your copy from the{" "}
          <code>/plugin</code> menu in Claude Code.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">
          If Claude doesn&apos;t seem to use it
        </h3>
        <ul className="flex list-disc flex-col gap-1 ps-5">
          <li>
            Open <code>/plugin</code> and check that <code>flycommerce-ui</code>{" "}
            is installed and enabled.
          </li>
          <li>
            Name it in your request: &quot;use the flycommerce-ui skill to
            build…&quot;.
          </li>
          <li>
            Make sure the app has <code>@flycommerce/ui</code> installed, so the
            code Claude writes can import it.
          </li>
        </ul>
      </div>
    </div>
  )
}

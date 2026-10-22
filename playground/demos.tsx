import * as React from "react"
import {
  FiAlertTriangle as AlertTriangleIcon,
  FiBold as BoldIcon,
  FiCalendar as CalendarIcon,
  FiCheckCircle as CheckCircle2Icon,
  FiChevronDown as ChevronDownIcon,
  FiAlertCircle as CircleAlertIcon,
  FiBox as BoxIcon,
  FiDownload as DownloadIcon,
  FiHome as HomeIcon,
  FiInbox as InboxIcon,
  FiInfo as InfoIcon,
  FiItalic as ItalicIcon,
  FiMoon as MoonIcon,
  FiPlus as PlusIcon,
  FiSearch as SearchIcon,
  FiSettings as SettingsIcon,
  FiShoppingCart as ShoppingCartIcon,
  FiSliders as SlidersHorizontalIcon,
  FiSun as SunIcon,
  FiTrash2 as Trash2Icon,
  FiUnderline as UnderlineIcon,
  FiUpload as UploadIcon,
  FiUser as UserIcon,
  FiUsers as UsersIcon,
} from "react-icons/fi"
import {
  LuCalculator as CalculatorIcon,
  LuChevronsUpDown as ChevronsUpDownIcon,
  LuEllipsis as EllipsisIcon,
  LuSparkles as SparklesIcon,
} from "react-icons/lu"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { toast } from "sonner"

import {
  CardBrandIconDemo,
  ConfirmDialogDemo,
  DataTableDemo,
  DataTableReorderDemo,
  DataTableTreeDemo,
  IconsDemo,
  PageHeaderDemo,
  SaveBarDemo,
  SearchInputDemo,
  SegmentedControlDemo,
  SettingsNavDemo,
  StatusBadgeDemo,
  TimelineDemo,
  ActivityFeedDemo,
} from "./pattern-demos"
import { CodeEditorDemo } from "./code-editor-demos"
import { ClaudeCodeDoc, InstallationDoc, WelcomeDoc } from "./docs"
import {
  BrandMarkDemo,
  CardBrandMarkDemo,
  PillButtonDemo,
  TrayDemo,
} from "./display-demos"
import { ColorsDemo, TextDemo, TypographyDemo } from "./foundation-demos"
import {
  ModalUseCasesDemo,
  NewCategoryModalDemo,
  RichTextEditorDemo,
} from "./modal-demos"
import {
  OptionListEditorDemo,
  RichSelectDemo,
  TreeSelectDemo,
} from "./product-demos"
import { MediaPageDemo, MediaPartsDemo, MediaPickerDemo } from "./media-demos"
import {
  ColorInputDemo,
  CopyFieldDemo,
  ImageUploadFieldDemo,
} from "./input-demos"
import {
  AsyncComboboxDemo,
  CopyButtonDemo,
  DatePickerDemo,
  DropzoneDemo,
  ImageDemo,
  InfoTooltipDemo,
  LoadingOverlayDemo,
  NavTabsDemo,
  PasswordInputDemo,
  RadioCardDemo,
  RatingDemo,
  StatCardDemo,
  IconChipDemo,
  SwitchFieldDemo,
  TagInputDemo,
  TitleField,
} from "./p2-demos"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertAction,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DescriptionItem,
  DescriptionList,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Icon,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  Kbd,
  KbdGroup,
  Label,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  NativeSelect,
  NativeSelectOption,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useComboboxAnchor,
  useDirection,
  cn,
} from "@/index"

export type Source = "prototype" | "figma" | "composite" | "default"

export type Demo = {
  id: string
  title: string
  group: string
  source?: Source
  /** Extra search terms: other names people use for the component. */
  keywords?: string
  /** A written guide rather than a component: no source badge or Code tab. */
  doc?: boolean
  render: () => React.ReactNode
}

const KEYWORDS: Record<string, string> = {
  button: "cta action submit link back arrow loading",
  toggle: "pressed bold formatting",
  alert: "notice banner warning info error callout message",
  toast: "snackbar notification sonner flash",
  progress:
    "loader loading bar skeleton spinner placeholder usage meter limit seats tone",
  empty: "no data blank zero state",
  input:
    "text field form label error hint required optional info icon character count limit",
  "input-group": "prefix suffix addon currency",
  textarea: "multiline text area description character count limit",
  select: "dropdown picker options",
  combobox: "autocomplete searchable select typeahead multiple chips",
  checkbox: "radio switch toggle tick indeterminate",
  "input-otp": "otp pin verification code",
  calendar: "date",
  badge: "pill tag chip label status",
  avatar: "user profile photo",
  card: "panel box container tile",
  table: "grid rows columns list density compact roomy",
  "description-list":
    "meta row facts details key value label definition dl summary",
  item: "list row",
  kbd: "shortcut keyboard",
  chart: "graph bar line analytics recharts",
  carousel: "slider gallery slideshow",
  tabs: "segmented control switcher",
  accordion: "collapse expand disclosure faq",
  dialog: "modal popup overlay",
  "alert-dialog": "confirm delete modal",
  sheet: "drawer side panel offcanvas bottom sheet size wide form",
  popover: "hover card tooltip flyout",
  "dropdown-menu": "menu context right click actions kebab checkbox columns",
  command: "palette cmdk spotlight search",
  breadcrumb: "path trail",
  pagination: "pages next previous",
  "navigation-menu": "menubar nav mega menu",
  sidebar: "navigation nav rail light dark theme shortcut",
  icons: "icon glyph feather react-icons svg p3 figma provider swap set",
  "card-brand-icon":
    "payment credit card brand logo visa mastercard amex american express discover diners jcb unionpay billing",
  "card-brand-mark":
    "payment credit card brand logo visa mastercard amex american express discover diners jcb unionpay billing colour color full colour accepted cards",
  "brand-mark":
    "logo brand mark tile third party provider gateway carrier app icon simple icons white",
  "pill-button": "pill cta call to action arrow rounded full width primary",
  tray: "lead shell double bezel hero highlight notice warning plate",
  typography: "type font text heading size scale inter",
  text: "typography type scale p3 font heading title display paragraph body caption size weight bold semibold tone colour numeric tabular figures",
  colors: "color colour palette token swatch theme",
  "page-header": "title heading back link actions",
  "data-table":
    "table grid tanstack sort select bulk pagination filter sidebar thumbnail image",
  "data-table-tree": "tree nested category expand hierarchy",
  "data-table-reorder": "drag drop reorder sort order position handle dnd",
  "confirm-dialog":
    "confirm delete remove modal are you sure acknowledge checkbox type to confirm",
  "save-bar": "unsaved changes discard sticky footer",
  "search-input": "search filter query",
  "settings-nav":
    "settings sidebar side nav rail menu two pane layout groups filter jump to section shortcut",
  "status-badge": "status pill order state",
  timeline: "timeline activity history events log steps feed",
  "activity-feed": "activity log history notes order timeline comments",
  "stat-card":
    "kpi metric statistic number dashboard figure label first band group joined",
  "icon-chip": "icon tile badge avatar tinted background circle square",
  "radio-card":
    "option card choice row rows checkbox multi select radio group settings details",
  "switch-field":
    "toggle row setting enabled disabled state label badge nested settings",
  "nav-tabs": "tabs links route navigation",
  "segmented-control":
    "radio toggle switch choice option unit metric imperial pill button group",
  "async-combobox": "remote search autocomplete lookup api",
  "tag-input": "chips tags multi value creatable",
  "password-input": "password show hide eye secret api key saved masked",
  "color-input": "colour color picker hex swatch brand accent theme",
  "date-picker": "date time range calendar presets",
  dropzone: "upload file drag drop",
  "image-upload-field":
    "image upload logo icon favicon preview replace remove media library drag drop",
  "media-picker":
    "gallery image upload library choose existing video url attachment details",
  "media-page": "admin media library gallery bulk delete files",
  "media-parts": "tile thumbnail upload progress queue file",
  "tree-select": "category picker hierarchy nested drill cascader parent",
  "rich-select":
    "attribute type picker icon description create add new multi select settings",
  "option-list-editor":
    "attribute values choices sortable list reorder drag enter to add",
  "rich-text-editor":
    "wysiwyg tiptap description textarea formatting bold html heading h1 h4 ai assistant rewrite paraphrase simplify extend suggestion",
  "code-editor":
    "code snippet html css javascript json script codemirror monospace line numbers merge tags custom code",
  "modal-figma": "dialog popup new category form",
  "modal-use-cases":
    "dialog popup import export csv bulk edit invite details terms reject success wizard",
  "copy-button": "clipboard copy",
  "copy-field":
    "clipboard copy read only value url key secret token dns record callback webhook",
  "info-tooltip": "help hint info icon",
  "loading-overlay": "spinner busy loading",
  rating: "stars review score",
  image: "img photo thumbnail fallback placeholder",
}

const SOURCES: Record<string, Source> = {
  button: "prototype",
  "button-group": "prototype",
  toggle: "prototype",
  alert: "prototype",
  toast: "prototype",
  progress: "figma",
  empty: "prototype",
  input: "prototype",
  "input-group": "prototype",
  textarea: "prototype",
  select: "prototype",
  combobox: "prototype",
  checkbox: "prototype",
  badge: "prototype",
  card: "prototype",
  table: "prototype",
  "description-list": "prototype",
  tabs: "prototype",
  dialog: "prototype",
  "alert-dialog": "prototype",
  sheet: "prototype",
  popover: "prototype",
  "dropdown-menu": "prototype",
  pagination: "prototype",
  sidebar: "prototype",
  icons: "prototype",
  "card-brand-icon": "composite",
  "card-brand-mark": "prototype",
  "brand-mark": "prototype",
  "pill-button": "prototype",
  tray: "prototype",
  typography: "prototype",
  text: "prototype",
  colors: "prototype",
  "page-header": "prototype",
  "save-bar": "prototype",
  "settings-nav": "composite",
  "confirm-dialog": "prototype",
  "search-input": "prototype",
  "status-badge": "prototype",
  timeline: "prototype",
  "activity-feed": "prototype",
  "data-table": "prototype",
  "data-table-tree": "figma",
  "data-table-reorder": "figma",
  "radio-card": "prototype",
  "switch-field": "prototype",
  "stat-card": "prototype",
  "icon-chip": "figma",
  "nav-tabs": "prototype",
  "segmented-control": "composite",
  "async-combobox": "composite",
  "tag-input": "composite",
  "password-input": "composite",
  "color-input": "prototype",
  "date-picker": "composite",
  dropzone: "composite",
  "image-upload-field": "prototype",
  "rich-text-editor": "figma",
  "code-editor": "prototype",
  "media-picker": "figma",
  "media-page": "composite",
  "media-parts": "figma",
  "tree-select": "figma",
  "rich-select": "figma",
  "option-list-editor": "figma",
  "modal-figma": "figma",
  "modal-use-cases": "composite",
  "copy-button": "composite",
  "copy-field": "prototype",
  "info-tooltip": "composite",
  "loading-overlay": "composite",
  rating: "composite",
  image: "composite",
}

const orders = [
  {
    id: "#1042",
    customer: "Amina Rahman",
    status: "Delivered",
    total: "$128.00",
  },
  {
    id: "#1041",
    customer: "Leo Martin",
    status: "Processing",
    total: "$54.50",
  },
  { id: "#1040", customer: "Sara Kim", status: "Cancelled", total: "$19.99" },
]

const sheetSizes = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const

const seatUsage = [
  { used: 3, limit: 5 },
  { used: 5, limit: 5 },
]

const taxRates = [
  { region: "California", appliesTo: "All products", rate: "7.25%" },
  { region: "New York", appliesTo: "Clothing over $110", rate: "4.00%" },
  { region: "Texas", appliesTo: "All products", rate: "6.25%" },
  { region: "Ontario", appliesTo: "Products and shipping", rate: "13.00%" },
]

const paymentMethods = [
  { name: "Stripe", description: "Cards, Apple Pay, Google Pay", active: true },
  { name: "PayPal", description: "PayPal balance, Pay Later", active: true },
  {
    name: "Cash on delivery",
    description: "Paid when the order arrives",
    active: false,
  },
]

const categories = [
  "Apparel",
  "Electronics",
  "Home & Garden",
  "Beauty",
  "Sports",
  "Toys",
]

const salesData = [
  { month: "Apr", sales: 186 },
  { month: "May", sales: 305 },
  { month: "Jun", sales: 237 },
  { month: "Jul", sales: 173 },
  { month: "Aug", sales: 209 },
  { month: "Sep", sales: 264 },
]

const salesConfig = {
  sales: { label: "Sales", color: "var(--chart-1)" },
} satisfies ChartConfig

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full flex-col gap-5">{children}</div>
}

function ComboboxChipsDemo() {
  const anchor = useComboboxAnchor()
  const [value, setValue] = React.useState(["Apparel", "Electronics"])
  return (
    <Field className="w-full sm:w-96">
      <FieldLabel htmlFor="product-categories">Categories</FieldLabel>
      <Combobox
        multiple
        items={categories}
        value={value}
        onValueChange={setValue}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: string[]) =>
              values.map((item) => (
                <ComboboxChip key={item} removeLabel={`Remove ${item}`}>
                  {item}
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput
            id="product-categories"
            placeholder={value.length ? undefined : "Add a category"}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No category found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}

const COLUMNS = ["Status", "Total", "Date"]

function ColumnsMenuDemo() {
  const [shown, setShown] = React.useState(["Status", "Total"])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Columns <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Show columns</DropdownMenuLabel>
        {COLUMNS.map((column) => (
          <DropdownMenuCheckboxItem
            key={column}
            checked={shown.includes(column)}
            onCheckedChange={(checked) =>
              setShown(
                checked
                  ? [...shown, column]
                  : shown.filter((item) => item !== column)
              )
            }
            onSelect={(event) => event.preventDefault()}
          >
            {column}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ListTableDemo() {
  const [size, setSize] = React.useState<"sm" | "default" | "lg">("default")
  const editRate = (region: string) => toast(`Edit the ${region} rate`)
  return (
    <div className="flex w-full flex-col gap-3">
      <SegmentedControl
        value={size}
        onValueChange={(value) => setSize(value as typeof size)}
        size="sm"
        aria-label="Row size"
        className="self-start"
      >
        <SegmentedControlItem value="sm">sm</SegmentedControlItem>
        <SegmentedControlItem value="default">default</SegmentedControlItem>
        <SegmentedControlItem value="lg">lg</SegmentedControlItem>
      </SegmentedControl>
      <Card>
        <CardHeader className="border-b sm:px-6">
          <CardTitle>Tax rates</CardTitle>
          <CardDescription>
            Charged at checkout by region. Select a rate to edit it.
          </CardDescription>
        </CardHeader>
        <CardContent flush>
          <Table variant="list" size={size}>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Applies to</TableHead>
                <TableHead className="text-end">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((rate) => (
                <TableRow
                  key={rate.region}
                  tabIndex={0}
                  onClick={() => editRate(rate.region)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") editRate(rate.region)
                  }}
                >
                  <TableCell className="font-medium">{rate.region}</TableCell>
                  <TableCell>{rate.appliesTo}</TableCell>
                  <TableCell className="text-end">{rate.rate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-xl border"
    />
  )
}

const RAIL_ITEMS = [
  { title: "Dashboard", icon: HomeIcon },
  { title: "Products", icon: BoxIcon },
  { title: "Orders", icon: ShoppingCartIcon },
  { title: "Customers", icon: UsersIcon },
]

function SidebarDemo() {
  const direction = useDirection()
  const [railTheme, setRailTheme] = React.useState("dark")
  React.useEffect(() => {
    const root = document.documentElement
    root.dataset.sidebarTheme = railTheme
    return () => {
      delete root.dataset.sidebarTheme
    }
  }, [railTheme])

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        This page’s navigation is the Sidebar component: collapsible to icons
        with the button in the top bar or <Kbd>⌘</Kbd>
        <Kbd>B</Kbd>, a sheet below 768px. The switch sets{" "}
        <code className="rounded bg-muted px-1">data-sidebar-theme</code> on{" "}
        <code className="rounded bg-muted px-1">&lt;html&gt;</code>: every
        sidebar follows it, mobile sheets included. A single sidebar takes{" "}
        <code className="rounded bg-muted px-1">theme</code> instead, like the
        two below (each in its own provider, with the shortcut off).
      </p>
      <SegmentedControl
        aria-label="Sidebar theme"
        value={railTheme}
        onValueChange={setRailTheme}
      >
        <SegmentedControlItem value="dark">
          <MoonIcon aria-hidden="true" />
          Dark
        </SegmentedControlItem>
        <SegmentedControlItem value="light">
          <SunIcon aria-hidden="true" />
          Light
        </SegmentedControlItem>
      </SegmentedControl>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] gap-4">
        {(["dark", "light"] as const).map((theme) => (
          <SidebarProvider
            key={theme}
            shortcutKey={false}
            className="min-h-0 overflow-hidden rounded-lg border"
          >
            <Sidebar collapsible="none" theme={theme}>
              <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                    T
                  </span>
                  <span className="truncate text-sm font-semibold text-sidebar-strong">
                    Trendy Store
                  </span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Catalog</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {RAIL_ITEMS.map(({ title, icon: Icon }, index) => (
                        <SidebarMenuItem key={title}>
                          <SidebarMenuButton asChild isActive={index === 0}>
                            <a href="#sidebar">
                              <Icon />
                              <span>{title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <div className="hidden flex-1 border-s bg-page p-3 text-xs text-muted-foreground sm:block">
              <code dir="ltr">theme="{theme}"</code>
            </div>
          </SidebarProvider>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Collapsed, a rail names its items in tooltips that open away from it: to
        the right of a left rail, and to the left of a right one, as in RTL,
        where the rail takes{" "}
        <code className="rounded bg-muted px-1">side="right"</code>. Hover or
        focus an icon below.
      </p>
      <SidebarProvider
        open={false}
        shortcutKey={false}
        className="min-h-0 overflow-hidden rounded-lg border"
      >
        <Sidebar
          collapsible="none"
          side={direction === "rtl" ? "right" : "left"}
          className="w-(--sidebar-width-icon)"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {RAIL_ITEMS.map(({ title, icon: Icon }, index) => (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton
                      asChild
                      isActive={index === 0}
                      tooltip={title}
                    >
                      <a href="#sidebar" aria-label={title}>
                        <Icon />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 border-s bg-page p-3 text-xs text-muted-foreground">
          <code dir="ltr">side="{direction === "rtl" ? "right" : "left"}"</code>
        </div>
      </SidebarProvider>
    </div>
  )
}

export const demos: Demo[] = [
  // Getting started
  {
    id: "welcome",
    title: "Welcome",
    group: "Getting started",
    doc: true,
    keywords: "introduction overview about npm version home",
    render: () => <WelcomeDoc />,
  },
  {
    id: "installation",
    title: "Installation & setup",
    group: "Getting started",
    doc: true,
    keywords:
      "install setup npm pnpm yarn tailwind css providers dark mode rtl getting started quick start claude plugin",
    render: () => <InstallationDoc />,
  },
  {
    id: "claude-code",
    title: "Build with Claude Code",
    group: "Getting started",
    doc: true,
    keywords:
      "claude code plugin ai assistant skill prompts install marketplace agent",
    render: () => <ClaudeCodeDoc />,
  },
  // Foundations
  {
    id: "typography",
    title: "Typography",
    group: "Foundations",
    render: () => <TypographyDemo />,
  },
  {
    id: "text",
    title: "Text",
    group: "Foundations",
    render: () => <TextDemo />,
  },
  {
    id: "colors",
    title: "Colors",
    group: "Foundations",
    render: () => <ColorsDemo />,
  },
  {
    id: "icons",
    title: "Icons",
    group: "Foundations",
    render: () => <IconsDemo />,
  },
  {
    id: "card-brand-icon",
    title: "Card brand icon",
    group: "Foundations",
    render: () => <CardBrandIconDemo />,
  },
  {
    id: "card-brand-mark",
    title: "Card brand mark",
    group: "Foundations",
    render: () => <CardBrandMarkDemo />,
  },
  {
    id: "brand-mark",
    title: "Brand mark",
    group: "Foundations",
    render: () => <BrandMarkDemo />,
  },

  // Patterns
  {
    id: "page-header",
    title: "Page header",
    group: "Patterns",
    render: () => <PageHeaderDemo />,
  },
  {
    id: "tray",
    title: "Tray (lead)",
    group: "Patterns",
    render: () => <TrayDemo />,
  },
  {
    id: "data-table",
    title: "Data table",
    group: "Patterns",
    render: () => <DataTableDemo />,
  },
  {
    id: "data-table-reorder",
    title: "Data table: reorder rows",
    group: "Patterns",
    render: () => <DataTableReorderDemo />,
  },
  {
    id: "data-table-tree",
    title: "Data table: tree rows",
    group: "Patterns",
    render: () => <DataTableTreeDemo />,
  },
  {
    id: "confirm-dialog",
    title: "Confirm dialog",
    group: "Patterns",
    render: () => <ConfirmDialogDemo />,
  },
  {
    id: "save-bar",
    title: "Save bar",
    group: "Patterns",
    render: () => <SaveBarDemo />,
  },
  {
    id: "settings-nav",
    title: "Settings navigation",
    group: "Patterns",
    render: () => <SettingsNavDemo />,
  },
  {
    id: "search-input",
    title: "Search input",
    group: "Patterns",
    render: () => <SearchInputDemo />,
  },
  {
    id: "stat-card",
    title: "Stat card (KPI)",
    group: "Patterns",
    render: () => <StatCardDemo />,
  },
  {
    id: "icon-chip",
    title: "Icon chip",
    group: "Patterns",
    render: () => <IconChipDemo />,
  },
  {
    id: "radio-card",
    title: "Option cards & rows",
    group: "Patterns",
    render: () => <RadioCardDemo />,
  },
  {
    id: "switch-field",
    title: "Switch field",
    group: "Patterns",
    render: () => <SwitchFieldDemo />,
  },
  {
    id: "nav-tabs",
    title: "Navigation tabs",
    group: "Patterns",
    render: () => <NavTabsDemo />,
  },
  {
    id: "async-combobox",
    title: "Async select",
    group: "Patterns",
    render: () => <AsyncComboboxDemo />,
  },
  {
    id: "tag-input",
    title: "Tag input",
    group: "Patterns",
    render: () => <TagInputDemo />,
  },
  {
    id: "password-input",
    title: "Password input",
    group: "Patterns",
    render: () => <PasswordInputDemo />,
  },
  {
    id: "color-input",
    title: "Colour input",
    group: "Patterns",
    render: () => <ColorInputDemo />,
  },
  {
    id: "date-picker",
    title: "Date & range pickers",
    group: "Patterns",
    render: () => <DatePickerDemo />,
  },
  {
    id: "segmented-control",
    title: "Segmented control",
    group: "Forms",
    render: () => <SegmentedControlDemo />,
  },
  {
    id: "tree-select",
    title: "Tree select (category picker)",
    group: "Forms",
    render: () => <TreeSelectDemo />,
  },
  {
    id: "rich-select",
    title: "Rich select",
    group: "Forms",
    render: () => <RichSelectDemo />,
  },
  {
    id: "option-list-editor",
    title: "Option list editor",
    group: "Forms",
    render: () => <OptionListEditorDemo />,
  },
  {
    id: "rich-text-editor",
    title: "Rich text editor",
    group: "Forms",
    render: () => <RichTextEditorDemo />,
  },
  {
    id: "code-editor",
    title: "Code editor",
    group: "Forms",
    render: () => <CodeEditorDemo />,
  },
  {
    id: "media-picker",
    title: "Media picker (Add Media)",
    group: "Patterns",
    render: () => <MediaPickerDemo />,
  },
  {
    id: "media-page",
    title: "Media library page",
    group: "Patterns",
    render: () => <MediaPageDemo />,
  },
  {
    id: "media-parts",
    title: "Media tile & upload rows",
    group: "Patterns",
    render: () => <MediaPartsDemo />,
  },
  {
    id: "dropzone",
    title: "File drop zone",
    group: "Patterns",
    render: () => <DropzoneDemo />,
  },
  {
    id: "image-upload-field",
    title: "Image upload field",
    group: "Patterns",
    render: () => <ImageUploadFieldDemo />,
  },
  {
    id: "copy-button",
    title: "Copy button",
    group: "Patterns",
    render: () => <CopyButtonDemo />,
  },
  {
    id: "copy-field",
    title: "Copy field",
    group: "Patterns",
    render: () => <CopyFieldDemo />,
  },
  {
    id: "info-tooltip",
    title: "Info tooltip",
    group: "Patterns",
    render: () => <InfoTooltipDemo />,
  },
  {
    id: "loading-overlay",
    title: "Loading overlay",
    group: "Patterns",
    render: () => <LoadingOverlayDemo />,
  },
  {
    id: "rating",
    title: "Rating",
    group: "Patterns",
    render: () => <RatingDemo />,
  },
  {
    id: "image",
    title: "Image with fallback",
    group: "Patterns",
    render: () => <ImageDemo />,
  },
  {
    id: "status-badge",
    title: "Status badge",
    group: "Patterns",
    render: () => <StatusBadgeDemo />,
  },
  {
    id: "timeline",
    title: "Timeline",
    group: "Patterns",
    render: () => <TimelineDemo />,
  },
  {
    id: "activity-feed",
    title: "Activity feed",
    group: "Patterns",
    render: () => <ActivityFeedDemo />,
  },

  // Actions
  {
    id: "button",
    title: "Button",
    group: "Actions",
    render: () => (
      <Stack>
        <Row label="Variants">
          <Button>Save changes</Button>
          <Button variant="outline">Import</Button>
          <Button variant="secondary">AI Assistant</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Learn more</Button>
        </Row>
        <Row label="With icon">
          <Button>
            <PlusIcon /> Add product
          </Button>
          <Button variant="outline">
            <DownloadIcon /> Import
          </Button>
          <Button variant="outline">
            <UploadIcon /> Export
          </Button>
          <Button variant="secondary">
            <SparklesIcon /> AI Assistant
          </Button>
          <Button variant="destructive">
            <Trash2Icon /> Remove
          </Button>
        </Row>
        <Row label="Link with icon">
          <Button variant="link">
            <Icon name="back" data-icon="inline-start" />
            All posts
          </Button>
          <Button variant="link">
            View report
            <Icon name="forward" data-icon="inline-end" />
          </Button>
        </Row>
        <Row label="Small (32px)">
          <Button size="sm">Save</Button>
          <Button size="sm" variant="outline">
            Filter <ChevronDownIcon data-icon="inline-end" />
          </Button>
          <Button size="sm" variant="secondary">
            Connect
          </Button>
          <Button size="sm" variant="ghost">
            Skip
          </Button>
        </Row>
        <Row label="Icon only">
          <Button size="icon" variant="outline" aria-label="Settings">
            <SlidersHorizontalIcon />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label="More">
            <EllipsisIcon />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="More">
            <EllipsisIcon />
          </Button>
        </Row>
        <Row label="States">
          <Button loading>Saving</Button>
          <Button variant="outline" loading>
            Exporting
          </Button>
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
          <Button asChild variant="outline">
            <a href="#button">Link as button</a>
          </Button>
        </Row>
        <p className="text-xs text-muted-foreground">
          Press Tab to see the keyboard focus ring; mouse clicks don&apos;t show
          it.
        </p>
      </Stack>
    ),
  },
  {
    id: "pill-button",
    title: "Pill call to action",
    group: "Actions",
    render: () => <PillButtonDemo />,
  },
  {
    id: "button-group",
    title: "Button group",
    group: "Actions",
    render: () => (
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
    ),
  },
  {
    id: "toggle",
    title: "Toggle & toggle group",
    group: "Actions",
    render: () => (
      <Stack>
        <Row label="Toggle">
          <Toggle aria-label="Bold">
            <BoldIcon />
          </Toggle>
          <Toggle variant="outline" aria-label="Italic">
            <ItalicIcon />
          </Toggle>
        </Row>
        <Row label="Group">
          <ToggleGroup type="multiple" variant="outline">
            <ToggleGroupItem value="bold" aria-label="Bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </Row>
      </Stack>
    ),
  },

  // Feedback
  {
    id: "alert",
    title: "Alert",
    group: "Feedback",
    render: () => (
      <div className="grid w-full gap-3">
        <Alert>
          <InfoIcon />
          <AlertTitle>Default</AlertTitle>
          <AlertDescription>
            Neutral information on a plain surface.
          </AlertDescription>
        </Alert>
        <Alert variant="info">
          <InfoIcon />
          <AlertTitle>New payout schedule</AlertTitle>
          <AlertDescription>
            Payouts now run every Monday instead of monthly.
          </AlertDescription>
        </Alert>
        <Alert variant="success">
          <CheckCircle2Icon />
          <AlertTitle>Store is live</AlertTitle>
          <AlertDescription>
            Customers can now find and buy your products.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTriangleIcon />
          <AlertTitle>Payouts are on hold</AlertTitle>
          <AlertDescription>
            Add a bank account to receive your next payout.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>
            Your card was declined. Update your billing details.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTriangleIcon />
          <AlertTitle>Your free trial ends in 3 days</AlertTitle>
          <AlertDescription>
            Choose a plan to keep your store open and your products listed.
          </AlertDescription>
          <AlertAction>
            <Button size="sm">Subscribe to the billing plan</Button>
          </AlertAction>
        </Alert>
        <Alert>
          <AlertTitle>Product moved to Archive</AlertTitle>
          <AlertDescription>It no longer shows in your store.</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline">
              Undo
            </Button>
          </AlertAction>
        </Alert>
        <div className="w-fit">
          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>New version available</AlertTitle>
            <AlertDescription>
              Reload to get the latest changes.
            </AlertDescription>
            <AlertAction>
              <Button size="sm" variant="outline">
                Reload
              </Button>
            </AlertAction>
          </Alert>
        </div>
      </div>
    ),
  },
  {
    id: "toast",
    title: "Toast",
    group: "Feedback",
    render: () => (
      <Row label="Tones">
        <Button variant="outline" onClick={() => toast("Draft saved")}>
          Default
        </Button>
        <Button variant="outline" onClick={() => toast.info("Import started")}>
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Settings saved")}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.warning("3 products have no price")}
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Could not reach the server")}
        >
          Error
        </Button>
      </Row>
    ),
  },
  {
    id: "progress",
    title: "Progress, spinner, skeleton",
    group: "Feedback",
    render: () => (
      <Stack>
        <Row label="Progress">
          <Progress value={62} className="w-64" aria-label="Setup progress" />
        </Row>
        <Row label="Tones">
          <Progress
            value={100}
            tone="success"
            className="w-40"
            aria-label="Import complete"
          />
          <Progress
            value={85}
            tone="warning"
            className="w-40"
            aria-label="Storage used"
          />
          <Progress
            value={40}
            tone="destructive"
            className="w-40"
            aria-label="Failed rows"
          />
        </Row>
        <Row label="Usage">
          {seatUsage.map(({ used, limit }) => (
            <div key={used} className="flex items-center gap-3">
              <span className="text-sm text-foreground-secondary">
                Seats{" "}
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    used >= limit ? "text-warning-strong" : "text-foreground"
                  )}
                >
                  {used} of {limit}
                </span>
              </span>
              <Progress
                value={(used / limit) * 100}
                tone={used >= limit ? "warning" : "default"}
                className="h-1.5 w-20"
                aria-label="Seats used"
                getValueLabel={() => `${used} of ${limit}`}
              />
            </div>
          ))}
        </Row>
        <Row label="Spinner">
          <Spinner />
          <Spinner className="size-6" />
        </Row>
        <Row label="Skeleton">
          <div className="flex w-72 flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Row>
      </Stack>
    ),
  },
  {
    id: "empty",
    title: "Empty state",
    group: "Feedback",
    render: () => (
      <Empty className="w-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>Upload your first product</EmptyTitle>
          <EmptyDescription>
            Add products and start selling right away.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button variant="outline">
              <DownloadIcon /> Import
            </Button>
            <Button>
              <PlusIcon /> Add product
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    ),
  },

  // Forms
  {
    id: "input",
    title: "Input & field",
    group: "Forms",
    render: () => (
      <div className="grid w-full gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="store" required>
            Store name
          </FieldLabel>
          <Input id="store" placeholder="My store" />
          <FieldDescription>Shown on invoices and emails.</FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" aria-invalid defaultValue="not-an-email" />
          <FieldError>Enter a valid email address.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="disabled-input" optional>
            Store URL
          </FieldLabel>
          <Input
            id="disabled-input"
            disabled
            defaultValue="trendy.flycommerce.com"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="file">Logo</FieldLabel>
          <Input id="file" type="file" />
        </Field>
        <Field>
          <FieldLabel htmlFor="seo-title">Homepage title</FieldLabel>
          <Input
            id="seo-title"
            maxLength={100}
            softLimit={60}
            defaultValue="Maison Oriel: tailored outerwear and knitwear"
          />
          <FieldDescription icon={<Icon name="info" />}>
            Google shows about 60 characters. Leave blank to use the{" "}
            <a href="#input">store name</a>.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="support-email">Support email</FieldLabel>
          <Input
            id="support-email"
            type="email"
            defaultValue="help@maisonoriel.com"
          />
          <FieldDescription icon={<Icon name="info" />}>
            Customers reply to this address from order emails.
          </FieldDescription>
        </Field>
        <TitleField
          id="share-title"
          label="Share title"
          limit={60}
          defaultValue="Maison Oriel: tailored outerwear"
        />
        <TitleField
          id="page-title"
          label="Page title"
          limit={60}
          defaultValue="Maison Oriel: tailored outerwear, knitwear and leather goods from Lisbon"
        />
      </div>
    ),
  },
  {
    id: "input-group",
    title: "Input group",
    group: "Forms",
    render: () => (
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search products" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="0.00" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    ),
  },
  {
    id: "textarea",
    title: "Textarea",
    group: "Forms",
    render: () => (
      <div className="grid w-full gap-6 sm:grid-cols-2">
        <Textarea placeholder="Describe your product" />
        <Field>
          <FieldLabel htmlFor="reply">Reply to review</FieldLabel>
          <Textarea
            id="reply"
            placeholder="Write your reply here…"
            maxLength={500}
            showCount
          />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="meta-description">Meta description</FieldLabel>
          <Textarea
            id="meta-description"
            softLimit={160}
            defaultValue="Maison Oriel makes tailored outerwear, knitwear and leather goods in small runs, cut in our Lisbon studio from wool, cashmere and vegetable-tanned leather that softens with every wear."
          />
          <FieldDescription icon={<Icon name="info" />}>
            Google shows about 160 characters. Longer text is cut off in search
            results.
          </FieldDescription>
        </Field>
      </div>
    ),
  },
  {
    id: "select",
    title: "Select & native select",
    group: "Forms",
    render: () => (
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Select defaultValue="usd">
          <SelectTrigger className="w-full" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">USD — US Dollar</SelectItem>
            <SelectItem value="eur">EUR — Euro</SelectItem>
            <SelectItem value="bdt">BDT — Bangladeshi Taka</SelectItem>
          </SelectContent>
        </Select>
        <NativeSelect defaultValue="draft" aria-label="Status">
          <NativeSelectOption value="published">Published</NativeSelectOption>
          <NativeSelectOption value="draft">Draft</NativeSelectOption>
          <NativeSelectOption value="pending">Pending</NativeSelectOption>
        </NativeSelect>
      </div>
    ),
  },
  {
    id: "combobox",
    title: "Combobox",
    group: "Forms",
    render: () => (
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end">
        <div className="w-72">
          <Combobox items={categories}>
            <ComboboxInput placeholder="Search or select a category" />
            <ComboboxContent>
              <ComboboxEmpty>No category found.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <ComboboxChipsDemo />
      </div>
    ),
  },
  {
    id: "checkbox",
    title: "Checkbox, radio, switch",
    group: "Forms",
    render: () => (
      <Stack>
        <Row label="Checkbox">
          <div className="flex items-center gap-2">
            <Checkbox id="track" defaultChecked />
            <Label htmlFor="track">Track inventory</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="backorder" />
            <Label htmlFor="backorder">Allow backorders</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="some" checked="indeterminate" />
            <Label htmlFor="some">Some selected</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="locked" disabled />
            <Label htmlFor="locked">Disabled</Label>
          </div>
        </Row>
        <Row label="Radio">
          <RadioGroup defaultValue="physical" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="physical" id="physical" />
              <Label htmlFor="physical">Physical product</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="digital" id="digital" />
              <Label htmlFor="digital">Digital product</Label>
            </div>
          </RadioGroup>
        </Row>
        <Row label="Switch">
          <div className="flex items-center gap-2">
            <Switch id="live" defaultChecked />
            <Label htmlFor="live">Store is live</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="vacation" />
            <Label htmlFor="vacation">Vacation mode</Label>
          </div>
        </Row>
      </Stack>
    ),
  },
  {
    id: "slider",
    title: "Slider",
    group: "Forms",
    render: () => (
      <Slider
        defaultValue={[40]}
        max={100}
        step={1}
        className="w-72"
        aria-label="Discount (%)"
      />
    ),
  },
  {
    id: "input-otp",
    title: "One-time code",
    group: "Forms",
    render: () => (
      <InputOTP maxLength={6} aria-label="Verification code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    ),
  },
  {
    id: "calendar",
    title: "Calendar",
    group: "Forms",
    render: () => <CalendarDemo />,
  },

  // Data display
  {
    id: "badge",
    title: "Badge",
    group: "Data display",
    render: () => (
      <Stack>
        <Row label="Tones">
          <Badge>Info</Badge>
          <Badge variant="secondary">Draft</Badge>
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Out of stock</Badge>
          <Badge variant="soon">Coming soon</Badge>
          <Badge variant="outline">Outline</Badge>
        </Row>
        <Row label="With dot">
          <Badge dot variant="success">
            Active
          </Badge>
          <Badge dot variant="warning">
            On hold
          </Badge>
          <Badge dot variant="destructive">
            Suspended
          </Badge>
          <Badge dot>Processing</Badge>
          <Badge dot variant="secondary">
            Unfulfilled
          </Badge>
        </Row>
      </Stack>
    ),
  },
  {
    id: "avatar",
    title: "Avatar",
    group: "Data display",
    render: () => (
      <Row label="Avatar">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>AH</AvatarFallback>
        </Avatar>
      </Row>
    ),
  },
  {
    id: "card",
    title: "Card",
    group: "Data display",
    render: () => (
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly revenue</CardTitle>
            <CardDescription>September 2026</CardDescription>
            <CardAction>
              <Button size="icon-sm" variant="ghost" aria-label="More">
                <EllipsisIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            $12,480.00
          </CardContent>
          <CardFooter>
            <span className="text-xs text-success-strong">+12% vs August</span>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Basic information</CardTitle>
            <CardDescription>
              Name and description customers see.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="e.g. Smartwatch" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Payment methods</CardTitle>
            <CardDescription>How customers pay at checkout.</CardDescription>
          </CardHeader>
          <CardContent flush>
            <ul className="divide-y divide-border-subtle">
              {paymentMethods.map((method) => (
                <li
                  key={method.name}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-xs text-foreground-secondary">
                      {method.description}
                    </div>
                  </div>
                  <Badge dot variant={method.active ? "success" : "secondary"}>
                    {method.active ? "Active" : "Inactive"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    id: "table",
    title: "Table",
    group: "Data display",
    render: () => (
      <div className="flex w-full flex-col gap-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-end">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <Badge
                    dot
                    variant={
                      order.status === "Cancelled"
                        ? "destructive"
                        : order.status === "Delivered"
                          ? "success"
                          : "default"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ListTableDemo />
      </div>
    ),
  },
  {
    id: "description-list",
    title: "Description list",
    group: "Data display",
    render: () => (
      <div className="grid w-full gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b sm:px-6">
            <CardTitle>Sign-in</CardTitle>
          </CardHeader>
          <CardContent flush>
            <DescriptionList>
              <DescriptionItem label="Signs in with">
                Email and password
              </DescriptionItem>
              <DescriptionItem label="Account created">
                March 12, 2026
              </DescriptionItem>
              <DescriptionItem label="Last signed in">
                October 18, 2026, 9:42 AM
              </DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b sm:px-6">
            <CardTitle>Tax exemption</CardTitle>
          </CardHeader>
          <CardContent flush>
            <DescriptionList>
              <DescriptionItem label="Status">
                <Badge dot variant="warning">
                  Waiting for approval
                </Badge>
              </DescriptionItem>
              <DescriptionItem label="Region">California</DescriptionItem>
              <DescriptionItem label="Certificate">
                CA-EX-2026-00193
              </DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    id: "item",
    title: "Item (list row)",
    group: "Data display",
    render: () => (
      <div className="flex w-full flex-col gap-2">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Stripe</ItemTitle>
            <ItemDescription>
              Accept cards, wallets and bank transfers.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline">
              Connect
            </Button>
          </ItemActions>
        </Item>
        <Item variant="muted">
          <ItemContent>
            <ItemTitle>Cash on delivery</ItemTitle>
            <ItemDescription>
              Customers pay when the order arrives.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch defaultChecked aria-label="Enable cash on delivery" />
          </ItemActions>
        </Item>
      </div>
    ),
  },
  {
    id: "kbd",
    title: "Keyboard key",
    group: "Data display",
    render: () => (
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    ),
  },
  {
    id: "chart",
    title: "Chart",
    group: "Data display",
    render: () => (
      <ChartContainer config={salesConfig} className="h-56 w-full">
        <BarChart accessibilityLayer data={salesData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
        </BarChart>
      </ChartContainer>
    ),
  },
  {
    id: "carousel",
    title: "Carousel",
    group: "Data display",
    render: () => (
      <div className="w-full px-12">
        <Carousel className="mx-auto w-full max-w-xs">
          <CarouselContent>
            {Array.from({ length: 4 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted text-3xl font-semibold">
                  {index + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    ),
  },
  {
    id: "aspect-ratio",
    title: "Aspect ratio & separator",
    group: "Data display",
    render: () => (
      <div className="flex w-full items-center gap-6">
        <div className="w-48">
          <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted" />
        </div>
        <Separator orientation="vertical" className="h-16" />
        <span className="text-sm text-muted-foreground">
          16:9 frame, vertical separator
        </span>
      </div>
    ),
  },

  // Layout
  {
    id: "tabs",
    title: "Tabs",
    group: "Layout",
    render: () => (
      <Stack>
        <Row label="Segmented">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All products</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>
            {["all", "published", "draft"].map((value) => (
              <TabsContent
                key={value}
                value={value}
                className="text-sm text-muted-foreground"
              >
                Products filtered by “{value}”.
              </TabsContent>
            ))}
          </Tabs>
        </Row>
        <Row label="Underline">
          <Tabs defaultValue="general">
            <TabsList variant="line">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="social">Social share</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            {["general", "social", "advanced"].map((value) => (
              <TabsContent
                key={value}
                value={value}
                className="text-sm text-muted-foreground"
              >
                The “{value}” settings go here.
              </TabsContent>
            ))}
          </Tabs>
        </Row>
      </Stack>
    ),
  },
  {
    id: "accordion",
    title: "Accordion & collapsible",
    group: "Layout",
    render: () => (
      <Stack>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>
              Rates, zones and delivery estimates.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="tax">
            <AccordionTrigger>Tax</AccordionTrigger>
            <AccordionContent>Tax classes and regional rules.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDownIcon /> Show advanced information
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
            SKU, barcode and HS code fields.
          </CollapsibleContent>
        </Collapsible>
      </Stack>
    ),
  },
  {
    id: "scroll-area",
    title: "Scroll area",
    group: "Layout",
    render: () => (
      <ScrollArea className="h-40 w-64 rounded-lg border">
        <div className="p-3 text-sm">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="border-b border-border-subtle py-1.5 last:border-0"
            >
              Order #{1042 - i}
            </div>
          ))}
        </div>
      </ScrollArea>
    ),
  },
  {
    id: "resizable",
    title: "Resizable panels",
    group: "Layout",
    render: () => (
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-40 w-full rounded-lg border"
      >
        <ResizablePanel defaultSize="30%">
          <div className="flex h-full items-center justify-center p-4 text-sm">
            Filters
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="70%">
          <div className="flex h-full items-center justify-center p-4 text-sm">
            Results
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    ),
  },

  // Overlays
  {
    id: "dialog",
    title: "Dialog (modal)",
    group: "Overlays",
    render: () => (
      <Row label="Open">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit store</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit store</DialogTitle>
              <DialogDescription>
                Changes show on your storefront right away.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="dialog-name">Store name</FieldLabel>
              <Input id="dialog-name" defaultValue="Trendy Store" />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {(["sm", "lg", "xl"] as const).map((size) => (
          <Dialog key={size}>
            <DialogTrigger asChild>
              <Button variant="ghost">Size {size}</Button>
            </DialogTrigger>
            <DialogContent size={size}>
              <DialogHeader>
                <DialogTitle>Dialog size “{size}”</DialogTitle>
                <DialogDescription>
                  sm 400px · default 480px · lg 720px · xl 800px.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </Row>
    ),
  },
  {
    id: "modal-figma",
    title: "Modal: New Category (Figma)",
    group: "Overlays",
    render: () => <NewCategoryModalDemo />,
  },
  {
    id: "modal-use-cases",
    title: "Modal: use cases",
    group: "Overlays",
    render: () => <ModalUseCasesDemo />,
  },
  {
    id: "alert-dialog",
    title: "Alert dialog (confirm)",
    group: "Overlays",
    render: () => (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2Icon /> Delete product
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              It is removed from your catalog and can&apos;t be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  {
    id: "sheet",
    title: "Sheet & drawer",
    group: "Overlays",
    render: () => (
      <Stack>
        <Row label="Open">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Filters (side sheet)</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter products</SheetTitle>
                <SheetDescription>
                  Narrow the list by status and vendor.
                </SheetDescription>
              </SheetHeader>
              <div className="px-5">
                <Input placeholder="Vendor name" />
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Apply</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Order details (drawer)</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Order #1042</DrawerTitle>
                <DrawerDescription>
                  Placed by Amina Rahman · $128.00
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Row>
        <Row label="Sizes">
          {sheetSizes.map((size) => (
            <Sheet key={size}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  {size}
                </Button>
              </SheetTrigger>
              <SheetContent size={size}>
                <SheetHeader>
                  <SheetTitle>Invite a team member</SheetTitle>
                  <SheetDescription>
                    They get an email with a link to join your store.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-5 px-5">
                  <Field>
                    <FieldLabel htmlFor={`invite-email-${size}`}>
                      Email
                    </FieldLabel>
                    <Input
                      id={`invite-email-${size}`}
                      type="email"
                      placeholder="name@example.com"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`invite-role-${size}`} optional>
                      Designation
                    </FieldLabel>
                    <Input
                      id={`invite-role-${size}`}
                      placeholder="e.g. Store manager"
                    />
                  </Field>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </SheetClose>
                  <Button>Send invite</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </Row>
      </Stack>
    ),
  },
  {
    id: "popover",
    title: "Popover, hover card, tooltip",
    group: "Overlays",
    render: () => (
      <Row label="Open">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon /> Date range
            </Button>
          </PopoverTrigger>
          <PopoverContent>Pick a start and end date.</PopoverContent>
        </Popover>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">@trendystore</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            Trendy Store · 250 products · joined 2024
          </HoverCardContent>
        </HoverCard>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Help">
              <InfoIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Gross sales before refunds</TooltipContent>
        </Tooltip>
      </Row>
    ),
  },
  {
    id: "dropdown-menu",
    title: "Dropdown & context menu",
    group: "Overlays",
    render: () => (
      <Row label="Open">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Actions <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Product</DropdownMenuLabel>
            <DropdownMenuItem>
              Edit <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ColumnsMenuDemo />
        <ContextMenu>
          <ContextMenuTrigger className="flex h-16 w-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuItem>Rename</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Row>
    ),
  },
  {
    id: "command",
    title: "Command palette",
    group: "Overlays",
    render: () => (
      <Command className="w-full max-w-md rounded-xl border">
        <CommandInput placeholder="Search anything…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem>
              <UserIcon /> Customers
            </CommandItem>
            <CommandItem>
              <CalculatorIcon /> Tax settings
            </CommandItem>
            <CommandItem>
              <SettingsIcon /> Settings <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    ),
  },

  // Navigation
  {
    id: "breadcrumb",
    title: "Breadcrumb",
    group: "Navigation",
    render: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#breadcrumb">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#breadcrumb">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit category</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  },
  {
    id: "pagination",
    title: "Pagination",
    group: "Navigation",
    render: () => (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#pagination" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#pagination">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#pagination" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#pagination">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#pagination" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
  },
  {
    id: "navigation-menu",
    title: "Navigation menu & menubar",
    group: "Navigation",
    render: () => (
      <Stack>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-64 gap-1 p-1">
                  <NavigationMenuLink href="#navigation-menu">
                    All products
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#navigation-menu">
                    Categories
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#navigation-menu">
                    Brands
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#navigation-menu">
                Orders
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Menubar className="w-fit">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New product <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Export</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Stack>
    ),
  },
  {
    id: "sidebar",
    title: "Sidebar",
    group: "Navigation",
    render: () => <SidebarDemo />,
  },
]

for (const demo of demos) {
  demo.source = SOURCES[demo.id] ?? "default"
  demo.keywords = KEYWORDS[demo.id]
}

export const groups = Array.from(new Set(demos.map((d) => d.group)))

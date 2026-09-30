import * as React from "react"
import { InboxIcon, MoonIcon, PlusIcon, SunIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DirectionProvider,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
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
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/index"
import { useTheme } from "./theme-provider"

const orders = [
  { id: "#1042", customer: "Amina Rahman", status: "Delivered", total: "$128.00" },
  { id: "#1041", customer: "Leo Martin", status: "Processing", total: "$54.50" },
  { id: "#1040", customer: "Sara Kim", status: "Cancelled", total: "$19.99" },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  )
}

export default function App() {
  const { theme, setTheme } = useTheme()
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr")

  return (
    <DirectionProvider dir={dir}>
      <TooltipProvider>
        <div dir={dir} className="min-h-svh bg-background text-foreground">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="font-semibold">FlyCommerce UI</span>
              <Badge variant="secondary">playground</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setDir(dir === "ltr" ? "rtl" : "ltr")}>
                {dir.toUpperCase()}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </Button>
            </div>
          </header>

          <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-8">
            <Section title="Button">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
              <Button>
                <Spinner /> Saving
              </Button>
              <Button size="sm">
                <PlusIcon /> Small
              </Button>
              <Button size="lg">Large</Button>
            </Section>

            <Section title="Badge">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </Section>

            <Section title="Form controls">
              <div className="grid w-full gap-6 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="store">Store name</FieldLabel>
                  <Input id="store" placeholder="My store" />
                  <FieldDescription>Shown on invoices and emails.</FieldDescription>
                </Field>
                <Field data-invalid>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" aria-invalid defaultValue="not-an-email" />
                  <FieldError>Enter a valid email address.</FieldError>
                </Field>
                <Field>
                  <FieldLabel>Currency</FieldLabel>
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD — US Dollar</SelectItem>
                      <SelectItem value="eur">EUR — Euro</SelectItem>
                      <SelectItem value="bdt">BDT — Bangladeshi Taka</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="note">Note</FieldLabel>
                  <Textarea id="note" placeholder="Internal note" />
                </Field>
                <div className="flex items-center gap-2">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms">Track inventory</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="live" defaultChecked />
                  <Label htmlFor="live">Store is live</Label>
                </div>
              </div>
            </Section>

            <Section title="Card, dialog, tooltip, toast">
              <Card className="w-full sm:w-80">
                <CardHeader>
                  <CardTitle>Monthly revenue</CardTitle>
                  <CardDescription>September 2026</CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">$12,480.00</CardContent>
                <CardFooter className="gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Open dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete product?</DialogTitle>
                        <DialogDescription>This removes the product from your catalog.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive">Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" onClick={() => toast.success("Settings saved")}>
                        Toast
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Shows a toast</TooltipContent>
                  </Tooltip>
                </CardFooter>
              </Card>
              <Alert className="w-full sm:flex-1">
                <AlertTitle>Payouts are on hold</AlertTitle>
                <AlertDescription>Add a bank account to receive your next payout.</AlertDescription>
              </Alert>
            </Section>

            <Section title="Tabs and table">
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All orders</TabsTrigger>
                  <TabsTrigger value="empty">Empty state</TabsTrigger>
                  <TabsTrigger value="loading">Loading</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
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
                            <Badge variant={order.status === "Cancelled" ? "destructive" : "secondary"}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-end">{order.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="empty">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <InboxIcon />
                      </EmptyMedia>
                      <EmptyTitle>No orders yet</EmptyTitle>
                      <EmptyDescription>Orders appear here once customers check out.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TabsContent>
                <TabsContent value="loading" className="flex flex-col gap-2 pt-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-2/3" />
                </TabsContent>
              </Tabs>
            </Section>

            <Separator />
            <p className="text-xs text-muted-foreground">
              Placeholder tokens (shadcn defaults) until the Figma variables are applied in src/styles/theme.css.
            </p>
          </main>
          <Toaster theme={theme === "dark" ? "dark" : "light"} />
        </div>
      </TooltipProvider>
    </DirectionProvider>
  )
}

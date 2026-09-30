import * as React from "react"
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileSpreadsheetIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dropzone,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Progress,
  RadioCard,
  RadioCardGroup,
  RichTextEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from "@/index"

const PARENTS = ["None (top level)", "Clothing", "Electronics", "Home & Living"]

export function NewCategoryModalDemo() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setName("")
          setDescription("")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>New category</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="category-name" required>
              Category Name
            </FieldLabel>
            <Input
              id="category-name"
              placeholder="e.g. Summer collection"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="category-parent">Parent Category</FieldLabel>
            <Select>
              <SelectTrigger id="category-parent" className="w-full">
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {PARENTS.map((parent) => (
                  <SelectItem key={parent} value={parent}>
                    {parent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="category-description">
                Description
              </FieldLabel>
              <Button
                type="button"
                variant="link"
                size="xs"
                className="h-auto p-0"
                onClick={() =>
                  setDescription(
                    `<p>Discover our ${name || "latest"} range: hand-picked pieces made to last, with free returns on every order.</p>`
                  )
                }
              >
                <SparklesIcon /> Generate with AI
              </Button>
            </div>
            <RichTextEditor
              id="category-description"
              value={description}
              onChange={setDescription}
              placeholder="Write a short description for this category"
            />
          </Field>
          <Field>
            <FieldLabel>Category Image</FieldLabel>
            <Dropzone
              accept="image/*"
              maxSize={2 * 1024 * 1024}
              description="PNG or JPG, up to 2 MB. 600 × 600 px works best."
              browseLabel="Choose Image"
              actions={
                <Button type="button" variant="outline">
                  Choose Existing
                </Button>
              }
              onFiles={(files) => toast.success(`${files[0]?.name} added`)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="category-google">
              Google Product Category
            </FieldLabel>
            <Select>
              <SelectTrigger id="category-google" className="w-full">
                <SelectValue placeholder="Select Google product category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="166">Apparel &amp; Accessories</SelectItem>
                <SelectItem value="222">Electronics</SelectItem>
                <SelectItem value="536">Home &amp; Garden</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Used when products sync to Google Merchant Center.
            </FieldDescription>
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              toast.success(`Category “${name}” created`)
              setOpen(false)
            }}
          >
            Save Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ImportStep = "upload" | "importing" | "done"

function ImportProductsModal() {
  const [open, setOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [step, setStep] = React.useState<ImportStep>("upload")
  const [progress, setProgress] = React.useState(0)
  const [overwrite, setOverwrite] = React.useState(false)

  React.useEffect(() => {
    if (step !== "importing") return
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          clearInterval(timer)
          setStep("done")
          return 100
        }
        return value + 20
      })
    }, 300)
    return () => clearInterval(timer)
  }, [step])

  const reset = () => {
    setFile(null)
    setStep("upload")
    setProgress(0)
    setOverwrite(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // An import in progress can't be dismissed halfway.
        if (!next && step === "importing") return
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon /> Import
        </Button>
      </DialogTrigger>
      <DialogContent size="lg" showCloseButton={step !== "importing"}>
        <DialogHeader>
          <DialogTitle>Import products</DialogTitle>
          <DialogDescription>
            Upload a CSV. Existing SKUs are skipped unless you choose to update
            them.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col gap-5">
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <FileSpreadsheetIcon className="size-8 shrink-0 text-success" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.max(1, Math.round(file.size / 1024))} KB · ready to
                    import
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove file"
                  onClick={() => setFile(null)}
                >
                  <XIcon />
                </Button>
              </div>
            ) : (
              <Dropzone
                accept=".csv,text/csv"
                maxSize={10 * 1024 * 1024}
                description="CSV up to 10 MB"
                browseLabel="Choose File"
                onFiles={(files) => setFile(files[0] ?? null)}
                onReject={() => toast.error("Only CSV files up to 10 MB")}
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                Not sure about the columns?
              </span>
              <Button variant="link" size="sm" className="h-auto p-0">
                <DownloadIcon /> Download sample CSV
              </Button>
            </div>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={overwrite}
                onCheckedChange={(value) => setOverwrite(value === true)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Update existing products</span>
                <span className="block text-muted-foreground">
                  Rows whose SKU already exists overwrite that product.
                </span>
              </span>
            </label>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col gap-3 py-4" aria-live="polite">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Importing {file?.name}…</span>
              <span className="text-muted-foreground tabular-nums">
                {progress}%
              </span>
            </div>
            <Progress value={progress} aria-label="Import progress" />
            <p className="text-xs text-muted-foreground">
              Keep this window open. Large files can take a minute.
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-4">
            <Alert variant="success">
              <CheckCircle2Icon />
              <AlertTitle>Import finished</AlertTitle>
              <AlertDescription>
                118 products created, 12 updated.
              </AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>3 rows skipped</AlertTitle>
              <AlertDescription>
                Row 14, 27 and 88 have no price. Fix them and import again.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button disabled={!file} onClick={() => setStep("importing")}>
                Import products
              </Button>
            </>
          )}
          {step === "importing" && <Button loading>Importing</Button>}
          {step === "done" && (
            <>
              <Button variant="outline">
                <DownloadIcon /> Error report
              </Button>
              <DialogClose asChild>
                <Button>View products</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const EXPORT_COLUMNS = [
  "Name",
  "SKU",
  "Price",
  "Stock",
  "Category",
  "Vendor",
  "Status",
  "Images",
]

function ExportProductsModal() {
  const [open, setOpen] = React.useState(false)
  const [scope, setScope] = React.useState("all")
  const [columns, setColumns] = React.useState<string[]>(EXPORT_COLUMNS)
  const [loading, setLoading] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DownloadIcon /> Export
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Export products</DialogTitle>
          <DialogDescription>
            We email you a download link when the file is ready.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <Field>
            <FieldLabel>Products</FieldLabel>
            <RadioCardGroup
              value={scope}
              onValueChange={setScope}
              className="sm:grid-cols-3"
            >
              <RadioCard
                value="all"
                title="All products"
                description="1,284 products"
              />
              <RadioCard
                value="filtered"
                title="Current filters"
                description="212 products match"
              />
              <RadioCard
                value="selected"
                title="Selected"
                description="8 products"
              />
            </RadioCardGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="export-format">Format</FieldLabel>
            <Select defaultValue="csv">
              <SelectTrigger id="export-format" className="w-full sm:w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel, Google Sheets)</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Columns</FieldLabel>
              <Button
                variant="link"
                size="xs"
                className="h-auto p-0"
                onClick={() =>
                  setColumns(
                    columns.length === EXPORT_COLUMNS.length
                      ? []
                      : EXPORT_COLUMNS
                  )
                }
              >
                {columns.length === EXPORT_COLUMNS.length
                  ? "Clear all"
                  : "Select all"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {EXPORT_COLUMNS.map((column) => (
                <label key={column} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={columns.includes(column)}
                    onCheckedChange={(checked) =>
                      setColumns((prev) =>
                        checked
                          ? [...prev, column]
                          : prev.filter((c) => c !== column)
                      )
                    }
                  />
                  {column}
                </label>
              ))}
            </div>
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            loading={loading}
            disabled={columns.length === 0}
            onClick={async () => {
              setLoading(true)
              await new Promise((resolve) => setTimeout(resolve, 900))
              setLoading(false)
              setOpen(false)
              toast.success("Export started. We'll email you the file.")
            }}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BulkEditModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk edit (8)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit 8 products</DialogTitle>
          <DialogDescription>
            Only the fields you change are updated. Leave the rest blank.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="bulk-status">Status</FieldLabel>
            <Select>
              <SelectTrigger id="bulk-status" className="w-full">
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="bulk-price" optional>
              Price adjustment (%)
            </FieldLabel>
            <Input id="bulk-price" type="number" placeholder="e.g. -10" />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success("8 products updated")}>
              Apply to 8 products
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InviteMemberModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite member</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>They get an email to join.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="invite-email" required>
              Email
            </FieldLabel>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@company.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-role">Role</FieldLabel>
            <Select defaultValue="staff">
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success("Invitation sent")}>
              Send invite
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrderDetailsModal() {
  const rows: [string, React.ReactNode][] = [
    ["Order", "#10482"],
    ["Customer", "Nadia Rahman"],
    ["Placed", "30 Sep 2026, 14:12"],
    ["Payment", <Badge variant="success">Paid</Badge>],
    ["Fulfilment", <Badge variant="warning">Unfulfilled</Badge>],
    ["Total", "$248.00"],
  ]
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order #10482</DialogTitle>
          <DialogDescription>Read-only summary.</DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col">
          {rows.map(([term, value], index) => (
            <React.Fragment key={term}>
              {index > 0 && <Separator className="bg-border-subtle" />}
              <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            </React.Fragment>
          ))}
        </dl>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LongContentModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Terms (scrolling)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vendor terms</DialogTitle>
          <DialogDescription>
            The body scrolls; the footer stays pinned.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm text-foreground-secondary">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>
              {i + 1}. Vendors list only products they own or are licensed to
              sell, ship within the promised window and answer customer messages
              within two business days.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept terms</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeedbackModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Reject vendor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Trendy Store?</DialogTitle>
          <DialogDescription>
            The vendor sees your reason in their rejection email.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="reject-reason" required>
            Reason
          </FieldLabel>
          <Textarea
            id="reject-reason"
            maxLength={300}
            showCount
            placeholder="e.g. Business documents are missing"
          />
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive-solid"
              onClick={() => toast("Vendor rejected")}
            >
              Reject vendor
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SuccessModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Success</Button>
      </DialogTrigger>
      <DialogContent size="sm" showCloseButton={false}>
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success-subtle text-success-strong">
            <CheckCircle2Icon className="size-6" />
          </span>
          <DialogHeader className="items-center pe-0 text-center">
            <DialogTitle>Your store is live</DialogTitle>
            <DialogDescription>
              Customers can now find it at trendy.flycommerce.com.
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button variant="outline">Stay here</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Visit store</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ModalUseCasesDemo() {
  const groups: [string, string, React.ReactNode][] = [
    [
      "Data in / out",
      "size lg · multi-step import with progress and result, export with scope, format and columns",
      <>
        <ImportProductsModal />
        <ExportProductsModal />
      </>,
    ],
    [
      "Forms",
      "default 480 for a few fields, sm 400 for one or two; the primary action names what it does",
      <>
        <BulkEditModal />
        <InviteMemberModal />
        <FeedbackModal />
      </>,
    ],
    [
      "Read & acknowledge",
      "single Close, long content scrolls under a pinned footer, centered success",
      <>
        <OrderDetailsModal />
        <LongContentModal />
        <SuccessModal />
      </>,
    ],
  ]
  return (
    <div className="flex w-full flex-col gap-5">
      {groups.map(([title, note, content]) => (
        <div key={title} className="flex flex-col gap-2">
          <div>
            <h3 className="type-section-label text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{note}</p>
          </div>
          <div className="flex flex-wrap gap-2">{content}</div>
        </div>
      ))}
    </div>
  )
}

export function RichTextEditorDemo() {
  const [html, setHtml] = React.useState(
    "<p>Soft, breathable <strong>organic cotton</strong> tee.</p><ul><li>Relaxed fit</li><li>Machine washable</li></ul>"
  )
  return (
    <div className="flex w-full flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="rte-demo">Description</FieldLabel>
        <RichTextEditor
          id="rte-demo"
          value={html}
          onChange={setHtml}
          placeholder="Describe your product"
        />
        <FieldDescription>Emits HTML through onChange.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="rte-ai">With Generate with AI</FieldLabel>
        <RichTextEditor
          id="rte-ai"
          placeholder="Let AI draft it, then edit"
          onGenerate={async (current) => {
            await new Promise((resolve) => setTimeout(resolve, 1200))
            return current
              ? `${current}<p>Pairs well with our linen shorts for easy summer days.</p>`
              : "<p>Soft, breathable <strong>organic cotton</strong> tee with a relaxed fit.</p><ul><li>Pre-shrunk</li><li>Machine washable</li></ul>"
          }}
        />
        <FieldDescription>
          onGenerate gets the current HTML and resolves to the new HTML. The
          editor locks while it runs; Cmd/Ctrl+Z undoes the result.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="rte-disabled">Disabled</FieldLabel>
        <RichTextEditor id="rte-disabled" value={html} disabled />
      </Field>
      <Field>
        <FieldLabel htmlFor="rte-invalid" required>
          Invalid
        </FieldLabel>
        <RichTextEditor id="rte-invalid" invalid placeholder="Required" />
      </Field>
    </div>
  )
}

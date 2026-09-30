import * as React from "react"
import {
  AlignLeftIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  CircleIcon,
  HashIcon,
  PlusIcon,
  TypeIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  OptionListEditor,
  RichSelect,
  Switch,
  SwitchField,
  TreeSelect,
  type RichSelectOption,
  type TreeSelectOption,
} from "@/index"

const CATEGORIES: TreeSelectOption[] = [
  {
    value: "fashion",
    label: "Fashion",
    count: 10,
    children: [
      { value: "fashion-men", label: "Men", count: 4 },
      { value: "fashion-women", label: "Women", count: 6 },
    ],
  },
  { value: "winter", label: "Winter Fashion" },
  { value: "smart-wear", label: "Smart Wear", count: 4 },
  {
    value: "black-friday",
    label: "Black Friday",
    count: 10,
    children: [
      {
        value: "bf-fashion",
        label: "Fashion",
        count: 10,
        children: [{ value: "bf-fashion-shoes", label: "Shoes", count: 3 }],
      },
      { value: "bf-winter", label: "Winter Fashion" },
      { value: "bf-smart-wear", label: "Smart Wear", count: 4 },
    ],
  },
  { value: "watch", label: "Watch", count: 23 },
]

function LabelWithAction({
  htmlFor,
  label,
  action,
}: {
  htmlFor: string
  label: string
  action: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <FieldLabel htmlFor={htmlFor} required>
        {label}
      </FieldLabel>
      <Button
        type="button"
        variant="link"
        size="xs"
        className="h-auto p-0"
        onClick={() => toast("Opens the create form")}
      >
        <PlusIcon /> {action}
      </Button>
    </div>
  )
}

export function TreeSelectDemo() {
  const [value, setValue] = React.useState<string | null>("bf-winter")
  const [instant, setInstant] = React.useState<string | null>(null)
  return (
    <div className="grid w-full gap-5 md:grid-cols-2">
      <Field>
        <LabelWithAction
          htmlFor="tree-category"
          label="Category"
          action="Add Category"
        />
        <TreeSelect
          id="tree-category"
          options={CATEGORIES}
          value={value}
          onValueChange={setValue}
          placeholder="Search or select a category"
          labels={{ search: "Search category" }}
        />
        <FieldDescription>
          Arrow on a row opens its children; Cancel / Confirm applies.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="tree-instant">Applies on click</FieldLabel>
        <TreeSelect
          id="tree-instant"
          options={CATEGORIES}
          value={instant}
          onValueChange={setInstant}
          confirm={false}
          placeholder="Select a category"
        />
        <FieldDescription>confirm=false, for filters.</FieldDescription>
      </Field>
      <Field>
        <LabelWithAction
          htmlFor="tree-empty"
          label="Category"
          action="Add Category"
        />
        <TreeSelect
          id="tree-empty"
          options={[]}
          value={null}
          onValueChange={() => {}}
          placeholder="Search or select a category"
          empty={
            <Empty className="border-0 p-2">
              <EmptyHeader>
                <EmptyTitle>You don&apos;t have a category yet.</EmptyTitle>
                <EmptyDescription>
                  When you create a category, it&apos;s listed here.
                </EmptyDescription>
              </EmptyHeader>
              <Button size="sm" onClick={() => toast("Opens the create form")}>
                Add Category
              </Button>
            </Empty>
          }
        />
        <FieldDescription>Empty state.</FieldDescription>
      </Field>
    </div>
  )
}

const TYPES: RichSelectOption[] = [
  { value: "text", label: "Single line text", icon: <TypeIcon /> },
  { value: "multiline", label: "Multi-line text", icon: <AlignLeftIcon /> },
  { value: "single", label: "Single choice", icon: <CircleIcon /> },
  { value: "multiple", label: "Multiple choices", icon: <HashIcon /> },
  { value: "dropdown", label: "Dropdown", icon: <ChevronDownIcon /> },
  { value: "checkboxes", label: "Checkboxes", icon: <CheckSquareIcon /> },
]

const typeIcon = (type: string) => TYPES.find((t) => t.value === type)?.icon

const ATTRIBUTES: RichSelectOption[] = [
  {
    value: "name",
    label: "Product Name",
    description: "Single line text",
    icon: typeIcon("text"),
  },
  {
    value: "description",
    label: "Description",
    description: "Multi-line text",
    icon: typeIcon("multiline"),
  },
  {
    value: "color",
    label: "Color",
    description: "Single choice",
    icon: typeIcon("single"),
  },
  {
    value: "storage",
    label: "Storage",
    description: "Storage: 64 GB, 128 GB",
    icon: typeIcon("multiple"),
  },
  {
    value: "category",
    label: "Category",
    description: "Dropdown",
    icon: typeIcon("dropdown"),
  },
  {
    value: "sizes",
    label: "Available Sizes",
    description: "Size: S, M, L, XL, XXL",
    icon: typeIcon("checkboxes"),
  },
]

function SettingRow({
  title,
  description,
  defaultChecked,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  const id = React.useId()
  return (
    <div className="flex items-start gap-3 px-1 py-1.5">
      <Switch id={id} defaultChecked={defaultChecked} className="mt-0.5" />
      <label htmlFor={id} className="text-sm">
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </label>
    </div>
  )
}

export function RichSelectDemo() {
  const [type, setType] = React.useState<string | null>(null)
  const [attributes, setAttributes] = React.useState<string[]>(["color"])
  return (
    <div className="grid w-full gap-5 md:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="rich-type" required>
          Type
        </FieldLabel>
        <RichSelect
          id="rich-type"
          options={TYPES}
          value={type}
          onValueChange={setType}
          placeholder="Select attribute type"
        />
        <FieldDescription>Icon rows, no search.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="rich-attributes">Attributes</FieldLabel>
        <RichSelect
          id="rich-attributes"
          multiple
          searchable
          options={ATTRIBUTES}
          value={attributes}
          onValueChange={setAttributes}
          onCreate={(query) =>
            toast(`Create attribute${query ? ` “${query}”` : ""}`)
          }
          placeholder="Select attributes"
          labels={{ search: "Search attributes" }}
          footer={
            <div className="rounded-lg bg-page p-2">
              <div className="px-1 pb-1 text-sm font-semibold">Settings</div>
              <SettingRow
                title="Required Field"
                description="Customers must provide a value"
                defaultChecked
              />
              <SettingRow
                title="Visible to Customers"
                description="Show in product listings"
                defaultChecked
              />
              <SettingRow
                title="Use for Filtering"
                description="Allow customers to filter by this attribute"
              />
            </div>
          }
        />
        <FieldDescription>
          multiple + searchable + onCreate (“Add New”) + footer.
        </FieldDescription>
      </Field>
    </div>
  )
}

const CHOICE_TYPES = ["single", "multiple", "dropdown", "checkboxes"]

export function OptionListEditorDemo() {
  const [values, setValues] = React.useState(["Red", "Green", "Black"])
  return (
    <div className="flex w-full flex-col gap-5">
      <Field className="max-w-md">
        <FieldLabel htmlFor="values-demo" required>
          Values
        </FieldLabel>
        <OptionListEditor
          id="values-demo"
          value={values}
          onValueChange={setValues}
        />
        <FieldDescription>
          Enter adds; duplicates are refused; drag or Space + arrows reorders.
        </FieldDescription>
      </Field>
      <AddAttributeModal />
    </div>
  )
}

function AddAttributeModal() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<string | null>(null)
  const [values, setValues] = React.useState<string[]>([])
  const needsValues = type !== null && CHOICE_TYPES.includes(type)
  const ready = name.trim() && type && (!needsValues || values.length > 0)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setName("")
          setType(null)
          setValues([])
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="self-start">
          Add New Attribute (Figma modal)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Attribute</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="attr-name" required>
              Name
            </FieldLabel>
            <Input
              id="attr-name"
              placeholder="e.g. Color, size, weight"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="attr-type" required>
              Type
            </FieldLabel>
            <RichSelect
              id="attr-type"
              options={TYPES}
              value={type}
              onValueChange={setType}
              placeholder="Select attribute type"
            />
          </Field>
          {needsValues && (
            <Field>
              <FieldLabel htmlFor="attr-values" required>
                Values
              </FieldLabel>
              <OptionListEditor
                id="attr-values"
                value={values}
                onValueChange={setValues}
              />
            </Field>
          )}
          <SwitchField title="Visible" description="Show to customers" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!ready}
            onClick={() => {
              toast.success(`Attribute “${name}” added`)
              setOpen(false)
            }}
          >
            Add Attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

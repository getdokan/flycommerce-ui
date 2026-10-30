import { FacetFilter, type FacetFilterMultipleProps } from "@/index"

const options = [{ value: "images" as const, label: "Images" }]

export const accepted = [
  <FacetFilter
    label="Type"
    options={options}
    value={["images"]}
    onValueChange={(value: "images"[]) => value}
  />,
  <FacetFilter
    mode="multiple"
    label="Type"
    options={options}
    value={[]}
    onValueChange={(value: string[]) => value}
  />,
  <FacetFilter
    mode="single"
    label="Type"
    allLabel="All types"
    allCount={4}
    options={options}
    value={null}
    onValueChange={(value: "images" | null) => value}
  />,
]

export const rejected = [
  // @ts-expect-error a single filter takes one value, not a list
  <FacetFilter
    mode="single"
    label="Type"
    allLabel="All types"
    options={options}
    value={["images"]}
    onValueChange={() => {}}
  />,
  <FacetFilter
    mode="single"
    label="Type"
    allLabel="All types"
    options={options}
    value="images"
    // @ts-expect-error a single filter can call back with null
    onValueChange={(value: "images") => value}
  />,
  // @ts-expect-error a single filter needs the all row, or a pick could never be undone
  <FacetFilter
    mode="single"
    label="Type"
    options={options}
    value={null}
    onValueChange={() => {}}
  />,
  // @ts-expect-error a multiple filter takes a list
  <FacetFilter
    label="Type"
    options={options}
    value="images"
    onValueChange={() => {}}
  />,
  // @ts-expect-error the all row is for the single mode
  <FacetFilter
    label="Type"
    allLabel="All types"
    options={options}
    value={[]}
    onValueChange={() => {}}
  />,
]

export const multipleValue: FacetFilterMultipleProps<"images">["value"] = [
  "images",
]
// @ts-expect-error the checkbox filter's value is a list
export const multipleString: FacetFilterMultipleProps<"images">["value"] =
  "images"

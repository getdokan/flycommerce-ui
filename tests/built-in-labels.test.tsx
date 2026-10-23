import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  BreadcrumbEllipsis,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  Spinner,
} from "@/index"

describe("DialogFooter", () => {
  function Export({ closeLabel }: { closeLabel?: string }) {
    return (
      <Dialog open>
        <DialogContent showCloseButton={false} aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Siparişleri dışa aktar</DialogTitle>
          </DialogHeader>
          <DialogFooter showCloseButton closeLabel={closeLabel} />
        </DialogContent>
      </Dialog>
    )
  }

  it("labels its close button Close by default", () => {
    render(<Export />)
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
  })

  it("takes a translated close label", () => {
    render(<Export closeLabel="Kapat" />)
    expect(screen.getByRole("button", { name: "Kapat" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
  })
})

describe("CommandDialog", () => {
  function Palette({ closeLabel }: { closeLabel?: string }) {
    return (
      <CommandDialog open showCloseButton closeLabel={closeLabel}>
        <Command>
          <CommandInput aria-label="Komut ara" />
          <CommandList>
            <CommandItem>Siparişler</CommandItem>
          </CommandList>
        </Command>
      </CommandDialog>
    )
  }

  it("names its close button Close by default", () => {
    render(<Palette />)
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
  })

  it("passes a translated close label to the dialog", () => {
    render(<Palette closeLabel="Kapat" />)
    expect(screen.getByRole("button", { name: "Kapat" })).toBeTruthy()
  })
})

describe("BreadcrumbEllipsis", () => {
  it("reads More by default and takes a translation", () => {
    const { unmount } = render(<BreadcrumbEllipsis />)
    expect(screen.getByText("More")).toBeTruthy()
    unmount()

    render(<BreadcrumbEllipsis label="Daha fazla" />)
    expect(screen.getByText("Daha fazla")).toBeTruthy()
  })
})

describe("Carousel buttons", () => {
  function Slides(props: { previous?: string; next?: string }) {
    return (
      <Carousel>
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
          <CarouselItem>2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious label={props.previous} />
        <CarouselNext label={props.next} />
      </Carousel>
    )
  }

  it("are named Previous slide and Next slide by default", () => {
    render(<Slides />)
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Next slide" })).toBeTruthy()
  })

  it("take translated labels", () => {
    render(<Slides previous="Önceki slayt" next="Sonraki slayt" />)
    expect(screen.getByRole("button", { name: "Önceki slayt" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Sonraki slayt" })).toBeTruthy()
  })
})

describe("MessageScrollerButton", () => {
  function Thread(props: { end?: string; start?: string }) {
    return (
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport aria-label="Mesajlar">
            <MessageScrollerContent>
              <MessageScrollerItem messageId="1">Merhaba</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton label={props.end} />
          <MessageScrollerButton direction="start" label={props.start} />
        </MessageScroller>
      </MessageScrollerProvider>
    )
  }

  it("is named after its direction by default", () => {
    render(<Thread />)
    expect(screen.getByRole("button", { name: "Scroll to end" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Scroll to start" })).toBeTruthy()
  })

  it("takes a translated label", () => {
    render(<Thread end="Sona kaydır" start="Başa kaydır" />)
    expect(screen.getByRole("button", { name: "Sona kaydır" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Başa kaydır" })).toBeTruthy()
  })
})

describe("Spinner", () => {
  it("announces Loading by default and takes a translated aria-label", () => {
    const { unmount } = render(<Spinner />)
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy()
    unmount()

    render(<Spinner aria-label="Yükleniyor" />)
    expect(screen.getByRole("status", { name: "Yükleniyor" })).toBeTruthy()
  })
})

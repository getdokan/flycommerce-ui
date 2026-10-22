import { compile } from "tailwindcss"
import { afterEach } from "vitest"

afterEach(() => {
  for (const style of document.head.querySelectorAll("style[data-tailwind]")) {
    style.remove()
  }
})

export async function applyTailwind() {
  const classes = new Set(
    [...document.querySelectorAll("[class]")].flatMap((element) =>
      element.getAttribute("class")!.split(/\s+/).filter(Boolean)
    )
  )
  const { build } = await compile(
    "@theme { --spacing: 0.25rem; } @tailwind utilities;"
  )
  const style = document.createElement("style")
  style.dataset.tailwind = ""
  style.textContent = build([...classes])
  document.head.append(style)
}

export const degrees = (element: Element) =>
  Number(getComputedStyle(element).rotate.match(/-?[\d.]+(?=deg)/)?.[0] ?? 0)

export const isMirrored = (element: Element) =>
  getComputedStyle(element).getPropertyValue("--tw-scale-x").includes("-1") !==
  (Math.abs(degrees(element)) % 360 === 180)

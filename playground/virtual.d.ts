declare module "virtual:demo-sources" {
  const sources: Record<string, string>
  export default sources
}

/** package.json version, injected at build time by vite.config.ts. */
declare const __UI_VERSION__: string

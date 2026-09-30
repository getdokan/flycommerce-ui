# flycommerce-ui Claude plugin

Makes Claude Code build FlyCommerce UI the right way: `@flycommerce/ui` components, design tokens, semantic icons, screen recipes and the dokan-ui migration map.

## Install

In Claude Code (needs read access to this private repo through your git credentials):

```
/plugin marketplace add getdokan/flycommerce-ui
/plugin install flycommerce-ui@flycommerce-ui
```

To turn it on for everyone working in a repo (e.g. `dashboard`), add this to that repo's checked-in `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "flycommerce-ui": {
      "source": { "source": "github", "repo": "getdokan/flycommerce-ui" }
    }
  },
  "enabledPlugins": {
    "flycommerce-ui@flycommerce-ui": true
  }
}
```

## What's inside

- `skills/flycommerce-ui/SKILL.md`: rules, the "which component" table and screen recipes.
- `skills/flycommerce-ui/references/`: `exports.md`, `icons.md` and `tokens.md` are generated from the library source (`pnpm skill:refs`; CI fails if they're stale). `migration.md` is the hand-written dokan-ui mapping.

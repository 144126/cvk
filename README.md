# cvk — canvas keys

drive obsidian canvas from the keyboard.

## defaults

| keys | does |
| --- | --- |
| `Alt` + arrow | new node that way, connected to nothing |
| `Alt+Shift` + arrow | new connected node that way, arrow pointing at it |
| `Alt+N` | new node in the middle of the view, connected to nothing |
| `Alt+H` `Alt+J` `Alt+K` `Alt+L` | focus the nearest node left / down / up / right |
| `Tab` / `Shift+Tab` | focus next / previous node, top-to-bottom then left-to-right |
| `Enter` | edit the selected node |
| `Shift+Delete` / `Mod+Backspace` | delete the selection |
| `Alt+C` / `Alt+Shift+C` | connect the selected nodes into a chain, one-way / two-way |
| `Alt+P` | cycle the selection through the six canvas colours and back to none |
| `Alt+G` / `Alt+Shift+G` | group the selection / remove the selected group |
| unbound | move node up/down/left/right by the configured step — obsidian's own arrows already nudge |
| unbound | resize node up/down/left/right — bind them in settings then hotkeys |
| unbound | new connected node that way, link points both ways |

every one of these is rebindable in settings then hotkeys, and none of them fire while a card is being edited.

no default binding uses `Ctrl` with an arrow key.

## already in obsidian, not reimplemented here

arrows nudge by grid, `Shift` + arrows nudge by five, `Mod+A` select all, `Mod+Z` / `Mod+Shift+Z` undo and redo, `Shift+1` zoom to fit, `Shift+2` zoom to selection, `Escape` deselect, `Delete` delete selection.

## settings

| setting | default | does |
| --- | --- | --- |
| move step | 50 | pixels a node moves or resizes per keypress |
| new node gap | 50 | pixels between a node and the node created next to it |

## dev

```bash
pnpm install
pnpm dev      # watch build
pnpm test     # vitest
pnpm check    # tsc --noEmit
pnpm build    # production bundle + copy into every obsidian vault
```

canvas_ops.ts is pure geometry and imports nothing. canvas_bridge.ts drives a live canvas and never imports obsidian, so both are unit tested without an obsidian runtime. main.ts is registration only.

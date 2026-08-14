import { ItemView, Plugin, type Hotkey } from 'obsidian';
import * as ops from './canvas_bridge';
import { dirs, type dir } from './canvas_ops';
import { CvkSettingsTab, DEFAULT_SETTINGS, type CvkSettings } from './settings';

const arrow: Record<dir, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const letter: Record<dir, string> = { up: 'K', down: 'J', left: 'H', right: 'L' };

function is_typing(): boolean {
	const el = activeDocument.activeElement as HTMLElement | null;
	return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export default class CvkPlugin extends Plugin {
	settings: CvkSettings = DEFAULT_SETTINGS;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.addSettingTab(new CvkSettingsTab(this.app, this, this.settings, () => this.saveData(this.settings)));

		for (const d of dirs) {
			this.canvas_command(`new-node-${d}`, `new connected node ${d}`, [{ modifiers: ['Alt'], key: arrow[d] }], false, (c) => ops.create_connected(c, d, false, this.settings));
			this.canvas_command(`new-node-two-way-${d}`, `new connected node ${d} (two-way)`, [{ modifiers: ['Alt', 'Shift'], key: arrow[d] }], false, (c) => ops.create_connected(c, d, true, this.settings));
			this.canvas_command(`focus-${d}`, `focus nearest node ${d}`, [{ modifiers: ['Alt'], key: letter[d] }], true, (c) => ops.focus_dir(c, d));
			this.canvas_command(`move-${d}`, `move node ${d}`, [], true, (c) => ops.move_selection(c, d, this.settings));
			this.canvas_command(`resize-${d}`, `resize node ${d}`, [], true, (c) => ops.resize_selection(c, d, this.settings));
		}

		this.canvas_command('new-node', 'new node', [{ modifiers: ['Alt'], key: 'N' }], false, (c) => ops.create_free(c, this.settings));
		this.canvas_command('focus-next', 'focus next node', [{ modifiers: [], key: 'Tab' }], true, (c) => ops.focus_step(c, 1));
		this.canvas_command('focus-prev', 'focus previous node', [{ modifiers: ['Shift'], key: 'Tab' }], true, (c) => ops.focus_step(c, -1));
		this.canvas_command('edit-node', 'edit node', [{ modifiers: [], key: 'Enter' }], false, (c) => ops.edit_selected(c));
		this.canvas_command('delete-node', 'delete node', [{ modifiers: ['Mod'], key: 'Backspace' }], false, (c) => ops.delete_selected(c));
		this.canvas_command('connect-selected', 'connect selected nodes', [{ modifiers: ['Alt'], key: 'C' }], false, (c) => ops.connect_selected(c, false));
		this.canvas_command('connect-selected-two-way', 'connect selected nodes (two-way)', [{ modifiers: ['Alt', 'Shift'], key: 'C' }], false, (c) => ops.connect_selected(c, true));
		this.canvas_command('cycle-color', 'cycle node colour', [{ modifiers: ['Alt'], key: 'P' }], false, (c) => ops.cycle_color(c));
		this.canvas_command('group-selection', 'group selection', [{ modifiers: ['Alt'], key: 'G' }], false, (c) => ops.group_selection(c));
		this.canvas_command('ungroup-selection', 'ungroup selection', [{ modifiers: ['Alt', 'Shift'], key: 'G' }], false, (c) => ops.ungroup_selection(c));
	}

	canvas_command(id: string, name: string, hotkeys: Hotkey[], repeatable: boolean, run: (canvas: any) => void): void {
		this.addCommand({
			id,
			name,
			hotkeys,
			repeatable,
			checkCallback: (checking: boolean) => {
				const canvas = this.active_canvas();
				if (!canvas || canvas.readonly || is_typing()) return false;
				if (!checking) run(canvas);
				return true;
			},
		});
	}

	active_canvas(): any {
		const view = this.app.workspace.getActiveViewOfType(ItemView) as any;
		return view && view.getViewType() === 'canvas' ? view.canvas : null;
	}
}

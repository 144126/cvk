import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

export interface CvkSettings {
	move_step: number;
	new_node_gap: number;
}

export const DEFAULT_SETTINGS: CvkSettings = {
	move_step: 50,
	new_node_gap: 50,
};

export class CvkSettingsTab extends PluginSettingTab {
	private settings: CvkSettings;
	private save: () => Promise<void>;

	constructor(app: App, plugin: Plugin, settings: CvkSettings, save: () => Promise<void>) {
		super(app, plugin);
		this.settings = settings;
		this.save = save;
	}

	private number_setting(name: string, desc: string, key: keyof CvkSettings): void {
		new Setting(this.containerEl)
			.setName(name)
			.setDesc(desc)
			.addText((text) =>
				text.setValue(String(this.settings[key])).onChange(async (value) => {
					const parsed = Number(value);
					if (!Number.isFinite(parsed) || parsed <= 0) return;
					this.settings[key] = parsed;
					await this.save();
				}),
			);
	}

	display(): void {
		this.containerEl.empty();
		this.number_setting('move step', 'pixels a node moves or resizes per keypress', 'move_step');
		this.number_setting('new node gap', 'pixels between a node and the node created next to it', 'new_node_gap');
	}
}

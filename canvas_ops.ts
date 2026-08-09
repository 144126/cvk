export type dir = 'up' | 'down' | 'left' | 'right';

export type box = { x: number; y: number; width: number; height: number };

export type rect = box & { id: string };

export const dirs: dir[] = ['up', 'down', 'left', 'right'];

export function center(r: box): { x: number; y: number } {
	return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

export function reading_order(nodes: rect[]): rect[] {
	return [...nodes].sort((a, b) => a.y - b.y || a.x - b.x || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function step_focus(nodes: rect[], current_id: string | null, delta: number): string | null {
	const order = reading_order(nodes);
	if (order.length === 0) return null;
	const at = current_id === null ? -1 : order.findIndex((n) => n.id === current_id);
	if (at === -1) return (delta >= 0 ? order[0] : order[order.length - 1]).id;
	return order[(at + delta + order.length) % order.length].id;
}

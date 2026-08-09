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

export function nearest_in_direction(nodes: rect[], from: rect, d: dir): string | null {
	const o = center(from);
	let best: string | null = null;
	let best_score = Infinity;
	for (const n of nodes) {
		if (n.id === from.id) continue;
		const c = center(n);
		const dx = c.x - o.x;
		const dy = c.y - o.y;
		const along = d === 'right' ? dx : d === 'left' ? -dx : d === 'down' ? dy : -dy;
		if (along <= 0) continue;
		const across = Math.abs(d === 'right' || d === 'left' ? dy : dx);
		const score = along + 2 * across;
		if (score < best_score || (score === best_score && best !== null && n.id < best)) {
			best = n.id;
			best_score = score;
		}
	}
	return best;
}

export function overlaps(a: box, b: box): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

export function new_node_rect(nodes: rect[], from: rect, d: dir, size: { width: number; height: number }, gap: number): box {
	const o = center(from);
	const sx = d === 'right' ? 1 : d === 'left' ? -1 : 0;
	const sy = d === 'down' ? 1 : d === 'up' ? -1 : 0;
	const reach = sx !== 0 ? (from.width + size.width) / 2 + gap : (from.height + size.height) / 2 + gap;
	const stride = (sx !== 0 ? size.width : size.height) + gap;
	let spot: box = { x: 0, y: 0, width: size.width, height: size.height };
	for (let i = 0; i < 100; i++) {
		const away = reach + i * stride;
		spot = {
			x: Math.round(o.x + sx * away - size.width / 2),
			y: Math.round(o.y + sy * away - size.height / 2),
			width: size.width,
			height: size.height,
		};
		if (!nodes.some((n) => overlaps(spot, n))) break;
	}
	return spot;
}

export function move_box(r: box, d: dir, step: number): { x: number; y: number } {
	return {
		x: r.x + (d === 'right' ? step : d === 'left' ? -step : 0),
		y: r.y + (d === 'down' ? step : d === 'up' ? -step : 0),
	};
}

export function resize_box(r: box, d: dir, step: number, min: number): { width: number; height: number } {
	return {
		width: Math.max(min, d === 'right' ? r.width + step : d === 'left' ? r.width - step : r.width),
		height: Math.max(min, d === 'down' ? r.height + step : d === 'up' ? r.height - step : r.height),
	};
}

export const colors = ['1', '2', '3', '4', '5', '6'];

export function next_color(current: string): string {
	const at = colors.indexOf(current);
	if (at === -1) return colors[0];
	return at === colors.length - 1 ? '' : colors[at + 1];
}

export function bounding_box(boxes: box[], pad: number): box {
	const min_x = Math.min(...boxes.map((b) => b.x)) - pad;
	const min_y = Math.min(...boxes.map((b) => b.y)) - pad;
	const max_x = Math.max(...boxes.map((b) => b.x + b.width)) + pad;
	const max_y = Math.max(...boxes.map((b) => b.y + b.height)) + pad;
	return { x: min_x, y: min_y, width: max_x - min_x, height: max_y - min_y };
}

export function connect_chain(nodes: rect[]): [string, string][] {
	const order = reading_order(nodes);
	const pairs: [string, string][] = [];
	for (let i = 0; i + 1 < order.length; i++) pairs.push([order[i].id, order[i + 1].id]);
	return pairs;
}

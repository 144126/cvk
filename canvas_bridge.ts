import { nearest_in_direction, step_focus, type dir, type rect } from './canvas_ops';

export type opts = { move_step: number; new_node_gap: number };

export function new_id(): string {
	let s = '';
	for (let i = 0; i < 16; i++) s += Math.floor(Math.random() * 16).toString(16);
	return s;
}

export function all_rects(canvas: any): rect[] {
	return (Array.from(canvas.nodes.values()) as any[]).map((n) => ({ id: n.id, x: n.x, y: n.y, width: n.width, height: n.height }));
}

export function selected_nodes(canvas: any): any[] {
	return (Array.from(canvas.selection) as any[]).filter((s) => canvas.nodes.get(s.id) === s);
}

export function focus_node(canvas: any, node: any): void {
	canvas.selectOnly(node);
	canvas.panIntoView(node.getBBox());
	canvas.wrapperEl.focus({ preventScroll: true });
}

export function focus_step(canvas: any, delta: number): void {
	const current = selected_nodes(canvas)[0];
	const id = step_focus(all_rects(canvas), current ? current.id : null, delta);
	if (id !== null) focus_node(canvas, canvas.nodes.get(id));
}

export function focus_dir(canvas: any, d: dir): void {
	const current = selected_nodes(canvas)[0];
	if (!current) return focus_step(canvas, 1);
	const rects = all_rects(canvas);
	const from = rects.find((r) => r.id === current.id);
	if (!from) return;
	const id = nearest_in_direction(rects, from, d);
	if (id !== null) focus_node(canvas, canvas.nodes.get(id));
}

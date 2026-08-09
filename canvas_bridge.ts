import { connect_chain, nearest_in_direction, new_node_rect, step_focus, type dir, type rect } from './canvas_ops';

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

export function add_edges(canvas: any, pairs: [string, string][], two_way: boolean): void {
	if (pairs.length === 0) return;
	canvas.importData(
		{
			nodes: [],
			edges: pairs.map(([from, to]) => ({ id: new_id(), fromNode: from, toNode: to, fromEnd: two_way ? 'arrow' : 'none', toEnd: 'arrow' })),
		},
		false,
	);
	canvas.requestSave();
}

export function create_connected(canvas: any, d: dir, two_way: boolean, o: opts): void {
	const current = selected_nodes(canvas)[0];
	if (!current) return;
	const rects = all_rects(canvas);
	const from = rects.find((r) => r.id === current.id);
	if (!from) return;
	const spot = new_node_rect(rects, from, d, canvas.config.defaultTextNodeDimensions, o.new_node_gap);
	const made = canvas.createTextNode({ pos: { x: spot.x, y: spot.y }, size: { width: spot.width, height: spot.height }, save: false });
	add_edges(canvas, [[current.id, made.id]], two_way);
	canvas.panIntoView(made.getBBox());
}

export function connect_selected(canvas: any, two_way: boolean): void {
	const sel = selected_nodes(canvas);
	if (sel.length < 2) return;
	add_edges(canvas, connect_chain(sel.map((n) => ({ id: n.id, x: n.x, y: n.y, width: n.width, height: n.height }))), two_way);
}

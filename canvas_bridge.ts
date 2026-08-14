import { bounding_box, connect_chain, free_rect, move_box, nearest_in_direction, new_node_rect, next_color, resize_box, step_focus, type dir, type rect } from './canvas_ops';

const group_pad = 20;
const min_node_size = 50;

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

export function create_dir(canvas: any, d: dir, link: 'none' | 'one' | 'two', o: opts): void {
	const current = selected_nodes(canvas)[0];
	if (!current) return;
	const rects = all_rects(canvas);
	const from = rects.find((r) => r.id === current.id);
	if (!from) return;
	const spot = new_node_rect(rects, from, d, canvas.config.defaultTextNodeDimensions, o.new_node_gap);
	const made = canvas.createTextNode({ pos: { x: spot.x, y: spot.y }, size: { width: spot.width, height: spot.height }, save: false });
	if (link === 'none') canvas.requestSave();
	else add_edges(canvas, [[current.id, made.id]], link === 'two');
	canvas.panIntoView(made.getBBox());
}

export function create_free(canvas: any, o: opts): void {
	const size = canvas.config.defaultTextNodeDimensions;
	const spot = free_rect(all_rects(canvas), canvas.posCenter(), size, o.new_node_gap);
	canvas.createTextNode({ pos: { x: spot.x, y: spot.y }, size: { width: spot.width, height: spot.height }, save: false });
	canvas.requestSave();
}

export function connect_selected(canvas: any, two_way: boolean): void {
	const sel = selected_nodes(canvas);
	if (sel.length < 2) return;
	add_edges(canvas, connect_chain(sel.map((n) => ({ id: n.id, x: n.x, y: n.y, width: n.width, height: n.height }))), two_way);
}

export function move_selection(canvas: any, d: dir, o: opts): void {
	const sel = selected_nodes(canvas);
	if (sel.length === 0) return;
	for (const n of sel) n.moveTo(move_box(n, d, o.move_step));
	canvas.requestSave();
}

export function resize_selection(canvas: any, d: dir, o: opts): void {
	const sel = selected_nodes(canvas);
	if (sel.length === 0) return;
	for (const n of sel) n.resize(resize_box(n, d, o.move_step, min_node_size));
	canvas.requestSave();
}

export function cycle_color(canvas: any): void {
	const sel = selected_nodes(canvas);
	if (sel.length === 0) return;
	for (const n of sel) n.setColor(next_color(n.color || ''), true);
	canvas.requestSave();
}

export function edit_selected(canvas: any): void {
	const node = selected_nodes(canvas)[0];
	if (node && node.isEditable()) node.startEditing();
}

export function delete_selected(canvas: any): void {
	canvas.deleteSelection();
}

export function group_selection(canvas: any): void {
	const sel = selected_nodes(canvas);
	if (sel.length === 0) return;
	const b = bounding_box(
		sel.map((n) => ({ x: n.x, y: n.y, width: n.width, height: n.height })),
		group_pad,
	);
	const group = canvas.createGroupNode({ pos: { x: b.x, y: b.y }, size: { width: b.width, height: b.height }, save: false, focus: false });
	canvas.requestSave();
	canvas.selectOnly(group);
}

export function ungroup_selection(canvas: any): void {
	const groups = selected_nodes(canvas).filter((n) => n.getData().type === 'group');
	if (groups.length === 0) return;
	for (const g of groups) canvas.removeNode(g);
	canvas.deselectAll();
	canvas.requestSave();
}

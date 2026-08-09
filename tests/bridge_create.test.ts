import { beforeEach, describe, expect, it } from 'vitest';
import { add_edges, connect_selected, create_connected } from '../canvas_bridge';
import { make_canvas, make_node, selected_ids } from './fake_canvas';

const opts = { move_step: 50, new_node_gap: 50 };

let a: any;
let canvas: any;

beforeEach(() => {
	a = make_node('a', 0, 0);
	canvas = make_canvas([a]);
});

function edges(c: any): any[] {
	return Array.from(c.edges.values());
}

describe('add_edges', () => {
	it('imports one edge per pair without touching nodes', () => {
		add_edges(canvas, [['a', 'b']], false);
		expect(canvas.imported).toEqual([
			{ nodes: [], edges: [{ id: expect.stringMatching(/^[0-9a-f]{16}$/), fromNode: 'a', toNode: 'b', fromEnd: 'none', toEnd: 'arrow' }] },
		]);
		expect(canvas.saves).toBe(1);
	});

	it('puts an arrow on both ends when two-way', () => {
		add_edges(canvas, [['a', 'b']], true);
		expect(edges(canvas)[0].fromEnd).toBe('arrow');
		expect(edges(canvas)[0].toEnd).toBe('arrow');
	});

	it('does nothing when there are no pairs', () => {
		add_edges(canvas, [], false);
		expect(canvas.imported).toEqual([]);
		expect(canvas.saves).toBe(0);
	});
});

describe('create_connected', () => {
	it('creates a default-sized node one gap away', () => {
		canvas.selectOnly(a);
		create_connected(canvas, 'right', false, opts);
		const made = canvas.nodes.get('new0');
		expect(made).toMatchObject({ x: 150, y: -5, width: 250, height: 60 });
	});

	it('links the old node to the new one, arrow pointing at the new one', () => {
		canvas.selectOnly(a);
		create_connected(canvas, 'right', false, opts);
		expect(edges(canvas)).toEqual([{ id: expect.stringMatching(/^[0-9a-f]{16}$/), fromNode: 'a', toNode: 'new0', fromEnd: 'none', toEnd: 'arrow' }]);
	});

	it('makes the link two-way on request', () => {
		canvas.selectOnly(a);
		create_connected(canvas, 'right', true, opts);
		expect(edges(canvas)[0].fromEnd).toBe('arrow');
	});

	it('selects the new node, starts editing it and pans to it', () => {
		canvas.selectOnly(a);
		create_connected(canvas, 'down', false, opts);
		expect(selected_ids(canvas)).toEqual(['new0']);
		expect(canvas.nodes.get('new0').editing).toBe(true);
		expect(canvas.panned).toEqual([{ minX: -75, minY: 100, maxX: 175, maxY: 160 }]);
	});

	it('saves the canvas', () => {
		canvas.selectOnly(a);
		create_connected(canvas, 'left', false, opts);
		expect(canvas.saves).toBeGreaterThan(0);
	});

	it('does nothing when no node is selected', () => {
		create_connected(canvas, 'right', false, opts);
		expect(canvas.nodes.size).toBe(1);
		expect(canvas.edges.size).toBe(0);
		expect(canvas.saves).toBe(0);
	});

	it('steps past an occupied spot', () => {
		const blocker = make_node('b', 150, -5, 250, 60);
		const busy = make_canvas([a, blocker]);
		busy.selectOnly(a);
		create_connected(busy, 'right', false, opts);
		expect(busy.nodes.get('new0').x).toBe(450);
	});
});

describe('connect_selected', () => {
	it('chains the selected nodes in reading order', () => {
		const b = make_node('b', 300, 0);
		const c = make_node('c', 0, 300);
		const three = make_canvas([c, b, a]);
		three.selection.add(c);
		three.selection.add(b);
		three.selection.add(a);
		connect_selected(three, false);
		expect(edges(three).map((e) => [e.fromNode, e.toNode])).toEqual([
			['a', 'b'],
			['b', 'c'],
		]);
		expect(three.saves).toBe(1);
	});

	it('makes every link two-way on request', () => {
		const b = make_node('b', 300, 0);
		const two = make_canvas([a, b]);
		two.selection.add(a);
		two.selection.add(b);
		connect_selected(two, true);
		expect(edges(two)[0].fromEnd).toBe('arrow');
	});

	it('does nothing with fewer than two nodes selected', () => {
		canvas.selectOnly(a);
		connect_selected(canvas, false);
		expect(canvas.edges.size).toBe(0);
		expect(canvas.saves).toBe(0);
	});
});

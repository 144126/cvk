import { beforeEach, describe, expect, it } from 'vitest';
import { all_rects, focus_dir, focus_node, focus_step, new_id, selected_nodes } from '../canvas_bridge';
import { make_canvas, make_node, selected_ids } from './fake_canvas';

let a: any;
let b: any;
let c: any;
let canvas: any;

beforeEach(() => {
	a = make_node('a', 0, 0);
	b = make_node('b', 300, 0);
	c = make_node('c', 0, 300);
	canvas = make_canvas([a, b, c]);
});

describe('new_id', () => {
	it('is sixteen lowercase hex characters', () => {
		expect(new_id()).toMatch(/^[0-9a-f]{16}$/);
	});

	it('does not repeat', () => {
		const ids = new Set(Array.from({ length: 200 }, () => new_id()));
		expect(ids.size).toBe(200);
	});
});

describe('all_rects', () => {
	it('flattens every node to a plain rect', () => {
		expect(all_rects(canvas)).toEqual([
			{ id: 'a', x: 0, y: 0, width: 100, height: 50 },
			{ id: 'b', x: 300, y: 0, width: 100, height: 50 },
			{ id: 'c', x: 0, y: 300, width: 100, height: 50 },
		]);
	});
});

describe('selected_nodes', () => {
	it('returns the selected nodes', () => {
		canvas.selection.add(a);
		canvas.selection.add(b);
		expect(selected_nodes(canvas).map((n: any) => n.id)).toEqual(['a', 'b']);
	});

	it('drops selected edges, which are not in the node map', () => {
		canvas.selection.add(a);
		canvas.selection.add({ id: 'edge1' });
		expect(selected_nodes(canvas).map((n: any) => n.id)).toEqual(['a']);
	});

	it('is empty when nothing is selected', () => {
		expect(selected_nodes(canvas)).toEqual([]);
	});
});

describe('focus_node', () => {
	it('selects only that node, pans to it and focuses the canvas', () => {
		canvas.selection.add(b);
		focus_node(canvas, a);
		expect(selected_ids(canvas)).toEqual(['a']);
		expect(canvas.panned).toEqual([{ minX: 0, minY: 0, maxX: 100, maxY: 50 }]);
		expect(canvas.focused).toBe(true);
	});
});

describe('focus_step', () => {
	it('moves the selection forward in reading order', () => {
		canvas.selectOnly(a);
		focus_step(canvas, 1);
		expect(selected_ids(canvas)).toEqual(['b']);
	});

	it('moves the selection backward and wraps', () => {
		canvas.selectOnly(a);
		focus_step(canvas, -1);
		expect(selected_ids(canvas)).toEqual(['c']);
	});

	it('selects the first node when nothing is selected', () => {
		focus_step(canvas, 1);
		expect(selected_ids(canvas)).toEqual(['a']);
	});

	it('does nothing on an empty canvas', () => {
		const empty = make_canvas([]);
		focus_step(empty, 1);
		expect(selected_ids(empty)).toEqual([]);
		expect(empty.panned).toEqual([]);
	});
});

describe('focus_dir', () => {
	it('selects the nearest node in that direction', () => {
		canvas.selectOnly(a);
		focus_dir(canvas, 'right');
		expect(selected_ids(canvas)).toEqual(['b']);
	});

	it('keeps the selection when nothing lies that way', () => {
		canvas.selectOnly(a);
		focus_dir(canvas, 'up');
		expect(selected_ids(canvas)).toEqual(['a']);
	});

	it('falls back to the first node when nothing is selected', () => {
		focus_dir(canvas, 'right');
		expect(selected_ids(canvas)).toEqual(['a']);
	});
});

import { beforeEach, describe, expect, it } from 'vitest';
import { cycle_color, delete_selected, edit_selected, group_selection, move_selection, resize_selection, ungroup_selection } from '../canvas_bridge';
import { make_canvas, make_node, selected_ids } from './fake_canvas';

const opts = { move_step: 50, new_node_gap: 50 };

let a: any;
let b: any;
let canvas: any;

beforeEach(() => {
	a = make_node('a', 0, 0);
	b = make_node('b', 300, 300);
	canvas = make_canvas([a, b]);
});

describe('move_selection', () => {
	it('moves every selected node by the step', () => {
		canvas.selection.add(a);
		canvas.selection.add(b);
		move_selection(canvas, 'right', opts);
		expect([a.x, b.x]).toEqual([50, 350]);
		expect([a.y, b.y]).toEqual([0, 300]);
		expect(canvas.saves).toBe(1);
	});

	it('moves up by the step', () => {
		canvas.selectOnly(a);
		move_selection(canvas, 'up', opts);
		expect(a.y).toBe(-50);
	});

	it('honours a different step', () => {
		canvas.selectOnly(a);
		move_selection(canvas, 'left', { move_step: 7, new_node_gap: 50 });
		expect(a.x).toBe(-7);
	});

	it('does nothing when nothing is selected', () => {
		move_selection(canvas, 'right', opts);
		expect(a.x).toBe(0);
		expect(canvas.saves).toBe(0);
	});
});

describe('resize_selection', () => {
	it('grows a node to the right and downward', () => {
		canvas.selectOnly(a);
		resize_selection(canvas, 'right', opts);
		resize_selection(canvas, 'down', opts);
		expect([a.width, a.height]).toEqual([150, 100]);
	});

	it('shrinks but never below fifty', () => {
		canvas.selectOnly(a);
		resize_selection(canvas, 'left', opts);
		resize_selection(canvas, 'left', opts);
		expect(a.width).toBe(50);
	});

	it('does nothing when nothing is selected', () => {
		resize_selection(canvas, 'right', opts);
		expect(a.width).toBe(100);
		expect(canvas.saves).toBe(0);
	});
});

describe('cycle_color', () => {
	it('steps every selected node to the next colour', () => {
		canvas.selection.add(a);
		canvas.selection.add(b);
		cycle_color(canvas);
		expect([a.color, b.color]).toEqual(['1', '1']);
		cycle_color(canvas);
		expect([a.color, b.color]).toEqual(['2', '2']);
		expect(canvas.saves).toBe(2);
	});

	it('does nothing when nothing is selected', () => {
		cycle_color(canvas);
		expect(a.color).toBe('');
		expect(canvas.saves).toBe(0);
	});
});

describe('edit_selected', () => {
	it('starts editing the selected node', () => {
		canvas.selectOnly(a);
		edit_selected(canvas);
		expect(a.editing).toBe(true);
	});

	it('leaves a node that cannot be edited alone', () => {
		const g = make_node('g', 0, 0, 100, 50, 'group');
		const grouped = make_canvas([g]);
		grouped.selectOnly(g);
		edit_selected(grouped);
		expect(g.editing).toBe(false);
	});

	it('does nothing when nothing is selected', () => {
		edit_selected(canvas);
		expect(a.editing).toBe(false);
	});
});

describe('delete_selected', () => {
	it('hands off to the canvas', () => {
		canvas.selectOnly(a);
		delete_selected(canvas);
		expect(canvas.deleted).toBe(true);
		expect(canvas.nodes.has('a')).toBe(false);
	});
});

describe('group_selection', () => {
	it('wraps the selection in a padded group and selects it', () => {
		canvas.selection.add(a);
		canvas.selection.add(b);
		group_selection(canvas);
		const group = canvas.nodes.get('grp0');
		expect(group).toMatchObject({ x: -20, y: -20, width: 440, height: 390, type: 'group' });
		expect(selected_ids(canvas)).toEqual(['grp0']);
		expect(canvas.saves).toBe(1);
	});

	it('does nothing when nothing is selected', () => {
		group_selection(canvas);
		expect(canvas.nodes.size).toBe(2);
		expect(canvas.saves).toBe(0);
	});
});

describe('ungroup_selection', () => {
	it('removes only the selected group nodes', () => {
		const g = make_node('g', 0, 0, 500, 500, 'group');
		const mixed = make_canvas([a, g]);
		mixed.selection.add(a);
		mixed.selection.add(g);
		ungroup_selection(mixed);
		expect(mixed.removed).toEqual(['g']);
		expect(mixed.nodes.has('a')).toBe(true);
		expect(selected_ids(mixed)).toEqual([]);
		expect(mixed.saves).toBe(1);
	});

	it('does nothing when no group is selected', () => {
		canvas.selectOnly(a);
		ungroup_selection(canvas);
		expect(canvas.removed).toEqual([]);
		expect(canvas.saves).toBe(0);
	});
});

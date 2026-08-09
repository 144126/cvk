import { describe, expect, it } from 'vitest';
import { new_node_rect, overlaps, type rect } from '../canvas_ops';

const from: rect = { id: 'a', x: 0, y: 0, width: 100, height: 50 };
const size = { width: 250, height: 60 };

describe('overlaps', () => {
	it('is true when two boxes share area', () => {
		expect(overlaps({ x: 0, y: 0, width: 100, height: 100 }, { x: 50, y: 50, width: 100, height: 100 })).toBe(true);
	});

	it('is false when two boxes only touch edges', () => {
		expect(overlaps({ x: 0, y: 0, width: 100, height: 100 }, { x: 100, y: 0, width: 100, height: 100 })).toBe(false);
	});

	it('is false when two boxes are apart', () => {
		expect(overlaps({ x: 0, y: 0, width: 10, height: 10 }, { x: 500, y: 500, width: 10, height: 10 })).toBe(false);
	});
});

describe('new_node_rect', () => {
	it('places the new node one gap to the right, vertically centred', () => {
		expect(new_node_rect([from], from, 'right', size, 50)).toEqual({ x: 150, y: -5, width: 250, height: 60 });
	});

	it('places the new node one gap to the left', () => {
		expect(new_node_rect([from], from, 'left', size, 50)).toEqual({ x: -300, y: -5, width: 250, height: 60 });
	});

	it('places the new node one gap below, horizontally centred', () => {
		expect(new_node_rect([from], from, 'down', size, 50)).toEqual({ x: -75, y: 100, width: 250, height: 60 });
	});

	it('places the new node one gap above', () => {
		expect(new_node_rect([from], from, 'up', size, 50)).toEqual({ x: -75, y: -110, width: 250, height: 60 });
	});

	it('honours a different gap', () => {
		expect(new_node_rect([from], from, 'right', size, 0)).toEqual({ x: 100, y: -5, width: 250, height: 60 });
	});

	it('strides past an occupied spot', () => {
		const blocker: rect = { id: 'b', x: 150, y: -5, width: 250, height: 60 };
		expect(new_node_rect([from, blocker], from, 'right', size, 50)).toEqual({ x: 450, y: -5, width: 250, height: 60 });
	});

	it('strides past two occupied spots in a row', () => {
		const one: rect = { id: 'b', x: 150, y: -5, width: 250, height: 60 };
		const two: rect = { id: 'c', x: 450, y: -5, width: 250, height: 60 };
		expect(new_node_rect([from, one, two], from, 'right', size, 50).x).toBe(750);
	});

	it('ignores a node that is out of the way', () => {
		const aside: rect = { id: 'b', x: 150, y: 900, width: 250, height: 60 };
		expect(new_node_rect([from, aside], from, 'right', size, 50).x).toBe(150);
	});
});

import { describe, expect, it } from 'vitest';
import { bounding_box, connect_chain, move_box, next_color, resize_box, type rect } from '../canvas_ops';

const box = { x: 10, y: 20, width: 100, height: 50 };

describe('move_box', () => {
	it('shifts by the step in each direction', () => {
		expect(move_box(box, 'right', 50)).toEqual({ x: 60, y: 20 });
		expect(move_box(box, 'left', 50)).toEqual({ x: -40, y: 20 });
		expect(move_box(box, 'down', 50)).toEqual({ x: 10, y: 70 });
		expect(move_box(box, 'up', 50)).toEqual({ x: 10, y: -30 });
	});

	it('leaves the box alone when the step is zero', () => {
		expect(move_box(box, 'right', 0)).toEqual({ x: 10, y: 20 });
	});
});

describe('resize_box', () => {
	it('grows width to the right and height downward', () => {
		expect(resize_box(box, 'right', 50, 50)).toEqual({ width: 150, height: 50 });
		expect(resize_box(box, 'down', 50, 50)).toEqual({ width: 100, height: 100 });
	});

	it('shrinks width to the left and height upward', () => {
		expect(resize_box(box, 'left', 40, 50)).toEqual({ width: 60, height: 50 });
		expect(resize_box(box, 'up', 20, 10)).toEqual({ width: 100, height: 30 });
	});

	it('never shrinks below the minimum', () => {
		expect(resize_box(box, 'left', 500, 50)).toEqual({ width: 50, height: 50 });
		expect(resize_box(box, 'up', 500, 50)).toEqual({ width: 100, height: 50 });
	});
});

describe('next_color', () => {
	it('steps from no colour into the first one', () => {
		expect(next_color('')).toBe('1');
	});

	it('steps through the palette', () => {
		expect(next_color('1')).toBe('2');
		expect(next_color('5')).toBe('6');
	});

	it('wraps off the end back to no colour', () => {
		expect(next_color('6')).toBe('');
	});

	it('treats a custom hex colour as unset', () => {
		expect(next_color('#ff0000')).toBe('1');
	});
});

describe('bounding_box', () => {
	it('wraps every box with padding', () => {
		const boxes = [
			{ x: 0, y: 0, width: 100, height: 50 },
			{ x: 300, y: 300, width: 100, height: 50 },
		];
		expect(bounding_box(boxes, 20)).toEqual({ x: -20, y: -20, width: 440, height: 390 });
	});

	it('wraps a single box', () => {
		expect(bounding_box([{ x: 10, y: 10, width: 10, height: 10 }], 5)).toEqual({ x: 5, y: 5, width: 20, height: 20 });
	});
});

describe('connect_chain', () => {
	it('links consecutive nodes in reading order', () => {
		const nodes: rect[] = [
			{ id: 'c', x: 0, y: 300, width: 10, height: 10 },
			{ id: 'a', x: 0, y: 0, width: 10, height: 10 },
			{ id: 'b', x: 300, y: 0, width: 10, height: 10 },
		];
		expect(connect_chain(nodes)).toEqual([
			['a', 'b'],
			['b', 'c'],
		]);
	});

	it('returns nothing for fewer than two nodes', () => {
		expect(connect_chain([{ id: 'a', x: 0, y: 0, width: 10, height: 10 }])).toEqual([]);
		expect(connect_chain([])).toEqual([]);
	});
});

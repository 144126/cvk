import { describe, expect, it } from 'vitest';
import { nearest_in_direction, type rect } from '../canvas_ops';

const a: rect = { id: 'a', x: 0, y: 0, width: 100, height: 50 };
const b: rect = { id: 'b', x: 300, y: 0, width: 100, height: 50 };
const c: rect = { id: 'c', x: 0, y: 300, width: 100, height: 50 };
const d: rect = { id: 'd', x: 300, y: 300, width: 100, height: 50 };
const grid = [a, b, c, d];

describe('nearest_in_direction', () => {
	it('picks the node straight ahead over the diagonal one', () => {
		expect(nearest_in_direction(grid, a, 'right')).toBe('b');
		expect(nearest_in_direction(grid, a, 'down')).toBe('c');
		expect(nearest_in_direction(grid, d, 'left')).toBe('c');
		expect(nearest_in_direction(grid, d, 'up')).toBe('b');
	});

	it('returns null when nothing lies that way', () => {
		expect(nearest_in_direction(grid, a, 'left')).toBe(null);
		expect(nearest_in_direction(grid, a, 'up')).toBe(null);
	});

	it('ignores the node it starts from', () => {
		expect(nearest_in_direction([a], a, 'right')).toBe(null);
	});

	it('prefers the closer node along the axis', () => {
		const near: rect = { id: 'near', x: 150, y: 0, width: 100, height: 50 };
		expect(nearest_in_direction([a, near, b], a, 'right')).toBe('near');
	});

	it('penalises sideways drift so a far aligned node beats a near skewed one', () => {
		const skewed: rect = { id: 'skewed', x: 150, y: 400, width: 100, height: 50 };
		expect(nearest_in_direction([a, skewed, b], a, 'right')).toBe('b');
	});

	it('breaks exact ties on the smaller id', () => {
		const up: rect = { id: 'zz', x: 300, y: -300, width: 100, height: 50 };
		const down: rect = { id: 'aa', x: 300, y: 300, width: 100, height: 50 };
		expect(nearest_in_direction([a, up, down], a, 'right')).toBe('aa');
	});

	it('returns null on an empty canvas', () => {
		expect(nearest_in_direction([], a, 'right')).toBe(null);
	});
});

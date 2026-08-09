import { describe, expect, it } from 'vitest';
import { center, reading_order, step_focus, type rect } from '../canvas_ops';

const a: rect = { id: 'a', x: 0, y: 0, width: 100, height: 50 };
const b: rect = { id: 'b', x: 300, y: 0, width: 100, height: 50 };
const c: rect = { id: 'c', x: 0, y: 300, width: 100, height: 50 };
const nodes = [c, b, a];

describe('center', () => {
	it('returns the middle of a box', () => {
		expect(center(a)).toEqual({ x: 50, y: 25 });
	});
});

describe('reading_order', () => {
	it('sorts top to bottom then left to right', () => {
		expect(reading_order(nodes).map((n) => n.id)).toEqual(['a', 'b', 'c']);
	});

	it('breaks ties on id so the order is stable', () => {
		const z: rect = { id: 'z', x: 0, y: 0, width: 10, height: 10 };
		const y: rect = { id: 'y', x: 0, y: 0, width: 10, height: 10 };
		expect(reading_order([z, y]).map((n) => n.id)).toEqual(['y', 'z']);
	});

	it('does not mutate the input', () => {
		const input = [c, b, a];
		reading_order(input);
		expect(input.map((n) => n.id)).toEqual(['c', 'b', 'a']);
	});
});

describe('step_focus', () => {
	it('moves forward through reading order', () => {
		expect(step_focus(nodes, 'a', 1)).toBe('b');
		expect(step_focus(nodes, 'b', 1)).toBe('c');
	});

	it('wraps forward past the last node', () => {
		expect(step_focus(nodes, 'c', 1)).toBe('a');
	});

	it('moves backward and wraps', () => {
		expect(step_focus(nodes, 'b', -1)).toBe('a');
		expect(step_focus(nodes, 'a', -1)).toBe('c');
	});

	it('starts at the first node when nothing is focused', () => {
		expect(step_focus(nodes, null, 1)).toBe('a');
	});

	it('starts at the last node when stepping backward from nothing', () => {
		expect(step_focus(nodes, null, -1)).toBe('c');
	});

	it('falls back to the first node for an unknown id', () => {
		expect(step_focus(nodes, 'gone', 1)).toBe('a');
	});

	it('returns null on an empty canvas', () => {
		expect(step_focus([], null, 1)).toBe(null);
	});
});

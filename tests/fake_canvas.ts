export function make_node(id: string, x: number, y: number, width = 100, height = 50, type = 'text'): any {
	const n: any = { id, x, y, width, height, color: '', type, editing: false };
	n.moveTo = (p: { x: number; y: number }) => {
		n.x = p.x;
		n.y = p.y;
	};
	n.resize = (s: { width: number; height: number }) => {
		n.width = s.width;
		n.height = s.height;
	};
	n.setColor = (c: string) => {
		n.color = c;
	};
	n.isEditable = () => n.type !== 'group';
	n.startEditing = () => {
		n.editing = true;
	};
	n.getBBox = () => ({ minX: n.x, minY: n.y, maxX: n.x + n.width, maxY: n.y + n.height });
	n.getData = () => ({ id: n.id, type: n.type, x: n.x, y: n.y, width: n.width, height: n.height });
	return n;
}

export function make_canvas(nodes: any[] = []): any {
	const c: any = {
		nodes: new Map<string, any>(nodes.map((n) => [n.id, n])),
		edges: new Map<string, any>(),
		selection: new Set<any>(),
		config: { defaultTextNodeDimensions: { width: 250, height: 60 } },
		wrapperEl: { focus: () => (c.focused = true) },
		focused: false,
		saves: 0,
		panned: [] as any[],
		imported: [] as any[],
		removed: [] as string[],
		deleted: false,
		made: 0,
	};
	c.center = { x: 0, y: 0 };
	c.posCenter = () => c.center;
	c.selectOnly = (n: any) => {
		c.selection.clear();
		c.selection.add(n);
	};
	c.deselectAll = () => c.selection.clear();
	c.panIntoView = (b: any) => c.panned.push(b);
	c.requestSave = () => (c.saves += 1);
	c.importData = (data: any) => {
		c.imported.push(data);
		for (const e of data.edges || []) c.edges.set(e.id, e);
	};
	c.createTextNode = (o: any) => {
		const n = make_node('new' + c.made++, o.pos.x, o.pos.y, o.size.width, o.size.height, 'text');
		c.nodes.set(n.id, n);
		c.selectOnly(n);
		n.startEditing();
		return n;
	};
	c.createGroupNode = (o: any) => {
		const n = make_node('grp' + c.made++, o.pos.x, o.pos.y, o.size.width, o.size.height, 'group');
		c.nodes.set(n.id, n);
		return n;
	};
	c.removeNode = (n: any) => {
		c.nodes.delete(n.id);
		c.removed.push(n.id);
	};
	c.deleteSelection = () => {
		for (const n of Array.from(c.selection) as any[]) c.nodes.delete(n.id);
		c.selection.clear();
		c.deleted = true;
	};
	return c;
}

export function selected_ids(canvas: any): string[] {
	return (Array.from(canvas.selection) as any[]).map((n) => n.id);
}

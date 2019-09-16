const selection = figma.currentPage.selection;

interface ConstrainedLayoutMixin extends ConstraintMixin, LayoutMixin {}

function isLayoutMixin(node: BaseNode):Boolean {
  return (node as LayoutMixin).resize !== undefined;
}

function isConstrainedLayoutMixin(node: BaseNode):Boolean {
  return isLayoutMixin(node) && (node as ConstraintMixin).constraints !== undefined;
}

let note = null;

const CommandHorizontal = "h";
const CommandVertical = "v";

if (selection.length > 0) {
  let unframed:SceneNode[] = [];
  selection.forEach(node => {
    if (isConstrainedLayoutMixin(node)) {
      const cl = node as ConstrainedLayoutMixin;
      if (isLayoutMixin(node.parent)) {
        const container = node.parent as DefaultContainerMixin;
				const cs = cl.constraints;
        switch (figma.command) {
					case CommandHorizontal: {
						cl.resize(container.width, cl.height);
						cl.x = 0;
						break;
					}
					case CommandVertical: {
						cl.resize(cl.width, container.height);
						cl.y = 0;
						break;
					}
					default: {
						cl.resize(container.width, container.height);
						cl.x = cl.y = 0;
						break;
					}
				}
        switch (figma.command) {
					case CommandHorizontal: if (cs.horizontal == "MIN") cl.constraints = { horizontal: "STRETCH", vertical: cs.vertical }; break;
					case CommandVertical: if (cs.vertical == "MIN") cl.constraints = { horizontal: cs.horizontal, vertical: "STRETCH" }; break;
					default: if (cs.horizontal == "MIN" && cs.vertical == "MIN") cl.constraints = { horizontal: "STRETCH", vertical: "STRETCH" }; break;
				}
      } else {
        unframed.push(node);
      }
    }
  });
  switch (unframed.length) {
    case 0: break;
    case 1: note = `${unframed[0].name} isn't`; break;
    case 2: case 3: case 4:
      note = `${unframed.slice(0, unframed.length - 1).map((node) => node.name).join(', ')} and ${unframed[unframed.length - 1].name} aren't`;
      break;
    default: note = `${unframed.length} elements aren't`; break;
  }
  if (unframed.length > 0) figma.currentPage.selection = unframed;
  if (note) note += " inside a container";
} else {
  note = 'Select something';
}

if (note) figma.notify(note);

figma.closePlugin();
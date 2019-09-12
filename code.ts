const selection = figma.currentPage.selection;

interface ConstrainedLayoutMixin extends ConstraintMixin, LayoutMixin {}

function isLayoutMixin(node: BaseNode):Boolean {
  return (node as LayoutMixin).resize !== undefined;
}

function isConstrainedLayoutMixin(node: BaseNode):Boolean {
  return isLayoutMixin(node) && (node as ConstraintMixin).constraints !== undefined;
}

let note = null;

if (selection.length > 0) {
  let unframed:SceneNode[] = [];
  selection.forEach(node => {
    if (isConstrainedLayoutMixin(node)) {
      const clNode = node as ConstrainedLayoutMixin;
      if (isLayoutMixin(node.parent)) {
        const container = node.parent as DefaultContainerMixin;
        clNode.x = clNode.y = 0;
        clNode.resize(container.width, container.height);
        const cs = clNode.constraints;
        if (cs.horizontal == "MIN" && cs.vertical == "MIN") {
          clNode.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
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
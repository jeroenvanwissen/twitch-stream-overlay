/**
 * Creates a new HTML element of the specified type and assigns the given ID to it.
 * @param type - The type of the HTML element to create.
 * @param id - The ID to assign to the new element.
 * @param unique - Whether to use an existing element with the specified ID if it already exists.
 * @returns An object with four methods:
 *   - `addClasses`: A function that adds the specified CSS class names to the element's class list and returns the next 3 functions.
 *   - `appendTo`: A function that appends the element to a parent element and returns the element.
 *   - `prependTo`: A function that prepends the element to a parent element and returns the element.
 *   - `get`: A function that returns the element.
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  type: K,
  id: string,
  unique?: boolean,
) => {
  let el: HTMLElementTagNameMap[K];

  if (unique) {
    el = (document.getElementById(id) ??
      document.createElement(type)) as HTMLElementTagNameMap[K];
  } else {
    el = document.createElement(type);
  }
  el.id = id;

  return {
    addClasses: (names: string[]) => addClasses(el, names),
    appendTo: <T extends Element>(parent: T) => {
      parent.appendChild(el);
      return el;
    },
    prependTo: <T extends Element>(parent: T) => {
      parent.prepend(el);
      return el;
    },
    get: () => el,
  };
};

/**
 * Adds the specified CSS class names to the given element's class list.
 *
 * @param el - The element to add the classes to.
 * @param names - An array of CSS class names to add.
 * @returns An object with three methods:
 *   - `appendTo`: A function that appends the element to a parent element and returns the element.
 *   - `prependTo`: A function that prepends the element to a parent element and returns the element.
 *   - `get`: A function that returns the element.
 * @template T - The type of the element to add the classes to.
 */
export const addClasses = <T extends Element>(el: T, names: string[]) => {
  for (const name of names.filter(Boolean)) {
    el.classList?.add(name.trim());
  }
  return {
    appendTo: <T extends Element>(parent: T) => {
      parent.appendChild(el);
      return el;
    },
    prependTo: <T extends Element>(parent: T) => {
      parent.prepend(el);
      return el;
    },
    addClasses: (names: string[]) => addClasses(el, names),
    get: () => el,
  };
};

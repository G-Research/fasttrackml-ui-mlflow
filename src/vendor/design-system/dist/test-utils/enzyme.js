import { s as selectClasses, c as createMarkdownTable } from '../common-1fb3eeb9.js';
import { act } from 'react-dom/test-utils';

// eslint-disable-next-line @databricks/no-restricted-imports-regexp
/**
 * Finds a single element that contains the specified text in the wrapper. If
 * there are 0 or more than 1 element that contains the specified text, an error
 * is thrown. Returns the element in an enzyme wrapper.
 */
function findByText(wrapper, text, queryOptions) {
  const newWrappers = findAllByText(wrapper, text, queryOptions);
  if (newWrappers.length !== 1) {
    throw new Error(`Expected to find 1 node but found ${newWrappers.length} nodes for text "${text}".\n${wrapper.debug()}`);
  }
  return newWrappers[0];
}

/**
 * Finds all elements that contain the specified text. To avoid duplicate results,
 * only the parents of text nodes are returned.
 */
function findAllByText(wrapper, text) {
  let {
    trim = false
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const textNodes = wrapper.findWhere(n => {
    if (n.type() !== undefined) {
      return false;
    }
    let nodeText = n.text();
    if (trim) {
      nodeText = nodeText.trim();
    }
    return typeof text === 'string' ? nodeText === text : text.test(nodeText);
  });
  const newWrappers = textNodes.map(n => {
    const textNodeParent = n.parents().first();
    if (textNodeParent.name() === 'FormattedMessage') {
      // Try not to return FormattedMessage since it breaks `simulate` due to a bug in `enzyme-adapter-react-17`
      // Similar to https://github.com/wojtekmaj/enzyme-adapter-react-17/issues/45
      const formattedMessageParents = textNodeParent.parents();
      return formattedMessageParents.length > 0 ? formattedMessageParents.first() : textNodeParent;
    } else {
      return textNodeParent;
    }
  });
  return newWrappers;
}

// We need to keep ref to original setTimeout to avoid SinonJS fake timers if enabled
const originalSetTimeout = window.setTimeout;

/**
 * This is so the stack trace the developer sees is one that's
 * closer to their code (because async stack traces are hard to follow).
 *
 * The code is taken from
 * https://github.com/testing-library/dom-testing-library/blob/f7b5c33c44632fba
 * 1579cb44f9f175be1ec46087/src/wait-for.js#L15-L19
 */
function copyStackTrace(target, source) {
  // eslint-disable-next-line no-param-reassign
  target.stack = source.stack.replace(source.message, target.message);
}
/**
 * Run an expectation until it succeeds or reaches the timeout. The timeout of 1500ms
 * is chosen to be under the default Karma test timeout of 2000ms. This function will
 * not work properly if fake timers are being used (since it expects the real setTimeout).
 *
 * The code is taken from
 * https://github.com/TheBrainFamily/wait-for-expect/blob/master/src/index.ts,
 * with slight modifications to support Karma (instead of Jest).
 *
 *
 * Example
 * The <App /> component does not render the header synchronously.
 * Therefore, we cannot check that the wrapper's text is equal to the string
 * immediately--this assertion will fail and cause the test to fail. To
 * remediate this issue, we can run the expectation until it succeeds:
 *
 * function App() {
 *   const [value, setValue] = useState(null);
 *   useEffect(() => {
 *     const timeoutId = setTimeout(() => setValue("some value"), 100);
 *     return () => clearTimeout(timeoutId);
 *   }, []);
 *   return value === null ? null : <h1>The value is: {value}</h1>;
 * }
 *
 * it('renders value', async () => {
 *   const wrapper = mount(<App />);
 *   await waitFor(() =>
 *     wrapper.update();
 *     expect(wrapper.text()).to.equal("The value is: some value")
 *   );
 * });
 */
function _waitFor(f) {
  let {
    interval = 50,
    stackTraceError,
    timeout = 1500
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const maxTries = Math.ceil(timeout / interval);
  let tries = 0;
  return new Promise((resolve, reject) => {
    const rejectOrRerun = error => {
      if (tries > maxTries) {
        if (stackTraceError !== undefined) {
          copyStackTrace(error, stackTraceError);
        }
        reject(error);
        return;
      }
      originalSetTimeout(runExpectation, interval);
    };
    function runExpectation() {
      tries += 1;
      try {
        Promise.resolve(f()).then(resolve).catch(rejectOrRerun);
      } catch (error) {
        // @ts-expect-error ts-migrate(2571) Object is of type 'unknown'
        rejectOrRerun(error);
      }
    }
    originalSetTimeout(runExpectation, 0);
  });
}

/**
 * Wraps `_waitFor` in React's `act` testing utility. Used when the React component
 * updates during the execution of the callback (either because of indirect effects
 * being run or because of direct requests to update the component, like wrapper.update).
 * Prevents updates related to the callback from being affected by other updates
 * and more closely mimics how React runs in the browser. See
 * https://reactjs.org/docs/test-utils.html#act for more info on `act`.
 */
async function waitFor(callback, options) {
  let result;
  // See https://github.com/testing-library/dom-testing-library/blob/f7b5c33c44
  // 632fba1579cb44f9f175be1ec46087/src/wait-for.js#L182-L184
  const stackTraceError = new Error('STACK_TRACE_ERROR');
  await act(async () => {
    result = await _waitFor(callback, {
      stackTraceError,
      ...options
    });
  });

  // @ts-expect-error: either `waitFor` will throw or `result` will be assigned
  return result;
}

/**
 * Finds all elements (that are rendered in the DOM) in `wrapper` that have an explicit
 * role of `role` specified. This is similar to `getAllByRole` from @testing-library/react
 * but is much simpler because of the shortcomings of Enzyme's API.
 */
function findAllByRole(wrapper, role) {
  return wrapper.find(`[role="${role}"]`).hostNodes().map(n => n);
}

// eslint-disable-next-line @databricks/no-restricted-imports-regexp

/**
 * Clicks on the "Clear" button. In order for this function to work properly,
 * the `allowClear` prop must be set to `true`.
 */
function clearAll(getSelect) {
  getSelect().find(`.${selectClasses.clear}`).hostNodes().simulate('mousedown');
}

/**
 * Closes the dropdown menu for the <Select/> by clicking. Will throw an error if
 * the menu is already closed or if the menu is unable to be closed.
 */
async function closeMenu(getSelect) {
  if (!getSelect().find(`.${selectClasses.open}`).exists()) {
    throw new Error(`Select is already closed\n${getSelect().debug()}`);
  }
  getSelect().find(`.${selectClasses.selector}`).simulate('mousedown');
  await waitFor(() => {
    const select = getSelect();
    if (select.find(`.${selectClasses.open}`).exists()) {
      throw new Error(`Select did not close\n${select.debug()}`);
    }
  });
}

/**
 * Returns a string concatenating the labels for all selected options.
 */
function getLabelText(getSelect) {
  // Trim the text to avoid weird whitespace issues non-label elements being added.
  // For example, the input mirror is an empty span with some whitespace that is
  // nested under the selector but does not show up in the label text.
  return getSelect().find(`.${selectClasses.selector}`).text().trim();
}

/**
 * Selects options from the dropdown menu for a <Select/> component with `mode="multiple"`.
 * The provided strings must match the option labels exactly. There is a known
 * limitation for lists that are extremely long because AntD virtualizes the
 * options so not all may options may be rendered in the DOM. If this is causing
 * you issues, please let #help-frontend know.
 */
async function multiSelect(getSelect, options) {
  await openMenu(getSelect);
  options.forEach(option => {
    findByText(getSelect().find(`.${selectClasses.list}`), option).simulate('click');
  });
  // Close the menu to indicate that selection has finished
  await closeMenu(getSelect);
}

/**
 * Selects options from the dropdown menu for a <Select/> component without a
 * mode. The provided string must match an option label exactly. There is a known
 * limitation for lists that are extremely long because AntD virtualizes the
 * options so not all may options may be rendered in the DOM. If this is causing
 * you issues, please let #help-frontend know.
 */
async function singleSelect(getSelect, option) {
  await openMenu(getSelect);
  findByText(getSelect().find(`.${selectClasses.list}`), option).simulate('click');
  // Menu automatically closes for a single <Select/> (no mode="multiple")
}

/**
 * Opens the dropdown menu for the <Select/> by clicking. Will throw an error if
 * the menu is already opened or if the menu is unable to be opened.
 */
async function openMenu(getSelect) {
  if (getSelect().find(`.${selectClasses.open}`).exists()) {
    throw new Error(`Select is already open\n${getSelect().debug()}`);
  }
  getSelect().find(`.${selectClasses.selector}`).simulate('mousedown');
  await waitFor(() => {
    const select = getSelect();
    if (!select.find(`.${selectClasses.open}`).exists()) {
      throw new Error(`Select did not open\n${select.debug()}`);
    }
  });
}

/**
 * Opens the dropdown menu, finds all of the options in the dropdown, closes
 * the menu, and returns a list of the text of each option in order.
 */
async function getAllOptions(getSelect) {
  await openMenu(getSelect);
  const options = getSelect().find(`.${selectClasses.list}`).find(`.${selectClasses.option}`).map(option => option.text());
  await closeMenu(getSelect);
  return options;
}

var selectEvent = /*#__PURE__*/Object.freeze({
  __proto__: null,
  clearAll: clearAll,
  closeMenu: closeMenu,
  getLabelText: getLabelText,
  multiSelect: multiSelect,
  singleSelect: singleSelect,
  openMenu: openMenu,
  getAllOptions: getAllOptions
});

// eslint-disable-next-line @databricks/no-restricted-imports-regexp

/**
 * Returns the table row that contains the specified `cellText`. The `cellText`
 * must be in the column with name `columnHeaderName` if it is specified. Otherwise,
 * the `cellText` must be in the first column. Throws an error if either multiple
 * rows or no rows can be found that match the given options. Also throws an error
 * if the column with name `columnHeaderName` cannot be found.
 *
 * @param tableWrapper The ReactWrapper containing the table to query in.
 * @param cellText The cell text that uniquely identifies the row.
 * @param columnHeaderName The name of the column to search the text for. If not provided,
 * the first column will be used.
 */
function getTableRowByCellText(tableWrapper, cellText) {
  let {
    columnHeaderName
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let columnHeaderIndex;
  if (columnHeaderName === undefined) {
    columnHeaderIndex = 0;
  } else {
    const columnHeaders = findAllByRole(tableWrapper, 'columnheader');
    columnHeaderIndex = columnHeaders.findIndex(n => {
      try {
        findByText(n, columnHeaderName);
        return true;
      } catch {
        return false;
      }
    });
    if (columnHeaderIndex === -1) {
      throw new Error(`Unable to find a column with name "${columnHeaderName}"\n${tableWrapper.debug()}`);
    }
  }
  const matchingRows = findAllByRole(tableWrapper, 'row')
  // Skip first row (table header)
  .slice(1).filter(row => {
    const cells = findAllByRole(row, 'cell');
    const cell = cells[columnHeaderIndex];
    try {
      findByText(cell, cellText);
      return true;
    } catch {
      return false;
    }
  });
  if (matchingRows.length === 0) {
    throw new Error(`Unable to find a table row with text "${cellText}" in the column "${columnHeaderName}"\n${tableWrapper.debug()}`);
  }
  if (matchingRows.length > 1) {
    throw new Error(`Found multiple table rows with text "${cellText}" in the column "${columnHeaderName}"\n${tableWrapper.debug()}`);
  }
  return matchingRows[0].hostNodes();
}

/**
 * Converts a Du Bois table to a markdown table string. This means that each cell
 * is separated by a pipe (including the edges), the header row is on its own line
 * at the top, each data row is on its own line below, and the header row is separated
 * by a row of dashes from the data rows. This is useful for checking table contents
 * in tests.
 *
 * @param tableWrapper The ReactWrapper containing the table to query in.
 *
 * @example
 * The HTML table:
 * ```jsx
 *   <Table>
 *     <TableRow isHeader>
 *       <TableHeader>Name</TableHeader>
 *       <TableHeader>Fruit</TableHeader>
 *     </TableRow>
 *     <TableRow>
 *       <TableCell>Alice</TableCell>
 *       <TableCell>Apple</TableCell>
 *     </TableRow>
 *     <TableRow>
 *       <TableCell>Brady</TableCell>
 *       <TableCell>Banana</TableCell>
 *     </TableRow>
 *   </Table>
 * ```
 *
 * The Markdown table:
 * ```md
 *   | Name | Fruit |
 *   | --- | --- |
 *   | Alice | Apple |
 *   | Brady | Banana |
 * ```
 */
function toMarkdownTable(tableWrapper) {
  const {
    bodyRows,
    headerRow
  } = getTableRows(tableWrapper);
  const columns = findAllByRole(headerRow, 'columnheader').map(column => column.text());
  const rows = bodyRows.map(row => findAllByRole(row, 'cell').map(cell => cell.text()));
  return createMarkdownTable(columns, rows);
}

/**
 * Returns the header row and all body rows (non-header rows) in order. Assumes that the
 * `tableWrapper` has a single header row (as the first row) and the rest of the rows are
 * body rows.
 *
 * @param tableWrapper The ReactWrapper containing the table to query in.
 */
function getTableRows(tableWrapper) {
  const [firstRow, ...restRows] = findAllByRole(tableWrapper, 'row');
  return {
    bodyRows: restRows,
    headerRow: firstRow
  };
}

// eslint-disable-next-line @databricks/no-restricted-imports-regexp

/**
 * Open a dropdown menu by simulating a pointerDown event on the dropdown button.
 *
 * @param dropdownButton - The Dropdown Trigger button that opens the menu when clicked.
 */
const openDropdownMenu = dropdownButton => {
  dropdownButton.hostNodes().simulate('pointerDown', {
    button: 0,
    ctrlKey: false
  });
};

export { getTableRowByCellText, getTableRows, openDropdownMenu, selectEvent, toMarkdownTable };
//# sourceMappingURL=enzyme.js.map

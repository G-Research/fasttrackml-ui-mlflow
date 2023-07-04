import userEvent from '@testing-library/user-event';
import { waitFor, screen, within, queryHelpers } from '@testing-library/react';
import { s as selectClasses, c as createMarkdownTable } from '../common-1fb3eeb9.js';

/**
 * Opens the dropdown menu for the <Select/> by clicking. Will throw an error if
 * the menu is already opened or if the menu is unable to be opened.
 */
async function openMenu(select) {
  if (select.classList.contains(selectClasses.open)) {
    throw new Error(`Select is already open\n${select.innerHTML}`);
  }
  const selector = select.querySelector(`.${selectClasses.selector}`);
  if (!selector) {
    throw new Error(`Selector not found\n${select.innerHTML}`);
  }
  await userEvent.click(selector, {
    pointerEventsCheck: 0
  });
  await waitFor(() => {
    if (!select.classList.contains(selectClasses.open)) {
      throw new Error(`Select did not open\n${select.innerHTML}`);
    }
  });
}

/**
 * Closes the dropdown menu for the <Select/> by clicking. Will throw an error if
 * the menu is already closed or if the menu is unable to be closed.
 */
async function closeMenu(select) {
  if (!select.classList.contains(selectClasses.open)) {
    throw new Error(`Select is already closed\n${select.innerHTML}`);
  }
  const selector = select.querySelector(`.${selectClasses.selector}`);
  if (!selector) {
    throw new Error(`Selector not found\n${select.innerHTML}`);
  }
  await userEvent.click(selector, {
    pointerEventsCheck: 0
  });
  await waitFor(() => {
    if (select.classList.contains(selectClasses.open)) {
      throw new Error(`Select did not close\n${select.innerHTML}`);
    }
  });
}

/**
 * Returns a string concatenating the labels for all selected options.
 */
function getLabelText(select) {
  var _selector$textContent, _selector$textContent2;
  const selector = select.querySelector(`.${selectClasses.selector}`);
  if (!selector) {
    throw new Error(`Selector not found\n${select.innerHTML}`);
  }
  // Trim the text to avoid weird whitespace issues non-label elements being added.
  // For example, the input mirror is an empty span with some whitespace that is
  // nested under the selector but does not show up in the label text.
  return (_selector$textContent = (_selector$textContent2 = selector.textContent) === null || _selector$textContent2 === void 0 ? void 0 : _selector$textContent2.trim()) !== null && _selector$textContent !== void 0 ? _selector$textContent : '';
}

/**
 * Selects options from the dropdown menu for a <Select/> component with `mode="multiple"`.
 * The provided strings must match the option labels exactly. There is a known
 * limitation for lists that are extremely long because AntD virtualizes the
 * options so not all may options may be rendered in the DOM. If this is causing
 * you issues, please let #help-frontend know.
 */
async function multiSelect(select, options) {
  await openMenu(select);
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const optionItem = screen.getByTitle(option);
    await userEvent.click(optionItem, {
      pointerEventsCheck: 0
    });
  }
  // Close the menu to indicate that selection has finished
  await closeMenu(select);
}

/**
 * Selects options from the dropdown menu for a <Select/> component without a
 * mode. The provided string must match an option label exactly. There is a known
 * limitation for lists that are extremely long because AntD virtualizes the
 * options so not all may options may be rendered in the DOM. If this is causing
 * you issues, please let #help-frontend know.
 */
async function singleSelect(select, option) {
  await openMenu(select);
  const optionElem = screen.getByTitle(option);
  await userEvent.click(optionElem, {
    pointerEventsCheck: 0
  });
  // Menu automatically closes for a single <Select/> (no mode="multiple")
}

/**
 * Clicks on the "Clear" button. In order for this function to work properly,
 * the `allowClear` prop must be set to `true`.
 */
async function clearAll(select) {
  const clearBtn = select.querySelector(`.${selectClasses.clear}`);
  if (!clearBtn) {
    throw new Error(`Select not clearable\n${select.innerHTML}`);
  }
  await userEvent.click(clearBtn);
}

/**
 * Opens the dropdown menu, finds all of the options in the dropdown, closes
 * the menu, and returns a list of the text of each option in order.
 */
async function getAllOptions(select) {
  await openMenu(select);
  const optionsList = select.ownerDocument.body.querySelector(`.${selectClasses.list}`);
  if (optionsList === null) {
    throw new Error(`Options list not found\n${select.ownerDocument.body.innerHTML}`);
  }
  const options = [];
  optionsList.querySelectorAll(`.${selectClasses.option}`).forEach(option => {
    if (option.textContent === null) {
      throw new Error(`Option had no text content\n${option.innerHTML}`);
    }
    options.push(option.textContent);
  });
  await closeMenu(select);
  return options;
}

var selectEvent = /*#__PURE__*/Object.freeze({
  __proto__: null,
  openMenu: openMenu,
  closeMenu: closeMenu,
  getLabelText: getLabelText,
  multiSelect: multiSelect,
  singleSelect: singleSelect,
  clearAll: clearAll,
  getAllOptions: getAllOptions
});

/**
 * Returns the table row that contains the specified `cellText`. The `cellText`
 * must be in the column with name `columnHeaderName` if it is specified. Otherwise,
 * the `cellText` must be in the first column. Throws an error if either multiple
 * rows or no rows can be found that match the given options. Also throws an error
 * if the column with name `columnHeaderName` cannot be found.
 *
 * @param tableElement The HTMLElement representing the table to query in. This is likely
 * a `<div role="table">` element, so it can be queried by `screen.getByRole('table')`.
 * @param cellText The cell text that uniquely identifies the row.
 * @param columnHeaderName The name of the column to search the text for. If not provided,
 * the first column will be used.
 */
function getTableRowByCellText(tableElement, cellText) {
  let {
    columnHeaderName
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let columnHeaderIndex;
  if (columnHeaderName === undefined) {
    columnHeaderIndex = 0;
  } else {
    var _columnHeader$parentE, _columnHeader$parentE2;
    const columnHeader = within(tableElement).getByRole('columnheader', {
      name: columnHeaderName
    });
    columnHeaderIndex = Array.from((_columnHeader$parentE = (_columnHeader$parentE2 = columnHeader.parentElement) === null || _columnHeader$parentE2 === void 0 ? void 0 : _columnHeader$parentE2.children) !== null && _columnHeader$parentE !== void 0 ? _columnHeader$parentE : []).indexOf(columnHeader);
  }
  const matchingRows = within(tableElement).getAllByRole('row')
  // Skip first row (table header)
  .slice(1).filter(row => {
    const cells = within(row).getAllByRole('cell');
    const cell = cells[columnHeaderIndex];
    const cellContainsText = within(cell).queryByText(cellText) !== null;
    return cellContainsText;
  });
  if (matchingRows.length === 0) {
    throw queryHelpers.getElementError(`Unable to find a table row with text "${cellText}" in the column "${columnHeaderName}"`, tableElement);
  }
  if (matchingRows.length > 1) {
    throw queryHelpers.getElementError(`Found multiple table rows with text "${cellText}" in the column "${columnHeaderName}"`, tableElement);
  }
  return matchingRows[0];
}

/**
 * Converts a Du Bois table to a markdown table string. This means that each cell
 * is separated by a pipe (including the edges), the header row is on its own line
 * at the top, each data row is on its own line below, and the header row is separated
 * by a row of dashes from the data rows. This is useful for checking table contents
 * in tests.
 *
 * @param tableElement The HTMLElement representing the table to query in. This is likely
 * a `<div role="table">` element, so it can be queried by `screen.getByRole('table')`.
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
function toMarkdownTable(tableElement) {
  const {
    bodyRows,
    headerRow
  } = getTableRows(tableElement);
  const columns = within(headerRow).getAllByRole('columnheader').map(column => {
    var _column$textContent;
    return (_column$textContent = column.textContent) !== null && _column$textContent !== void 0 ? _column$textContent : '';
  });
  const rows = bodyRows.map(row => within(row).getAllByRole('cell').map(cell => {
    var _cell$textContent;
    return (_cell$textContent = cell.textContent) !== null && _cell$textContent !== void 0 ? _cell$textContent : '';
  }));
  return createMarkdownTable(columns, rows);
}

/**
 * Returns the header row and all body rows (non-header rows) in order. Assumes that the
 * `tableElement` has a single header row (as the first row) and the rest of the rows are
 * body rows.
 *
 * @param tableElement The HTMLElement representing the table to query in. This is likely
 * a `<div role="table">` element, so it can be queried by `screen.getByRole('table')`.
 */
function getTableRows(tableElement) {
  const [firstRow, ...restRows] = within(tableElement).getAllByRole('row');
  return {
    bodyRows: restRows,
    headerRow: firstRow
  };
}

/**
 * Opens the dropdown menu by clicking on the dropdown button.
 *
 * @param dropdownButton - The Dropdown Trigger button that opens the menu when clicked.
 */
const openDropdownMenu = async dropdownButton => {
  await userEvent.type(dropdownButton, '{arrowdown}');
};

export { getTableRowByCellText, getTableRows, openDropdownMenu, selectEvent, toMarkdownTable };
//# sourceMappingURL=rtl.js.map

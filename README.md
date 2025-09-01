# OData People Table

## Overview

This project is a modern, client-side web application that demonstrates how to build a dynamic, interactive data table using a reusable JavaScript component. It fetches a complete dataset from a public OData service and then performs all pagination, sorting, and filtering operations directly in the browser.

The application displays a list of people from the public TripPin OData service and allows for server-side pagination, multi-level sorting, and multi-clause filtering.

## Features

-   **Client-Side Data Operations**: All pagination, sorting, and filtering is processed in the browser by the `TableManager` utility.
-   **Dynamic Table Rendering**: The table is built dynamically based on a JavaScript configuration object.
-   **Interactive UI**:
    -   Clean, responsive pagination controls.
-   **Reusable Component**: The core logic is encapsulated in the reusable `TableManager.js` class.
-   **Modern JavaScript**: Uses ES6 Modules, Classes, and `async/await` for clean, maintainable code.

## Running the Project

No build step or local server is required. Simply open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

```bash
# For example, on macOS:
open index.html
```

## Code Structure

-   `index.html`: The main entry point of the application.
-   `css/`: Contains all the stylesheets for the application, separated by concern (main layout, table, modal, etc.).
-   `js/app.js`: The main application "controller". It initializes the components and contains the core logic for fetching data from the OData API.
-   `js/managers/`: This directory holds the reusable components.
    -   `TableManager.js`: A component for managing the state and rendering of the data table.

## Reusable Component: `TableManager.js`

The `TableManager` is a self-contained, reusable utility for creating interactive tables from a local JavaScript array. It is designed to be completely decoupled from any specific data source.

-   **Role**: It takes a configuration object (containing the data, column definitions, etc.) and handles all the logic for rendering the table, processing user interactions, and displaying the correct data.
-   **Key Concept**: It performs all filtering, sorting, and pagination on the client side. When a user clicks a pagination button, the `TableManager` re-calculates which slice of the data to show and re-renders the table.
-   **Configuration**: The behavior of the table is controlled by the configuration object passed to its constructor. This includes:
    -   `data`: The full array of data objects to display.
    -   `columns`: An array defining the table columns, captions, and custom renderers.
    -   `rowsPerPage`: The number of items to show on each page.
    -   `filters`: An optional array of initial filters to apply.
    -   `sorters`: An optional array of initial sorters to apply.

This makes `TableManager` extremely versatile for any project that needs to display a collection of data in a table.
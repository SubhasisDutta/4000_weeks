# Life Expectancy Calculator - Chrome Extension

This repository contains a Chrome extension that calculates the approximate number of weeks remaining in your life based on your date of birth and your expected lifespan. The extension also remembers your inputs for convenience.

## Features

*   Calculates remaining weeks and hours based on Date of Birth (DOB) and Expected Lifespan.
*   Calculates the monetary worth of each remaining hour based on your current net worth.
*   Estimates your "Auto Income" (passive monthly income from net worth, based on a user-configurable annual return rate).
*   Calculates your "Monthly Expense" (difference between monthly spending and savings).
*   Determines your "Freedom Aim": the net worth required to cover your monthly expenses via passive income (based on a user-configurable annual return rate).
*   Displays a progress bar showing your current net worth against your "Freedom Aim".
*   Shows Today's Date and your Expected Day of Passing.
*   Inputs for:
    *   Date of Birth (DOB)
    *   Expected Lifespan (in years)
    *   Total Weekly Hours (customizable)
    *   Current Net Worth
    *   Month Total Spending
    *   Month Savings
    *   Annual Return Rate (%)
*   Option to show/hide calculation input fields for a cleaner view.
*   Saves all your inputs locally using `chrome.storage.local` for convenience.
*   User-friendly popup interface with input validation.
*   Calculations update in real-time as you type.

## Files and Structure

The extension is composed of the following files:

*   `manifest.json`: Defines the extension's properties, permissions (storage), and popup action.
*   `popup.html`: The HTML structure for the extension's popup interface.
*   `popup.js`: Contains the JavaScript logic for:
    *   Fetching and saving all user inputs (DOB, lifespan, weekly hours, net worth, spending, savings).
    *   Performing all calculations (remaining time, financial metrics, etc.).
    *   Managing the display of results, including the progress bar.
    *   Handling the toggle for input field visibility.
    *   Implementing real-time updates as input values change.
    *   Updating the popup display.
*   `style.css`: Provides basic styling for the popup.
*   `images/`: Contains placeholder icons for the extension (icon16.png, icon48.png, icon128.png).

## How to Install and Use

1.  **Download or Clone:**
    *   Download the files from this repository.
    *   Or, clone the repository: `git clone <repository_url>`

2.  **Open Chrome and go to Extensions:**
    *   Type `chrome://extensions` in the address bar and press Enter.
    *   Alternatively, click the three vertical dots (menu) in the top-right corner -> Extensions -> Manage Extensions.

3.  **Enable Developer Mode:**
    *   In the top-right corner of the Extensions page, toggle the "Developer mode" switch to ON.

4.  **Load Unpacked Extension:**
    *   Click the "Load unpacked" button that appears (usually on the top left).
    *   In the file dialog, navigate to the directory where you downloaded/cloned the extension files.
    *   Select the folder that directly contains `manifest.json` and the other extension files. Click "Select Folder" or "Open".

5.  **Using the Extension:**
    *   The "Life Expectancy Calculator" icon should now appear in your Chrome toolbar (you might need to click the puzzle piece icon to find it).
    *   Click the icon to open the popup.
    *   Enter your Date of Birth.
    *   Enter your Expected Lifespan (in years).
    *   The remaining weeks will be calculated and displayed. Your inputs will be saved for your next visit.

## Popup Preview

Below is an example of how the extension popup looks.

*(Note: Please replace `images/popup_preview.png` with an actual screenshot of the extension popup. You can upload your screenshot to the `images` folder and update the path here.)*

![Life Expectancy Calculator Popup Preview](images/popup_preview.png)

## Development Notes

*   The extension uses Manifest V3.
*   Placeholder icons are provided. You can replace them with your own designs in the `images` folder and update `manifest.json` if filenames change.
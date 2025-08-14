# Ichicomi JSON Processor

Web tool to descramble Ichicomi images from an episode JSON and export high-quality PNGs, zipped.

- Input: paste Ichicomi episode JSON (same structure as `Untitled-1.json`)
- Output: PNG files named `page_01.png`, `page_02.png`, ... and a ZIP
- Algorithm: 4x4 column-major grid, tiles 280x400, keep last 5px at right intact

## Run locally

- Double-click `run_server.bat` (Windows) to start a local server and open the app
- Or run manually (PowerShell/CMD):
  ```bat
  python -m http.server 8000
  ```
  Then open: `http://localhost:8000/ichicomi_json_processor.html`

## Usage

1. Open the page
2. Paste episode JSON
3. Parse JSON → Process All Images
4. Download ZIP

## Files
- `ichicomi_json_processor.html` – the app
- `run_server.bat` – start local server and open the app
- `Untitled-1.json` – sample JSON

## License
GPL-3.0 
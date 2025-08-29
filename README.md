# Ichicomi JSON Processor

Web tool to descramble Ichicomi images from an chapter URL and export high-quality PNGs, zipped.

- Input: paste Ichicomi chapter URL
- Output: PNG files named `page_01.png`, `page_02.png`, ... and a ZIP
- Algorithm: 4x4 column-major grid, tile dimensions: size/4 then rounded down to closest divisable by 8 number, the remainder is left as is

## Run locally

- Double-click `run_server.bat` (Windows) to start a local server and open the app
- Or run manually (PowerShell/CMD):

  ```bat
  python app.py
  ```

  Then open: `http://localhost:8000`

## Usage

1. Open the page
2. Paste chapter URL
3. Fetch Chapter → Process All Images
4. Download ZIP

## Files

- `ichicomi_json_processor.html` – the app
- `run_server.bat` – start local server and open the app
- `Untitled-1.json` – sample JSON

## License

GPL-3.0

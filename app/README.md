# PDF Compressor

A modern, client-side PDF compression tool built with React. Compress your PDF files directly in your browser without uploading them to any server.

## Features

- **Drag & Drop Upload**: Easy file upload with drag and drop support
- **Custom Target Size**: Set your desired file size in KB or MB
- **Quality Control**: Choose from High, Medium, or Low compression quality
- **Real Preview**: See a thumbnail preview of your PDF before compression
- **Progress Tracking**: Visual progress bar with status updates
- **Advanced Options**: Remove metadata, embedded fonts, and convert to grayscale
- **Accurate Results**: Multi-pass compression algorithm to achieve target size
- **Secure & Private**: All processing happens client-side, no data leaves your device

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- pdf-lib - PDF manipulation
- pdfjs-dist - PDF rendering and parsing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Upload a PDF**: Drag and drop your PDF file or click to browse
2. **Set Target Size**: Enter your desired file size (must be smaller than original)
3. **Choose Quality**: Select High, Medium, or Low compression quality
4. **Advanced Options** (optional): Toggle metadata removal, font removal, or grayscale
5. **Compress**: Click the "Compress PDF" button
6. **Download**: Once complete, download your compressed PDF

## Compression Algorithm

The app uses a multi-pass compression algorithm:

1. Parse the PDF using pdfjs-dist
2. Render each page to canvas at the selected DPI:
   - High: 150 DPI
   - Medium: 96 DPI
   - Low: 72 DPI
3. Export each page as JPEG with the selected quality:
   - High: 90%
   - Medium: 60%
   - Low: 30%
4. Reconstruct the PDF using pdf-lib
5. Check file size and adjust quality if needed (up to 10 iterations)
6. Output the closest result to the target size

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## Limitations

- Maximum file size: 100 MB
- PDFs with complex vector graphics may not compress as effectively
- Password-protected PDFs are not supported
- Some PDFs with embedded fonts may have rendering issues when fonts are removed

## Development

### Project Structure

```
pdf-compressor/
├── public/
│   └── index.html
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── App.css          # App-specific styles
│   ├── index.css        # Global styles
│   └── main.jsx         # Entry point
├── package.json
├── tailwind.config.js
└── README.md
```

### Key Components

- **UploadZone**: Drag & drop file upload
- **PDFPreview**: First page thumbnail preview
- **SettingsPanel**: Compression settings UI
- **ProgressBar**: Compression progress indicator
- **ResultCard**: Download and stats display

### Custom Hooks

- **usePDFCompressor**: Core compression logic
- **usePDFPreview**: PDF thumbnail generation
- **useToast**: Toast notification management

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) - PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [url, setUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchPDFUrl = async () => {
      try {
        const response = await axios.post('https://staging-exskilence-be.azurewebsites.net/media/', { file_url: pdfUrl });
        setUrl(response.data.url);
      } catch (error) {
        console.error('Error fetching PDF URL:', error);
      }
    };

    if (pdfUrl) {
      fetchPDFUrl();
    }
  }, [pdfUrl]);

  useEffect(() => {
    const loadPDF = async () => {
      if (url && canvasRef.current) {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        }
      }
    };

    loadPDF();
  }, [url]);

  if (!url) return <p>Loading PDF...</p>;

  return (
    <div>
      <iframe
        src={url}
        width="100%"
        height="600px"
        title="PDF Viewer"
        style={{ border: 'none' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default PDFViewer;

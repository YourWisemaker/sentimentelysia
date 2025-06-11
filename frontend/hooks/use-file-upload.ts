import { useState } from 'react';

export interface FileUploadResult {
  content: string;
  error?: string;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<FileUploadResult> => {
    try {
      setUploading(true);
      setError(null);

      // Convert file to base64
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = async (event) => {
          if (event.target?.result) {
            const base64Content = event.target.result.toString();
            
            // Convert base64 to text for the analyze endpoint
            const textContent = base64Content.split(',')[1] ? 
              atob(base64Content.split(',')[1]) : 
              atob(base64Content);
            
            // Send to API
            const response = await fetch('/api/analyze', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: textContent
              }),
            });

            const data = await response.json();
            
            if (response.ok) {
              resolve({ content: data.processedContent });
            } else {
              resolve({ content: '', error: data.error || 'Failed to process file' });
            }
          }
        };
        reader.onerror = () => {
          resolve({ content: '', error: 'Failed to read file' });
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return { content: '', error: 'An error occurred' };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    error,
  };
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeSentimentFromFile, type SentimentResult } from '@/lib/sentiment-analyzer';

interface CsvUploaderProps {
  onUploadSuccess: (results: SentimentResult[]) => void
  onUploadError: (error: string) => void
}

export function CsvUploader({ onUploadSuccess, onUploadError }: CsvUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      const results = await analyzeSentimentFromFile(file);
      
      if (results && results.length > 0) {
        onUploadSuccess(results);
        toast({
          title: "Success",
          description: `Analyzed ${results.length} items from the file.`,
        });
      } else {
        onUploadError('No valid content found in the file');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="file">Upload CSV File</Label>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="file"
            id="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Processing...' : 'Analyze Sentiment'}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </div>

      {csvContent && (
        <div className="space-y-4">
          <Label>Processed CSV Content</Label>
          <Textarea
            value={csvContent}
            readOnly
            className="min-h-[200px]"
          />
        </div>
      )}

      {uploading && (
        <div className="mt-4">
          <Progress value={50} />
        </div>
      )}
    </div>
  );
}

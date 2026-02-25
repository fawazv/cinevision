import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import './ScriptUploader.css';

interface ScriptUploaderProps {
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
    uploadProgress: number;
}

const ACCEPTED_TYPES = ['.fountain', '.fdx', '.txt', '.pdf'];
const ACCEPTED_MIME = ['text/plain', 'application/pdf', 'application/octet-stream'];

export function ScriptUploader({ onUpload, isUploading, uploadProgress }: ScriptUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [uploadedName, setUploadedName] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_TYPES.includes(ext) && !ACCEPTED_MIME.includes(file.type)) {
            setFileError(`Unsupported file type: ${ext}. Use .fountain, .fdx, .txt, or .pdf`);
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            setFileError('File is too large. Maximum size is 10MB.');
            return false;
        }
        return true;
    };

    const processFile = async (file: File) => {
        setFileError(null);
        if (!validateFile(file)) return;
        setUploadedName(file.name);
        await onUpload(file);
    };

    const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) await processFile(file);
    };

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await processFile(file);
    };

    // Show success state when upload is done
    if (uploadProgress === 100 && !isUploading && uploadedName) {
        return (
            <div className="uploader-success fade-in">
                <CheckCircle2 size={24} className="success-icon" />
                <div>
                    <p className="success-title">Script uploaded!</p>
                    <p className="success-file">{uploadedName}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`uploader-zone ${isDragging ? 'is-dragging' : ''} ${isUploading ? 'is-uploading' : ''}`}
            onDragEnter={() => setIsDragging(true)}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                style={{ display: 'none' }}
                onChange={handleChange}
            />

            {isUploading ? (
                <div className="uploader-progress-wrap">
                    <Loader2 size={28} className="spin" />
                    <p className="uploader-label">Uploading to Cloudinary...</p>
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="uploader-sub">{uploadProgress}%</p>
                </div>
            ) : (
                <>
                    <div className="uploader-icon-wrap">
                        {isDragging ? <FileText size={32} /> : <UploadCloud size={32} />}
                    </div>
                    <p className="uploader-label">
                        {isDragging ? 'Drop your screenplay here' : 'Drag & drop your screenplay'}
                    </p>
                    <p className="uploader-sub">or click to browse — .fountain, .fdx, .txt, .pdf · max 10MB</p>
                </>
            )}

            {fileError && (
                <div className="uploader-error fade-in">
                    <XCircle size={14} />
                    <span>{fileError}</span>
                </div>
            )}
        </div>
    );
}

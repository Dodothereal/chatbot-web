'use client';
import { useState } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
    compact?: boolean;
}

export default function FileUpload({ onFileSelect, disabled, compact }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setSelectedFileName(file.name);
        onFileSelect(file);
    };

    const clearFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedFileName(null);
    };

    if (compact) {
        return (
            <div className="relative">
                <label className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ${
                    dragActive
                        ? 'bg-blue-600/20 border-2 border-blue-500'
                        : disabled
                            ? 'bg-gray-700/30 cursor-not-allowed'
                            : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                }`}>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx,.txt,image/*"
                        disabled={disabled}
                    />
                    <Upload
                        className={`w-5 h-5 ${
                            disabled
                                ? 'text-gray-500'
                                : dragActive
                                    ? 'text-blue-500'
                                    : 'text-blue-400'
                        }`}
                    />
                </label>
                {selectedFileName && (
                    <div className="absolute bottom-full mb-2 left-0 bg-gray-700 rounded-lg p-2 text-xs text-gray-200 whitespace-nowrap flex items-center gap-2 shadow-lg">
                        <File className="w-4 h-4 text-blue-400" />
                        {selectedFileName}
                        <button
                            onClick={clearFile}
                            className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-xl p-6 transition-all duration-200 ${
                dragActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-2 border-blue-500'
                    : disabled
                        ? 'bg-gray-700/30 border-2 border-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 border-2 border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <label className={`flex flex-col items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,.txt,image/*"
                    disabled={disabled}
                />
                <div className="flex flex-col items-center text-center">
                    {selectedFileName ? (
                        <div className="flex items-center gap-3 text-gray-200">
                            <File className="w-6 h-6 text-blue-400" />
                            <span className="text-sm">{selectedFileName}</span>
                            <button
                                onClick={clearFile}
                                className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload className={`w-8 h-8 mb-2 ${disabled ? 'text-gray-500' : 'text-blue-400'}`} />
                            <div className="text-sm">
                                <p className={disabled ? 'text-gray-500' : 'text-gray-300'}>
                                    Drag and drop files here or
                                </p>
                                <p className={`mt-1 ${
                                    disabled ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'
                                }`}>
                                    Browse files
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </label>
        </div>
    );
}
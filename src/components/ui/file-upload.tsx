'use client';

import { useRef, useState, useTransition } from 'react';
import { FileText, Loader2, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadAttachment } from '@/lib/actions/uploads';
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_SIZE_BYTES,
} from '@/lib/constants';

export interface UploadedFile {
  path: string;
  name: string;
  previewUrl: string | null;
}

/**
 * Carga opcional de fotografías del tanque o del acceso.
 * Sube al bucket privado y devuelve las rutas; la vista previa es local.
 */
export function FileUpload({
  files,
  onChange,
}: {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList);

    if (files.length + incoming.length > MAX_UPLOAD_FILES) {
      toast.error(`Puedes adjuntar un máximo de ${MAX_UPLOAD_FILES} archivos.`);
      return;
    }

    startTransition(async () => {
      const accepted: UploadedFile[] = [];

      for (const file of incoming) {
        if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
          toast.error(`${file.name}: formato no permitido. Usa JPG, PNG, WEBP o PDF.`);
          continue;
        }
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
          toast.error(`${file.name}: supera el limite de 5 MB.`);
          continue;
        }

        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadAttachment(fd);

        if ('error' in result) {
          toast.error(`${file.name}: ${result.error}`);
          continue;
        }

        accepted.push({
          path: result.path,
          name: file.name,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        });
      }

      if (accepted.length) {
        onChange([...files, ...accepted]);
        toast.success(
          accepted.length === 1 ? 'Archivo adjuntado.' : `${accepted.length} archivos adjuntados.`,
        );
      }
      if (inputRef.current) inputRef.current.value = '';
    });
  };

  const remove = (path: string) => {
    const target = files.find((f) => f.path === path);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange(files.filter((f) => f.path !== path));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        disabled={pending || files.length >= MAX_UPLOAD_FILES}
        className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-7 transition-[border-color,background-color,transform,box-shadow] duration-200 ${
          dragOver ? 'scale-[1.01] border-gold-400 bg-gold-50 shadow-sm' : 'border-navy-200 bg-mist hover:-translate-y-px hover:border-navy-400 hover:shadow-sm'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending ? (
          <Loader2 className="h-6 w-6 animate-spin text-navy-300" aria-hidden />
        ) : (
          <Paperclip className="h-6 w-6 text-navy-300" aria-hidden />
        )}
        <span className="text-sm font-medium text-navy-800">
          {pending ? 'Subiendo...' : 'Agregar fotografías del tanque o del acceso'}
        </span>
        <span className="text-xs text-navy-500">
          JPG, PNG, WEBP o PDF · máximo {MAX_UPLOAD_FILES} archivos de 5 MB
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_UPLOAD_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f) => (
            <li
              key={f.path}
              className="group relative aspect-video overflow-hidden rounded-lg border border-navy-100 bg-mist transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-navy-200 hover:shadow-sm"
            >
              {f.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.previewUrl} alt={f.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-navy-500">
                  <FileText className="h-5 w-5" aria-hidden />
                  <span className="line-clamp-2">{f.name}</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(f.path)}
                aria-label={`Quitar ${f.name}`}
                className="absolute right-0 top-0 grid h-7 w-7 place-items-center bg-navy-900 text-white transition-colors hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

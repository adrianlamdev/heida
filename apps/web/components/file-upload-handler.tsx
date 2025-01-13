import React, { useState, useEffect } from "react";
import { Loader2, File, X, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { createClient } from "@/utils/supabase/client";

const FileUploadHandler = ({
  onFileUpload,
  onFileRemove,
  onUploadStateChange,
}) => {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = React.useRef(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await supabase.storage
          .from("user-uploads")
          .upload(`${user.id}/.keep`, new Blob([""], { type: "text/plain" }), {
            upsert: true,
          });
      }
    };
    fetchUser();
  }, [supabase]);

  const handleFileSelect = async (event) => {
    if (!userId) {
      alert("Please log in to upload files");
      return;
    }

    const files = Array.from(event.target.files);
    setUploading(true);
    onUploadStateChange(true); // Notify parent component that upload started

    try {
      for (const file of files) {
        const fileExtension = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExtension}`;
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from("user-uploads")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw error;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("user-uploads").getPublicUrl(filePath);

        const uploadedFile = {
          id: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          path: filePath,
        };

        setUploadedFiles((prev) => [...prev, uploadedFile]);
        onFileUpload(uploadedFile);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to upload file: ${error.message}`);
    } finally {
      setUploading(false);
      onUploadStateChange(false); // Notify parent component that upload finished
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = async (index) => {
    const fileToRemove = uploadedFiles[index];

    try {
      setUploadedFiles((prev) => {
        const newFiles = [...prev];
        const removedFile = newFiles.splice(index, 1)[0];
        onFileRemove(removedFile);
        return newFiles;
      });
    } catch (error) {
      console.error("Error removing file:", error);
      alert(`Failed to remove file: ${error.message}`);
    }
  };

  return (
    <div className="">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-transparent"
          disabled={uploading || !userId}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-0 w-full bg-background rounded-lg p-2 border shadow-lg"
          >
            <div className="flex flex-col gap-2 w-full">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between px-2 py-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary/50 border p-2 rounded-sm">
                      <File className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm">{file.originalName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024000).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="text-muted-foreground hover:bg-transparent"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadHandler;

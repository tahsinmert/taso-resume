"use client";

import { useFormContext } from "@/lib/context/FormProvider";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { updateResume } from "@/lib/actions/resume.actions";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

const PersonalDetailsForm = ({ params }: { params: { id: string } }) => {
  const { formData, handleInputChange, setFormData } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (formData?.photo) {
      setPhotoPreview(formData.photo);
    }
  }, [formData?.photo]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Fotoğraf maksimum 2MB olmalıdır.",
        variant: "destructive",
        className: "bg-white",
      });
      return;
    }

    // Sadece resim dosyaları
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Geçersiz dosya",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive",
        className: "bg-white",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      setFormData((prevData: any) => ({
        ...prevData,
        photo: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFormData((prevData: any) => ({
      ...prevData,
      photo: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSave = async (e: any) => {
    e.preventDefault();

    setIsLoading(true);

    const updates = {
      firstName: formData?.firstName,
      lastName: formData?.lastName,
      jobTitle: formData?.jobTitle,
      address: formData?.address,
      phone: formData?.phone,
      email: formData?.email,
      photo: formData?.photo || "",
      photoFrame: formData?.photoFrame || "circle",
    };

    const result = await updateResume({
      resumeId: params.id,
      updates: updates,
    });

    if (result.success) {
      toast({
        title: "Information saved.",
        description: "Personal details updated successfully.",
        className: "bg-white",
      });
    } else {
      toast({
        title: "Uh Oh! Something went wrong.",
        description: result?.error,
        variant: "destructive",
        className: "bg-white",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary-700 border-t-4 bg-white">
      <h2 className="text-lg font-semibold leading-none tracking-tight">
        Personal Details
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Get Started with the basic information
      </p>

      <form onSubmit={onSave}>
        <div className="grid grid-cols-2 mt-5 gap-3">
          <div className="space-y-2">
            <label className="mt-2 text-slate-700 font-semibold">
              First Name:
            </label>
            <Input
              name="firstName"
              defaultValue={formData?.firstName}
              required
              onChange={handleInputChange}
              className="no-focus"
            />
          </div>
          <div className="space-y-2">
            <label className="mt-2 text-slate-700 font-semibold">
              Last Name:
            </label>
            <Input
              name="lastName"
              required
              onChange={handleInputChange}
              defaultValue={formData?.lastName}
              className="no-focus"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="mt-2 text-slate-700 font-semibold">
              Job Title:
            </label>
            <Input
              name="jobTitle"
              required
              onChange={handleInputChange}
              defaultValue={formData?.jobTitle}
              className="no-focus"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="mt-2 text-slate-700 font-semibold">
              Address:
            </label>
            <Input
              name="address"
              required
              defaultValue={formData?.address}
              onChange={handleInputChange}
              className="no-focus"
            />
          </div>
          <div className="space-y-2">
            <label className="mt-2 text-slate-700 font-semibold">Phone:</label>
            <Input
              name="phone"
              required
              defaultValue={formData?.phone}
              onChange={handleInputChange}
              className="no-focus"
            />
          </div>
          <div className="space-y-2">
            <label className="mt-2 text-slate-700 font-semibold">Email:</label>
            <Input
              name="email"
              required
              defaultValue={formData?.email}
              onChange={handleInputChange}
              className="no-focus"
            />
          </div>
        </div>

        {/* Fotoğraf Yükleme Bölümü */}
        <div className="col-span-2 mt-5 space-y-3">
          <label className="mt-2 text-slate-700 font-semibold">Fotoğraf:</label>
          
          {photoPreview ? (
            <div className="relative inline-block">
              <div
                className={`overflow-hidden ${
                  formData?.photoFrame === "circle"
                    ? "rounded-full"
                    : formData?.photoFrame === "rounded"
                    ? "rounded-lg"
                    : formData?.photoFrame === "square"
                    ? "rounded-none"
                    : "rounded-none"
                }`}
                style={{
                  width: "120px",
                  height: "120px",
                  border:
                    formData?.photoFrame === "none"
                      ? "none"
                      : `3px solid ${formData?.themeColor || "#1d4ed8"}`,
                }}
              >
                <Image
                  src={photoPreview}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="object-cover w-full h-full"
                />
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-700 transition-colors"
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Fotoğraf yüklemek için tıkla
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maksimum 2MB (JPG, PNG)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Çerçeve Seçimi */}
          {photoPreview && (
            <div className="space-y-2">
              <label className="mt-2 text-slate-700 font-semibold">
                Çerçeve Stili:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "circle", label: "Yuvarlak" },
                  { value: "rounded", label: "Yuvarlatılmış" },
                  { value: "square", label: "Kare" },
                  { value: "none", label: "Çerçevesiz" },
                ].map((frame) => (
                  <button
                    key={frame.value}
                    type="button"
                    onClick={() => {
                      handleInputChange({
                        target: { name: "photoFrame", value: frame.value },
                      });
                    }}
                    className={`p-2 text-xs rounded border-2 transition-all ${
                      formData?.photoFrame === frame.value
                        ? "border-primary-700 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {frame.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary-700 hover:bg-primary-800 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Saving
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailsForm;

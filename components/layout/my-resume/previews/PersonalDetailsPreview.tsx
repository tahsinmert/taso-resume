import { useFormContext } from "@/lib/context/FormProvider";
import { themeColors } from "@/lib/utils";
import React from "react";
import Image from "next/image";

function PersonalDetailsPreview() {
  const { formData } = useFormContext();
  
  return (
    <div>
      {/* Fotoğraf */}
      {formData?.photo && (
        <div className="flex justify-center mb-4">
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
              width: "100px",
              height: "100px",
              border:
                formData?.photoFrame === "none"
                  ? "none"
                  : `3px solid ${formData?.themeColor || themeColors[0]}`,
            }}
          >
            <Image
              src={formData.photo}
              alt="Profile"
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      <h2
        className="font-bold text-xl text-center"
        style={{
          color: formData?.themeColor || themeColors[0],
        }}
      >
        {formData?.firstName} {formData?.lastName}
      </h2>

      <h2 className="text-center text-sm font-medium">
        {formData?.jobTitle}
      </h2>

      <h2
        className="text-center font-normal text-xs"
        style={{
          color: formData?.themeColor || themeColors[0],
        }}
      >
        {formData?.address}
      </h2>

      <div className="flex justify-between">
        <h2
          className="font-normal text-xs"
          style={{
            color: formData?.themeColor || themeColors[0],
          }}
        >
          {formData?.phone}
        </h2>

        <h2
          className="font-normal text-xs"
          style={{
            color: formData?.themeColor || themeColors[0],
          }}
        >
          {formData?.email}
        </h2>
      </div>
      
      <hr
        className="border-[1.5px] my-2 mb-5"
        style={{
          borderColor: formData?.themeColor || themeColors[0],
        }}
      />
    </div>
  );
}

export default PersonalDetailsPreview;

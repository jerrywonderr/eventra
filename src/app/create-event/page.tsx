// src/app/create-event/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/actions/events";
import { createClient } from "@/libs/supabase/client";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    image_url: "",
    max_tickets_per_user: null as number | null,
  });

  type Tier = {
    tier_name: string;
    price: number;
    quantity_total: number;
    benefits: string[];
  };

  const [tiers, setTiers] = useState<Tier[]>([
    {
      tier_name: "General Admission",
      price: 50,
      quantity_total: 100,
      benefits: ["Access to event"],
    },
  ]);

  const addTier = () => {
    setTiers([
      ...tiers,
      { tier_name: "", price: 0, quantity_total: 0, benefits: [] },
    ]);
  };

  const updateTier = <K extends keyof Tier>(
    index: number,
    field: K,
    value: Tier[K]
  ) => {
    setTiers((prev) => {
      const newTiers = [...prev];
      newTiers[index] = { ...newTiers[index], [field]: value } as Tier;
      return newTiers;
    });
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Set preview and form data
      setImagePreview(publicUrl);
      setFormData({ ...formData, image_url: publicUrl });

      console.log("✅ Image uploaded:", publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);
      formDataObj.append("event_date", formData.event_date);
      formDataObj.append("location", formData.location);
      formDataObj.append("image_url", formData.image_url);
      if (formData.max_tickets_per_user) {
        formDataObj.append(
          "max_tickets_per_user",
          formData.max_tickets_per_user.toString()
        );
      }
      formDataObj.append("tiers", JSON.stringify(tiers));

      const result = await createEvent(formDataObj);

      if (result.error) {
        setError(result.error);
        return;
      }

      alert("✅ Event created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow border border-slate-200 dark:border-slate-700"
      >
        {/* Event Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Event Image *
          </label>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image_url: "" });
                  }}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <div className="flex flex-col items-center justify-center py-6">
                  <svg
                    className="w-12 h-12 text-slate-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {uploading ? "Uploading..." : "Click to upload event image"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Event Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            placeholder="e.g., Tech Conference 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            placeholder="Describe your event..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Date *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.event_date}
              onChange={(e) =>
                setFormData({ ...formData, event_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
              placeholder="e.g., Lagos, Nigeria"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Max Tickets Per User (Optional)
          </label>
          <input
            type="number"
            min="1"
            value={formData.max_tickets_per_user || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_tickets_per_user: e.target.value
                  ? parseInt(e.target.value)
                  : null,
              })
            }
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            placeholder="Leave empty for no limit"
          />
        </div>

        {/* Ticket Tiers */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Ticket Tiers</h3>
            <button
              type="button"
              onClick={addTier}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              + Add Tier
            </button>
          </div>

          {tiers.map((tier, index) => (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg mb-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Tier {index + 1}</h4>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Tier Name"
                  value={tier.tier_name}
                  onChange={(e) =>
                    updateTier(index, "tier_name", e.target.value)
                  }
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={tier.price}
                  onChange={(e) =>
                    updateTier(index, "price", parseFloat(e.target.value))
                  }
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  required
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={tier.quantity_total}
                  onChange={(e) =>
                    updateTier(
                      index,
                      "quantity_total",
                      parseInt(e.target.value)
                    )
                  }
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  required
                  min="1"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || uploading || !formData.image_url}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition"
        >
          {loading
            ? "Creating Event..."
            : uploading
            ? "Uploading Image..."
            : "Create Event"}
        </button>
      </form>
    </div>
  );
}

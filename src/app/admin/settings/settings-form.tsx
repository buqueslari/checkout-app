"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";

type Settings = {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  fontFamily: string;
  supportEmail: string | null;
  currency: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
      setLogoUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={updateSettings} className="glass-panel p-6 flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <label className="field-label">Nome da empresa</label>
        <input className="input" name="companyName" defaultValue={settings.companyName} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label">Logo</label>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="h-10 w-auto mb-1" />
        ) : null}
        <input
          className="input"
          name="logoUrl"
          placeholder="https://.../logo.png"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs mt-1" />
        {uploading ? (
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Enviando...
          </span>
        ) : null}
        {uploadError ? (
          <span className="text-xs" style={{ color: "var(--red)" }}>
            {uploadError}
          </span>
        ) : null}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="field-label">Cor principal</label>
          <input
            className="input"
            name="primaryColor"
            type="color"
            defaultValue={settings.primaryColor}
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="field-label">Moeda</label>
          <input className="input" name="currency" defaultValue={settings.currency} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label">Fonte (nome de uma Google Font)</label>
        <input className="input" name="fontFamily" defaultValue={settings.fontFamily} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label">E-mail de suporte (opcional)</label>
        <input className="input" name="supportEmail" type="email" defaultValue={settings.supportEmail ?? ""} />
      </div>

      <button className="btn btn-primary justify-center mt-2" type="submit">
        Salvar
      </button>
    </form>
  );
}

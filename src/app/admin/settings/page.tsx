import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Configurações</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}

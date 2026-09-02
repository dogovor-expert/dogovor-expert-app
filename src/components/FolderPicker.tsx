"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  FolderOpen,
  ChevronRight,
  Plus,
  Check,
  X,
  Loader2,
  ArrowUp,
} from "lucide-react";
import type { CloudFolder } from "@/lib/cloud/types";
import { getProvider, loadCloudTokens, isTokenValid } from "@/lib/cloud/manager";

interface FolderPickerProps {
  providerId: "yandex" | "google" | "dropbox";
  onSelect: (folderPath: string) => void;
  onCancel: () => void;
  initialPath?: string;
}

export default function FolderPicker({ providerId, onSelect, onCancel, initialPath = "/" }: FolderPickerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [folders, setFolders] = useState<CloudFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = getProvider(providerId);
      if (!provider.listFolders) {
        setError("Провайдер не поддерживает выбор папок");
        setFolders([]);
        return;
      }
      const tokens = await loadCloudTokens(providerId);
      if (!tokens || !isTokenValid(tokens)) {
        setError("Токен недействителен — переподключите облако");
        setFolders([]);
        return;
      }
      const data = await provider.listFolders(tokens, currentPath);
      setFolders(data);
    } catch (e) {
      setError((e as Error).message);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [providerId, currentPath]);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  const handleFolderClick = (folder: CloudFolder) => {
    setCurrentPath(folder.path);
  };

  const handleGoUp = () => {
    if (currentPath === "/" || currentPath === "") return;
    const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
    setCurrentPath(parent);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const provider = getProvider(providerId);
    if (!provider.createFolder) {
      alert("Провайдер не поддерживает создание папок");
      return;
    }
    setCreating(true);
    try {
      const tokens = await loadCloudTokens(providerId);
      if (!tokens) throw new Error("Нет токена");

      if (providerId === "yandex") {
        await provider.createFolder(tokens, `${currentPath}/${newFolderName}`.replace(/\/+/g, "/"));
      } else if (providerId === "google") {
        await provider.createFolder(tokens, newFolderName, currentPath);
      } else if (providerId === "dropbox") {
        await provider.createFolder(tokens, `${currentPath}/${newFolderName}`.replace(/\/+/g, "/"));
      }
      setNewFolderName("");
      await loadFolders();
    } catch (e) {
      alert(`Не удалось создать папку: ${(e as Error).message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = () => {
    onSelect(currentPath);
  };

  const breadcrumbs = currentPath.split("/").filter(Boolean);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Выберите папку</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 mb-4 text-sm text-gray-600 flex-wrap">
        <button onClick={() => setCurrentPath("/")} className="hover:text-brand-600">Корень</button>
        {breadcrumbs.map((seg, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => setCurrentPath("/" + breadcrumbs.slice(0, i + 1).join("/"))}
              className="hover:text-brand-600"
            >
              {seg}
            </button>
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        {currentPath !== "/" && (
          <Button variant="outline" size="sm" onClick={handleGoUp}>
            <ArrowUp className="w-4 h-4 mr-1" />
            На уровень выше
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Новая папка
        </Button>
      </div>

      {creating && (
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Имя папки"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreateFolder();
            }}
            autoFocus
          />
          <Button size="sm" onClick={() => void handleCreateFolder()} disabled={creating || !newFolderName.trim()}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Folders list */}
      <Card className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : folders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>Папок нет</p>
            <p className="text-xs mt-1">Создайте первую папку кнопкой выше</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {folders.map((f) => (
              <li key={f.path}>
                <button
                  onClick={() => handleFolderClick(f)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="truncate font-medium text-gray-900">{f.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Отмена</Button>
        <Button onClick={handleSelect} disabled={loading}>
          <Check className="w-4 h-4 mr-1" />
          Выбрать эту папку
        </Button>
      </div>
    </div>
  );
}
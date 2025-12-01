"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface Event {
    id?: string
    title: string
    description?: string
    imageUrl?: string | null
    speaker?: string | null
    location?: string | null
    platform?: string | null
    url?: string | null
    isOnline?: boolean
    startDate: Date
    endDate: Date
}

interface EventModalProps {
    isOpen: boolean
    onClose: () => void
    event?: Event | null
    isAdmin: boolean
    mode: 'view' | 'create' | 'edit'
    onSave: (event: Event) => Promise<void>
    onDelete?: (id: string) => Promise<void>
}

export default function EventModal({
    isOpen,
    onClose,
    event,
    isAdmin,
    mode,
    onSave,
    onDelete,
}: EventModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [speaker, setSpeaker] = useState("")
    const [location, setLocation] = useState("")
    const [platform, setPlatform] = useState("")
    const [url, setUrl] = useState("")
    const [isOnline, setIsOnline] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editMode, setEditMode] = useState(mode === 'edit')

    useEffect(() => {
        setError(null)
        if (event) {
            setTitle(event.title)
            setDescription(event.description || "")
            setImageUrl(event.imageUrl || "")
            setSpeaker(event.speaker || "")
            setLocation(event.location || "")
            setPlatform(event.platform || "")
            setUrl(event.url || "")
            setIsOnline(Boolean(event.isOnline))
            setStartDate(format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"))
            setEndDate(format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"))
        } else {
            setTitle("")
            setDescription("")
            setImageUrl("")
            setSpeaker("")
            setLocation("")
            setPlatform("")
            setUrl("")
            setIsOnline(false)
            setStartDate("")
            setEndDate("")
        }
        setEditMode(mode === 'edit' || mode === 'create')
    }, [event, mode])

    const readableRange = event
        ? `${format(new Date(event.startDate), "d MMMM yyyy HH:mm", { locale: tr })} - ${format(new Date(event.endDate), "HH:mm", { locale: tr })}`
        : ""

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Yükleme başarısız')
            }

            const data = await res.json()
            setImageUrl(data.url)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Resim yüklenirken hata oluştu')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        setError(null)
        try {
            await onSave({
                id: event?.id,
                title,
                description,
                imageUrl,
                speaker,
                location,
                platform,
                url,
                isOnline,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            })
            onClose()
        } catch (error: any) {
            console.error('Error saving event:', error)
            setError(error.message || 'Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (event?.id && onDelete) {
            setLoading(true)
            try {
                await onDelete(event.id)
                onClose()
            } catch (error) {
                console.error('Error deleting event:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto border border-white/10 bg-background/95 p-0 shadow-2xl">
                <div className="space-y-6 p-5 sm:p-6">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-xl font-semibold">
                            {mode === 'create' ? 'Yeni Etkinlik' : editMode ? 'Etkinliği Düzenle' : 'Etkinlik Detayları'}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'create'
                                ? 'Yeni bir etkinlik oluşturun'
                                : editMode
                                    ? 'Etkinlik bilgilerini güncelleyin'
                                    : 'Etkinlik bilgilerini görüntüleyin'}
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="rounded-md bg-red-500/15 p-3 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {!editMode && event && (
                        <div className="grid gap-6 rounded-xl border border-border bg-card/50 p-5 md:grid-cols-[1.5fr_1fr]">
                            <div className="space-y-5">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Etkinlik</span>
                                    <h3 className="text-lg font-bold text-foreground mt-0.5 leading-tight">{event.title}</h3>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Zaman</span>
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground mt-1">
                                        <span className="inline-block p-1 rounded bg-primary/10 text-primary">📅</span>
                                        {readableRange}
                                    </div>
                                </div>

                                {(event.speaker || event.location || event.platform || event.url) && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {event.speaker && (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Konuşmacı</span>
                                                <div className="flex items-center gap-2 text-sm font-medium text-foreground mt-1">
                                                    <span className="inline-block p-1 rounded bg-orange-500/10 text-orange-500">🎤</span>
                                                    {event.speaker}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {event.isOnline ? (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform</span>
                                                <div className="flex items-center gap-2 text-sm font-medium text-foreground mt-1">
                                                    <span className="inline-block p-1 rounded bg-emerald-500/10 text-emerald-500">🌐</span>
                                                    Online {event.platform && `• ${event.platform}`}
                                                </div>
                                            </div>
                                        ) : (
                                            event.location && (
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Konum</span>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground mt-1">
                                                        <span className="inline-block p-1 rounded bg-blue-500/10 text-blue-500">📍</span>
                                                        {event.location}
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        {event.url && (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bağlantı</span>
                                                <div className="mt-1">
                                                    <a 
                                                        href={event.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors hover:underline"
                                                    >
                                                        🔗 Etkinliğe Git
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {event.description && (
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Açıklama</span>
                                        <p className="text-sm leading-relaxed text-foreground/90 mt-1 whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/50">
                                            {event.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {event.imageUrl && (
                                <div className="order-first md:order-last">
                                    <div className="overflow-hidden rounded-xl border border-border shadow-sm bg-muted/20">
                                        <img
                                            src={event.imageUrl}
                                            alt="Etkinlik görseli"
                                            className="h-48 w-full object-cover md:h-full md:max-h-[300px]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {editMode && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Başlık</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={!editMode}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Açıklama</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={!editMode}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="speaker">Konuşmacı</Label>
                                    <Input
                                        id="speaker"
                                        value={speaker}
                                        onChange={(e) => setSpeaker(e.target.value)}
                                        disabled={!editMode}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isOnline}
                                            onChange={(e) => setIsOnline(e.target.checked)}
                                            disabled={!editMode}
                                            className="h-4 w-4 rounded border-muted-foreground/50 bg-transparent"
                                        />
                                        Online Etkinlik
                                    </Label>
                                </div>
                            </div>

                            {isOnline ? (
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform (örn. Google Meet, Zoom)</Label>
                                    <Input
                                        id="platform"
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        disabled={!editMode}
                                        placeholder="Google Meet"
                                    />
                                    <div className="pt-2">
                                        <Label htmlFor="url">Etkinlik Linki</Label>
                                        <Input
                                            id="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            disabled={!editMode}
                                            placeholder="https://meet.google.com/..."
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="location">Konum (adres/salon)</Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={!editMode}
                                        placeholder="Mühendislik Fak. D101"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="image">Görsel</Label>
                                <div className="grid gap-2">
                                    <div className="flex gap-2">
                                        <Input
                                            id="image"
                                            type="url"
                                            placeholder="https://ornek.com/etkinlik.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            disabled={!editMode}
                                            className="flex-1"
                                        />
                                        {editMode && (
                                            <div className="relative">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                                <Button type="button" variant="outline" disabled={uploading}>
                                                    {uploading ? '...' : 'Yükle'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {imageUrl && (
                                        <div className="mt-2 relative w-full max-h-[300px] overflow-hidden rounded-lg border border-white/10 bg-black/20">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={imageUrl} 
                                                alt="Preview" 
                                                className="h-full w-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                                    <Input
                                        id="startDate"
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={!editMode}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Bitiş Tarihi</Label>
                                    <Input
                                        id="endDate"
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={!editMode}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        {!editMode && isAdmin && event?.id && (
                            <Button
                                variant="outline"
                                onClick={() => setEditMode(true)}
                            >
                                Düzenle
                            </Button>
                        )}

                        {editMode && (
                            <>
                                {event?.id && onDelete && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        Sil
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSave}
                                    disabled={loading || !title || !startDate || !endDate}
                                >
                                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                </Button>
                            </>
                        )}

                        {!editMode && (
                            <Button variant="outline" onClick={onClose}>
                                Kapat
                            </Button>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}

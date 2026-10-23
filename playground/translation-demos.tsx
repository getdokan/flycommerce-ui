import * as React from "react"
import { tr } from "react-day-picker/locale"

import {
  Button,
  DATE_RANGE_PRESETS,
  DateRangePicker,
  ImageUploadField,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  UploadQueue,
  type DateRange,
} from "@/index"

const PRESET_NAMES: Record<string, string> = {
  Today: "Bugün",
  Yesterday: "Dün",
  "Last 7 days": "Son 7 gün",
  "Last 30 days": "Son 30 gün",
  "This month": "Bu ay",
  "Last month": "Geçen ay",
  "This year": "Bu yıl",
  "Last year": "Geçen yıl",
}

export function TranslatedLabelsDemo() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 15),
  })

  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Ekip üyesi davet et</Button>
            </SheetTrigger>
            <SheetContent closeLabel="Kapat">
              <SheetHeader>
                <SheetTitle>Ekip üyesi davet et</SheetTitle>
                <SheetDescription>
                  Bağlantı içeren bir e-posta alırlar.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <DateRangePicker
            value={range}
            onValueChange={setRange}
            locale={tr}
            placeholder="Tarih aralığı seçin"
            presetsLabel="Hazır aralıklar"
            presets={DATE_RANGE_PRESETS.map((preset) => ({
              ...preset,
              label: PRESET_NAMES[preset.label],
            }))}
          />
        </div>
        <UploadQueue
          locale="tr"
          onCancel={() => {}}
          onRemove={() => {}}
          labels={{
            uploading: "Yükleniyor…",
            done: "Tamamlandı",
            failed: "Başarısız",
            of: (loaded, total) => `${loaded} / ${total}`,
            cancel: (name) => `${name} yüklemesini iptal et`,
            remove: (name) => `${name} dosyasını kaldır`,
          }}
          items={[
            {
              id: "1",
              name: "kapak.jpg",
              size: 2_400_000,
              progress: 62,
              status: "uploading",
            },
            {
              id: "2",
              name: "katalog.pdf",
              size: 5_800_000,
              progress: 100,
              status: "done",
            },
          ]}
        />
      </div>
      <ImageUploadField
        label="Logo"
        locale="tr"
        maxSize={5 * 1024 * 1024}
        onFiles={() => {}}
        onChooseExisting={() => {}}
        labels={{
          dropTitle: (
            <>
              Görselinizi buraya{" "}
              <span className="font-semibold text-primary-ink">
                sürükleyip bırakın
              </span>
            </>
          ),
          fileRules: (types, maxSize) =>
            [types, maxSize && `En büyük dosya boyutu: ${maxSize}`]
              .filter(Boolean)
              .join(". "),
          upload: "Görsel yükle",
          input: "Görsel yükle",
          change: "Görseli değiştir",
          library: "Medya kitaplığı",
          remove: "Görseli kaldır",
          uploading: "Yükleniyor",
        }}
      />
    </div>
  )
}

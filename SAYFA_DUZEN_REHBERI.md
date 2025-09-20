# Sayfa Düzen Rehberi - Produck CRM

Bu dokument, Produck CRM sistemindeki tüm sayfalarda uygulanması gereken düzen standartlarını ve best practice'leri tanımlar.

## Temel Prensipler

### 1. Minimalist Yaklaşım
- **Sadece Grid**: Sayfanın ana içeriği data grid olacak
- **Gereksiz Bileşenler Yok**: Extra card'lar, panel'lar veya karmaşık layout'lar kullanılmayacak
- **Tek Amaçlı Butonlar**: Her buton sadece bir işlevi yerine getirecek
- **Icon Kullanımı**: Material Design Icons tercih edilecek, emoji kullanılmayacak

### 2. İşlem Butonları Hiyerarşisi
- **Üst Toolbar**: Ana işlemler (Yeni Ekle, Toplu İşlemler, Export)
- **Sağ Tık Menüsü**: Satır bazlı işlemler (Düzenle, Sil, Detay Görüntüle)
- **Grid İçi Butonlar**: Hızlı erişim gereken kritik işlemler (sadece gerekirse)

### 3. Filtreleme ve Arama
- **Grid'in Kendi Özellikleri**: AG Grid'in built-in filter ve search kullanılacak
- **Harici Filtre Komponenti Yok**: Ayrı filter panel'ları veya search box'ları eklenmeyecek
- **Column Filters**: Her sütun kendi filter'ına sahip olacak

## Sayfa Yapısı

```
┌─────────────────────────────────────────────────────┐
│  Sayfa Başlığı + Ana İşlem Butonları                │
├─────────────────────────────────────────────────────┤
│                                                     │
│              DATA GRID                              │
│         (Filtreleme + Sıralama                      │
│          + Context Menu)                            │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Detaylı Standartlar

### Ana İşlem Butonları (Üst Toolbar)
- **Konum**: Grid'in hemen üstünde, sağ tarafta
- **İçerik**:
  - Yeni [Entity] Ekle (Primary Action) - `color="primary"`
  - Toplu İşlemler (varsa) - `color="accent"`
  - Export (Excel/CSV) - Icon button, default color
  - Yenile - Icon button, default color
- **Tasarım**: Material Design butonları, icon + text

#### Buton Renk Standartları
- **Primary (Mavi)**: Ana işlemler (Kaydet, Oluştur, Onayla)
- **Accent (Turuncu/Amber)**: İkincil önemli işlemler (Toplu İşlem, İleri Seviye)
- **Warn (Kırmızı)**: Tehlikeli işlemler (Sil, İptal, Reddet)
- **Default (Gri)**: Nötr işlemler (Görüntüle, Export, Yenile, İptal)

### Grid Konfigürasyonu

#### Sütun Yapısı
- **Birleşik Bilgi Sütunu**: Ana bilgiler tek sütunda (İsim, kod, iletişim)
- **Önemli Meta Data**: Ayrı sütunlarda (Durum, Tarih, Sorumlu)
- **Maksimum Sütun Sayısı**: Maksimum 8 sütun
- **Varsayılan Görünüm**: İlk yükleme de en önemli 4-5 sütun görünür
- **Sütun Görünürlük Kontrolü**: Kullanıcı istediği sütunları açıp kapatabilir

#### Filtreleme
- **Column Header Filters**: Her sütunda kendi filter'ı
- **Quick Filter**: Grid'in global search özelliği
- **Filter Türleri**:
  - Text: Contains, starts with, ends with
  - Date: Date range picker
  - Number: Greater than, less than, equals
  - Select: Multi-select dropdown

#### Context Menu (Sağ Tık)
- **Konum**: Satır üzerinde sağ tık
- **İçerik ve Renkler**:
  - Detayları Görüntüle - Default (icon: visibility)
  - Düzenle - Primary (icon: edit)
  - Kopyala/Çoğalt - Accent (icon: content_copy)
  - Entity'ye özel işlemler - Accent (Kişi Ekle, Fırsat Oluştur, vb.)
  - Sil - Warn (icon: delete) - En altta, ayırıcı ile

### Responsive Tasarım
- **Desktop**: Full grid görünümü
- **Tablet**: Sütun gizleme/daraltma
- **Mobile**: Kart görünümü veya önemli sütunları gösterme

## Best Practices

### Performance
- **İlk Yükleme**: 15 veri satırı gösterilir, hepsi ekranda görünür olmalı
- **Lazy Loading**: Büyük veri setleri için
- **Virtual Scrolling**: AG Grid'in virtual scrolling'i
- **Server-Side Operations**: Filtreleme, sıralama, sayfalama
- **Optimal Row Height**: Tüm veriler tek ekranda görünecek şekilde ayarlanmalı

### UX/UI
- **Loading States**: Grid yüklenirken spinner
- **Empty States**: Veri yokken açıklayıcı mesaj
- **Error Handling**: Network hatalarında retry seçeneği
- **Hover Effects**: Satır ve buton hover'ları
- **Icons**: Material Design Icons kullanımı (emoji değil)
- **Visual Hierarchy**: Icon + text kombinasyonları

### Accessibility
- **Keyboard Navigation**: Tab ile gezinme
- **Screen Reader**: ARIA labels
- **Color Contrast**: WCAG 2.1 AA standartları

### Data Management
- **State Management**: Signals veya Observable kullanımı
- **Caching**: API response'ları cache'leme
- **Optimistic Updates**: UI'da hızlı feedback

## Kod Standardı

### Component Yapısı
```typescript
@Component({
  selector: 'app-[entity-name]',
  standalone: true,
  imports: [CommonModule, DataGridComponent, MaterialModules],
  templateUrl: './[entity-name].component.html',
  styleUrls: ['./[entity-name].component.css']
})
export class [EntityName]Component implements OnInit {
  // Signals for reactive data
  data = signal<EntityType[]>([]);
  loading = signal(false);

  // Grid configuration - Maksimum 8 sütun
  gridColumns: DataGridColumn[] = [
    { field: 'info', headerName: 'Ana Bilgiler', flex: 1, hide: false },
    { field: 'status', headerName: 'Durum', width: 120, hide: false },
    { field: 'date', headerName: 'Tarih', width: 140, hide: false },
    { field: 'owner', headerName: 'Sorumlu', width: 120, hide: false },
    { field: 'extra1', headerName: 'Ek Bilgi 1', width: 140, hide: true },
    { field: 'extra2', headerName: 'Ek Bilgi 2', width: 140, hide: true },
    { field: 'extra3', headerName: 'Ek Bilgi 3', width: 140, hide: true },
    { field: 'extra4', headerName: 'Ek Bilgi 4', width: 140, hide: true }
  ];

  gridActions: DataGridAction[] = [...];
  gridConfig: DataGridConfig = {
    enableColumnResize: true,
    enableColumnReorder: true,
    paginationPageSize: 15, // İlk yükleme 15 satır
    enablePagination: true,
    rowHeight: 60, // 15 satır * 60px = 900px optimal yükseklik
    enableAutoSizeColumns: false, // Manuel kontrol
    ...
  };

  // Main actions
  createNew() { ... }
  bulkAction() { ... }
  export() { ... }

  // Row actions
  viewDetails(row: EntityType) { ... }
  editRow(row: EntityType) { ... }
  deleteRow(row: EntityType) { ... }
}
```

### Template Yapısı
```html
<div class="page-container">
  <!-- Header -->
  <div class="page-header">
    <div class="title-section">
      <h1><mat-icon>icon</mat-icon>Sayfa Başlığı</h1>
      <p>Açıklama metni</p>
    </div>
    <div class="actions-section">
      <button mat-raised-button color="primary" (click)="createNew()">
        <mat-icon>add</mat-icon>Yeni Ekle
      </button>
      <button mat-raised-button color="accent" (click)="bulkAction()" *ngIf="hasBulkActions">
        <mat-icon>checklist</mat-icon>Toplu İşlem
      </button>
      <button mat-icon-button matTooltip="Excel'e Aktar" (click)="export()">
        <mat-icon>download</mat-icon>
      </button>
      <button mat-icon-button matTooltip="Yenile" (click)="refresh()">
        <mat-icon>refresh</mat-icon>
      </button>
    </div>
  </div>

  <!-- Data Grid -->
  <div class="grid-section">
    <app-data-grid
      [data]="data()"
      [columns]="gridColumns"
      [actions]="gridActions"
      [config]="gridConfig"
      [loading]="loading()">
    </app-data-grid>
  </div>
</div>
```

### CSS Standardı
```css
.page-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.title-section h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 28px;
  font-weight: 500;
  color: #1976d2;
}

.actions-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.grid-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```

## Grid Özellikleri Rehberi

### Unified Info Column Pattern
```typescript
{
  field: 'info',
  headerName: 'Ana Bilgiler',
  flex: 1,
  minWidth: 350,
  cellRenderer: CellRendererHelpers.createInfoRenderer(),
  valueGetter: (params: any) => {
    const data = params.data;
    return `${data.name} ${data.code} ${data.email} ${data.phone}`;
  }
}
```

### Date Column Pattern
```typescript
{
  field: 'createdDate',
  headerName: 'Oluşturma Tarihi',
  width: 140,
  cellRenderer: CellRendererHelpers.createDateRenderer(),
  filter: 'agDateColumnFilter'
}
```

### Status Column Pattern
- Status bilgileri unified info column içinde badge olarak gösterilecek
- Ayrı status sütunu oluşturulmayacak

### Actions Configuration
```typescript
gridActions: DataGridAction[] = [
  {
    icon: 'visibility',
    tooltip: 'Detayları Görüntüle',
    color: undefined, // Default gri renk
    click: (row) => this.viewDetails(row)
  },
  {
    icon: 'edit',
    tooltip: 'Düzenle',
    color: 'primary',
    click: (row) => this.editRow(row)
  },
  {
    icon: 'content_copy',
    tooltip: 'Kopyala',
    color: 'accent',
    click: (row) => this.duplicateRow(row)
  },
  {
    icon: 'person_add',
    tooltip: 'Kişi Ekle',
    color: 'accent',
    visible: (row) => row.type === 'Account',
    click: (row) => this.addContact(row)
  },
  {
    icon: 'delete',
    tooltip: 'Sil',
    color: 'warn',
    click: (row) => this.deleteRow(row),
    visible: (row) => this.canDelete(row)
  }
];
```

#### Context Menu Renk Kuralları
- **İlk Grup (Görüntüleme)**: Default renk
- **İkinci Grup (Düzenleme/İşlemler)**: Primary ve Accent
- **Son Grup (Tehlikeli)**: Warn rengi, ayırıcı ile ayrılmış

## Anti-Patterns (Yapılmaması Gerekenler)

### ❌ Kötü Örnekler
- Ayrı filter paneli oluşturma
- Grid dışında search box ekleme
- Her sütun için ayrı renderer yazma
- Karmaşık nested layout'lar
- Gereksiz card wrapper'lar
- Emoji kullanımı (Material Icons tercih edilmeli)
- Çok sayıda sütun (8+)
- Grid üstünde/yanında extra widget'lar
- 15'ten fazla veri ilk yüklemede

### ✅ İyi Örnekler
- Unified info column kullanımı
- Grid'in native filtering'i
- Context menu ile row actions
- Minimal toolbar
- Single purpose buttons
- Responsive column management
- Clean, professional appearance
- İlk yükleme 15 satır ile optimal görünüm
- Sütun görünürlük kontrolü
- Maksimum 8 sütun sınırı
- Material Design Icons kullanımı
- Renk kodlu buton sistemı

## Uygulama Kontrolü

Yeni sayfa geliştirirken aşağıdaki checklist'i kontrol edin:

- [ ] Sayfa sadece grid içeriyor mu?
- [ ] Ana işlemler üst toolbar'da mı?
- [ ] Satır işlemleri context menu'de mi?
- [ ] Grid'in kendi filter'ları kullanılıyor mu?
- [ ] Unified info column pattern uygulanmış mı?
- [ ] Maksimum 8 sütun sınırı uygulanmış mı?
- [ ] İlk yükleme 15 satır mı?
- [ ] Sütun görünürlük kontrolü var mı?
- [ ] Tüm veriler tek ekranda görünüyor mu?
- [ ] Material Design Icons kullanılıyor mu?
- [ ] Buton renkleri işleve göre doğru mu?
- [ ] Emoji kullanımı var mı? (olmamalı)
- [ ] Gereksiz bileşen yok mu?
- [ ] Mobile responsive tasarım var mı?
- [ ] Loading/Error states handle ediliyor mu?
- [ ] Accessibility standartları karşılanıyor mu?

## Örnek Implementasyonlar

Bu rehbere uygun örnek sayfalar:
- `/src/app/features/crm/accounts/` - Hesap Yönetimi
- `/src/app/features/leads/` - Lead Yönetimi
- `/src/app/features/admin/users/` - Kullanıcı Yönetimi

---

**Not**: Bu rehber sistem genelinde tutarlılık sağlamak için hazırlanmıştır. Özel durumlar için önce team lead ile görüşülmelidir.
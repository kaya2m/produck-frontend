# Produck UI Components Library

Bu dosya Produck uygulaması için özel olarak tasarlanmış ortak UI bileşenlerini içermektedir. Bu bileşenler sistem genelinde tutarlılık sağlamak ve geliştirme sürecini hızlandırmak için oluşturulmuştur.

## Kullanım

### SharedModule ile Kullanım

Tüm bileşenler SharedModule'den export edilir:

```typescript
import { SharedModule } from '@shared/shared.module';

@Component({
  imports: [SharedModule]
})
export class MyComponent {}
```

### Doğrudan Import

Belirli bileşenleri doğrudan import edebilirsiniz:

```typescript
import { InputComponent, ButtonComponent } from '@shared/components/ui';
```

## Bileşenler

### 1. InputComponent (`app-input`)

Gelişmiş form input bileşeni. ControlValueAccessor implementasyonu ile reactive form desteği.

**Özellikler:**
- Çoklu input tipleri (text, email, password, number, tel, url, search)
- 3 boyut seçeneği (small, medium, large)
- 3 görünüm seçeneği (outline, fill, legacy)
- Prefix/suffix icon desteği
- Clear button ve password toggle
- Loading state
- Validation error handling
- Accessibility desteği

**Kullanım:**
```html
<app-input
  label="Email"
  type="email"
  size="medium"
  variant="outline"
  prefixIcon="email"
  clearable="true"
  [(ngModel)]="emailValue">
</app-input>
```

### 2. ButtonComponent (`app-button`)

Çok amaçlı button bileşeni. Farklı stil ve durum seçenekleri.

**Özellikler:**
- 7 farklı variant (basic, raised, stroked, flat, icon, fab, mini-fab)
- 6 renk seçeneği (primary, accent, warn, success, info, default)
- 3 boyut seçeneği (small, medium, large)
- Loading state ve custom loading metni
- Leading/trailing icon desteği
- Tooltip desteği
- Full width seçeneği

**Kullanım:**
```html
<app-button
  variant="raised"
  color="primary"
  size="medium"
  text="Save Changes"
  leadingIcon="save"
  [loading]="isSaving"
  loadingText="Saving..."
  (buttonClick)="onSave()">
</app-button>
```

### 3. CardComponent (`app-card`)

Esnek card/kart bileşeni. İçerik gösterimi için ideal.

**Özellikler:**
- 4 görünüm seçeneği (default, outlined, elevated, flat)
- 3 boyut seçeneği (small, medium, large)
- Header ve footer desteği
- Avatar ve image desteği
- Hover efektleri
- Clickable seçeneği
- State gösterimi (error, success, warning)
- Content projection ile esnek içerik

**Kullanım:**
```html
<app-card
  title="User Profile"
  subtitle="Personal Information"
  variant="elevated"
  size="medium"
  [hover]="true">

  <div>Card content goes here</div>

  <div slot="actions">
    <app-button variant="stroked" text="Edit"></app-button>
    <app-button variant="raised" text="Save"></app-button>
  </div>
</app-card>
```

### 4. ModalComponent (`app-modal`)

Gelişmiş modal/dialog bileşeni. MatDialog ile entegre.

**Özellikler:**
- 5 boyut seçeneği (small, medium, large, extra-large, full)
- 5 tip seçeneği (info, success, warning, error, confirm)
- Custom action butonları
- Loading state
- Close button kontrolü
- Responsive tasarım
- Accessibility desteği

**Kullanım:**
```typescript
// Service ile açma
const dialogRef = this.dialog.open(ModalComponent, {
  data: {
    title: 'Confirm Action',
    message: 'Are you sure you want to delete this item?',
    type: 'confirm',
    size: 'medium'
  }
});
```

```html
<!-- Template içinde -->
<app-modal
  title="Form Dialog"
  type="info"
  size="large"
  [showActions]="true">

  <form>
    <!-- Form içeriği -->
  </form>
</app-modal>
```

### 5. TableComponent (`app-table`)

Kapsamlı tablo bileşeni. MatTable tabanlı, gelişmiş özelliklerle.

**Özellikler:**
- Esnek kolon tanımları
- Sorting ve pagination
- Row selection (çoklu seçim)
- Farklı cell tipleri (text, number, date, currency, badge, actions)
- Custom template desteği
- Loading ve empty state
- Responsive tasarım
- Action menüler
- 3 boyut seçeneği (compact, standard, comfortable)
- 4 stil seçeneği (default, striped, bordered, borderless)

**Kullanım:**
```typescript
// Component'te
columns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'createdAt', label: 'Created', type: 'date' },
  { key: 'actions', label: 'Actions', type: 'actions' }
];

data = [
  { name: 'John Doe', email: 'john@example.com', status: 'active', createdAt: new Date() }
];

rowActions: TableAction[] = [
  { icon: 'edit', label: 'Edit', action: 'edit' },
  { icon: 'delete', label: 'Delete', action: 'delete', color: 'warn' }
];
```

```html
<app-table
  title="Users"
  subtitle="Manage system users"
  [columns]="columns"
  [data]="data"
  [rowActions]="rowActions"
  [selectable]="true"
  [paginator]="true"
  size="standard"
  variant="striped"
  (actionClick)="onAction($event)"
  (rowClick)="onRowClick($event)">
</app-table>
```

## Design Tokens

Sistem genelinde tutarlılık için design token'lar kullanılmaktadır:

- **Colors**: Primary, secondary, success, warning, error, info paleti
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (4px base)
- **Border Radius**: Rounded corners scale
- **Shadows**: Depth indication için shadow scale
- **Transitions**: Smooth animations için timing

Design token'lara `@shared/styles/design-tokens.scss` dosyasından erişebilirsiniz.

## Tema Desteği

Bileşenler hem light hem dark tema desteklemektedir. Tema değişimi `.dark-theme` class'ı ile yapılır.

## Accessibility

Tüm bileşenler WCAG 2.1 AA standartlarına uygun olarak tasarlanmıştır:

- Keyboard navigation desteği
- Screen reader uyumluluğu
- Focus indicators
- ARIA attributes
- Semantic HTML kullanımı

## Geliştirme Notları

- Tüm bileşenler standalone'dir
- OnPush change detection kullanılır
- TypeScript strict mode uyumludur
- Unit test'ler eklenmelidir
- Storybook hikayeler yarakılmalıdır

## İleride Eklenebilecek Bileşenler

- DatePickerComponent
- SelectComponent
- CheckboxComponent
- RadioComponent
- ToggleComponent
- SliderComponent
- ProgressComponent
- BadgeComponent
- AvatarComponent
- BreadcrumbComponent
- PaginationComponent
- TabsComponent
- AccordionComponent
- ToastComponent
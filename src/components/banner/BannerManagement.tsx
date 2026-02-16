import { useState } from 'react'
import { useBanners } from '../../hooks/useBanners'
import { Banner } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, Image as ImageIcon, Link, Calendar, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react'

export default function BannerManagement() {
  const { banners, loading, refetch, createBanner, updateBanner, deleteBanner, toggleActive } = useBanners()
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '', subtitle: '', image_url: '', link_to: '', is_active: true, display_order: 0, start_date: '', end_date: '',
  })

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', image_url: '', link_to: '', is_active: true, display_order: banners.length, start_date: '', end_date: '' })
    setEditingBanner(null)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title, subtitle: banner.subtitle || '', image_url: banner.image_url,
      link_to: banner.link_to || '', is_active: banner.is_active, display_order: banner.display_order,
      start_date: banner.start_date?.split('T')[0] || '', end_date: banner.end_date?.split('T')[0] || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    setActionLoading('submit')
    if (editingBanner) {
      await updateBanner(editingBanner.id, formData)
    } else {
      await createBanner(formData)
    }
    setActionLoading(null)
    setShowModal(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    setActionLoading(id)
    await deleteBanner(id)
    setActionLoading(null)
  }

  const handleToggle = async (id: string, current: boolean) => {
    setActionLoading(id)
    await toggleActive(id, !current)
    setActionLoading(null)
  }

  const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Promo Banners</h2>
            <p className="text-sm text-muted-foreground">{banners.length} banners</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refetch}><RefreshCw size={18} /></Button>
            <Button onClick={() => { resetForm(); setShowModal(true) }}><Plus size={18} className="mr-2" /> Add Banner</Button>
          </div>
        </CardContent>
      </Card>

      {/* Banners Grid */}
      {loading ? (
        <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
      ) : banners.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><ImageIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No banners yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <Card key={banner.id} className={!banner.is_active ? 'opacity-60' : ''}>
              <div className="relative aspect-[2/1] bg-muted rounded-t-lg overflow-hidden">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-muted-foreground/30" /></div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant={banner.is_active ? 'success' : 'secondary'}>{banner.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="absolute top-2 left-2"><Badge variant="outline" className="bg-background">#{index + 1}</Badge></div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={14} />
                  <span>{formatDate(banner.start_date)} - {formatDate(banner.end_date)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleToggle(banner.id, banner.is_active)} disabled={actionLoading === banner.id}>
                      {banner.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}><Edit2 size={18} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} disabled={actionLoading === banner.id} className="text-destructive"><Trash2 size={18} /></Button>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled={index === 0}><ArrowUp size={16} /></Button>
                    <Button variant="ghost" size="icon" disabled={index === banners.length - 1}><ArrowDown size={16} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Title *</label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Banner title" /></div>
            <div><label className="text-sm font-medium">Subtitle</label><Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Optional subtitle" /></div>
            <div><label className="text-sm font-medium">Image URL *</label><div className="flex gap-2"><Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." /><Button variant="outline" size="icon"><ImageIcon size={18} /></Button></div></div>
            <div><label className="text-sm font-medium">Link To</label><div className="relative"><Link className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input value={formData.link_to} onChange={(e) => setFormData({ ...formData, link_to: e.target.value })} placeholder="https://..." className="pl-10" /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Start Date</label><Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} /></div>
              <div><label className="text-sm font-medium">End Date</label><Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
              <label htmlFor="is_active" className="text-sm">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); resetForm() }}><X size={18} className="mr-2" /> Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.title || !formData.image_url || actionLoading === 'submit'}><Save size={18} className="mr-2" /> {editingBanner ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, Loader2, Store, CreditCard, Truck, Mail, Shield, Globe } from "lucide-react"
import { toast } from "sonner"

interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeCity: string
  storeState: string
  storePincode: string
  storeCountry: string
  storeCurrency: string
  storeTimezone: string
  gstNumber: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  googleVerification: string
  razorpayEnabled: boolean
  codEnabled: boolean
  codMaxAmount: string
  defaultShippingCost: string
  freeShippingAbove: string
  estimatedDeliveryDays: string
  smtpHost: string
  smtpPort: string
  smtpUser: string
  orderConfirmationEmail: boolean
  shippingUpdateEmail: boolean
  returnWindowDays: string
  exchangeWindowDays: string
  refundWindowDays: string
}

const DEFAULTS: StoreSettings = {
  storeName: "SilverLine",
  storeEmail: "info@silverline925.in",
  storePhone: "+919512765399",
  storeAddress: "Ahmedabad, Gujarat",
  storeCity: "Ahmedabad",
  storeState: "Gujarat",
  storePincode: "380001",
  storeCountry: "India",
  storeCurrency: "INR",
  storeTimezone: "Asia/Kolkata",
  gstNumber: "",
  metaTitle: "SilverLine | Premium Handcrafted Silver Jewelry",
  metaDescription: "Discover exquisite handcrafted silver jewelry. Shop rings, necklaces, bracelets and more.",
  metaKeywords: "silver jewelry, sterling silver, handcrafted, rings, necklaces, bracelets",
  googleVerification: "GNfOsLKh6Bcx3vSJb6Fmn1bWDFfHCcHfCxne4mQW7Xs",
  razorpayEnabled: true,
  codEnabled: true,
  codMaxAmount: "5000",
  defaultShippingCost: "99",
  freeShippingAbove: "999",
  estimatedDeliveryDays: "5-7",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  orderConfirmationEmail: true,
  shippingUpdateEmail: true,
  returnWindowDays: "7",
  exchangeWindowDays: "7",
  refundWindowDays: "7",
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings?category=general")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const entries = data?.settings?.general || []
        const entry = entries.find((s: any) => s.key === "store_config")
        if (entry) {
          try { setSettings({ ...DEFAULTS, ...JSON.parse(entry.value) }) } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const update = (key: keyof StoreSettings, value: string | boolean) =>
    setSettings((s) => ({ ...s, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: [{
            key: "store_config",
            value: JSON.stringify(settings),
            category: "general",
            description: "Store configuration",
            dataType: "json",
            isPublic: false,
          }],
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your store</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Store Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Store Name" value={settings.storeName} onChange={(v) => update("storeName", v)} />
                <Field label="Store Email" type="email" value={settings.storeEmail} onChange={(v) => update("storeEmail", v)} />
                <Field label="Phone Number" value={settings.storePhone} onChange={(v) => update("storePhone", v)} />
                <Field label="GST Number" value={settings.gstNumber} onChange={(v) => update("gstNumber", v)} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div className="space-y-2">
                <Label>Store Address</Label>
                <Textarea value={settings.storeAddress} onChange={(e) => update("storeAddress", e.target.value)} rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="City" value={settings.storeCity} onChange={(v) => update("storeCity", v)} />
                <Field label="State" value={settings.storeState} onChange={(v) => update("storeState", v)} />
                <Field label="Pincode" value={settings.storePincode} onChange={(v) => update("storePincode", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.storeCurrency} onValueChange={(v) => update("storeCurrency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.storeTimezone} onValueChange={(v) => update("storeTimezone", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Meta Title</Label>
                <Input value={settings.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
                <p className="text-xs text-muted-foreground">{settings.metaTitle.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={settings.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">{settings.metaDescription.length}/160 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Textarea value={settings.metaKeywords} onChange={(e) => update("metaKeywords", e.target.value)} rows={2} />
              </div>
              <Field label="Google Search Console Verification Token" value={settings.googleVerification} onChange={(v) => update("googleVerification", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Methods</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow
                label="Razorpay"
                description="Credit/Debit Card, UPI, Net Banking, Wallets"
                checked={settings.razorpayEnabled}
                onChange={(v) => update("razorpayEnabled", v)}
              />
              <Separator />
              <ToggleRow
                label="Cash on Delivery (COD)"
                description="Payment collected at delivery"
                checked={settings.codEnabled}
                onChange={(v) => update("codEnabled", v)}
              />
              {settings.codEnabled && (
                <div className="ml-4 space-y-2">
                  <Label>Maximum COD Order Amount (₹)</Label>
                  <Input type="number" value={settings.codMaxAmount} onChange={(e) => update("codMaxAmount", e.target.value)} className="max-w-[200px]" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Shipping Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Default Shipping Cost (₹)" type="number" value={settings.defaultShippingCost} onChange={(v) => update("defaultShippingCost", v)} />
                <div className="space-y-2">
                  <Label>Free Shipping Above (₹)</Label>
                  <Input type="number" value={settings.freeShippingAbove} onChange={(e) => update("freeShippingAbove", e.target.value)} />
                  <p className="text-xs text-muted-foreground">Set 0 to disable</p>
                </div>
                <Field label="Estimated Delivery (days)" value={settings.estimatedDeliveryDays} onChange={(v) => update("estimatedDeliveryDays", v)} placeholder="5-7" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Configuration</CardTitle>
              <CardDescription>SMTP settings for transactional emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="SMTP Host" value={settings.smtpHost} onChange={(v) => update("smtpHost", v)} placeholder="smtp.gmail.com" />
                <Field label="SMTP Port" value={settings.smtpPort} onChange={(v) => update("smtpPort", v)} placeholder="587" />
                <div className="space-y-2 col-span-2">
                  <Field label="SMTP Username / Email" value={settings.smtpUser} onChange={(v) => update("smtpUser", v)} placeholder="your@email.com" />
                </div>
              </div>
              <Separator />
              <p className="text-sm font-medium">Email Notifications</p>
              <ToggleRow label="Order Confirmation" description="Send to customer when order is placed" checked={settings.orderConfirmationEmail} onChange={(v) => update("orderConfirmationEmail", v)} />
              <ToggleRow label="Shipping Update" description="Send when order is shipped" checked={settings.shippingUpdateEmail} onChange={(v) => update("shippingUpdateEmail", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Return & Refund Policy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Return Window (days)" type="number" value={settings.returnWindowDays} onChange={(v) => update("returnWindowDays", v)} />
                <Field label="Exchange Window (days)" type="number" value={settings.exchangeWindowDays} onChange={(v) => update("exchangeWindowDays", v)} />
                <Field label="Refund Window (days)" type="number" value={settings.refundWindowDays} onChange={(v) => update("refundWindowDays", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Changes
        </Button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Megaphone, Facebook, Mail, Tag, BarChart3, Loader2, Save, CheckCircle, ExternalLink, Globe } from "lucide-react"
import { toast } from "sonner"

interface MarketingSettings {
  // Meta / Facebook
  metaPixelId: string
  metaPixelEnabled: boolean
  metaConversionsApiToken: string
  // Google
  googleAdsId: string
  googleAdsEnabled: boolean
  googleConversionLabel: string
  googleAnalyticsId: string
  // WhatsApp
  whatsappNumber: string
  whatsappEnabled: boolean
  whatsappMessage: string
  // Email Marketing
  emailMarketingEnabled: boolean
  emailListId: string
  // Announcement Bar
  announcementEnabled: boolean
  announcementText: string
  announcementLink: string
  announcementBgColor: string
  // Promotions
  freeShippingThreshold: string
  sitewideSaleEnabled: boolean
  sitewideSalePercent: string
  sitewideSaleBadge: string
  // UTM defaults
  utmSource: string
  utmMedium: string
}

const DEFAULTS: MarketingSettings = {
  metaPixelId: "",
  metaPixelEnabled: false,
  metaConversionsApiToken: "",
  googleAdsId: "",
  googleAdsEnabled: false,
  googleConversionLabel: "",
  googleAnalyticsId: "G-540X2R7K0E",
  whatsappNumber: "+919512765399",
  whatsappEnabled: true,
  whatsappMessage: "Hi, I'd like to know more about your silver jewelry collection!",
  emailMarketingEnabled: false,
  emailListId: "",
  announcementEnabled: false,
  announcementText: "🎉 Free shipping on orders above ₹999! Use code FREESHIP",
  announcementLink: "/shop",
  announcementBgColor: "#1a1a1a",
  freeShippingThreshold: "999",
  sitewideSaleEnabled: false,
  sitewideSalePercent: "10",
  sitewideSaleBadge: "SALE",
  utmSource: "silverline925",
  utmMedium: "social",
}

const SETTING_KEY = "marketing_config"

export default function AdminMarketingPage() {
  const [settings, setSettings] = useState<MarketingSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings?category=marketing")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const mkt = data?.settings?.marketing
        if (mkt) {
          const entry = mkt.find((s: any) => s.key === SETTING_KEY)
          if (entry) {
            try { setSettings({ ...DEFAULTS, ...JSON.parse(entry.value) }) } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const update = (key: keyof MarketingSettings, value: string | boolean) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: [{
            key: SETTING_KEY,
            value: JSON.stringify(settings),
            category: "marketing",
            description: "Marketing & ads configuration",
            dataType: "json",
            isPublic: false,
          }],
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Marketing settings saved")
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
          <h1 className="text-2xl font-bold">Marketing & Ads</h1>
          <p className="text-sm text-muted-foreground">Configure tracking pixels, promotions, and ad integrations</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="pixels">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="pixels">Pixels & Tracking</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="utm">UTM Builder</TabsTrigger>
        </TabsList>

        {/* Pixels & Tracking */}
        <TabsContent value="pixels" className="space-y-4 mt-4">
          {/* Meta Pixel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 rounded p-2">
                    <Facebook className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Meta Pixel (Facebook & Instagram Ads)</CardTitle>
                    <CardDescription>Track conversions from Facebook and Instagram ads</CardDescription>
                  </div>
                </div>
                <Switch checked={settings.metaPixelEnabled} onCheckedChange={(v) => update("metaPixelEnabled", v)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pixel ID</Label>
                <Input
                  value={settings.metaPixelId}
                  onChange={(e) => update("metaPixelId", e.target.value)}
                  placeholder="e.g. 1234567890123456"
                />
                <p className="text-xs text-muted-foreground">
                  Find in Meta Business Manager → Events Manager → Your Pixel
                </p>
              </div>
              <div className="space-y-2">
                <Label>Conversions API Token <Badge variant="outline" className="ml-2 text-xs">Optional</Badge></Label>
                <Input
                  type="password"
                  value={settings.metaConversionsApiToken}
                  onChange={(e) => update("metaConversionsApiToken", e.target.value)}
                  placeholder="Server-side events token"
                />
                <p className="text-xs text-muted-foreground">Improves attribution with server-side events (IOS14+ tracking)</p>
              </div>
              {settings.metaPixelEnabled && settings.metaPixelId && (
                <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Pixel {settings.metaPixelId} is active. Events tracked: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                <p className="font-medium mb-1">Events automatically tracked:</p>
                <div className="grid grid-cols-2 gap-1">
                  {["PageView (all pages)", "ViewContent (product pages)", "AddToCart", "InitiateCheckout", "Purchase (order confirmed)", "Search"].map(e => (
                    <span key={e} className="flex items-center gap-1">✓ {e}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Ads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 rounded p-2">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Google Ads & Analytics</CardTitle>
                    <CardDescription>Track purchases and conversions from Google Ads</CardDescription>
                  </div>
                </div>
                <Switch checked={settings.googleAdsEnabled} onCheckedChange={(v) => update("googleAdsEnabled", v)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={settings.googleAnalyticsId}
                    onChange={(e) => update("googleAnalyticsId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Ads Conversion ID</Label>
                  <Input
                    value={settings.googleAdsId}
                    onChange={(e) => update("googleAdsId", e.target.value)}
                    placeholder="AW-XXXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conversion Label</Label>
                <Input
                  value={settings.googleConversionLabel}
                  onChange={(e) => update("googleConversionLabel", e.target.value)}
                  placeholder="xxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">Found in Google Ads → Tools → Conversions → Purchase conversion</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions */}
        <TabsContent value="promotions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" /> Shipping Promotions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Free Shipping Threshold (₹)</Label>
                <Input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => update("freeShippingThreshold", e.target.value)}
                  placeholder="999"
                />
                <p className="text-xs text-muted-foreground">Set to 0 to disable free shipping threshold</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sitewide Sale Banner</CardTitle>
                <Switch checked={settings.sitewideSaleEnabled} onCheckedChange={(v) => update("sitewideSaleEnabled", v)} />
              </div>
              <CardDescription>Shows a sale badge on all products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Percentage</Label>
                  <Input
                    type="number"
                    value={settings.sitewideSalePercent}
                    onChange={(e) => update("sitewideSalePercent", e.target.value)}
                    placeholder="10"
                    min={1}
                    max={90}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Text</Label>
                  <Input
                    value={settings.sitewideSaleBadge}
                    onChange={(e) => update("sitewideSaleBadge", e.target.value)}
                    placeholder="SALE"
                  />
                </div>
              </div>
              {settings.sitewideSaleEnabled && (
                <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-700">
                  Sitewide {settings.sitewideSalePercent}% sale is ACTIVE — badge "{settings.sitewideSaleBadge}" shown on all products
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">WhatsApp Business</CardTitle>
                <Switch checked={settings.whatsappEnabled} onCheckedChange={(v) => update("whatsappEnabled", v)} />
              </div>
              <CardDescription>Floating WhatsApp chat button on website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input
                  value={settings.whatsappNumber}
                  onChange={(e) => update("whatsappNumber", e.target.value)}
                  placeholder="+919512765399"
                />
                <p className="text-xs text-muted-foreground">Include country code (e.g. +91 for India)</p>
              </div>
              <div className="space-y-2">
                <Label>Pre-filled Message</Label>
                <Textarea
                  value={settings.whatsappMessage}
                  onChange={(e) => update("whatsappMessage", e.target.value)}
                  rows={3}
                />
              </div>
              {settings.whatsappEnabled && settings.whatsappNumber && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(settings.whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" /> Test WhatsApp Link
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Announcement Bar</CardTitle>
                <Switch checked={settings.announcementEnabled} onCheckedChange={(v) => update("announcementEnabled", v)} />
              </div>
              <CardDescription>Top-of-site banner for promotions and announcements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Announcement Text</Label>
                <Input
                  value={settings.announcementText}
                  onChange={(e) => update("announcementText", e.target.value)}
                  placeholder="🎉 Free shipping on orders above ₹999!"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link URL</Label>
                  <Input
                    value={settings.announcementLink}
                    onChange={(e) => update("announcementLink", e.target.value)}
                    placeholder="/shop"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.announcementBgColor}
                      onChange={(e) => update("announcementBgColor", e.target.value)}
                      className="h-10 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      value={settings.announcementBgColor}
                      onChange={(e) => update("announcementBgColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {settings.announcementEnabled && (
                <div
                  className="rounded p-3 text-center text-sm font-medium text-white"
                  style={{ backgroundColor: settings.announcementBgColor }}
                >
                  {settings.announcementText || "Your announcement here"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* UTM Builder */}
        <TabsContent value="utm" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" /> UTM Link Builder
              </CardTitle>
              <CardDescription>Build tracking links for your ad campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default UTM Source</Label>
                  <Input value={settings.utmSource} onChange={(e) => update("utmSource", e.target.value)} placeholder="silverline925" />
                </div>
                <div className="space-y-2">
                  <Label>Default UTM Medium</Label>
                  <Input value={settings.utmMedium} onChange={(e) => update("utmMedium", e.target.value)} placeholder="social" />
                </div>
              </div>
              <Separator />
              <UTMBuilder baseUrl="https://www.silverline925.in" defaultSource={settings.utmSource} defaultMedium={settings.utmMedium} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UTMBuilder({ baseUrl, defaultSource, defaultMedium }: { baseUrl: string; defaultSource: string; defaultMedium: string }) {
  const [url, setUrl] = useState("/shop")
  const [source, setSource] = useState(defaultSource)
  const [medium, setMedium] = useState(defaultMedium)
  const [campaign, setCampaign] = useState("")
  const [content, setContent] = useState("")
  const [term, setTerm] = useState("")

  const params = new URLSearchParams()
  if (source) params.set("utm_source", source)
  if (medium) params.set("utm_medium", medium)
  if (campaign) params.set("utm_campaign", campaign)
  if (content) params.set("utm_content", content)
  if (term) params.set("utm_term", term)

  const fullUrl = `${baseUrl}${url}${params.toString() ? "?" + params.toString() : ""}`

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Page URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/shop" />
        </div>
        <div className="space-y-2">
          <Label>Campaign Name</Label>
          <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="diwali_sale_2024" />
        </div>
        <div className="space-y-2">
          <Label>UTM Source</Label>
          <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="instagram" />
        </div>
        <div className="space-y-2">
          <Label>UTM Medium</Label>
          <Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc" />
        </div>
        <div className="space-y-2">
          <Label>UTM Content</Label>
          <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="ring_banner_v1" />
        </div>
        <div className="space-y-2">
          <Label>UTM Term</Label>
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="silver+rings" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Generated URL</Label>
        <div className="flex gap-2">
          <Input value={fullUrl} readOnly className="font-mono text-xs bg-gray-50" />
          <Button
            variant="outline"
            onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("Copied!") }}
          >
            Copy
          </Button>
        </div>
      </div>
    </div>
  )
}

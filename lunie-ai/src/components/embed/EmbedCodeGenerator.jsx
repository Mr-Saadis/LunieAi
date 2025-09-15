
// src/components/embed/EmbedCodeGenerator.jsx
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, ExternalLink, Settings, Globe, Code } from 'lucide-react'
import { toast } from 'sonner'

export default function EmbedCodeGenerator({ chatbot }) {
  const [domain, setDomain] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateEmbedCode = useCallback(async () => {
    if (!domain.trim()) {
      toast.error('Please enter your website domain')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/widget/embed/${chatbot.id}?domain=${encodeURIComponent(domain)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate embed code')
      }

      setEmbedCode(data.embedCode)
      toast.success('Embed code generated successfully!')
    } catch (error) {
      console.error('Embed generation error:', error)
      toast.error(error.message)
    } finally {
      setIsGenerating(false)
    }
  }, [chatbot.id, domain])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const iframeCode = `<iframe 
  src="${process.env.NEXT_PUBLIC_APP_URL}/widget/${chatbot.id}" 
  width="400" 
  height="500" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</iframe>`

  return (
    <div className="space-y-6">
      {/* Domain Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Website Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="domain">Your Website Domain</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="http://localhost:3000"
                className="flex-1"
              />
              <Button 
                onClick={generateEmbedCode}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This will be used for security validation and analytics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Embed Options */}
      <Card>
        <CardHeader>
          <CardTitle>Embed Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript Widget</TabsTrigger>
              <TabsTrigger value="iframe">Simple iframe</TabsTrigger>
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            </TabsList>

            <TabsContent value="javascript" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">JavaScript Embed Code</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Recommended
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Full-featured floating widget with customization options. 
                  Paste this code before the closing &lt;/body&gt; tag.
                </p>
                
                {embedCode ? (
                  <div className="relative">
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(embedCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                    Enter your domain and click "Generate" to create embed code
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="iframe" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">iframe Embed</h3>
                  <Badge variant="outline">Simple</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Basic iframe integration. Works everywhere but with limited customization.
                </p>
                
                <div className="relative">
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                    <code>{iframeCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(iframeCode)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wordpress" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">WordPress Integration</h3>
                  <Badge variant="outline">CMS</Badge>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>Method 1: Custom HTML Widget</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Go to Appearance → Widgets in your WordPress admin</li>
                    <li>Add a "Custom HTML" widget</li>
                    <li>Paste the JavaScript embed code</li>
                    <li>Save the widget</li>
                  </ol>
                  
                  <p className="mt-4"><strong>Method 2: Theme Customizer</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Go to Appearance → Customize → Additional CSS</li>
                    <li>Scroll to the bottom and add the embed code</li>
                    <li>Publish your changes</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Widget Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Preview & Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Test your widget before embedding it on your website.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/widget/${chatbot.id}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/dashboard/chatbots/${chatbot.id}/customize`, '_blank')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize Widget
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Domain Security</h4>
              <p className="text-sm text-gray-600">
                Your widget will only work on approved domains to prevent unauthorized usage.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Usage Analytics</h4>
              <p className="text-sm text-gray-600">
                Track conversations, user engagement, and performance metrics in your dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
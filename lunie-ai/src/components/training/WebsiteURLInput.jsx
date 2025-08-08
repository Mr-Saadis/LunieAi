'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, Plus, Loader2, CheckCircle, AlertCircle, FileText, 
  ExternalLink, Clock, Search 
} from 'lucide-react'
import { toast } from 'sonner'

const WebsiteURLInput = ({ chatbotId, onWebsiteAdded }) => {
  const [activeTab, setActiveTab] = useState('single')
  const [singleUrl, setSingleUrl] = useState('')
  const [bulkUrls, setBulkUrls] = useState('')
  const [crawlDepth, setCrawlDepth] = useState(2)
  const [crawlFrequency, setCrawlFrequency] = useState('weekly')
  const [includeSubdomains, setIncludeSubdomains] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validation, setValidation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateUrl = async (url) => {
    setIsValidating(true)
    try {
      const response = await fetch('/api/websites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, chatbotId })
      })
      
      const result = await response.json()
      setValidation(result)
      return result.isValid
    } catch (error) {
      setValidation({
        isValid: false,
        error: 'Failed to validate URL',
        details: error.message
      })
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSingleUrlChange = async (e) => {
    const url = e.target.value
    setSingleUrl(url)
    
    if (url && isValidUrl(url)) {
      await validateUrl(url)
    } else {
      setValidation(null)
    }
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const urls = activeTab === 'single' 
        ? [singleUrl.trim()]
        : bulkUrls.split('\n').map(url => url.trim()).filter(Boolean)

      const websiteData = {
        urls,
        chatbotId,
        crawlDepth,
        crawlFrequency,
        includeSubdomains
      }

      const response = await fetch('/api/websites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData)
      })

      if (response.ok) {
        const result = await response.json()
        onWebsiteAdded?.(result)
        
        // Reset form
        setSingleUrl('')
        setBulkUrls('')
        setValidation(null)
        
        toast.success('Website(s) added successfully and crawling has started!')
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error adding website:', error)
      toast.error('Failed to add website. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ValidationDisplay = () => {
    if (!validation) return null

    return (
      <div className={`mt-3 p-3 rounded-lg border ${
        validation.isValid 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-start gap-2">
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-medium">
              {validation.isValid ? 'Website is accessible' : 'Validation failed'}
            </p>
            {validation.title && (
              <p className="text-sm mt-1">Title: {validation.title}</p>
            )}
            {validation.description && (
              <p className="text-sm mt-1">Description: {validation.description}</p>
            )}
            {validation.robotsAllowed !== undefined && (
              <p className="text-sm mt-1">
                Robots.txt: {validation.robotsAllowed ? 'Allowed' : 'Restricted'}
              </p>
            )}
            {validation.sitemapFound && (
              <div className="flex items-center gap-1 text-sm mt-1">
                <FileText className="h-4 w-4" />
                <span>Sitemap found</span>
                {validation.estimatedPages && (
                  <Badge variant="outline" className="ml-2">
                    ~{validation.estimatedPages} pages
                  </Badge>
                )}
              </div>
            )}
            {validation.error && (
              <p className="text-sm mt-1">{validation.error}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Add Website</CardTitle>
            <CardDescription>
              Crawl and extract content from your website pages
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'single'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Single URL
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'bulk'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bulk URLs
          </button>
        </div>

        <div className="space-y-6">
          {/* URL Input */}
          {activeTab === 'single' ? (
            <div>
              <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <Input
                  type="url"
                  id="website-url"
                  value={singleUrl}
                  onChange={handleSingleUrlChange}
                  placeholder="https://example.com"
                  className="pr-10"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>
              <ValidationDisplay />
            </div>
          ) : (
            <div>
              <label htmlFor="bulk-urls" className="block text-sm font-medium text-gray-700 mb-2">
                Website URLs (one per line)
              </label>
              <Textarea
                id="bulk-urls"
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                placeholder={`https://example.com\nhttps://example.com/about\nhttps://example.com/contact`}
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Add one URL per line. Maximum 50 URLs at once.
              </p>
            </div>
          )}

          {/* Crawling Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="crawl-depth" className="block text-sm font-medium text-gray-700 mb-2">
                Crawl Depth
              </label>
              <Select value={crawlDepth.toString()} onValueChange={(value) => setCrawlDepth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Only specified pages</SelectItem>
                  <SelectItem value="2">2 - Plus linked pages (recommended)</SelectItem>
                  <SelectItem value="3">3 - Deep crawl</SelectItem>
                  <SelectItem value="4">4 - Very deep crawl</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                How many levels of internal links to follow
              </p>
            </div>

            <div>
              <label htmlFor="crawl-frequency" className="block text-sm font-medium text-gray-700 mb-2">
                Update Frequency
              </label>
              <Select value={crawlFrequency} onValueChange={setCrawlFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never (one-time only)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (recommended)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                How often to check for content updates
              </p>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Advanced Options</h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeSubdomains}
                onChange={(e) => setIncludeSubdomains(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Include subdomains (e.g., blog.example.com)
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (activeTab === 'single' && (!singleUrl || (validation && !validation.isValid)))}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding Website...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Website
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tips for best results:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Make sure the website is publicly accessible</li>
            <li>• Start with your main pages (homepage, about, services)</li>
            <li>• Use crawl depth 2-3 for most websites</li>
            <li>• Weekly updates work well for most business websites</li>
            <li>• Large e-commerce sites may take longer to process</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default WebsiteURLInput
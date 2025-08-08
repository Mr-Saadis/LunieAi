'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Globe, Search, Trash2, Eye, Clock, CheckCircle2, AlertCircle,
  Loader2, BarChart3, RefreshCw, Settings, ExternalLink,
  Calendar, FileText, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

const WebsiteStatusBadge = ({ status, lastCrawled, pageCount, successCount }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle2,
          text: 'Completed'
        }
      case 'pending':
        return {
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Clock,
          text: 'Pending'
        }
      case 'crawling':
        return {
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Loader2,
          text: 'Crawling'
        }
      case 'failed':
        return {
          className: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
          text: 'Failed'
        }
      default:
        return {
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Clock,
          text: status || 'Unknown'
        }
    }
  }

  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  return (
    <div className="flex flex-col items-end space-y-1">
      <Badge className={`${config.className} border text-xs flex items-center gap-1`}>
        <StatusIcon className={`w-3 h-3 ${status === 'crawling' ? 'animate-spin' : ''}`} />
        {config.text}
      </Badge>
      {pageCount > 0 && (
        <div className="text-xs text-gray-500">
          {successCount}/{pageCount} pages
        </div>
      )}
      {lastCrawled && (
        <div className="text-xs text-gray-400">
          {new Date(lastCrawled).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

const WebsiteManagementDashboard = ({ chatbotId }) => {
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [recrawling, setRecrawling] = useState(null)

  const supabase = createClient()

  useEffect(() => {
    if (chatbotId) {
      fetchWebsites()
    }
  }, [chatbotId])

  const fetchWebsites = async () => {
    try {
      const { data, error } = await supabase
        .from('training_data')
        .select(`
          *,
          website_crawl_logs (
            status,
            crawl_started_at,
            pages_discovered,
            pages_processed,
            error_message
          )
        `)
        .eq('chatbot_id', chatbotId)
        .eq('type', 'website')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching websites:', error)
        toast.error('Failed to fetch websites')
      } else {
        setWebsites(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch websites')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWebsite = async (website) => {
    setDeleting(website.id)

    try {
      const response = await fetch(`/api/websites/delete/${website.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Website deleted successfully')
        fetchWebsites()
        setDeleteConfirm(null)
      } else {
        const error = await response.json()
        toast.error(`Delete failed: ${error.error}`)
      }
    } catch (error) {
      toast.error(`Delete failed: ${error.message}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleRecrawlWebsite = async (website) => {
    setRecrawling(website.id)

    try {
      const response = await fetch(`/api/websites/recrawl/${website.id}`, {
        method: 'POST',
      })
      
      if (response.ok) {
        toast.success('Recrawl started successfully')
        fetchWebsites()
      } else {
        const error = await response.json()
        toast.error(`Recrawl failed: ${error.error}`)
      }
    } catch (error) {
      toast.error(`Recrawl failed: ${error.message}`)
    } finally {
      setRecrawling(null)
    }
  }

  const formatLastCrawled = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getCrawlProgress = (website) => {
    const latestLog = website.website_crawl_logs?.[0]
    if (!latestLog) return null

    const { pages_discovered = 0, pages_processed = 0 } = latestLog
    if (pages_discovered === 0) return null

    const percentage = Math.round((pages_processed / pages_discovered) * 100)
    return { processed: pages_processed, total: pages_discovered, percentage }
  }

  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || website.crawl_status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (websites.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Globe className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-gray-500 mb-2">No websites added yet</p>
          <p className="text-sm text-gray-400">Add your first website to start crawling content</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <DialogTitle>Delete Website</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.domain}"?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-xs font-medium text-red-800 mb-2">This will:</p>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Remove all crawled pages and content</li>
              <li>• Delete crawl history and logs</li>
              <li>• Cannot be undone</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting === deleteConfirm?.id}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteWebsite(deleteConfirm)}
              disabled={deleting === deleteConfirm?.id}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting === deleteConfirm?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Website'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Website Management
          </CardTitle>
          <CardDescription>
            Monitor and manage your website crawling
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="crawling">Crawling</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Website List */}
      <div className="space-y-4">
        {filteredWebsites.map((website) => {
          const progress = getCrawlProgress(website)
          const latestLog = website.website_crawl_logs?.[0]

          return (
            <Card key={website.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Website Info */}
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {website.domain}
                        </h3>
                        <a 
                          href={website.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="space-y-2">
                        {/* Crawl Progress */}
                        {progress && (
                          <div className="flex items-center gap-2 text-sm">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {progress.processed}/{progress.total} pages processed ({progress.percentage}%)
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Website Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Added {new Date(website.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatLastCrawled(website.last_crawled)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {website.crawl_frequency} updates
                          </span>
                        </div>

                        {/* Error Message */}
                        {latestLog?.error_message && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {latestLog.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <WebsiteStatusBadge
                      status={website.crawl_status}
                      lastCrawled={website.last_crawled}
                      pageCount={website.page_count}
                      successCount={website.success_count}
                    />

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecrawlWebsite(website)}
                        disabled={recrawling === website.id || website.crawl_status === 'crawling'}
                        className="h-8 px-3"
                      >
                        {recrawling === website.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(website)}
                        disabled={deleting === website.id}
                        className="h-8 px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredWebsites.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-gray-500">No websites match your search criteria</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default WebsiteManagementDashboard
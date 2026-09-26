import { useEffect, useState } from 'react'
import { getDashboard, getDocuments } from './api'

export default function useDashboard(filters, page) {
  const [version, setVersion] = useState(0)
  const [overview, setOverview] = useState({ loading: true })
  const [documents, setDocuments] = useState({ loading: true })
  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) setOverview({ loading: true })
    })
    getDashboard(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setOverview({ data })
      },
      (error) => {
        if (!controller.signal.aborted) setOverview({ error })
      },
    )
    return () => controller.abort()
  }, [version])
  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) setDocuments({ loading: true })
    })
    getDocuments(filters, page, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setDocuments({ data })
      },
      (error) => {
        if (!controller.signal.aborted) setDocuments({ error })
      },
    )
    return () => controller.abort()
  }, [filters, page, version])
  return {
    overview,
    documents,
    reload: () => setVersion((value) => value + 1),
  }
}

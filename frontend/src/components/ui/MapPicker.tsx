import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useGame } from '@/context/GameContext'

type Coords = { lng: number; lat: number }

type Props = {
  isOpen: boolean
  initial?: Coords
  onClose: () => void
  onSelect: (coords: Coords) => void
}

export default function MapPicker({ isOpen, initial, onClose, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const ATHENS_CENTER = { lng: -83.375556, lat: 33.946479 }
  const ATHENS_BOUNDS: [number, number, number, number] = [-83.42, 33.92, -83.34, 33.98]

  const { mapView, setMapView } = useGame()
  const [coords, setCoords] = useState<Coords>(initial ?? ATHENS_CENTER)

  useEffect(() => {
    if (!isOpen) return
    if (!containerRef.current) return
    if (mapRef.current) {
      mapRef.current.resize()
      return
    }

    // Use MapLibre demo globe style (no API key) for a 3D globe-like view
    const env = (import.meta as any).env || {}
    const key = env.VITE_MAPTILER_KEY
    const styleEnv = env.VITE_MAPTILER_STYLE

    let mapStyle = 'https://demotiles.maplibre.org/style.json'
    if (key) {
      if (styleEnv) {
        // styleEnv may be a full URL or a MapTiler style id
        if (styleEnv.startsWith('http')) {
          mapStyle = styleEnv.includes('key=') ? styleEnv : `${styleEnv}${styleEnv.includes('?') ? '&' : '?'}key=${key}`
        } else {
          mapStyle = `https://api.maptiler.com/maps/${styleEnv}/style.json?key=${key}`
        }
      } else {
        mapStyle = `https://api.maptiler.com/maps/streets/style.json?key=${key}`
      }
    }

    const startCenter = initial ? [initial.lng, initial.lat] : (mapView ? mapView.center : [ATHENS_CENTER.lng, ATHENS_CENTER.lat])
    const startZoom = mapView ? mapView.zoom : 14
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: startCenter,
      zoom: startZoom,
      maxBounds: ATHENS_BOUNDS,
    })

    mapRef.current = map

    const onMapClick = (e: maplibregl.MapMouseEvent) => {
      const lng = Number(e.lngLat.lng)
      const lat = Number(e.lngLat.lat)
      setCoords({ lng, lat })
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        markerRef.current = new maplibregl.Marker({ color: '#ff0000' }).setLngLat([lng, lat]).addTo(map)
      }
    }

    map.on('click', onMapClick)

    const onMoveEnd = () => {
      try {
        const c = map.getCenter()
        const z = map.getZoom()
        if (setMapView) setMapView({ center: [c.lng, c.lat], zoom: z })
      } catch (e) {}
    }

    map.on('moveend', onMoveEnd)

    // add initial marker
    markerRef.current = new maplibregl.Marker({ color: '#ff0000' }).setLngLat([coords.lng, coords.lat]).addTo(map)

    return () => {
      map.off('click', onMapClick)
      map.off('moveend', onMoveEnd)
      try {
        const c = map.getCenter()
        const z = map.getZoom()
        if (setMapView) setMapView({ center: [c.lng, c.lat], zoom: z })
      } catch (e) {}
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter([coords.lng, coords.lat])
      if (markerRef.current) markerRef.current.setLngLat([coords.lng, coords.lat])
    }
  }, [coords])

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ width: '90%', maxWidth: 900, background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 70, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>Select location</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div ref={containerRef} style={{ flex: 1, minHeight: 400 }} />
        <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13 }}>Lng: {coords.lng.toFixed(6)}, Lat: {coords.lat.toFixed(6)}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '8px 12px' }}>Cancel</button>
            <button onClick={() => onSelect(coords)} style={{ padding: '8px 12px', background: '#111827', color: 'white', border: 'none', borderRadius: 4 }}>Select location</button>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import maplibregl, { Map, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

type Coords = { lng: number; lat: number }

type Props = {
  isOpen: boolean
  initial?: Coords
  onClose: () => void
  onSelect: (coords: Coords) => void
}

export default function MapPicker({ isOpen, initial, onClose, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [coords, setCoords] = useState<Coords>(initial ?? { lng: -84.390264, lat: 33.951934 })

  useEffect(() => {
    if (!isOpen) return
    if (!containerRef.current) return
    if (mapRef.current) {
      mapRef.current.resize()
      return
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [coords.lng, coords.lat],
      zoom: 15
    })

    mapRef.current = map

    const onMapClick = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
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

    // add initial marker
    markerRef.current = new maplibregl.Marker({ color: '#ff0000' }).setLngLat([coords.lng, coords.lat]).addTo(map)

    return () => {
      map.off('click', onMapClick)
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
      <div style={{ width: '90%', maxWidth: 900, height: '70%', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 70, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>Select location</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div ref={containerRef} style={{ flex: 1 }} />
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

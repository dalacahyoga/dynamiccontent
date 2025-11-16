import React, { useState, useEffect } from 'react'
import { getLocationName, getGoogleMapsLink } from '../utils/geocoding'
import './LocationCell.css'

function LocationCell({ location }) {
  const [locationName, setLocationName] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      setLoading(true)
      getLocationName(location.latitude, location.longitude)
        .then(name => {
          setLocationName(name)
          setLoading(false)
        })
        .catch(() => {
          setLocationName(null)
          setLoading(false)
        })
    }
  }, [location])

  if (!location || !location.latitude || !location.longitude) {
    return <span className="table-secondary">Tidak tersedia</span>
  }

  const googleMapsLink = getGoogleMapsLink(location.latitude, location.longitude)
  const lat = location.latitude.toFixed(6)
  const lng = location.longitude.toFixed(6)

  return (
    <div className="location-cell">
      <div className="location-name">
        {loading ? (
          <span className="loading-text">Memuat...</span>
        ) : locationName ? (
          <span className="table-primary">{locationName}</span>
        ) : (
          <span className="table-secondary">Memuat nama lokasi...</span>
        )}
      </div>
      <div className="location-coords">
        <span className="coord-item">
          <strong>Lat:</strong> {lat}
        </span>
        <span className="coord-item">
          <strong>Lng:</strong> {lng}
        </span>
      </div>
      {googleMapsLink && (
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="maps-link"
        >
          🗺️ Buka di Google Maps
        </a>
      )}
      <div className="location-accuracy">
        <span className="table-secondary">Akurasi: ±{location.accuracy?.toFixed(0) || 'N/A'}m</span>
      </div>
    </div>
  )
}

export default LocationCell


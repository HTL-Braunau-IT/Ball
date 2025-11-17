"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on HTL Braunau
    const map = L.map(mapRef.current).setView([48.24807, 13.03953], 14);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker for HTL Braunau
    const icon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.marker([48.24358, 13.02902], { icon })
      .addTo(map)
      .bindPopup(
        "<strong>HTL Braunau am Inn</strong><br>Osternberger Straße 55<br>5280 Braunau am Inn"
      )
      .bindTooltip(
        "<strong>HTL Braunau am Inn</strong><br>Osternberger Straße 55<br>5280 Braunau am Inn",
        { 
          permanent: true, 
          direction: 'top', 
          className: 'custom-tooltip',
          offset: [0, -45]
        }
      );

    L.marker([48.25034, 13.04636], { icon })
      .addTo(map)
      .bindPopup(
        "<strong>Parkplatz Interspar Braunau</strong><br>Erlachweg 13<br>5280 Braunau am Inn"
      )
      .bindTooltip(
        "<strong>Parkplatz Interspar Braunau</strong><br>Erlachweg 13<br>5280 Braunau am Inn",
        { 
          permanent: true, 
          direction: 'top', 
          className: 'custom-tooltip',
          offset: [0, -45]
        }
      );

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}


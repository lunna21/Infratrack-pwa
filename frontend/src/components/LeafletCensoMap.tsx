import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CensoDetalle } from "../types";

type Point = {
  lat: number;
  lng: number;
};

interface LeafletCensoMapProps {
  censos: CensoDetalle[];
  activeCensoId?: string;
  focusLocation?: Point | null;
  onCensoSelect?: (censo: CensoDetalle) => void;
}

const DEFAULT_CENTER: [number, number] = [5.717, -72.934];
const DEFAULT_ZOOM = 6;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const createPetIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `
      <div style="filter: drop-shadow(0 8px 14px rgba(15, 23, 42, 0.18)); transform: translateY(-2px);">
        <svg width="38" height="50" viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 48s12.5-14.8 12.5-24.3C31.5 10.7 25.6 5 19 5S6.5 10.7 6.5 23.7C6.5 33.2 19 48 19 48Z" fill="${color}" stroke="#0f172a" stroke-opacity="0.18" stroke-width="1.4"/>
          <circle cx="19" cy="21" r="6.2" fill="white" fill-opacity="0.96"/>
          <circle cx="19" cy="21" r="2.3" fill="#0f172a" fill-opacity="0.42"/>
        </svg>
      </div>
    `,
    iconSize: [38, 50],
    iconAnchor: [19, 50],
    popupAnchor: [0, -44],
  });

const createUserIcon = () =>
  L.divIcon({
    className: "",
    html: `
      <div style="display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:9999px; background:linear-gradient(135deg,#4bb8d4,#2679a8); border:3px solid white; box-shadow:0 10px 18px rgba(47,143,194,.3); color:white; font-size:16px;">
        <span>•</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -15],
  });

const getPopupContent = (censo: CensoDetalle) => {
  const photo = censo.fotografiaCenso
    ? `<img src="${escapeHtml(censo.fotografiaCenso)}" alt="Fotografía del censo" style="margin-top:10px;width:100%;max-width:280px;height:150px;object-fit:cover;border-radius:16px;border:1px solid rgba(148,163,184,.35);" />`
    : "";

  return `
    <div style="min-width:220px;max-width:300px;font-family: 'Plus Jakarta Sans', sans-serif;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;">
        <div>
          <div style="font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#64748b;font-weight:700;">Censo</div>
          <div style="font-size:16px;font-weight:800;color:#0f172a;line-height:1.15;">${escapeHtml(censo.mascota.nombre)}</div>
        </div>
        <span style="padding:6px 10px;border-radius:9999px;background:${escapeHtml(censo.color)}22;color:#0f172a;font-size:11px;font-weight:700;">${escapeHtml(censo.mascota.tipo)}</span>
      </div>
      <div style="display:grid;gap:6px;color:#334155;font-size:13px;line-height:1.35;">
        <div><strong>Dueño:</strong> ${escapeHtml(`${censo.dueno.nombres} ${censo.dueno.apellidos}`.trim())}</div>
        <div><strong>Teléfono:</strong> ${escapeHtml(censo.dueno.telefono)}</div>
        <div><strong>Proyecto:</strong> ${escapeHtml(censo.idProyecto)}</div>
        <div><strong>Coordenadas:</strong> ${censo.lat.toFixed(6)}, ${censo.lon.toFixed(6)}</div>
      </div>
      ${photo}
    </div>
  `;
};

export const LeafletCensoMap = ({
  censos,
  activeCensoId,
  focusLocation,
  onCensoSelect,
}: LeafletCensoMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const focusMarkerRef = useRef<L.Marker | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      focusMarkerRef.current = null;
      markerRefs.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markerRefs.current = {};

    if (censos.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const bounds = L.latLngBounds([]);

    censos.forEach((censo) => {
      if (!Number.isFinite(censo.lat) || !Number.isFinite(censo.lon)) return;

      const marker = L.marker([censo.lat, censo.lon], {
        icon: createPetIcon(censo.color || "#4bb8d4"),
      });

      marker.bindPopup(getPopupContent(censo), {
        maxWidth: 320,
        closeButton: false,
        autoPanPadding: [24, 24],
      });

      marker.on("click", () => {
        onCensoSelect?.(censo);
      });

      marker.addTo(layerGroup);
      markerRefs.current[censo.id] = marker;
      bounds.extend([censo.lat, censo.lon]);
    });

    if (bounds.isValid()) {
      if (censos.length === 1) {
        map.setView(bounds.getCenter(), 13);
      } else {
        map.fitBounds(bounds.pad(0.18));
      }
    }
  }, [censos, onCensoSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!focusLocation) {
      if (focusMarkerRef.current) {
        focusMarkerRef.current.remove();
        focusMarkerRef.current = null;
      }
      return;
    }

    if (!focusMarkerRef.current) {
      focusMarkerRef.current = L.marker([focusLocation.lat, focusLocation.lng], {
        icon: createUserIcon(),
      }).addTo(map);
    } else {
      focusMarkerRef.current.setLatLng([focusLocation.lat, focusLocation.lng]);
    }

    focusMarkerRef.current
      .bindPopup(
        `<strong>Tu ubicación</strong><br/>${focusLocation.lat.toFixed(6)}, ${focusLocation.lng.toFixed(6)}`,
      )
      .openPopup();

    map.setView([focusLocation.lat, focusLocation.lng], 14, { animate: true });
  }, [focusLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeCensoId) return;

    const marker = markerRefs.current[activeCensoId];
    const censo = censos.find((item) => item.id === activeCensoId);
    if (!marker || !censo) return;

    marker.openPopup();
    map.setView([censo.lat, censo.lon], Math.max(map.getZoom(), 13), {
      animate: true,
    });
  }, [activeCensoId, censos]);

  return <div ref={containerRef} className="h-[520px] w-full rounded-[2rem]" />;
};
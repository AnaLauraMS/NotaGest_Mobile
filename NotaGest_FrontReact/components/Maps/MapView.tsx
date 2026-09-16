'use client';

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Exemplo de lojas de construção (fake para teste)
const stores = [
  { name: "Construlândia", address: "Rua A, 123", lat: -23.55052, lng: -46.633308 },
  { name: "Materiais Pro", address: "Av. B, 456", lat: -23.55852, lng: -46.641308 },
  { name: "Casa & Cia", address: "Rua C, 789", lat: -23.545, lng: -46.640 },
];

// Emoji martelo como marcador
const constructionIcon = new DivIcon({
  className: "text-2xl",
  html: "🛠️",
  iconSize: [20, 20],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const MapView: React.FC = () => {
  return (
    <MapContainer
      center={[-23.55052, -46.633308]}
      zoom={13}
      className="w-full h-72 rounded-lg shadow-md"
      scrollWheelZoom={false}
    >
      {/* Tile moderno */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Marcadores */}
      {stores.map((store, idx) => (
        <Marker key={idx} position={[store.lat, store.lng]} icon={constructionIcon}>
          <Popup className="text-sm">
            <strong>{store.name}</strong>
            <br />
            {store.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;

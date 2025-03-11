import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./map.scss";

const MapComponent = ({ items }) => {
  if (!items || items.length === 0) return <p>No location data available</p>;

  const position = [items[0].latitude, items[0].longitude];

  return (
    <div className="mapContainer">
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {items.map((item, index) => (
          <Marker key={index} position={[item.latitude, item.longitude]}>
            <Popup>{item.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;

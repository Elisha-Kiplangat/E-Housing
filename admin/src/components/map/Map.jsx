import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./map.scss";
import { Link } from "react-router-dom";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const MapComponent = ({ items }) => {
  if (!items || items.length === 0) return <p>No location data available</p>;

  const position = [items[0].latitude, items[0].longitude];

  return (
    <div className="mapContainer">
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
        {items.map((item, index) => (
          <Marker position={[item.latitude, item.longitude]}>
                <Popup>
                  <div className="popupContainer">
                    <div className="textContainer">
                      <Link to={`/${item.id}`}>{item.title}</Link>
                      <span>{item.type}</span>
                      <b> {item.price}</b>
                    </div>
                  </div>
                </Popup>
              </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;

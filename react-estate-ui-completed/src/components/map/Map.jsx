import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "./map.scss";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";

// Helper component to update map view based on items
function MapUpdater({ items }) {
  const map = useMap();
  
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    try {
      // Filter items with valid coordinates
      const validItems = items.filter(item => (
        item.latitude && 
        item.longitude && 
        !isNaN(parseFloat(item.latitude)) && 
        !isNaN(parseFloat(item.longitude))
      ));
      
      if (validItems.length === 0) return;
      
      if (validItems.length === 1) {
        // Center on single property
        map.setView(
          [parseFloat(validItems[0].latitude), parseFloat(validItems[0].longitude)], 
          13
        );
      } else {
        // Create bounds for multiple properties
        const bounds = L.latLngBounds(
          validItems.map(item => [
            parseFloat(item.latitude), 
            parseFloat(item.longitude)
          ])
        );
        
        // Fit map to show all properties with some padding
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15
        });
      }
    } catch (error) {
      console.error("Error adjusting map view:", error);
    }
  }, [items, map]);
  
  return null;
}

function Map({ items }) {
  const [validItems, setValidItems] = useState([]);
  
  useEffect(() => {
    // Filter out items with invalid coordinates
    const filtered = items?.filter(item => (
      item && 
      item.latitude && 
      item.longitude && 
      !isNaN(parseFloat(item.latitude)) && 
      !isNaN(parseFloat(item.longitude))
    )) || [];
    
    setValidItems(filtered);
    console.log(`Map: Found ${filtered.length} of ${items?.length || 0} items with valid coordinates`);
  }, [items]);
  
  // Default center in Kenya (approximate center of the country)
  const defaultCenter = [-1.2921, 36.8219]; // Nairobi coordinates
  
  if (!items || items.length === 0) {
    return <div className="map-placeholder">No properties to display on map</div>;
  }
  
  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      scrollWheelZoom={true}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Add markers for all valid items */}
      {validItems.map((item) => (
        <Pin item={item} key={item.id} />
      ))}
      
      {/* Component to dynamically update the map view */}
      <MapUpdater items={validItems} />
    </MapContainer>
  );
}

export default Map;
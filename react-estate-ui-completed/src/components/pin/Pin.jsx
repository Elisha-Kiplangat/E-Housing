import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";

// Import marker icon images directly
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix the icon paths issue
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

function Pin({ item }) {
  // Ensure we have valid coordinates before rendering
  if (!item.latitude || !item.longitude || 
      isNaN(parseFloat(item.latitude)) || isNaN(parseFloat(item.longitude))) {
    console.warn(`Pin for ${item.id || 'unknown item'} skipped - invalid coordinates`);
    return null;
  }

  // Parse coordinates to ensure they're numbers
  const position = [parseFloat(item.latitude), parseFloat(item.longitude)];
  
  // For debugging
  console.log(`Rendering pin at position: ${position} for ${item.title}`);

  return (
    <Marker position={position}>
      <Popup>
        <div className="popupContainer">
          <img src={item.img || item.images?.[0]} alt="" />
          <div className="textContainer">
            <Link to={`/${item.id}`}>{item.title}</Link>
            <span>{item.bedroom} bedroom</span>
            <b>$ {item.price}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import '@arcgis/core/assets/esri/themes/light/main.css';

const parseLocation = (location) => {
  if (!location) return null;
  const parts = String(location).split(',').map((p) => p.trim());
  if (parts.length !== 2) return null;
  const [lng, lat] = parts.map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lng, lat };
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ArcGisMap = ({
  inventory = [],
  userSubscriptions = [],
  showProximityRadar = false,
  proximityRadiusKm = 50,
}) => {
  const mapDivRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!mapDivRef.current) return;

    const map = new Map({
      basemap: 'streets-vector',
    });

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [0, 20],
      zoom: 2,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;

    const graphics = [];

    const invPoints = [];
    inventory.forEach((item) => {
      const coords = parseLocation(item.location);
      if (!coords) return;
      invPoints.push({ ...item, lng: coords.lng, lat: coords.lat });
    });

    const subPoints = [];
    userSubscriptions.forEach((sub) => {
      const coords = parseLocation(sub.location);
      if (!coords) return;
      subPoints.push({ ...sub, lng: coords.lng, lat: coords.lat });
    });

    const addProximityCircle = (lng, lat, isUser = false) => {
      try {
        const point = new Point({
          longitude: lng,
          latitude: lat,
          spatialReference: { wkid: 4326 },
        });
        const buffer = geometryEngine.geodesicBuffer(
          point,
          proximityRadiusKm,
          'kilometers'
        );
        if (buffer) {
          graphics.push(
            new Graphic({
              geometry: buffer,
              symbol: {
                type: 'simple-fill',
                color: isUser
                  ? [56, 189, 248, 0.15]
                  : [34, 197, 94, 0.12],
                outline: {
                  color: isUser ? [56, 189, 248, 0.6] : [34, 197, 94, 0.5],
                  width: 1.5,
                },
              },
              attributes: {
                type: isUser ? 'user_proximity' : 'inventory_proximity',
                radiusKm: proximityRadiusKm,
              },
            })
          );
        }
      } catch (_) {
        
      }
    };

    if (showProximityRadar) {
      subPoints.forEach((sub) => addProximityCircle(sub.lng, sub.lat, true));
      invPoints.forEach((inv) => addProximityCircle(inv.lng, inv.lat, false));
    }

    subPoints.forEach((sub) => {
      const nearest = invPoints.length > 0
        ? invPoints
            .filter((inv) => inv.blood_type === sub.blood_type)
            .map((inv) => ({
              inv,
              dist: haversineKm(sub.lat, sub.lng, inv.lat, inv.lng),
            }))
            .sort((a, b) => a.dist - b.dist)[0]
        : invPoints.length > 0
          ? invPoints
              .map((inv) => ({
                inv,
                dist: haversineKm(sub.lat, sub.lng, inv.lat, inv.lng),
              }))
              .sort((a, b) => a.dist - b.dist)[0]
          : null;
      if (nearest) {
        const line = {
          type: 'polyline',
          paths: [[[sub.lng, sub.lat], [nearest.inv.lng, nearest.inv.lat]]],
          spatialReference: { wkid: 4326 },
        };
        graphics.push(
          new Graphic({
            geometry: line,
            symbol: {
              type: 'simple-line',
              color: [251, 191, 36, 0.9],
              width: 2,
              style: 'short-dash',
              cap: 'round',
              join: 'round',
            },
            attributes: {
              type: 'ruler',
              from: sub.blood_type,
              to: nearest.inv.blood_type,
              distanceKm: nearest.dist.toFixed(1),
            },
            popupTemplate: {
              title: 'Distance ruler',
              content: `Your ${sub.blood_type} subscription → ${nearest.inv.blood_type} inventory: <strong>${nearest.dist.toFixed(1)} km</strong>`,
            },
          })
        );
      }
    });

    invPoints.forEach((item) => {
      const nearestSub =
        subPoints.length > 0
          ? subPoints
              .map((s) => ({
                sub: s,
                dist: haversineKm(
                  item.lat,
                  item.lng,
                  s.lat,
                  s.lng
                ),
              }))
              .sort((a, b) => a.dist - b.dist)[0]
          : null;

      const nearestMatch =
        subPoints.length > 0
          ? subPoints
              .filter((s) => s.blood_type === item.blood_type)
              .map((s) => ({
                sub: s,
                dist: haversineKm(item.lat, item.lng, s.lat, s.lng),
              }))
              .sort((a, b) => a.dist - b.dist)[0]
          : null;

      const distText = nearestSub
        ? `Nearest subscription: ${nearestSub.dist.toFixed(1)} km`
        : '';
      const matchText =
        nearestMatch && nearestMatch.sub.blood_type === item.blood_type
          ? `Matching ${item.blood_type} subscription: ${nearestMatch.dist.toFixed(1)} km away`
          : distText;

      graphics.push(
        new Graphic({
          geometry: {
            type: 'point',
            longitude: item.lng,
            latitude: item.lat,
          },
          symbol: {
            type: 'simple-marker',
            color: [34, 197, 94],
            size: 12,
            outline: { color: [255, 255, 255], width: 1.5 },
          },
          attributes: {
            blood_type: item.blood_type,
            quantity: item.quantity,
            region: item.region_name || item.location,
            distance: matchText,
          },
          popupTemplate: {
            title: `{blood_type} — {region}`,
            content: [
              {
                type: 'fields',
                fieldInfos: [
                  { fieldName: 'blood_type', label: 'Blood type' },
                  { fieldName: 'quantity', label: 'Quantity' },
                  { fieldName: 'region', label: 'Location' },
                  { fieldName: 'distance', label: 'Proximity' },
                ],
              },
            ],
          },
        })
      );
    });

    subPoints.forEach((sub) => {
      const nearestInv =
        invPoints.length > 0
          ? invPoints
              .map((inv) => ({
                inv,
                dist: haversineKm(sub.lat, sub.lng, inv.lat, inv.lng),
              }))
              .sort((a, b) => a.dist - b.dist)[0]
          : null;
      const nearestMatch =
        invPoints.length > 0
          ? invPoints
              .filter((inv) => inv.blood_type === sub.blood_type)
              .map((inv) => ({
                inv,
                dist: haversineKm(sub.lat, sub.lng, inv.lat, inv.lng),
              }))
              .sort((a, b) => a.dist - b.dist)[0]
          : null;

      const distText = nearestInv
        ? `Nearest inventory: ${nearestInv.dist.toFixed(1)} km`
        : 'No inventory on map';
      const matchText =
        nearestMatch && nearestMatch.inv.blood_type === sub.blood_type
          ? `${sub.blood_type} available ${nearestMatch.dist.toFixed(1)} km away`
          : distText;

      graphics.push(
        new Graphic({
          geometry: {
            type: 'point',
            longitude: sub.lng,
            latitude: sub.lat,
          },
          symbol: {
            type: 'simple-marker',
            color: [56, 189, 248],
            size: 14,
            outline: { color: [255, 255, 255], width: 2 },
          },
          attributes: {
            blood_type: sub.blood_type,
            location: sub.location,
            distance: matchText,
            type: 'Your subscription',
          },
          popupTemplate: {
            title: 'Your subscription — {blood_type}',
            content: [
              {
                type: 'fields',
                fieldInfos: [
                  { fieldName: 'blood_type', label: 'Blood type' },
                  { fieldName: 'location', label: 'Location' },
                  { fieldName: 'distance', label: 'Proximity / Distance' },
                ],
              },
            ],
          },
        })
      );
    });

    viewRef.current.graphics.removeAll();
    viewRef.current.graphics.addMany(graphics);

    if (graphics.length > 0) {
      viewRef.current.goTo(
        { target: viewRef.current.graphics, padding: 80 },
        { animate: false }
      );
    }
  }, [
    inventory,
    userSubscriptions,
    showProximityRadar,
    proximityRadiusKm,
  ]);

  return <div ref={mapDivRef} className="map-container" />;
};

export default ArcGisMap;

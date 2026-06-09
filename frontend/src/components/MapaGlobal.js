import React, { useEffect, useRef } from 'react';

const MapaGlobal = ({ publicaciones }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!window.L) return;

        // Clean-up container
        const container = document.getElementById('map-global-full');
        if (!container) return;

        // Default center
        let centerLat = 19.4326;
        let centerLng = -99.1332;
        let zoom = 12;

        // If there are publications, center the map around the average coordinates
        if (publicaciones.length > 0) {
            let latSum = 0;
            let lngSum = 0;
            let count = 0;

            publicaciones.forEach(p => {
                if (p.latitud && p.longitud) {
                    latSum += p.latitud;
                    lngSum += p.longitud;
                    count++;
                }
            });

            if (count > 0) {
                centerLat = latSum / count;
                centerLng = lngSum / count;
                zoom = 13;
            }
        }

        // Initialize map
        const map = window.L.map('map-global-full').setView([centerLat, centerLng], zoom);
        mapRef.current = map;

        // Add OpenStreetMap layer (Standard colorful maps)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Fix leaflet blank/white container rendering issue in React hidden tabs
        setTimeout(() => {
            map.invalidateSize();
        }, 250);

        // Add Markers for all publications
        publicaciones.forEach(p => {
            if (!p.latitud || !p.longitud) return;

            // Customize popup contents
            const isLimpio = p.estado === 'Limpiado';
            
            let statusColor = '#f59e0b'; // orange
            if (p.estado === 'En Proceso') statusColor = '#3b82f6'; // blue
            if (p.estado === 'Limpiado') statusColor = '#10b981'; // green

            const popupContent = `
                <div style="font-family: 'Outfit', sans-serif; width: 220px; color: #f8fafc;">
                    <div style="font-weight: 800; font-size: 1.05rem; margin-bottom: 5px; color: #fff;">${p.titulo}</div>
                    <div style="margin-bottom: 8px;">
                        <span style="background-color: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}55; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">
                            ${p.estado}
                        </span>
                        <span style="background-color: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; margin-left: 5px;">
                            ${p.categoria}
                        </span>
                    </div>
                    <img src="${isLimpio ? p.fotoDespues : p.imagen}" style="width:100%; height:110px; object-fit:cover; border-radius: 6px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);" />
                    <div style="font-size: 0.8rem; color: #94a3b8; line-height: 1.3;">
                        <i class="bi bi-geo-alt-fill text-danger"></i> <strong>Lugar:</strong> ${p.ubicacionNombre}<br/>
                        <i class="bi bi-person-fill text-info"></i> <strong>Por:</strong> ${p.usuarioNombre}
                    </div>
                </div>
            `;

            // We can customize the marker color or style using L.divIcon if we want, or use standard marker
            const marker = window.L.marker([p.latitud, p.longitud]).addTo(map);
            marker.bindPopup(popupContent);
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [publicaciones]);

    return (
        <div className="container py-4">
            <div className="glass-card p-4">
                <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary">
                    <i className="bi bi-map-fill text-emerald fs-2 me-3" style={{ color: 'var(--accent-primary)' }}></i>
                    <div>
                        <h2 className="mb-0 fw-bold text-white">Mapa Crítico Comunitario</h2>
                        <p className="text-secondary mb-0 small">Visualiza en tiempo real todos los focos de contaminación e iniciativas de limpieza activos en la zona.</p>
                    </div>
                </div>

                <div 
                    id="map-global-full" 
                    style={{ height: '550px', width: '100%' }}
                    className="shadow-lg rounded-3 border border-secondary"
                ></div>

                <div className="d-flex flex-wrap justify-content-center gap-4 mt-3 py-2 bg-dark rounded-3 border border-secondary small">
                    <div className="d-flex align-items-center gap-2">
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                        <span className="text-secondary">Pendiente de Limpieza</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                        <span className="text-secondary">En Limpieza (En Proceso)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                        <span className="text-secondary">Limpiado (¡Meta Lograda!)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapaGlobal;

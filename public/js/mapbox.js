export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoibGl0Y2giLCJhIjoiY202OHpiYzkyMDU5dTJpc2RyaGxlcjM3aiJ9._gW_HUl7LGLjraS7bLGLcg'

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        scrollZoom: false,
        // center: [8.6753, 9.082],
        // zoom: 1,
    })

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach((loc) => {
        // Create marker
        const el = document.createElement('div')
        el.className = 'marker'

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
            .setLngLat(loc.coordinates)
            .addTo(map)

        // Add popup
        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map)

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    })
}

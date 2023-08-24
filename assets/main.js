(async () => {
  const year = '2023';

  const domContentLoaded = new Promise((resolve, reject) => {
    if (document.readyState !== 'loading') resolve();
    document.addEventListener('DOMContentLoaded', resolve);
  });

  const windowReady = new Promise((resolve, reject) => {
    if (document.readyState == 'complete') resolve();
    window.addEventListener('load', resolve);
  });


  const getListingsUrl = () => {
    const date = document.forms.filter.date.value;
    return `maps/${year}/geojson/${date}.geojson`;
  };

  const getListingsFilter = () => {
    const filter = ['all', ['literal', true]];
    switch (document.forms.filter.ticketed_events.value) {
      case 'yes': filter.push(['==', ['get', 'ticketed_events'], 'Yes']); break;
      case 'no': filter.push(['==', ['get', 'ticketed_events'], 'No']); break;
    }
    switch (document.forms.filter.fully_booked.value) {
      case 'yes': filter.push(['in', ['get', 'fully_booked'], ['literal', ['Yes', 'Unknown']]]); break;
      /* If ticketed_events is No, fully_booked will be "", which we want to
       * include here. If the ticketed_events filter is set to yes, we won't
       * see any ambiguous events anyway. */
      case 'no': filter.push(['in', ['get', 'fully_booked'], ['literal', ['No', 'Unknown', '']]]); break;
    }
    return filter;
  };

  const updateListings = async () => {
    const map = await mapReady;
    console.log(`Updating listings`);
    map.getSource('listings').setData(getListingsUrl());

    console.log(`Updating filters`);
    const filter = getListingsFilter();
    map.setFilter('listings-labels', filter);
    map.setFilter('listings-markers', filter);
    saveFilter();
  };

  const saveFilter = () => {
    const hash = new URLSearchParams(document.location.hash.substr(1));
    const date = document.forms.filter.date.value;
    const ticketed_events = document.forms.filter.ticketed_events.value;
    const fully_booked = document.forms.filter.fully_booked.value;
    hash.set('filter', `${date}/${ticketed_events}/${fully_booked}`);
    document.location.hash = '#' + hash.toString().replaceAll('%2F', '/');
  };

  const loadFilter = () => {
    const hash = new URLSearchParams(document.location.hash.substr(1));
    const filter = hash.get('filter');
    if (!filter) return;
    const [date, ticketed_events, fully_booked] = filter.split('/');
    /* These assignments will be ignored if the values are invalid */
    document.forms.filter.date.value = date;
    document.forms.filter.ticketed_events.value = ticketed_events;
    document.forms.filter.fully_booked.value = fully_booked;
  };


  const buildPopupHtml = (feature) => {
    const { name, description, url, fully_booked, ticketed_events, start, end } = feature.properties;
    const ticket_class = ticketed_events == 'Yes' ? 'ticketed' : '';
    const data = [
      `<dt>Ticketed</dt><dd class="${ticket_class}">${ticketed_events}</dd>`
    ];
    if (ticketed_events == 'Yes') {
      data.push(`<dt>Fully booked</dt><dd>${fully_booked}</dd>`);
    }
    if (start !== "null" && end !== "null") {
      const [startMin, endMin] = [start, end].map(t => t.substr(0, 5));
      if (startMin == "00:00" && endMin == "23:59") {
        data.push(`<dt>Time</dt><dd>All-day</dd>`);
      } else {
        data.push(`<dt>Starts</dt><dd>${startMin}</dd><dt>Finishes</dt><dd>${endMin}</dd>`);
      }
    }
    const coords = feature.geometry.coordinates;
    const latlng = `${coords[1]},${coords[0]}`;
    const gmapsParams = new URLSearchParams({'api': 1, 'destination': latlng});
    const gmapsUrl = `https://www.google.com/maps/dir/?${gmapsParams}`;
    const cmParams = new URLSearchParams({'endcoord': latlng, 'endname': name});
    const cmUrl = `https://citymapper.com/directions?${cmParams}`;
    return `
      <a href="${url}" target="_blank">${name}</a>
      <p>${description}</p>
      <p>
        <a class="gmaps-link" href="${gmapsUrl}" target="_blank">
          <img src="assets/googlemaps-icon-167px.png"/>
        </a>
        <a class="cm-link" href="${cmUrl}" target="_blank">
          <img src="assets/citymapper-logo-220px.png"/>
        </a>
      </p>
      <dl>${data.join('\n')}</dl>
    `;
  };


  const fetchMarkers = () => {
    const markers = {
      'marker': 'assets/mapbox-marker-icon-48px-red.png',
    };
    const promises = [];
    for (const [name, url] of Object.entries(markers)) {
      const img = new Image();
      img.src = url;
      promises.push(img.decode().then(() => [name, img]));
    }
    return Promise.all(promises);
  };
  /* Set them downloading as early as possible */
  const markers = fetchMarkers();

  const mapReady = new Promise(async (resolve, reject) => {
    /* Ensure CSS has been loaded */
    await windowReady;

    mapboxgl.accessToken = 'pk.eyJ1IjoibXM3ODIxIiwiYSI6ImNrdGFlMTMwMzA5dnYycG15MzhjeXgwa3MifQ.hD7yHtV4jWmf5tige7c2kg';

    console.log(`Creating map`);
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      hash: 'map',
      center: [-0.1, 51.52],  // approximately Smithfield
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        maximumAge: 60 * 1000,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }));


    let lastPopup = null;
    const showPopup = (e) => {
      /* MapBox passes clicks through to all listening layers.
       * This now means you can't click between events easily. */
      if (lastPopup?.isOpen()) return;

      const feature = e.features[0];
      const coordinates = [...feature.geometry.coordinates];
      const html = buildPopupHtml(feature);

      // Find the right marker if the map is zoomed out enough to wrap
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      lastPopup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(html)
        .addTo(map);
    };

    map.on('click', 'listings-markers', showPopup);
    map.on('click', 'listings-labels', showPopup);

    map.on('mouseenter', 'listings-markers', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'listings-markers', () => map.getCanvas().style.cursor = '');

    map.on('load', async () => {
      console.log(`Adding markers`);
      /* We need the markers in order to add the layer */
      for (const [name, img] of await markers) {
        map.addImage(name, img);
      }

      console.log(`Adding source and layers`);
      /* Apparently we can't create a source without data */
      map.addSource('listings', { type: 'geojson', data: getListingsUrl() });
      map.addLayer({
        'id': 'listings-markers',
        'type': 'symbol',
        'source': 'listings',
        'layout': {
          'icon-image': 'marker',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
      map.addLayer({
        'id': 'listings-labels',
        'type': 'symbol',
        'source': 'listings',
        'layout': {
          'text-field': ['get', 'name'],
          'text-variable-anchor': ['top'],
          'text-radial-offset': 1,
        },
        'paint': {
          'text-halo-color': '#fff',
          'text-halo-width': 1,
          'text-halo-blur': 1,
        },
      });

      console.log(`Map ready`);
      resolve(map);
    });

  });

  const buildDates = async (dateChooser) => {
    const resp = await fetch(`maps/${year}/dates.json`);
    const dates = await resp.json();
    const els = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    var checked = " checked";
    for (const datestr of dates) {
      if (datestr == 'all_week') continue;

      const date = new Date(datestr);
      date.setHours(0, 0, 0, 0);
      if (date < today) continue;

      const mm_dd = `${date.getDate()}/${date.getMonth() + 1}`;
      var day = date.toLocaleString('en-GB', {weekday: 'short'});
      if (+date == +today) day = "Today";

      els.push(`<input type="radio" value="${datestr}" id="date-${datestr}" name="date"${checked}><label for="date-${datestr}">${mm_dd} <small>${day}</small></label>`);

      checked = "";
    }
    dateChooser.insertAdjacentHTML('afterbegin', els.join(''));
    document.body.classList.remove('not-ready');
  };

  document.forms.filter.addEventListener('click', (e) => {
    if (e.target.closest('input')) updateListings();
  });

  await domContentLoaded;
  await buildDates(document.getElementById('date'));
  loadFilter();
  await updateListings();

})();

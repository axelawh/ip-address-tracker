// ELEMENTS
const $searchBar = $('#search-bar-main');
const $btn = $('#btn-arrow');
const $resultBar = $('#result-bar');
const $ipAddrEl = $('#ip-address');
const $locationEl = $('#location');
const $timezoneEl = $('#timezone');
const $ispEl = $('#isp');

class App {
	#map;
	#mapZoom = 13;
	#coords;
	#marker;

	constructor() {
		this._getIPData();

		// Events
		$btn.click(this.#_search.bind(this));
		$resultBar.click(this.#_moveTo.bind(this));
	}

	// Event Callbacks
	#_search(e) {
		e.preventDefault();
		if ($searchBar[0].value) {
			this._getIPData($searchBar[0].value);
			$searchBar[0].value = '';
		} else {
			alert(`Field can't be empty!`);
		}
	}

	#_moveTo() {
		if (!this.#map) return;
		this.#map.setView(this.#coords, this.#mapZoom);
	}

	// Main Functionality
	_getIPData(ip = '') {
		// Fetch promise only rejects if there's no internet. It'll send data even if it can't find the IP
		fetch(`https://ipapi.co/${ip}/json`)
			.then(res => {
				if (!res.ok)
					throw new Error(
						`Error ${res.status}: Something went wrong. Failed to load.\n`
					);
				return res.json();
			})
			.then(data => {
				if (data.error) throw new Error(`Error: ${data.reason}.`);
				this._setIPData(data);
			})
			.catch(e =>
				alert(
					`${
						e.message === 'Failed to fetch'
							? 'Disable AdBlocker \nor Check Your Internet Connection.'
							: e.message
					} Try again!`
				)
			);
	}

	_setIPData({
		ip,
		city,
		region,
		country_name,
		postal,
		utc_offset,
		org,
		latitude,
		longitude,
	}) {
		$ipAddrEl.text(ip);
		$locationEl.html(`${city}, ${region},<br>${country_name} - ${postal}`);
		$timezoneEl.text(`UTC${utc_offset}`);
		$ispEl.text(org);

		this.#coords = [latitude, longitude];

		if (this.#map) {
			this.#map.setView(this.#coords, this.#mapZoom);
			this.#_setMarker();
		} else {
			this._loadMap();
		}
	}

	_loadMap() {
		// LeafLets: Library
		this.#map = L.map('map').setView(this.#coords, this.#mapZoom);

		// Google Map
		L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
			maxZoom: 20,
			subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
		}).addTo(this.#map);

		this.#_setMarker();
	}

	#_setMarker() {
		if (this.#marker) this.#map.removeLayer(this.#marker);

		this.#marker = L.marker(this.#coords, {
			icon: L.icon({
				iconUrl: 'images/icon-location.svg',
				iconAnchor: [24, 56],
			}),
		})
			.addTo(this.#map)
			.openPopup();
	}
}

const app = new App();

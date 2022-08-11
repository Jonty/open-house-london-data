[Open House London](https://openhouselondon.open-city.org.uk/) listings data
============================================================================

All of it. Automatically scraped every 3 hours with updates committed to git, autogenerated per-day CSV's, and autogenerated per-day maps.

Things you can use
------------------
* **<a href="https://jonty.github.io/open-house-london-data/">A lovely browsable map, with filtering options by day and booking!</a>**
* Per-venue JSON data files containing all data from the Open House website in the [data/2022 directory](data/2022).
* Per-day CSV files of venues in the [csv/2022 directory](csv/2022).
* Per-day venue maps in both [GeoJSON](maps/2022/geojson) & [KML](maps/2022/kml) format in the [maps/2022 directory](maps/2022). You can [view the GeoJSON maps directly](maps/2022/geojson/2022-09-11.geojson).

There are historical versions of these for previous open house events in the corresponding year directories.

**Things to note:**
* All the venue images are stored in a different repository. Find them here: https://github.com/Jonty/open-house-london-images
* This attempts to detect if events are ticketed, both on an event (`ticketed`) and a listing (`ticketed_events`) basis
* Some venues have no events and are open all week, see the `all_week` field
* Some events run all day, and have 00:00-23:59 as times for convenience, but also an `all_day` field
* `fully_booked` will be null on events where bookings are handled by an external website such as eventbrite
* Data not included in the listing will either be `[]`, or `null`
* JSON filenames are the OH ID's of venues that persist between events

Example JSON file
-----------------
```json
{
    "all_week": false,
    "description": "Cullinan Studio converted this Victorian warehouse into their low-energy office in 2012, retaining 80% of the existing building fabric. The Foundry co-working hub is now home to several organisations working in the built environment.",
    "design": {
        "designers": [
            {
                "architect": "Cullinan Studio",
                "description": "Original design",
                "year": "2012"
            }
        ],
        "periods": [
            "Historical/contemporary"
        ],
        "types": [
            "Walk/tour",
            "Offices",
            "Architectural practice"
        ]
    },
    "events": [
        {
            "all_day": false,
            "booking_link": "https://openhouselondon.open-city.org.uk//events/11019/bookings",
            "capacity": 40,
            "date": "2021-09-10",
            "end": "2021-09-10T17:00:00+01:00",
            "fully_booked": false,
            "name": "Open Studio: 4pm - 5pm slot",
            "notes": null,
            "start": "2021-09-10T16:00:00+01:00",
            "ticketed": true
        }
    ],
    "facilities": [
        [
            "Family activities during open house festival",
            "Refreshments",
            "Toilets",
            "Architect on site",
            "Disabled access"
        ]
    ],
    "factsheet": [
        {
            "heading": "New from old",
            "paragraphs": [
                "This Victorian canal-side warehouse was originally a foundry. In the 20th century it was used as a greetings card warehouse and then artists' studios. The warehouse is now home to architects Cullinan Studio, who completed an extensive retrofit of the building into their new offices in 2012. This beautiful and efficient workplace proves that retrofit can be as inspiring as new-build. Cullinan Studio is using their first-hand experience as client, designer and end-user of the building to observe how users interact with the space after handover, and putting that knowledge to good use in future projects."
            ]
        },
        {
            "heading": "Sustainability",
            "paragraphs": [
                "The BREEAM ‘Excellent’ studios are naturally ventilated. Under-floor heating is provided through an air-source heat pump. Using a fabric-first approach, the listed south wall’s insulation has been upgraded to a u-value of 0.1W/sqm/K by using recycled newspaper (Warmcell). The north wall has insulation of up to 380mm thick over the existing rendered façade providing a u-value of 0.08W/sqm/K. PV panels on the south slopes of the roof generate electricity. A Building Management System (BMS) enables us to monitor energy performance and space temperatures."
            ]
        },
    ],
    "id": 7448,
    "images": [
        {
            "description": "Simon Warren · 2014",
            "title": "Cullinan Studio Office adjacent Regents Canal",
            "url": "https://d25hwkr75zzfa.cloudfront.net/store/photo/large/building_7448_cullinanstudioofficeonregentscanal_-simonwarren_a3379b995b46570575a938e095b7bded.jpg"
        },
        {
            "description": "Tim Soar · 2012",
            "title": "An inserted steel frame works with the existing 19th century frame and masonry to support the listed south wall",
            "url": "https://d25hwkr75zzfa.cloudfront.net/store/photo/large/building_7448_cullinanstudiooffice_lowergrdflr_-timsoar_2b363e716ca9d7fbe4407dc6fb153127.jpg"
        },
    ],
    "links": [],
    "location": {
        "address": "Foundry, 5 Baldwin Terrace, N1 7RU",
        "latitude": 51.5332855,
        "longitude": -0.09617,
        "meeting_point": null,
        "travel_info": [
            "Nearest tube: Angel",
            "Nearest train: Essex Road, Old Street",
            "Bus routes: 4, 19, 341, 141, 73, 205, 271"
        ]
    },
    "name": "Foundry Co-Working Hub",
    "original_url": "https://openhouselondon.open-city.org.uk/listings/7448",
    "ticketed_events": true
}

```

Todo
----
* Ability to mark venues as "want to see" and "seen" and filter by this - perhaps with a backing store in google sheets per-user, using JS?
* List view of all venues (with filters)
* Show images
* Add alt image paths referring to https://github.com/Jonty/open-house-london-images
* Auto-updated Google Sheet w/tabs
* Autogenerated datasette DB
* Delete venues that are no longer listed so git history is accurate
* Dig up all the previous years data and import as much as possible in the same format

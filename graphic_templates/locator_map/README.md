Locator Map
===========

The locator map template is designed to simplify creating basic locator maps with D3, TopoJSON and shapefile data (for example, from [Natural Earth](http://www.naturalearthdata.com)). It will not create production-ready maps, but it will quickly generate a code-based starting point for a map project.

To generate the necessary TopoJSON file, you will need to install the [mapturner](https://github.com/nprapps/mapturner) library. Mapturner also requires ogr2ogr/GDAL and topojson. **[See the mapturner docs](https://github.com/nprapps/mapturner)** for set-up information.

_(Note: The code in our example is tailored for a map centered on Nepal. You'll want to edit the configuration, JavaScript and LESS accordingly.)_

To get started, create a new graphic using that template:

```
fab add_map:$slug
```

Inside the project folder, edit the configuration file ```geodata.yaml``` to specify the particular layers and data columns you want. Options included:

* ```bbox```: The bounding box for your map. To get coordinates (```x1 y1 x2 y2```, space-delimited) appropriate to your project, go to a site like [Bounding Box](http://boundingbox.klokantech.com), draw a box around the area you want (with a good amount of margin), and copy the coordinates of that box. (If you're using Bounding Box, choose the "CSV" coordinate output and replace the commas with spaces.)
* Default layers: ```countries```, ```cities``` (for the primary/featured country), ```neighbors``` (for neighboring countries), ```lakes``` and ```rivers```. The default layers point to Natural Earth shapefiles. mapturner also supports geoJSON and CSVs with latitude and longitude columns.
* For each shapefile layer, you can specify options to pass to the TopoJSON converter, including:
  * ```id-property```: a column value you want to use as an identifier in the exported TopoJSON file
  * ```properties```: columns you want TopoJSON to preserve in the exported file (by default, it strips out most non-geo data)
  * ```where```: a query to pass in to filter the data returned (for example: ```where: adm0name != 'Nepal' AND scalerank <= 2```)

([See the mapturner docs](https://github.com/nprapps/mapturner) for more details.)

In your terminal, in the ```dailygraphics``` virtualenv, navigate to your project folder. Run mapturner to process your map's geodata:

```
mapturner geodata.yaml data/geodata.json
```

In your project ```js/graphic.js``` folder, change the ```PRIMARY_COUNTRY``` variable at the top from Nepal to the name of your featured country. You will also want to adjust the ```MAP_DEFAULT_SCALE``` and ```MAP_DEFAULT_HEIGHT``` variables so that your featured country fits onscreen.

---
description: Create photo captions
---

Draft sentences for the `caption` column in the file `src/images/photography/_staging/photo-template.csv`. The photos in `src/images/photography/_staging` align with the filenames, identified in the `filename` column, in `src/images/photography/_staging/photo-template.csv`. Each photo has a row in `src/images/photography/_staging/photo-template.csv`

below are example captions, taken from the SQLite database.

```
(base) shaneorr@Shanes-MacBook-Pro personal-blog % sqlite3 -list src/db/photos.db "SELECT category, caption, location, country FROM photos WHERE category = 'street' OR category = 'nature';"

nature|Fall colors at sunset atop Blood Mountain|Northern Georgia|United States
nature|Sun dipping behind the north Georgia mountains|Northern Georgia|United States
nature|Blood Mountain revealing its autumn colors|Northern Georgia|United States
nature|Ballon rising above the mountains|Cappadocia|Turkey
nature|Torres del Paine's famous emerald lakes|Torres Del Paine|Chile
nature|Ponies on Grayson Highlands in Virginia|Appalachian Mountains|United States
nature|Grandfather Mountain in North Carolina|Appalachian Mountains|United States
nature|Plane flying across Yonah Mountain|Northern Georgia|United States
nature|River running through the canyon|Colca Canyon|Peru
street|Atlanta's rising skyline from Jackson Street Bridge.|Atlanta|United States
street|Dia de los muertos celebrations in Norcross.|Atlanta|United States
street|A stylish Catrina at the dia de los muertos festivities in Oakland Cemetery.|Atlanta|United States
street|Uskudar's festive waterfront|Istanbul|Turkey
street|The colorful Balat neighborhood|Istanbul|Turkey
street|The teleferico connecting a city separated by hills|La Paz|Bolivia
street|Barichara's cobblestone streets and white hosues|Barichara|Colombia
street|The Basilica Santuario del Senor Caido y Nuestra Senora de Monserrate|Bogota|Colombia
street|Selling in front of Teatro Municipal Jorge Eliecer Gaitan|Bogota|Colombia
street|Ballons in front of Basilica menor Senor de los Milagros|Giron|Colombia
street|Fishing along El Malecon, Morro Castle Lighthouse in the background|Havana|Cuba
street|Sun bursting through the historic architecture of Plaza de Mayo|Buenos Aires|Argentina
street|Sun shining behind the General San Martin monument and Argentine flag|Buenos Aires|Argentina
street|Ships docked in Puerto Madero during golden hour|Buenos Aires|Argentina
street|Embracing in fromt of Escuela Presidente Roca|Buenos Aires|Argentina
street|Tango dancers entertaining diners at a sidewalk cafe|Buenos Aires|Argentina
street|Tango in front of the Piramide de Mayo|Buenos Aires|Argentina
street|Murals of Diego Maradona in a quiet park|Buenos Aires|Argentina
street|Messi and Maradona statutes in La Boca|Buenos Aires|Argentina
street|The green BA sign with the Obelisco in the background|Buenos Aires|Argentina
street|The illuminated Fragata Sarmiento in Puerto Madero|Buenos Aires|Argentina
street|A couple dancing tango on the Puente de la Mujer at night|Buenos Aires|Argentina
street|Telescopes and glowing balloons along the Puerto Madero waterfront|Buenos Aires|Argentina
```

To create captions, first try to identify the specific location, building, street, or landmark in a photo, if one is present. use the country and location fields to help identify what is in the photo. This should be included in the caption. Then create a caption describing the photo. Edit `src/images/photography/_staging/photo-template.csv` by adding a draft of the caption under the `caption` column.

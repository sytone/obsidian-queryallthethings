---

parent: TTRPG Examples
grand_parent: Examples / Tutorials
title: Monster Search
---

Search through your Fantasy Statblocks bestiary by monster CR and type using a local or external JSON file.

## How to add

1. Make sure that Meta-Bind, Fantasy Statblocks and Query All the Things are is installed
2. In the settings for Query All the Things
3. Make sure Dataview JS queries are turned on
4. Paste the code from `monster_search.js` inside a `dataviewjs` code block (triple \`s)
5. Add the following properties to the note's frontmatter. They shouldn't need any values to be given.
   - searching_cr
   - searching_type
   - searching_open_bestiary
6. Happy searching!

## Options and usage

The creatures are returned in a table with their name, HP, AC, CR, and source, in no particular order. If there is a note with the same name as a creature, the name column will link to that note. If there isn't one, upon clicking it, a Fantasy Statblocks bestiary panel will be opened and it will be shown there. If there was already one open, it will just show it there.

The filters described below work like an 'AND' - if you search for CR 4 and Undead, you will only get CR4 undead creatures.

### Filtering by CR
Type the CR of the creature in the 'cr' search box, e.g 1/8, 1/4, 1/2, or a whole number like 5. This will filter the results to creatures of that CR only. If no creatures match that CR, it will find the closest CR to the given number (either up or down, whichever is closer) which _do_ contain monsters, and return those.

### Filtering by type
Select the type of the creature in the 'type' select. Only creatures of this type will be returned.

### Selecting a random creature
By default, one creature from the results is selected at random, to let you quickly choose a random creature from the list for inspiration. Its name will be listed in bold, and appear as `> Name <` (between ><). If you want to get a new creature from the same list, you can click the 'Select random' button to get a new one. If you don't care about the random selection, you can just ignore it.

### Opening bestiary panel
If 'open bestiary panel' is toggled on, whenever a search is made, the creature randomly selected will be shown in a Fantasy Statblocks bestiary panel. One will be opened if there isn't one open already, and the right bar will always be shown if it was hidden. If toggled off, this won't happen.

# Battle Cats Mailbox Hack

A hack for the mailbox in Battle Cats.
It allows you to get any cat, talent orb, or item amount you want without
the ban risk of other methods.

It only works on Android and requires you to install a modded apk, but it does
not require root.

The main script uses [TBCML](https://github.com/fieryhenry/tbcml), a
library I've made designed to make modding the game easier and more automated.

Unlike [TBCMS](https://github.com/fieryhenry/tbcms), this hack does not require
a server to be running, all of the scripting is done on the device using
[Frida](https://frida.re/), specifically [Frida Gadget](https://frida.re/docs/gadget/).

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/fieryhenry)

## Credits

- [jamesiotio's CITM](https://github.com/jamestiotio/CITM) for the original
    hacking method and the format of the presents. It no longer works due to
    PONOS adding a signature to the server responses as well as other changes.

## Setup

1. Read the [TBCML](https://github.com/fieryhenry/tbcml) GitHub page so you
can get the library installed (with the scripting dependencies).
At the moment you will have to install tbcml from source as the latest release
doesn't have all the features needed. See
<https://github.com/fieryhenry/tbcml#from-source> for instructions.

1. Clone this repository, or just download `script.js` and `script.py` manually.
1. Make sure that the 2 files are in the same directory.
1. Open command prompt or another terminal and navigate to the directory you
   downloaded the files to. (You
    can do this by typing `cd <path>` where `<path>` is the path to the directory
    containing the files.)
1. Run `python script.py` to create the modded apk.
1. Install the modded apk on your device. The script will display the path to the
    apk file.
1. Open the game and go to the mailbox. You should see that you have some
    presents.

## Customization

When you run `python script.py` you can pass in a url to a json file of
presents e.g `python script.py https://example.com/presents.json`. This way you
can still setup your own server to host the presents if you wanted to, or just
host the json file on GitHub or something.

Alternatively you can pass in a path to a json file e.g `python script.py
presents.json`. There is an example json file in this repository called
`example.json`.

If you use a file path, if you want to modify the presents you will have to run
the script again to create a new modded apk and then install it to the device.
(If you can figure out how to allow the script to read files from the device's
storage then please make a pull request.)

### Presents Format

The json file should be an array of objects. Each object should have the
following:

- "title": The title of the present.
- "items": An array of objects. Each object should have the following:
  - "itemId": The id of the item.
  - "itemCategory": The category of the item. See below for the list of
    categories.
  - "amount": The amount of the item.
  - "title": The title of the item. Not really used.
- "presentCode" (optional): The present code of the present. Normally would be
  used by the server to verify that the present is valid. The hack forces the
  present to be valid so this is not needed.
- "body" (optional): The description of the present.
- "createdAt" (optional): The date the present was created, should be a
  timestamp.
- "acceptedAt" (optional): The date the present was accepted, should be a
  timestamp.

#### Example

```json
[
    {
        "presentCode": 1,
        "title": "Mailbox Hack",
        "body": "Made by fieryhenry and made possible\nby jamestiotio's original work:\nhttps://github.com/jamestiotio/CITM",
        "createdAt": 1574529411,
        "acceptedAt": 1,
        "items": [
            {"itemId": 22, "itemCategory": 0, "amount": 0, "title": "Catfood"},
            {"itemId": 22, "itemCategory": 0, "amount": 0, "title": "Catfood"},
        ],
    }
]

```
  
#### Item Categories

Any game files mentioned are stored in the `game_files` directory of the repo.

Categories:

- 0: Items (See `GatyaitemName.csv` for the list of items, item id 0 is the
  first item in the list)
- 1: Cats (See <https://battle-cats.fandom.com/wiki/Cat_Release_Order> for the
    list of cats)
- 2: Item Packs (See `itemPack.tsv` for the list of item packs)
- 3: True Forms (Uses the same ids as cats)
- 4: Talent Orbs (Not really a way to list these since ids are generated
  programatically using `equipmentlist.json`, `equipmentgrade.csv`,
  `attribute_explonation.tsv`, `equipment_explonation.tsv`)

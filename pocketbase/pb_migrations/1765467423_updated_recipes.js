/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_842702175")

  // remove field
  collection.fields.removeById("file3309110367")

  // add field
  collection.fields.addAt(8, new Field({
    "exceptDomains": [],
    "hidden": false,
    "id": "url3309110367",
    "name": "image",
    "onlyDomains": [],
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_842702175")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "file3309110367",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "image",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // remove field
  collection.fields.removeById("url3309110367")

  return app.save(collection)
})

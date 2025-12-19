/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3227258963")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.auth.id = user.id",
    "deleteRule": "@request.auth.id = user.id",
    "listRule": "@request.auth.id = user.id",
    "viewRule": "@request.auth.id = user.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3227258963")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})

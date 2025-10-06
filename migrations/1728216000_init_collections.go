package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	pm "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	pm.Register(func(app core.App) error {
		var collections []map[string]any
		if err := json.Unmarshal([]byte(collectionsJSON), &collections); err != nil {
			return err
		}
		if err := app.ImportCollections(collections, false); err != nil {
			return err
		}

		if err := setAccessRules(app); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		ids := []string{
			"dpnhs2xr3by2ue8",
			"wd8z33xdvc1uwe6",
			"1csagpg9ce4ojad",
			"i0zawt7irmi5rgf",
			"vemsb4s051evn7f",
			"jm440cli71sfxzb",
			"qjz4kuz8hypkff2",
			"fq7fn8e5esohuql",
			"y4wbfxylw6a5xoy",
			"dhzkdxx71dfmt62",
		}

		for _, id := range ids {
			col, err := app.FindCollectionByNameOrId(id)
			if err != nil {
				continue
			}
			if err := app.Delete(col); err != nil {
				return err
			}
		}
		return nil
	})
}

func setAccessRules(app core.App) error {
	requests, err := app.FindCollectionByNameOrId("requests")
	if err != nil {
		return err
	}
	requests.ListRule = types.Pointer("@request.auth.role = 'staff' || parent = @request.auth.id")
	requests.ViewRule = types.Pointer("@request.auth.role = 'staff' || parent = @request.auth.id")
	requests.CreateRule = types.Pointer("@request.auth.role = 'staff' || parent = @request.auth.id")
	if err := app.Save(requests); err != nil {
		return err
	}

	invoices, err := app.FindCollectionByNameOrId("invoices")
	if err != nil {
		return err
	}
	invoices.ListRule = types.Pointer("@request.auth.role = 'staff' || request.parent = @request.auth.id")
	invoices.ViewRule = types.Pointer("@request.auth.role = 'staff' || request.parent = @request.auth.id")
	if err := app.Save(invoices); err != nil {
		return err
	}

	assignments, err := app.FindCollectionByNameOrId("assignments")
	if err != nil {
		return err
	}
	assignments.ListRule = types.Pointer("@request.auth.role = 'staff' || request.parent = @request.auth.id")
	assignments.ViewRule = types.Pointer("@request.auth.role = 'staff' || request.parent = @request.auth.id")
	if err := app.Save(assignments); err != nil {
		return err
	}

	renewals, err := app.FindCollectionByNameOrId("renewals")
	if err != nil {
		return err
	}
	renewals.ListRule = types.Pointer("@request.auth.role = 'staff' || assignment.request.parent = @request.auth.id")
	renewals.ViewRule = types.Pointer("@request.auth.role = 'staff' || assignment.request.parent = @request.auth.id")
	if err := app.Save(renewals); err != nil {
		return err
	}

	return nil
}

const collectionsJSON = `
[
  {
    "id": "dhzkdxx71dfmt62",
    "name": "zones",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "min": 2,
          "max": 64,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "description",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "class_tags",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000
        }
      },
      {
        "system": false,
        "name": "map_image",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "maxSize": 5242880,
          "mimeTypes": [
            "image/png",
            "image/jpeg",
            "application/pdf"
          ],
          "thumbs": [
            "200x200",
            "400x400"
          ],
          "protected": false
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "y4wbfxylw6a5xoy",
    "name": "lockers",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "number",
        "type": "number",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1
        }
      },
      {
        "system": false,
        "name": "zone",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "dhzkdxx71dfmt62",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "name"
          ]
        }
      },
      {
        "system": false,
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "free",
            "reserved",
            "occupied",
            "maintenance"
          ]
        }
      },
      {
        "system": false,
        "name": "note",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 400,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.role != ''",
    "viewRule": "@request.auth.role != ''",
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "fq7fn8e5esohuql",
    "name": "parents",
    "type": "auth",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "full_name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 2,
          "max": 120,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "address",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 4,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "phone",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 32,
          "pattern": "^\\+?[0-9\\s-]{7,}$"
        }
      },
      {
        "system": false,
        "name": "language",
        "type": "select",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "de",
            "en"
          ],
          "defaultValue": "de"
        }
      },
      {
        "system": false,
        "name": "role",
        "type": "select",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "parent",
            "staff",
            "janitor"
          ],
          "defaultValue": "parent"
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": "",
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "allowEmailAuth": true,
      "allowOAuth2Auth": false,
      "allowUsernameAuth": false,
      "exceptEmailDomains": null,
      "onlyEmailDomains": null,
      "requireEmail": true,
      "requireVerifiedEmail": false,
      "mfa": false,
      "minPasswordLength": 8
    }
  },
  {
    "id": "qjz4kuz8hypkff2",
    "name": "requests",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "parent",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "fq7fn8e5esohuql",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "email"
          ]
        }
      },
      {
        "system": false,
        "name": "student_name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 2,
          "max": 120,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "student_class",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 20,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "school_year",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 7,
          "max": 9,
          "pattern": "^[0-9]{4}/[0-9]{2}$"
        }
      },
      {
        "system": false,
        "name": "preferred_zone",
        "type": "relation",
        "required": false,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "dhzkdxx71dfmt62",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": [
            "name"
          ]
        }
      },
      {
        "system": false,
        "name": "preferred_locker",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 10,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pending",
            "reserved",
            "expired",
            "assigned",
            "cancelled"
          ]
        }
      },
      {
        "system": false,
        "name": "submitted_at",
        "type": "date",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "jm440cli71sfxzb",
    "name": "reservations",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "request",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "collectionId": "qjz4kuz8hypkff2",
          "cascadeDelete": true,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "id"
          ]
        }
      },
      {
        "system": false,
        "name": "locker",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "y4wbfxylw6a5xoy",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "number"
          ]
        }
      },
      {
        "system": false,
        "name": "expires_at",
        "type": "date",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.role = 'staff'",
    "viewRule": "@request.auth.role = 'staff'",
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "vemsb4s051evn7f",
    "name": "invoices",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "request",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "collectionId": "qjz4kuz8hypkff2",
          "cascadeDelete": true,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "id"
          ]
        }
      },
      {
        "system": false,
        "name": "number",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "min": 4,
          "max": 32,
          "pattern": "^INV-[0-9]{6}$"
        }
      },
      {
        "system": false,
        "name": "amount",
        "type": "number",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 0
        }
      },
      {
        "system": false,
        "name": "currency",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 3,
          "max": 3,
          "pattern": "^[A-Z]{3}$"
        }
      },
      {
        "system": false,
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "draft",
            "sent",
            "paid",
            "cancelled"
          ]
        }
      },
      {
        "system": false,
        "name": "due_at",
        "type": "date",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "name": "paid_at",
        "type": "date",
        "required": false,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "name": "pdf",
        "type": "file",
        "required": false,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "maxSize": 10485760,
          "mimeTypes": [
            "application/pdf"
          ],
          "thumbs": [],
          "protected": true
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "i0zawt7irmi5rgf",
    "name": "assignments",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "request",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "collectionId": "qjz4kuz8hypkff2",
          "cascadeDelete": true,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "id"
          ]
        }
      },
      {
        "system": false,
        "name": "locker",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "y4wbfxylw6a5xoy",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "number"
          ]
        }
      },
      {
        "system": false,
        "name": "assigned_at",
        "type": "date",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "1csagpg9ce4ojad",
    "name": "renewals",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "assignment",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "collectionId": "i0zawt7irmi5rgf",
          "cascadeDelete": true,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": [
            "id"
          ]
        }
      },
      {
        "system": false,
        "name": "school_year",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 7,
          "max": 9,
          "pattern": "^[0-9]{4}/[0-9]{2}$"
        }
      },
      {
        "system": false,
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pending",
            "confirmed",
            "expired",
            "cancelled"
          ]
        }
      },
      {
        "system": false,
        "name": "renewed_at",
        "type": "date",
        "required": false,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "wd8z33xdvc1uwe6",
    "name": "email_queue",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "recipient",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 3,
          "max": 255,
          "pattern": "^[^@\\n]+@[^@\\n]+\\.[^@\\n]+$"
        }
      },
      {
        "system": false,
        "name": "subject",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "template",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 2,
          "max": 80,
          "pattern": "^[a-z0-9_]+$"
        }
      },
      {
        "system": false,
        "name": "payload",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 4000
        }
      },
      {
        "system": false,
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pending",
            "sending",
            "sent",
            "failed"
          ]
        }
      },
      {
        "system": false,
        "name": "error",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "sent_at",
        "type": "date",
        "required": false,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.role = 'staff'",
    "viewRule": "@request.auth.role = 'staff'",
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  },
  {
    "id": "dpnhs2xr3by2ue8",
    "name": "audit_logs",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "name": "actor",
        "type": "relation",
        "required": false,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "fq7fn8e5esohuql",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": [
            "email"
          ]
        }
      },
      {
        "system": false,
        "name": "action",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 2,
          "max": 120,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "collection",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 64,
          "pattern": ""
        }
      },
      {
        "system": false,
        "name": "record_id",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 15,
          "max": 15,
          "pattern": "^[a-z0-9]{15}$"
        }
      },
      {
        "system": false,
        "name": "diff",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 8000
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.role = 'staff'",
    "viewRule": "@request.auth.role = 'staff'",
    "createRule": "@request.auth.role = 'staff'",
    "updateRule": "@request.auth.role = 'staff'",
    "deleteRule": "@request.auth.role = 'staff'",
    "options": {}
  }
]
`

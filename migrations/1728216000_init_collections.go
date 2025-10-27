package migrations

import (
	"database/sql"
	"errors"

	"github.com/pocketbase/pocketbase/core"
	pm "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	pm.Register(func(app core.App) error {
		creators := []func(core.App) error{
			extendUsersCollection,
			createZonesCollection,
			createLockersCollection,
			createRequestsCollection,
			createReservationsCollection,
			createInvoicesCollection,
			createAssignmentsCollection,
			createRenewalsCollection,
			createEmailQueueCollection,
			createAuditLogsCollection,
		}

		for _, create := range creators {
			if err := create(app); err != nil {
				return err
			}
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
			"y4wbfxylw6a5xoy",
			"dhzkdxx71dfmt62",
		}

		for _, id := range ids {
			col, err := app.FindCollectionByNameOrId(id)
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					continue
				}
				return err
			}
			if err := app.Delete(col); err != nil {
				return err
			}
		}

		if users, err := app.FindCollectionByNameOrId("users"); err == nil {
			for _, name := range []string{"full_name", "address", "phone", "language", "is_staff"} {
				users.Fields.RemoveByName(name)
			}
			if err := app.Save(users); err != nil {
				return err
			}
		} else if !errors.Is(err, sql.ErrNoRows) {
			return err
		}
		return nil
	})
}

func extendUsersCollection(app core.App) error {
	users, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		return err
	}

	ensureField := func(field core.Field) {
		if existing := users.Fields.GetByName(field.GetName()); existing != nil {
			users.Fields.RemoveByName(field.GetName())
		}
		users.Fields.Add(field)
	}

	ensureField(&core.TextField{
		Name:        "full_name",
		Presentable: true,
		Required:    false,
		Min:         2,
		Max:         120,
	})
	ensureField(&core.TextField{
		Name:     "address",
		Required: false,
		Min:      4,
		Max:      200,
	})
	ensureField(&core.TextField{
		Name:     "phone",
		Required: false,
		Max:      32,
		Pattern:  `^[0-9+()\\s-]{7,}$`,
	})
	ensureField(&core.SelectField{
		Name:        "language",
		Presentable: true,
		Required:    false,
		Values:      []string{"de", "en"},
		MaxSelect:   1,
	})
	ensureField(&core.BoolField{
		Name:        "is_staff",
		Presentable: true,
	})

	return app.Save(users)
}

func createZonesCollection(app core.App) error {
	collection := core.NewBaseCollection("zones", "dhzkdxx71dfmt62")

	collection.Fields.Add(&core.TextField{
		Name:        "name",
		Presentable: true,
		Required:    true,
		Min:         2,
		Max:         64,
	})
	collection.Fields.Add(&core.TextField{
		Name: "description",
		Max:  500,
	})
	collection.Fields.Add(&core.JSONField{
		Name:    "class_tags",
		MaxSize: 2000,
	})
	collection.Fields.Add(&core.FileField{
		Name:      "map_image",
		MaxSelect: 1,
		MaxSize:   5 * 1024 * 1024,
		MimeTypes: []string{"image/png", "image/jpeg", "application/pdf"},
		Thumbs:    []string{"200x200", "400x400"},
	})

	rule := "@request.auth.id != ''"
	staffRule := "@request.auth.is_staff = true"
	collection.ListRule = types.Pointer(rule)
	collection.ViewRule = types.Pointer(rule)
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createLockersCollection(app core.App) error {
	collection := core.NewBaseCollection("lockers", "y4wbfxylw6a5xoy")

	minLockerNumber := 1.0
	collection.Fields.Add(&core.NumberField{
		Name:        "number",
		Presentable: true,
		Required:    true,
		Min:         &minLockerNumber,
		OnlyInt:     true,
	})
	collection.Fields.Add(&core.RelationField{
		Name:          "zone",
		Presentable:   true,
		Required:      true,
		CollectionId:  "dhzkdxx71dfmt62",
		CascadeDelete: false,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.SelectField{
		Name:        "status",
		Presentable: true,
		Required:    true,
		Values:      []string{"free", "reserved", "occupied", "maintenance"},
		MaxSelect:   1,
	})
	collection.Fields.Add(&core.TextField{
		Name: "note",
		Max:  400,
	})

	rule := "@request.auth.id != ''"
	staffRule := "@request.auth.is_staff = true"
	collection.ListRule = types.Pointer(rule)
	collection.ViewRule = types.Pointer(rule)
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createRequestsCollection(app core.App) error {
	collection := core.NewBaseCollection("requests", "qjz4kuz8hypkff2")

	collection.Fields.Add(&core.RelationField{
		Name:          "user",
		Presentable:   true,
		Required:      true,
		CollectionId:  "_pb_users_auth_",
		CascadeDelete: false,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "requester_name",
		Presentable: true,
		Required:    true,
		Min:         2,
		Max:         120,
	})
	collection.Fields.Add(&core.TextField{
		Name:     "requester_address",
		Required: true,
		Min:      4,
		Max:      200,
	})
	collection.Fields.Add(&core.TextField{
		Name:     "requester_phone",
		Required: true,
		Pattern:  `^[0-9+()\\s-]{7,}$`,
		Max:      32,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "student_name",
		Presentable: true,
		Required:    true,
		Min:         2,
		Max:         120,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "student_class",
		Presentable: true,
		Required:    true,
		Min:         1,
		Max:         20,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "school_year",
		Presentable: true,
		Required:    true,
		Min:         7,
		Max:         9,
		Pattern:     `^[0-9]{4}/[0-9]{2}$`,
	})
	collection.Fields.Add(&core.RelationField{
		Name:          "preferred_zone",
		Presentable:   true,
		CollectionId:  "dhzkdxx71dfmt62",
		CascadeDelete: false,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.TextField{
		Name: "preferred_locker",
		Max:  10,
	})
	collection.Fields.Add(&core.SelectField{
		Name:        "status",
		Presentable: true,
		Required:    true,
		Values:      []string{"pending", "reserved", "expired", "assigned", "cancelled"},
		MaxSelect:   1,
	})
	collection.Fields.Add(&core.DateField{
		Name:        "submitted_at",
		Presentable: true,
		Required:    true,
	})

	staffRule := "@request.auth.is_staff = true"
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createReservationsCollection(app core.App) error {
	collection := core.NewBaseCollection("reservations", "jm440cli71sfxzb")

	collection.Fields.Add(&core.RelationField{
		Name:          "request",
		Presentable:   true,
		Required:      true,
		CollectionId:  "qjz4kuz8hypkff2",
		CascadeDelete: true,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.RelationField{
		Name:          "locker",
		Presentable:   true,
		Required:      true,
		CollectionId:  "y4wbfxylw6a5xoy",
		CascadeDelete: false,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.DateField{
		Name:        "expires_at",
		Presentable: true,
		Required:    true,
	})

	staffRule := "@request.auth.is_staff = true"
	collection.ListRule = types.Pointer(staffRule)
	collection.ViewRule = types.Pointer(staffRule)
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createInvoicesCollection(app core.App) error {
	collection := core.NewBaseCollection("invoices", "vemsb4s051evn7f")

	collection.Fields.Add(&core.RelationField{
		Name:          "request",
		Presentable:   true,
		Required:      true,
		CollectionId:  "qjz4kuz8hypkff2",
		CascadeDelete: true,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "number",
		Presentable: true,
		Required:    true,
		Min:         4,
		Max:         32,
		Pattern:     `^INV-[0-9]{6}$`,
	})
	minAmount := 0.0
	collection.Fields.Add(&core.NumberField{
		Name:        "amount",
		Presentable: true,
		Required:    true,
		Min:         &minAmount,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "currency",
		Presentable: true,
		Required:    true,
		Min:         3,
		Max:         3,
		Pattern:     `^[A-Z]{3}$`,
	})
	collection.Fields.Add(&core.SelectField{
		Name:        "status",
		Presentable: true,
		Required:    true,
		Values:      []string{"draft", "sent", "paid", "cancelled"},
		MaxSelect:   1,
	})
	collection.Fields.Add(&core.DateField{
		Name:        "due_at",
		Presentable: true,
		Required:    true,
	})
	collection.Fields.Add(&core.DateField{
		Name:        "paid_at",
		Presentable: true,
	})
	collection.Fields.Add(&core.FileField{
		Name:        "pdf",
		Presentable: true,
		MaxSelect:   1,
		MaxSize:     10 * 1024 * 1024,
		MimeTypes:   []string{"application/pdf"},
		Protected:   true,
	})

	staffRule := "@request.auth.is_staff = true"
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createAssignmentsCollection(app core.App) error {
	collection := core.NewBaseCollection("assignments", "i0zawt7irmi5rgf")

	collection.Fields.Add(&core.RelationField{
		Name:          "request",
		Presentable:   true,
		Required:      true,
		CollectionId:  "qjz4kuz8hypkff2",
		CascadeDelete: true,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.RelationField{
		Name:          "locker",
		Presentable:   true,
		Required:      true,
		CollectionId:  "y4wbfxylw6a5xoy",
		CascadeDelete: false,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.DateField{
		Name:        "assigned_at",
		Presentable: true,
		Required:    true,
	})

	staffRule := "@request.auth.is_staff = true"
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createRenewalsCollection(app core.App) error {
	collection := core.NewBaseCollection("renewals", "1csagpg9ce4ojad")

	collection.Fields.Add(&core.RelationField{
		Name:          "assignment",
		Presentable:   true,
		Required:      true,
		CollectionId:  "i0zawt7irmi5rgf",
		CascadeDelete: true,
		MinSelect:     1,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "school_year",
		Presentable: true,
		Required:    true,
		Min:         7,
		Max:         9,
		Pattern:     `^[0-9]{4}/[0-9]{2}$`,
	})
	collection.Fields.Add(&core.SelectField{
		Name:        "status",
		Presentable: true,
		Required:    true,
		Values:      []string{"pending", "confirmed", "expired", "cancelled"},
		MaxSelect:   1,
	})
	collection.Fields.Add(&core.DateField{
		Name:        "renewed_at",
		Presentable: true,
	})

	staffRule := "@request.auth.is_staff = true"
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createEmailQueueCollection(app core.App) error {
	collection := core.NewBaseCollection("email_queue", "wd8z33xdvc1uwe6")

	collection.Fields.Add(&core.TextField{
		Name:        "recipient",
		Presentable: true,
		Required:    true,
		Min:         3,
		Max:         255,
		Pattern:     `^[^@\\n]+@[^@\\n]+\\.[^@\\n]+$`,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "subject",
		Presentable: true,
		Required:    true,
		Min:         1,
		Max:         200,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "template",
		Presentable: true,
		Required:    true,
		Min:         2,
		Max:         80,
		Pattern:     `^[a-z0-9_]+$`,
	})
	collection.Fields.Add(&core.JSONField{
		Name:    "payload",
		MaxSize: 4000,
	})
	collection.Fields.Add(&core.SelectField{
		Name:        "status",
		Presentable: true,
		Required:    true,
		Values:      []string{"pending", "sending", "sent", "failed"},
		MaxSelect:   1,
	})
	collection.Fields.Add(&core.TextField{
		Name: "error",
		Max:  500,
	})
	collection.Fields.Add(&core.DateField{
		Name:        "sent_at",
		Presentable: true,
	})

	staffRule := "@request.auth.is_staff = true"
	collection.ListRule = types.Pointer(staffRule)
	collection.ViewRule = types.Pointer(staffRule)
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func createAuditLogsCollection(app core.App) error {
	collection := core.NewBaseCollection("audit_logs", "dpnhs2xr3by2ue8")

	collection.Fields.Add(&core.RelationField{
		Name:          "actor",
		Presentable:   true,
		CollectionId:  "_pb_users_auth_",
		CascadeDelete: false,
		MaxSelect:     1,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "action",
		Presentable: true,
		Required:    true,
		Min:         2,
		Max:         120,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "collection",
		Presentable: true,
		Required:    true,
		Min:         1,
		Max:         64,
	})
	collection.Fields.Add(&core.TextField{
		Name:        "record_id",
		Presentable: true,
		Required:    true,
		Min:         15,
		Max:         15,
		Pattern:     `^[a-z0-9]{15}$`,
	})
	collection.Fields.Add(&core.JSONField{
		Name:    "diff",
		MaxSize: 8000,
	})

	staffRule := "@request.auth.is_staff = true"
	collection.ListRule = types.Pointer(staffRule)
	collection.ViewRule = types.Pointer(staffRule)
	collection.CreateRule = types.Pointer(staffRule)
	collection.UpdateRule = types.Pointer(staffRule)
	collection.DeleteRule = types.Pointer(staffRule)

	return saveCollection(app, collection)
}

func saveCollection(app core.App, collection *core.Collection) error {
	if existing, err := app.FindCollectionByNameOrId(collection.Id); err == nil {
		existing.Name = collection.Name
		existing.Type = collection.Type
		existing.System = collection.System
		existing.ListRule = collection.ListRule
		existing.ViewRule = collection.ViewRule
		existing.CreateRule = collection.CreateRule
		existing.UpdateRule = collection.UpdateRule
		existing.DeleteRule = collection.DeleteRule
		existing.Fields = collection.Fields
		existing.Indexes = collection.Indexes

		if existing.IsAuth() && collection.IsAuth() {
			existing.AuthRule = collection.AuthRule
			existing.ManageRule = collection.ManageRule
			existing.AuthAlert = collection.AuthAlert
			existing.OAuth2 = collection.OAuth2
			existing.PasswordAuth = collection.PasswordAuth
			existing.MFA = collection.MFA
			existing.OTP = collection.OTP
			existing.AuthToken = collection.AuthToken
			existing.PasswordResetToken = collection.PasswordResetToken
			existing.EmailChangeToken = collection.EmailChangeToken
			existing.VerificationToken = collection.VerificationToken
			existing.FileToken = collection.FileToken
			existing.VerificationTemplate = collection.VerificationTemplate
			existing.ResetPasswordTemplate = collection.ResetPasswordTemplate
			existing.ConfirmEmailChangeTemplate = collection.ConfirmEmailChangeTemplate
		}

		existing.MarkAsNotNew()
		return app.Save(existing)
	} else if !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	return app.Save(collection)
}

func setAccessRules(app core.App) error {
	if err := app.ReloadCachedCollections(); err != nil {
		return err
	}

	users, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		return err
	}
	usersListRule := "@request.auth.is_staff = true"
	usersViewRule := "@request.auth.is_staff = true || id = @request.auth.id"
	users.ListRule = types.Pointer(usersListRule)
	users.ViewRule = types.Pointer(usersViewRule)
	if err := app.Save(users); err != nil {
		return err
	}

	records := []*core.Record{}
	if err := app.RecordQuery(users).All(&records); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	for _, record := range records {
		if record.EmailVisibility() {
			continue
		}
		record.SetEmailVisibility(true)
		if err := app.Save(record); err != nil {
			return err
		}
	}

	requests, err := app.FindCollectionByNameOrId("requests")
	if err != nil {
		return err
	}
	ownerRule := "@request.auth.is_staff = true || user = @request.auth.id"
	requests.ListRule = types.Pointer(ownerRule)
	requests.ViewRule = types.Pointer(ownerRule)
	requests.CreateRule = types.Pointer(ownerRule)
	if err := app.Save(requests); err != nil {
		return err
	}

	invoices, err := app.FindCollectionByNameOrId("invoices")
	if err != nil {
		return err
	}
	invoicesRule := "@request.auth.is_staff = true || (@collection.requests:auth.id ?= request && @collection.requests:auth.user ?= @request.auth.id)"
	invoices.ListRule = types.Pointer(invoicesRule)
	invoices.ViewRule = types.Pointer(invoicesRule)
	if err := app.Save(invoices); err != nil {
		return err
	}

	assignments, err := app.FindCollectionByNameOrId("assignments")
	if err != nil {
		return err
	}
	assignmentsRule := "@request.auth.is_staff = true || (@collection.requests:auth.id ?= request && @collection.requests:auth.user ?= @request.auth.id)"
	assignments.ListRule = types.Pointer(assignmentsRule)
	assignments.ViewRule = types.Pointer(assignmentsRule)
	if err := app.Save(assignments); err != nil {
		return err
	}

	renewals, err := app.FindCollectionByNameOrId("renewals")
	if err != nil {
		return err
	}
	renewalsRule := "@request.auth.is_staff = true || (@collection.assignments:auth.id ?= assignment && @collection.assignments:auth.request ?= @collection.requests:auth.id && @collection.requests:auth.user ?= @request.auth.id)"
	renewals.ListRule = types.Pointer(renewalsRule)
	renewals.ViewRule = types.Pointer(renewalsRule)
	if err := app.Save(renewals); err != nil {
		return err
	}

	return nil
}

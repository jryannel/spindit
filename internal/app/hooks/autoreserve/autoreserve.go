package autoreserve

import (
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

const (
	requestsCollection    = "requests"
	lockersCollection     = "lockers"
	assignmentsCollection = "assignments"
)

// Register connects the automatic locker reservation workflow when a new request is submitted.
func Register(app core.App) {
	app.OnRecordAfterCreateSuccess(requestsCollection).BindFunc(func(e *core.RecordEvent) error {
		record := e.Record
		if record == nil {
			return nil
		}

		return app.RunInTransaction(func(txApp core.App) error {
			// Skip if an assignment already exists for this request.
			if _, err := txApp.FindFirstRecordByFilter(assignmentsCollection, fmt.Sprintf(`request = "%s"`, record.Id)); err == nil {
				return nil
			} else if !errors.Is(err, sql.ErrNoRows) {
				return err
			}

			preferredLockerValue := record.GetString("preferred_locker")
			var locker *core.Record

			if preferredLockerValue != "" {
				if candidate, err := txApp.FindRecordById(lockersCollection, preferredLockerValue); err == nil {
					if strings.EqualFold(candidate.GetString("status"), "free") {
						locker = candidate
					}
				}

				if locker == nil {
					if lockerNumber, err := strconv.Atoi(preferredLockerValue); err == nil {
						candidate, findErr := txApp.FindFirstRecordByFilter(lockersCollection, fmt.Sprintf(`number = %d`, lockerNumber))
						if findErr == nil && strings.EqualFold(candidate.GetString("status"), "free") {
							locker = candidate
						}
					}
				}
			}

			if locker == nil {
				filter := `status = "free"`
				if zone := record.GetString("preferred_zone"); zone != "" {
					filter = fmt.Sprintf(`status = "free" && zone = "%s"`, zone)
				}

				lockers, err := txApp.FindRecordsByFilter(lockersCollection, filter, "number", 1, 0)
				if err != nil {
					return err
				}
				if len(lockers) == 0 {
					app.Logger().Warn("no available locker to auto-reserve", "request", record.Id, "filter", filter)
					return nil
				}
				locker = lockers[0]
			}

			locker.Set("status", "reserved")
			if err := txApp.Save(locker); err != nil {
				return err
			}

			assignmentsColl, err := txApp.FindCollectionByNameOrId(assignmentsCollection)
			if err != nil {
				return err
			}

			assignment := core.NewRecord(assignmentsColl)
			assignment.Set("request", record.Id)
			assignment.Set("locker", locker.Id)
			assignment.Set("assigned_at", types.NowDateTime())

			if err := txApp.Save(assignment); err != nil {
				return err
			}

			if record.GetString("status") != "reserved" {
				record.Set("status", "reserved")
				if err := txApp.Save(record); err != nil {
					return err
				}
			}

			return nil
		})
	})

	app.OnRecordAfterUpdateSuccess(requestsCollection).BindFunc(func(e *core.RecordEvent) error {
		record := e.Record
		if record == nil {
			return nil
		}

		if record.GetString("status") != "cancelled" {
			return nil
		}

		if original := record.Original(); original != nil && strings.EqualFold(original.GetString("status"), "cancelled") {
			return nil
		}

		return app.RunInTransaction(func(txApp core.App) error {
			assignment, err := txApp.FindFirstRecordByFilter(assignmentsCollection, fmt.Sprintf(`request = "%s"`, record.Id))
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					return nil
				}
				return err
			}

			lockerId := assignment.GetString("locker")
			if lockerId != "" {
				locker, err := txApp.FindRecordById(lockersCollection, lockerId)
				if err != nil && !errors.Is(err, sql.ErrNoRows) {
					return err
				}
				if err == nil {
					locker.Set("status", "free")
					if err := txApp.Save(locker); err != nil {
						return err
					}
				}
			}

			return txApp.Delete(assignment)
		})
	})
}

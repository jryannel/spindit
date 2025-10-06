package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	pm "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	pm.Register(func(app core.App) error {
		zonesCol, err := app.FindCollectionByNameOrId("zones")
		if err != nil {
			return err
		}
		lockersCol, err := app.FindCollectionByNameOrId("lockers")
		if err != nil {
			return err
		}

		zoneData := []struct {
			Name        string
			Description string
			Tags        []string
		}{
			{"Zone A", "Ground floor left wing", []string{"5th", "6th"}},
			{"Zone B", "Ground floor right wing", []string{"7th", "8th"}},
			{"Zone C", "First floor left wing", []string{"9th", "10th"}},
			{"Zone D", "First floor right wing", []string{"11th", "12th"}},
		}

		zoneRecords := make([]*core.Record, len(zoneData))
		for i, z := range zoneData {
			record := core.NewRecord(zonesCol)
			record.Set("name", z.Name)
			record.Set("description", z.Description)
			record.Set("class_tags", z.Tags)
			if err := app.Save(record); err != nil {
				return err
			}
			zoneRecords[i] = record
		}

		totalLockers := 1000
		perZone := totalLockers / len(zoneRecords)
		for i := 0; i < totalLockers; i++ {
			record := core.NewRecord(lockersCol)
			record.Set("number", i+1)
			zoneIndex := i / perZone
			if zoneIndex >= len(zoneRecords) {
				zoneIndex = len(zoneRecords) - 1
			}
			record.Set("zone", zoneRecords[zoneIndex].Id)
			record.Set("status", "free")
			record.Set("note", "")
			if err := app.Save(record); err != nil {
				return err
			}
		}

		app.Logger().Info("seeded zones and lockers", "zones", len(zoneRecords), "lockers", totalLockers)
		return nil
	}, func(app core.App) error {
		lockersCol, err := app.FindCollectionByNameOrId("lockers")
		if err == nil {
			if err := app.TruncateCollection(lockersCol); err != nil {
				return err
			}
		}
		zonesCol, err := app.FindCollectionByNameOrId("zones")
		if err == nil {
			if err := app.TruncateCollection(zonesCol); err != nil {
				return err
			}
		}
		return nil
	}, "1728219600_seed_zones_lockers.go")
}

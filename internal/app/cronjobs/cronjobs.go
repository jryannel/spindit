package cronjobs

import (
	"time"

	"github.com/pocketbase/pocketbase/core"
)

const (
	jobReservationExpire = "reservations.expire"
	jobInvoiceReminders  = "invoices.reminders"
	jobRenewalsOpen      = "renewals.open"
	jobAssignmentsClose  = "assignments.close"
)

// Register configures the baseline cron jobs defined in the PRD. Each job currently logs
// its execution as a placeholder; business logic will be implemented in later milestones.
func Register(app core.App) {
	if loc, err := time.LoadLocation("Europe/Berlin"); err == nil {
		app.Cron().SetTimezone(loc)
	}

	jobs := []struct {
		id   string
		expr string
	}{
		{jobReservationExpire, "*/1 * * * *"},
		{jobInvoiceReminders, "0 8 * * *"},
		{jobRenewalsOpen, "0 9 * * *"},
		{jobAssignmentsClose, "0 9 1 8 *"},
	}

	for _, job := range jobs {
		job := job
		app.Cron().MustAdd(job.id, job.expr, func() {
			app.Logger().Info("cron stub executed", "job", job.id)
		})
	}
}
